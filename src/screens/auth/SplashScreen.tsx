import { useEffect } from 'react';
import { View, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Mark } from '@/components/Mark';
import { Eyebrow } from '@/components/Eyebrow';
import { useAuthStore } from '@/stores/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { isLoading, session, user } = useAuthStore();

  useEffect(() => {
    // Wait for AuthProvider to finish bootstrapping before deciding the route.
    if (isLoading) return;

    const resume = (): 'Landing' | 'ProfileName' | 'SortingInvitation' => {
      // Not signed in → start of funnel. (RootNavigator only mounts this
      // stack for users who aren't fully onboarded, so house-holders never
      // reach here.)
      if (!session || !user) return 'Landing';
      if (user.house) return 'SortingInvitation'; // edge: house set, gate not yet flipped
      if (user.display_name) return 'SortingInvitation';
      return 'ProfileName';
    };

    const t = setTimeout(() => navigation.replace(resume()), 2400);
    return () => clearTimeout(t);
  }, [navigation, isLoading, session, user]);

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.ink, 
      alignItems: 'center', 
      justifyContent: 'center', 
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
    </View>
  );
}
