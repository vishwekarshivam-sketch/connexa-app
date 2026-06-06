import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { HouseHomeScreen } from '@/screens/house/HouseHomeScreen';
import { PromptResponseScreen } from '@/screens/house/PromptResponseScreen';
import { HouseChatScreen } from '@/screens/house/HouseChatScreen';
import { ThreadViewScreen } from '@/screens/house/ThreadViewScreen';
import { DiscoverScreen } from '@/screens/discover/DiscoverScreen';
import { LoreScreen } from '@/screens/house/LoreScreen';
import { MyProfileScreen } from '@/screens/profile/MyProfileScreen';
import { OtherProfileScreen } from '@/screens/profile/OtherProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { AdminPanelScreen } from '@/screens/admin/AdminPanelScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HouseHome" component={HouseHomeScreen} />
      <Stack.Screen name="PromptResponse" component={PromptResponseScreen} />
      <Stack.Screen name="HouseChat" component={HouseChatScreen} />
      <Stack.Screen name="ThreadView" component={ThreadViewScreen} />
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="Lore" component={LoreScreen} />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AdminPanel" component={AdminPanelScreen as never} />
    </Stack.Navigator>
  );
}
