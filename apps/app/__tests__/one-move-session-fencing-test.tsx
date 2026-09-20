jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/daily-intelligence', () => ({ loadDailySnapshot: jest.fn() }));
jest.mock('@/application/daily-recommendation', () => ({
  loadPersonalizedDailyRecommendation: jest.fn(),
  recordOneMoveDecision: jest.fn(),
}));

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import OneMoveScreen from '@/app/one-move';
import { loadDailySnapshot } from '@/application/daily-intelligence';
import {
  loadPersonalizedDailyRecommendation,
  recordOneMoveDecision,
} from '@/application/daily-recommendation';
import { translations } from '@/i18n';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadDailySnapshotMock = jest.mocked(loadDailySnapshot);
const loadRecommendationMock = jest.mocked(loadPersonalizedDailyRecommendation);
const recordDecisionMock = jest.mocked(recordOneMoveDecision);

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function deferredValue<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function appState(userId: string, refreshSession: () => Promise<void>) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    t: (key: keyof typeof translations.en) => translations.en[key],
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

const snapshotResult: Awaited<ReturnType<typeof loadDailySnapshot>> = {
  ok: true,
  value: {
    humanState: { generatedAt: '2026-09-19T00:00:00.000Z', maturity: 'cold_start', components: [] },
    overview: { balance: null, momentum: [] },
    source: 'live',
    cachedAt: null,
    degradedBy: null,
  },
};

const recommendation = {
  primary: {
    actionId: 'protect-recovery-window',
    labelKey: 'actionProtectRecoveryWindow',
    confidence: {
      level: 'likely' as const,
      score: 0.6,
      evidenceCount: 1,
      freshnessDays: 0,
    },
    evidence: [],
    reasonSignal: 'recovery' as const,
    contextId: 'context-1',
  },
  alternatives: [],
};

beforeEach(() => {
  jest.resetAllMocks();
  loadDailySnapshotMock.mockResolvedValue(snapshotResult);
  loadRecommendationMock.mockResolvedValue(recommendation);
  recordDecisionMock.mockResolvedValue({ ok: false, error: { kind: 'session-expired' } });
});

describe('OneMoveScreen account-switch fencing', () => {
  test('does not paint an old session-refresh failure state into a newly active account', async () => {
    const refresh = deferred();
    const refreshSession = jest.fn(() => refresh.promise);
    useAppStateMock.mockReturnValue(appState('user-a', refreshSession));
    const view = await render(<OneMoveScreen />);

    await waitFor(() => expect(view.getByRole('button', { name: translations.en.oneMoveAccept })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: translations.en.oneMoveAccept }));
    await waitFor(() => expect(refreshSession).toHaveBeenCalledTimes(1));

    useAppStateMock.mockReturnValue(appState('user-b', refreshSession));
    await view.rerender(<OneMoveScreen />);
    await waitFor(() => expect(loadDailySnapshotMock).toHaveBeenCalledWith('user-b'));
    refresh.resolve();

    await waitFor(() => {
      expect(view.queryByText(translations.en.oneMoveSaveError)).toBeNull();
    });
  });

  test('hides the previous account recommendation immediately while the new account is loading', async () => {
    const refreshSession = jest.fn(async () => undefined);
    const userBSnapshot = deferredValue<Awaited<ReturnType<typeof loadDailySnapshot>>>();
    loadDailySnapshotMock.mockImplementation((userId) =>
      userId === 'user-b' ? userBSnapshot.promise : Promise.resolve(snapshotResult),
    );

    useAppStateMock.mockReturnValue(appState('user-a', refreshSession));
    const view = await render(<OneMoveScreen />);
    await waitFor(() => expect(view.getByRole('button', { name: translations.en.oneMoveAccept })).toBeTruthy());

    useAppStateMock.mockReturnValue(appState('user-b', refreshSession));
    await view.rerender(<OneMoveScreen />);

    expect(view.queryByRole('button', { name: translations.en.oneMoveAccept })).toBeNull();
    expect(view.getByText(translations.en.loading)).toBeTruthy();
    await waitFor(() => expect(loadDailySnapshotMock).toHaveBeenCalledWith('user-b'));

    userBSnapshot.resolve(snapshotResult);
    await waitFor(() => expect(view.getByRole('button', { name: translations.en.oneMoveAccept })).toBeTruthy());
  });
});
