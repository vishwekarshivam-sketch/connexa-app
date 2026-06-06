import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@/types';
import { colors, fonts, houseColors, duration } from '@/tokens';
import { IntroNavigator } from '@/navigation/IntroNavigator';
import { DateNavigator } from '@/navigation/DateNavigator';
import { ProfileNavigator } from '@/navigation/ProfileNavigator';
import { LeaderboardScreen } from '@/screens/leaderboard/LeaderboardScreen';
import { useAuthStore } from '@/stores/authStore';
import { Icon, IconName } from '@/components/Icon';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, IconName> = {
  House: 'mark',
  Introductions: 'users',
  Leaderboard: 'barChart2',
  Date: 'heart',
};

export function MainNavigator() {
  const { user } = useAuthStore();

  const isFresherOrLeader = 
    user?.user_type === 'fresher' || 
    user?.user_type === 'non_fresher' || 
    user?.is_admin;

  const userHouseColor = (user?.house && houseColors[user.house]) || colors.lake;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const activeColor = route.name === 'Date' ? colors.ember : userHouseColor;
        
        return {
          headerShown: false,
          animation: 'fade',
          tabBarStyle: { 
            backgroundColor: colors.khadi, 
            borderTopColor: colors.hairline, 
            borderTopWidth: 1 
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: colors.inkWhisper,
          tabBarLabelStyle: { 
            fontFamily: fonts.label, 
            fontSize: 9, 
            letterSpacing: 1.4, 
            textTransform: 'uppercase' 
          },
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={tabIcons[route.name as keyof MainTabParamList]}
              color={color}
              size={20}
              strokeWidth={1.5}
            />
          ),
        };
      }}
    >
      {isFresherOrLeader && (
        <Tab.Screen name="House">
          {() => (
            <ErrorBoundary>
              <ProfileNavigator />
            </ErrorBoundary>
          )}
        </Tab.Screen>
      )}
      
      <Tab.Screen name="Introductions">
        {() => (
          <ErrorBoundary>
            <IntroNavigator />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      
      {isFresherOrLeader && (
        <Tab.Screen name="Leaderboard">
          {() => (
            <ErrorBoundary>
              <LeaderboardScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>
      )}
      
      <Tab.Screen name="Date">
        {() => (
          <ErrorBoundary>
            <DateNavigator />
          </ErrorBoundary>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}


