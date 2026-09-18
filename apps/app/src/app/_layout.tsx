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
  const { onboardingCompleted, sessionStatus, userId } = useAppState();

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    const firstSegment = segments[0];
    const isAuthRoute = firstSegment === 'auth';
    const hasUsableSession = sessionStatus === 'signed-in' || (sessionStatus === 'offline' && Boolean(userId));

    if (!hasUsableSession) {
      if (!isAuthRoute) router.replace('/auth');
      return;
    }

    if (isAuthRoute) {
      router.replace(onboardingCompleted ? '/today' : '/onboarding');
    }
  }, [onboardingCompleted, segments, sessionStatus, userId]);

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
        <Stack.Screen name="update-password" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="today" />
        <Stack.Screen name="check-in" />
        <Stack.Screen name="life-map" />
        <Stack.Screen name="why" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="personal-learning" />
        <Stack.Screen name="personalization" />
        <Stack.Screen name="value-alignment" />
        <Stack.Screen name="invisible-wins" />
        <Stack.Screen name="what-if" />
        <Stack.Screen name="experiments" />
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
