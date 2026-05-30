import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AuthProvider } from '@/context/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Gambetta_300Light': require('./assets/fonts/Gambetta-Light.ttf'),
    'Gambetta_400Regular': require('./assets/fonts/Gambetta-Regular.ttf'),
    'ClashDisplay_500Medium': require('./assets/fonts/ClashDisplay-Medium.ttf'),
    'Newsreader_400Regular': require('./assets/fonts/Newsreader-Regular.ttf'),
    'Newsreader_400Regular_Italic': require('./assets/fonts/Newsreader-Italic.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      // This tells the splash screen to hide immediately! If we need to do
      // extra data fetching, we can do it here.
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View style={styles.container} onLayout={onLayoutRootView}>
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
