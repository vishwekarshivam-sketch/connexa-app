import { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { HOUSES } from '@/fixtures/houseData';
import { colors, fonts, timing } from '@/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'SortingReveal'>;

export function SortingRevealScreen({ navigation, route }: Props) {
  const house = HOUSES[route.params.house];
  const flood = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(flood, { toValue: 1, duration: timing.slow, useNativeDriver: false }),
      Animated.timing(content, { toValue: 1, duration: timing.base, useNativeDriver: true }),
    ]).start();
  }, []);

  const bgColor = flood.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [colors.ink, house.primary] 
  });

  return (
    <Animated.View style={{ flex: 1, backgroundColor: bgColor, padding: 32, justifyContent: 'center' }}>
      <Animated.View style={{ opacity: content, gap: 24 }}>
        <Text style={{ 
          fontFamily: fonts.label, 
          fontSize: 10.5, 
          fontWeight: '500', 
          textTransform: 'uppercase', 
          letterSpacing: 1.68, 
          color: 'rgba(239,231,214,0.6)' 
        }}>
          You belong to
        </Text>
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 52, 
          fontWeight: '300', 
          color: colors.khadi, 
          lineHeight: 56 
        }}>
          {house.nameEn}
        </Text>
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 28, 
          color: 'rgba(239,231,214,0.5)', 
          lineHeight: 34 
        }}>
          {house.nameHi}
        </Text>
        <View style={{ 
          width: '100%', 
          height: 1, 
          backgroundColor: 'rgba(239,231,214,0.2)', 
          marginVertical: 8 
        }} />
        <Text style={{ 
          fontFamily: fonts.body, 
          fontStyle: 'italic', 
          fontSize: 17, 
          color: 'rgba(239,231,214,0.8)', 
          lineHeight: 26 
        }}>
          {house.ethos}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SortingCard', { house: route.params.house })}
          style={{ marginTop: 24 }}
        >
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 11, 
            fontWeight: '500', 
            textTransform: 'uppercase', 
            letterSpacing: 2.2, 
            color: colors.khadi 
          }}>
            Enter {house.nameEn} →
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
