import type { Confidence, EvidenceRef } from './types';

export type RelationshipStatus = 'insufficient' | 'association' | 'hypothesis';

export const LEARNING_CONFIG = Object.freeze({
  patternMinimumPairs: 3,
  patternTargetPairs: 8,
  experimentConfidenceBoost: 0.15,
  feedbackTargetSamples: 5,
  feedbackWindowDays: 90,
  feedbackHalfLifeDays: 30,
});

export interface RelationshipPair {
  id: string;
  fromValue: number | null;
  toValue: number | null;
  observedAt: string;
  experimental: boolean;
  evidence: readonly EvidenceRef[];
}

export interface RelationshipHypothesis {
  fromKey: string;
  toKey: string;
  status: RelationshipStatus;
  effect: number | null;
  direction: 'positive' | 'negative' | 'none' | 'unknown';
  sampleSize: number;
  experimentalSamples: number;
  windowDays: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
  caveat: string;
}

export interface ActionOutcomeFeedback {
  id: string;
  actionId: string;
  completed: boolean;
  benefit: number | null;
  observedAt: string;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface ActionUsefulnessEstimate {
  actionId: string;
  usefulness: number | null;
  feedbackCount: number;
  adherenceCount: number;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
  reason: string;
}

const DAY_MS = 86_400_000;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampSigned100(value: number): number {
  return Math.max(-100, Math.min(100, value));
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function validPercent(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

function validBenefit(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -100 && value <= 100;
}

function confidenceLevel(score: number): Confidence['level'] {
  if (score >= 0.75) return 'known';
  if (score >= 0.5) return 'likely';
  if (score >= 0.25) return 'possible';
  return 'insufficient';
}

function uniqueEvidence(items: readonly EvidenceRef[]): EvidenceRef[] {
  const byKey = new Map<string, EvidenceRef>();
  for (const item of items) {
    const key = `${item.id}|${item.observedAt}|${item.label}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }
  return [...byKey.values()].sort((left, right) => {
    const timeOrder = Date.parse(left.observedAt) - Date.parse(right.observedAt);
    return timeOrder !== 0 ? timeOrder : left.id.localeCompare(right.id);
  });
}

function confidence(score: number, evidence: readonly EvidenceRef[], freshnessDays: number | null): Confidence {
  const bounded = round(clamp01(score));
  return {
    level: confidenceLevel(bounded),
    score: bounded,
    evidenceCount: evidence.length,
    freshnessDays,
  };
}

function pearson(pairs: readonly { x: number; y: number }[]): number | null {
  if (pairs.length < 2) return null;
  const meanX = pairs.reduce((total, pair) => total + pair.x, 0) / pairs.length;
  const meanY = pairs.reduce((total, pair) => total + pair.y, 0) / pairs.length;
  let numerator = 0;
  let xVariance = 0;
  let yVariance = 0;

  for (const pair of pairs) {
    const x = pair.x - meanX;
    const y = pair.y - meanY;
    numerator += x * y;
    xVariance += x * x;
    yVariance += y * y;
  }

  const denominator = Math.sqrt(xVariance * yVariance);
  if (!Number.isFinite(denominator) || denominator === 0) return null;
  return round(Math.max(-1, Math.min(1, numerator / denominator)), 3);
}

function windowDays(dates: readonly string[]): number | null {
  const timestamps = dates.map(Date.parse).filter(Number.isFinite);
  if (timestamps.length < 2) return null;
  return round((Math.max(...timestamps) - Math.min(...timestamps)) / DAY_MS, 1);
}

export function evaluateRelationshipHypothesis(
  fromKey: string,
  toKey: string,
  pairs: readonly RelationshipPair[],
): RelationshipHypothesis {
  const usable = pairs
    .filter((pair) => validPercent(pair.fromValue) && validPercent(pair.toValue))
    .sort((left, right) => {
      const timeOrder = Date.parse(left.observedAt) - Date.parse(right.observedAt);
      return timeOrder !== 0 ? timeOrder : left.id.localeCompare(right.id);
    });
  const evidence = uniqueEvidence(usable.flatMap((pair) => pair.evidence));
  const experimentalSamples = usable.filter((pair) => pair.experimental).length;
  const sampleSize = usable.length;
  const spanDays = windowDays(usable.map((pair) => pair.observedAt));

  if (sampleSize < LEARNING_CONFIG.patternMinimumPairs) {
    return {
      fromKey,
      toKey,
      status: 'insufficient',
      effect: null,
      direction: 'unknown',
      sampleSize,
      experimentalSamples,
      windowDays: spanDays,
      confidence: confidence(0, evidence, null),
      evidence,
      caveat: 'Insufficient paired observations to estimate an association.',
    };
  }

  const effect = pearson(
    usable.map((pair) => ({ x: pair.fromValue as number, y: pair.toValue as number })),
  );
  if (effect === null) {
    return {
      fromKey,
      toKey,
      status: 'insufficient',
      effect: null,
      direction: 'unknown',
      sampleSize,
      experimentalSamples,
      windowDays: spanDays,
      confidence: confidence(0, evidence, null),
      evidence,
      caveat: 'Paired observations do not contain enough variation to estimate an association.',
    };
  }

  const sampleScore = clamp01(sampleSize / LEARNING_CONFIG.patternTargetPairs);
  const experimentBoost =
    experimentalSamples > 0 ? LEARNING_CONFIG.experimentConfidenceBoost : 0;
  const confidenceScore = clamp01(sampleScore * 0.7 + Math.abs(effect) * 0.3 + experimentBoost);
  const direction =
    Math.abs(effect) < 0.1 ? 'none' : effect > 0 ? 'positive' : 'negative';
  const status: RelationshipStatus =
    confidenceScore >= 0.5 && Math.abs(effect) >= 0.25 ? 'hypothesis' : 'association';

  return {
    fromKey,
    toKey,
    status,
    effect,
    direction,
    sampleSize,
    experimentalSamples,
    windowDays: spanDays,
    confidence: confidence(confidenceScore, evidence, null),
    evidence,
    caveat:
      experimentalSamples > 0
        ? 'Personal experimental evidence strengthens this hypothesis but does not prove universal causality.'
        : 'This is an observed association, not proof that one factor caused the other.',
  };
}

function ageDays(observedAt: string, now: string): number | null {
  const observed = Date.parse(observedAt);
  const current = Date.parse(now);
  if (!Number.isFinite(observed) || !Number.isFinite(current)) return null;
  return Math.max(0, (current - observed) / DAY_MS);
}

export function estimateActionUsefulness(
  actionId: string,
  feedback: readonly ActionOutcomeFeedback[],
  now: string,
): ActionUsefulnessEstimate {
  const relevant = feedback
    .filter((item) => item.actionId === actionId)
    .sort((left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt));
  const adherenceCount = relevant.filter((item) => item.completed).length;
  const withBenefit = relevant.filter((item) => {
    const age = ageDays(item.observedAt, now);
    return validBenefit(item.benefit) && age !== null && age <= LEARNING_CONFIG.feedbackWindowDays;
  });
  const evidence = uniqueEvidence(withBenefit.flatMap((item) => item.evidence));

  if (withBenefit.length === 0) {
    return {
      actionId,
      usefulness: null,
      feedbackCount: 0,
      adherenceCount,
      confidence: confidence(0, evidence, null),
      evidence,
      reason:
        adherenceCount > 0
          ? 'Completion is adherence evidence only; no outcome benefit was reported.'
          : 'No usable personal outcome feedback is available.',
    };
  }

  let weightedBenefit = 0;
  let totalWeight = 0;
  let freshest: number | null = null;

  for (const item of withBenefit) {
    const age = ageDays(item.observedAt, now);
    if (age === null || !validBenefit(item.benefit)) continue;
    const recencyWeight = 0.5 ** (age / LEARNING_CONFIG.feedbackHalfLifeDays);
    const evidenceWeight = Math.max(0.25, clamp01(item.confidence.score));
    const weight = recencyWeight * evidenceWeight;
    weightedBenefit += item.benefit * weight;
    totalWeight += weight;
    freshest = freshest === null ? age : Math.min(freshest, age);
  }

  if (totalWeight === 0) {
    return {
      actionId,
      usefulness: null,
      feedbackCount: 0,
      adherenceCount,
      confidence: confidence(0, evidence, freshest),
      evidence,
      reason: 'Outcome feedback exists but has insufficient usable weight.',
    };
  }

  const usefulness = round(clampSigned100(weightedBenefit / totalWeight), 1);
  const sampleScore = clamp01(withBenefit.length / LEARNING_CONFIG.feedbackTargetSamples);
  const averageEvidenceConfidence =
    withBenefit.reduce((total, item) => total + clamp01(item.confidence.score), 0) /
    withBenefit.length;
  const freshnessScore =
    freshest === null
      ? 0.4
      : freshest <= 7
        ? 1
        : freshest <= 30
          ? 0.8
          : freshest <= 60
            ? 0.6
            : 0.4;
  const confidenceScore = sampleScore * averageEvidenceConfidence * freshnessScore;

  return {
    actionId,
    usefulness,
    feedbackCount: withBenefit.length,
    adherenceCount,
    confidence: confidence(confidenceScore, evidence, freshest === null ? null : round(freshest, 1)),
    evidence,
    reason: `Estimate uses ${withBenefit.length} personal outcome report${withBenefit.length === 1 ? '' : 's'} with recency weighting; completion alone does not count as benefit.`,
  };
}
