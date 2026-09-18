import { ENGINE_CONFIG } from './engine';
import type { Confidence } from './types';

export type ExperimentDirection = 'higher' | 'lower';
export type ExperimentOutcome = 'improved' | 'worsened' | 'no_clear_change' | 'insufficient';

export interface ExperimentPlan {
  hypothesis: string;
  metric: string;
  expectedDirection: ExperimentDirection;
  durationDays: number;
  consentedAt: string;
}

export interface ExperimentObservation {
  id: string;
  value: number;
  observedAt: string;
}

export interface ExperimentEvaluation {
  metric: string;
  baselineMedian: number | null;
  followupMedian: number | null;
  delta: number | null;
  outcome: ExperimentOutcome;
  confidence: Confidence;
  baselineEvidenceCount: number;
  followupEvidenceCount: number;
  limitations: readonly string[];
}

const DAY_MS = 86_400_000;
const MIN_SAMPLES_PER_WINDOW = 2;
const MIN_MEANINGFUL_DELTA = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  if (sorted.length === 0) return 0;
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  if (upper === undefined) return 0;
  if (sorted.length % 2 === 1) return upper;
  const lower = sorted[middle - 1] ?? upper;
  return (lower + upper) / 2;
}

function confidenceLevel(score: number): Confidence['level'] {
  if (score >= ENGINE_CONFIG.confidenceKnownThreshold) return 'known';
  if (score >= ENGINE_CONFIG.confidenceLikelyThreshold) return 'likely';
  if (score >= ENGINE_CONFIG.confidencePossibleThreshold) return 'possible';
  return 'insufficient';
}

function usableObservations(observations: readonly ExperimentObservation[]): ExperimentObservation[] {
  return observations.filter((observation) => {
    const timestamp = Date.parse(observation.observedAt);
    return Number.isFinite(timestamp) && Number.isFinite(observation.value) && observation.value >= 0 && observation.value <= 100;
  });
}

function medianAbsoluteDeviation(values: readonly number[], center: number): number {
  return median(values.map((value) => Math.abs(value - center)));
}

export function validateExperimentPlan(plan: ExperimentPlan): boolean {
  const consentedAt = Date.parse(plan.consentedAt);
  return (
    plan.hypothesis.trim().length >= 8 &&
    plan.metric.trim().length > 0 &&
    Number.isInteger(plan.durationDays) &&
    plan.durationDays >= 1 &&
    plan.durationDays <= 90 &&
    Number.isFinite(consentedAt)
  );
}

export function evaluateExperiment(input: {
  plan: ExperimentPlan;
  baseline: readonly ExperimentObservation[];
  followup: readonly ExperimentObservation[];
  now?: string;
}): ExperimentEvaluation {
  const baseline = usableObservations(input.baseline);
  const followup = usableObservations(input.followup);
  const baselineValues = baseline.map((observation) => observation.value);
  const followupValues = followup.map((observation) => observation.value);
  const baselineMedian = baselineValues.length > 0 ? median(baselineValues) : null;
  const followupMedian = followupValues.length > 0 ? median(followupValues) : null;
  const hasMinimumEvidence =
    validateExperimentPlan(input.plan) &&
    baseline.length >= MIN_SAMPLES_PER_WINDOW &&
    followup.length >= MIN_SAMPLES_PER_WINDOW;

  if (!hasMinimumEvidence || baselineMedian === null || followupMedian === null) {
    return {
      metric: input.plan.metric,
      baselineMedian,
      followupMedian,
      delta: baselineMedian === null || followupMedian === null ? null : followupMedian - baselineMedian,
      outcome: 'insufficient',
      confidence: {
        level: 'insufficient',
        score: 0,
        evidenceCount: baseline.length + followup.length,
        freshnessDays: null,
      },
      baselineEvidenceCount: baseline.length,
      followupEvidenceCount: followup.length,
      limitations: ['insufficient_evidence', 'personal_experiment_not_causal_proof'],
    };
  }

  const delta = followupMedian - baselineMedian;
  const signedImprovement = input.plan.expectedDirection === 'higher' ? delta : -delta;
  const outcome: ExperimentOutcome =
    Math.abs(signedImprovement) < MIN_MEANINGFUL_DELTA
      ? 'no_clear_change'
      : signedImprovement > 0
        ? 'improved'
        : 'worsened';

  const baselineMad = medianAbsoluteDeviation(baselineValues, baselineMedian);
  const followupMad = medianAbsoluteDeviation(followupValues, followupMedian);
  const consistency = 1 - Math.min(1, (baselineMad + followupMad) / 30);
  const sampleFactor = Math.min(1, Math.min(baseline.length, followup.length) / 5);
  const latestObservedAt = Math.max(
    ...followup.map((observation) => Date.parse(observation.observedAt)),
  );
  const nowMs = Date.parse(input.now ?? new Date().toISOString());
  const freshnessDays = Number.isFinite(nowMs)
    ? Math.max(0, (nowMs - latestObservedAt) / DAY_MS)
    : 0;
  const freshness = 1 - Math.min(0.75, freshnessDays / 90);
  const score = clamp(sampleFactor * 0.55 + consistency * 0.3 + freshness * 0.15, 0, 1);

  return {
    metric: input.plan.metric,
    baselineMedian,
    followupMedian,
    delta,
    outcome,
    confidence: {
      level: confidenceLevel(score),
      score: Math.round(score * 1000) / 1000,
      evidenceCount: baseline.length + followup.length,
      freshnessDays: Math.round(freshnessDays * 10) / 10,
    },
    baselineEvidenceCount: baseline.length,
    followupEvidenceCount: followup.length,
    limitations: ['personal_evidence_only', 'other_factors_may_have_changed', 'personal_experiment_not_causal_proof'],
  };
}
