import type { Confidence, EvidenceRef } from './types';

export type CostOfYesStatus = 'insufficient' | 'manageable' | 'tight' | 'displacing';
export type CostOfYesContextSource = 'self_reported' | 'calendar' | 'combined' | 'unknown';
export type CostOfYesReason =
  | 'missing_commitment'
  | 'missing_margin'
  | 'within_margin'
  | 'uses_most_margin'
  | 'exceeds_margin';

export interface CostOfYesInput {
  commitmentMinutesPerWeek: number | null;
  availableMarginMinutesPerWeek: number | null;
  source: CostOfYesContextSource;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface CostOfYesAssessment {
  status: CostOfYesStatus;
  reason: CostOfYesReason;
  commitmentMinutesPerWeek: number | null;
  availableMarginMinutesPerWeek: number | null;
  remainingMarginMinutesPerWeek: number | null;
  displacedMinutesPerWeek: number | null;
  marginUsedPercent: number | null;
  source: CostOfYesContextSource;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

const MINUTES_PER_WEEK = 7 * 24 * 60;

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function validMinutes(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MINUTES_PER_WEEK;
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

function withEvidenceCount(base: Confidence, evidenceCount: number, usable: boolean): Confidence {
  if (!usable) {
    return {
      level: 'insufficient',
      score: 0,
      evidenceCount,
      freshnessDays: base.freshnessDays,
    };
  }

  const score = Math.max(0, Math.min(1, Number.isFinite(base.score) ? base.score : 0));
  return {
    ...base,
    level: confidenceLevel(score),
    score: round(score, 3),
    evidenceCount,
  };
}

export function assessCostOfYes(input: CostOfYesInput): CostOfYesAssessment {
  const evidence = uniqueEvidence(input.evidence);
  const commitmentValid = validMinutes(input.commitmentMinutesPerWeek);
  const marginValid = validMinutes(input.availableMarginMinutesPerWeek);
  const usable = commitmentValid && marginValid;
  const confidence = withEvidenceCount(input.confidence, evidence.length, usable);

  if (!commitmentValid) {
    return {
      status: 'insufficient',
      reason: 'missing_commitment',
      commitmentMinutesPerWeek: null,
      availableMarginMinutesPerWeek: marginValid ? input.availableMarginMinutesPerWeek : null,
      remainingMarginMinutesPerWeek: null,
      displacedMinutesPerWeek: null,
      marginUsedPercent: null,
      source: input.source,
      confidence,
      evidence,
    };
  }

  if (!marginValid) {
    return {
      status: 'insufficient',
      reason: 'missing_margin',
      commitmentMinutesPerWeek: input.commitmentMinutesPerWeek,
      availableMarginMinutesPerWeek: null,
      remainingMarginMinutesPerWeek: null,
      displacedMinutesPerWeek: null,
      marginUsedPercent: null,
      source: input.source,
      confidence,
      evidence,
    };
  }

  const commitment = input.commitmentMinutesPerWeek as number;
  const margin = input.availableMarginMinutesPerWeek as number;
  const remaining = Math.max(0, margin - commitment);
  const displaced = Math.max(0, commitment - margin);
  const marginUsedPercent =
    margin === 0 ? (commitment === 0 ? 0 : null) : round((commitment / margin) * 100, 1);

  if (commitment > margin) {
    return {
      status: 'displacing',
      reason: 'exceeds_margin',
      commitmentMinutesPerWeek: commitment,
      availableMarginMinutesPerWeek: margin,
      remainingMarginMinutesPerWeek: round(remaining, 1),
      displacedMinutesPerWeek: round(displaced, 1),
      marginUsedPercent,
      source: input.source,
      confidence,
      evidence,
    };
  }

  const usesMostMargin = margin > 0 && commitment / margin > 0.5;
  return {
    status: usesMostMargin ? 'tight' : 'manageable',
    reason: usesMostMargin ? 'uses_most_margin' : 'within_margin',
    commitmentMinutesPerWeek: commitment,
    availableMarginMinutesPerWeek: margin,
    remainingMarginMinutesPerWeek: round(remaining, 1),
    displacedMinutesPerWeek: 0,
    marginUsedPercent,
    source: input.source,
    confidence,
    evidence,
  };
}
