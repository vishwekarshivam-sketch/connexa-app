import { useEffect } from 'react';
import { View, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Mark } from '@/components/Mark';
import { Eyebrow } from '@/components/Eyebrow';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('UserType'), 2400);
    return () => clearTimeout(t);
  }, [navigation]);

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
