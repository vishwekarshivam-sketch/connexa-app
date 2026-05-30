import { Text, TextStyle } from 'react-native';
import { colors, fonts } from '../tokens';

interface Props {
  children: React.ReactNode;
  size?: number;
  weight?: '300' | '400';
  color?: string;
  style?: TextStyle;
}

export function Title({ children, size = 36, weight = '400', color = colors.ink, style }: Props) {
  return (
    <Text style={[{
      fontFamily: weight === '300' ? fonts.serifLight : fonts.serif,
      fontSize: size,
      lineHeight: size * 1.06,
      letterSpacing: -0.02 * size,
      color,
    }, style]}>
      {children}
    </Text>
  );
}
