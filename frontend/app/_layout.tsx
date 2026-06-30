import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUserStore } from '../src/store/userStore';

SplashScreen.preventAutoHideAsync();

// ── Auth guard: runs after store is loaded ────────────────────────────────────
function Guard() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isOnboarded } = useUserStore();

  useEffect(() => {
    const inOnboarding = segments[0] === '(onboarding)';
    const inMain = segments[0] === '(main)';

    if (isAuthenticated && isOnboarded && inOnboarding) {
      router.replace('/(main)/');
    } else if (!isAuthenticated && inMain) {
      router.replace('/(onboarding)/');
    }
  }, [isAuthenticated, isOnboarded, segments]);

  return null;
}

// ── Root layout ───────────────────────────────────────────────────────────────
export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { load } = useUserStore();

  const [fontsLoaded, fontError] = useFonts({
    'Nunito-Regular':   require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Bold':      require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
    'NotoNaskhArabic-Regular': require('../assets/fonts/NotoNaskhArabic-Regular.ttf'),
    'NotoNaskhArabic-Bold':    require('../assets/fonts/NotoNaskhArabic-Bold.ttf'),
  });

  // Load persisted auth from AsyncStorage BEFORE rendering any screen
  useEffect(() => {
    load().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && ready) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, ready]);

  if ((!fontsLoaded && !fontError) || !ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Guard />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
