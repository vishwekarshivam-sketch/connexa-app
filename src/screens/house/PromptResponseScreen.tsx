import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { useHouseHome } from '@/hooks/useHouseHome';
import { Skeleton } from '@/components/Skeleton';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PromptResponse'>;

export function PromptResponseScreen({ navigation }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: homeData, isLoading: loadingHome } = useHouseHome(user?.house || '');
  const [text, setText] = useState('');

  // Extract today's prompt from homeData (RPC get_house_home_data)
  const todayPrompt = homeData?.today_prompt;

  const submitResponse = useMutation({
    mutationFn: async (responseText: string) => {
      if (!user || !todayPrompt) throw new Error('Missing data');
      
      const { error } = await requireSupabase().rpc('submit_prompt_response', {
        p_prompt_id: todayPrompt.id,
        p_body: responseText
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.houseHome(user?.house || '') });
      queryClient.invalidateQueries({ queryKey: keys.housePromptResponses(todayPrompt?.id || '') });
      Alert.alert('Response posted', 'Your house-mates can now see and react to your answer.');
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to post response');
    }
  });

  if (loadingHome) {
    return <PromptResponseSkeleton />;
  }

  if (!todayPrompt) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No prompt scheduled for today.</Text>
        <Button title="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Today's Prompt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.promptText}>{todayPrompt.text}</Text>
        
        <View style={styles.meta}>
          {todayPrompt.leader_name && (
            <Text style={styles.attribution}>
              from {todayPrompt.leader_name}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <TextInput
          style={styles.input}
          placeholder="Your answer..."
          placeholderTextColor={colors.inkWhisper}
          multiline
          value={text}
          onChangeText={setText}
          maxLength={500}
          autoFocus
        />
        
        <Text style={styles.limit}>
          {text.length}/500
        </Text>
        
        <Text style={styles.disclaimer}>
          Your response is visible to your house-mates.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={submitResponse.isPending ? 'Posting...' : 'Post response'}
          onPress={() => submitResponse.mutate(text)}
          disabled={!text.trim() || submitResponse.isPending}
          variant="primary"
          style={{ backgroundColor: colors.lake }} // Should ideally be house color
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function PromptResponseSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={24} height={24} radius={12} />
        <Skeleton width={120} height={12} />
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Skeleton width="100%" height={32} style={{ marginBottom: 12 }} />
        <Skeleton width="60%" height={32} style={{ marginBottom: 12 }} />
        <Skeleton width={100} height={14} style={{ marginBottom: 32 }} />
        <View style={styles.divider} />
        <Skeleton width="40%" height={24} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={100} radius={8} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.khadi,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.khadi,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  content: {
    padding: 24,
  },
  promptText: {
    fontFamily: fonts.title,
    fontSize: 24,
    color: colors.ink,
    lineHeight: 32,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  attribution: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkWhisper,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginBottom: 32,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  limit: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.inkWhisper,
    textAlign: 'right',
    marginTop: 8,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkWhisper,
    marginTop: 32,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.khadi,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkWhisper,
    marginBottom: 24,
  }
});
