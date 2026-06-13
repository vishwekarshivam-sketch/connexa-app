import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, fonts } from '@/tokens';
import { HouseSigil } from '@/components/HouseSigil';
import { House } from '@/types';
import { HOUSES } from '@/fixtures/houseData';

interface HouseData {
  house: House;
  score: number;
  rank: number;
}

interface Props {
  houses: HouseData[];
  onPress?: (house: House) => void;
}

export function HouseShields({ houses, onPress }: Props) {
  const sorted = [...houses].sort((a, b) => a.rank - b.rank);
  const [first, second, third, fourth] = sorted;

  return (
    <View style={styles.container}>
      {first && <ShieldFirst houseData={first} onPress={onPress} />}
      
      <View style={styles.midRow}>
        {second && <ShieldMid houseData={second} onPress={onPress} deltaToLead={first.score - second.score} />}
        {third && <ShieldMid houseData={third} onPress={onPress} deltaToLead={first.score - third.score} />}
      </View>

      {fourth && <ShieldFourth houseData={fourth} onPress={onPress} deltaToLead={first.score - fourth.score} />}
    </View>
  );
}

function ShieldFirst({ houseData, onPress }: { houseData: HouseData; onPress?: (h: House) => void }) {
  const house = HOUSES[houseData.house];
  return (
    <TouchableOpacity
      onPress={() => onPress?.(houseData.house)}
      activeOpacity={0.85}
      style={styles.firstCard}
    >
      <View style={styles.rankOrn}>
        <Text style={styles.ornText}>· · ·</Text>
        <View style={styles.ornLine} />
        <Text style={styles.ornText}>LEADING</Text>
      </View>

      <View style={styles.firstBody}>
        <View style={styles.sigilWrap}>
          <View style={[styles.halo, { backgroundColor: house.primary }]} />
          <HouseSigil house={houseData.house} size="lg" />
        </View>

        <View style={styles.info}>
          <Text style={[styles.nameEn, { color: house.primary }]}>{house.nameEn}</Text>
          <Text style={styles.nameHi}>{house.nameHi}</Text>
          <Text style={[styles.points, { color: house.primary }]}>
            {houseData.score.toLocaleString()}
          </Text>
          <Text style={styles.status}>Leading</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ShieldMid({ houseData, onPress, deltaToLead }: { houseData: HouseData; onPress?: (h: House) => void; deltaToLead: number }) {
  const house = HOUSES[houseData.house];
  return (
    <TouchableOpacity
      onPress={() => onPress?.(houseData.house)}
      activeOpacity={0.85}
      style={styles.midCard}
    >
      <Text style={[styles.midRank, { color: house.primary }]}>{houseData.rank}</Text>
      <HouseSigil house={houseData.house} size="md" />
      <Text style={styles.midName}>{house.nameEn}</Text>
      <Text style={styles.midPoints}>{houseData.score.toLocaleString()} pts</Text>
      <Text style={styles.midDelta}>−{deltaToLead.toLocaleString()} to lead</Text>
    </TouchableOpacity>
  );
}

function ShieldFourth({ houseData, onPress, deltaToLead }: { houseData: HouseData; onPress?: (h: House) => void; deltaToLead: number }) {
  const house = HOUSES[houseData.house];
  return (
    <TouchableOpacity
      onPress={() => onPress?.(houseData.house)}
      activeOpacity={0.85}
      style={styles.fourthCard}
    >
      <Text style={styles.fourthRank}>4</Text>
      <HouseSigil house={houseData.house} size="md" />
      <View style={styles.fourthInfo}>
        <Text style={styles.fourthName}>{house.nameEn}</Text>
        <Text style={styles.fourthHindi}>{house.nameHi}</Text>
      </View>
      <View style={styles.fourthRight}>
        <Text style={styles.fourthPoints}>{houseData.score.toLocaleString()} pts</Text>
        <Text style={styles.fourthDelta}>−{deltaToLead.toLocaleString()} to lead</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  firstCard: {
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
    padding: 20,
    marginBottom: 10,
  },
  rankOrn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ornText: {
    fontFamily: fonts.label,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.2,
    color: colors.inkWhisper,
  },
  ornLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairlineSoft,
  },
  firstBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  sigilWrap: {
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    inset: -8,
    borderRadius: 40,
    opacity: 0.1,
  },
  info: {
    flex: 1,
  },
  nameEn: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 24,
    marginBottom: 2,
  },
  nameHi: {
    fontFamily: fonts.body,
    fontSize: 12,
    
    color: colors.inkMute,
    marginBottom: 10,
  },
  points: {
    fontFamily: fonts.serif,
    fontSize: 28,
    lineHeight: 28,
    marginBottom: 4,
  },
  status: {
    fontFamily: fonts.label,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2,
    color: colors.lichen,
    textTransform: 'uppercase',
  },
  midRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  midCard: {
    flex: 1,
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
    padding: 14,
  },
  midRank: {
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 20,
    marginBottom: 10,
  },
  midName: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.ink,
    marginTop: 8,
    marginBottom: 4,
  },
  midPoints: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  midDelta: {
    fontFamily: fonts.body,
    fontSize: 12,
    
    color: colors.inkMute,
  },
  fourthCard: {
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  fourthRank: {
    fontFamily: fonts.serif,
    fontSize: 22,
    fontWeight: '300',
    color: colors.inkMute,
    width: 24,
    textAlign: 'center',
  },
  fourthInfo: {
    flex: 1,
  },
  fourthName: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  fourthHindi: {
    fontFamily: fonts.body,
    fontSize: 12,
    
    color: colors.inkMute,
  },
  fourthRight: {
    alignItems: 'flex-end',
  },
  fourthPoints: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  fourthDelta: {
    fontFamily: fonts.body,
    fontSize: 12,
    
    color: colors.inkMute,
  },
});
