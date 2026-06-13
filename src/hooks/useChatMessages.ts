// src/hooks/useChatMessages.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { Message } from '@/types';

export function useChatMessages(threadId: string) {
  return useInfiniteQuery({
    queryKey: keys.chatMessages(threadId),
    queryFn: async ({ pageParam = null }) => {
      const query = requireSupabase()
        .from('house_messages')
        .select('*, reactions:message_reactions(*)')
        .eq('thread_id', threadId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (pageParam) {
        query.lt('created_at', pageParam as string);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Message[];
    },
    getNextPageParam: (lastPage: Message[]) =>
      lastPage.length === 50 ? lastPage[lastPage.length - 1].created_at : undefined,
    initialPageParam: null,
  });
}
