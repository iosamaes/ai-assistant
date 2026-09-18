import type {
  HealthDataProvider,
  IntegrationCapability,
  IntegrationFailureKind,
  IntegrationResult,
  ObservationWindow,
} from '@/integrations/contracts';
import type { DataResult } from '@/infrastructure/supabase/data-access';
import {
  disconnectIntegration,
  loadIntegrationConnections,
  markIntegrationSyncError,
  upsertIntegrationConnection,
  upsertNormalizedExternalObservations,
  type StoredIntegrationConnection,
} from '@/infrastructure/supabase/integrations';

function mapDataFailure(kind: string): IntegrationFailureKind {
  if (kind === 'not-configured') return 'not-configured';
  if (kind === 'unauthorized' || kind === 'session-expired') return 'permission-denied';
  if (kind === 'invalid' || kind === 'conflict') return 'invalid';
  if (kind === 'unavailable') return 'unavailable';
  return 'unknown';
}

function safeSyncErrorCode(stage: 'scope' | 'provider' | 'persist' | 'state', kind: string) {
  const normalizedKind = kind.replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 60) || 'unknown';
  return `${stage}-${normalizedKind}`;
}

async function recordHealthSyncFailure(
  userId: string,
  providerId: string,
  stage: 'scope' | 'provider' | 'persist' | 'state',
  kind: string,
) {
  await markIntegrationSyncError(
    userId,
    'health_data',
    providerId,
    safeSyncErrorCode(stage, kind),
  );
}

async function readHealthObservationsWithRetry(
  provider: HealthDataProvider,
  window: ObservationWindow,
) {
  const first = await provider.readObservations(window);
  if (first.ok || first.error.kind !== 'unavailable') return first;
  return provider.readObservations(window);
}

export interface HealthSyncSummary {
  providerId: string;
  observationCount: number;
  syncedAt: string;
}

export async function loadIntegrationSettings(
  userId: string,
): Promise<DataResult<StoredIntegrationConnection[]>> {
  return loadIntegrationConnections(userId);
}

export async function syncHealthData(
  userId: string,
  provider: HealthDataProvider,
  window: ObservationWindow,
  grantedScopes: readonly string[],
  consentedAt: string,
): Promise<IntegrationResult<HealthSyncSummary>> {
  const granted = new Set(grantedScopes);
  if (provider.requiredScopes.some((scope) => !granted.has(scope))) {
    await recordHealthSyncFailure(userId, provider.providerId, 'scope', 'permission-denied');
    return { ok: false, error: { kind: 'permission-denied' } };
  }

  const readResult = await readHealthObservationsWithRetry(provider, window);
  if (!readResult.ok) {
    await recordHealthSyncFailure(userId, provider.providerId, 'provider', readResult.error.kind);
    return readResult;
  }
  if (readResult.value.some((observation) => observation.providerId !== provider.providerId)) {
    await recordHealthSyncFailure(userId, provider.providerId, 'provider', 'provider-mismatch');
    return { ok: false, error: { kind: 'invalid', code: 'provider-mismatch' } };
  }

  const persistResult = await upsertNormalizedExternalObservations(userId, readResult.value);
  if (!persistResult.ok) {
    const mappedKind = mapDataFailure(persistResult.error.kind);
    await recordHealthSyncFailure(userId, provider.providerId, 'persist', mappedKind);
    return {
      ok: false,
      error: {
        kind: mappedKind,
        code: persistResult.error.code,
      },
    };
  }

  const syncedAt = new Date().toISOString();
  const stateResult = await upsertIntegrationConnection(userId, {
    capability: 'health_data',
    providerId: provider.providerId,
    status: 'connected',
    scopes: [...grantedScopes],
    consentedAt,
    lastSyncedAt: syncedAt,
    lastErrorCode: null,
    disconnectedAt: null,
    metadata: {},
  });
  if (!stateResult.ok) {
    const mappedKind = mapDataFailure(stateResult.error.kind);
    await recordHealthSyncFailure(userId, provider.providerId, 'state', mappedKind);
    return {
      ok: false,
      error: {
        kind: mappedKind,
        code: stateResult.error.code,
      },
    };
  }

  return {
    ok: true,
    value: {
      providerId: provider.providerId,
      observationCount: persistResult.value.length,
      syncedAt,
    },
  };
}

export async function disableIntegrationConnection(
  userId: string,
  capability: IntegrationCapability,
  providerId: string,
): Promise<IntegrationResult<null>> {
  const result = await disconnectIntegration(userId, capability, providerId);
  if (!result.ok) {
    return {
      ok: false,
      error: {
        kind: mapDataFailure(result.error.kind),
        code: result.error.code,
      },
    };
  }
  return { ok: true, value: null };
}

export async function disableHealthIntegration(
  userId: string,
  providerId: string,
): Promise<IntegrationResult<null>> {
  return disableIntegrationConnection(userId, 'health_data', providerId);
}
