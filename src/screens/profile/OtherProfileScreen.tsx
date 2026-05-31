import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { colors, fonts, houseColors } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { Mark } from '@/components/Mark';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { ConnexaUser, getPublicProfile } from '@/lib/supabase';

type Props = NativeStackScreenProps<ProfileStackParamList, 'OtherProfile'>;

function Chip({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <View style={{
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: muted ? colors.hairlineSoft : colors.hairline,
    }}>
      <Text style={{
        fontFamily: fonts.label,
        fontSize: 10.5,
        textTransform: 'uppercase',
        letterSpacing: 1.4,
        color: muted ? colors.inkWhisper : colors.inkMute,
      }}>
        {label}
      </Text>
    </View>
  );
}

export function OtherProfileScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user: me } = useAuth();
  const { userId } = route.params;
  const [profile, setProfile] = useState<ConnexaUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicProfile(userId).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
        <ActivityIndicator color={colors.inkMute} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
        <View style={{ height: 48, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TouchableOpacity onPress={navigation.goBack} hitSlop={12}>
            <Icon name="chevronLeft" size={24} color={colors.ink} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.body, fontStyle: 'italic', color: colors.inkWhisper }}>Profile not found.</Text>
        </View>
      </View>
    );
  }

  const houseKey = profile.house ?? 'tinkerers';
  const house = HOUSES[houseKey];
  const houseColor = houseColors[houseKey];
  const isSameHouse = !!profile.house && profile.house === me?.house;

  const chips = [
    profile.iit ?? '',
    profile.branch ?? '',
    profile.hometown ?? '',
  ].filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      {/* Top bar */}
      <View style={{ height: 48, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <TouchableOpacity onPress={navigation.goBack} hitSlop={12}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', paddingTop: 24, marginBottom: 24 }}>
          {/* Photo frame */}
          <View style={{
            width: 120,
            height: 120,
            borderWidth: 2,
            borderColor: isSameHouse ? houseColor + '66' : colors.hairline,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            position: 'relative',
          }}>
            {profile.photo_url ? (
              <Image source={{ uri: profile.photo_url }} style={{ width: 116, height: 116 }} />
            ) : (
              <View style={{
                width: 116,
                height: 116,
                backgroundColor: isSameHouse ? houseColor : colors.inkSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 36, color: colors.khadi }}>
                  {(profile.display_name ?? '?').slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              backgroundColor: colors.khadi,
              padding: 2,
            }}>
              <Mark width={28} color={isSameHouse ? houseColor : colors.inkMute} />
            </View>
          </View>

          {/* Name */}
          <Text style={{
            fontFamily: fonts.serif,
            fontSize: 26,
            fontWeight: '400',
            color: colors.ink,
            marginBottom: 6,
            textAlign: 'center',
          }}>
            {profile.display_name ?? '—'}
          </Text>

          {/* Cross-house house indicator */}
          {!isSameHouse && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 }}>
              <Mark width={14} color={colors.inkWhisper} />
              <Text style={{ fontFamily: fonts.label, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.4, color: colors.inkWhisper }}>
                {house.nameEn}
              </Text>
            </View>
          )}

          {/* Chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
            {isSameHouse && <Chip label={house.nameEn} />}
            {chips.map((c) => <Chip key={c} label={c} />)}
          </View>
        </View>

        {/* Prompt responses placeholder */}
        <Text style={{
          fontFamily: fonts.label,
          fontSize: 10.5,
          textTransform: 'uppercase',
          letterSpacing: 1.68,
          color: colors.inkMute,
          marginBottom: 12,
        }}>
          Responses
        </Text>
        <Text style={{
          fontFamily: fonts.body,
          fontStyle: 'italic',
          fontSize: 14,
          color: colors.inkWhisper,
          marginBottom: 28,
        }}>
          No responses yet.
        </Text>

        {/* Same-house chat affordance */}
        {isSameHouse && (
          <TouchableOpacity hitSlop={8}>
            <Text style={{
              fontFamily: fonts.label,
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: 1.4,
              color: colors.inkMute,
              textDecorationLine: 'underline',
            }}>
              Say something in the house chat →
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
