import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { House } from '@/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const hasSupabaseConfig =
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 0 &&
  supabaseAnonKey !== 'your-anon-key';

export type VerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected';
export type UserType = 'fresher' | 'student_25b' | 'student_other';
export type Gender = 'man' | 'woman' | 'undisclosed';

export interface ConnexaUser {
  id: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  gender: Gender | null;
  iit: string | null;
  branch: string | null;
  year: number | null;
  user_type: UserType | null;
  verification_status: VerificationStatus;
  jee_roll_number: string | null;
  house: House | null;
  founding_100: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
}

export interface AuthResult {
  error: string | null;
  session?: Session | null;
  user?: ConnexaUser | null;
}

export interface HouseScore {
  id: string;
  house: House;
  week_start: string;
  score: number;
}

export interface IntroductionWithProfile {
  id: string;
  from_user: string;
  status: 'pending' | 'accepted' | 'passed';
  created_at: string;
  responded_at: string | null;
  display_name: string | null;
  photo_url: string | null;
  iit: string | null;
  branch: string | null;
  house: House | null;
}

export interface DocumentAsset {
  uri: string;
  name: string;
  mimeType: string;
  size?: number | null;
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const isSupabaseConfigured = hasSupabaseConfig;

function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function messageFromError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function safeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'upload';
}

function extensionFromName(name: string): string {
  return name.includes('.') ? name.split('.').pop()?.toLowerCase() ?? '' : '';
}

function contentTypeFor(asset: DocumentAsset): string {
  if (asset.mimeType) return asset.mimeType;
  const ext = extensionFromName(asset.name);
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
}

export async function getCurrentSession(): Promise<Session | null> {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUserProfile(): Promise<ConnexaUser | null> {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (error) throw error;
  return data as ConnexaUser | null;
}

export async function sendOtp(
  email: string,
  options?: { userType?: UserType; iit?: string },
): Promise<AuthResult> {
  try {
    const client = requireSupabase();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return { error: 'Email is required.' };

    const { error } = await client.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        data: {
          user_type: options?.userType,
          iit: options?.iit,
        },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function verifyOtp(
  email: string,
  code: string,
  options?: { userType?: UserType; iit?: string },
): Promise<AuthResult> {
  try {
    const client = requireSupabase();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return { error: 'Email is required.' };
    if (!/^\d{6}$/.test(code)) return { error: 'Enter the six-digit code.' };

    const { data, error } = await client.auth.verifyOtp({
      email: normalizedEmail,
      token: code,
      type: 'email',
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Verification succeeded but no user session was returned.' };

    const { data: profile, error: profileError } = await client
      .rpc('complete_email_verification', {
        requested_user_type: options?.userType ?? 'fresher',
        requested_iit: options?.iit ?? 'iitb',
      })
      .single();
    if (profileError) return { error: profileError.message };

    return { error: null, session: data.session, user: profile as ConnexaUser };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

async function ensureAnonymousUser(): Promise<string> {
  const client = requireSupabase();
  const { data: userData } = await client.auth.getUser();
  if (userData.user) return userData.user.id;

  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error('Could not create an anonymous review session.');
  return data.user.id;
}

export async function submitDocForm(data: {
  contactEmail: string;
  roll: string;
  name: string;
  iit: string;
  asset: DocumentAsset;
}): Promise<AuthResult> {
  try {
    const client = requireSupabase();
    const contactEmail = data.contactEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return { error: 'Enter a valid contact email.' };
    if (!/^\d{7,8}$/.test(data.roll.trim())) return { error: 'Enter a valid JEE Advanced roll number.' };
    if (!data.name.trim()) return { error: 'Enter your full name.' };
    if (!data.iit) return { error: 'Choose the IIT you are joining.' };

    const userId = await ensureAnonymousUser();
    const ext = extensionFromName(data.asset.name);
    const path = `${userId}/${Date.now()}-${safeFileName(data.asset.name)}`;
    const base64 = await FileSystem.readAsStringAsync(data.asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error: uploadError } = await client.storage
      .from('verification-documents')
      .upload(path, decode(base64), {
        contentType: contentTypeFor(data.asset),
        upsert: false,
      });
    if (uploadError) return { error: uploadError.message };

    const { data: profile, error: submissionError } = await client
      .rpc('create_verification_submission', {
        contact_email: contactEmail,
        roll_number: data.roll.trim(),
        full_name: data.name.trim(),
        iit: data.iit,
        document_path: path,
        document_mime_type: contentTypeFor(data.asset),
        document_size: data.asset.size ?? null,
        document_extension: ext || null,
      })
      .single();
    if (submissionError) return { error: submissionError.message };

    return { error: null, user: profile as ConnexaUser };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function updateProfile(patch: Partial<Pick<ConnexaUser, 'display_name' | 'photo_url' | 'gender' | 'branch' | 'year'>>): Promise<AuthResult> {
  try {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return { error: 'You need to be signed in.' };

    const { data, error } = await client
      .from('users')
      .update(patch)
      .eq('id', authData.user.id)
      .select('*')
      .single();
    if (error) return { error: error.message };
    return { error: null, user: data as ConnexaUser };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function uploadProfilePhoto(asset: DocumentAsset): Promise<AuthResult> {
  try {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return { error: 'You need to be signed in.' };

    const path = `${authData.user.id}/${Date.now()}-${safeFileName(asset.name)}`;
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const { error: uploadError } = await client.storage
      .from('profile-photos')
      .upload(path, decode(base64), {
        contentType: contentTypeFor(asset),
        upsert: true,
      });
    if (uploadError) return { error: uploadError.message };

    const { data } = client.storage.from('profile-photos').getPublicUrl(path);
    return updateProfile({ photo_url: data.publicUrl });
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function completeSorting(house: House): Promise<AuthResult> {
  try {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return { error: 'You need to be signed in.' };

    const { data, error } = await client
      .from('users')
      .update({ house })
      .eq('id', authData.user.id)
      .select('*')
      .single();
    if (error) return { error: error.message };
    return { error: null, user: data as ConnexaUser };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function getHouseMembers(house: House): Promise<ConnexaUser[]> {
  try {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return [];

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('house', house)
      .eq('verification_status', 'verified')
      .neq('id', authData.user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as ConnexaUser[];
  } catch {
    return [];
  }
}

export async function getHouseScores(): Promise<HouseScore[]> {
  try {
    const client = requireSupabase();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const weekStart = monday.toISOString().slice(0, 10);

    const { data, error } = await client
      .from('house_scores')
      .select('*')
      .eq('week_start', weekStart)
      .order('score', { ascending: false });
    if (error) throw error;
    return (data ?? []) as HouseScore[];
  } catch {
    return [];
  }
}

export async function getMyIntroductions(): Promise<IntroductionWithProfile[]> {
  try {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return [];

    const { data, error } = await client
      .from('introductions')
      .select(`
        id,
        from_user,
        status,
        created_at,
        responded_at,
        users!introductions_from_user_fkey (
          display_name,
          photo_url,
          iit,
          branch,
          house
        )
      `)
      .eq('to_user', authData.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;

    return ((data ?? []) as any[]).map((row) => ({
      id: row.id,
      from_user: row.from_user,
      status: row.status,
      created_at: row.created_at,
      responded_at: row.responded_at,
      display_name: row.users?.display_name ?? null,
      photo_url: row.users?.photo_url ?? null,
      iit: row.users?.iit ?? null,
      branch: row.users?.branch ?? null,
      house: row.users?.house ?? null,
    }));
  } catch {
    return [];
  }
}

export async function respondToIntroduction(
  id: string,
  response: 'accepted' | 'passed',
): Promise<{ error: string | null }> {
  try {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return { error: 'You need to be signed in.' };

    const { error } = await client
      .from('introductions')
      .update({ status: response, responded_at: new Date().toISOString() })
      .eq('id', id)
      .eq('to_user', authData.user.id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}
