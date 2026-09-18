import type { Confidence, EvidenceRef } from './types';

export type HumanROIStatus =
  | 'protected'
  | 'insufficient'
  | 'benefit_heavier'
  | 'mixed'
  | 'cost_heavier';
export type HumanROIReason =
  | 'protected_meaning'
  | 'missing_benefit'
  | 'missing_effort'
  | 'missing_time'
  | 'benefit_exceeds_effort'
  | 'benefit_and_effort_close'
  | 'effort_exceeds_benefit';

export interface HumanROIInput {
  benefitRating: number | null;
  effortRating: number | null;
  timeMinutesPerWeek: number | null;
  protectedMeaning: boolean;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface HumanROIAssessment {
  status: HumanROIStatus;
  reason: HumanROIReason;
  benefitRating: number | null;
  effortRating: number | null;
  timeMinutesPerWeek: number | null;
  benefitEffortDelta: number | null;
  protectedMeaning: boolean;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

const MINUTES_PER_WEEK = 7 * 24 * 60;

function validRating(value: number | null): value is number {
  return Number.isInteger(value) && value !== null && value >= 1 && value <= 5;
}

function validMinutes(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MINUTES_PER_WEEK;
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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

function normalizedConfidence(
  base: Confidence,
  evidenceCount: number,
  usable: boolean,
): Confidence {
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
    score: round(score),
    evidenceCount,
  };
}

export function assessHumanROI(input: HumanROIInput): HumanROIAssessment {
  const evidence = uniqueEvidence(input.evidence);

  if (input.protectedMeaning) {
    return {
      status: 'protected',
      reason: 'protected_meaning',
      benefitRating: null,
      effortRating: null,
      timeMinutesPerWeek: null,
      benefitEffortDelta: null,
      protectedMeaning: true,
      confidence: normalizedConfidence(input.confidence, evidence.length, true),
      evidence,
    };
  }

  const benefitValid = validRating(input.benefitRating);
  const effortValid = validRating(input.effortRating);
  const timeValid = validMinutes(input.timeMinutesPerWeek);
  const usable = benefitValid && effortValid && timeValid;
  const confidence = normalizedConfidence(input.confidence, evidence.length, usable);

  if (!benefitValid) {
    return {
      status: 'insufficient',
      reason: 'missing_benefit',
      benefitRating: null,
      effortRating: effortValid ? input.effortRating : null,
      timeMinutesPerWeek: timeValid ? input.timeMinutesPerWeek : null,
      benefitEffortDelta: null,
      protectedMeaning: false,
      confidence,
      evidence,
    };
  }

  if (!effortValid) {
    return {
      status: 'insufficient',
      reason: 'missing_effort',
      benefitRating: input.benefitRating,
      effortRating: null,
      timeMinutesPerWeek: timeValid ? input.timeMinutesPerWeek : null,
      benefitEffortDelta: null,
      protectedMeaning: false,
      confidence,
      evidence,
    };
  }

  if (!timeValid) {
    return {
      status: 'insufficient',
      reason: 'missing_time',
      benefitRating: input.benefitRating,
      effortRating: input.effortRating,
      timeMinutesPerWeek: null,
      benefitEffortDelta: null,
      protectedMeaning: false,
      confidence,
      evidence,
    };
  }

  const delta = input.benefitRating - input.effortRating;
  const status: HumanROIStatus =
    delta >= 2 ? 'benefit_heavier' : delta <= -2 ? 'cost_heavier' : 'mixed';
  const reason: HumanROIReason =
    status === 'benefit_heavier'
      ? 'benefit_exceeds_effort'
      : status === 'cost_heavier'
        ? 'effort_exceeds_benefit'
        : 'benefit_and_effort_close';

  return {
    status,
    reason,
    benefitRating: input.benefitRating,
    effortRating: input.effortRating,
    timeMinutesPerWeek: input.timeMinutesPerWeek,
    benefitEffortDelta: delta,
    protectedMeaning: false,
    confidence,
    evidence,
  };
}
