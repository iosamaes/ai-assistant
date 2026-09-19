jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/recovery', () => ({ loadRecoveryPlan: jest.fn() }));

import { render, waitFor } from '@testing-library/react-native';

import RecoveryScreen from '@/app/recovery';
import { loadRecoveryPlan } from '@/application/recovery';
import { useAppState } from '@/state/app-state';
import type { RecoveryPlan } from '@mizan/core';

const useAppStateMock = jest.mocked(useAppState);
const loadRecoveryPlanMock = jest.mocked(loadRecoveryPlan);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function recoveryPlan(need: 'available' | 'strongly_suggested'): RecoveryPlan {
  return {
    need,
    confidence: {
      level: need === 'available' ? 'possible' : 'known',
      evidenceCount: need === 'available' ? 1 : 4,
    },
    reasons: [],
    steps: [{ id: 'pause_inputs' }],
  } as unknown as RecoveryPlan;
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('RecoveryScreen session fencing', () => {
  test('does not render a previous account recovery plan after the active user changes', async () => {
    let resolveUserA:
      | ((value: Awaited<ReturnType<typeof loadRecoveryPlan>>) => void)
      | undefined;

    loadRecoveryPlanMock.mockImplementation((userId) => {
      if (userId === 'user-a') {
        return new Promise((resolve) => {
          resolveUserA = resolve;
        });
      }

      return Promise.resolve({ ok: true, value: recoveryPlan('available') });
    });

    const view = render(<RecoveryScreen />);
    await waitFor(() => expect(loadRecoveryPlanMock).toHaveBeenCalledWith('user-a'));

    useAppStateMock.mockReturnValue(appState('user-b'));
    view.rerender(<RecoveryScreen />);

    await waitFor(() => {
      expect(view.getByText('This path is available as a gentle reset.')).toBeTruthy();
    });

    resolveUserA?.({ ok: true, value: recoveryPlan('strongly_suggested') });

    await waitFor(() => {
      expect(view.getByText('This path is available as a gentle reset.')).toBeTruthy();
      expect(view.queryByText('Current signals strongly support reducing load and taking a short recovery reset.')).toBeNull();
    });
  });
});
