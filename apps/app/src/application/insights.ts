import {
  evaluateRelationshipHypothesis,
  type EvidenceRef,
  type RelationshipHypothesis,
  type RelationshipPair,
} from '@mizan/core';

import {
  loadRecentObservations,
  type DataResult,
  type StoredObservation,
} from '@/infrastructure/supabase/data-access';

export type InsightMetricKey = 'energy' | 'recovery' | 'mental_load' | 'connection' | 'perceived_control';
export type InsightRelationshipKey =
  | 'recovery_energy'
  | 'mental_load_energy'
  | 'connection_energy'
  | 'mental_load_control';

export interface PersonalInsight {
  key: InsightRelationshipKey;
  fromMetric: InsightMetricKey;
  toMetric: InsightMetricKey;
  hypothesis: RelationshipHypothesis;
}

export interface InsightsSnapshot {
  generatedAt: string;
  insights: readonly PersonalInsight[];
  minimumPairs: number;
}

const HISTORY_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_PAIR_GAP_MS = 6 * 60 * 60 * 1000;
const MINIMUM_PAIRS = 3;

const relationships: readonly {
  key: InsightRelationshipKey;
  fromMetric: InsightMetricKey;
  toMetric: InsightMetricKey;
}[] = [
  { key: 'recovery_energy', fromMetric: 'recovery', toMetric: 'energy' },
  { key: 'mental_load_energy', fromMetric: 'mental_load', toMetric: 'energy' },
  { key: 'connection_energy', fromMetric: 'connection', toMetric: 'energy' },
  { key: 'mental_load_control', fromMetric: 'mental_load', toMetric: 'perceived_control' },
];

function numericValue(row: StoredObservation): number | null {
  if (row.value_number === null || !Number.isFinite(row.value_number)) return null;
  if (row.value_number < 0 || row.value_number > 100) return null;
  return row.value_number;
}

function evidence(row: StoredObservation): EvidenceRef {
  return {
    id: row.id,
    observedAt: row.observed_at,
    label: row.metric,
    source: row.source === 'user' ? 'self_reported' : row.source === 'integration' ? 'observed' : 'inferred',
  };
}

function validRows(
  rows: readonly StoredObservation[],
  metric: InsightMetricKey,
  generatedAtMs: number,
): StoredObservation[] {
  return rows
    .filter((row) => row.metric === metric && numericValue(row) !== null)
    .filter((row) => {
      const timestamp = Date.parse(row.observed_at);
      return Number.isFinite(timestamp) && timestamp <= generatedAtMs;
    })
    .sort((left, right) => {
      const timeDiff = Date.parse(left.observed_at) - Date.parse(right.observed_at);
      return timeDiff !== 0 ? timeDiff : left.id.localeCompare(right.id);
    });
}

export function pairMetricObservations(
  rows: readonly StoredObservation[],
  fromMetric: InsightMetricKey,
  toMetric: InsightMetricKey,
  generatedAt: string,
): RelationshipPair[] {
  const generatedAtMs = Date.parse(generatedAt);
  if (!Number.isFinite(generatedAtMs)) return [];

  const fromRows = validRows(rows, fromMetric, generatedAtMs);
  const toRows = validRows(rows, toMetric, generatedAtMs);
  const usedTargets = new Set<string>();

  return fromRows.flatMap((fromRow): RelationshipPair[] => {
    const fromTime = Date.parse(fromRow.observed_at);
    const target = toRows
      .filter((row) => !usedTargets.has(row.id))
      .map((row) => ({ row, gap: Math.abs(Date.parse(row.observed_at) - fromTime) }))
      .filter((entry) => Number.isFinite(entry.gap) && entry.gap <= MAX_PAIR_GAP_MS)
      .sort((left, right) => {
        const gapDiff = left.gap - right.gap;
        if (gapDiff !== 0) return gapDiff;
        const timeDiff = Date.parse(left.row.observed_at) - Date.parse(right.row.observed_at);
        return timeDiff !== 0 ? timeDiff : left.row.id.localeCompare(right.row.id);
      })[0]?.row;

    if (!target) return [];
    const fromValue = numericValue(fromRow);
    const toValue = numericValue(target);
    if (fromValue === null || toValue === null) return [];

    usedTargets.add(target.id);
    const observedAt = Date.parse(fromRow.observed_at) >= Date.parse(target.observed_at)
      ? fromRow.observed_at
      : target.observed_at;

    return [{
      id: `${fromRow.id}:${target.id}`,
      fromValue,
      toValue,
      observedAt,
      experimental: false,
      evidence: [evidence(fromRow), evidence(target)],
    }];
  });
}

export function buildInsightsSnapshot(
  rows: readonly StoredObservation[],
  generatedAt: string,
): InsightsSnapshot | null {
  if (!Number.isFinite(Date.parse(generatedAt))) return null;

  const insights = relationships.flatMap(({ key, fromMetric, toMetric }): PersonalInsight[] => {
    const pairs = pairMetricObservations(rows, fromMetric, toMetric, generatedAt);
    const hypothesis = evaluateRelationshipHypothesis(fromMetric, toMetric, pairs);
    if (hypothesis.status === 'insufficient' || hypothesis.effect === null) return [];
    return [{ key, fromMetric, toMetric, hypothesis }];
  }).sort((left, right) => {
    const confidenceDiff = right.hypothesis.confidence.score - left.hypothesis.confidence.score;
    if (Math.abs(confidenceDiff) > 0.0001) return confidenceDiff;
    return left.key.localeCompare(right.key);
  });

  return { generatedAt, insights, minimumPairs: MINIMUM_PAIRS };
}

export async function loadInsightsSnapshot(
  userId: string,
  generatedAt = new Date().toISOString(),
): Promise<DataResult<InsightsSnapshot>> {
  const generatedAtMs = Date.parse(generatedAt);
  if (!Number.isFinite(generatedAtMs)) return { ok: false, error: { kind: 'invalid' } };

  const since = new Date(generatedAtMs - HISTORY_WINDOW_MS).toISOString();
  const result = await loadRecentObservations(userId, since, 500);
  if (!result.ok) return result;

  const snapshot = buildInsightsSnapshot(result.value, generatedAt);
  if (!snapshot) return { ok: false, error: { kind: 'invalid' } };
  return { ok: true, value: snapshot };
}
