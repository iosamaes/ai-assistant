jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(async () => null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('@/infrastructure/supabase/auth', () => ({
  consumeAuthRedirectUrl: jest.fn(),
  getCurrentSession: jest.fn(),
  subscribeToAuthSession: jest.fn(),
}));

jest.mock('@/infrastructure/supabase/data-access', () => ({
  loadDomainPreferences: jest.fn(),
  loadProfile: jest.fn(),
  upsertDomainPreferences: jest.fn(),
  upsertProfile: jest.fn(),
}));

jest.mock('@/infrastructure/supabase/onboarding-context', () => ({
  loadOnboardingContext: jest.fn(),
  upsertOnboardingContext: jest.fn(),
}));

import type { Session } from '@supabase/supabase-js';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { getCurrentSession, subscribeToAuthSession } from '@/infrastructure/supabase/auth';
import {
  loadDomainPreferences,
  loadProfile,
  upsertDomainPreferences,
  upsertProfile,
} from '@/infrastructure/supabase/data-access';
import { loadOnboardingContext } from '@/infrastructure/supabase/onboarding-context';
import { AppStateProvider, useAppState } from '@/state/app-state';

const getCurrentSessionMock = jest.mocked(getCurrentSession);
const subscribeMock = jest.mocked(subscribeToAuthSession);
const loadProfileMock = jest.mocked(loadProfile);
const loadPreferencesMock = jest.mocked(loadDomainPreferences);
const loadContextMock = jest.mocked(loadOnboardingContext);
const upsertProfileMock = jest.mocked(upsertProfile);
const upsertPreferencesMock = jest.mocked(upsertDomainPreferences);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function session(userId: string): Session {
  return { user: { id: userId, user_metadata: {} } } as unknown as Session;
}

function profile(userId: string, locale: 'ar' | 'en') {
  return {
    user_id: userId,
    locale,
    timezone: 'Asia/Qatar',
    onboarding_completed: false,
    created_at: '2026-09-20T00:00:00Z',
    updated_at: '2026-09-20T00:00:00Z',
  };
}

function PersistenceProbe() {
  const state = useAppState();
  return (
    <>
      <Text testID="state">{state.userId}|{state.syncStatus}|{state.locale}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Set English" onPress={() => state.setLocale('en')}>
        <Text>Set English</Text>
      </Pressable>
    </>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AppStateProvider queued persistence account fencing', () => {
  test('drops an old-account persistence job that was queued before the active account changed', async () => {
    let authListener: ((event: string, nextSession: Session | null) => void) | null = null;
    const firstProfileWrite = deferred<Awaited<ReturnType<typeof upsertProfile>>>();
    const firstPreferenceWrite = deferred<Awaited<ReturnType<typeof upsertDomainPreferences>>>();

    getCurrentSessionMock.mockResolvedValue({ ok: true, value: session('user-a') });
    subscribeMock.mockImplementation((listener) => {
      authListener = listener as unknown as (event: string, nextSession: Session | null) => void;
      return jest.fn();
    });
    loadProfileMock.mockImplementation((userId) =>
      Promise.resolve({ ok: true, value: profile(userId, userId === 'user-b' ? 'en' : 'ar') }),
    );
    loadPreferencesMock.mockResolvedValue({ ok: true, value: [] });
    loadContextMock.mockResolvedValue({ ok: true, value: null });
    upsertProfileMock.mockImplementation(() => firstProfileWrite.promise);
    upsertPreferencesMock.mockImplementation(() => firstPreferenceWrite.promise);

    const view = await render(
      <AppStateProvider>
        <PersistenceProbe />
      </AppStateProvider>,
    );

    await waitFor(() => {
      expect(view.getByTestId('state').props.children.join('')).toBe('user-a|saved|ar');
    });
    await waitFor(() => expect(authListener).not.toBeNull());

    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Set English' }));
      fireEvent.press(view.getByRole('button', { name: 'Set English' }));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(upsertProfileMock).toHaveBeenCalledTimes(1);
      expect(upsertPreferencesMock).toHaveBeenCalledTimes(1);
      expect(upsertProfileMock).toHaveBeenCalledWith('user-a', expect.any(Object));
      expect(view.getByTestId('state').props.children.join('')).toBe('user-a|saving|en');
    });

    await act(async () => {
      authListener?.('SIGNED_IN', session('user-b'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(view.getByTestId('state').props.children.join('')).toBe('user-b|saved|en');
    });

    await act(async () => {
      firstProfileWrite.resolve({ ok: true, value: profile('user-a', 'en') });
      firstPreferenceWrite.resolve({ ok: true, value: [] });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(upsertProfileMock).toHaveBeenCalledTimes(1);
    expect(upsertPreferencesMock).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('state').props.children.join('')).toBe('user-b|saved|en');
  });
});
