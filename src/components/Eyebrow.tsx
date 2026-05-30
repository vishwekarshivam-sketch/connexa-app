import { Text, TextStyle } from 'react-native';
import { colors, fonts } from '../tokens';

interface Props { 
  children: React.ReactNode; 
  color?: string; 
  style?: TextStyle;
}

export function Eyebrow({ children, color = colors.inkWhisper, style }: Props) {
  return (
    <Text style={[{
      fontFamily: fonts.label,
      fontSize: 11,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 2.2,
      color,
      lineHeight: 11,
    }, style]}>
      {children}
    </Text>
  );
}
