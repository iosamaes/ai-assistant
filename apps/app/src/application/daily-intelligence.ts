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
  type UserTargets,
} from '@mizan/core';

import { loadUserTargets } from '@/application/user-targets';
import {
  readRecentDailySnapshot,
  writeRecentDailySnapshot,
} from '@/infrastructure/offline/recent-daily-snapshot';
import {
  loadRecentObservations,
  type DataFailureKind,
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

export interface DailySnapshot {
  humanState: HumanStateVector;
  overview: DailyOverview;
  source: 'live' | 'cache';
  cachedAt: string | null;
  degradedBy: DataFailureKind | null;
}

type DailySnapshotCachePayload = Pick<DailySnapshot, 'humanState' | 'overview'>;

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

function deriveDailyOverview(
  observations: readonly Observation[],
  targets: UserTargets | null,
  generatedAt: string,
): DailyOverview {
  const balance = targets
    ? calculateBalance(deriveBalanceSignals(observations, generatedAt), targets)
    : null;
  const momentum = momentumMetrics.flatMap(({ metric, higherIsBetter }) => {
    const summary = summarizeTemporalMetric(observations, metric, generatedAt, higherIsBetter).momentum;
    if (summary.direction === 'unknown' || summary.confidence.level === 'insufficient') return [];
    return [{ metric, momentum: summary }];
  });
  return { balance, momentum };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isConfidence(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    ['insufficient', 'possible', 'likely', 'known'].includes(String(value.level)) &&
    typeof value.score === 'number' &&
    typeof value.evidenceCount === 'number' &&
    (value.freshnessDays === null || typeof value.freshnessDays === 'number')
  );
}

function isEvidence(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    ['observed', 'self_reported', 'inferred'].includes(String(value.source)) &&
    typeof value.observedAt === 'string' &&
    typeof value.label === 'string'
  );
}

function isHumanStateVector(value: unknown): value is HumanStateVector {
  if (!isRecord(value) || typeof value.generatedAt !== 'string') return false;
  if (!['cold_start', 'learning', 'personalized'].includes(String(value.maturity))) return false;
  if (!Array.isArray(value.components)) return false;
  return value.components.every((component) => {
    if (!isRecord(component) || typeof component.key !== 'string') return false;
    if (component.value !== null && typeof component.value !== 'number') return false;
    if (!isConfidence(component.confidence) || !Array.isArray(component.evidence)) return false;
    if (!component.evidence.every(isEvidence)) return false;
    return ['observed', 'self_reported', 'inferred', 'unknown'].includes(String(component.source));
  });
}

function isDailyOverview(value: unknown): value is DailyOverview {
  if (!isRecord(value) || !Array.isArray(value.momentum)) return false;
  if (value.balance !== null) {
    if (!isRecord(value.balance)) return false;
    if (value.balance.score !== null && typeof value.balance.score !== 'number') return false;
    if (!isConfidence(value.balance.confidence) || !Array.isArray(value.balance.evidence)) return false;
    if (!value.balance.evidence.every(isEvidence)) return false;
  }
  return value.momentum.every((signal) => {
    if (!isRecord(signal) || !momentumMetrics.some(({ metric }) => metric === signal.metric)) return false;
    if (!isRecord(signal.momentum)) return false;
    if (!['improving', 'stable', 'declining', 'unknown'].includes(String(signal.momentum.direction))) return false;
    return (
      isConfidence(signal.momentum.confidence) &&
      Array.isArray(signal.momentum.evidence) &&
      signal.momentum.evidence.every(isEvidence)
    );
  });
}

function isDailySnapshotCachePayload(value: unknown): value is DailySnapshotCachePayload {
  return isRecord(value) && isHumanStateVector(value.humanState) && isDailyOverview(value.overview);
}

function canUseCachedSnapshot(kind: DataFailureKind) {
  return kind === 'unavailable' || kind === 'not-configured' || kind === 'session-expired';
}

export async function loadDailySnapshot(
  userId: string,
  generatedAt = new Date().toISOString(),
): Promise<DataResult<DailySnapshot>> {
  const current = Date.parse(generatedAt);
  if (!Number.isFinite(current)) return { ok: false, error: { kind: 'invalid' } };

  const since = new Date(current - BASELINE_WINDOW_MS).toISOString();
  const [observationResult, targetResult] = await Promise.all([
    loadRecentObservations(userId, since),
    loadUserTargets(userId),
  ]);

  if (observationResult.ok && targetResult.ok) {
    const observations = observationResult.value.map(toCoreObservation);
    const payload: DailySnapshotCachePayload = {
      humanState: deriveHumanStateVector(observations, generatedAt),
      overview: deriveDailyOverview(observations, targetResult.value, generatedAt),
    };
    const cachedAt = new Date().toISOString();
    await writeRecentDailySnapshot(userId, payload, cachedAt);
    return {
      ok: true,
      value: { ...payload, source: 'live', cachedAt: null, degradedBy: null },
    };
  }

  const failure = !observationResult.ok ? observationResult.error : !targetResult.ok ? targetResult.error : { kind: 'unknown' as const };
  if (canUseCachedSnapshot(failure.kind)) {
    const cached = await readRecentDailySnapshot(userId, current);
    if (cached.ok && cached.value && isDailySnapshotCachePayload(cached.value.payload)) {
      return {
        ok: true,
        value: {
          ...cached.value.payload,
          source: 'cache',
          cachedAt: cached.value.cachedAt,
          degradedBy: failure.kind,
        },
      };
    }
  }

  return { ok: false, error: failure };
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
  return {
    ok: true,
    value: deriveDailyOverview(observations, targetResult.value, generatedAt),
  };
}
