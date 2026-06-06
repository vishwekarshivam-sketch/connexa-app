import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList, Message, DMThread } from '@/types';
import { colors, fonts } from '@/tokens';
import { getMessages, sendMessage, getDMThread, requireSupabase } from '@/lib/supabase';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<DateStackParamList, 'DateDM'>;

export function DateDMScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { threadId, otherUserName } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [thread, setThread] = useState<DMThread | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      // In v1, threadId passed in route is actually the matchId
      const t = await getDMThread(threadId);
      if (t) {
        setThread(t);
        const msgs = await getMessages(t.id);
        setMessages(msgs);

        // Real-time subscription
        const client = requireSupabase();
        const channel = client
          .channel(`dm:${t.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'dm_messages',
              filter: `thread_id=eq.${t.id}`,
            },
            (payload: any) => {
              const newMessage = payload.new as Message;
              setMessages((prev) => {
                // Prevent duplicate if we already added it optimistically
                if (prev.find((m) => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
              });
              setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
            }
          )
          .subscribe();

        return () => {
          client.removeChannel(channel);
        };
      }
      setLoading(false);
    }
    load();
  }, [threadId, user]);

  const handleSend = async () => {
    if (!user || !thread || !text.trim()) return;
    
    const body = text.trim();
    setText('');

    // Optimistic update
    const tempId = Math.random().toString();
    const optimisticMsg: Message = {
      id: tempId,
      thread_id: thread.id,
      sender: user.id,
      body,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    const { data, error } = await sendMessage(thread.id, user.id, body);
    if (error) {
      alert(error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.khadi }}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUserName}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="chevronRight" size={22} color={colors.inkMute} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages yet. No pressure — start whenever.</Text>
          </View>
        ) : (
          messages.map((m, i) => {
            const isMe = m.sender === user?.id;
            const prevMsg = messages[i-1];
            const showDate = !prevMsg || new Date(m.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

            return (
              <View key={m.id}>
                {showDate && (
                  <Text style={styles.dateHeader}>
                    {new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                    {m.body}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          style={styles.input}
          placeholder={`Message ${otherUserName}...`}
          placeholderTextColor={colors.inkWhisper}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          onPress={handleSend} 
          disabled={!text.trim()}
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    backgroundColor: colors.khadi
  },
  headerInfo: { flex: 1, alignItems: 'center' },
  headerName: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16 },
  empty: { paddingVertical: 100, alignItems: 'center' },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.inkWhisper, textAlign: 'center' },
  dateHeader: { 
    fontFamily: fonts.label, 
    fontSize: 10, 
    textTransform: 'uppercase', 
    color: colors.inkWhisper, 
    textAlign: 'center',
    marginVertical: 24,
    letterSpacing: 1.2
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 2
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairlineSoft
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.ink
  },
  messageText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink
  },
  messageTextMe: {
    color: colors.khadi
  },
  inputBar: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.khadi,
    borderTopWidth: 1,
    borderTopColor: colors.hairlineSoft,
    gap: 12
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairlineSoft
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: colors.ink,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: colors.hairline
  },
  sendText: {
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.khadi
  }
});
