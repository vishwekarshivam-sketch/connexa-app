import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { Eyebrow } from '@/components/Eyebrow';
import { useAuth } from '@/context/AuthContext';
import { getHouseMembers, ConnexaUser } from '@/lib/supabase';

type Filter = 'All' | 'Your IIT' | 'Cross-IIT' | 'By Branch';
const FILTERS: Filter[] = ['All', 'Your IIT', 'Cross-IIT', 'By Branch'];

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [members, setMembers] = useState<ConnexaUser[]>([]);
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    if (!user?.house) return;
    getHouseMembers(user.house).then(setMembers);
  }, [user?.house]);

  const filtered = members.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'Your IIT') return m.iit === user?.iit;
    if (filter === 'Cross-IIT') return m.iit !== user?.iit;
    return true;
  });

  const sorted =
    filter === 'By Branch'
      ? [...filtered].sort((a, b) => (a.branch ?? '').localeCompare(b.branch ?? ''))
      : filtered;

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{
        padding: 24,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Text style={{
          fontFamily: fonts.serif,
          fontSize: 28,
          fontWeight: '400',
          color: colors.ink,
        }}>
          House-mates
        </Text>
        <Text style={{
          fontFamily: fonts.label,
          fontSize: 10.5,
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: 1.68,
          color: colors.inkWhisper,
        }}>
          {members.length}
        </Text>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 16 }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              activeOpacity={0.85}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                backgroundColor: filter === f ? colors.ink : 'transparent',
                borderWidth: 1,
                borderColor: filter === f ? colors.ink : colors.hairline,
              }}
            >
              <Text style={{
                fontFamily: fonts.label,
                fontSize: 10,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 1.6,
                color: filter === f ? colors.khadi : colors.inkMute,
              }}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Eyebrow style={{ marginBottom: 16 }}>Recently joined</Eyebrow>
        {sorted.map((m) => (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderBottomColor: colors.hairlineSoft,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: colors.lake,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {m.photo_url ? (
                <Image
                  source={{ uri: m.photo_url }}
                  style={{ width: 48, height: 48 }}
                />
              ) : (
                <Text style={{
                  fontFamily: fonts.label,
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.khadi,
                }}>
                  {(m.display_name ?? '?').slice(0, 2).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 18,
                color: colors.ink,
                marginBottom: 2,
              }}>
                {m.display_name ?? 'Anonymous'}
              </Text>
              <Text style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.inkMute,
              }} numberOfLines={1}>
                {[m.iit, m.branch].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {sorted.length === 0 && (
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 15,
            color: colors.inkWhisper,
            marginTop: 32,
          }}>
            No house-mates yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
