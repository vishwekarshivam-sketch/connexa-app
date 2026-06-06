// src/hooks/useHouseMembers.ts
import { useQuery } from '@tanstack/react-query';
import { getHouseMembers } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { House } from '@/types';

export function useHouseMembers(house: House) {
  return useQuery({
    queryKey: keys.houseMembers(house),
    queryFn: () => getHouseMembers(house),
    staleTime: 5 * 60_000,
  });
}
