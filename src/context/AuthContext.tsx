import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  ConnexaUser,
  getUserProfileById,
  isSupabaseConfigured,
  supabase,
  updateProfile,
  claimInvite,
} from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface AuthContextType {
  bootstrapping: boolean;
  session: Session | null;
  user: ConnexaUser | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: ConnexaUser | null) => void;
  updateUser: (patch: Parameters<typeof updateProfile>[0]) => Promise<{ error: string | null }>;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ConnexaUser | null>(null);

  // Single source of truth: mirror auth state into the Zustand store the
  // navigators read, so there is only one listener + one profile fetch.
  const storeSetSession = useAuthStore((s) => s.setSession);
  const storeSetUser = useAuthStore((s) => s.setUser);
  const storeSetLoading = useAuthStore((s) => s.setLoading);
  const inviteCode = useAuthStore((s) => s.inviteCode);
  const setInviteCode = useAuthStore((s) => s.setInviteCode);

  const applyUser = (next: ConnexaUser | null) => {
    setUser(next);
    storeSetUser(next);
  };
  const applySession = (next: Session | null) => {
    setSession(next);
    storeSetSession(next);
  };

  const refreshUser = async () => {
    if (!isSupabaseConfigured || !supabase) {
      applyUser(null);
      return;
    }
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) {
      applyUser(null);
      return;
    }
    applyUser(await getUserProfileById(userId));
  };

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) {
          setBootstrapping(false);
          storeSetLoading(false);
        }
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        applySession(data.session);
        if (data.session?.user?.id) {
          applyUser(await getUserProfileById(data.session.user.id));
        }
      } catch (err) {
        console.warn('Auth bootstrap error:', err);
      } finally {
        if (mounted) {
          setBootstrapping(false);
          storeSetLoading(false);
        }
      }
    }

    bootstrap();
    const { data: subscription } = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
      if (!nextSession?.user?.id) {
        applyUser(null);
        return;
      }
      getUserProfileById(nextSession.user.id)
        .then(applyUser)
        .catch(() => applyUser(null));
    }) ?? { data: { subscription: null } };

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session && inviteCode) {
      claimInvite(inviteCode).then(({ success }) => {
        if (success) {
          setInviteCode(null);
        }
      });
    }
  }, [session, inviteCode]);

  useEffect(() => {
    if (!supabase || !user?.id) return;

    const channel = supabase
      .channel(`user-profile-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => applyUser(payload.new as ConnexaUser),
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [user?.id]);

  const value = useMemo<AuthContextType>(() => ({
    bootstrapping,
    session,
    user,
    isAuthenticated: !!session && user?.status === 'active' && (!!user.house || user.is_admin),
    isVerified: !!user && ['onboarding', 'active'].includes(user.status),
    refreshUser,
    setUser: applyUser,
    updateUser: async (patch) => {
      const result = await updateProfile(patch);
      if (result.user) applyUser(result.user);
      return { error: result.error };
    },
    signIn: () => {
      refreshUser().catch(() => undefined);
    },
    signOut: async () => {
      await supabase?.auth.signOut();
      applySession(null);
      applyUser(null);
    },
  }), [bootstrapping, session, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
