import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock: send OTP (replace with supabase.auth.signInWithOtp when backend ready)
export async function sendOtp(email: string): Promise<{ error: string | null }> {
  console.log('[mock] sendOtp to', email);
  return { error: null };
}

// Mock: verify OTP
export async function verifyOtp(email: string, code: string): Promise<{ error: string | null }> {
  console.log('[mock] verifyOtp', email, code);
  if (code.length !== 6) return { error: 'Invalid code.' };
  return { error: null };
}

// Mock: submit doc form
export async function submitDocForm(data: {
  roll: string; name: string; iit: string; fileUri: string;
}): Promise<{ error: string | null }> {
  console.log('[mock] submitDocForm', data);
  return { error: null };
}
