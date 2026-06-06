// src/hooks/useLeaderboard.ts
import { useQuery } from '@tanstack/react-query';
import { getHouseScores, getSeasonConfig } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';

export function useHouseScores() {
  return useQuery({
    queryKey: keys.leaderboardHouses(),
    queryFn: getHouseScores,
    staleTime: 60_000,
  });
}

export function useSeasonConfig() {
  return useQuery({
    queryKey: ['season', 'config'],
    queryFn: getSeasonConfig,
    staleTime: 5 * 60_000,
  });
}
