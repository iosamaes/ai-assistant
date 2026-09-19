jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/infrastructure/supabase/auth', () => ({
  requestPasswordReset: jest.fn(),
  signInWithPassword: jest.fn(),
  signUpWithPassword: jest.fn(),
}));

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AuthScreen from '@/app/auth';
import { translations } from '@/i18n';
import {
  requestPasswordReset,
  signInWithPassword,
  signUpWithPassword,
} from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const signInMock = jest.mocked(signInWithPassword);
const signUpMock = jest.mocked(signUpWithPassword);
const resetMock = jest.mocked(requestPasswordReset);
const refreshSession = jest.fn(async () => undefined);
const setLocale = jest.fn();

type RenderView = Awaited<ReturnType<typeof render>>;

function actionButton(view: RenderView, label: string) {
  const match = view
    .getAllByRole('button', { name: label })
    .find(
      (button) =>
        button.props.accessibilityState?.disabled !== undefined &&
        button.props.accessibilityState?.selected === undefined,
    );
  if (!match) throw new Error(`Action button not found: ${label}`);
  return match;
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue({
    isRtl: false,
    locale: 'en',
    refreshSession,
    sessionStatus: 'signed-out',
    setLocale,
    t: (key: keyof typeof translations.en) => translations.en[key],
  } as unknown as ReturnType<typeof useAppState>);
  signInMock.mockResolvedValue({ ok: false, error: { kind: 'invalid-credentials' } });
  signUpMock.mockResolvedValue({ ok: true, value: null });
  resetMock.mockResolvedValue({ ok: true, value: null });
});

describe('AuthScreen', () => {
  test('keeps sign-in disabled until email and minimum password are present', async () => {
    const view = await render(<AuthScreen />);

    expect(actionButton(view, 'Sign in').props.accessibilityState)
      .toMatchObject({ disabled: true });
    await fireEvent.changeText(view.getByLabelText('Email'), 'person@example.com');
    await fireEvent.changeText(view.getByLabelText('Password'), '123456');

    await waitFor(() => {
      expect(actionButton(view, 'Sign in').props.accessibilityState)
        .toEqual({ disabled: false });
    });
  });

  test('requires eight characters for a new account without tightening existing sign-in compatibility', async () => {
    const view = await render(<AuthScreen />);
    await fireEvent.press(view.getByRole('button', { name: 'Create account' }));
    await fireEvent.changeText(view.getByLabelText('Email'), 'new@example.com');
    await fireEvent.changeText(view.getByLabelText('Password'), '1234567');

    await waitFor(() => {
      expect(actionButton(view, 'Create account').props.accessibilityState)
        .toEqual({ disabled: true });
      expect(view.getByText('Use at least 8 characters.')).toBeTruthy();
    });

    await fireEvent.changeText(view.getByLabelText('Password'), '12345678');
    await waitFor(() => {
      expect(actionButton(view, 'Create account').props.accessibilityState)
        .toEqual({ disabled: false });
    });
  });

  test('reset mode removes the password field and uses the recovery action', async () => {
    const view = await render(<AuthScreen />);
    await fireEvent.press(view.getByRole('button', { name: 'Forgot password' }));

    await waitFor(() => expect(view.queryByLabelText('Password')).toBeNull());
    expect(actionButton(view, 'Send recovery link')).toBeTruthy();
  });

  test('maps credential failure to calm user-facing copy', async () => {
    const view = await render(<AuthScreen />);
    await fireEvent.changeText(view.getByLabelText('Email'), 'person@example.com');
    await fireEvent.changeText(view.getByLabelText('Password'), '123456');
    await waitFor(() => expect(actionButton(view, 'Sign in').props.accessibilityState)
      .toMatchObject({ disabled: false }));
    await fireEvent.press(actionButton(view, 'Sign in'));

    await waitFor(() => {
      expect(view.getByText('We could not sign in with those details. Check your email and password.'))
        .toBeTruthy();
    });
    expect(signInMock).toHaveBeenCalledWith('person@example.com', '123456');
    expect(refreshSession).not.toHaveBeenCalled();
  });
});
