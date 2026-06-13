// src/hooks/useIntroductions.ts
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getReceivedInterests, 
  resolveInterest, 
  InterestWithProfile,
  getIntroFeed,
  getMyIntroduction,
  upsertIntroduction,
  toggleIntroReaction,
  getIntroComments,
  addIntroComment,
  IntroFilters,
  Introduction,
  IntroductionWithMeta,
  IntroCommentWithProfile,
  requireSupabase
} from '@/lib/supabase';
import { keys } from '@/lib/query-keys';

// --- Date Interests (Mislabeled as Intros in current UI) ---

export function useReceivedInterests(userId: string) {
  return useQuery({
    queryKey: ['date', 'interests', 'received', userId],
    queryFn: () => getReceivedInterests(),
    staleTime: 30_000,
    enabled: !!userId,
  });
}

export function useResolveInterest(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: 'accept' | 'pass' }) =>
      resolveInterest(id, response),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['date', 'interests', 'received', userId] });
      const previous = queryClient.getQueryData<InterestWithProfile[]>(['date', 'interests', 'received', userId]);
      if (previous) {
        queryClient.setQueryData<InterestWithProfile[]>(
          ['date', 'interests', 'received', userId],
          previous.filter((i) => i.id !== id)
        );
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['date', 'interests', 'received', userId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['date', 'interests', 'received', userId] });
    },
  });
}

// --- Actual Introductions Feed ---

export function useIntroFeed(filters: IntroFilters = {}) {
  return useQuery({
    queryKey: keys.introFeed(filters),
    queryFn: () => getIntroFeed(filters),
    staleTime: 60_000,
  });
}

export function useIntroDetail(introId: string) {
  return useQuery({
    queryKey: keys.introDetail(introId),
    queryFn: async () => {
      const feed = await getIntroFeed(); // This is a bit inefficient but works for now as getIntroFeed returns all posted
      return feed.find(i => i.id === introId);
    },
    enabled: !!introId,
  });
}

export function useMyPublicIntroduction() {
  return useQuery({
    queryKey: ['intro', 'mine'],
    queryFn: () => getMyIntroduction(),
    staleTime: 60_000,
  });
}

export function useUpsertPublicIntroduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (intro: Partial<Introduction>) => upsertIntroduction(intro),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intro'] });
    }
  });
}

export function useToggleIntroReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (introId: string) => toggleIntroReaction(introId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['intro'] });
    }
  });
}

// --- Comments ---

export function useIntroComments(introId: string) {
  return useQuery({
    queryKey: ['intro', introId, 'comments'],
    queryFn: () => getIntroComments(introId),
    enabled: !!introId,
  });
}

export function useIntroCommentsRealtime(introId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!introId) return;

    const client = requireSupabase();
    console.log(`[Realtime] Subscribing to intro-comments:${introId}`);
    
    const channel = client
      .channel(`intro-comments:${introId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'intro_comments',
          filter: `intro_id=eq.${introId}`,
        },
        (payload) => {
          console.log('[Realtime] New comment received:', payload);
          queryClient.invalidateQueries({ queryKey: ['intro', introId, 'comments'] });
          queryClient.invalidateQueries({ queryKey: ['intro'] }); // Update comment count
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status for intro-comments:${introId}:`, status);
      });

    return () => {
      console.log(`[Realtime] Unsubscribing from intro-comments:${introId}`);
      client.removeChannel(channel);
    };
  }, [introId, queryClient]);
}

export function useAddIntroComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ introId, body }: { introId: string; body: string }) => {
      const res = await addIntroComment(introId, body);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, { introId }) => {
      queryClient.invalidateQueries({ queryKey: ['intro', introId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['intro'] }); // Update comment count
    }
  });
}


// Keep old exports for compatibility during migration
export const useMyIntroductions = useReceivedInterests;
export const useRespondToIntroduction = useResolveInterest;
export const usePublicIntroductions = useIntroFeed;
export const useReactToPublicIntroduction = useToggleIntroReaction;

