import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '@/tokens';
import { HouseSigil } from '@/components/HouseSigil';
import { House } from '@/types';

export interface CategoryLeader {
  category: 'invites' | 'streak' | 'reactions' | 'active';
  label: string;
  displayName: string;
  house: House;
  value: number;
  unit: string;
}

interface Props {
  leaders: CategoryLeader[];
  onPress?: (leader: CategoryLeader) => void;
}

export function CategoryBreakdown({ leaders, onPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {leaders.map((leader) => (
          <TouchableOpacity
            key={leader.category}
            style={styles.card}
            onPress={() => onPress?.(leader)}
            activeOpacity={0.85}
          >
            <Text style={styles.label}>{leader.label}</Text>
            <View style={styles.person}>
              <HouseSigil house={leader.house} size="sm" style={styles.sigil} />
              <Text style={styles.name} numberOfLines={1}>
                {leader.displayName.split(' ')[0]} {leader.displayName.split(' ')[1]?.[0]}.
              </Text>
            </View>
            <Text style={styles.value}>{leader.value}</Text>
            <Text style={styles.unit}>{leader.unit}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48.5%', // Slightly less than 50% to account for gap
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
    padding: 14,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.inkMute,
    marginBottom: 10,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  sigil: {
    borderWidth: 0,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    flex: 1,
  },
  value: {
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: -0.2,
    color: colors.ink,
    lineHeight: 24,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 12,
    
    color: colors.inkMute,
  },
});
