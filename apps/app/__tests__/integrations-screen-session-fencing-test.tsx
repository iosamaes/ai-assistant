jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('@/application/integrations', () => ({
  disableIntegrationConnection: jest.fn(),
  loadIntegrationSettings: jest.fn(),
}));

import { render, waitFor } from '@testing-library/react-native';

import IntegrationsScreen from '@/app/integrations';
import { loadIntegrationSettings } from '@/application/integrations';
import type { StoredIntegrationConnection } from '@/infrastructure/supabase/integrations';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const loadIntegrationSettingsMock = jest.mocked(loadIntegrationSettings);
const refreshSession = jest.fn(async () => undefined);

function appState(userId: string | null) {
  return {
    locale: 'en',
    refreshSession,
    userId,
  } as unknown as ReturnType<typeof useAppState>;
}

function connection(
  userId: string,
  capability: StoredIntegrationConnection['capability'],
  providerId: string,
): StoredIntegrationConnection {
  return {
    id: `${userId}-${capability}`,
    userId,
    capability,
    providerId,
    status: 'connected',
    scopes: [],
    consentedAt: '2026-09-19T00:00:00.000Z',
    lastSyncedAt: null,
    lastErrorCode: null,
    disconnectedAt: null,
    metadata: {},
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  useAppStateMock.mockReturnValue(appState('user-a'));
});

describe('IntegrationsScreen session fencing', () => {
  test('does not render a previous user integration result after the active user changes', async () => {
    let resolveUserA:
      | ((value: Awaited<ReturnType<typeof loadIntegrationSettings>>) => void)
      | undefined;

    loadIntegrationSettingsMock.mockImplementation((userId) => {
      if (userId === 'user-a') {
        return new Promise((resolve) => {
          resolveUserA = resolve;
        });
      }

      return Promise.resolve({
        ok: true,
        value: [connection('user-b', 'location_context', 'deterministic-location-context')],
      });
    });

    const view = render(<IntegrationsScreen />);
    await waitFor(() => expect(loadIntegrationSettingsMock).toHaveBeenCalledWith('user-a'));

    useAppStateMock.mockReturnValue(appState('user-b'));
    view.rerender(<IntegrationsScreen />);

    await waitFor(() => {
      expect(view.getByText('Approximate location context')).toBeTruthy();
    });

    resolveUserA?.({
      ok: true,
      value: [connection('user-a', 'health_data', 'deterministic-health-data')],
    });

    await waitFor(() => {
      expect(view.getByText('Approximate location context')).toBeTruthy();
      expect(view.queryByText('Health & wearable data')).toBeNull();
    });
  });
});
