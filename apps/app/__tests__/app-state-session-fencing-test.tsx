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
import { act, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import {
  getCurrentSession,
  subscribeToAuthSession,
} from '@/infrastructure/supabase/auth';
import {
  loadDomainPreferences,
  loadProfile,
} from '@/infrastructure/supabase/data-access';
import { loadOnboardingContext } from '@/infrastructure/supabase/onboarding-context';
import { AppStateProvider, useAppState } from '@/state/app-state';

const getCurrentSessionMock = jest.mocked(getCurrentSession);
const subscribeMock = jest.mocked(subscribeToAuthSession);
const loadProfileMock = jest.mocked(loadProfile);
const loadPreferencesMock = jest.mocked(loadDomainPreferences);
const loadContextMock = jest.mocked(loadOnboardingContext);

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function session(userId: string): Session {
  return { user: { id: userId } } as unknown as Session;
}

function StateProbe() {
  const state = useAppState();
  return (
    <Text testID="state">
      {state.userId}|{state.locale}|{state.lifeSeason ?? 'none'}|{state.privacyMode ?? 'none'}
    </Text>
  );
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('AppStateProvider session fencing', () => {
  test('discards stale hydration results after the active account changes', async () => {
    const userAProfile = deferred<Awaited<ReturnType<typeof loadProfile>>>();
    const userAPreferences = deferred<Awaited<ReturnType<typeof loadDomainPreferences>>>();
    const userAContext = deferred<Awaited<ReturnType<typeof loadOnboardingContext>>>();
    let authListener: ((event: string, nextSession: Session | null) => void) | null = null;

    getCurrentSessionMock.mockResolvedValue({ ok: true, value: session('user-a') });
    subscribeMock.mockImplementation((listener) => {
      authListener = listener as unknown as (event: string, nextSession: Session | null) => void;
      return jest.fn();
    });

    loadProfileMock.mockImplementation((userId) => {
      if (userId === 'user-a') return userAProfile.promise;
      return Promise.resolve({
        ok: true,
        value: {
          user_id: 'user-b',
          locale: 'en',
          timezone: 'Asia/Qatar',
          onboarding_completed: true,
          created_at: '2026-09-19T00:00:00Z',
          updated_at: '2026-09-19T00:00:00Z',
        },
      });
    });
    loadPreferencesMock.mockImplementation((userId) => {
      if (userId === 'user-a') return userAPreferences.promise;
      return Promise.resolve({
        ok: true,
        value: [
          {
            user_id: 'user-b',
            domain_id: 'work',
            enabled: true,
            priority_weight: 1,
            custom_label: null,
          },
        ],
      });
    });
    loadContextMock.mockImplementation((userId) => {
      if (userId === 'user-a') return userAContext.promise;
      return Promise.resolve({
        ok: true,
        value: { life_season: 'build', self_values: ['growth'], privacy_mode: 'minimal' },
      });
    });

    const view = await render(
      <AppStateProvider>
        <StateProbe />
      </AppStateProvider>,
    );

    await waitFor(() => expect(authListener).not.toBeNull());
    await act(async () => {
      authListener?.('SIGNED_IN', session('user-b'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(view.getByTestId('state').props.children.join('')).toBe('user-b|en|build|minimal');
    });

    await act(async () => {
      userAProfile.resolve({
        ok: true,
        value: {
          user_id: 'user-a',
          locale: 'ar',
          timezone: 'Asia/Qatar',
          onboarding_completed: true,
          created_at: '2026-09-18T00:00:00Z',
          updated_at: '2026-09-18T00:00:00Z',
        },
      });
      userAPreferences.resolve({
        ok: true,
        value: [
          {
            user_id: 'user-a',
            domain_id: 'recovery',
            enabled: true,
            priority_weight: 1,
            custom_label: null,
          },
        ],
      });
      userAContext.resolve({
        ok: true,
        value: { life_season: 'travel', self_values: ['family'], privacy_mode: 'balanced' },
      });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(view.getByTestId('state').props.children.join('')).toBe('user-b|en|build|minimal');
    });
  });

  test('clears account-owned state when hydration reports an expired session', async () => {
    let authListener: ((event: string, nextSession: Session | null) => void) | null = null;
    let profileLoads = 0;

    getCurrentSessionMock.mockResolvedValue({ ok: true, value: session('user-a') });
    subscribeMock.mockImplementation((listener) => {
      authListener = listener as unknown as (event: string, nextSession: Session | null) => void;
      return jest.fn();
    });
    loadProfileMock.mockImplementation(() => {
      profileLoads += 1;
      if (profileLoads === 1) {
        return Promise.resolve({
          ok: true,
          value: {
            user_id: 'user-a',
            locale: 'en',
            timezone: 'Asia/Qatar',
            onboarding_completed: true,
            created_at: '2026-09-20T00:00:00Z',
            updated_at: '2026-09-20T00:00:00Z',
          },
        });
      }
      return Promise.resolve({
        ok: false,
        error: { kind: 'session-expired' as const, code: 'PGRST301' },
      });
    });
    loadPreferencesMock.mockResolvedValue({
      ok: true,
      value: [
        {
          user_id: 'user-a',
          domain_id: 'work',
          enabled: true,
          priority_weight: 1,
          custom_label: null,
        },
      ],
    });
    loadContextMock.mockResolvedValue({
      ok: true,
      value: { life_season: 'build', self_values: ['growth'], privacy_mode: 'minimal' },
    });

    const view = await render(
      <AppStateProvider>
        <StateProbe />
      </AppStateProvider>,
    );

    await waitFor(() => {
      expect(view.getByTestId('state').props.children.join('')).toBe('user-a|en|build|minimal');
    });
    await waitFor(() => expect(authListener).not.toBeNull());

    await act(async () => {
      authListener?.('TOKEN_REFRESHED', session('user-a'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(view.getByTestId('state').props.children.join('')).toBe('|ar|none|none');
    });
  });
});
