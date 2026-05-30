import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { Mark } from '@/components/Mark';
import { useAuth } from '@/context/AuthContext';
import { getHouseMembers, ConnexaUser } from '@/lib/supabase';

export function HouseHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [members, setMembers] = useState<ConnexaUser[]>([]);

  const houseKey = user?.house ?? 'tinkerers';
  const house = HOUSES[houseKey];

  useEffect(() => {
    if (!user?.house) return;
    getHouseMembers(user.house).then(setMembers);
  }, [user?.house]);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const activeCount = members.filter((m) => m.updated_at > oneDayAgo).length;

  const tiles = [
    { label: 'Members', value: String(members.length + 1), sub: 'in your house' },
    { label: 'Active today', value: String(activeCount), sub: 'online now' },
    { label: 'House Lore', value: house.ethos, isText: true },
    { label: 'First Signal', value: '—', sub: 'coming soon' },
    { label: 'This week', value: '—' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: house.primary, paddingTop: insets.top }}>
      <View style={{
        padding: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <View>
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 10.5,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 1.68,
            color: 'rgba(239,231,214,0.75)',
            marginBottom: 4,
          }}>
            Your House
          </Text>
          <Text style={{
            fontFamily: fonts.serif,
            fontSize: 36,
            fontWeight: '300',
            color: colors.khadi,
            lineHeight: 40,
          }}>
            {house.nameEn}
          </Text>
        </View>
        <Mark width={48} color="rgba(239,231,214,0.3)" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {tiles.slice(0, 2).map((tile) => (
            <TouchableOpacity
              key={tile.label}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: 'rgba(239,231,214,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(239,231,214,0.12)',
                padding: 20,
                gap: 4,
              }}
            >
              <Text style={{
                fontFamily: fonts.label,
                fontSize: 10.5,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 1.68,
                color: 'rgba(239,231,214,0.5)',
              }}>
                {tile.label}
              </Text>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 36,
                fontWeight: '300',
                color: colors.khadi,
              }}>
                {tile.value}
              </Text>
              {tile.sub && (
                <Text style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: 'rgba(239,231,214,0.5)',
                }}>
                  {tile.sub}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            backgroundColor: 'rgba(239,231,214,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(239,231,214,0.12)',
            padding: 20,
          }}
        >
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 10.5,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 1.68,
            color: 'rgba(239,231,214,0.5)',
            marginBottom: 12,
          }}>
            House Lore
          </Text>
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 16,
            color: 'rgba(239,231,214,0.75)',
            lineHeight: 24,
          }}>
            {house.ethos}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {tiles.slice(3).map((tile) => (
            <TouchableOpacity
              key={tile.label}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: 'rgba(239,231,214,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(239,231,214,0.12)',
                padding: 20,
                gap: 4,
              }}
            >
              <Text style={{
                fontFamily: fonts.label,
                fontSize: 10.5,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 1.68,
                color: 'rgba(239,231,214,0.5)',
              }}>
                {tile.label}
              </Text>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 28,
                fontWeight: '300',
                color: colors.khadi,
                lineHeight: 32,
              }}>
                {tile.value}
              </Text>
              {tile.sub && (
                <Text style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: 'rgba(239,231,214,0.5)',
                }}>
                  {tile.sub}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
