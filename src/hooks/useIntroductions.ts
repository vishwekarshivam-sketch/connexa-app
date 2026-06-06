// src/hooks/useIntroductions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyIntroductions, respondToIntroduction, IntroductionWithProfile } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';

export function useMyIntroductions(userId: string) {
  return useQuery({
    queryKey: keys.myIntro(userId),
    queryFn: getMyIntroductions,
    staleTime: 30_000,
    enabled: !!userId,
  });
}

export function useRespondToIntroduction(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: 'accepted' | 'passed' }) =>
      respondToIntroduction(id, response),
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: keys.myIntro(userId) });

      // Snapshot the previous value
      const previousIntros = queryClient.getQueryData<IntroductionWithProfile[]>(keys.myIntro(userId));

      // Optimistically update to the new value
      if (previousIntros) {
        queryClient.setQueryData<IntroductionWithProfile[]>(
          keys.myIntro(userId),
          previousIntros.filter((intro) => intro.id !== id)
        );
      }

      return { previousIntros };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIntros) {
        queryClient.setQueryData(keys.myIntro(userId), context.previousIntros);
      }
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: keys.myIntro(userId) });
    },
  });
}
