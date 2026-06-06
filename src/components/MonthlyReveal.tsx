import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CeremonialReveal, CeremonyStage } from '@/components/CeremonialReveal';
import { colors, fonts } from '@/tokens';
import { Mark } from '@/components/Mark';
import { HOUSES } from '@/fixtures/houseData';
import { House } from '@/types';
import { HouseSigil } from '@/components/HouseSigil';

interface Props {
  winnerHouse: House;
  monthYear: string;
  onComplete: () => void;
}

export function MonthlyReveal({ winnerHouse, monthYear, onComplete }: Props) {
  const winner = HOUSES[winnerHouse];

  const stages: CeremonyStage[] = [
    {
      id: 'mark',
      durationMs: 1500,
      transition: 'fade',
      backgroundColor: '#000000',
      content: <Mark width={60} color={colors.khadi} />
    },
    {
      id: 'month',
      durationMs: 2000,
      transition: 'rise',
      backgroundColor: '#000000',
      content: <Text style={styles.monthText}>{monthYear}</Text>
    },
    {
      id: 'shields',
      durationMs: 2500,
      transition: 'fade',
      backgroundColor: '#000000',
      content: (
        <View style={styles.shieldRow}>
          {Object.keys(HOUSES).map((h, i) => (
            <View key={h} style={{ opacity: 0.4 + (i * 0.2) }}>
              <HouseSigil house={h as House} size="sm" />
            </View>
          ))}
        </View>
      )
    },
    {
      id: 'winner',
      durationMs: 2000,
      transition: 'rise',
      backgroundColor: winner.primary,
      content: (
        <View style={styles.centered}>
          <HouseSigil house={winnerHouse} size="xl" />
          <Text style={styles.winnerName}>{winner.nameEn}</Text>
          <Text style={styles.rankLabel}>MONTHLY CHAMPIONS</Text>
        </View>
      )
    },
    {
      id: 'reveal',
      durationMs: 0,
      transition: 'fade',
      backgroundColor: colors.khadi,
      content: null // CeremonialReveal will end and call onComplete
    }
  ];

  return (
    <CeremonialReveal 
      stages={stages} 
      onComplete={onComplete} 
      skippable={true}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.khadi,
  },
  shieldRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  winnerName: {
    fontFamily: fonts.serif,
    fontSize: 48,
    color: colors.khadi,
    marginTop: 24,
    textAlign: 'center',
  },
  rankLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: 'rgba(239,231,214,0.8)',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 16,
  }
});
