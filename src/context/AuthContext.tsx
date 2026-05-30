import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  ConnexaUser,
  getCurrentUserProfile,
  isSupabaseConfigured,
  supabase,
  updateProfile,
} from '@/lib/supabase';

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

  const refreshUser = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }
    const profile = await getCurrentUserProfile();
    setUser(profile);
  };

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!supabase) {
        if (mounted) setBootstrapping(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        await refreshUser();
      }
      if (mounted) setBootstrapping(false);
    }

    bootstrap();
    const { data: subscription } = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setUser(null);
        return;
      }
      refreshUser().catch(() => setUser(null));
    }) ?? { data: { subscription: null } };

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !user?.id) return;

    const channel = supabase
      .channel(`user-profile-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => setUser(payload.new as ConnexaUser),
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
    isAuthenticated: !!session && user?.verification_status === 'verified' && !!user.house,
    isVerified: user?.verification_status === 'verified',
    refreshUser,
    setUser,
    updateUser: async (patch) => {
      const result = await updateProfile(patch);
      if (result.user) setUser(result.user);
      return { error: result.error };
    },
    signIn: () => {
      refreshUser().catch(() => undefined);
    },
    signOut: async () => {
      await supabase?.auth.signOut();
      setSession(null);
      setUser(null);
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
