import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { MainNavigator } from '@/navigation/MainNavigator';
import { useAuth } from '@/context/AuthContext';
import { View } from 'react-native';

export function RootNavigator() {
  const { bootstrapping, session, user } = useAuth();

  if (bootstrapping) {
    return <View style={{ flex: 1 }} />;
  }

  const verifiedWithHouse =
    !!session &&
    user?.verification_status === 'verified' &&
    !!user.house;

  return (
    <NavigationContainer>
      {verifiedWithHouse ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
