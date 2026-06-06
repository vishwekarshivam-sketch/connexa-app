// src/hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { ConnexaUser } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export function useProfile(userId?: string) {
  const { session } = useAuthStore();
  const effectiveUserId = userId || session?.user?.id;

  return useQuery({
    queryKey: userId ? keys.houseProfile(userId) : keys.myDateProfile(),
    queryFn: async () => {
      if (!effectiveUserId) return null;

      const { data, error } = await requireSupabase()
        .from('users')
        .select('*')
        .eq('id', effectiveUserId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ConnexaUser | null;
    },
    enabled: !!effectiveUserId,
  });
}
