// src/hooks/useReact.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/authStore';

// Reactions target a specific prompt RESPONSE (a row in prompt_responses),
// not the prompt itself. promptId is used only to key the cached response list.
export function useReact(responseId: string, promptId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (reactionType: string) => {
      if (!user) throw new Error('Must be logged in to react');

      const { error } = await requireSupabase()
        .from('prompt_response_reactions')
        .upsert(
          {
            response_id: responseId,
            reaction_type: reactionType,
            user_id: user.id,
          },
          { onConflict: 'response_id,user_id,reaction_type' }
        );
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: keys.housePromptResponses(promptId) });
      const snapshot = queryClient.getQueryData(keys.housePromptResponses(promptId));
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(keys.housePromptResponses(promptId), context.snapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.housePromptResponses(promptId) });
    },
  });
}
