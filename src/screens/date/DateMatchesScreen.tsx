import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList, Match, DateProfile } from '@/types';
import { colors, fonts } from '@/tokens';
import { getMyMatches, getDateProfile } from '@/lib/supabase';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<DateStackParamList, 'DateMatches'>;

export function DateMatchesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [matches, setMatches] = useState<(Match & { profile?: DateProfile | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await getMyMatches(user.id);
      const withProfiles = await Promise.all(
        data.map(async (m) => {
          const otherId = m.user_a === user.id ? m.user_b : m.user_a;
          return {
            ...m,
            profile: await getDateProfile(otherId)
          };
        })
      );
      setMatches(withProfiles);
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Matches</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {matches.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.matchCard}
            onPress={() => navigation.navigate('DateDM', { 
              threadId: item.id, // match_id is used as threadId in v1
              otherUserName: item.profile?.display_name || 'Anonymous' 
            })}
          >
            <View style={styles.photoContainer}>
              {item.profile?.photos?.[0] ? (
                <Image source={{ uri: item.profile.photos[0].url }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, { backgroundColor: colors.khadiDeep }]} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.profile?.display_name || 'Anonymous'}</Text>
              <Text style={styles.preview}>Matched on {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <Icon name="chevronLeft" size={20} color={colors.hairline} />
            </View>
          </TouchableOpacity>
        ))}

        {matches.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No matches yet. Take your time.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft
  },
  headerTitle: {
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.ink
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingVertical: 16 },
  matchCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.hairlineSoft,
    gap: 16
  },
  photoContainer: { width: 64, height: 64, backgroundColor: colors.khadiDeep },
  photo: { width: '100%', height: '100%' },
  info: { flex: 1 },
  name: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  preview: { fontFamily: fonts.body, fontSize: 14, color: colors.inkWhisper, marginTop: 4 },
  empty: { paddingVertical: 100, alignItems: 'center' },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.inkWhisper }
});
