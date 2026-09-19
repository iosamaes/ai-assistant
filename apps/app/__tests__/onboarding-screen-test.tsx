jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/spiritual-grounding', () => ({
  useSpiritualGroundingPreference: jest.fn(),
}));
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
const spiritualMock = jest.mocked(useSpiritualGroundingPreference);
const loadBaselineMock = jest.mocked(loadDomainBaselineTargets);
const saveBaselineMock = jest.mocked(saveDomainBaselineTargets);
const replaceMock = jest.mocked(router.replace);

const completeOnboarding = jest.fn(async () => undefined);
const persistChoice = jest.fn(async () => true);
const setChoice = jest.fn();
const noop = jest.fn();

function appState(overrides: Record<string, unknown> = {}) {
  return {
    completeOnboarding,
    enabledDomains: ['recovery', 'connection', 'work'],
    focusDomain: 'recovery',
    isRtl: false,
    lifeSeason: 'balanced',
    locale: 'en',
    personalValues: ['family'],
    privacyMode: 'minimal',
    setFocusDomain: noop,
    setLifeSeason: noop,
    setLocale: noop,
    setPrivacyMode: noop,
    syncStatus: 'idle',
    t: (key: keyof typeof translations.en) => translations.en[key],
    toggleDomain: noop,
    togglePersonalValue: noop,
    userId: 'user-1',
    ...overrides,
  } as unknown as ReturnType<typeof useAppState>;
}

beforeEach(() => {
  jest.clearAllMocks();
  loadBaselineMock.mockResolvedValue({ ok: true, value: {} });
  saveBaselineMock.mockResolvedValue({ ok: true, value: null });
  spiritualMock.mockReturnValue({
    choice: true,
    persistChoice,
    setChoice,
    status: 'idle',
  });
});

describe('OnboardingScreen', () => {
  test('keeps Continue disabled until the required preference set is complete', async () => {
    useAppStateMock.mockReturnValue(appState({
      focusDomain: null,
      lifeSeason: null,
      personalValues: [],
      privacyMode: null,
    }));
    spiritualMock.mockReturnValue({
      choice: null,
      persistChoice,
      setChoice,
      status: 'idle',
    });

    const view = await render(<OnboardingScreen />);
    const button = view.getByRole('button', { name: 'Continue' });

    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    expect(view.getByText(/Choose a focus area/)).toBeTruthy();
  });

  test('persists onboarding choices before completing and routing to Today', async () => {
    useAppStateMock.mockReturnValue(appState());
    const view = await render(<OnboardingScreen />);
    await waitFor(() =>
      expect(view.getByRole('button', { name: 'Continue' }).props.accessibilityState)
        .toMatchObject({ disabled: false }),
    );
    await fireEvent.press(view.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/today'));
    expect(loadBaselineMock).toHaveBeenCalledWith('user-1');
    expect(saveBaselineMock).toHaveBeenCalledWith(
      'user-1',
      ['recovery', 'connection', 'work'],
      {},
    );
    expect(persistChoice).toHaveBeenCalledWith(true);
    expect(completeOnboarding).toHaveBeenCalledTimes(1);
  });
});
