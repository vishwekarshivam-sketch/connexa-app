import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts } from '../tokens';

type Variant = 'primary' | 'ghost' | 'text';

interface Props {
  children: React.ReactNode;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  full?: boolean;
  style?: ViewStyle;
}

export function Button({ children, onPress, variant = 'primary', disabled = false, full = true, style }: Props) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isText = variant === 'text';

  const containerStyle: ViewStyle = {
    height: isText ? undefined : 56,
    width: full ? '100%' : undefined,
    paddingHorizontal: full ? 0 : 28,
    borderWidth: isGhost ? 1 : 0,
    borderColor: isGhost ? colors.hairline : 'transparent',
    backgroundColor: isPrimary
      ? (disabled ? colors.khadiDeep : colors.ink)
      : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  const textStyle: TextStyle = {
    fontFamily: fonts.label,
    fontSize: 12.5,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 2.25,
    color: isPrimary ? colors.khadi : colors.ink,
  };

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.75}
      style={[containerStyle, style]}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
}
