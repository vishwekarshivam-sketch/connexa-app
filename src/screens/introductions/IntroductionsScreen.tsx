import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { useAuth } from '@/context/AuthContext';
import { 
  useReceivedInterests, 
  useResolveInterest, 
  useIntroFeed, 
  useMyPublicIntroduction,
  useToggleIntroReaction
} from '@/hooks/useIntroductions';
import { Skeleton } from '@/components/Skeleton';
import { Icon } from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IntroStackParamList } from '@/types';
import { HOUSES } from '@/fixtures/houseData';
import { haptics } from '@/lib/haptics';

type Tab = 'feed' | 'requests';

export function IntroductionsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<IntroStackParamList>>();
  const { user } = useAuth();
  const house = HOUSES[user?.house || 'tinkerers'];
  
  const [activeTab, setActiveTab] = useState<Tab>('feed');

  const { data: introFeed = [], isLoading: loadingFeed } = useIntroFeed();
  const { data: requests = [], isLoading: loadingRequests } = useReceivedInterests(user?.id || '');
  const { data: myIntro } = useMyPublicIntroduction();
  
  const resolveInterestMutation = useResolveInterest(user?.id || '');
  const toggleReactionMutation = useToggleIntroReaction(); // We'll set the ID when calling

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    haptics.selection();
  };

  const respond = async (id: string, response: 'accept' | 'pass') => {
    haptics.impactLight();
    resolveInterestMutation.mutate({ id, response });
  };

  const handleToggleReaction = (id: string) => {
    haptics.impactLight();
    toggleReactionMutation.mutate(id);
  };

  const handleCreateIntro = () => {
    haptics.impactLight();
    navigation.navigate('IntroCreate');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ padding: 24, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.ink }}>
            Introductions
          </Text>
          <Text style={{
            fontFamily: fonts.bodyItalic,
            fontStyle: 'italic',
            fontSize: 14,
            color: colors.inkMute,
            marginTop: 4,
          }}>
            {activeTab === 'feed' ? 'Meet the batch.' : 'People who want to meet you.'}
          </Text>
        </View>
        
        {/* Add Introduction Button */}
        <TouchableOpacity 
          onPress={handleCreateIntro}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: house.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Icon name="plus" size={24} color={colors.khadi} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: colors.hairlineSoft, marginBottom: 16 }}>
        <TouchableOpacity 
          onPress={() => handleTabChange('feed')}
          style={{ 
            paddingVertical: 12, 
            marginRight: 24, 
            borderBottomWidth: 2, 
            borderBottomColor: activeTab === 'feed' ? house.primary : 'transparent' 
          }}
        >
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 11, 
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: activeTab === 'feed' ? colors.ink : colors.inkWhisper 
          }}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleTabChange('requests')}
          style={{ 
            paddingVertical: 12, 
            borderBottomWidth: 2, 
            borderBottomColor: activeTab === 'requests' ? house.primary : 'transparent' 
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ 
              fontFamily: fonts.label, 
              fontSize: 11, 
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: activeTab === 'requests' ? colors.ink : colors.inkWhisper 
            }}>
              Requests
            </Text>
            {requests.length > 0 && (
              <View style={{ backgroundColor: colors.ember, width: 6, height: 6, borderRadius: 3 }} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, gap: 16 }}>
        {activeTab === 'feed' ? (
          <>
            {/* My Intro Nudge */}
            {!myIntro && !loadingFeed && (
              <TouchableOpacity 
                onPress={handleCreateIntro}
                activeOpacity={0.9}
                style={{
                  backgroundColor: colors.khadiLight,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: colors.inkMute,
                  padding: 24,
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 8
                }}
              >
                <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink, textAlign: 'center' }}>
                  You haven't introduced yourself yet.
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkMute, textAlign: 'center' }}>
                  One post. Your whole batch sees it. It's the best way to meet people.
                </Text>
                <View style={{ backgroundColor: house.primary, paddingHorizontal: 20, height: 40, justifyContent: 'center', marginTop: 8 }}>
                  <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.khadi, textTransform: 'uppercase', letterSpacing: 1.5 }}>Introduce Yourself</Text>
                </View>
              </TouchableOpacity>
            )}

            {loadingFeed ? (
              <FeedSkeleton />
            ) : (
              introFeed.map((intro) => (
                <IntroCard 
                  key={intro.id} 
                  intro={intro} 
                  onPress={() => navigation.navigate('IntroDetail', { introId: intro.id })}
                />
              ))
            )}
            
            {!loadingFeed && introFeed.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.inkWhisper, textAlign: 'center' }}>
                  No one has posted an introduction yet. Be the first?
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {loadingRequests ? (
              <RequestsSkeleton />
            ) : (
              requests.map((p) => (
                <RequestCard key={p.id} request={p} onRespond={respond} house={house} />
              ))
            )}
            
            {!loadingRequests && requests.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.inkWhisper, textAlign: 'center' }}>
                  No requests yet. They show up here when people express interest in Date.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function IntroCard({ intro, onPress }: { intro: any, onPress: () => void }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.95}
      onPress={onPress}
      style={{
        backgroundColor: colors.khadiLight,
        borderWidth: 1,
        borderColor: colors.hairlineSoft,
        overflow: 'hidden'
      }}
    >
      <View style={{ flexDirection: 'row', padding: 16, gap: 16 }}>
        <Image 
          source={{ uri: intro.photo_url }} 
          style={{ width: 80, height: 80, backgroundColor: colors.khadiDeep }} 
        />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink, marginBottom: 2 }}>
            {intro.display_name}
          </Text>
          <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.inkWhisper, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {intro.iit.toUpperCase()} · {intro.branch}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 20 }} numberOfLines={2}>
            {intro.one_liner}
          </Text>
        </View>
      </View>
      
      <View style={{ 
        flexDirection: 'row', 
        borderTopWidth: 1, 
        borderTopColor: colors.hairlineSoft, 
        paddingHorizontal: 16, 
        height: 44, 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="heart" size={14} color={intro.user_has_reacted ? colors.ember : colors.inkWhisper} />
            <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.inkMute }}>{intro.reaction_count}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="messageSquare" size={14} color={colors.inkWhisper} />
            <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.inkMute }}>{intro.comment_count}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.inkMute, textTransform: 'uppercase', letterSpacing: 1 }}>
          View Intro →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function RequestCard({ request: p, onRespond, house }: { request: any, onRespond: (id: string, res: 'accept' | 'pass') => void, house: any }) {
  return (
    <View
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
          width: 44,
          height: 44,
          backgroundColor: colors.khadiDeep,
          overflow: 'hidden',
        }}>
          {p.photo_url ? (
            <Image source={{ uri: p.photo_url }} style={{ width: 44, height: 44 }} />
          ) : (
            <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.label, fontSize: 12, color: colors.inkWhisper }}>
                {(p.display_name ?? '?').slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View>
          <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>
            {p.display_name ?? 'Anonymous'}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkMute }}>
            {[p.iit?.toUpperCase(), p.branch].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onRespond(p.id, 'accept')}
          style={{
            flex: 1,
            height: 44,
            backgroundColor: house.primary,
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
          onPress={() => onRespond(p.id, 'pass')}
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
  );
}

function FeedSkeleton() {
  return (
    <View style={{ gap: 16 }}>
      {[1, 2, 3].map(i => (
        <View key={i} style={{ backgroundColor: colors.khadiLight, borderWidth: 1, borderColor: colors.hairlineSoft, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', padding: 16, gap: 16 }}>
            <Skeleton width={80} height={80} radius={0} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width={120} height={18} />
              <Skeleton width={150} height={12} />
              <Skeleton width="100%" height={32} />
            </View>
          </View>
          <View style={{ height: 44, borderTopWidth: 1, borderTopColor: colors.hairlineSoft, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Skeleton width={80} height={12} />
            <Skeleton width={60} height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

function RequestsSkeleton() {
  return (
    <View style={{ gap: 16 }}>
      {[1, 2].map(i => (
        <View key={i} style={{ backgroundColor: colors.khadiLight, borderWidth: 1, borderColor: colors.hairlineSoft, padding: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={44} height={44} radius={0} />
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
    </View>
  );
}
