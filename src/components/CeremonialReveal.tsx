import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, BackHandler } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  useReducedMotion,
  FadeIn,
  FadeOut,
  Keyframe
} from 'react-native-reanimated';
import { duration, ease, colors, fonts } from '@/tokens';
import { haptics } from '@/lib/haptics';

const RiseIn = new Keyframe({
  from: {
    opacity: 0,
    transform: [{ translateY: 24 }],
  },
  to: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
});

export type CeremonyTransition = 'fade' | 'rise';

export interface CeremonyStage {
  id: string;
  durationMs: number;
  content: React.ReactNode;
  transition: CeremonyTransition;
  holdBeforeNext?: number;
  backgroundColor?: string;
}

interface Props {
  stages: CeremonyStage[];
  onComplete: () => void;
  skippable?: boolean;
  skipAfterMs?: number;
}

export function CeremonialReveal({ stages, onComplete, skippable = true, skipAfterMs = 3000 }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const reducedMotion = useReducedMotion();
  const bgFade = useSharedValue(0); // For background cross-fades
  const bgContentColor = useSharedValue('#000000');
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStage = stages[currentIdx];

  useEffect(() => {
    // Prevent back button during ceremony
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    
    if (skippable) {
      const skipTimer = setTimeout(() => setShowSkip(true), skipAfterMs);
      return () => {
        backHandler.remove();
        clearTimeout(skipTimer);
      };
    }
    
    return () => backHandler.remove();
  }, [skippable, skipAfterMs]);

  useEffect(() => {
    if (isFinishing) return;

    const advance = () => {
      if (currentIdx < stages.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Last stage might not auto-advance (e.g. CTA wait)
        // If it does have a duration, we might want to auto-complete
        if (currentStage.durationMs > 0) {
          handleComplete();
        }
      }
    };

    if (currentStage.durationMs > 0) {
      timeoutRef.current = setTimeout(advance, currentStage.durationMs + (currentStage.holdBeforeNext || 0));
    }

    // Haptic feedback for key moments
    if (currentStage.id === 'sigil' || currentStage.id === 'winner') {
      haptics.impactMedium();
    }

    // Handle background color changes
    if (currentStage.backgroundColor) {
      bgContentColor.value = withTiming(currentStage.backgroundColor, {
        duration: reducedMotion ? 0 : duration.ceremony,
        easing: ease.inOut
      });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIdx, isFinishing]);

  const handleComplete = () => {
    setIsFinishing(true);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: bgContentColor.value,
  }));

  // Transition animations
  const getEntryAnimation = (type: CeremonyTransition) => {
    if (reducedMotion) return undefined;
    
    if (type === 'rise') {
      return RiseIn.duration(duration.slow);
    }
    return FadeIn.duration(duration.slow).easing(ease.out);
  };

  const getExitAnimation = () => {
    if (reducedMotion) return undefined;
    return FadeOut.duration(duration.slow).easing(ease.out);
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, animatedBgStyle]}>
      {/* Background Pattern (Faint Connexa mark at 4% opacity) */}
      <View style={styles.patternOverlay} />

      <View style={styles.contentContainer}>
        <Animated.View 
          key={currentStage.id}
          entering={getEntryAnimation(currentStage.transition)}
          exiting={getExitAnimation()}
          style={styles.stageContent}
        >
          {currentStage.content}
        </Animated.View>
      </View>

      {showSkip && !isFinishing && (
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip →</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.04,
    // Add background pattern if available
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  stageContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    padding: 10,
  },
  skipText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.khadi,
    opacity: 0.6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
