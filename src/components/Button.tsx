import { Text, ViewStyle, TextStyle, Pressable, StyleProp } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  useReducedMotion 
} from 'react-native-reanimated';
import { colors, fonts, duration, ease } from '@/tokens';
import { haptics } from '@/lib/haptics';

type Variant = 'primary' | 'ghost' | 'text';

interface Props {
  children?: React.ReactNode;
  title?: string;
  onPress: () => void | Promise<void>;
  variant?: Variant;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ children, title, onPress, variant = 'primary', disabled = false, full = true, style }: Props) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isText = variant === 'text';

  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || reducedMotion) return;
    haptics.selection();
    scale.value = withTiming(0.97, { 
      duration: duration.instant, 
      easing: ease.inOut 
    });
  };

  const handlePressOut = () => {
    if (disabled || reducedMotion) return;
    scale.value = withTiming(1, { 
      duration: duration.instant, 
      easing: ease.inOut 
    });
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style]}
    >
      <Animated.View style={[containerStyle, animatedStyle]}>
        <Text style={textStyle}>{children ?? title}</Text>
      </Animated.View>
    </Pressable>
  );
}
