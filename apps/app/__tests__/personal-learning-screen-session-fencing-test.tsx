jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/personal-learning', () => ({ loadPersonalLearning: jest.fn() }));

import { render, waitFor } from '@testing-library/react-native';

import PersonalLearningScreen from '@/app/personal-learning';
import {
  loadPersonalLearning,
  type PersonalLearningAction,
} from '@/application/personal-learning';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadPersonalLearningMock = jest.mocked(loadPersonalLearning);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function learningAction(): PersonalLearningAction {
  return {
    actionId: 'protect-recovery-window',
    labelKey: 'actionProtectRecoveryWindow',
    estimate: {
      actionId: 'protect-recovery-window',
      usefulness: 30,
      feedbackCount: 1,
      confidence: {
        level: 'likely',
        score: 0.6,
        evidenceCount: 1,
        freshnessDays: 0,
      },
      evidence: [],
    },
    outcomes: [],
  } as unknown as PersonalLearningAction;
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('PersonalLearningScreen account-switch fencing', () => {
  test('hides the previous account learning history immediately while the new account is loading', async () => {
    let resolveUserB:
      | ((value: Awaited<ReturnType<typeof loadPersonalLearning>>) => void)
      | undefined;

    loadPersonalLearningMock.mockImplementation((userId) => {
      if (userId === 'user-a') {
        return Promise.resolve({ ok: true, value: [learningAction()] });
      }
      return new Promise((resolve) => {
        resolveUserB = resolve;
      });
    });

    const view = await render(<PersonalLearningScreen />);
    await waitFor(() => expect(view.getByText('Protect 20 minutes for recovery')).toBeTruthy());

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<PersonalLearningScreen />);

    expect(view.queryByText('Protect 20 minutes for recovery')).toBeNull();
    expect(view.getByText('Loading your personal learning history…')).toBeTruthy();
    await waitFor(() => expect(loadPersonalLearningMock).toHaveBeenCalledWith('user-b'));

    resolveUserB?.({ ok: true, value: [] });
    await waitFor(() => expect(view.getByText('There are no explicit outcome ratings yet. After you try an action and report its effect, it will appear here.')).toBeTruthy());
    expect(view.queryByText('Protect 20 minutes for recovery')).toBeNull();
  });
});
