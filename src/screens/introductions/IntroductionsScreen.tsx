import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { DISCOVER_PROFILES } from '@/fixtures/discoverProfiles';

export function IntroductionsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.ink }}>
          Introductions
        </Text>
        <Text style={{ 
          fontFamily: fonts.body, 
          fontStyle: 'italic', 
          fontSize: 14, 
          color: colors.inkMute, 
          marginTop: 4 
        }}>
          People who want to meet you.
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
        {DISCOVER_PROFILES.slice(0, 3).map((p) => (
          <View 
            key={p.id} 
            style={{ 
              backgroundColor: colors.khadiLight, 
              borderWidth: 1, 
              borderColor: colors.hairlineSoft, 
              padding: 20, 
              gap: 12 
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: colors.lichen, 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Text style={{ 
                  fontFamily: fonts.label, 
                  fontSize: 12, 
                  color: colors.khadi 
                }}>
                  {p.initials}
                </Text>
              </View>
              <View>
                <Text style={{ 
                  fontFamily: fonts.serif, 
                  fontSize: 18, 
                  color: colors.ink 
                }}>
                  {p.displayName}
                </Text>
                <Text style={{ 
                  fontFamily: fonts.body, 
                  fontSize: 13, 
                  color: colors.inkMute 
                }}>
                  {p.iit} · {p.branch}
                </Text>
              </View>
            </View>
            <Text style={{ 
              fontFamily: fonts.body, 
              fontStyle: 'italic', 
              fontSize: 14, 
              color: colors.inkMute, 
              lineHeight: 21 
            }}>
              "{p.promptAnswer}"
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                activeOpacity={0.85} 
                style={{ 
                  flex: 1, 
                  height: 44, 
                  backgroundColor: colors.ink, 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Text style={{ 
                  fontFamily: fonts.label, 
                  fontSize: 10, 
                  fontWeight: '500', 
                  textTransform: 'uppercase', 
                  letterSpacing: 2, 
                  color: colors.khadi 
                }}>
                  Respond
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.85} 
                style={{ 
                  height: 44, 
                  paddingHorizontal: 20, 
                  borderWidth: 1, 
                  borderColor: colors.hairline, 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Text style={{ 
                  fontFamily: fonts.label, 
                  fontSize: 10, 
                  fontWeight: '500', 
                  textTransform: 'uppercase', 
                  letterSpacing: 2, 
                  color: colors.inkMute 
                }}>
                  Pass
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
