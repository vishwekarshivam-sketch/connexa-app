import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Button } from '@/components/Button';

type Props = NativeStackScreenProps<DateStackParamList, 'DateLocked'>;

export function DateLockedScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { unlockDate } = route.params;

  const calculateDaysLeft = () => {
    const diff = new Date(unlockDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = calculateDaysLeft();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.khadi }}
      contentContainerStyle={{ 
        flexGrow: 1, 
        paddingTop: insets.top + 60, 
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Text style={{ 
        fontFamily: fonts.serif, 
        fontSize: 48, 
        color: colors.ink,
        marginBottom: 24,
        textAlign: 'center'
      }}>
        Not yet.
      </Text>

      <Text style={{ 
        fontFamily: fonts.body, 
        fontSize: 18, 
        lineHeight: 26,
        color: colors.inkMute,
        textAlign: 'center',
        marginBottom: 48
      }}>
        Date opens a few weeks after you're on campus. Settle in first — find your feet, meet people the slow way. We'll open this when you've had time to arrive.
      </Text>

      <View style={{ alignItems: 'center', marginBottom: 60 }}>
        <Text style={{ 
          fontFamily: fonts.label, 
          fontSize: 12, 
          textTransform: 'uppercase', 
          letterSpacing: 1.6,
          color: colors.inkWhisper,
          marginBottom: 8
        }}>
          Opens in
        </Text>
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 72, 
          color: colors.ink,
          lineHeight: 80
        }}>
          {daysLeft}
        </Text>
        <Text style={{ 
          fontFamily: fonts.label, 
          fontSize: 14, 
          textTransform: 'uppercase', 
          letterSpacing: 2,
          color: colors.inkMute
        }}>
          {daysLeft === 1 ? 'Day' : 'Days'}
        </Text>
      </View>

      <View style={{ width: '100%', height: 1, backgroundColor: colors.hairline, marginBottom: 48 }} />

      <Text style={{ 
        fontFamily: fonts.body, 
        fontSize: 16, 
        color: colors.inkMute,
        textAlign: 'center',
        marginBottom: 24
      }}>
        Want to be ready? You can set up your profile now. No rush, and no one sees it until Date opens.
      </Text>

      <Button 
        onPress={() => navigation.navigate('DateQuestionnaire', { step: 1 })}
        style={{ width: '100%', backgroundColor: colors.ember, marginBottom: 16 }}
      >
        Set up my profile
      </Button>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ 
          fontFamily: fonts.label, 
          fontSize: 12, 
          textTransform: 'uppercase', 
          letterSpacing: 1.2,
          color: colors.inkWhisper
        }}>
          Maybe later
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
