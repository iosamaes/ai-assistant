import type {
  HealthDataProvider,
  IntegrationFailureKind,
  IntegrationResult,
  ObservationWindow,
} from '@/integrations/contracts';
import {
  disconnectIntegration,
  upsertIntegrationConnection,
  upsertNormalizedExternalObservations,
} from '@/infrastructure/supabase/integrations';

function mapDataFailure(kind: string): IntegrationFailureKind {
  if (kind === 'not-configured') return 'not-configured';
  if (kind === 'unauthorized' || kind === 'session-expired') return 'permission-denied';
  if (kind === 'invalid' || kind === 'conflict') return 'invalid';
  if (kind === 'unavailable') return 'unavailable';
  return 'unknown';
}

export interface HealthSyncSummary {
  providerId: string;
  observationCount: number;
  syncedAt: string;
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
    return { ok: false, error: { kind: 'permission-denied' } };
  }

  const readResult = await provider.readObservations(window);
  if (!readResult.ok) return readResult;
  if (readResult.value.some((observation) => observation.providerId !== provider.providerId)) {
    return { ok: false, error: { kind: 'invalid', code: 'provider-mismatch' } };
  }

  const persistResult = await upsertNormalizedExternalObservations(userId, readResult.value);
  if (!persistResult.ok) {
    return {
      ok: false,
      error: {
        kind: mapDataFailure(persistResult.error.kind),
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
    return {
      ok: false,
      error: {
        kind: mapDataFailure(stateResult.error.kind),
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

export async function disableHealthIntegration(
  userId: string,
  providerId: string,
): Promise<IntegrationResult<null>> {
  const result = await disconnectIntegration(userId, 'health_data', providerId);
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
