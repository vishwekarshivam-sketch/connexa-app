import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '@/tokens';
import { HouseSigil } from '@/components/HouseSigil';
import { House, ConnexaUser } from '@/types';

export interface RankRow {
  userId: string;
  displayName: string;
  house: House;
  totalPoints: number;
  batchRank: number;
  weekPoints: number;
}

interface Props {
  top50: RankRow[];
  currentUserRank: RankRow | null;
  onUserPress?: (userId: string) => void;
}

export function IndividualRankings({ top50, currentUserRank, onUserPress }: Props) {
  const [weekMode, setWeekMode] = useState(false);
  const userInTop50 = top50.some(r => r.userId === currentUserRank?.userId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Individual Rankings</Text>
        <TouchableOpacity onPress={() => setWeekMode(!weekMode)} hitSlop={10}>
          <Text style={styles.toggleText}>
            {weekMode ? "This week ▾" : "All time ▾"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* YOUR row (pinned) — only when not in top 50 */}
      {currentUserRank && !userInTop50 && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.yourRow}
          onPress={() => onUserPress?.(currentUserRank.userId)}
        >
          <Text style={styles.yourLabel}>YOU</Text>
          <View style={styles.rowInner}>
            <Text style={styles.rankNum}>#{currentUserRank.batchRank}</Text>
            <HouseSigil house={currentUserRank.house} size="sm" style={styles.sigil} />
            <Text style={styles.name} numberOfLines={1}>{currentUserRank.displayName}</Text>
            <Text style={styles.pts}>
              {(weekMode ? currentUserRank.weekPoints : currentUserRank.totalPoints).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.houseRank}>#{currentUserRank.batchRank} in {currentUserRank.house}</Text>
            {currentUserRank.weekPoints > 0 && (
              <Text style={styles.deltaPositive}>▲ {currentUserRank.weekPoints.toLocaleString()} this week</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerLabel}>TOP 50</Text>
        <View style={styles.line} />
      </View>

      {top50.map((row) => (
        <TouchableOpacity
          key={row.userId}
          style={[styles.rankRow, row.userId === currentUserRank?.userId && styles.currentUserBg]}
          onPress={() => onUserPress?.(row.userId)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.rankNumSmall,
            row.batchRank === 1 && styles.gold,
            row.batchRank === 2 && styles.silver,
            row.batchRank === 3 && styles.bronze,
          ]}>
            {row.batchRank}
          </Text>
          <HouseSigil house={row.house} size="sm" style={styles.sigil} />
          <Text style={styles.nameSmall} numberOfLines={1}>{row.displayName}</Text>
          <Text style={styles.ptsSmall}>
            {(weekMode ? row.weekPoints : row.totalPoints).toLocaleString()}
          </Text>
          <Text style={[styles.delta, row.weekPoints > 0 && styles.deltaPositive]}>
            ▲ {row.weekPoints.toLocaleString()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontFamily: fonts.label,
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  toggleText: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.inkWhisper,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    paddingBottom: 2,
  },
  yourRow: {
    marginHorizontal: 16,
    backgroundColor: colors.lake,
    padding: 12,
    borderRadius: 0,
  },
  yourLabel: {
    fontFamily: fonts.label,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: 'rgba(239,231,214,0.55)',
    marginBottom: 6,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankNum: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '400',
    color: colors.khadi,
    width: 42,
  },
  sigil: {
    borderWidth: 0,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.khadi,
    flex: 1,
  },
  pts: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.khadi,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,231,214,0.15)',
  },
  houseRank: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    
    color: 'rgba(239,231,214,0.62)',
  },
  deltaPositive: {
    color: '#7fa870',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairlineSoft,
  },
  dividerLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.inkWhisper,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  currentUserBg: {
    backgroundColor: colors.khadiDeep,
  },
  rankNumSmall: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '300',
    width: 32,
    textAlign: 'right',
    color: colors.inkMute,
  },
  gold: { color: '#8B6914' },
  silver: { color: colors.inkMute },
  bronze: { color: colors.ember },
  nameSmall: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    flex: 1,
  },
  ptsSmall: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  delta: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: colors.inkWhisper,
    minWidth: 42,
    textAlign: 'right',
  },
});
