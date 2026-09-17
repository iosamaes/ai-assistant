import { calculateConfidence } from './engine';
import type { Confidence, EvidenceRef, Observation } from './types';

export type TemporalWindowName = 'day' | 'week' | 'month' | 'quarter';
export type MomentumDirection = 'improving' | 'stable' | 'declining' | 'unknown';

export interface TemporalWindowSummary {
  window: TemporalWindowName;
  days: number;
  median: number | null;
  evidenceCount: number;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface MomentumSummary {
  direction: MomentumDirection;
  relativeChange: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface TemporalMetricSummary {
  metric: string;
  windows: Readonly<Record<TemporalWindowName, TemporalWindowSummary>>;
  momentum: MomentumSummary;
}

export const TEMPORAL_WINDOWS: Readonly<Record<TemporalWindowName, number>> = Object.freeze({
  day: 1,
  week: 7,
  month: 28,
  quarter: 90,
});

const DAY_MS = 86_400_000;

function parseTimestamp(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function numericValue(observation: Observation): number | null {
  return typeof observation.value === 'number' && Number.isFinite(observation.value)
    ? observation.value
    : null;
}

function evidenceFromObservation(observation: Observation): EvidenceRef {
  return {
    id: observation.id,
    source: observation.source,
    observedAt: observation.observedAt,
    label: `${observation.dimensionId}:${observation.metric}`,
  };
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

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function observationsInRange(
  observations: readonly Observation[],
  metric: string,
  startInclusive: number,
  endInclusive: number,
): Observation[] {
  return observations
    .filter((observation) => observation.metric === metric)
    .filter((observation) => numericValue(observation) !== null)
    .filter((observation) => {
      const timestamp = parseTimestamp(observation.observedAt);
      return timestamp !== null && timestamp >= startInclusive && timestamp <= endInclusive;
    })
    .sort((left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt));
}

function targetEvidenceCount(window: TemporalWindowName): number {
  if (window === 'day') return 1;
  if (window === 'week') return 3;
  if (window === 'month') return 5;
  return 7;
}

function summarizeWindow(
  observations: readonly Observation[],
  metric: string,
  now: string,
  window: TemporalWindowName,
): TemporalWindowSummary {
  const nowMs = parseTimestamp(now);
  const days = TEMPORAL_WINDOWS[window];
  if (nowMs === null) {
    return {
      window,
      days,
      median: null,
      evidenceCount: 0,
      confidence: calculateConfidence([], now, targetEvidenceCount(window)),
      evidence: [],
    };
  }

  const relevant = observationsInRange(
    observations,
    metric,
    nowMs - days * DAY_MS,
    nowMs,
  );
  const values = relevant
    .map(numericValue)
    .filter((value): value is number => value !== null);
  const evidence = relevant.map(evidenceFromObservation);

  return {
    window,
    days,
    median: median(values),
    evidenceCount: evidence.length,
    confidence: calculateConfidence(evidence, now, targetEvidenceCount(window)),
    evidence,
  };
}

function deriveMomentum(
  observations: readonly Observation[],
  metric: string,
  now: string,
  higherIsBetter: boolean,
): MomentumSummary {
  const nowMs = parseTimestamp(now);
  if (nowMs === null) {
    return {
      direction: 'unknown',
      relativeChange: null,
      confidence: calculateConfidence([], now, 6),
      evidence: [],
    };
  }

  const recent = observationsInRange(observations, metric, nowMs - 7 * DAY_MS, nowMs);
  const prior = observationsInRange(
    observations,
    metric,
    nowMs - 14 * DAY_MS,
    nowMs - 7 * DAY_MS - 1,
  );
  const recentMedian = median(
    recent.map(numericValue).filter((value): value is number => value !== null),
  );
  const priorMedian = median(
    prior.map(numericValue).filter((value): value is number => value !== null),
  );
  const evidence = [...prior, ...recent].map(evidenceFromObservation);
  const confidence = calculateConfidence(evidence, now, 6);

  if (recentMedian === null || priorMedian === null) {
    return { direction: 'unknown', relativeChange: null, confidence, evidence };
  }

  const rawRelativeChange = (recentMedian - priorMedian) / Math.max(Math.abs(priorMedian), 1);
  const orientedChange = higherIsBetter ? rawRelativeChange : -rawRelativeChange;
  const direction: MomentumDirection =
    Math.abs(orientedChange) < 0.05
      ? 'stable'
      : orientedChange > 0
        ? 'improving'
        : 'declining';

  return {
    direction,
    relativeChange: round(orientedChange),
    confidence,
    evidence,
  };
}

export function summarizeTemporalMetric(
  observations: readonly Observation[],
  metric: string,
  now: string,
  higherIsBetter = true,
): TemporalMetricSummary {
  return {
    metric,
    windows: {
      day: summarizeWindow(observations, metric, now, 'day'),
      week: summarizeWindow(observations, metric, now, 'week'),
      month: summarizeWindow(observations, metric, now, 'month'),
      quarter: summarizeWindow(observations, metric, now, 'quarter'),
    },
    momentum: deriveMomentum(observations, metric, now, higherIsBetter),
  };
}
