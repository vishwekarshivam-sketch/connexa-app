// src/stores/authStore.ts
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { ConnexaUser } from '@/types';

interface AuthState {
  session: Session | null;
  user: ConnexaUser | null;
  isLoading: boolean;
  inviteCode: string | null;
  setSession: (session: Session | null) => void;
  setUser: (user: ConnexaUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInviteCode: (code: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  inviteCode: null,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInviteCode: (inviteCode) => set({ inviteCode }),
  signOut: () => set({ session: null, user: null, inviteCode: null }),
}));
