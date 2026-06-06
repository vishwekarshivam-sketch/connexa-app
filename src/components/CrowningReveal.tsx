import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CeremonialReveal, CeremonyStage } from '@/components/CeremonialReveal';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { House } from '@/types';

interface Props {
  winnerHouse: House;
  onComplete: () => void;
}

export function CrowningReveal({ winnerHouse, onComplete }: Props) {
  const winner = HOUSES[winnerHouse];

  const stages: CeremonyStage[] = [
    {
      id: 'intro',
      durationMs: 2000,
      transition: 'fade',
      backgroundColor: '#000000',
      content: (
        <Text style={styles.lightText}>The season concludes.</Text>
      )
    },
    {
      id: 'build',
      durationMs: 2500,
      transition: 'rise',
      backgroundColor: '#000000',
      content: (
        <View style={styles.centered}>
           <Text style={styles.label}>SEASON 1</Text>
           <Text style={styles.heroTitle}>The Crowning</Text>
        </View>
      )
    },
    {
      id: 'reveal',
      durationMs: 4000,
      transition: 'rise',
      backgroundColor: winner.primary,
      content: (
        <View style={styles.centered}>
          <Text style={styles.winnerLabel}>CHAMPIONS</Text>
          <Text style={styles.winnerName}>{winner.nameEn}</Text>
          <Text style={styles.winnerEthos}>{winner.ethos}</Text>
        </View>
      )
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
  lightText: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.khadi,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.khadi,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 16,
    opacity: 0.6,
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 40,
    color: colors.khadi,
    fontWeight: '300',
    textAlign: 'center',
  },
  winnerLabel: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.khadi,
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  winnerName: {
    fontFamily: fonts.serif,
    fontSize: 56,
    color: colors.khadi,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 16,
  },
  winnerEthos: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.khadi,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  }
});
