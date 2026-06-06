import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList, DateProfile } from '@/types';
import { colors, fonts } from '@/tokens';
import { getDateFeed } from '@/lib/supabase';
import { Icon } from '@/components/Icon';
import { Skeleton } from '@/components/Skeleton';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

type Props = NativeStackScreenProps<DateStackParamList, 'DateFeed'>;

export function DateFeedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [feed, setFeed] = useState<DateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDateFeed().then(data => {
      setFeed(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <DateFeedSkeleton insets={insets} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.iconButton} 
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>People you might click with</Text>
        <Pressable 
          style={styles.iconButton} 
          onPress={() => navigation.navigate('DateSettings')}
          hitSlop={12}
        >
          <Icon name="chevronRight" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {feed.map((profile) => (
          <ProfileCard 
            key={profile.user_id} 
            profile={profile} 
            onPress={() => navigation.navigate('DateFullProfile', { profileId: profile.user_id })} 
          />
        ))}

        {feed.length > 0 ? (
          <View style={styles.exhausted}>
            <Text style={styles.exhaustedTitle}>That's everyone for now.</Text>
            <Text style={styles.exhaustedBody}>
              We'd rather show you a few good people than an endless list. Check back tomorrow.
            </Text>
          </View>
        ) : (
          <View style={styles.exhausted}>
            <Text style={styles.exhaustedTitle}>No one here yet.</Text>
            <Text style={styles.exhaustedBody}>
              It's still early. More people are joining every day.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ProfileCard({ profile, onPress }: { profile: DateProfile, onPress: () => void }) {
  const heroPhoto = profile.photos?.find(p => p.position === 0) || profile.photos?.[0];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable 
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        {heroPhoto ? (
          <Animated.Image 
            source={{ uri: heroPhoto.url }} 
            style={styles.heroImage} 
            sharedTransitionTag={`profile-photo-${profile.user_id}`}
          />
        ) : (
          <Animated.View 
            style={[styles.heroImage, { backgroundColor: colors.khadiDeep, alignItems: 'center', justifyContent: 'center' }]}
            sharedTransitionTag={`profile-photo-${profile.user_id}`}
          >
            <Text style={{ fontFamily: fonts.serif, fontSize: 48, color: colors.khadi }}>
              {profile.display_name.slice(0, 1)}
            </Text>
          </Animated.View>
        )}

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.display_name}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{profile.iit.toUpperCase()} · {profile.year}</Text>
            </View>
          </View>
          <Text style={styles.branch}>{profile.branch}</Text>
          
          {profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
          )}

          {profile.prompts && profile.prompts.length > 0 && (
            <View style={styles.promptPreview}>
              <Text style={styles.promptText} numberOfLines={2}>
                "{profile.prompts[0].text}"
              </Text>
              <Text style={styles.readMore}>Read →</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function DateFeedSkeleton({ insets }: { insets: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Skeleton width={160} height={12} />
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {[1, 2].map(i => (
          <View key={i} style={styles.card}>
            <Skeleton width="100%" height={undefined} style={{ aspectRatio: 4/5 }} radius={0} />
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Skeleton width={120} height={24} />
                <Skeleton width={80} height={20} />
              </View>
              <Skeleton width={100} height={12} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="80%" height={16} style={{ marginBottom: 16 }} />
              
              <View style={styles.promptPreview}>
                <Skeleton width="70%" height={14} />
                <Skeleton width={40} height={14} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft
  },
  headerTitle: {
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.inkWhisper
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingVertical: 16 },
  card: {
    backgroundColor: colors.khadi,
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft
  },
  heroImage: { width: '100%', aspectRatio: 4/5 },
  cardInfo: { padding: 24 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  chip: { borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontFamily: fonts.label, fontSize: 10, color: colors.inkMute },
  branch: { fontFamily: fonts.label, fontSize: 12, color: colors.inkWhisper, marginBottom: 16, textTransform: 'uppercase' },
  bio: { fontFamily: fonts.body, fontSize: 16, color: colors.ink, lineHeight: 22, marginBottom: 16 },
  promptPreview: { borderTopWidth: 1, borderTopColor: colors.hairlineSoft, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  promptText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.ink, flex: 1, marginRight: 16 },
  readMore: { fontFamily: fonts.label, fontSize: 12, color: colors.inkMute },
  exhausted: { padding: 48, alignItems: 'center' },
  exhaustedTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink, marginBottom: 12, textAlign: 'center' },
  exhaustedBody: { fontFamily: fonts.body, fontSize: 16, color: colors.inkMute, textAlign: 'center', lineHeight: 24 }
});
