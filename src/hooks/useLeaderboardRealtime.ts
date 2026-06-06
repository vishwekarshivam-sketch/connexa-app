// src/hooks/useLeaderboardRealtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';

export function useLeaderboardRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const client = requireSupabase();
    const channel = client
      .channel('leaderboard-refresh')
      .on('broadcast', { event: 'refresh' }, () => {
        queryClient.invalidateQueries({ queryKey: keys.leaderboardHouses() });
        queryClient.invalidateQueries({ queryKey: ['leaderboard', 'individual'] });
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [queryClient]);
}
