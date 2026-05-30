import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';

const MOCK_STANDINGS = [
  { house: 'tinkerers', score: 2840, members: 67 },
  { house: 'wanderers', score: 2610, members: 59 },
  { house: 'strategists', score: 2490, members: 72 },
  { house: 'mavericks', score: 2350, members: 61 },
];

export function LeaderboardScreen() {
  const insets = useSafeAreaInsets();

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
          marginTop: 4 
        }}>
          House standings · Week 3
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
        {MOCK_STANDINGS.map((s, i) => {
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
                borderBottomColor: colors.hairlineSoft 
              }}
            >
              <Text style={{ 
                fontFamily: fonts.serif, 
                fontSize: 28, 
                fontWeight: '300', 
                color: colors.inkWhisper, 
                width: 32 
              }}>
                {i + 1}
              </Text>
              <View style={{ width: 4, height: 40, backgroundColor: house.primary }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.ink }}>
                  {house.nameEn}
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkMute }}>
                  {s.members} members
                </Text>
              </View>
              <Text style={{ 
                fontFamily: fonts.serif, 
                fontSize: 24, 
                fontWeight: '300', 
                color: colors.ink 
              }}>
                {s.score.toLocaleString()}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
