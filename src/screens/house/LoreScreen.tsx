import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { Icon } from '@/components/Icon';
import { HOUSES } from '@/fixtures/houseData';
import { Skeleton } from '@/components/Skeleton';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Lore'>;

interface LoreEntry {
  id: string;
  week_number: number;
  text: string;
  attribution: string;
  created_at: string;
}

export function LoreScreen({ navigation }: Props) {
  const { user } = useAuth();
  const houseKey = user?.house || 'tinkerers';
  const house = HOUSES[houseKey];

  const { data: loreEntries, isLoading } = useQuery({
    queryKey: ['house-lore', houseKey],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from('house_lore')
        .select('*')
        .eq('house', user?.house)
        .order('week_number', { ascending: false });

      if (error) throw error;
      return data as LoreEntry[];
    },
    enabled: !!user?.house,
  });

  if (isLoading) {
    return <LoreSkeleton />;
  }

  const latestLore = loreEntries?.[0];
  const previousLore = loreEntries?.slice(1) || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>House Archives</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {latestLore ? (
          <View style={styles.latestCard}>
            <Text style={styles.weekLabel}>WEEK {latestLore.week_number}</Text>
            <Text style={styles.loreText}>"{latestLore.text}"</Text>
            <View style={styles.attributionRow}>
              <View style={[styles.dash, { backgroundColor: house.primary }]} />
              <Text style={styles.attribution}>{latestLore.attribution}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>The archives are currently silent.</Text>
          </View>
        )}

        {previousLore.length > 0 && (
          <View style={styles.previousSection}>
            <Text style={styles.sectionTitle}>PAST ENTRIES</Text>
            {previousLore.map((entry) => (
              <View key={entry.id} style={styles.previousRow}>
                <Text style={styles.previousWeek}>WEEK {entry.week_number}</Text>
                <Text style={styles.previousText} numberOfLines={3}>
                  {entry.text}
                </Text>
                <View style={styles.rowDivider} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LoreSkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ paddingLeft: 20 }}>
          <Skeleton width={24} height={24} />
        </View>
        <Skeleton width={120} height={18} />
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Skeleton width="100%" height={240} radius={8} style={{ marginBottom: 48 }} />
        <Skeleton width={100} height={11} style={{ marginBottom: 24 }} />
        {[1, 2, 3].map(i => (
          <View key={i} style={{ marginBottom: 24 }}>
            <Skeleton width={60} height={10} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={60} />
          </View>
        ))}
      </View>
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
  content: {
    padding: 24,
  },
  latestCard: {
    backgroundColor: colors.khadi,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 32,
    borderRadius: 8,
    marginBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  weekLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.inkWhisper,
    letterSpacing: 2,
    marginBottom: 24,
    textAlign: 'center',
  },
  loreText: {
    fontFamily: fonts.bodyItalic,
    fontSize: 20,
    lineHeight: 30,
    color: colors.ink,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  attributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  dash: {
    width: 24,
    height: 1,
    marginRight: 12,
  },
  attribution: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previousSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.inkWhisper,
    letterSpacing: 2,
    marginBottom: 24,
  },
  previousRow: {
    marginBottom: 24,
  },
  previousWeek: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.inkWhisper,
    marginBottom: 8,
  },
  previousText: {
    fontFamily: fonts.bodyItalic,
    fontSize: 16,
    color: colors.inkMute,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginTop: 24,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkWhisper,
    textAlign: 'center',
  }
});
