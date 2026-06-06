// src/stores/authStore.ts
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { ConnexaUser } from '@/types';

interface AuthState {
  session: Session | null;
  user: ConnexaUser | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: ConnexaUser | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ session: null, user: null }),
}));
