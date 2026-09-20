jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/life-map', () => ({ loadLifeMapSnapshot: jest.fn() }));

import { render, waitFor } from '@testing-library/react-native';

import LifeMapScreen from '@/app/life-map';
import { loadLifeMapSnapshot, type LifeMapSnapshot } from '@/application/life-map';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadLifeMapSnapshotMock = jest.mocked(loadLifeMapSnapshot);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    enabledDomains: ['recovery'],
    isRtl: false,
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function snapshot(): LifeMapSnapshot {
  return {
    generatedAt: '2026-09-20T00:00:00.000Z',
    domains: [
      {
        domainId: 'recovery',
        evidenceCount: 1,
        score: 80,
        metrics: [],
      },
    ],
  } as unknown as LifeMapSnapshot;
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('LifeMapScreen account-switch fencing', () => {
  test('hides the previous account life map immediately while the new account is loading', async () => {
    let resolveUserB:
      | ((value: Awaited<ReturnType<typeof loadLifeMapSnapshot>>) => void)
      | undefined;

    loadLifeMapSnapshotMock.mockImplementation((userId) => {
      if (userId === 'user-a') return Promise.resolve({ ok: true, value: snapshot() });
      return new Promise((resolve) => {
        resolveUserB = resolve;
      });
    });

    const view = await render(<LifeMapScreen />);
    await waitFor(() => expect(view.getByText('Recovery & energy')).toBeTruthy());

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<LifeMapScreen />);

    expect(view.queryByText('Recovery & energy')).toBeNull();
    expect(view.getByText('Reading your history…')).toBeTruthy();
    await waitFor(() => expect(loadLifeMapSnapshotMock).toHaveBeenCalledWith('user-b', ['recovery']));

    resolveUserB?.({
      ok: true,
      value: { ...snapshot(), domains: [] } as unknown as LifeMapSnapshot,
    });

    await waitFor(() => expect(view.getByText('There is not enough numeric evidence yet. Start with a quick check-in and the map will build gradually from real observations.')).toBeTruthy());
    expect(view.queryByText('Recovery & energy')).toBeNull();
  });
});
