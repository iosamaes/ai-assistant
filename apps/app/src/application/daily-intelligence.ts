import {
  calculateBalance,
  calculateConfidence,
  deriveHumanStateVector,
  summarizeTemporalMetric,
  type BalanceSummary,
  type DimensionBalanceSignal,
  type EvidenceRef,
  type HumanStateVector,
  type MomentumSummary,
  type Observation,
} from '@mizan/core';

import { loadUserTargets } from '@/application/user-targets';
import {
  loadRecentObservations,
  type DataResult,
  type StoredObservation,
} from '@/infrastructure/supabase/data-access';

const BASELINE_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
const CURRENT_BALANCE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

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

const momentumMetrics = [
  { metric: 'energy', higherIsBetter: true },
  { metric: 'recovery', higherIsBetter: true },
  { metric: 'mental_load', higherIsBetter: false },
  { metric: 'connection', higherIsBetter: true },
] as const;

export type DailyMomentumMetric = (typeof momentumMetrics)[number]['metric'];

export interface DailyMomentumSignal {
  metric: DailyMomentumMetric;
  momentum: MomentumSummary;
}

export interface DailyOverview {
  balance: BalanceSummary | null;
  momentum: readonly DailyMomentumSignal[];
}

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

function numericValue(observation: Observation): number | null {
  if (typeof observation.value !== 'number' || !Number.isFinite(observation.value)) return null;
  if (observation.value < 0 || observation.value > 100) return null;
  return observation.value;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  const current = ordered[middle];
  if (current === undefined) return null;
  if (ordered.length % 2 === 1) return current;
  const previous = ordered[middle - 1];
  return previous === undefined ? current : (previous + current) / 2;
}

function evidenceFromObservation(observation: Observation): EvidenceRef {
  return {
    id: observation.id,
    source: observation.source,
    observedAt: observation.observedAt,
    label: `${observation.dimensionId}:${observation.metric}`,
  };
}

function deriveBalanceSignals(
  observations: readonly Observation[],
  generatedAt: string,
): DimensionBalanceSignal[] {
  const current = Date.parse(generatedAt);
  const lowerBound = current - CURRENT_BALANCE_WINDOW_MS;
  const dimensions = new Set(['recovery', 'connection', 'work', 'margin']);

  return [...dimensions].map((dimensionId) => {
    const relevant = observations.filter((observation) => {
      if (observation.dimensionId !== dimensionId || numericValue(observation) === null) return false;
      const observedAt = Date.parse(observation.observedAt);
      return Number.isFinite(observedAt) && observedAt >= lowerBound && observedAt <= current;
    });
    const values = relevant
      .map(numericValue)
      .filter((value): value is number => value !== null);
    const evidence = relevant.map(evidenceFromObservation);

    return {
      dimensionId,
      currentWeight: median(values),
      confidence: calculateConfidence(evidence, generatedAt, 3),
      evidence,
    };
  });
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

export async function loadDailyOverview(
  userId: string,
  generatedAt = new Date().toISOString(),
): Promise<DataResult<DailyOverview>> {
  const current = Date.parse(generatedAt);
  if (!Number.isFinite(current)) return { ok: false, error: { kind: 'invalid' } };

  const since = new Date(current - BASELINE_WINDOW_MS).toISOString();
  const [observationResult, targetResult] = await Promise.all([
    loadRecentObservations(userId, since),
    loadUserTargets(userId),
  ]);
  if (!observationResult.ok) return observationResult;
  if (!targetResult.ok) return targetResult;

  const observations = observationResult.value.map(toCoreObservation);
  const balance = targetResult.value
    ? calculateBalance(deriveBalanceSignals(observations, generatedAt), targetResult.value)
    : null;
  const momentum = momentumMetrics.flatMap(({ metric, higherIsBetter }) => {
    const summary = summarizeTemporalMetric(observations, metric, generatedAt, higherIsBetter).momentum;
    if (summary.direction === 'unknown' || summary.confidence.level === 'insufficient') return [];
    return [{ metric, momentum: summary }];
  });

  return {
    ok: true,
    value: { balance, momentum },
  };
}
