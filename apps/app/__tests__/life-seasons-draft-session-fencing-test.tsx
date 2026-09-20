jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/life-seasons', () => ({
  loadLifeSeasonsState: jest.fn(),
  saveLifeSeason: jest.fn(),
}));

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import LifeSeasonsScreen from '@/app/life-seasons';
import { loadLifeSeasonsState, saveLifeSeason } from '@/application/life-seasons';
import { translations } from '@/i18n';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadLifeSeasonsStateMock = jest.mocked(loadLifeSeasonsState);
const saveLifeSeasonMock = jest.mocked(saveLifeSeason);
const refreshSession = jest.fn(async () => undefined);
const setLifeSeason = jest.fn();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function appState(userId: string, lifeSeason: 'balanced' | 'build') {
  return {
    enabledDomains: ['recovery'],
    isRtl: false,
    lifeSeason,
    locale: 'en',
    refreshSession,
    setLifeSeason,
    t: (key: keyof typeof translations.en) => translations.en[key],
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

beforeEach(() => {
  jest.resetAllMocks();
  saveLifeSeasonMock.mockResolvedValue({ ok: true, value: null });
});

describe('LifeSeasonsScreen local-draft account fencing', () => {
  test('hides and blocks User A season/target drafts immediately after User B becomes active', async () => {
    const userBLoad = deferred<Awaited<ReturnType<typeof loadLifeSeasonsState>>>();
    loadLifeSeasonsStateMock.mockImplementation((userId) => {
      if (userId === 'user-a') {
        return Promise.resolve({
          ok: true,
          value: { targets: { recovery: 5 }, history: [] },
        });
      }
      return userBLoad.promise;
    });

    useAppStateMock.mockReturnValue(appState('user-a', 'build'));
    const view = await render(<LifeSeasonsScreen />);

    await waitFor(() => {
      expect(view.getByRole('button', { name: 'Building or intense work' }).props.accessibilityState.selected)
        .toBe(true);
      expect(view.getByRole('button', { name: 'Recovery & energy: 5' }).props.accessibilityState.selected)
        .toBe(true);
    });

    useAppStateMock.mockReturnValue(appState('user-b', 'balanced'));
    await view.rerender(<LifeSeasonsScreen />);

    expect(view.getByRole('button', { name: 'Balanced season' }).props.accessibilityState.selected)
      .toBe(true);
    expect(view.getByRole('button', { name: 'Building or intense work' }).props.accessibilityState.selected)
      .toBe(false);
    expect(view.getByRole('button', { name: 'Recovery & energy: Not set' }).props.accessibilityState.selected)
      .toBe(true);
    expect(view.getByRole('button', { name: 'Recovery & energy: 5' }).props.accessibilityState.selected)
      .toBe(false);

    const saveButton = view.getByRole('button', { name: 'Save season & targets' });
    expect(saveButton.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(saveButton);
    expect(saveLifeSeasonMock).not.toHaveBeenCalled();

    await act(async () => {
      userBLoad.resolve({ ok: true, value: { targets: {}, history: [] } });
    });

    await waitFor(() => {
      expect(view.getByRole('button', { name: 'Save season & targets' }).props.accessibilityState)
        .toMatchObject({ disabled: false });
    });
  });
});
