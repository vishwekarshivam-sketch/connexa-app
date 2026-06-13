import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { colors, fonts } from '@/tokens';
import { HouseSigil } from '@/components/HouseSigil';
import { House, ConnexaUser } from '@/types';
import { HOUSES } from '@/fixtures/houseData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Contributor {
  userId: string;
  displayName: string;
  initials: string;
  points: number;
}

interface HouseStats {
  slug: House;
  totalPoints: number;
  rank: number;
  memberCount: number;
  topContributors: Contributor[];
}

interface Props {
  houseStats: HouseStats | null;
  isVisible: boolean;
  onClose: () => void;
  onUserPress?: (userId: string) => void;
  onViewAllMembers?: (slug: House) => void;
}

export function HouseDetailSheet({ houseStats, isVisible, onClose, onUserPress, onViewAllMembers }: Props) {
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isVisible ? 1 : 0,
      duration: isVisible ? 520 : 320,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  if (!houseStats && !isVisible) return null;

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const h = houseStats ? HOUSES[houseStats.slug] : null;

  return (
    <>
      {/* Overlay */}
      <Animated.View 
        pointerEvents={isVisible ? 'auto' : 'none'}
        style={[styles.overlay, { opacity }]}
      >
        <TouchableOpacity style={styles.flex} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {houseStats && h && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.sigilHeader}>
              <View style={[styles.halo, { backgroundColor: h.primary }]} />
              <HouseSigil house={houseStats.slug} size="lg" />
            </View>

            <Text style={[styles.nameEn, { color: h.primary }]}>{h.nameEn}</Text>
            <Text style={styles.nameHi}>{h.nameHi}</Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{houseStats.totalPoints.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>#{houseStats.rank}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
              <View style={[styles.stat, styles.noBorder]}>
                <Text style={styles.statValue}>{houseStats.memberCount}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Top Contributors</Text>
            {houseStats.topContributors.map((c, i) => (
              <TouchableOpacity 
                key={c.userId} 
                style={styles.contributorRow}
                onPress={() => onUserPress?.(c.userId)}
              >
                <Text style={styles.contributorRank}>{i + 1}</Text>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{c.initials}</Text>
                </View>
                <Text style={styles.contributorName}>{c.displayName}</Text>
                <Text style={styles.contributorPts}>{c.points.toLocaleString()} pts</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.viewAllBtn}
              onPress={() => onViewAllMembers?.(houseStats.slug)}
            >
              <Text style={styles.viewAllText}>View all members →</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(21, 22, 28, 0.48)',
    zIndex: 200,
  },
  flex: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: colors.khadi,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    zIndex: 201,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: colors.hairline,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sigilHeader: {
    alignItems: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.1,
  },
  nameEn: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 2,
  },
  nameHi: {
    fontFamily: fonts.body,
    fontSize: 14,
    
    color: colors.inkMute,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.hairlineSoft,
  },
  noBorder: {
    borderRightWidth: 0,
  },
  statValue: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.label,
    fontSize: 9.5,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.inkWhisper,
    marginTop: 3,
  },
  sectionLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.inkWhisper,
    marginBottom: 10,
  },
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  contributorRank: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.inkWhisper,
    width: 24,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.khadiDeep,
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontFamily: fonts.label,
    fontSize: 9,
    fontWeight: '500',
    color: colors.inkMute,
  },
  contributorName: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  contributorPts: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkMute,
  },
  viewAllBtn: {
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: fonts.label,
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink,
  },
});
