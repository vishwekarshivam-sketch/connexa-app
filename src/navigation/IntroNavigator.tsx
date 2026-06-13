import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IntroStackParamList } from '@/types';
import { IntroductionsScreen } from '@/screens/introductions/IntroductionsScreen';
import { CreateIntroScreen } from '@/screens/introductions/CreateIntroScreen';
import { IntroDetailScreen } from '@/screens/introductions/IntroDetailScreen';

const Stack = createNativeStackNavigator<IntroStackParamList>();

export function IntroNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="IntroFeed" component={IntroductionsScreen} />
      <Stack.Screen name="IntroCreate" component={CreateIntroScreen} />
      <Stack.Screen name="IntroDetail" component={IntroDetailScreen} />
    </Stack.Navigator>
  );
}
