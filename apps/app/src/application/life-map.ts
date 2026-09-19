import {
  summarizeTemporalMetric,
  type Confidence,
  type MomentumDirection,
  type Observation,
} from '@mizan/core';

import {
  loadRecentObservations,
  type DataResult,
  type StoredObservation,
} from '@/infrastructure/supabase/data-access';

export type LifeMapDomainId = 'recovery' | 'connection' | 'work' | 'margin';
export type LifeMapMetricId = 'energy' | 'recovery' | 'mental_load' | 'connection' | 'perceived_control';

export interface LifeMapMetricHistory {
  metric: LifeMapMetricId;
  latestValue: number;
  latestScore: number;
  latestObservedAt: string;
  monthMedian: number | null;
  monthEvidenceCount: number;
  monthConfidence: Confidence;
  momentum: MomentumDirection;
  momentumConfidence: Confidence;
}

export interface LifeMapDomainHistory {
  domainId: LifeMapDomainId;
  evidenceCount: number;
  score: number | null;
  metrics: readonly LifeMapMetricHistory[];
}

export interface LifeMapSnapshot {
  generatedAt: string;
  domains: readonly LifeMapDomainHistory[];
}

const HISTORY_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

const domainMetrics: Readonly<Record<LifeMapDomainId, readonly { metric: LifeMapMetricId; higherIsBetter: boolean }[]>> = {
  recovery: [
    { metric: 'energy', higherIsBetter: true },
    { metric: 'recovery', higherIsBetter: true },
  ],
  connection: [{ metric: 'connection', higherIsBetter: true }],
  work: [{ metric: 'mental_load', higherIsBetter: false }],
  margin: [{ metric: 'perceived_control', higherIsBetter: true }],
};

function numericValue(row: StoredObservation): number | null {
  if (row.value_number === null || !Number.isFinite(row.value_number)) return null;
  if (row.value_number < 0 || row.value_number > 100) return null;
  return row.value_number;
}

function normalizedScore(value: number, higherIsBetter: boolean): number {
  return higherIsBetter ? value : 100 - value;
}

function toCoreObservation(row: StoredObservation, domainId: LifeMapDomainId): Observation {
  return {
    id: row.id,
    userId: row.user_id,
    dimensionId: domainId,
    metric: row.metric,
    value: numericValue(row),
    observedAt: row.observed_at,
    source: row.source === 'user' ? 'self_reported' : row.source === 'integration' ? 'observed' : 'inferred',
  };
}

function latestNumericObservation(
  rows: readonly StoredObservation[],
  metric: LifeMapMetricId,
  generatedAtMs: number,
): StoredObservation | null {
  return rows
    .filter((row) => row.metric === metric && numericValue(row) !== null)
    .filter((row) => {
      const observedAt = Date.parse(row.observed_at);
      return Number.isFinite(observedAt) && observedAt <= generatedAtMs;
    })
    .sort((left, right) => Date.parse(right.observed_at) - Date.parse(left.observed_at))[0] ?? null;
}

export function buildLifeMapSnapshot(
  rows: readonly StoredObservation[],
  enabledDomains: readonly LifeMapDomainId[],
  generatedAt: string,
): LifeMapSnapshot | null {
  const generatedAtMs = Date.parse(generatedAt);
  if (!Number.isFinite(generatedAtMs)) return null;

  const domains = enabledDomains.map((domainId): LifeMapDomainHistory => {
    const metrics = domainMetrics[domainId].flatMap(({ metric, higherIsBetter }) => {
      const latest = latestNumericObservation(rows, metric, generatedAtMs);
      if (!latest) return [];

      const observations = rows
        .filter((row) => row.metric === metric && numericValue(row) !== null)
        .map((row) => toCoreObservation(row, domainId));
      const summary = summarizeTemporalMetric(observations, metric, generatedAt, higherIsBetter);
      const latestValue = numericValue(latest);
      if (latestValue === null) return [];

      return [{
        metric,
        latestValue,
        latestScore: normalizedScore(latestValue, higherIsBetter),
        latestObservedAt: latest.observed_at,
        monthMedian: summary.windows.month.median,
        monthEvidenceCount: summary.windows.month.evidenceCount,
        monthConfidence: summary.windows.month.confidence,
        momentum: summary.momentum.direction,
        momentumConfidence: summary.momentum.confidence,
      }];
    });
    const score = metrics.length === 0
      ? null
      : metrics.reduce((total, metric) => total + metric.latestScore, 0) / metrics.length;

    return {
      domainId,
      evidenceCount: metrics.reduce((total, metric) => total + metric.monthEvidenceCount, 0),
      score,
      metrics,
    };
  });

  return { generatedAt, domains };
}

export async function loadLifeMapSnapshot(
  userId: string,
  enabledDomains: readonly LifeMapDomainId[],
  generatedAt = new Date().toISOString(),
): Promise<DataResult<LifeMapSnapshot>> {
  const generatedAtMs = Date.parse(generatedAt);
  if (!Number.isFinite(generatedAtMs)) return { ok: false, error: { kind: 'invalid' } };

  const since = new Date(generatedAtMs - HISTORY_WINDOW_MS).toISOString();
  const result = await loadRecentObservations(userId, since, 500);
  if (!result.ok) return result;

  const snapshot = buildLifeMapSnapshot(result.value, enabledDomains, generatedAt);
  if (!snapshot) return { ok: false, error: { kind: 'invalid' } };
  return { ok: true, value: snapshot };
}
