jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/value-alignment', () => ({ loadPersonalValueAlignments: jest.fn() }));

import { render, waitFor } from '@testing-library/react-native';

import ValueAlignmentScreen from '@/app/value-alignment';
import {
  loadPersonalValueAlignments,
  type PersonalValueAlignment,
} from '@/application/value-alignment';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadValueAlignmentsMock = jest.mocked(loadPersonalValueAlignments);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    enabledDomains: ['connection'],
    isRtl: false,
    locale: 'en',
    personalValues: ['family'],
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function alignment(): PersonalValueAlignment {
  return {
    valueId: 'family',
    status: 'supported',
    confidence: {
      level: 'likely',
      score: 0.6,
      evidenceCount: 1,
      freshnessDays: 0,
    },
    watchSignals: [],
    supportingSignals: ['connection'],
    evidence: [],
  } as unknown as PersonalValueAlignment;
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('ValueAlignmentScreen account-switch fencing', () => {
  test('hides the previous account value summaries immediately while the new account is loading', async () => {
    let resolveUserB:
      | ((value: Awaited<ReturnType<typeof loadPersonalValueAlignments>>) => void)
      | undefined;

    loadValueAlignmentsMock.mockImplementation((userId) => {
      if (userId === 'user-a') return Promise.resolve({ ok: true, value: [alignment()] });
      return new Promise((resolve) => {
        resolveUserB = resolve;
      });
    });

    const view = await render(<ValueAlignmentScreen />);
    await waitFor(() => expect(view.getByText('Family')).toBeTruthy());

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<ValueAlignmentScreen />);

    expect(view.queryByText('Family')).toBeNull();
    expect(view.getByText('Reading value signals…')).toBeTruthy();
    await waitFor(() => expect(loadValueAlignmentsMock).toHaveBeenCalledWith('user-b', ['family'], ['connection']));

    resolveUserB?.({ ok: true, value: [] });
    await waitFor(() => expect(view.getByText('You have not selected personal values yet. You can change them in your priority settings.')).toBeTruthy());
    expect(view.queryByText('Family')).toBeNull();
  });
});
