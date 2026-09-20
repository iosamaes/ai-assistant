jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/daily-intelligence', () => ({ loadCurrentHumanState: jest.fn() }));
jest.mock('@/application/scenario-learning', () => ({ loadPersonalScenarioEffects: jest.fn() }));
jest.mock('@mizan/core', () => ({ simulateScenario: jest.fn() }));

import { render, waitFor } from '@testing-library/react-native';
import { simulateScenario } from '@mizan/core';

import WhatIfScreen from '@/app/what-if';
import { loadCurrentHumanState } from '@/application/daily-intelligence';
import { loadPersonalScenarioEffects } from '@/application/scenario-learning';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadCurrentHumanStateMock = jest.mocked(loadCurrentHumanState);
const loadPersonalEffectsMock = jest.mocked(loadPersonalScenarioEffects);
const simulateScenarioMock = jest.mocked(simulateScenario);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

const stateResult = {
  ok: true,
  value: { generatedAt: '2026-09-20T00:00:00.000Z', maturity: 'cold_start', components: [] },
} as Awaited<ReturnType<typeof loadCurrentHumanState>>;

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
  loadCurrentHumanStateMock.mockResolvedValue(stateResult);
  loadPersonalEffectsMock.mockResolvedValue({ ok: true, value: [] });
  simulateScenarioMock.mockReturnValue({
    scenarioId: 'earlier-bedtime',
    assumptions: [],
    effects: [],
    uncertainty: 'high',
    generatedAt: '2026-09-20T00:00:00.000Z',
  });
});

describe('WhatIfScreen account-switch fencing', () => {
  test('hides the previous account projection immediately while the new account is loading', async () => {
    let resolveUserB:
      | ((value: Awaited<ReturnType<typeof loadCurrentHumanState>>) => void)
      | undefined;

    loadCurrentHumanStateMock.mockImplementation((userId) => {
      if (userId === 'user-a') return Promise.resolve(stateResult);
      return new Promise((resolve) => {
        resolveUserB = resolve;
      });
    });

    const view = await render(<WhatIfScreen />);
    await waitFor(() => expect(view.getByText('Uncertainty: High')).toBeTruthy());

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<WhatIfScreen />);

    expect(view.queryByText('Uncertainty: High')).toBeNull();
    expect(view.getByText('Reading your current state…')).toBeTruthy();
    await waitFor(() => expect(loadCurrentHumanStateMock).toHaveBeenCalledWith('user-b'));

    resolveUserB?.(stateResult);
    await waitFor(() => expect(view.getByText('Uncertainty: High')).toBeTruthy());
  });
});
