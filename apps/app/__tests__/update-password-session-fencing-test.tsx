jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/infrastructure/supabase/auth', () => ({ updatePassword: jest.fn() }));

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import UpdatePasswordScreen from '@/app/update-password';
import { translations } from '@/i18n';
import { updatePassword } from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const updatePasswordMock = jest.mocked(updatePassword);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function appState(userId: string, onboardingCompleted = true) {
  return {
    isRtl: false,
    locale: 'en',
    onboardingCompleted,
    sessionStatus: 'signed-in',
    t: (key: keyof typeof translations.en) => translations.en[key],
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('UpdatePasswordScreen account-switch fencing', () => {
  test('binds the mutation to the initiating user and ignores a late result after account switch', async () => {
    const pending = deferred<Awaited<ReturnType<typeof updatePassword>>>();
    updatePasswordMock.mockReturnValue(pending.promise);
    useAppStateMock.mockReturnValue(appState('user-a'));
    const view = await render(<UpdatePasswordScreen />);

    fireEvent.changeText(view.getByLabelText('New password'), 'strong-password');
    fireEvent.changeText(view.getByLabelText('Confirm password'), 'strong-password');
    await fireEvent.press(view.getByRole('button', { name: 'Save password' }));

    expect(updatePasswordMock).toHaveBeenCalledWith('strong-password', 'user-a');

    useAppStateMock.mockReturnValue(appState('user-b', false));
    await view.rerender(<UpdatePasswordScreen />);
    pending.resolve({ ok: true, value: null });

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalledWith('/today');
      expect(router.replace).not.toHaveBeenCalledWith('/onboarding');
      expect(view.getByLabelText('New password').props.value).toBe('');
      expect(view.getByLabelText('Confirm password').props.value).toBe('');
    });
  });
});
