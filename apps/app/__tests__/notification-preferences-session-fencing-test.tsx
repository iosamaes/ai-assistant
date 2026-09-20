const mockLoadPluginSetting = jest.fn();
const mockSavePluginSetting = jest.fn();

jest.mock('@/infrastructure/supabase/plugin-settings', () => ({
  loadPluginSetting: (...args: unknown[]) => mockLoadPluginSetting(...args),
  savePluginSetting: (...args: unknown[]) => mockSavePluginSetting(...args),
}));

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import {
  NOTIFICATION_PREFERENCES_PLUGIN_ID,
  useNotificationPreferences,
} from '@/application/notification-preferences';

function storedPreference(userId: string, dailyCheckIn: boolean) {
  return {
    user_id: userId,
    plugin_id: NOTIFICATION_PREFERENCES_PLUGIN_ID,
    enabled: dailyCheckIn,
    consented_at: dailyCheckIn ? '2026-09-20T08:00:00.000Z' : null,
    settings: {
      daily_check_in: dailyCheckIn,
      experiment_reminders: false,
      recovery_prompts: false,
    },
  };
}

function Harness({ userId }: { userId: string | null }) {
  const { persistPreferences, preferences, status } = useNotificationPreferences(userId);
  const stateLabel = `${status}:${preferences.dailyCheckIn ? 'on' : 'off'}`;

  return (
    <>
      <Text>{stateLabel}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enable daily reminder"
        onPress={() => void persistPreferences({ ...preferences, dailyCheckIn: true })}>
        <Text>Enable daily reminder</Text>
      </Pressable>
    </>
  );
}

beforeEach(() => {
  jest.resetAllMocks();
  mockSavePluginSetting.mockResolvedValue({ ok: true, value: null });
});

describe('notification preference session fencing', () => {
  test('drops a stale load result after the active account changes', async () => {
    let resolveUserA:
      | ((value: { ok: true; value: ReturnType<typeof storedPreference> }) => void)
      | undefined;

    mockLoadPluginSetting.mockImplementation((userId: string) => {
      if (userId === 'user-a') {
        return new Promise((resolve) => {
          resolveUserA = resolve;
        });
      }

      return Promise.resolve({ ok: true, value: storedPreference('user-b', true) });
    });

    const view = await render(<Harness userId="user-a" />);
    await waitFor(() => expect(mockLoadPluginSetting).toHaveBeenCalledWith('user-a', NOTIFICATION_PREFERENCES_PLUGIN_ID));

    await view.rerender(<Harness userId="user-b" />);
    await waitFor(() => expect(view.getByText('ready:on')).toBeTruthy());

    await act(async () => {
      resolveUserA?.({ ok: true, value: storedPreference('user-a', false) });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(view.getByText('ready:on')).toBeTruthy();
      expect(view.queryByText('ready:off')).toBeNull();
    });
  });

  test('does not let a stale save completion alter the next account state', async () => {
    let resolveUserASave:
      | ((value: { ok: true; value: null }) => void)
      | undefined;

    mockLoadPluginSetting.mockImplementation((userId: string) =>
      Promise.resolve({ ok: true, value: storedPreference(userId, false) }),
    );
    mockSavePluginSetting.mockImplementation((userId: string) => {
      if (userId === 'user-a') {
        return new Promise((resolve) => {
          resolveUserASave = resolve;
        });
      }
      return Promise.resolve({ ok: true, value: null });
    });

    const view = await render(<Harness userId="user-a" />);
    await waitFor(() => expect(view.getByText('ready:off')).toBeTruthy());

    fireEvent.press(view.getByRole('button', { name: 'Enable daily reminder' }));
    await waitFor(() => expect(view.getByText('saving:on')).toBeTruthy());

    await view.rerender(<Harness userId="user-b" />);
    await waitFor(() => expect(view.getByText('ready:off')).toBeTruthy());

    await act(async () => {
      resolveUserASave?.({ ok: true, value: null });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(view.getByText('ready:off')).toBeTruthy();
      expect(view.queryByText('ready:on')).toBeNull();
    });
    expect(mockSavePluginSetting).toHaveBeenCalledWith(
      'user-a',
      expect.objectContaining({ plugin_id: NOTIFICATION_PREFERENCES_PLUGIN_ID }),
    );
  });
});
