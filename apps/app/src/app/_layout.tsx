import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, useColorScheme, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { flushPendingUserMutations } from '@/application/offline-sync';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import { AppNavigation } from '@/components/app-navigation';
import { Layout, Palette } from '@/constants/theme';
import { AppStateProvider, useAppState } from '@/state/app-state';

export function AppNavigator() {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const segments = useSegments();
  const { width } = useWindowDimensions();
  const { isRtl, onboardingCompleted, sessionStatus, userId } = useAppState();
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(true);
  const firstSegment = segments[0];
  const hasUsableSession = sessionStatus === 'signed-in' || (sessionStatus === 'offline' && Boolean(userId));
  const isProductChromeRoute =
    firstSegment !== undefined &&
    firstSegment !== 'auth' &&
    firstSegment !== 'update-password' &&
    firstSegment !== 'onboarding';
  const showProductNavigation = hasUsableSession && onboardingCompleted && isProductChromeRoute;
  const wideNavigation = showProductNavigation && width >= Layout.wideBreakpoint;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotionEnabled(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotionEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (sessionStatus !== 'signed-in' && sessionStatus !== 'offline') return;
    void flushPendingUserMutations(userId);
  }, [sessionStatus, userId]);

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    const isAuthRoute = firstSegment === 'auth';
    const isPasswordRecoveryRoute = firstSegment === 'update-password';

    if (!hasUsableSession) {
      if (!isAuthRoute && !isPasswordRecoveryRoute) router.replace('/auth');
      return;
    }

    if (isAuthRoute) {
      router.replace(onboardingCompleted ? '/today' : '/onboarding');
    }
  }, [firstSegment, hasUsableSession, onboardingCompleted, sessionStatus]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View
        style={{
          flex: 1,
          flexDirection: wideNavigation ? (isRtl ? 'row-reverse' : 'row') : 'column',
          backgroundColor: palette.background,
        }}>
        {wideNavigation ? <AppNavigation activeSegment={firstSegment} /> : null}
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: reduceMotionEnabled ? 'none' : 'fade',
              contentStyle: { backgroundColor: palette.background },
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="update-password" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="today" />
            <Stack.Screen name="one-move" />
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
            <Stack.Screen name="recovery" />
            <Stack.Screen name="cost-of-yes" />
            <Stack.Screen name="human-roi" />
            <Stack.Screen name="life-seasons" />
            <Stack.Screen name="capacity" />
            <Stack.Screen name="integrations" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="settings" />
          </Stack>
        </View>
        {showProductNavigation && !wideNavigation ? <AppNavigation activeSegment={firstSegment} /> : null}
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <AppErrorBoundary>
          <AppNavigator />
        </AppErrorBoundary>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
