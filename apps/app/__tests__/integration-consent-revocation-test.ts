const mockLoadIntegrationConnections = jest.fn();
const mockMarkIntegrationSyncError = jest.fn();
const mockMarkIntegrationSyncSuccess = jest.fn();
const mockPersistObservations = jest.fn();
const mockDisconnectIntegration = jest.fn();

jest.mock('@/infrastructure/supabase/integrations', () => ({
  loadIntegrationConnections: mockLoadIntegrationConnections,
  markIntegrationSyncError: mockMarkIntegrationSyncError,
  markIntegrationSyncSuccess: mockMarkIntegrationSyncSuccess,
  upsertNormalizedExternalObservations: mockPersistObservations,
  disconnectIntegration: mockDisconnectIntegration,
}));

import { syncHealthData } from '@/application/integrations';
import type { HealthDataProvider, NormalizedExternalObservation } from '@/integrations/contracts';

const consentedAt = '2026-09-19T07:00:00.000Z';
const window = {
  start: '2026-09-19T00:00:00.000Z',
  end: '2026-09-19T23:59:59.999Z',
};
const observation: NormalizedExternalObservation = {
  metric: 'energy',
  value: 70,
  unit: 'score',
  observedAt: '2026-09-19T06:00:00.000Z',
  providerId: 'fixture-health',
  externalItemId: 'item-1',
  dedupeKey: 'fixture:item-1',
  evidenceQuality: 0.8,
};

function connection(status: 'connected' | 'disabled', disconnectedAt: string | null = null) {
  return {
    id: 'connection-1',
    userId: 'user-a',
    capability: 'health_data' as const,
    providerId: 'fixture-health',
    status,
    scopes: ['read_activity'],
    consentedAt,
    lastSyncedAt: null,
    lastErrorCode: null,
    disconnectedAt,
    metadata: {},
  };
}

function provider(readObservations = jest.fn().mockResolvedValue({ ok: true, value: [observation] })) {
  return {
    capability: 'health_data' as const,
    providerId: 'fixture-health',
    requiredScopes: ['read_activity'],
    readObservations,
  } satisfies HealthDataProvider;
}

beforeEach(() => {
  mockLoadIntegrationConnections.mockReset();
  mockMarkIntegrationSyncError.mockReset();
  mockMarkIntegrationSyncSuccess.mockReset();
  mockPersistObservations.mockReset();
  mockDisconnectIntegration.mockReset();
  mockMarkIntegrationSyncError.mockResolvedValue({ ok: true, value: null });
  mockMarkIntegrationSyncSuccess.mockResolvedValue({ ok: true, value: true });
  mockPersistObservations.mockResolvedValue({ ok: true, value: ['observation-1'] });
});

describe('integration consent revocation fencing', () => {
  test('does not call the provider when consent is already disabled', async () => {
    const healthProvider = provider();
    mockLoadIntegrationConnections.mockResolvedValue({
      ok: true,
      value: [connection('disabled', '2026-09-19T07:05:00.000Z')],
    });

    await expect(syncHealthData('user-a', healthProvider, window, ['read_activity'], consentedAt))
      .resolves.toEqual({
        ok: false,
        error: { kind: 'permission-denied', code: 'consent-inactive' },
      });

    expect(healthProvider.readObservations).not.toHaveBeenCalled();
    expect(mockPersistObservations).not.toHaveBeenCalled();
    expect(mockMarkIntegrationSyncSuccess).not.toHaveBeenCalled();
  });

  test('drops provider results when consent is revoked while a read is in flight', async () => {
    const healthProvider = provider();
    mockLoadIntegrationConnections
      .mockResolvedValueOnce({ ok: true, value: [connection('connected')] })
      .mockResolvedValueOnce({
        ok: true,
        value: [connection('disabled', '2026-09-19T07:05:00.000Z')],
      });

    await expect(syncHealthData('user-a', healthProvider, window, ['read_activity'], consentedAt))
      .resolves.toEqual({
        ok: false,
        error: { kind: 'permission-denied', code: 'consent-inactive' },
      });

    expect(healthProvider.readObservations).toHaveBeenCalledTimes(1);
    expect(mockPersistObservations).not.toHaveBeenCalled();
    expect(mockMarkIntegrationSyncSuccess).not.toHaveBeenCalled();
  });

  test('does not retry a temporarily unavailable provider after consent is revoked', async () => {
    const readObservations = jest.fn().mockResolvedValue({
      ok: false,
      error: { kind: 'unavailable' },
    });
    const healthProvider = provider(readObservations);
    mockLoadIntegrationConnections
      .mockResolvedValueOnce({ ok: true, value: [connection('connected')] })
      .mockResolvedValueOnce({
        ok: true,
        value: [connection('disabled', '2026-09-19T07:05:00.000Z')],
      });

    await expect(syncHealthData('user-a', healthProvider, window, ['read_activity'], consentedAt))
      .resolves.toEqual({
        ok: false,
        error: { kind: 'permission-denied', code: 'consent-inactive' },
      });

    expect(readObservations).toHaveBeenCalledTimes(1);
    expect(mockPersistObservations).not.toHaveBeenCalled();
  });

  test('cannot reactivate a connection if revocation wins the final sync-state race', async () => {
    const healthProvider = provider();
    mockLoadIntegrationConnections
      .mockResolvedValueOnce({ ok: true, value: [connection('connected')] })
      .mockResolvedValueOnce({ ok: true, value: [connection('connected')] });
    mockMarkIntegrationSyncSuccess.mockResolvedValue({ ok: true, value: false });

    await expect(syncHealthData('user-a', healthProvider, window, ['read_activity'], consentedAt))
      .resolves.toEqual({
        ok: false,
        error: { kind: 'permission-denied', code: 'consent-revoked' },
      });

    expect(mockPersistObservations).toHaveBeenCalledTimes(1);
    expect(mockMarkIntegrationSyncSuccess).toHaveBeenCalledTimes(1);
  });
});
