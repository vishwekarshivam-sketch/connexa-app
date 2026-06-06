import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface NotificationSettings {
  daily_prompt: boolean;
  reaction: boolean;
  invite_converted: boolean;
  retention_bonus: boolean;
  mutual_match: boolean;
  streak_milestone: boolean;
  house_rank_change: boolean;
  monthly_reveal: boolean;
}

export function useNotificationSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from('user_notification_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as NotificationSettings;
    },
    enabled: !!user,
  });

  const updateSettings = useMutation({
    mutationFn: async (patch: Partial<NotificationSettings>) => {
      if (!user) return;
      const { error } = await requireSupabase()
        .from('user_notification_settings')
        .update(patch)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });

  return {
    ...query,
    updateSettings,
  };
}
