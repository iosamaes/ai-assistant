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
    router: { replace: mockReplace },
    Stack,
    useSegments: () => mockUseSegments(),
  };
});

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

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

  test('keeps the password recovery route mounted while signed out so the deep link can establish its recovery session', () => {
    mockUseSegments.mockReturnValue(['update-password']);
    useAppStateMock.mockReturnValue(appState('signed-out', null));

    render(<AppNavigator />);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('still sends other signed-out product routes to auth', async () => {
    mockUseSegments.mockReturnValue(['today']);
    useAppStateMock.mockReturnValue(appState('signed-out', null));

    render(<AppNavigator />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/auth'));
  });

  test('sends an authenticated user away from auth after session restoration', async () => {
    mockUseSegments.mockReturnValue(['auth']);
    useAppStateMock.mockReturnValue(appState('signed-in', 'user-a', true));

    render(<AppNavigator />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/today'));
  });
});
