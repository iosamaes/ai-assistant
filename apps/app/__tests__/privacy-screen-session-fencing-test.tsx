jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/infrastructure/supabase/privacy', () => ({
  deleteMyAccount: jest.fn(),
  exportMyData: jest.fn(),
}));

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import PrivacyScreen from '@/app/privacy';
import { deleteMyAccount } from '@/infrastructure/supabase/privacy';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const deleteMyAccountMock = jest.mocked(deleteMyAccount);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    isRtl: false,
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('PrivacyScreen account-switch fencing', () => {
  test('requires a fresh delete confirmation after the active user changes', async () => {
    const view = render(<PrivacyScreen />);

    fireEvent.press(view.getByText('Start account deletion'));
    expect(view.getByText('Confirm permanent deletion')).toBeTruthy();
    expect(view.getByText('Delete permanently')).toBeTruthy();

    useAppStateMock.mockReturnValue(appState('user-b'));
    await view.rerender(<PrivacyScreen />);

    await waitFor(() => {
      expect(view.queryByText('Confirm permanent deletion')).toBeNull();
      expect(view.queryByText('Delete permanently')).toBeNull();
      expect(view.getByText('Start account deletion')).toBeTruthy();
    });

    expect(deleteMyAccountMock).not.toHaveBeenCalled();
  });
});
