jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/spiritual-grounding', () => ({ useSpiritualGroundingPreference: jest.fn() }));
jest.mock('@/infrastructure/supabase/baseline-targets', () => ({
  loadDomainBaselineTargets: jest.fn(),
  saveDomainBaselineTargets: jest.fn(),
}));

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import OnboardingScreen from '@/app/onboarding';
import { useSpiritualGroundingPreference } from '@/application/spiritual-grounding';
import { translations } from '@/i18n';
import {
  loadDomainBaselineTargets,
  saveDomainBaselineTargets,
} from '@/infrastructure/supabase/baseline-targets';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const spiritualPreferenceMock = jest.mocked(useSpiritualGroundingPreference);
const loadBaselineMock = jest.mocked(loadDomainBaselineTargets);
const saveBaselineMock = jest.mocked(saveDomainBaselineTargets);

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function appState(userId: string, completeOnboarding: () => Promise<void>) {
  return {
    completeOnboarding,
    enabledDomains: ['recovery'],
    focusDomain: 'recovery',
    isRtl: false,
    lifeSeason: 'balanced',
    locale: 'en',
    personalValues: ['stability'],
    privacyMode: 'minimal',
    setFocusDomain: jest.fn(),
    setLifeSeason: jest.fn(),
    setLocale: jest.fn(),
    setPrivacyMode: jest.fn(),
    syncStatus: 'idle',
    t: (key: keyof typeof translations.en) => translations.en[key],
    toggleDomain: jest.fn(),
    togglePersonalValue: jest.fn(),
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

beforeEach(() => {
  jest.resetAllMocks();
  loadBaselineMock.mockResolvedValue({ ok: true, value: {} });
  saveBaselineMock.mockResolvedValue({ ok: true, value: null });
  spiritualPreferenceMock.mockReturnValue({
    choice: true,
    persistChoice: jest.fn(async () => true),
    setChoice: jest.fn(),
    status: 'ready',
  });
});

describe('OnboardingScreen account-switch fencing', () => {
  test('does not route a newly active account to Today when the previous account finishes late', async () => {
    const completion = deferred();
    const completeOnboarding = jest.fn(() => completion.promise);
    useAppStateMock.mockReturnValue(appState('user-a', completeOnboarding));
    const view = await render(<OnboardingScreen />);

    await waitFor(() => expect(loadBaselineMock).toHaveBeenCalledWith('user-a'));
    await waitFor(() => {
      expect(view.getByRole('button', { name: 'Continue' }).props.accessibilityState)
        .toMatchObject({ disabled: false });
    });
    await fireEvent.press(view.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(completeOnboarding).toHaveBeenCalledTimes(1));

    useAppStateMock.mockReturnValue(appState('user-b', completeOnboarding));
    await view.rerender(<OnboardingScreen />);
    await waitFor(() => expect(loadBaselineMock).toHaveBeenCalledWith('user-b'));
    completion.resolve();

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalledWith('/today');
    });
  });
});
