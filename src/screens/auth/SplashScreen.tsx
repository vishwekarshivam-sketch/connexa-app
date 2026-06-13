import { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts, duration } from '@/tokens';
import { Mark } from '@/components/Mark';
import { Eyebrow } from '@/components/Eyebrow';
import { useAuthStore } from '@/stores/authStore';

import { getNextOnboardingStep } from '@/lib/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { isLoading, session, user } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration.slow,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: duration.slow,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Wait for AuthProvider to finish bootstrapping before deciding the route.
    if (isLoading) return;

    const t = setTimeout(() => {
      const route = getNextOnboardingStep(user, session);
      
      if (route === 'Main') {
        // RootNavigator will handle the switch to Main stack
        return;
      }

      if (route === 'Pending') {
        // If we don't have submission details in the user object yet, 
        // we pass placeholders; PendingScreen should be updated to handle this.
        navigation.replace('Pending', { 
          displayName: user?.display_name || 'Your application',
          iitLabel: user?.iit || 'IIT',
          roll: '...',
          email: user?.email || ''
        });
      } else {
        navigation.replace(route as any);
      }
    }, 2400);
    return () => clearTimeout(t);
  }, [navigation, isLoading, session, user, fadeAnim, slideAnim]);

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.ink, 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 30 
    }}>
      <Animated.View style={{ 
        opacity: fadeAnim, 
        transform: [{ translateY: slideAnim }],
        alignItems: 'center',
        gap: 30
      }}>
        <Mark width={96} color={colors.ember} />
        <Animated.Text style={{
          fontFamily: fonts.serifLight,
          fontSize: 58,
          letterSpacing: -0.035 * 58,
          color: colors.khadi,
          lineHeight: 58,
        }}>
          Connexa
        </Animated.Text>
        <Eyebrow color="rgba(239,231,214,0.5)">2026 Intake</Eyebrow>
      </Animated.View>
    </View>
  );
}

