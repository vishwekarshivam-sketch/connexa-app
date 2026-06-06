import { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { duration, ease } from '@/tokens';
import { haptics } from '@/lib/haptics';

export function useSettleAnimation() {
  const scale = useSharedValue(1);

  const settle = () => {
    haptics.impactLight();
    scale.value = withSequence(
      withTiming(1.04, { duration: 200, easing: ease.inOut }),
      withTiming(1, { duration: 200, easing: ease.inOut })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { settle, animatedStyle };
}
