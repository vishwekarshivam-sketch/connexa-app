import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { colors, fonts } from '@/tokens';
import { Mark } from '@/components/Mark';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  return (
    <Screen bg={colors.ink}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Mark width={120} color={colors.khadi} />
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 48, 
          color: colors.khadi,
          marginTop: 24,
          fontWeight: '300',
          letterSpacing: -0.5
        }}>
          Connexa
        </Text>
        <Text style={{ 
          fontFamily: fonts.scaleLabel.family, 
          fontSize: 12, 
          color: colors.khadi, 
          opacity: 0.6,
          marginTop: 12,
          letterSpacing: 3,
          textTransform: 'uppercase'
        }}>
          IIT Bombay
        </Text>
      </View>

      <View style={{ gap: 16, paddingHorizontal: 32, paddingBottom: 40 }}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('UserType')}
          style={{ 
            height: 56, 
            backgroundColor: colors.khadi, 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 0
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: colors.ink, fontFamily: fonts.scaleLabel.family, fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>
            Create Account
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('LoginEmail')}
          style={{ 
            height: 56, 
            borderWidth: 1,
            borderColor: 'rgba(239, 231, 214, 0.2)',
            backgroundColor: 'transparent',
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 0
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: colors.khadi, fontFamily: fonts.scaleLabel.family, fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>
            Log In
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
