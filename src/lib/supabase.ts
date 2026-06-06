import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { 
  House, 
  DateProfile, 
  ProfilePhoto, 
  PromptAnswer, 
  QuestionnaireAnswer, 
  Interest, 
  Match, 
  DMThread, 
  Message,
  ConnexaUser,
  UserType,
  UserStatus
} from '@/types';

export type { ConnexaUser } from '@/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const hasSupabaseConfig =
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 0 &&
  supabaseAnonKey !== 'your-anon-key';

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
  state: string;
  created_at: string;
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

// Admin Interfaces
export interface VerificationSubmission {
  id: string;
  user_id: string;
  method: 'email_otp' | 'roll_doc';
  iit: string;
  roll_number: string | null;
  doc_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: ConnexaUser;
}

export interface HousePrompt {
  id: string;
  house: House;
  prompt_text: string;
  scheduled_for: string;
  created_by: string | null;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  category: string;
  body: string;
  reference_id?: string;
  read: boolean;
  created_at: string;
}

export interface SeasonConfig {
  id: number;
  season_start: string;
  season_end: string;
  crowning_done: boolean;
  crowned_user_id: string | null;
  crowned_at: string | null;
}

const supabaseAuthOptions = {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
};

export const supabase: SupabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, supabaseAuthOptions)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', supabaseAuthOptions);

export const isSupabaseConfigured = hasSupabaseConfig;

export function requireSupabase(): SupabaseClient {
  if (!hasSupabaseConfig) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function messageFromError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message ?? '';
    // Browser fetch failures surface as "Failed to fetch" / "Load failed" / "Network request failed".
    if (/failed to fetch|load failed|network request failed|networkerror/i.test(msg)) {
      return 'Network issue reaching the server. Check your connection and try again.';
    }
    if (/over_email_send_rate_limit|rate limit|too many/i.test(msg)) {
      return 'Too many code requests. Wait a minute before trying again.';
    }
    return msg;
  }
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

// expo-file-system readAsStringAsync is native-only. On web the picker hands back
// a blob:/data: URI that fetch can read directly into an ArrayBuffer.
async function readAssetBytes(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    return res.arrayBuffer();
  }
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return decode(base64);
}

export async function getCurrentSession(): Promise<Session | null> {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUserProfileById(userId: string): Promise<ConnexaUser | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
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
    if (error) return { error: messageFromError(error) };
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

    let { data, error } = await client.auth.verifyOtp({
      email: normalizedEmail,
      token: code,
      type: 'email',
    });
    if (error && /expired|invalid/i.test(error.message)) {
      const fallback = await client.auth.verifyOtp({
        email: normalizedEmail,
        token: code,
        type: 'signup',
      });
      data = fallback.data;
      error = fallback.error;
    }
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
    const bytes = await readAssetBytes(data.asset.uri);

    const { error: uploadError } = await client.storage
      .from('verification-documents')
      .upload(path, bytes, {
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

export async function updateProfile(patch: Partial<Pick<ConnexaUser, 'display_name' | 'photo_url' | 'gender' | 'branch' | 'year' | 'hometown'>>): Promise<AuthResult> {
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
    const bytes = await readAssetBytes(asset.uri);
    const { error: uploadError } = await client.storage
      .from('profile-photos')
      .upload(path, bytes, {
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
      .in('status', ['active', 'onboarding'])
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
    const { data, error } = await client.rpc('get_received_interests');
    if (error) throw error;
    return (data ?? []) as IntroductionWithProfile[];
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
    const { error } = await client.rpc('resolve_received_interest', {
      p_interest_id: id,
      p_action: response === 'accepted' ? 'accept' : 'pass'
    });
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function completeSorting(house: string, responses: any, breakdown: any) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .rpc('complete_sorting', { 
        p_house: house, 
        p_responses: responses, 
        p_score_breakdown: breakdown 
      });
    if (error) return { error: error.message };
    return { data, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function getPublicProfile(userId: string): Promise<ConnexaUser | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .in('status', ['active', 'onboarding'])
      .maybeSingle();
    if (error) throw error;
    return data as ConnexaUser | null;
  } catch {
    return null;
  }
}

// Date-specific functions
export async function getDateProfile(userId: string): Promise<DateProfile | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('date_profiles')
      .select('*, photos:date_photos(*), prompts:date_prompt_answers(*)')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as DateProfile | null;
  } catch {
    return null;
  }
}

export async function createDateProfile(profile: Partial<DateProfile>) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('date_profiles')
      .insert(profile)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as DateProfile, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function updateDateProfile(userId: string, patch: Partial<DateProfile>) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('date_profiles')
      .upsert({ user_id: userId, ...patch })
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as DateProfile, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function getQuestionnaireAnswers(userId: string): Promise<QuestionnaireAnswer[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('date_questionnaire_answers')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []) as QuestionnaireAnswer[];
  } catch {
    return [];
  }
}

export async function saveSingleQuestionnaireAnswer(userId: string, answer: any) {
  try {
    const client = requireSupabase();
    const { error } = await client
      .from('date_questionnaire_answers')
      .upsert({ user_id: userId, ...answer });
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function saveQuestionnaireAnswers(userId: string, answers: any[]) {
  try {
    const client = requireSupabase();
    await client.from('date_questionnaire_answers').delete().eq('user_id', userId);
    const { error } = await client.from('date_questionnaire_answers').insert(
      answers.map(a => ({ ...a, user_id: userId }))
    );
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function savePromptAnswers(userId: string, answers: any[]) {
  try {
    const client = requireSupabase();
    await client.from('date_prompt_answers').delete().eq('user_id', userId);
    const { error } = await client.from('date_prompt_answers').insert(
      answers.map(a => ({ ...a, user_id: userId }))
    );
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function uploadDatePhoto(userId: string, asset: DocumentAsset, position: number) {
  try {
    const client = requireSupabase();
    // Storage RLS requires the first path segment to equal auth.uid(); keep uid first.
    const path = `${userId}/date/${Date.now()}-${safeFileName(asset.name)}`;
    const bytes = await readAssetBytes(asset.uri);
    const { error: uploadError } = await client.storage
      .from('profile-photos')
      .upload(path, bytes, {
        contentType: contentTypeFor(asset),
        upsert: true,
      });
    if (uploadError) return { error: uploadError.message };

    const { data: urlData } = client.storage.from('profile-photos').getPublicUrl(path);
    
    const { data, error } = await client
      .from('date_photos')
      .insert({ user_id: userId, url: urlData.publicUrl, position })
      .select()
      .single();
    
    if (error) return { error: error.message };
    return { data: data as ProfilePhoto, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function getDateFeed(): Promise<DateProfile[]> {
  try {
    const client = requireSupabase();
    const { data: authData } = await client.auth.getUser();
    if (!authData.user) return [];

    const { data, error } = await client.rpc('get_date_browse_feed', {
      p_user_id: authData.user.id,
    });
    if (error) throw error;
    return ((Array.isArray(data) ? data : []) as DateProfile[]);
  } catch {
    return [];
  }
}

export async function getMyMatches(userId: string): Promise<Match[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('matches')
      .select('*')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .eq('state', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Match[];
  } catch {
    return [];
  }
}

export async function getMyInterests(userId: string): Promise<Interest[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('interests')
      .select('*')
      .eq('from_user', userId)
      .eq('state', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Interest[];
  } catch {
    return [];
  }
}

export async function expressInterest(fromUserId: string, toUserId: string) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .rpc('express_interest', { p_target_user_id: toUserId });
    if (error) return { error: error.message };
    return { data: data as Interest, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function withdrawInterest(interestId: string) {
  try {
    const client = requireSupabase();
    const { error } = await client
      .rpc('withdraw_interest', { p_interest_id: interestId });
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function getDMThread(matchId: string): Promise<DMThread | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('dm_threads')
      .select('*')
      .eq('match_id', matchId)
      .maybeSingle();
    if (error) throw error;
    return data as DMThread | null;
  } catch {
    return null;
  }
}

export async function getMessages(threadId: string): Promise<Message[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('dm_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Message[];
  } catch {
    return [];
  }
}

export async function sendMessage(threadId: string, senderId: string, body: string) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('dm_messages')
      .insert({ thread_id: threadId, sender: senderId, body: body.trim() })
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as Message, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function markThreadRead(threadId: string, userId: string) {
  try {
    const client = requireSupabase();
    await client
      .from('thread_read_state')
      .upsert({ thread_id: threadId, user_id: userId, last_read_at: new Date().toISOString() });
  } catch {
    // Ignore unread state errors
  }
}

export function getVerificationDocUrl(path: string): string {
  const client = requireSupabase();
  const { data } = client.storage.from('verification-documents').getPublicUrl(path);
  return data.publicUrl;
}

export async function searchUsers(query: string): Promise<ConnexaUser[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('users')
      .select('*')
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('user_type', 'fresher') // As per spec "searches verified users with user_type = student_25b", wait my enum is 'fresher' or 'non_fresher'
      .limit(10);
    if (error) throw error;
    return (data ?? []) as ConnexaUser[];
  } catch {
    return [];
  }
}

// Admin Functions

export async function getPendingVerifications(): Promise<VerificationSubmission[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('verification_submissions')
      .select('*, user:users(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as VerificationSubmission[];
  } catch {
    return [];
  }
}

export async function approveVerification(submissionId: string) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .rpc('approve_verification', { p_submission_id: submissionId });
    if (error) return { error: error.message };
    return { data, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function rejectVerification(submissionId: string, reason?: string) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('verification_submissions')
      .update({ 
        status: 'rejected', 
        admin_note: reason, 
        reviewed_at: new Date().toISOString() 
      })
      .eq('id', submissionId)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function getHouseLeaders(): Promise<ConnexaUser[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('is_house_leader', true)
      .order('house', { ascending: true });
    if (error) throw error;
    return (data ?? []) as ConnexaUser[];
  } catch {
    return [];
  }
}

export async function assignHouseLeader(userId: string) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('users')
      .update({ is_house_leader: true })
      .eq('id', userId)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function removeHouseLeader(userId: string) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('users')
      .update({ is_house_leader: false })
      .eq('id', userId)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function getScheduledPrompts(): Promise<HousePrompt[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('house_prompts')
      .select('*')
      .order('scheduled_for', { ascending: false });
    if (error) throw error;
    return (data ?? []) as HousePrompt[];
  } catch {
    return [];
  }
}

export async function getActivityFlags(): Promise<AdminNotification[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('admin_notifications')
      .select('*')
      .eq('category', 'activity_flag')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminNotification[];
  } catch {
    return [];
  }
}
export async function getModerationReports(category: 'chat' | 'intro' | 'date'): Promise<AdminNotification[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('admin_notifications')
      .select('*')
      .eq('category', `report_${category}`)
      .eq('read', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as AdminNotification[];
  } catch {
    return [];
  }
}

export async function dismissModerationReport(reportId: string) {
  try {
    const client = requireSupabase();
    const { error } = await client
      .from('admin_notifications')
      .update({ read: true })
      .eq('id', reportId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export async function deleteModeratedContent(reportId: string, category: string, referenceId: string) {
  try {
    const client = requireSupabase();

    let table = '';
    if (category.includes('chat')) table = 'house_messages';
    else if (category.includes('intro')) table = 'intro_comments';
    else if (category.includes('date')) table = 'date_reports'; // or date_profiles/photos

    if (table) {
      const { error } = await client.from(table).delete().eq('id', referenceId);
      if (error) return { error: error.message };
    }

    // Mark report as read/handled
    await dismissModerationReport(reportId);
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}

export interface SeasonConfig {
  id: number;
  season_start: string;
  season_end: string;
  reveal_triggered: boolean;
  crowning_done: boolean;
  updated_at: string;
}

export async function getSeasonConfig(): Promise<SeasonConfig | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('season_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    return data as SeasonConfig | null;
  } catch {
    return null;
  }
}

export async function updateSeasonConfig(patch: Partial<SeasonConfig>) {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('season_config')
      .update(patch)
      .eq('id', 1)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data, error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}
