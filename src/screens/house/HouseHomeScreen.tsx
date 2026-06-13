import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { Mark } from '@/components/Mark';
import { useAuth } from '@/context/AuthContext';
import { getHouseMembers, ConnexaUser } from '@/lib/supabase';
import { ProfileStackParamList } from '@/types';
import { useHouseHome } from '@/hooks/useHouseHome';

import { useUIStore } from '@/stores/uiStore';
import { useNotifications } from '@/hooks/useNotifications';
import { Icon } from '@/components/Icon';
import { Skeleton } from '@/components/Skeleton';
import { AmbientBackground } from '@/components/AmbientBackground';

type Props = NativeStackScreenProps<ProfileStackParamList, 'HouseHome'>;

export function HouseHomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: homeData, isLoading: loadingHome } = useHouseHome(user?.house || '');
  const setNotificationSheetOpen = useUIStore((state) => state.setNotificationSheetOpen);
  const { unreadCount } = useNotifications();

  const houseKey = user?.house ?? 'tinkerers';
  const house = HOUSES[houseKey];

  const todayPrompt = homeData?.today_prompt;
  const userRank = homeData?.user_rank;
  const houseRank = homeData?.house_rank;
  const streak = homeData?.streak;

  if (loadingHome) {
    return <HouseHomeSkeleton houseColor={house.primary} insets={insets} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: house.primary, paddingTop: insets.top }]}>
      <AmbientBackground color={house.primary} />
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            TODAY IN {house.nameEn}
          </Text>
          <Text style={styles.houseName}>
            {house.nameEn}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MyProfile')}
            hitSlop={12}
            activeOpacity={0.75}
          >
            <Icon name="user" size={24} color={colors.khadi} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setNotificationSheetOpen(true)} 
            hitSlop={12} 
            style={styles.bellButton}
          >
            <Icon name="bell" size={24} color={colors.khadi} />
            {unreadCount > 0 && <View style={[styles.unreadDot, { borderColor: house.primary }]} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {/* Tile 1: Today's Prompt */}
        <TouchableOpacity 
          style={styles.tileLarge} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('PromptResponse')}
        >
          <Text style={styles.tileLabel}>TODAY'S PROMPT</Text>
          {todayPrompt ? (
            <>
              <Text style={styles.promptText} numberOfLines={3}>{todayPrompt.text}</Text>
              <Text style={styles.attribution}>from {todayPrompt.leader_name}</Text>
              <View style={styles.respondButton}>
                <Text style={styles.respondText}>Respond</Text>
              </View>
            </>
          ) : (
            <Text style={styles.promptText}>No prompt today. Check back tomorrow.</Text>
          )}
        </TouchableOpacity>

        {/* Tile 2 & 3: Streak and House Rank */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.tileMedium} activeOpacity={0.85}>
            <Text style={styles.tileLabel}>STREAK</Text>
            <Text style={styles.tileValue}>{streak || '—'}</Text>
            <Text style={styles.tileSub}>days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileMedium} activeOpacity={0.85}>
            <Text style={styles.tileLabel}>HOUSE RANK</Text>
            <Text style={styles.tileValue}>{houseRank || '—'}</Text>
            <Text style={styles.tileSub}>in batch</Text>
          </TouchableOpacity>
        </View>

        {/* Tile 4 & 5: Your Rank and Sigil of Day (Placeholder) */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.tileMedium} activeOpacity={0.85}>
            <Text style={styles.tileLabel}>YOUR RANK</Text>
            <Text style={styles.tileValue}>#{userRank || '—'}</Text>
            <Text style={styles.tileSub}>in batch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileMedium} activeOpacity={0.85}>
            <Text style={styles.tileLabel}>SIGIL OF DAY</Text>
            <View style={styles.sigilPlaceholder}>
              <Icon name="user" size={24} color={colors.khadi} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tile 6: House Chat Preview */}
        <TouchableOpacity 
          style={styles.tileWide} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('HouseChat')}
        >
          <Text style={styles.tileLabel}>HOUSE CHAT</Text>
          <Text style={styles.chatPreview}>Start the conversation →</Text>
        </TouchableOpacity>

        {/* Tile 7: Discover */}
        <TouchableOpacity 
          style={styles.tileWide} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Discover')}
        >
          <Text style={styles.tileLabel}>HOUSE-MATES</Text>
          <Text style={styles.chatPreview}>Discover your tribe →</Text>
        </TouchableOpacity>

        {/* Tile 8: House Lore */}
        <TouchableOpacity 
          style={styles.tileWide} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Lore')}
        >
          <Text style={styles.tileLabel}>FROM THE ARCHIVES</Text>
          <Text style={styles.lorePreview} numberOfLines={2}>"{house.ethos}"</Text>
        </TouchableOpacity>

        {/* Tile 9: Invites */}
        <TouchableOpacity 
          style={styles.tileWide} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Invites')}
        >
          <Text style={styles.tileLabel}>GROW YOUR HOUSE</Text>
          <Text style={styles.chatPreview}>
            {homeData?.invite_count > 0 
              ? `${homeData.invite_count} invited so far →` 
              : 'Invite your friends →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function HouseHomeSkeleton({ houseColor, insets }: { houseColor: string, insets: any }) {
  const skeletonColor = 'rgba(239,231,214,0.12)';
  return (
    <View style={[styles.container, { backgroundColor: houseColor, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Skeleton width={120} height={12} style={{ marginBottom: 8, opacity: 0.3 }} />
          <Skeleton width={200} height={40} style={{ opacity: 0.3 }} />
        </View>
      </View>

      <View style={styles.grid}>
        <Skeleton width="100%" height={200} radius={16} style={{ backgroundColor: skeletonColor }} />
        <View style={styles.row}>
          <Skeleton height={120} radius={16} style={{ flex: 1, backgroundColor: skeletonColor }} />
          <Skeleton height={120} radius={16} style={{ flex: 1, backgroundColor: skeletonColor }} />
        </View>
        <View style={styles.row}>
          <Skeleton height={120} radius={16} style={{ flex: 1, backgroundColor: skeletonColor }} />
          <Skeleton height={120} radius={16} style={{ flex: 1, backgroundColor: skeletonColor }} />
        </View>
        <Skeleton width="100%" height={80} radius={16} style={{ backgroundColor: skeletonColor }} />
        <Skeleton width="100%" height={80} radius={16} style={{ backgroundColor: skeletonColor }} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: fonts.label,
    fontSize: 10.5,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.68,
    color: 'rgba(239,231,214,0.75)',
    marginBottom: 4,
  },
  houseName: {
    fontFamily: fonts.serif,
    fontSize: 36,
    fontWeight: '300',
    color: colors.khadi,
    lineHeight: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    position: 'relative',
    marginLeft: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ember,
    borderWidth: 2,
  },
  grid: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  tileLarge: {
    backgroundColor: 'rgba(239,231,214,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,231,214,0.12)',
    padding: 24,
    borderRadius: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  tileMedium: {
    flex: 1,
    backgroundColor: 'rgba(239,231,214,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,231,214,0.12)',
    padding: 20,
    borderRadius: 16,
    gap: 4,
  },
  tileWide: {
    backgroundColor: 'rgba(239,231,214,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239,231,214,0.12)',
    padding: 20,
    borderRadius: 16,
  },
  tileLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'rgba(239,231,214,0.5)',
    marginBottom: 8,
  },
  tileValue: {
    fontFamily: fonts.serif,
    fontSize: 36,
    fontWeight: '300',
    color: colors.khadi,
  },
  tileSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(239,231,214,0.5)',
  },
  promptText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.khadi,
    lineHeight: 26,
    marginBottom: 8,
  },
  attribution: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: 'rgba(239,231,214,0.5)',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  respondButton: {
    backgroundColor: colors.khadi,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 4,
  },
  respondText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chatPreview: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.khadi,
  },
  lorePreview: {
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    fontStyle: 'italic',
    color: 'rgba(239,231,214,0.75)',
    lineHeight: 22,
  },
  sigilPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239,231,214,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  }
});
