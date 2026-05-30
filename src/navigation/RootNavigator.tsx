import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { MainNavigator } from '@/navigation/MainNavigator';
import { useAuth } from '@/context/AuthContext';

// When auth is complete, swap to MainNavigator
export function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
