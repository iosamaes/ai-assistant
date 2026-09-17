import { ENGINE_CONFIG } from './engine';
import type { Confidence, EvidenceRef, UserTargets } from './types';

export interface DimensionBalanceSignal {
  dimensionId: string;
  currentWeight: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface DimensionBalanceDetail {
  dimensionId: string;
  currentShare: number | null;
  targetShare: number;
  deviation: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface BalanceSummary {
  seasonId: string | null;
  score: number | null;
  distanceFromTarget: number | null;
  confidence: Confidence;
  dimensions: readonly DimensionBalanceDetail[];
  missingDimensionIds: readonly string[];
  evidence: readonly EvidenceRef[];
}

const MIN_COMPARABLE_DIMENSIONS = 2;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function confidenceLevel(score: number): Confidence['level'] {
  if (score >= ENGINE_CONFIG.confidenceKnownThreshold) return 'known';
  if (score >= ENGINE_CONFIG.confidenceLikelyThreshold) return 'likely';
  if (score >= ENGINE_CONFIG.confidencePossibleThreshold) return 'possible';
  return 'insufficient';
}

function validWeight(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function activeTargetEntries(targets: UserTargets): Array<[string, number]> {
  return Object.entries(targets.dimensionWeights)
    .filter((entry): entry is [string, number] => Number.isFinite(entry[1]) && entry[1] > 0)
    .sort(([left], [right]) => left.localeCompare(right));
}

function uniqueEvidence(signals: readonly DimensionBalanceSignal[]): EvidenceRef[] {
  const byKey = new Map<string, EvidenceRef>();
  for (const signal of signals) {
    for (const item of signal.evidence) {
      const key = `${item.id}|${item.observedAt}|${item.label}`;
      if (!byKey.has(key)) byKey.set(key, item);
    }
  }
  return [...byKey.values()].sort((left, right) => {
    const timeOrder = Date.parse(left.observedAt) - Date.parse(right.observedAt);
    return timeOrder !== 0 ? timeOrder : left.id.localeCompare(right.id);
  });
}

function combineConfidence(
  activeTargets: readonly [string, number][],
  signalsById: ReadonlyMap<string, DimensionBalanceSignal>,
  evidence: readonly EvidenceRef[],
): Confidence {
  const totalTargetWeight = activeTargets.reduce((total, [, weight]) => total + weight, 0);
  if (totalTargetWeight <= 0 || activeTargets.length === 0) {
    return { level: 'insufficient', score: 0, evidenceCount: 0, freshnessDays: null };
  }

  let weightedScore = 0;
  let coveredTargetWeight = 0;
  const freshnessValues: number[] = [];

  for (const [dimensionId, targetWeight] of activeTargets) {
    const signal = signalsById.get(dimensionId);
    if (!signal || !validWeight(signal.currentWeight)) continue;
    coveredTargetWeight += targetWeight;
    weightedScore += targetWeight * clamp01(signal.confidence.score);
    if (signal.confidence.freshnessDays !== null) {
      freshnessValues.push(signal.confidence.freshnessDays);
    }
  }

  const coverage = coveredTargetWeight / totalTargetWeight;
  const averageCoveredConfidence =
    coveredTargetWeight > 0 ? weightedScore / coveredTargetWeight : 0;
  const score = round(clamp01(averageCoveredConfidence * coverage));

  return {
    level: confidenceLevel(score),
    score,
    evidenceCount: evidence.length,
    freshnessDays: freshnessValues.length > 0 ? round(Math.min(...freshnessValues), 2) : null,
  };
}

export function calculateBalance(
  signals: readonly DimensionBalanceSignal[],
  targets: UserTargets,
): BalanceSummary {
  const activeTargets = activeTargetEntries(targets);
  const signalsById = new Map(signals.map((signal) => [signal.dimensionId, signal]));
  const relevantSignals = signals.filter((signal) =>
    activeTargets.some(([dimensionId]) => dimensionId === signal.dimensionId),
  );
  const evidence = uniqueEvidence(relevantSignals);
  const confidence = combineConfidence(activeTargets, signalsById, evidence);
  const totalTargetWeight = activeTargets.reduce((total, [, weight]) => total + weight, 0);
  const missingDimensionIds = activeTargets
    .filter(([dimensionId]) => !validWeight(signalsById.get(dimensionId)?.currentWeight))
    .map(([dimensionId]) => dimensionId);

  const currentTotal = activeTargets.reduce((total, [dimensionId]) => {
    const currentWeight = signalsById.get(dimensionId)?.currentWeight;
    return validWeight(currentWeight) ? total + currentWeight : total;
  }, 0);
  const canCompare =
    activeTargets.length >= MIN_COMPARABLE_DIMENSIONS &&
    missingDimensionIds.length === 0 &&
    totalTargetWeight > 0 &&
    currentTotal > 0;

  const dimensions: DimensionBalanceDetail[] = activeTargets.map(([dimensionId, targetWeight]) => {
    const signal = signalsById.get(dimensionId);
    const targetShare = totalTargetWeight > 0 ? targetWeight / totalTargetWeight : 0;
    const currentShare =
      canCompare && signal && validWeight(signal.currentWeight)
        ? signal.currentWeight / currentTotal
        : null;

    return {
      dimensionId,
      currentShare: currentShare === null ? null : round(currentShare),
      targetShare: round(targetShare),
      deviation: currentShare === null ? null : round(currentShare - targetShare),
      confidence:
        signal?.confidence ?? {
          level: 'insufficient',
          score: 0,
          evidenceCount: 0,
          freshnessDays: null,
        },
      evidence: signal?.evidence ?? [],
    };
  });

  if (!canCompare) {
    return {
      seasonId: targets.seasonId,
      score: null,
      distanceFromTarget: null,
      confidence,
      dimensions,
      missingDimensionIds,
      evidence,
    };
  }

  const l1Distance = dimensions.reduce(
    (total, dimension) => total + Math.abs(dimension.deviation ?? 0),
    0,
  );
  const distanceFromTarget = round(clamp01(l1Distance / 2) * 100, 1);
  const score = round(100 - distanceFromTarget, 1);

  return {
    seasonId: targets.seasonId,
    score,
    distanceFromTarget,
    confidence,
    dimensions,
    missingDimensionIds,
    evidence,
  };
}
