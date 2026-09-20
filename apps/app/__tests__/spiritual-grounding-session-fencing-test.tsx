jest.mock('@/infrastructure/supabase/plugin-settings', () => ({
  loadPluginSetting: jest.fn(),
  savePluginSetting: jest.fn(),
}));

import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

import { useSpiritualGroundingPreference } from '@/application/spiritual-grounding';
import { loadPluginSetting } from '@/infrastructure/supabase/plugin-settings';

const loadPluginSettingMock = jest.mocked(loadPluginSetting);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function Harness({ userId }: { userId: string | null }) {
  const { choice, status } = useSpiritualGroundingPreference(userId);
  return (
    <Text testID="preference-state">
      {`choice:${choice === null ? 'unset' : choice ? 'on' : 'off'} status:${status}`}
    </Text>
  );
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('useSpiritualGroundingPreference account-switch fencing', () => {
  test('does not expose the previous account preference while the new account is loading', async () => {
    const userBLoad = deferred<Awaited<ReturnType<typeof loadPluginSetting>>>();
    loadPluginSettingMock.mockImplementation((userId) => {
      if (userId === 'user-a') {
        return Promise.resolve({
          ok: true,
          value: {
            user_id: 'user-a',
            plugin_id: 'spiritual-grounding',
            enabled: true,
            consented_at: null,
            settings: {},
          },
        });
      }
      return userBLoad.promise;
    });

    const view = render(<Harness userId="user-a" />);
    await waitFor(() => expect(view.getByTestId('preference-state').props.children).toContain('choice:on'));

    view.rerender(<Harness userId="user-b" />);

    expect(view.getByTestId('preference-state').props.children).toContain('choice:unset');
    expect(view.getByTestId('preference-state').props.children).not.toContain('choice:on');

    await act(async () => {
      userBLoad.resolve({ ok: true, value: null });
    });

    await waitFor(() => expect(view.getByTestId('preference-state').props.children).toContain('choice:unset'));
  });
});
