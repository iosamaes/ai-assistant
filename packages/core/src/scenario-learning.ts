import { ENGINE_CONFIG } from './engine';
import type { PersonalScenarioEffect } from './scenario';
import type { Confidence } from './types';

export type ScenarioImprovementDirection = 'higher' | 'lower';

export interface ScenarioTrialEvidence {
  id: string;
  scenarioId: string;
  componentKey: string;
  baselineValue: number;
  followupValue: number;
  actionOccurredAt: string;
  feedbackObservedAt: string;
  followupObservedAt: string;
  usefulness: number;
}

export interface DeriveScenarioEffectInput {
  scenarioId: string;
  componentKey: string;
  improvementDirection: ScenarioImprovementDirection;
  trials: readonly ScenarioTrialEvidence[];
  now?: string;
}

const DAY_MS = 86_400_000;
const MAX_FOLLOWUP_DAYS = 14;
const LEARNING_WINDOW_DAYS = 90;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function confidenceLevel(score: number): Confidence['level'] {
  if (score >= ENGINE_CONFIG.confidenceKnownThreshold) return 'known';
  if (score >= ENGINE_CONFIG.confidenceLikelyThreshold) return 'likely';
  if (score >= ENGINE_CONFIG.confidencePossibleThreshold) return 'possible';
  return 'insufficient';
}

function parseTime(value: string): number | null {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isUsableTrial(
  trial: ScenarioTrialEvidence,
  scenarioId: string,
  componentKey: string,
): boolean {
  if (trial.scenarioId !== scenarioId || trial.componentKey !== componentKey) return false;
  if (!Number.isInteger(trial.usefulness) || trial.usefulness < 1 || trial.usefulness > 5) return false;
  if (
    !Number.isFinite(trial.baselineValue) ||
    !Number.isFinite(trial.followupValue) ||
    trial.baselineValue < 0 ||
    trial.baselineValue > 100 ||
    trial.followupValue < 0 ||
    trial.followupValue > 100
  ) {
    return false;
  }

  const actionAt = parseTime(trial.actionOccurredAt);
  const feedbackAt = parseTime(trial.feedbackObservedAt);
  const followupAt = parseTime(trial.followupObservedAt);
  if (actionAt === null || feedbackAt === null || followupAt === null) return false;
  if (feedbackAt < actionAt || followupAt <= actionAt) return false;
  if (followupAt - actionAt > MAX_FOLLOWUP_DAYS * DAY_MS) return false;
  return true;
}

function agreementScore(
  trial: ScenarioTrialEvidence,
  improvementDirection: ScenarioImprovementDirection,
): number {
  const delta = trial.followupValue - trial.baselineValue;
  const improvement = improvementDirection === 'higher' ? delta : -delta;
  if (trial.usefulness === 3) return Math.abs(improvement) <= 5 ? 1 : 0.7;
  const reportedPositive = trial.usefulness > 3;
  const observedPositive = improvement > 0;
  const observedNeutral = Math.abs(improvement) <= 2;
  if (observedNeutral) return 0.75;
  return reportedPositive === observedPositive ? 1 : 0.45;
}

export function derivePersonalScenarioEffect(
  input: DeriveScenarioEffectInput,
): PersonalScenarioEffect | null {
  const nowMs = parseTime(input.now ?? new Date().toISOString()) ?? Date.now();
  const trials = input.trials.filter((trial) => isUsableTrial(trial, input.scenarioId, input.componentKey));
  if (trials.length === 0) return null;

  const deltas = trials.map((trial) => clamp(trial.followupValue - trial.baselineValue, -100, 100));
  const center = median(deltas);
  const absoluteDeviations = deltas.map((delta) => Math.abs(delta - center));
  const mad = median(absoluteDeviations);
  const halfRange = clamp(1.5 + mad * 1.5 + (trials.length < 3 ? 1 : 0), 1.5, 15);

  const latestEvidenceMs = Math.max(
    ...trials.map((trial) => Math.max(parseTime(trial.feedbackObservedAt) ?? 0, parseTime(trial.followupObservedAt) ?? 0)),
  );
  const freshnessDays = Math.max(0, (nowMs - latestEvidenceMs) / DAY_MS);
  const sampleFactor = Math.min(1, trials.length / 5);
  const consistencyFactor = 1 - Math.min(1, mad / 20);
  const agreementFactor = trials.reduce(
    (total, trial) => total + agreementScore(trial, input.improvementDirection),
    0,
  ) / trials.length;
  const freshnessFactor = 1 - Math.min(0.75, freshnessDays / LEARNING_WINDOW_DAYS);
  const score = clamp(
    sampleFactor * 0.45 + consistencyFactor * 0.25 + agreementFactor * 0.2 + freshnessFactor * 0.1,
    0,
    1,
  );

  const confidence: Confidence = {
    level: confidenceLevel(score),
    score: Math.round(score * 1000) / 1000,
    evidenceCount: trials.length,
    freshnessDays: Math.round(freshnessDays * 10) / 10,
  };

  return {
    scenarioId: input.scenarioId,
    componentKey: input.componentKey,
    deltaMin: clamp(center - halfRange, -100, 100),
    deltaMax: clamp(center + halfRange, -100, 100),
    confidence,
    evidenceCount: trials.length,
  };
}
