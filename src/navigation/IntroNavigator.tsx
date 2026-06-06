import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IntroStackParamList } from '@/types';
import { IntroductionsScreen } from '@/screens/introductions/IntroductionsScreen';

const Stack = createNativeStackNavigator<IntroStackParamList>();

export function IntroNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="IntroFeed" component={IntroductionsScreen} />
      {/* Add detail, create, edit screens as they are implemented */}
    </Stack.Navigator>
  );
}
