jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/check-in', () => ({ submitDailyCheckIn: jest.fn() }));

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import CheckInScreen from '@/app/check-in';
import { submitDailyCheckIn } from '@/application/check-in';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const submitDailyCheckInMock = jest.mocked(submitDailyCheckIn);
const replaceMock = jest.mocked(router.replace);
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

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('CheckInScreen session fencing', () => {
  test('clears previous-user answers and ignores a stale submit completion after account switch', async () => {
    let resolveUserA:
      | ((value: Awaited<ReturnType<typeof submitDailyCheckIn>>) => void)
      | undefined;

    submitDailyCheckInMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUserA = resolve;
        }),
    );

    const view = await render(<CheckInScreen />);

    await fireEvent.press(view.getByLabelText('checkInEnergy: 5'));
    await waitFor(() => expect(view.getByText('1 / 4')).toBeTruthy());

    await fireEvent.press(view.getByRole('button', { name: 'checkInSave' }));
    await waitFor(() => expect(submitDailyCheckInMock).toHaveBeenCalledWith('user-a', { energy: 5 }));

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<CheckInScreen />);

    await waitFor(() => expect(view.getByText('0 / 4')).toBeTruthy());

    await act(async () => {
      resolveUserA?.({ ok: true, value: { delivery: 'saved', ids: ['obs-1'], mutationId: 'mutation-1' } });
    });

    expect(replaceMock).not.toHaveBeenCalled();
    expect(view.getByText('0 / 4')).toBeTruthy();
  });

  test('keeps untouched metrics unselected and counts an explicit skip without persisting fake evidence', async () => {
    submitDailyCheckInMock.mockResolvedValue({
      ok: true,
      value: { delivery: 'saved', ids: ['obs-1'], mutationId: 'mutation-1' },
    });

    const view = await render(<CheckInScreen />);
    const recoverySkip = () => view.getByRole('button', { name: 'checkInRecovery: checkInSkip' });

    expect(view.getAllByText('Not answered yet')).toHaveLength(4);
    expect(recoverySkip().props.accessibilityState.selected).toBe(false);

    await fireEvent.press(recoverySkip());
    await waitFor(() => expect(view.getByText('1 / 4')).toBeTruthy());
    expect(recoverySkip().props.accessibilityState.selected).toBe(true);
    expect(view.getByRole('button', { name: 'checkInSave' }).props.accessibilityState.disabled).toBe(true);

    await fireEvent.press(view.getByLabelText('checkInEnergy: 5'));
    await waitFor(() => expect(view.getByText('2 / 4')).toBeTruthy());

    await fireEvent.press(view.getByRole('button', { name: 'checkInSave' }));
    await waitFor(() => expect(submitDailyCheckInMock).toHaveBeenCalledWith('user-a', { energy: 5 }));
  });
});