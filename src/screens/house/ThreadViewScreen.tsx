import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList, Message } from '@/types';
import { colors, fonts } from '@/tokens';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requireSupabase, markThreadRead } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { Icon } from '@/components/Icon';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import { useSettleAnimation } from '@/hooks/useSettleAnimation';
import Animated from 'react-native-reanimated';
import { Skeleton } from '@/components/Skeleton';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ThreadView'>;

export function ThreadViewScreen({ navigation, route }: Props) {
  const { threadId: initialThreadId, title: initialTitle, threadType } = route.params;
  const { user } = useAuth();
  const [threadId, setThreadId] = useState(initialThreadId);
  const [title, setTitle] = useState(initialTitle);
  const [inputText, setInputText] = useState('');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const { settle, animatedStyle } = useSettleAnimation();

  useEffect(() => {
    if (user && threadId && threadId !== 'new') {
      markThreadRead(threadId, user.id);
    }
  }, [threadId, user]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useChatMessages(threadId === 'new' ? '' : threadId);

  // Subscribe to real-time updates
  useChatRealtime(user?.house || '', threadId === 'new' ? '' : threadId);

  const messages = data?.pages.flat() || [];

  const sendMessage = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error('Not authenticated');
      
      let targetThreadId = threadId;
      
      if (threadId === 'new') {
        const { data: newThread, error: threadError } = await requireSupabase()
          .from('house_threads')
          .insert({
            house: user.house,
            type: 'general',
            title: newThreadTitle.trim() || 'General Thread',
          })
          .select()
          .single();
          
        if (threadError) throw threadError;
        targetThreadId = newThread.id;
        setThreadId(newThread.id);
        setTitle(newThread.title);
      }

      const { error } = await requireSupabase()
        .from('house_messages')
        .insert({
          thread_id: targetThreadId,
          user_id: user.id,
          body: text.trim(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setInputText('');
      settle();
      if (initialThreadId === 'new') {
        queryClient.invalidateQueries({ queryKey: keys.chatThreads(user?.house || '') });
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to send message');
    }
  });


  const reactToMessage = useMutation({
    mutationFn: async ({ messageId, type }: { messageId: string, type: string }) => {
      if (!user) return;
      const { error } = await requireSupabase()
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: type,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      // Real-time will handle updates
    }
  });

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender === user?.id;
    const reactions = item.reactions || [];

    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessage : styles.theirMessage]}>
        {!isMine && (
          <View style={styles.avatarPlaceholder}>
             <Icon name="user" size={16} color={colors.inkWhisper} />
          </View>
        )}
        <View style={{ gap: 4 }}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onLongPress={() => reactToMessage.mutate({ messageId: item.id, type: 'house' })}
          >
            <Animated.View style={[styles.bubble, isMine ? [styles.myBubble, animatedStyle] : styles.theirBubble]}>
              {!isMine && <Text style={styles.senderName}>House-mate</Text>}
              <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>
                {item.body}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Animated.View>
          </TouchableOpacity>
          
          {reactions.length > 0 && (
            <View style={[styles.reactionsRow, isMine && { justifyContent: 'flex-end' }]}>
              {reactions.map((r: any, idx: number) => (
                <View key={idx} style={styles.reaction}>
                  <Text style={styles.reactionText}>{r.reaction_type === 'house' ? '🏠' : r.reaction_type}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          {initialThreadId === 'new' && threadId === 'new' ? (
            <TextInput
              style={[styles.headerTitle, { padding: 0 }]}
              placeholder="Thread Title..."
              value={newThreadTitle}
              onChangeText={setNewThreadTitle}
              autoFocus
            />
          ) : (
            <>
              <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
              <Text style={styles.headerSub}>{threadType === 'prompt' ? 'Prompt Thread' : 'General'}</Text>
            </>
          )}
        </View>
        <TouchableOpacity hitSlop={12}>
          <Icon name="moreVertical" size={24} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.listContent}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={colors.ink} /> : null}
        ListEmptyComponent={isLoading ? (
          <View style={{ gap: 16 }}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <View key={i} style={[styles.messageWrapper, i % 2 === 0 ? styles.myMessage : styles.theirMessage]}>
                <Skeleton 
                  width={i % 2 === 0 ? 120 : 200} 
                  height={i % 3 === 0 ? 80 : 44} 
                  radius={16} 
                  style={{ opacity: 0.1 }} 
                />
              </View>
            ))}
          </View>
        ) : null}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Say something..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendDisabled]}
            disabled={!inputText.trim() || sendMessage.isPending}
            onPress={() => sendMessage.mutate(inputText)}
          >
            {sendMessage.isPending ? (
              <ActivityIndicator size="small" color={colors.khadi} />
            ) : (
              <Icon name="chevronRight" size={24} color={colors.khadi} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.khadi,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  headerSub: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
  },
  listContent: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: colors.ink,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.inkWhisper,
    marginBottom: 4,
  },
  messageText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: colors.khadi,
  },
  theirText: {
    color: colors.ink,
  },
  timestamp: {
    fontFamily: fonts.label,
    fontSize: 9,
    color: colors.inkWhisper,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: -8,
    marginHorizontal: 8,
  },
  reaction: {
    backgroundColor: colors.khadi,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  reactionText: {
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.khadi,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  }
});
