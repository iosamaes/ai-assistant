import {
  chooseOneMove,
  ENGINE_CONFIG,
  type ActionDefinition,
  type Confidence,
  type EvidenceRef,
  type HumanStateComponent,
  type HumanStateVector,
  type RecommendationCandidate,
} from '@mizan/core';
import { foundationalPlugin } from '@mizan/plugins';

import {
  insertActionEvent,
  type DataResult,
} from '@/infrastructure/supabase/data-access';

type SignalKey = 'recovery' | 'energy' | 'connection' | 'overload_risk';
type SignalDirection = 'low' | 'high';

type SignalRule = {
  key: SignalKey;
  direction: SignalDirection;
};

type CandidateMetadata = {
  action: ActionDefinition;
  candidate: RecommendationCandidate;
  reasonSignal: SignalKey;
};

export type DailyRecommendationOption = {
  actionId: string;
  labelKey: string;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
  reasonSignal: SignalKey;
};

export type DailyRecommendation = {
  primary: DailyRecommendationOption;
  alternatives: readonly DailyRecommendationOption[];
};

export type OneMoveDecision = 'accepted' | 'deferred' | 'declined';

const dimensionSignalRules: Readonly<Record<string, readonly SignalRule[]>> = {
  recovery: [
    { key: 'recovery', direction: 'low' },
    { key: 'energy', direction: 'low' },
  ],
  margin: [{ key: 'overload_risk', direction: 'high' }],
  connection: [{ key: 'connection', direction: 'low' }],
};

// A low-risk action is only considered when a current state signal shows a material need.
const MIN_NEED = 0.35;
// State confidence is deliberately discounted because evidence about current need is not evidence
// that a particular action will help this person. Personal outcome learning can replace this prior later.
const ACTION_IMPLICATION_CONFIDENCE_FACTOR = 0.6;
const UNKNOWN_RESISTANCE_COST = 0.5;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
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

function implicationConfidence(component: HumanStateComponent): Confidence {
  const score = round(component.confidence.score * ACTION_IMPLICATION_CONFIDENCE_FACTOR);
  return {
    ...component.confidence,
    score,
    level: confidenceLevel(score),
    evidenceCount: component.evidence.length,
  };
}

function signalNeed(value: number, direction: SignalDirection): number {
  return direction === 'low' ? clamp01((100 - value) / 100) : clamp01(value / 100);
}

function candidateForAction(
  action: ActionDefinition,
  state: HumanStateVector,
): CandidateMetadata | null {
  const rules = action.dimensionIds.flatMap((dimensionId) => dimensionSignalRules[dimensionId] ?? []);
  const uniqueRules = rules.filter(
    (rule, index) => rules.findIndex((item) => item.key === rule.key && item.direction === rule.direction) === index,
  );

  const strongest = uniqueRules
    .flatMap((rule) => {
      const component = state.components.find((item) => item.key === rule.key);
      if (!component || component.value === null) return [];
      const need = signalNeed(component.value, rule.direction);
      const confidence = implicationConfidence(component);
      if (need < MIN_NEED || confidence.level === 'insufficient') return [];
      return [{ rule, component, need, confidence }];
    })
    .sort((left, right) => right.need * right.confidence.score - left.need * left.confidence.score)[0];

  if (!strongest) return null;

  // Cold-start expected impact is intentionally a small generic prior, scaled only by current need.
  // Unknown identity alignment receives zero positive credit; it is not interpreted as misalignment.
  const expectedImpact = round(0.18 + strongest.need * 0.17);
  const candidate: RecommendationCandidate = {
    actionId: action.id,
    expectedImpact,
    confidence: strongest.confidence,
    leverageDimensions: action.dimensionIds,
    identityAlignment: 0,
    effortCost: clamp01(action.effort),
    timeCost: clamp01(action.timeMinutes / 60),
    resistanceCost: UNKNOWN_RESISTANCE_COST,
    riskCost: clamp01(action.risk),
    evidence: strongest.component.evidence,
  };

  return { action, candidate, reasonSignal: strongest.rule.key };
}

function toOption(metadata: CandidateMetadata): DailyRecommendationOption {
  return {
    actionId: metadata.action.id,
    labelKey: metadata.action.labelKey,
    confidence: metadata.candidate.confidence,
    evidence: metadata.candidate.evidence,
    reasonSignal: metadata.reasonSignal,
  };
}

export function prepareDailyRecommendation(state: HumanStateVector): DailyRecommendation | null {
  const prepared = foundationalPlugin.actions
    .map((action) => candidateForAction(action, state))
    .filter((item): item is CandidateMetadata => item !== null);

  const oneMove = chooseOneMove(prepared.map((item) => item.candidate));
  if (!oneMove.actionId || oneMove.confidence.level === 'insufficient') return null;

  const selected = prepared.find((item) => item.action.id === oneMove.actionId);
  if (!selected) return null;

  const alternatives = oneMove.alternatives.flatMap((actionId) => {
    const item = prepared.find((candidate) => candidate.action.id === actionId);
    return item ? [toOption(item)] : [];
  });

  return {
    primary: {
      ...toOption(selected),
      confidence: oneMove.confidence,
      evidence: oneMove.evidence,
    },
    alternatives,
  };
}

export async function recordOneMoveDecision(
  userId: string,
  option: DailyRecommendationOption,
  decision: OneMoveDecision,
  selectedAsAlternative: boolean,
): Promise<DataResult<string>> {
  return insertActionEvent(userId, {
    action_key: option.actionId,
    event_type: decision,
    context: {
      source: 'today_one_move',
      reason_signal: option.reasonSignal,
      confidence_level: option.confidence.level,
      confidence_score: option.confidence.score,
      evidence_count: option.evidence.length,
      selected_as_alternative: selectedAsAlternative,
    },
  });
}
