import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, fonts, iconSizes } from '@/tokens';
import { House } from '@/types';

type SigilSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<SigilSize, number> = {
  sm: iconSizes.sm,
  md: iconSizes.sigil,
  lg: iconSizes['sigil-lg'],
  xl: iconSizes['sigil-xl'],
};

const houseColors: Record<House, string> = {
  tinkerers: colors.lake,
  wanderers: colors.lichen,
  strategists: colors.ember,
  mavericks: colors.ink,
};

interface Props {
  house: House;
  size?: SigilSize;
  style?: StyleProp<ViewStyle>;
}

// Fallback House Sigil since actual SVG assets are not in the repo yet.
export function HouseSigil({ house, size = 'md', style }: Props) {
  const px = sizeMap[size];
  const color = houseColors[house] || colors.ink;
  
  return (
    <View 
      style={[
        {
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: size !== 'sm' ? 2 : 0,
          borderColor: colors.khadi,
        },
        style
      ]}
    >
      <Text style={{
        fontFamily: fonts.hero.family,
        fontSize: px * 0.5,
        color: colors.khadi,
        textTransform: 'uppercase',
      }}>
        {house.charAt(0)}
      </Text>
    </View>
  );
}
