import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { HouseScore } from '@/lib/supabase';
import { useHouseScores, useSeasonConfig } from '@/hooks/useLeaderboard';
import { CrowningReveal } from '@/components/CrowningReveal';
import { MonthlyReveal } from '@/components/MonthlyReveal';
import { House } from '@/types';
import { Skeleton } from '@/components/Skeleton';

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { data: scores = [], isLoading } = useHouseScores();
  const { data: seasonConfig, isLoading: loadingSeason } = useSeasonConfig();
  const [showCrowning, setShowCrowning] = useState(false);
  const [showMonthlyReveal, setShowMonthlyReveal] = useState(false);
  const [ceremonySeenInSession, setCeremonySeenInSession] = useState(false);

  useEffect(() => {
    if (ceremonySeenInSession) return;

    if (seasonConfig?.crowning_done) {
      setShowCrowning(true);
    } else if (seasonConfig?.reveal_triggered) {
      setShowMonthlyReveal(true);
    }
  }, [seasonConfig, ceremonySeenInSession]);

  const label = scores[0] ? `Week of ${weekLabel(scores[0].week_start)}` : 'This week';
  const winnerHouse = scores[0]?.house as House || 'tinkerers';
  const monthYear = scores[0] 
    ? new Date(scores[0].week_start).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'This Month';

  const handleCeremonyComplete = () => {
    setShowCrowning(false);
    setShowMonthlyReveal(false);
    setCeremonySeenInSession(true);
  };

  if (isLoading || loadingSeason) {
    return <LeaderboardSkeleton insets={insets} />;
  }

  if (showCrowning) {
    return <CrowningReveal winnerHouse={winnerHouse} onComplete={handleCeremonyComplete} />;
  }

  if (showMonthlyReveal) {
    return <MonthlyReveal winnerHouse={winnerHouse} monthYear={monthYear} onComplete={handleCeremonyComplete} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {seasonConfig?.crowning_done ? 'Season 1 Results' : 'Leaderboard'}
        </Text>
        <Text style={styles.subtitle}>
          {seasonConfig?.crowning_done ? 'Final House Standings' : `House standings · ${label}`}
        </Text>
      </View>
      
      {seasonConfig?.crowning_done && (
        <TouchableOpacity 
          style={styles.replayButton}
          onPress={() => setShowCrowning(true)}
        >
          <Text style={styles.replayText}>Replay Crowning →</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {scores.map((s, i) => {
          const house = HOUSES[s.house];
          return (
            <View key={s.house} style={styles.row}>
              <Text style={styles.rank}>
                {i + 1}
              </Text>
              <View style={[styles.indicator, { backgroundColor: house.primary }]} />
              <View style={styles.houseInfo}>
                <Text style={styles.houseName}>
                  {house.nameEn}
                </Text>
                {i === 0 && seasonConfig?.crowning_done && (
                  <Text style={styles.championLabel}>CHAMPIONS</Text>
                )}
              </View>
              <Text style={styles.score}>
                {s.score.toLocaleString()}
              </Text>
            </View>
          );
        })}
        {scores.length === 0 && (
          <Text style={styles.loadingText}>
            No scores recorded for this period.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function LeaderboardSkeleton({ insets }: { insets: any }) {
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Skeleton width={160} height={28} style={{ marginBottom: 8 }} />
        <Skeleton width={220} height={14} />
      </View>

      <View style={styles.list}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.row}>
            <Skeleton width={32} height={28} />
            <Skeleton width={4} height={40} />
            <View style={{ flex: 1, gap: 4 }}>
              <Skeleton width="50%" height={20} />
              {i === 1 && <Skeleton width="30%" height={10} />}
            </View>
            <Skeleton width={60} height={24} />
          </View>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.khadi,
  },
  header: {
    padding: 24,
    paddingBottom: 20,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.inkMute,
    marginTop: 4,
  },
  replayButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  replayText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: {
    paddingHorizontal: 24,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  rank: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '300',
    color: colors.inkWhisper,
    width: 32,
  },
  indicator: {
    width: 4,
    height: 40,
  },
  houseInfo: {
    flex: 1,
  },
  houseName: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
  },
  championLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.lake, // or Ember
    letterSpacing: 1,
    marginTop: 4,
  },
  score: {
    fontFamily: fonts.serif,
    fontSize: 24,
    fontWeight: '300',
    color: colors.ink,
  },
  loadingText: {
    fontFamily: fonts.bodyItalic,
    fontStyle: 'italic',
    fontSize: 15,
    color: colors.inkWhisper,
    marginTop: 32,
  }
});
