import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { HOUSES } from '@/fixtures/houseData';
import { colors, fonts, duration } from '@/tokens';
import { CeremonialReveal, CeremonyStage } from '@/components/CeremonialReveal';
import { Mark } from '@/components/Mark';
import { useAuth } from '@/context/AuthContext';
import { HouseSigil } from '@/components/HouseSigil';

type Props = NativeStackScreenProps<AuthStackParamList, 'SortingReveal'>;

export function SortingRevealScreen({ navigation, route }: Props) {
  const { house: houseId } = route.params;
  const house = HOUSES[houseId];
  const { user } = useAuth();

  const stages: CeremonyStage[] = [
    {
      id: 'mark',
      durationMs: 2000,
      transition: 'fade',
      backgroundColor: '#000000',
      content: <Mark width={80} color={colors.khadi} />
    },
    {
      id: 'spoken',
      durationMs: 2500,
      transition: 'rise',
      backgroundColor: '#000000',
      content: <Text style={styles.spokenText}>The houses have spoken.</Text>
    },
    {
      id: 'name',
      durationMs: 2000,
      transition: 'rise',
      backgroundColor: '#000000',
      content: <Text style={styles.nameText}>{user?.display_name?.split(' ')[0] || 'Tinkerer'}</Text>
    },
    {
      id: 'pause',
      durationMs: 2000,
      transition: 'fade',
      backgroundColor: '#000000',
      content: null
    },
    {
      id: 'sigil',
      durationMs: 1500,
      transition: 'fade',
      backgroundColor: house.primary,
      content: <HouseSigil house={houseId} size="xl" />
    },
    {
      id: 'houseName',
      durationMs: 1500,
      transition: 'rise',
      backgroundColor: house.primary,
      content: (
        <View style={styles.centered}>
          <Text style={styles.houseTitle}>{house.nameEn}</Text>
          <Text style={styles.houseHindi}>{house.nameHi}</Text>
        </View>
      )
    },
    {
      id: 'final',
      durationMs: 0, // Wait for interaction
      transition: 'rise',
      backgroundColor: house.primary,
      content: (
        <View style={styles.centered}>
          <Text style={styles.memberNumber}>MEMBER #42</Text>
          <Text style={styles.ethos}>{house.ethos}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SortingCard', { house: houseId })}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Enter your house →</Text>
          </TouchableOpacity>
        </View>
      )
    }
  ];

  return (
    <CeremonialReveal
      stages={stages}
      onComplete={() => navigation.navigate('SortingCard', { house: houseId })}
      skippable={true}
      skipAfterMs={3000}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spokenText: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.khadi,
    textAlign: 'center',
  },
  nameText: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: 'rgba(239,231,214,0.6)',
  },
  houseTitle: {
    fontFamily: fonts.serif,
    fontSize: 52,
    color: colors.khadi,
    lineHeight: 56,
    textAlign: 'center',
  },
  houseHindi: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: 'rgba(239,231,214,0.6)',
    marginTop: 8,
  },
  memberNumber: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: 'rgba(239,231,214,0.8)',
    letterSpacing: 2,
    marginBottom: 16,
  },
  ethos: {
    fontFamily: fonts.body,
    fontStyle: 'italic',
    fontSize: 18,
    color: colors.khadi,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  cta: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.khadi,
  },
  ctaText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.khadi,
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
