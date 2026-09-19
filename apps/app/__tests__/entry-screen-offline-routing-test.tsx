import { render } from '@testing-library/react-native';

import EntryScreen from '@/app/index';
import { useAppState } from '@/state/app-state';

const mockRedirect = jest.fn(() => null);

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => mockRedirect(props),
}));

jest.mock('@/state/app-state', () => ({
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
    t: (key: string) => key,
  } as unknown as ReturnType<typeof useAppState>;
}

describe('EntryScreen offline routing', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });

  test('keeps an offline authenticated user in the product', () => {
    useAppStateMock.mockReturnValue(appState('offline', 'user-a', true));

    render(<EntryScreen />);

    expect(mockRedirect).toHaveBeenCalledWith({ href: '/today' });
  });

  test('keeps an offline authenticated user in onboarding when setup is incomplete', () => {
    useAppStateMock.mockReturnValue(appState('offline', 'user-a', false));

    render(<EntryScreen />);

    expect(mockRedirect).toHaveBeenCalledWith({ href: '/onboarding' });
  });

  test('does not treat offline state without an account as an authenticated session', () => {
    useAppStateMock.mockReturnValue(appState('offline', null, true));

    render(<EntryScreen />);

    expect(mockRedirect).toHaveBeenCalledWith({ href: '/auth' });
  });
});
