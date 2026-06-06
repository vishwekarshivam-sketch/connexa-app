import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { keys } from '@/lib/query-keys';
import { Icon } from '@/components/Icon';
import { HOUSES } from '@/fixtures/houseData';
import { Skeleton } from '@/components/Skeleton';

type Props = NativeStackScreenProps<ProfileStackParamList, 'HouseChat'>;

interface Thread {
  id: string;
  title: string;
  type: 'prompt' | 'general';
  last_message?: { body: string; created_at: string };
  response_count: number;
  is_unread: boolean;
  created_at: string;
}

export function HouseChatScreen({ navigation }: Props) {
  const { user } = useAuth();
  const house = HOUSES[user?.house || 'tinkerers'];

  const { data: threads, isLoading } = useQuery({
    queryKey: keys.chatThreads(user?.house || ''),
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .rpc('get_house_threads', { p_house: user?.house });

      if (error) throw error;
      return (data ?? []) as Thread[];
    },
    enabled: !!user?.house,
  });

  const renderThread = ({ item }: { item: Thread }) => (
    <TouchableOpacity 
      style={[
        styles.threadRow, 
        item.type === 'prompt' && styles.promptThread
      ]}
      onPress={() => {
        navigation.navigate('ThreadView', {
          threadId: item.id,
          title: item.title || 'Conversation',
          threadType: item.type,
        });
      }}
    >
      <View style={styles.iconContainer}>
        <Icon 
          name={item.type === 'prompt' ? 'bookOpen' : 'messageSquare'} 
          size={20} 
          color={house.primary} 
        />
      </View>
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={[styles.threadTitle, item.is_unread && styles.unreadTitle]} numberOfLines={1}>
            {item.title || 'Conversation'}
          </Text>
          {item.is_unread && <View style={[styles.unreadDot, { backgroundColor: colors.ember }]} />}
        </View>
        <Text style={styles.threadMeta}>
          {item.response_count} responses · {item.last_message ? new Date(item.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.last_message && (
          <Text style={styles.preview} numberOfLines={1}>
            {item.last_message.body}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{house.nameEn} Chat</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ThreadView', { threadId: 'new', title: 'New Thread', threadType: 'general' })} hitSlop={12}>
          <Icon name="plus" size={24} color={colors.ink} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <HouseChatSkeleton />
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThread}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No conversations yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function HouseChatSkeleton() {
  return (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <View key={i} style={styles.threadRow}>
          <Skeleton width={20} height={20} style={{ marginRight: 16, marginTop: 4 }} />
          <View style={styles.threadContent}>
            <View style={styles.threadHeader}>
              <Skeleton width="70%" height={18} />
            </View>
            <Skeleton width={120} height={10} style={{ marginVertical: 6 }} />
            <Skeleton width="100%" height={14} />
          </View>
        </View>
      ))}
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerTitle: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: colors.ink,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 40,
  },
  threadRow: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  promptThread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.lake, // Should be house primary
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  iconContainer: {
    marginRight: 16,
    paddingTop: 4,
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  threadTitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  threadMeta: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  preview: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMute,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkWhisper,
  }
});
