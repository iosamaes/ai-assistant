import type { Confidence, EvidenceRef, OneMove, RecommendationCandidate } from './types';

export const LEVERAGE_WEIGHTS = Object.freeze({
  expectedImpact: 0.34,
  confidence: 0.2,
  multiDomain: 0.1,
  identityAlignment: 0.1,
  effortPenalty: 0.08,
  timePenalty: 0.06,
  resistancePenalty: 0.06,
  riskPenalty: 0.06,
});

export interface RankedRecommendation {
  candidate: RecommendationCandidate;
  score: number;
  benefitScore: number;
  costScore: number;
  explanation: readonly string[];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function insufficientConfidence(): Confidence {
  return { level: 'insufficient', score: 0, evidenceCount: 0, freshnessDays: null };
}

function dedupeEvidence(evidence: readonly EvidenceRef[]): EvidenceRef[] {
  const seen = new Set<string>();
  const result: EvidenceRef[] = [];
  for (const item of evidence) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

export function scoreRecommendation(candidate: RecommendationCandidate): RankedRecommendation {
  const impact = clamp01(candidate.expectedImpact);
  const confidence = clamp01(candidate.confidence.score);
  const multiDomain = clamp01(candidate.leverageDimensions.length / 3);
  const identity = clamp01(candidate.identityAlignment);
  const effort = clamp01(candidate.effortCost);
  const time = clamp01(candidate.timeCost);
  const resistance = clamp01(candidate.resistanceCost);
  const risk = clamp01(candidate.riskCost);

  const benefitScore =
    impact * LEVERAGE_WEIGHTS.expectedImpact +
    confidence * LEVERAGE_WEIGHTS.confidence +
    multiDomain * LEVERAGE_WEIGHTS.multiDomain +
    identity * LEVERAGE_WEIGHTS.identityAlignment;
  const costScore =
    effort * LEVERAGE_WEIGHTS.effortPenalty +
    time * LEVERAGE_WEIGHTS.timePenalty +
    resistance * LEVERAGE_WEIGHTS.resistancePenalty +
    risk * LEVERAGE_WEIGHTS.riskPenalty;
  const score = round(benefitScore - costScore);

  const explanation = [
    `impact=${round(impact)}`,
    `confidence=${round(confidence)}`,
    `multi_domain=${round(multiDomain)}`,
    `identity_alignment=${round(identity)}`,
    `cost=${round(costScore)}`,
  ];

  return {
    candidate,
    score,
    benefitScore: round(benefitScore),
    costScore: round(costScore),
    explanation,
  };
}

export function rankRecommendations(
  candidates: readonly RecommendationCandidate[],
): readonly RankedRecommendation[] {
  return candidates
    .map(scoreRecommendation)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (right.candidate.confidence.score !== left.candidate.confidence.score) {
        return right.candidate.confidence.score - left.candidate.confidence.score;
      }
      return left.candidate.actionId.localeCompare(right.candidate.actionId);
    });
}

export function chooseOneMove(candidates: readonly RecommendationCandidate[]): OneMove {
  const ranked = rankRecommendations(candidates);
  const selected = ranked[0];
  if (selected === undefined) {
    return {
      actionId: null,
      reason: 'insufficient_evidence_for_one_move',
      confidence: insufficientConfidence(),
      evidence: [],
      alternatives: [],
    };
  }

  const alternatives = ranked.slice(1, 3).map((item) => item.candidate.actionId);
  const evidence = dedupeEvidence(selected.candidate.evidence);

  return {
    actionId: selected.candidate.actionId,
    reason: `highest_expected_personal_leverage:${selected.explanation.join(';')}`,
    confidence: selected.candidate.confidence,
    evidence,
    alternatives,
  };
}
