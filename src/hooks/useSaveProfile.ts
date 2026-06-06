// src/hooks/useSaveProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/authStore';
import { ConnexaUser } from '@/types';

export type ProfileUpdateInput = Partial<Pick<ConnexaUser, 'display_name' | 'photo_url' | 'gender' | 'branch' | 'year' | 'hometown'>>;

export function useSaveProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: ProfileUpdateInput) => {
      if (!user) throw new Error('Must be logged in to save profile');

      const { error } = await requireSupabase()
        .from('users')
        .update(data)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: keys.houseProfile(user.id) });
        queryClient.invalidateQueries({ queryKey: keys.myDateProfile() });
      }
    },
  });
}
