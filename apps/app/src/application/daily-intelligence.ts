import { deriveHumanStateVector, type HumanStateVector, type Observation } from '@mizan/core';

import {
  loadRecentObservations,
  type DataResult,
  type StoredObservation,
} from '@/infrastructure/supabase/data-access';

const BASELINE_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

const metricDimensions: Readonly<Record<string, string>> = {
  energy: 'recovery',
  recovery: 'recovery',
  mental_load: 'work',
  clarity: 'work',
  connection: 'connection',
  grounding: 'grounding',
  perceived_control: 'margin',
  resilience: 'recovery',
};

function observationValue(row: StoredObservation): number | string | boolean | null {
  if (row.value_number !== null) return row.value_number;
  if (row.value_text !== null) return row.value_text;
  if (row.value_boolean !== null) return row.value_boolean;
  return null;
}

function toCoreObservation(row: StoredObservation): Observation {
  return {
    id: row.id,
    userId: row.user_id,
    dimensionId: metricDimensions[row.metric] ?? row.metric,
    metric: row.metric,
    value: observationValue(row),
    observedAt: row.observed_at,
    source: row.source === 'user' ? 'self_reported' : row.source === 'integration' ? 'observed' : 'inferred',
  };
}

export async function loadCurrentHumanState(
  userId: string,
  generatedAt = new Date().toISOString(),
): Promise<DataResult<HumanStateVector>> {
  const current = Date.parse(generatedAt);
  if (!Number.isFinite(current)) return { ok: false, error: { kind: 'invalid' } };

  const since = new Date(current - BASELINE_WINDOW_MS).toISOString();
  const result = await loadRecentObservations(userId, since);
  if (!result.ok) return result;

  return {
    ok: true,
    value: deriveHumanStateVector(result.value.map(toCoreObservation), generatedAt),
  };
}
