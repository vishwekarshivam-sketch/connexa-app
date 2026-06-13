// src/hooks/useChatRealtime.ts
import { useEffect } from 'react';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { Message } from '@/types';

export function useChatRealtime(houseId: string, threadId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!houseId || !threadId) return;

    const client = requireSupabase();
    const channel = client
      .channel(`house-chat-${houseId}-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'house_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          // Prepend new message to the first page of the infinite query
          queryClient.setQueryData(
            keys.chatMessages(threadId),
            (old: InfiniteData<Message[]> | undefined) => {
              if (!old) return old;
              const newMessage = payload.new as Message;
              
              // Avoid duplicates (optimistic message already in cache)
              const alreadyExists = old.pages[0]?.some((m) => m.id === newMessage.id);
              if (alreadyExists) return old;
              
              return {
                ...old,
                pages: [[newMessage, ...old.pages[0]], ...old.pages.slice(1)],
              };
            }
          );
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [houseId, threadId, queryClient]);
}
