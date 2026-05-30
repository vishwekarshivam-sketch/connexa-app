import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { getHouseScores, HouseScore } from '@/lib/supabase';

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [scores, setScores] = useState<HouseScore[]>([]);

  useEffect(() => {
    getHouseScores().then(setScores);
  }, []);

  const label = scores[0] ? `Week of ${weekLabel(scores[0].week_start)}` : 'This week';

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{ padding: 24, paddingBottom: 20 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.ink }}>
          Leaderboard
        </Text>
        <Text style={{
          fontFamily: fonts.body,
          fontStyle: 'italic',
          fontSize: 14,
          color: colors.inkMute,
          marginTop: 4,
        }}>
          House standings · {label}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
        {scores.map((s, i) => {
          const house = HOUSES[s.house];
          return (
            <View
              key={s.house}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderBottomColor: colors.hairlineSoft,
              }}
            >
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 28,
                fontWeight: '300',
                color: colors.inkWhisper,
                width: 32,
              }}>
                {i + 1}
              </Text>
              <View style={{ width: 4, height: 40, backgroundColor: house.primary }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.ink }}>
                  {house.nameEn}
                </Text>
              </View>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 24,
                fontWeight: '300',
                color: colors.ink,
              }}>
                {s.score.toLocaleString()}
              </Text>
            </View>
          );
        })}
        {scores.length === 0 && (
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 15,
            color: colors.inkWhisper,
            marginTop: 32,
          }}>
            Scores loading…
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
