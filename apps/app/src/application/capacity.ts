import {
  calculateConfidence,
  calculateLifeBuffer,
  calculateLifeDebt,
  type CapacitySignal,
  type Confidence,
  type EvidenceRef,
  type LifeBufferSummary,
  type LifeDebtResult,
} from '@mizan/core';

import { loadUserTargets } from '@/application/user-targets';
import {
  loadRecentObservations,
  type DataResult,
  type StoredObservation,
} from '@/infrastructure/supabase/data-access';

const DAY_MS = 86_400_000;
const HISTORY_DAYS = 14;
const WINDOW_DAYS = 7;

const domainMetrics = {
  recovery: [
    { metric: 'recovery', higherIsBetter: true },
    { metric: 'energy', higherIsBetter: true },
  ],
  connection: [{ metric: 'connection', higherIsBetter: true }],
  work: [
    { metric: 'mental_load', higherIsBetter: false },
    { metric: 'clarity', higherIsBetter: true },
  ],
  margin: [{ metric: 'perceived_control', higherIsBetter: true }],
} as const;

export interface CapacitySnapshot {
  generatedAt: string;
  debts: readonly LifeDebtResult[];
  buffer: LifeBufferSummary;
}

function numericValue(row: StoredObservation): number | null {
  if (typeof row.value_number !== 'number' || !Number.isFinite(row.value_number)) return null;
  if (row.value_number < 0 || row.value_number > 100) return null;
  return row.value_number;
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

function evidence(row: StoredObservation): EvidenceRef {
  return {
    id: row.id,
    source: row.source === 'user' ? 'self_reported' : row.source === 'integration' ? 'observed' : 'inferred',
    observedAt: row.observed_at,
    label: row.metric,
  };
}

function inRange(row: StoredObservation, start: number, end: number): boolean {
  const timestamp = Date.parse(row.observed_at);
  return Number.isFinite(timestamp) && timestamp >= start && timestamp <= end && numericValue(row) !== null;
}

function metricWindow(
  rows: readonly StoredObservation[],
  metric: string,
  start: number,
  end: number,
  generatedAt: string,
) {
  const relevant = rows.filter((row) => row.metric === metric && inRange(row, start, end));
  const values = relevant.map(numericValue).filter((value): value is number => value !== null);
  const refs = relevant.map(evidence);
  return {
    median: median(values),
    confidence: calculateConfidence(refs, generatedAt, 3),
    evidence: refs,
  };
}

function combineConfidence(confidences: readonly Confidence[], evidenceRefs: readonly EvidenceRef[]): Confidence {
  if (confidences.length === 0) return calculateConfidence([], new Date(0).toISOString(), 3);
  const score = confidences.reduce((total, item) => total + item.score, 0) / confidences.length;
  const freshness = confidences
    .map((item) => item.freshnessDays)
    .filter((value): value is number => value !== null);
  return {
    level: score >= 0.75 ? 'known' : score >= 0.5 ? 'likely' : score >= 0.25 ? 'possible' : 'insufficient',
    score: Math.round(score * 1000) / 1000,
    evidenceCount: evidenceRefs.length,
    freshnessDays: freshness.length > 0 ? Math.min(...freshness) : null,
  };
}

function uniqueEvidence(items: readonly EvidenceRef[]): EvidenceRef[] {
  const seen = new Map<string, EvidenceRef>();
  for (const item of items) {
    if (!seen.has(item.id)) seen.set(item.id, item);
  }
  return [...seen.values()].sort((left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt));
}

function orientedDomainWindow(
  rows: readonly StoredObservation[],
  domainId: keyof typeof domainMetrics,
  start: number,
  end: number,
  generatedAt: string,
) {
  const summaries = domainMetrics[domainId].map(({ metric, higherIsBetter }) => {
    const summary = metricWindow(rows, metric, start, end, generatedAt);
    return {
      value:
        summary.median === null
          ? null
          : higherIsBetter
            ? summary.median
            : 100 - summary.median,
      confidence: summary.confidence,
      evidence: summary.evidence,
    };
  });
  const known = summaries.filter((summary) => summary.value !== null);
  const refs = uniqueEvidence(known.flatMap((summary) => summary.evidence));
  return {
    value: median(known.map((summary) => summary.value as number)),
    confidence: combineConfidence(known.map((summary) => summary.confidence), refs),
    evidence: refs,
  };
}

function capacitySignal(
  key: string,
  capacity: ReturnType<typeof metricWindow>,
  load: ReturnType<typeof metricWindow>,
): CapacitySignal {
  const refs = uniqueEvidence([...capacity.evidence, ...load.evidence]);
  const confidences = [capacity, load]
    .filter((item) => item.median !== null)
    .map((item) => item.confidence);
  return {
    key,
    capacity: capacity.median,
    load: load.median,
    weight: 1,
    confidence: combineConfidence(confidences, refs),
    evidence: refs,
  };
}

export async function loadCapacitySnapshot(
  userId: string,
  generatedAt = new Date().toISOString(),
): Promise<DataResult<CapacitySnapshot>> {
  const now = Date.parse(generatedAt);
  if (!Number.isFinite(now)) return { ok: false, error: { kind: 'invalid' } };
  const since = new Date(now - HISTORY_DAYS * DAY_MS).toISOString();
  const [observationResult, targetResult] = await Promise.all([
    loadRecentObservations(userId, since, 500),
    loadUserTargets(userId),
  ]);
  if (!observationResult.ok) return observationResult;
  if (!targetResult.ok) return targetResult;

  const rows = observationResult.value;
  const recentStart = now - WINDOW_DAYS * DAY_MS;
  const priorStart = now - HISTORY_DAYS * DAY_MS;
  const priorEnd = recentStart - 1;
  const targets = targetResult.value;

  const debtDomains = (['recovery', 'connection', 'work', 'margin'] as const).filter(
    (domainId) => (targets?.dimensionWeights[domainId] ?? 0) > 0,
  );
  const debts = debtDomains.map((domainId) => {
    const recent = orientedDomainWindow(rows, domainId, recentStart, now, generatedAt);
    const prior = orientedDomainWindow(rows, domainId, priorStart, priorEnd, generatedAt);
    const target = targets?.dimensionBaselines?.[domainId] ?? null;
    const priorDebt =
      target !== null && prior.value !== null ? Math.max(0, Math.min(100, target - prior.value)) : null;
    const refs = uniqueEvidence([...prior.evidence, ...recent.evidence]);
    const confidence = combineConfidence(
      [recent, prior].filter((item) => item.value !== null).map((item) => item.confidence),
      refs,
    );
    return calculateLifeDebt({
      dimensionId: domainId,
      targetNeed: target,
      metNeed: recent.value,
      priorAmount: priorDebt,
      elapsedDays: WINDOW_DAYS,
      urgency: null,
      confidence,
      evidence: refs,
    });
  });

  const recovery = metricWindow(rows, 'recovery', recentStart, now, generatedAt);
  const energyDeficitBase = metricWindow(rows, 'energy', recentStart, now, generatedAt);
  const energyDeficit = {
    ...energyDeficitBase,
    median: energyDeficitBase.median === null ? null : 100 - energyDeficitBase.median,
  };
  const perceivedControl = metricWindow(rows, 'perceived_control', recentStart, now, generatedAt);
  const mentalLoad = metricWindow(rows, 'mental_load', recentStart, now, generatedAt);
  const connection = metricWindow(rows, 'connection', recentStart, now, generatedAt);

  const buffer = calculateLifeBuffer([
    capacitySignal('recovery_capacity', recovery, energyDeficit),
    capacitySignal('time_control', perceivedControl, mentalLoad),
    capacitySignal('connection_support', connection, mentalLoad),
  ]);

  return { ok: true, value: { generatedAt, debts, buffer } };
}
