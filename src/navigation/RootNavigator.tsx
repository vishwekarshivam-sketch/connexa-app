import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';

// When auth is complete, swap to MainNavigator
// For now, always show auth flow
export function RootNavigator() {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
