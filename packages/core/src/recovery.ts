import type { Confidence, EvidenceRef, HumanStateComponent, HumanStateVector } from './types';

export type RecoveryNeed = 'insufficient_evidence' | 'available' | 'suggested' | 'strongly_suggested';
export type RecoveryReasonKey = 'high_overload' | 'high_mental_load' | 'low_energy' | 'low_recovery';
export type RecoveryStepId = 'pause_inputs' | 'restore_body' | 'reduce_load';

export interface RecoveryReason {
  key: RecoveryReasonKey;
  severity: number;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface RecoveryStep {
  id: RecoveryStepId;
  minutes: number;
  optional: true;
}

export interface RecoveryPlan {
  need: RecoveryNeed;
  confidence: Confidence;
  reasons: readonly RecoveryReason[];
  steps: readonly RecoveryStep[];
  limitations: readonly ('not_medical_guidance' | 'insufficient_evidence_for_trigger')[];
}

const POSSIBLE_CONFIDENCE = 0.25;
const LIKELY_CONFIDENCE = 0.5;
const MODERATE_SEVERITY = 55;
const HIGH_SEVERITY = 70;

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function componentByKey(state: HumanStateVector, key: string): HumanStateComponent | null {
  return state.components.find((component) => component.key === key) ?? null;
}

function uniqueEvidence(items: readonly EvidenceRef[]): EvidenceRef[] {
  const seen = new Map<string, EvidenceRef>();
  for (const item of items) {
    const key = `${item.id}|${item.observedAt}|${item.label}`;
    if (!seen.has(key)) seen.set(key, item);
  }
  return [...seen.values()].sort((left, right) => left.observedAt.localeCompare(right.observedAt));
}

function confidenceLevel(score: number): Confidence['level'] {
  if (score >= 0.75) return 'known';
  if (score >= 0.5) return 'likely';
  if (score >= 0.25) return 'possible';
  return 'insufficient';
}

function reasonFromComponent(
  component: HumanStateComponent | null,
  key: RecoveryReasonKey,
  inverse = false,
): RecoveryReason | null {
  if (component?.value === null || component?.value === undefined) return null;
  if (component.confidence.score < POSSIBLE_CONFIDENCE) return null;
  const severity = clamp100(inverse ? 100 - component.value : component.value);
  if (severity < MODERATE_SEVERITY) return null;
  return { key, severity, confidence: component.confidence, evidence: component.evidence };
}

export function deriveRecoveryPlan(state: HumanStateVector): RecoveryPlan {
  const reasons = [
    reasonFromComponent(componentByKey(state, 'overload_risk'), 'high_overload'),
    reasonFromComponent(componentByKey(state, 'mental_load'), 'high_mental_load'),
    reasonFromComponent(componentByKey(state, 'energy'), 'low_energy', true),
    reasonFromComponent(componentByKey(state, 'recovery'), 'low_recovery', true),
  ]
    .filter((reason): reason is RecoveryReason => reason !== null)
    .sort((left, right) => right.severity - left.severity);

  const evidence = uniqueEvidence(reasons.flatMap((reason) => reason.evidence));
  const averageConfidence = reasons.length === 0
    ? 0
    : reasons.reduce((total, reason) => total + reason.confidence.score, 0) / reasons.length;
  const confidenceScore = Math.round(Math.max(0, Math.min(1, averageConfidence)) * 1000) / 1000;
  const confidence: Confidence = {
    level: confidenceLevel(confidenceScore),
    score: confidenceScore,
    evidenceCount: evidence.length,
    freshnessDays: reasons
      .map((reason) => reason.confidence.freshnessDays)
      .filter((value): value is number => value !== null)
      .reduce<number | null>((freshest, value) => freshest === null ? value : Math.min(freshest, value), null),
  };

  const highReasons = reasons.filter((reason) => reason.severity >= HIGH_SEVERITY);
  const likelyHigh = highReasons.some((reason) => reason.confidence.score >= LIKELY_CONFIDENCE);
  const need: RecoveryNeed = reasons.length === 0
    ? 'insufficient_evidence'
    : highReasons.length >= 2 || likelyHigh
      ? 'strongly_suggested'
      : highReasons.length === 1 || reasons.length >= 2
        ? 'suggested'
        : 'available';

  const hasBodyReason = reasons.some((reason) => reason.key === 'low_energy' || reason.key === 'low_recovery');
  const hasLoadReason = reasons.some((reason) => reason.key === 'high_overload' || reason.key === 'high_mental_load');
  const steps: RecoveryStep[] = [{ id: 'pause_inputs', minutes: 2, optional: true }];
  if (hasBodyReason || reasons.length === 0) steps.push({ id: 'restore_body', minutes: 5, optional: true });
  if (hasLoadReason || reasons.length === 0) steps.push({ id: 'reduce_load', minutes: 10, optional: true });

  return {
    need,
    confidence,
    reasons,
    steps,
    limitations: reasons.length === 0
      ? ['not_medical_guidance', 'insufficient_evidence_for_trigger']
      : ['not_medical_guidance'],
  };
}
