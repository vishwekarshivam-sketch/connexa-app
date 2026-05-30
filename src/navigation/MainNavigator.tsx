import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { HouseHomeScreen } from '@/screens/house/HouseHomeScreen';
import { DiscoverScreen } from '@/screens/discover/DiscoverScreen';
import { IntroductionsScreen } from '@/screens/introductions/IntroductionsScreen';
import { LeaderboardScreen } from '@/screens/leaderboard/LeaderboardScreen';
import { DateScreen } from '@/screens/date/DateScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: colors.khadi, 
          borderTopColor: colors.hairline, 
          borderTopWidth: 1 
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkWhisper,
        tabBarLabelStyle: { 
          fontFamily: fonts.label, 
          fontSize: 9, 
          letterSpacing: 1.4, 
          textTransform: 'uppercase' 
        },
      }}
    >
      <Tab.Screen name="House" component={HouseHomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Introductions" component={IntroductionsScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Date" component={DateScreen} />
    </Tab.Navigator>
  );
}
