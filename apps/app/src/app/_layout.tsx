import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { Palette } from '@/constants/theme';
import { AppStateProvider, useAppState } from '@/state/app-state';

function AppNavigator() {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const segments = useSegments();
  const { onboardingCompleted, sessionStatus } = useAppState();

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    const firstSegment = segments[0];
    const isAuthRoute = firstSegment === 'auth';

    if (sessionStatus !== 'signed-in') {
      if (!isAuthRoute) router.replace('/auth');
      return;
    }

    if (isAuthRoute) {
      router.replace(onboardingCompleted ? '/today' : '/onboarding');
    }
  }, [onboardingCompleted, segments, sessionStatus]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: palette.background },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="today" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AppStateProvider>
          <AppNavigator />
        </AppStateProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
