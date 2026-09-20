jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/capacity', () => ({ loadCapacitySnapshot: jest.fn() }));

import { render, waitFor } from '@testing-library/react-native';

import CapacityScreen from '@/app/capacity';
import { loadCapacitySnapshot, type CapacitySnapshot } from '@/application/capacity';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadCapacitySnapshotMock = jest.mocked(loadCapacitySnapshot);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    t: (key: string) => key,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function capacitySnapshot(score: number, fragility: number, band: 'strong' | 'moderate' | 'low'): CapacitySnapshot {
  return {
    generatedAt: '2026-09-20T00:00:00Z',
    debts: [],
    buffer: {
      score,
      fragility,
      band,
      confidence: {
        level: 'likely',
        score: 0.6,
        evidenceCount: 4,
        freshnessDays: 1,
      },
      evidence: [],
    },
  } as unknown as CapacitySnapshot;
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('CapacityScreen account-switch fencing', () => {
  test('hides the previous account capacity immediately while the replacement account loads', async () => {
    let resolveUserB:
      | ((value: Awaited<ReturnType<typeof loadCapacitySnapshot>>) => void)
      | undefined;

    loadCapacitySnapshotMock.mockImplementation((userId) => {
      if (userId === 'user-a') {
        return Promise.resolve({ ok: true, value: capacitySnapshot(72, 28, 'strong') });
      }
      return new Promise((resolve) => {
        resolveUserB = resolve;
      });
    });

    const view = await render(<CapacityScreen />);
    await waitFor(() => expect(view.getByText('72 / 100')).toBeTruthy());

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<CapacityScreen />);

    expect(view.queryByText('72 / 100')).toBeNull();
    expect(view.getByText('Reading current capacity…')).toBeTruthy();
    await waitFor(() => expect(loadCapacitySnapshotMock).toHaveBeenCalledWith('user-b'));

    resolveUserB?.({ ok: true, value: capacitySnapshot(35, 65, 'low') });
    await waitFor(() => expect(view.getByText('35 / 100')).toBeTruthy());
    expect(view.queryByText('72 / 100')).toBeNull();
  });
});
