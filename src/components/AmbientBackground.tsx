import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useReducedMotion,
  Easing
} from 'react-native-reanimated';

interface Props {
  color: string;
}

export function AmbientBackground({ color }: Props) {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();

  const tx1 = useSharedValue(0);
  const ty1 = useSharedValue(0);
  const tx2 = useSharedValue(0);
  const ty2 = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;

    tx1.value = withRepeat(
      withTiming(12, { duration: 25000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    ty1.value = withRepeat(
      withTiming(-8, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    tx2.value = withRepeat(
      withTiming(-10, { duration: 30000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    ty2.value = withRepeat(
      withTiming(15, { duration: 22000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reducedMotion]);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ translateX: tx1.value }, { translateY: ty1.value }],
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateX: tx2.value }, { translateY: ty2.value }],
  }));

  if (reducedMotion) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: 0.04 }]} />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View 
        style={[
          styles.blob, 
          { 
            backgroundColor: color, 
            width: width * 0.8, 
            height: width * 0.8, 
            borderRadius: width * 0.4,
            left: -width * 0.1,
            top: height * 0.1,
          }, 
          style1
        ]} 
      />
      <Animated.View 
        style={[
          styles.blob, 
          { 
            backgroundColor: color, 
            width: width * 0.9, 
            height: width * 0.9, 
            borderRadius: width * 0.45,
            right: -width * 0.2,
            bottom: height * 0.1,
          }, 
          style2
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    opacity: 0.06,
  },
});
