import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '@/types';
import { AdminPanelScreen } from '@/screens/admin/AdminPanelScreen';

// Section Components
import { VerificationQueue } from '@/screens/admin/sections/VerificationQueue';
import { HouseLeaders } from '@/screens/admin/sections/HouseLeaders';
import { Prompts } from '@/screens/admin/sections/Prompts';
import { Lore } from '@/screens/admin/sections/Lore';
import { ActivityFlags } from '@/screens/admin/sections/ActivityFlags';
import { ContentModeration } from '@/screens/admin/sections/ContentModeration';
import { SeasonControls } from '@/screens/admin/sections/SeasonControls';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: true,
      animation: 'slide_from_right'
    }}>
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminPanelScreen} 
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen 
        name="VerificationQueue" 
        component={VerificationQueue} 
        options={{ title: 'Verification Queue' }}
      />
      <Stack.Screen 
        name="HouseLeaders" 
        component={HouseLeaders} 
        options={{ title: 'House Leaders' }}
      />
      <Stack.Screen 
        name="Prompts" 
        component={Prompts} 
        options={{ title: 'Prompts Management' }}
      />
      <Stack.Screen 
        name="LoreManagement" 
        component={Lore} 
        options={{ title: 'House Lore' }}
      />
      <Stack.Screen 
        name="ActivityFlags" 
        component={ActivityFlags} 
        options={{ title: 'Activity Flags' }}
      />
      <Stack.Screen 
        name="ContentModeration" 
        component={ContentModeration} 
        options={{ title: 'Content Moderation' }}
      />
      <Stack.Screen 
        name="SeasonControls" 
        component={SeasonControls} 
        options={{ title: 'Season Controls' }}
      />
    </Stack.Navigator>
  );
}
