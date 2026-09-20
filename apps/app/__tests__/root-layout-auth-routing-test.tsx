import { render, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { AppNavigator } from '@/app/_layout';
import { useAppState } from '@/state/app-state';

const mockReplace = jest.fn();
const mockUseSegments = jest.fn();
const mockFlushPendingUserMutations = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = Object.assign(
    ({ children }: { children?: ReactNode }) => React.createElement(React.Fragment, null, children),
    { Screen: () => null },
  );

  return {
    router: { replace: (...args: unknown[]) => mockReplace(...args) },
    Stack,
    useSegments: () => mockUseSegments(),
  };
});

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

jest.mock('@/components/app-navigation', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    AppNavigation: () => React.createElement(View, { testID: 'app-navigation' }),
  };
});

jest.mock('@/application/offline-sync', () => ({
  flushPendingUserMutations: (...args: unknown[]) => mockFlushPendingUserMutations(...args),
}));

jest.mock('@/state/app-state', () => ({
  AppStateProvider: ({ children }: { children?: ReactNode }) => children ?? null,
  useAppState: jest.fn(),
}));

const useAppStateMock = jest.mocked(useAppState);

function appState(
  sessionStatus: 'signed-in' | 'signed-out' | 'offline' | 'loading',
  userId: string | null,
  onboardingCompleted = true,
) {
  return {
    isRtl: false,
    onboardingCompleted,
    sessionStatus,
    userId,
  } as ReturnType<typeof useAppState>;
}

describe('root auth routing', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockUseSegments.mockReset();
    mockFlushPendingUserMutations.mockClear();
  });

  test('keeps the password recovery route mounted while signed out so the deep link can establish its recovery session', async () => {
    mockUseSegments.mockReturnValue(['update-password']);
    useAppStateMock.mockReturnValue(appState('signed-out', null));

    const screen = await render(<AppNavigator />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.queryByTestId('app-navigation')).toBeNull();
  });

  test('keeps product navigation off password recovery even after the recovery link establishes an authenticated session', async () => {
    mockUseSegments.mockReturnValue(['update-password']);
    useAppStateMock.mockReturnValue(appState('signed-in', 'user-a', true));

    const screen = await render(<AppNavigator />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.queryByTestId('app-navigation')).toBeNull();
  });

  test('also keeps password recovery mounted for a signed-in account that has not completed onboarding', async () => {
    mockUseSegments.mockReturnValue(['update-password']);
    useAppStateMock.mockReturnValue(appState('signed-in', 'user-a', false));

    const screen = await render(<AppNavigator />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.queryByTestId('app-navigation')).toBeNull();
  });

  test('still sends other signed-out product routes to auth', async () => {
    mockUseSegments.mockReturnValue(['today']);
    useAppStateMock.mockReturnValue(appState('signed-out', null));

    const screen = await render(<AppNavigator />);

    expect(screen.queryByTestId('app-navigation')).toBeNull();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/auth'));
  });

  test('sends an authenticated user away from auth without painting product navigation first', async () => {
    mockUseSegments.mockReturnValue(['auth']);
    useAppStateMock.mockReturnValue(appState('signed-in', 'user-a', true));

    const screen = await render(<AppNavigator />);

    expect(screen.queryByTestId('app-navigation')).toBeNull();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/today'));
  });

  test('fences an incomplete signed-in account from deep-linking directly into product routes', async () => {
    mockUseSegments.mockReturnValue(['today']);
    useAppStateMock.mockReturnValue(appState('signed-in', 'user-a', false));

    const screen = await render(<AppNavigator />);

    expect(screen.queryByTestId('app-navigation')).toBeNull();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/onboarding'));
  });

  test('sends a completed account away from onboarding unless Settings first resets onboarding state', async () => {
    mockUseSegments.mockReturnValue(['onboarding']);
    useAppStateMock.mockReturnValue(appState('signed-in', 'user-a', true));

    const screen = await render(<AppNavigator />);

    expect(screen.queryByTestId('app-navigation')).toBeNull();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/today'));
  });

  test('shows product navigation on an authenticated product route after onboarding', async () => {
    mockUseSegments.mockReturnValue(['today']);
    useAppStateMock.mockReturnValue(appState('signed-in', 'user-a', true));

    const screen = await render(<AppNavigator />);

    expect(screen.getByTestId('app-navigation')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('starts offline replay with the newly active account id after an account switch', async () => {
    mockUseSegments.mockReturnValue(['today']);
    useAppStateMock.mockReturnValue(appState('signed-in', 'user-a', true));

    const screen = await render(<AppNavigator />);
    await waitFor(() => expect(mockFlushPendingUserMutations).toHaveBeenCalledWith('user-a'));

    useAppStateMock.mockReturnValue(appState('signed-in', 'user-b', true));
    await screen.rerender(<AppNavigator />);

    await waitFor(() => expect(mockFlushPendingUserMutations).toHaveBeenCalledWith('user-b'));
    expect(mockFlushPendingUserMutations).not.toHaveBeenCalledWith(null);
  });
});
