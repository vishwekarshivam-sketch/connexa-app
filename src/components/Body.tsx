import { Text, TextStyle } from 'react-native';
import { colors, fonts } from '@/tokens';

interface Props { 
  children: React.ReactNode; 
  size?: number; 
  color?: string; 
  style?: TextStyle;
}

export function Body({ children, size = 17, color = colors.inkMute, style }: Props) {
  return (
    <Text style={[{
      fontFamily: fonts.body,
      fontSize: size,
      lineHeight: size * 1.55,
      letterSpacing: 0.005 * size,
      color,
    }, style]}>
      {children}
    </Text>
  );
}
