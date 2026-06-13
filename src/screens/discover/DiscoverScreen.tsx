import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Eyebrow } from '@/components/Eyebrow';
import { useAuth } from '@/context/AuthContext';
import { useHouseMembers } from '@/hooks/useHouseMembers';
import { Skeleton } from '@/components/Skeleton';
import { HOUSES } from '@/fixtures/houseData';

type Filter = 'All' | 'Your IIT' | 'Cross-IIT' | 'By Branch';
const FILTERS: Filter[] = ['All', 'Your IIT', 'Cross-IIT', 'By Branch'];

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const house = HOUSES[user?.house || 'tinkerers'];
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { data: members = [], isLoading } = useHouseMembers(user?.house || 'tinkerers');
  const [filter, setFilter] = useState<Filter>('All');

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

  if (isLoading) {
    return <DiscoverSkeleton insets={insets} />;
  }

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
            onPress={() => navigation.navigate('OtherProfile', { userId: m.id })}
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
              backgroundColor: house.primary,
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
            fontFamily: fonts.bodyItalic,
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

function DiscoverSkeleton({ insets }: { insets: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Skeleton width={180} height={32} style={{ marginBottom: 8 }} />
      </View>
      <View style={{ paddingHorizontal: 24, marginBottom: 24, flexDirection: 'row', gap: 8 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} width={80} height={32} radius={4} />
        ))}
      </View>
      <View style={{ paddingHorizontal: 24 }}>
        <Skeleton width={120} height={14} style={{ marginBottom: 20 }} />
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={{ flexDirection: 'row', gap: 14, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.hairlineSoft }}>
            <Skeleton width={48} height={48} radius={0} />
            <View style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={12} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

