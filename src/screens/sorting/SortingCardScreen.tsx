import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { HOUSES } from '@/fixtures/houseData';
import { colors, fonts } from '@/tokens';
import { Mark } from '@/components/Mark';

type Props = NativeStackScreenProps<AuthStackParamList, 'SortingCard'>;

export function SortingCardScreen({ navigation, route }: Props) {
  const house = HOUSES[route.params.house];

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: house.primary, 
      padding: 32, 
      justifyContent: 'space-between' 
    }}>
      <View style={{ alignItems: 'flex-start', gap: 12 }}>
        <Mark width={80} color="rgba(239,231,214,0.4)" />
        <Text style={{ 
          fontFamily: fonts.label, 
          fontSize: 10.5, 
          fontWeight: '500', 
          textTransform: 'uppercase', 
          letterSpacing: 1.68, 
          color: 'rgba(239,231,214,0.6)', 
          marginTop: 8 
        }}>
          House membership
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 42, 
          fontWeight: '300', 
          color: colors.khadi, 
          lineHeight: 46 
        }}>
          {house.nameEn}
        </Text>
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 22, 
          color: 'rgba(239,231,214,0.5)' 
        }}>
          {house.nameHi}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          // Navigate to main app — replace entire stack
          navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
          // Note: In a real app, this would switch to MainNavigator
        }}
        style={{
          borderWidth: 1,
          borderColor: 'rgba(239,231,214,0.4)',
          padding: 18,
          alignItems: 'center',
        }}
      >
        <Text style={{ 
          fontFamily: fonts.label, 
          fontSize: 11, 
          fontWeight: '500', 
          textTransform: 'uppercase', 
          letterSpacing: 2.2, 
          color: colors.khadi 
        }}>
          Enter Connexa
        </Text>
      </TouchableOpacity>
    </View>
  );
}
