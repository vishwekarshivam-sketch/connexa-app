import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HouseStackParamList } from '@/types';
import { HouseHomeScreen } from '@/screens/house/HouseHomeScreen';
import { DiscoverScreen } from '@/screens/discover/DiscoverScreen';
import { OtherProfileScreen } from '@/screens/profile/OtherProfileScreen';
import { PromptResponseScreen } from '@/screens/house/PromptResponseScreen';
import { HouseChatScreen } from '@/screens/house/HouseChatScreen';
import { ThreadViewScreen } from '@/screens/house/ThreadViewScreen';
import { LoreScreen } from '@/screens/house/LoreScreen';
import { InvitesScreen } from '@/screens/house/InvitesScreen';

const Stack = createNativeStackNavigator<HouseStackParamList>();

export function HouseNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HouseHome" component={HouseHomeScreen} />
      <Stack.Screen name="PromptResponse" component={PromptResponseScreen} />
      <Stack.Screen name="HouseChat" component={HouseChatScreen} />
      <Stack.Screen name="ThreadView" component={ThreadViewScreen} />
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="HouseProfile" component={OtherProfileScreen} />
      <Stack.Screen name="Lore" component={LoreScreen} />
      <Stack.Screen name="Invites" component={InvitesScreen} />
    </Stack.Navigator>
  );
}
