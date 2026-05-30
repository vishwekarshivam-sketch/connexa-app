import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { DISCOVER_PROFILES } from '@/fixtures/discoverProfiles';

export function DateScreen() {
  const insets = useSafeAreaInsets();
  const profile = DISCOVER_PROFILES[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.ink }}>
          Date
        </Text>
        <Text style={{ 
          fontFamily: fonts.body, 
          fontStyle: 'italic', 
          fontSize: 14, 
          color: colors.inkMute, 
          marginTop: 4 
        }}>
          One person at a time.
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, gap: 24 }}>
        {/* Profile card */}
        <View style={{ 
          backgroundColor: colors.khadiLight, 
          borderWidth: 1, 
          borderColor: colors.hairlineSoft, 
          padding: 24, 
          gap: 16 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ 
              width: 56, 
              height: 56, 
              backgroundColor: colors.lake, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 18, 
                color: colors.khadi 
              }}>
                {profile.initials}
              </Text>
            </View>
            <View>
              <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.ink }}>
                {profile.displayName}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkMute }}>
                {profile.iit} · {profile.branch}
              </Text>
            </View>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: colors.hairlineSoft, paddingTop: 16 }}>
            <Text style={{ 
              fontFamily: fonts.label, 
              fontSize: 9.5, 
              fontWeight: '500', 
              textTransform: 'uppercase', 
              letterSpacing: 1.52, 
              color: colors.inkWhisper, 
              marginBottom: 10 
            }}>
              In their words
            </Text>
            <Text style={{ 
              fontFamily: fonts.body, 
              fontStyle: 'italic', 
              fontSize: 16, 
              color: colors.ink, 
              lineHeight: 24 
            }}>
              "{profile.promptAnswer}"
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={{ 
              backgroundColor: colors.ink, 
              height: 56, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Text style={{ 
              fontFamily: fonts.label, 
              fontSize: 11, 
              fontWeight: '500', 
              textTransform: 'uppercase', 
              letterSpacing: 2.2, 
              color: colors.khadi 
            }}>
              Express interest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={{ 
              height: 56, 
              borderWidth: 1, 
              borderColor: colors.hairline, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Text style={{ 
              fontFamily: fonts.label, 
              fontSize: 11, 
              fontWeight: '500', 
              textTransform: 'uppercase', 
              letterSpacing: 2.2, 
              color: colors.inkMute 
            }}>
              See next
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
