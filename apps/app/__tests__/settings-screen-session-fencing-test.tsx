jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/spiritual-grounding', () => ({ useSpiritualGroundingPreference: jest.fn() }));
jest.mock('@/infrastructure/supabase/auth', () => ({ signOut: jest.fn() }));

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import SettingsScreen from '@/app/settings';
import { useSpiritualGroundingPreference } from '@/application/spiritual-grounding';
import { translations } from '@/i18n';
import { signOut } from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const spiritualPreferenceMock = jest.mocked(useSpiritualGroundingPreference);
const signOutMock = jest.mocked(signOut);
const refreshSession = jest.fn(async () => undefined);
const setLocale = jest.fn();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function appState(userId: string, resetOnboarding: () => Promise<void>) {
  return {
    enabledDomains: ['recovery'],
    isRtl: false,
    locale: 'en',
    refreshSession,
    resetOnboarding,
    setLocale,
    syncStatus: 'idle',
    t: (key: keyof typeof translations.en) => translations.en[key],
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

beforeEach(() => {
  jest.resetAllMocks();
  spiritualPreferenceMock.mockReturnValue({
    choice: false,
    persistChoice: jest.fn(async () => true),
    setChoice: jest.fn(),
    status: 'ready',
  });
});

describe('SettingsScreen account-switch fencing', () => {
  test('does not route the new account into onboarding when the previous account reset finishes late', async () => {
    const reset = deferred<void>();
    const resetOnboarding = jest.fn(() => reset.promise);
    useAppStateMock.mockReturnValue(appState('user-a', resetOnboarding));
    const view = await render(<SettingsScreen />);

    await fireEvent.press(view.getByRole('button', { name: 'Reset priorities' }));
    expect(resetOnboarding).toHaveBeenCalledTimes(1);

    useAppStateMock.mockReturnValue(appState('user-b', resetOnboarding));
    await view.rerender(<SettingsScreen />);
    reset.resolve();

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalledWith('/onboarding');
    });
  });

  test('does not refresh or redirect a newly active account after an older logout finishes', async () => {
    const resetOnboarding = jest.fn(async () => undefined);
    const logout = deferred<Awaited<ReturnType<typeof signOut>>>();
    signOutMock.mockReturnValue(logout.promise);
    useAppStateMock.mockReturnValue(appState('user-a', resetOnboarding));
    const view = await render(<SettingsScreen />);

    await fireEvent.press(view.getByRole('button', { name: 'Sign out' }));
    expect(signOutMock).toHaveBeenCalledTimes(1);

    useAppStateMock.mockReturnValue(appState('user-b', resetOnboarding));
    await view.rerender(<SettingsScreen />);
    logout.resolve({ ok: true, value: null });

    await waitFor(() => {
      expect(refreshSession).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalledWith('/auth');
    });
  });
});
