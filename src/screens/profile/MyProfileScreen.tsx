import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { colors, fonts, houseColors } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { Mark } from '@/components/Mark';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyProfile'>;

function Chip({ label }: { label: string }) {
  return (
    <View style={{
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.hairline,
    }}>
      <Text style={{
        fontFamily: fonts.label,
        fontSize: 10.5,
        textTransform: 'uppercase',
        letterSpacing: 1.4,
        color: colors.inkMute,
      }}>
        {label}
      </Text>
    </View>
  );
}

export function MyProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const houseKey = user?.house ?? 'tinkerers';
  const house = HOUSES[houseKey];
  const houseColor = houseColors[houseKey];

  const chips = [
    house.nameEn,
    user?.iit ?? '',
    user?.branch ?? '',
    (user as any)?.hometown ?? '',
  ].filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      {/* Top bar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        paddingHorizontal: 20,
        marginTop: 8,
      }}>
        <TouchableOpacity onPress={navigation.goBack} hitSlop={12}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={12}>
          <Text style={{ fontFamily: fonts.label, fontSize: 16, color: colors.inkMute }}>⚙</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          hitSlop={12}
          style={{ marginLeft: 16 }}
        >
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 10.5,
            textTransform: 'uppercase',
            letterSpacing: 1.4,
            color: colors.ink,
          }}>
            Edit
          </Text>
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
            borderColor: houseColor + '66',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            position: 'relative',
          }}>
            {user?.photo_url ? (
              <Image
                source={{ uri: user.photo_url }}
                style={{ width: 116, height: 116 }}
              />
            ) : (
              <View style={{
                width: 116,
                height: 116,
                backgroundColor: houseColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{
                  fontFamily: fonts.label,
                  fontSize: 36,
                  color: colors.khadi,
                }}>
                  {(user?.display_name ?? '?').slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
            {/* Sigil overlay */}
            <View style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              backgroundColor: colors.khadi,
              padding: 2,
            }}>
              <Mark width={28} color={houseColor} />
            </View>
          </View>

          {/* Name */}
          <Text style={{
            fontFamily: fonts.serif,
            fontSize: 26,
            fontWeight: '400',
            color: colors.ink,
            marginBottom: 12,
            textAlign: 'center',
          }}>
            {user?.display_name ?? '—'}
          </Text>

          {/* Chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
            {chips.map((c) => <Chip key={c} label={c} />)}
          </View>

          {/* House member number */}
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
            color: houseColor,
          }}>
            {house.nameEn} #—
          </Text>

          {/* Founding 100 badge */}
          {user?.founding_100 && (
            <View style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: houseColor + '66',
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
              <Text style={{
                fontFamily: fonts.label,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                color: houseColor,
              }}>
                Founding Member · IITB 2026
              </Text>
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.hairlineSoft,
          paddingVertical: 16,
          marginBottom: 24,
        }}>
          {[
            { label: 'Streak', value: '—' },
            { label: 'Batch rank', value: '—' },
            { label: 'House rank', value: '—' },
          ].map((stat, i) => (
            <View key={stat.label} style={{
              flex: 1,
              alignItems: 'center',
              borderLeftWidth: i > 0 ? 1 : 0,
              borderColor: colors.hairlineSoft,
            }}>
              <Text style={{
                fontFamily: fonts.label,
                fontSize: 9.5,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                color: colors.inkWhisper,
                marginBottom: 4,
              }}>
                {stat.label}
              </Text>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 22,
                color: houseColor,
              }}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Prompt responses */}
        <Text style={{
          fontFamily: fonts.label,
          fontSize: 10.5,
          textTransform: 'uppercase',
          letterSpacing: 1.68,
          color: colors.inkMute,
          marginBottom: 12,
        }}>
          My Responses
        </Text>
        <Text style={{
          fontFamily: fonts.body,
          fontStyle: 'italic',
          fontSize: 14,
          color: colors.inkWhisper,
          marginBottom: 28,
        }}>
          Your responses will appear here after you start answering prompts.
        </Text>

        {/* Invite stats */}
        <View style={{
          borderWidth: 1,
          borderColor: colors.hairlineSoft,
          padding: 16,
          marginBottom: 24,
        }}>
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 10.5,
            textTransform: 'uppercase',
            letterSpacing: 1.68,
            color: colors.inkMute,
            marginBottom: 8,
          }}>
            Invites
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>
            — invited · — retention bonuses earned
          </Text>
        </View>

        {/* Date profile link */}
        <TouchableOpacity hitSlop={8}>
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 10.5,
            textTransform: 'uppercase',
            letterSpacing: 1.4,
            color: colors.inkMute,
            textDecorationLine: 'underline',
          }}>
            My Date profile →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
