import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Button } from '@/components/Button';

type Props = NativeStackScreenProps<DateStackParamList, 'DateIntro'>;

export function DateIntroScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 32,
          paddingTop: 60,
          paddingBottom: insets.bottom + 40,
          justifyContent: 'center'
        }}
      >
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 32, 
          color: colors.ink,
          marginBottom: 24
        }}>
          Take your time here.
        </Text>

        <Text style={{ 
          fontFamily: fonts.body, 
          fontSize: 18, 
          lineHeight: 28,
          color: colors.inkMute,
          marginBottom: 60
        }}>
          This is the quiet corner. We show you people you're likely to genuinely click with — not the most-liked, not the loudest. No swiping, no scores.
        </Text>

        <Button 
          onPress={() => navigation.navigate('DateQuestionnaire', { step: 1 })}
          style={{ backgroundColor: colors.ink }}
        >
          Answer a few questions
        </Button>
      </ScrollView>
    </View>
  );
}
