import type { PostgrestError } from '@supabase/supabase-js';

import type {
  IntegrationCapability,
  IntegrationConnectionState,
  NormalizedExternalObservation,
} from '@/integrations/contracts';

import { supabase } from './client';
import type { DataFailureKind, DataResult } from './data-access';

export interface StoredIntegrationConnection extends IntegrationConnectionState {
  id: string;
  userId: string;
}

function classifyError(error: PostgrestError): DataFailureKind {
  const message = error.message.toLowerCase();
  if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === 'PGRST303') return 'session-expired';
  if (error.code === '42501') return 'unauthorized';
  if (error.code === '23505') return 'conflict';
  if (error.code.startsWith('22') || error.code.startsWith('23')) return 'invalid';
  if (
    error.code.startsWith('08') ||
    error.code === 'PGRST000' ||
    error.code === 'PGRST001' ||
    error.code === 'PGRST002' ||
    message.includes('failed to fetch') ||
    message.includes('network')
  ) {
    return 'unavailable';
  }
  return 'unknown';
}

function failure<T>(error: PostgrestError): DataResult<T> {
  return { ok: false, error: { kind: classifyError(error), code: error.code } };
}

function unavailable<T>(): DataResult<T> {
  return { ok: false, error: { kind: 'not-configured' } };
}

function isValidQuality(value: number | null): boolean {
  return value === null || (Number.isFinite(value) && value >= 0 && value <= 1);
}

function normalizeConnectionRow(row: {
  id: string;
  user_id: string;
  capability: string;
  provider_id: string;
  status: IntegrationConnectionState['status'];
  scopes: string[] | null;
  consented_at: string | null;
  last_synced_at: string | null;
  last_error_code: string | null;
  disconnected_at: string | null;
  metadata: Record<string, unknown> | null;
}): StoredIntegrationConnection {
  return {
    id: row.id,
    userId: row.user_id,
    capability: row.capability as IntegrationCapability,
    providerId: row.provider_id,
    status: row.status,
    scopes: row.scopes ?? [],
    consentedAt: row.consented_at,
    lastSyncedAt: row.last_synced_at,
    lastErrorCode: row.last_error_code,
    disconnectedAt: row.disconnected_at,
    metadata: row.metadata ?? {},
  };
}

export async function loadIntegrationConnections(
  userId: string,
): Promise<DataResult<StoredIntegrationConnection[]>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('integration_connections')
    .select('id,user_id,capability,provider_id,status,scopes,consented_at,last_synced_at,last_error_code,disconnected_at,metadata')
    .eq('user_id', userId)
    .order('capability', { ascending: true });
  if (error) return failure(error);
  return {
    ok: true,
    value: (data ?? []).map((row) => normalizeConnectionRow(row as Parameters<typeof normalizeConnectionRow>[0])),
  };
}

export async function upsertIntegrationConnection(
  userId: string,
  state: IntegrationConnectionState,
): Promise<DataResult<StoredIntegrationConnection>> {
  if (!supabase) return unavailable();
  if (state.status === 'connected' && !state.consentedAt) {
    return { ok: false, error: { kind: 'invalid' } };
  }
  const { data, error } = await supabase
    .from('integration_connections')
    .upsert(
      {
        user_id: userId,
        capability: state.capability,
        provider_id: state.providerId,
        status: state.status,
        scopes: [...state.scopes],
        consented_at: state.consentedAt,
        last_synced_at: state.lastSyncedAt,
        last_error_code: state.lastErrorCode,
        disconnected_at: state.disconnectedAt,
        metadata: state.metadata,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,capability,provider_id' },
    )
    .select('id,user_id,capability,provider_id,status,scopes,consented_at,last_synced_at,last_error_code,disconnected_at,metadata')
    .single();
  if (error) return failure(error);
  return { ok: true, value: normalizeConnectionRow(data as Parameters<typeof normalizeConnectionRow>[0]) };
}

export async function disconnectIntegration(
  userId: string,
  capability: IntegrationCapability,
  providerId: string,
  disconnectedAt = new Date().toISOString(),
): Promise<DataResult<null>> {
  if (!supabase) return unavailable();
  const { error } = await supabase
    .from('integration_connections')
    .update({
      status: 'disabled',
      disconnected_at: disconnectedAt,
      last_error_code: null,
      updated_at: disconnectedAt,
    })
    .eq('user_id', userId)
    .eq('capability', capability)
    .eq('provider_id', providerId);
  if (error) return failure(error);
  return { ok: true, value: null };
}

export async function upsertNormalizedExternalObservations(
  userId: string,
  observations: readonly NormalizedExternalObservation[],
): Promise<DataResult<string[]>> {
  if (observations.length === 0) return { ok: true, value: [] };
  if (!supabase) return unavailable();

  for (const observation of observations) {
    if (
      observation.providerId.trim().length === 0 ||
      observation.dedupeKey.trim().length === 0 ||
      !Number.isFinite(Date.parse(observation.observedAt)) ||
      !isValidQuality(observation.evidenceQuality)
    ) {
      return { ok: false, error: { kind: 'invalid' } };
    }
  }

  const rows = observations.map((observation) => ({
    user_id: userId,
    source: 'integration' as const,
    metric: observation.metric,
    value_number: typeof observation.value === 'number' ? observation.value : null,
    value_text: typeof observation.value === 'string' ? observation.value : null,
    value_boolean: typeof observation.value === 'boolean' ? observation.value : null,
    unit: observation.unit,
    observed_at: observation.observedAt,
    provider_id: observation.providerId,
    external_item_id: observation.externalItemId,
    external_dedupe_key: observation.dedupeKey,
    evidence_quality: observation.evidenceQuality,
  }));

  const { data, error } = await supabase
    .from('observations')
    .upsert(rows, { onConflict: 'user_id,provider_id,external_dedupe_key' })
    .select('id');
  if (error) return failure(error);
  return { ok: true, value: (data ?? []).map((row) => row.id as string) };
}
