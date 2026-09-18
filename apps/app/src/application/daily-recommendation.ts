import {
  buildRecommendationContextId,
  chooseOneMove,
  ENGINE_CONFIG,
  type ActionDefinition,
  type ActionUsefulnessEstimate,
  type Confidence,
  type EvidenceRef,
  type HumanStateComponent,
  type HumanStateVector,
  type RecommendationCandidate,
} from '@mizan/core';
import { foundationalPlugin } from '@mizan/plugins';

import { loadPersonalActionUsefulness } from '@/application/action-feedback';
import {
  insertActionEvent,
  type DataResult,
} from '@/infrastructure/supabase/data-access';
import { loadOneMoveDecisionForContext } from '@/infrastructure/supabase/one-move-decision';

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
  contextId: string;
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
// Personal usefulness may nudge, never dominate, the cold-start expected-impact prior.
const MAX_PERSONAL_IMPACT_DELTA = 0.15;

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

function expectedImpactForNeed(
  need: number,
  personalUsefulness: ActionUsefulnessEstimate | null | undefined,
): number {
  const coldStartPrior = 0.18 + need * 0.17;
  if (
    !personalUsefulness ||
    personalUsefulness.usefulness === null ||
    personalUsefulness.confidence.level === 'insufficient'
  ) {
    return round(coldStartPrior);
  }

  const signedUsefulness = Math.max(-1, Math.min(1, personalUsefulness.usefulness / 100));
  const adjustment =
    signedUsefulness * MAX_PERSONAL_IMPACT_DELTA * clamp01(personalUsefulness.confidence.score);
  return round(clamp01(coldStartPrior + adjustment));
}

function candidateForAction(
  action: ActionDefinition,
  state: HumanStateVector,
  personalUsefulness?: ActionUsefulnessEstimate | null,
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

  const personalEvidence =
    personalUsefulness &&
    personalUsefulness.usefulness !== null &&
    personalUsefulness.confidence.level !== 'insufficient'
      ? personalUsefulness.evidence
      : [];
  const candidate: RecommendationCandidate = {
    actionId: action.id,
    expectedImpact: expectedImpactForNeed(strongest.need, personalUsefulness),
    confidence: strongest.confidence,
    leverageDimensions: action.dimensionIds,
    identityAlignment: 0,
    effortCost: clamp01(action.effort),
    timeCost: clamp01(action.timeMinutes / 60),
    resistanceCost: UNKNOWN_RESISTANCE_COST,
    riskCost: clamp01(action.risk),
    evidence: [...strongest.component.evidence, ...personalEvidence],
  };

  return { action, candidate, reasonSignal: strongest.rule.key };
}

function toOption(metadata: CandidateMetadata, contextId: string): DailyRecommendationOption {
  return {
    actionId: metadata.action.id,
    labelKey: metadata.action.labelKey,
    confidence: metadata.candidate.confidence,
    evidence: metadata.candidate.evidence,
    reasonSignal: metadata.reasonSignal,
    contextId,
  };
}

export function prepareDailyRecommendation(
  state: HumanStateVector,
  usefulnessByAction: ReadonlyMap<string, ActionUsefulnessEstimate> = new Map(),
): DailyRecommendation | null {
  const prepared = foundationalPlugin.actions
    .map((action) => candidateForAction(action, state, usefulnessByAction.get(action.id)))
    .filter((item): item is CandidateMetadata => item !== null);

  const oneMove = chooseOneMove(prepared.map((item) => item.candidate));
  if (!oneMove.actionId || oneMove.confidence.level === 'insufficient') return null;

  const selected = prepared.find((item) => item.action.id === oneMove.actionId);
  if (!selected) return null;

  const contextId = buildRecommendationContextId(state);
  const alternatives = oneMove.alternatives.flatMap((actionId) => {
    const item = prepared.find((candidate) => candidate.action.id === actionId);
    return item ? [toOption(item, contextId)] : [];
  });

  return {
    primary: {
      ...toOption(selected, contextId),
      confidence: oneMove.confidence,
      evidence: oneMove.evidence,
    },
    alternatives,
  };
}

export async function loadPersonalizedDailyRecommendation(
  userId: string,
  state: HumanStateVector,
): Promise<DailyRecommendation | null> {
  const estimates = await Promise.all(
    foundationalPlugin.actions.map(async (action) => {
      const result = await loadPersonalActionUsefulness(userId, action.id);
      return [action.id, result.ok ? result.value : null] as const;
    }),
  );
  const useful = new Map<string, ActionUsefulnessEstimate>();
  for (const [actionId, estimate] of estimates) {
    if (estimate) useful.set(actionId, estimate);
  }

  const recommendation = prepareDailyRecommendation(state, useful);
  if (!recommendation) return null;

  const priorDecision = await loadOneMoveDecisionForContext(userId, recommendation.primary.contextId);
  if (priorDecision.ok && priorDecision.value) return null;
  return recommendation;
}

export async function recordOneMoveDecision(
  userId: string,
  option: DailyRecommendationOption,
  decision: OneMoveDecision,
  selectedAsAlternative: boolean,
): Promise<DataResult<string>> {
  const priorDecision = await loadOneMoveDecisionForContext(userId, option.contextId);
  if (!priorDecision.ok) return priorDecision;
  if (priorDecision.value) return { ok: false, error: { kind: 'conflict' } };

  return insertActionEvent(userId, {
    action_key: option.actionId,
    event_type: decision,
    context: {
      source: 'today_one_move',
      recommendation_context_id: option.contextId,
      reason_signal: option.reasonSignal,
      confidence_level: option.confidence.level,
      confidence_score: option.confidence.score,
      evidence_count: option.evidence.length,
      selected_as_alternative: selectedAsAlternative,
    },
  });
}
