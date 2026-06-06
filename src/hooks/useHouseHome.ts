// src/hooks/useHouseHome.ts
import { useQuery } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';

export function useHouseHome(houseId: string) {
  return useQuery({
    queryKey: keys.houseHome(houseId),
    queryFn: async () => {
      // RPC defined in spec #15
      const { data, error } = await requireSupabase()
        .rpc('get_house_home_data', { p_house_id: houseId });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}
