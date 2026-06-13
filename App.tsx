import { useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { 
  Newsreader_400Regular, 
  Newsreader_400Regular_Italic 
} from '@expo-google-fonts/newsreader';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AuthProvider } from '@/context/AuthContext';
import { registerServiceWorker } from '@/sw-register';
import { OfflineBanner } from '@/components/OfflineBanner';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// TanStack Query Client setup per spec
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
    mutations: {
      retry: 0,
    },
  },
});

function AppContent({ onLayout }: { onLayout: () => void }) {
  useEffect(() => {
    // Register service worker for PWA. Auth state is owned solely by AuthProvider.
    registerServiceWorker();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <View style={styles.container} onLayout={onLayout}>
        <RootNavigator />
      </View>
      <OfflineBanner />
      <InstallPrompt />
    </SafeAreaProvider>
  );
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Gambetta-Light': require('./assets/fonts/Gambetta-Light.ttf'),
    'Gambetta-LightItalic': require('./assets/fonts/Gambetta-LightItalic.ttf'),
    'Gambetta-Regular': require('./assets/fonts/Gambetta-Regular.ttf'),
    'Gambetta-Medium': require('./assets/fonts/Gambetta-Medium.ttf'),
    'Gambetta-Semibold': require('./assets/fonts/Gambetta-Semibold.ttf'),
    'ClashDisplay-Medium': require('./assets/fonts/ClashDisplay-Medium.ttf'),
    'ClashDisplay-Semibold': require('./assets/fonts/ClashDisplay-Semibold.ttf'),
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    SpaceMono_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View 
        style={[styles.container, { backgroundColor: '#15161C' }]} 
        onLayout={onLayoutRootView}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent onLayout={onLayoutRootView} />
        </AuthProvider>
      </ErrorBoundary>
      {Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
