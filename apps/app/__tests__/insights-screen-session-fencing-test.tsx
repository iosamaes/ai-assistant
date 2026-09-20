jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/insights', () => ({ loadInsightsSnapshot: jest.fn() }));

import { render, waitFor } from '@testing-library/react-native';

import InsightsScreen from '@/app/insights';
import { loadInsightsSnapshot, type InsightsSnapshot } from '@/application/insights';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadInsightsSnapshotMock = jest.mocked(loadInsightsSnapshot);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function snapshot(): InsightsSnapshot {
  return {
    generatedAt: '2026-09-20T00:00:00.000Z',
    minimumPairs: 3,
    insights: [
      {
        key: 'recovery_energy',
        fromMetric: 'recovery',
        toMetric: 'energy',
        hypothesis: {
          status: 'association',
          direction: 'positive',
          effect: 0.5,
          sampleSize: 3,
          windowDays: 7,
          confidence: {
            level: 'likely',
            score: 0.6,
            evidenceCount: 3,
            freshnessDays: 0,
          },
          evidence: [],
        },
      },
    ],
  } as unknown as InsightsSnapshot;
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('InsightsScreen account-switch fencing', () => {
  test('hides the previous account insights immediately while the new account is loading', async () => {
    let resolveUserB:
      | ((value: Awaited<ReturnType<typeof loadInsightsSnapshot>>) => void)
      | undefined;

    loadInsightsSnapshotMock.mockImplementation((userId) => {
      if (userId === 'user-a') return Promise.resolve({ ok: true, value: snapshot() });
      return new Promise((resolve) => {
        resolveUserB = resolve;
      });
    });

    const view = await render(<InsightsScreen />);
    await waitFor(() => expect(view.getByText('Recovery and energy')).toBeTruthy());

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<InsightsScreen />);

    expect(view.queryByText('Recovery and energy')).toBeNull();
    expect(view.getByText('Reviewing personal patterns…')).toBeTruthy();
    await waitFor(() => expect(loadInsightsSnapshotMock).toHaveBeenCalledWith('user-b'));

    resolveUserB?.({
      ok: true,
      value: { ...snapshot(), insights: [] },
    });

    await waitFor(() => expect(view.getByText('No relationship has enough paired observations yet. Keep using quick check-ins; MIZAN will surface a pattern only when there is enough evidence.')).toBeTruthy());
    expect(view.queryByText('Recovery and energy')).toBeNull();
  });
});
