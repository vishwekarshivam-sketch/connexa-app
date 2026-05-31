import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { HouseHomeScreen } from '@/screens/house/HouseHomeScreen';
import { MyProfileScreen } from '@/screens/profile/MyProfileScreen';
import { OtherProfileScreen } from '@/screens/profile/OtherProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HouseHome" component={HouseHomeScreen} />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
