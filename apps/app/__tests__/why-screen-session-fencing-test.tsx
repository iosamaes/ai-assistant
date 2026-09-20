jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/why', () => ({ loadWhyExplanation: jest.fn() }));

import { render, waitFor } from '@testing-library/react-native';

import WhyScreen from '@/app/why';
import { loadWhyExplanation, type WhyExplanation } from '@/application/why';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadWhyExplanationMock = jest.mocked(loadWhyExplanation);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function explanation(): WhyExplanation {
  return {
    generatedAt: '2026-09-20T00:00:00.000Z',
    caveat: 'candidate factors',
    factors: [
      {
        key: 'recovery',
        value: 30,
        concernStrength: 70,
        confidence: {
          level: 'likely',
          score: 0.6,
          evidenceCount: 1,
          freshnessDays: 0,
        },
        evidence: [],
        evidenceStartAt: null,
        evidenceEndAt: null,
      },
    ],
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('WhyScreen account-switch fencing', () => {
  test('hides the previous account explanation immediately while the new account is loading', async () => {
    let resolveUserB:
      | ((value: Awaited<ReturnType<typeof loadWhyExplanation>>) => void)
      | undefined;

    loadWhyExplanationMock.mockImplementation((userId) => {
      if (userId === 'user-a') return Promise.resolve({ ok: true, value: explanation() });
      return new Promise((resolve) => {
        resolveUserB = resolve;
      });
    });

    const view = await render(<WhyScreen />);
    await waitFor(() => expect(view.getByText('Recovery is currently lower')).toBeTruthy());

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<WhyScreen />);

    expect(view.queryByText('Recovery is currently lower')).toBeNull();
    expect(view.getByText('Reviewing available evidence…')).toBeTruthy();
    await waitFor(() => expect(loadWhyExplanationMock).toHaveBeenCalledWith('user-b'));

    resolveUserB?.({
      ok: true,
      value: { ...explanation(), factors: [] },
    });

    await waitFor(() => expect(view.getByText('There are no candidate signals with enough evidence right now. That does not mean everything is perfect; it only means MIZAN lacks enough data to explain it.')).toBeTruthy());
    expect(view.queryByText('Recovery is currently lower')).toBeNull();
  });
});
