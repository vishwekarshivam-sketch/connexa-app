import { NavigationContainer, LinkingOptions, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { MainNavigator } from '@/navigation/MainNavigator';
import { AdminNavigator } from '@/navigation/AdminNavigator';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAuthStore } from '@/stores/authStore';
import { View, ActivityIndicator, Platform } from 'react-native';
import { colors } from '@/tokens';
import { useEffect } from 'react';

const prefix = Linking.createURL('/');
const RootStack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

const linking: LinkingOptions<any> = {
  prefixes: [prefix, 'connexa://'],
  config: {
    screens: {
      Main: 'app',
      Admin: 'admin',
      Auth: {
        path: 'auth',
        screens: {
          Splash: 'Splash',
          UserType: 'UserType',
          FresherPath: 'FresherPath',
          FresherEmail: 'FresherEmail',
          IitbEmail: 'IitbEmail',
          Otp: 'Otp',
          DocForm: 'DocForm',
          Pending: 'Pending',
          ProfileName: 'ProfileName',
          ProfilePhoto: 'ProfilePhoto',
          ProfileGender: 'ProfileGender',
          ProfileBranch: 'ProfileBranch',
          ProfileYear: 'ProfileYear',
          ProfileDone: 'ProfileDone',
          SortingInvitation: 'SortingInvitation',
          SortingQuiz: 'SortingQuiz',
          SortingReveal: 'SortingReveal',
          SortingCard: 'SortingCard',
        },
      },
    },
  },
};

export function RootNavigator() {
  const { isLoading, session, user } = useAuthStore();

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleNavigate = (event: any) => {
      const path = event.detail?.path;
      if (path && navigationRef.isReady()) {
        console.log('Navigating to SW path:', path);
        // We use navigate or reset depending on the path.
        // For now, Linking.openURL with the prefix is the most robust way to trigger 
        // the existing linking logic without duplicating path-to-screen mappings.
        Linking.openURL(prefix + path.replace(/^\//, ''));
      }
    };

    window.addEventListener('sw-navigate', handleNavigate);
    return () => window.removeEventListener('sw-navigate', handleNavigate);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.ink }}>
        <ActivityIndicator size="large" color={colors.khadi} />
      </View>
    );
  }

  // Auth Guard Logic
  const isAuthenticated = !!session;
  const isVerified = user?.status === 'active' || user?.status === 'onboarding';
  const hasHouse = !!user?.house;
  const isAdmin = !!user?.is_admin;
  
  const shouldShowMain = isAuthenticated && isVerified && hasHouse;

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {shouldShowMain ? (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            {isAdmin && <RootStack.Screen name="Admin" component={AdminNavigator} />}
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
      <NotificationCenter />
    </NavigationContainer>
  );
}
