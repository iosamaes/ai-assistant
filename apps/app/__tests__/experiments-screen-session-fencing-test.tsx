jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/experiments', () => ({
  cancelExperiment: jest.fn(),
  completeExperimentWithOutcome: jest.fn(),
  loadExperimentHistory: jest.fn(),
  startExperiment: jest.fn(),
  experimentTemplates: {
    'earlier-bedtime': {
      id: 'earlier-bedtime',
      metric: 'recovery',
      expectedDirection: 'higher',
      durationDays: 5,
      baselineComponentKeys: ['recovery', 'energy'],
    },
    'quiet-focus': {
      id: 'quiet-focus',
      metric: 'mental_load',
      expectedDirection: 'lower',
      durationDays: 3,
      baselineComponentKeys: ['mental_load', 'clarity'],
    },
    'short-walk': {
      id: 'short-walk',
      metric: 'energy',
      expectedDirection: 'higher',
      durationDays: 5,
      baselineComponentKeys: ['energy', 'mental_load'],
    },
  },
}));

import { render, waitFor } from '@testing-library/react-native';

import ExperimentsScreen from '@/app/experiments';
import { loadExperimentHistory, type ExperimentWithEvaluation } from '@/application/experiments';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadExperimentHistoryMock = jest.mocked(loadExperimentHistory);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function activeExperiment(
  userId: string,
  templateId: 'earlier-bedtime' | 'short-walk',
): ExperimentWithEvaluation {
  const now = '2026-09-19T12:00:00.000Z';
  const metric = templateId === 'earlier-bedtime' ? 'recovery' : 'energy';
  return {
    experiment: {
      id: `${userId}-${templateId}`,
      user_id: userId,
      template_id: templateId,
      hypothesis: `${userId} hypothesis`,
      metric,
      expected_direction: 'higher',
      duration_days: 5,
      status: 'active',
      consented_at: now,
      started_at: now,
      ended_at: null,
      baseline_snapshot: {},
      created_at: now,
      updated_at: now,
    },
    evaluation: {} as ExperimentWithEvaluation['evaluation'],
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('ExperimentsScreen session fencing', () => {
  test('does not repaint the next account with a previous account history result', async () => {
    let resolveUserA:
      | ((value: Awaited<ReturnType<typeof loadExperimentHistory>>) => void)
      | undefined;

    loadExperimentHistoryMock.mockImplementation((userId) => {
      if (userId === 'user-a') {
        return new Promise((resolve) => {
          resolveUserA = resolve;
        });
      }

      return Promise.resolve({
        ok: true,
        value: [activeExperiment('user-b', 'short-walk')],
      });
    });

    const view = render(<ExperimentsScreen />);
    await waitFor(() => expect(loadExperimentHistoryMock).toHaveBeenCalledWith('user-a'));

    useAppStateMock.mockReturnValue(appState('user-b'));
    view.rerender(<ExperimentsScreen />);

    await waitFor(() => {
      expect(view.getByText('Short calm walk')).toBeTruthy();
    });

    resolveUserA?.({
      ok: true,
      value: [activeExperiment('user-a', 'earlier-bedtime')],
    });

    await waitFor(() => {
      expect(view.getByText('Short calm walk')).toBeTruthy();
      expect(view.queryByText('Earlier bedtime')).toBeNull();
    });
  });
});
