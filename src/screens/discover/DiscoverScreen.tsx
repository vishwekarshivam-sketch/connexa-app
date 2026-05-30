import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { DISCOVER_PROFILES } from '@/fixtures/discoverProfiles';
import { Eyebrow } from '@/components/Eyebrow';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{ 
        padding: 24, 
        paddingBottom: 12, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 28, 
          fontWeight: '400', 
          color: colors.ink 
        }}>
          House-mates
        </Text>
        <Text style={{ 
          fontFamily: fonts.label, 
          fontSize: 10.5, 
          fontWeight: '500', 
          textTransform: 'uppercase', 
          letterSpacing: 1.68, 
          color: colors.inkWhisper 
        }}>
          67
        </Text>
      </View>

      {/* Filter chips */}
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 16 }}
        >
          {['All', 'Your IIT', 'Cross-IIT', 'By Branch'].map((f, i) => (
            <TouchableOpacity 
              key={f} 
              activeOpacity={0.85} 
              style={{
                paddingHorizontal: 14, 
                paddingVertical: 7,
                backgroundColor: i === 0 ? colors.ink : 'transparent',
                borderWidth: 1, 
                borderColor: i === 0 ? colors.ink : colors.hairline,
              }}
            >
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 10, 
                fontWeight: '500', 
                textTransform: 'uppercase', 
                letterSpacing: 1.6, 
                color: i === 0 ? colors.khadi : colors.inkMute 
              }}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Eyebrow style={{ marginBottom: 16 }}>Recently active</Eyebrow>
        {DISCOVER_PROFILES.map((p) => (
          <TouchableOpacity 
            key={p.id} 
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
              justifyContent: 'center'
            }}>
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 14, 
                fontWeight: '500', 
                color: colors.khadi 
              }}>
                {p.initials}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 9.5, 
                fontWeight: '500', 
                textTransform: 'uppercase', 
                letterSpacing: 1.52, 
                color: colors.inkWhisper, 
                marginBottom: 2 
              }}>
                Tinkerer #{p.memberNo}
              </Text>
              <Text style={{ 
                fontFamily: fonts.serif, 
                fontSize: 18, 
                color: colors.ink, 
                marginBottom: 2 
              }}>
                {p.displayName}
              </Text>
              <Text style={{ 
                fontFamily: fonts.body, 
                fontSize: 13, 
                color: colors.inkMute 
              }} numberOfLines={1}>
                {p.iit} · {p.branch}
              </Text>
              <Text style={{ 
                fontFamily: fonts.body, 
                fontStyle: 'italic', 
                fontSize: 13, 
                color: colors.inkMute, 
                marginTop: 4 
              }} numberOfLines={2}>
                "{p.promptAnswer}"
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
