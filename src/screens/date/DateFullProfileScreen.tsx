import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList, DateProfile, Interest, Match } from '@/types';
import { colors, fonts } from '@/tokens';
import { getDateProfile, getMyInterests, expressInterest, getMyMatches } from '@/lib/supabase';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import Animated from 'react-native-reanimated';

type Props = NativeStackScreenProps<DateStackParamList, 'DateFullProfile'>;

const { width } = Dimensions.get('window');

export function DateFullProfileScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profileId } = route.params;
  
  const [profile, setProfile] = useState<DateProfile | null>(null);
  const [myInterests, setMyInterests] = useState<Interest[]>([]);
  const [myMatches, setMyMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [p, interests, matches] = await Promise.all([
        getDateProfile(profileId),
        getMyInterests(user.id),
        getMyMatches(user.id)
      ]);
      setProfile(p);
      setMyInterests(interests);
      setMyMatches(matches);
      setLoading(false);
    }
    load();
  }, [profileId, user]);

  const handleInterest = async () => {
    if (!user || !profile) return;

    // If already matched, just open chat
    const existingMatch = myMatches.find(m => m.user_a === profile.user_id || m.user_b === profile.user_id);
    if (existingMatch) {
      navigation.navigate('DateDM', { 
        threadId: existingMatch.id, 
        otherUserName: profile.display_name 
      });
      return;
    }

    if (myInterests.length >= 3) {
      alert("You've got 3 open interests. That's on purpose — it keeps this considered. Withdraw one to add another.");
      return;
    }

    setActing(true);
    const { data, error } = await expressInterest(user.id, profile.user_id);
    setActing(false);

    if (data) {
      if (data.state === 'mutual' && data.match_id) {
        // It's a match!
        navigation.navigate('DateDM', { 
          threadId: data.match_id, 
          otherUserName: profile.display_name 
        });
      } else {
        setMyInterests([...myInterests, data]);
      }
    } else if (error) {
      alert(error);
    }
  };

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const alreadyInterested = myInterests.some(i => i.to_user === profile.user_id);
  const isMatch = myMatches.some(m => m.user_a === profile.user_id || m.user_b === profile.user_id);
  const photos = profile.photos || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Photos Carousel */}
        <View style={styles.photoContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setPhotoIndex(Math.round(x / width));
            }}
            scrollEventThrottle={16}
          >
            {photos.length > 0 ? photos.map((p, i) => (
              <Animated.Image 
                key={p.id} 
                source={{ uri: p.url }} 
                style={styles.heroImage} 
                sharedTransitionTag={i === 0 ? `profile-photo-${profile.user_id}` : undefined}
              />
            )) : (
              <Animated.View 
                style={[styles.heroImage, { backgroundColor: colors.khadiDeep }]} 
                sharedTransitionTag={`profile-photo-${profile.user_id}`}
              />
            )}
          </ScrollView>
          
          {photos.length > 1 && (
            <View style={styles.pagination}>
              {photos.map((_, i) => (
                <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.backButton, { top: insets.top + 16 }]}
          >
            <Icon name="chevronLeft" size={24} color={colors.khadi} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{profile.display_name}</Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}><Text style={styles.chipText}>{profile.iit.toUpperCase()}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{profile.branch}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{profile.year}</Text></View>
          </View>

          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {profile.prompts?.map((p) => (
            <View key={p.id} style={styles.prompt}>
              <Text style={styles.promptLabel}>"{p.prompt_id}"</Text>
              <Text style={styles.promptText}>{p.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.slotInfo}>
          <Text style={styles.slotText}>
            {isMatch ? 'Connected' : `${myInterests.length} of 3 open`}
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.interestButton, 
            (alreadyInterested || isMatch) && styles.interestedButton,
            myInterests.length >= 3 && !alreadyInterested && !isMatch && styles.disabledButton
          ]}
          onPress={handleInterest}
          disabled={acting || (alreadyInterested && !isMatch)}
        >
          {acting ? (
            <ActivityIndicator color={colors.khadi} />
          ) : (
            <Text style={[styles.interestButtonText, (alreadyInterested || isMatch) && styles.interestedButtonText]}>
              {isMatch ? 'Open chat →' : alreadyInterested ? '✓ Interested' : 'I\'m interested →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoContainer: { width: width, aspectRatio: 4/5, position: 'relative' },
  heroImage: { width: width, height: '100%' },
  pagination: { 
    position: 'absolute', 
    bottom: 16, 
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 6 
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(239,231,214,0.4)' },
  dotActive: { backgroundColor: colors.khadi },
  backButton: { 
    position: 'absolute', 
    left: 20, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(21,22,28,0.3)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  info: { padding: 32 },
  name: { fontFamily: fonts.serif, fontSize: 36, color: colors.ink, marginBottom: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  chip: { borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontFamily: fonts.label, fontSize: 11, color: colors.inkMute, textTransform: 'uppercase' },
  bio: { 
    fontFamily: fonts.body, 
    fontSize: 18, 
    color: colors.ink, 
    lineHeight: 26, 
    marginBottom: 40 
  },
  prompt: { 
    borderTopWidth: 1, 
    borderTopColor: colors.hairlineSoft, 
    paddingTop: 24, 
    marginBottom: 40 
  },
  promptLabel: { 
    fontFamily: fonts.bodyItalic, 
    fontSize: 14, 
    color: colors.inkWhisper, 
    marginBottom: 8 
  },
  promptText: { 
    fontFamily: fonts.body, 
    fontSize: 18, 
    color: colors.ink, 
    lineHeight: 26 
  },
  actionBar: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: colors.khadi, 
    borderTopWidth: 1, 
    borderTopColor: colors.hairlineSoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16
  },
  slotInfo: { flex: 1 },
  slotText: { 
    fontFamily: fonts.label, 
    fontSize: 11, 
    textTransform: 'uppercase', 
    letterSpacing: 1.2,
    color: colors.inkWhisper 
  },
  interestButton: { 
    backgroundColor: colors.ember, 
    paddingHorizontal: 24, 
    height: 52, 
    justifyContent: 'center', 
    alignItems: 'center',
    minWidth: 160
  },
  interestedButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.ember },
  disabledButton: { backgroundColor: colors.inkWhisper },
  interestButtonText: { 
    fontFamily: fonts.label, 
    fontSize: 12, 
    textTransform: 'uppercase', 
    letterSpacing: 2, 
    color: colors.khadi 
  },
  interestedButtonText: { color: colors.ember }
});
