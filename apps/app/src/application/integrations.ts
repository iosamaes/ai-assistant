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
  markIntegrationSyncSuccess,
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

async function verifyHealthSyncAuthorization(
  userId: string,
  provider: HealthDataProvider,
  grantedScopes: readonly string[],
  consentedAt: string,
): Promise<IntegrationResult<null>> {
  const stateResult = await loadIntegrationConnections(userId);
  if (!stateResult.ok) {
    const mappedKind = mapDataFailure(stateResult.error.kind);
    return {
      ok: false,
      error: {
        kind: mappedKind,
        ...(stateResult.error.code ? { code: stateResult.error.code } : {}),
      },
    };
  }

  const connection = stateResult.value.find(
    (item) => item.capability === 'health_data' && item.providerId === provider.providerId,
  );
  if (
    !connection ||
    connection.status !== 'connected' ||
    connection.disconnectedAt !== null ||
    !connection.consentedAt ||
    connection.consentedAt !== consentedAt
  ) {
    return { ok: false, error: { kind: 'permission-denied', code: 'consent-inactive' } };
  }

  const activeScopes = new Set(connection.scopes);
  if (
    provider.requiredScopes.some((scope) => !activeScopes.has(scope)) ||
    grantedScopes.some((scope) => !activeScopes.has(scope))
  ) {
    return { ok: false, error: { kind: 'permission-denied', code: 'scope-inactive' } };
  }

  return { ok: true, value: null };
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

  const initialAuthorization = await verifyHealthSyncAuthorization(
    userId,
    provider,
    grantedScopes,
    consentedAt,
  );
  if (!initialAuthorization.ok) return initialAuthorization;

  let readResult = await provider.readObservations(window);
  if (!readResult.ok && readResult.error.kind === 'unavailable') {
    const retryAuthorization = await verifyHealthSyncAuthorization(
      userId,
      provider,
      grantedScopes,
      consentedAt,
    );
    if (!retryAuthorization.ok) return retryAuthorization;
    readResult = await provider.readObservations(window);
  }
  if (!readResult.ok) {
    await recordHealthSyncFailure(userId, provider.providerId, 'provider', readResult.error.kind);
    return readResult;
  }
  if (readResult.value.some((observation) => observation.providerId !== provider.providerId)) {
    await recordHealthSyncFailure(userId, provider.providerId, 'provider', 'provider-mismatch');
    return { ok: false, error: { kind: 'invalid', code: 'provider-mismatch' } };
  }

  const postReadAuthorization = await verifyHealthSyncAuthorization(
    userId,
    provider,
    grantedScopes,
    consentedAt,
  );
  if (!postReadAuthorization.ok) return postReadAuthorization;

  const persistResult = await upsertNormalizedExternalObservations(userId, readResult.value);
  if (!persistResult.ok) {
    const mappedKind = mapDataFailure(persistResult.error.kind);
    await recordHealthSyncFailure(userId, provider.providerId, 'persist', mappedKind);
    return {
      ok: false,
      error: {
        kind: mappedKind,
        ...(persistResult.error.code ? { code: persistResult.error.code } : {}),
      },
    };
  }

  const syncedAt = new Date().toISOString();
  const stateResult = await markIntegrationSyncSuccess(
    userId,
    'health_data',
    provider.providerId,
    consentedAt,
    syncedAt,
  );
  if (!stateResult.ok) {
    const mappedKind = mapDataFailure(stateResult.error.kind);
    await recordHealthSyncFailure(userId, provider.providerId, 'state', mappedKind);
    return {
      ok: false,
      error: {
        kind: mappedKind,
        ...(stateResult.error.code ? { code: stateResult.error.code } : {}),
      },
    };
  }
  if (!stateResult.value) {
    return { ok: false, error: { kind: 'permission-denied', code: 'consent-revoked' } };
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
        ...(result.error.code ? { code: result.error.code } : {}),
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
