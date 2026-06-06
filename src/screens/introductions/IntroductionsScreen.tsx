import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { useAuth } from '@/context/AuthContext';
import { useMyIntroductions, useRespondToIntroduction } from '@/hooks/useIntroductions';
import { Skeleton } from '@/components/Skeleton';

export function IntroductionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: intros = [], isLoading } = useMyIntroductions(user?.id || '');
  const respondMutation = useRespondToIntroduction(user?.id || '');

  const respond = async (id: string, response: 'accepted' | 'passed') => {
    respondMutation.mutate({ id, response });
  };

  if (isLoading) {
    return <IntroductionsSkeleton insets={insets} />;
  }

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
          marginTop: 4,
        }}>
          People who want to meet you.
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
        {intros.map((p) => (
          <View
            key={p.id}
            style={{
              backgroundColor: colors.khadiLight,
              borderWidth: 1,
              borderColor: colors.hairlineSoft,
              padding: 20,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: colors.lichen,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {p.photo_url ? (
                  <Image source={{ uri: p.photo_url }} style={{ width: 40, height: 40 }} />
                ) : (
                  <Text style={{ fontFamily: fonts.label, fontSize: 12, color: colors.khadi }}>
                    {(p.display_name ?? '?').slice(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
              <View>
                <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>
                  {p.display_name ?? 'Anonymous'}
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkMute }}>
                  {[p.iit, p.branch].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => respond(p.id, 'accepted')}
                style={{
                  flex: 1,
                  height: 44,
                  backgroundColor: colors.ink,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontFamily: fonts.label,
                  fontSize: 10,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: colors.khadi,
                }}>
                  Respond
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => respond(p.id, 'passed')}
                style={{
                  height: 44,
                  paddingHorizontal: 20,
                  borderWidth: 1,
                  borderColor: colors.hairline,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontFamily: fonts.label,
                  fontSize: 10,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: colors.inkMute,
                }}>
                  Pass
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {intros.length === 0 && (
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 15,
            color: colors.inkWhisper,
            marginTop: 32,
          }}>
            No introductions yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function IntroductionsSkeleton({ insets }: { insets: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Skeleton width={180} height={32} style={{ marginBottom: 8 }} />
        <Skeleton width={200} height={14} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
        {[1, 2, 3].map(i => (
          <View key={i} style={{ backgroundColor: colors.khadiLight, borderWidth: 1, borderColor: colors.hairlineSoft, padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Skeleton width={40} height={40} radius={0} />
              <View style={{ gap: 4 }}>
                <Skeleton width={120} height={18} />
                <Skeleton width={150} height={12} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Skeleton width="100%" height={44} style={{ flex: 1 }} />
              <Skeleton width={80} height={44} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
