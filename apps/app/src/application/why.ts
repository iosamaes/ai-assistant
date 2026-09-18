import type { Confidence, EvidenceRef, HumanStateComponent, HumanStateVector } from '@mizan/core';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import type { DataResult } from '@/infrastructure/supabase/data-access';

export type WhyFactorKey = 'recovery' | 'energy' | 'mental_load' | 'connection' | 'overload_risk';

export interface WhyCandidateFactor {
  key: WhyFactorKey;
  value: number;
  concernStrength: number;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
  evidenceStartAt: string | null;
  evidenceEndAt: string | null;
}

export interface WhyExplanation {
  generatedAt: string;
  factors: readonly WhyCandidateFactor[];
  caveat: string;
}

const FACTOR_KEYS: readonly WhyFactorKey[] = [
  'recovery',
  'energy',
  'mental_load',
  'connection',
  'overload_risk',
];

function isWhyFactorKey(key: string): key is WhyFactorKey {
  return FACTOR_KEYS.includes(key as WhyFactorKey);
}

function concernStrength(component: HumanStateComponent): number | null {
  if (component.value === null || !Number.isFinite(component.value)) return null;
  const value = Math.max(0, Math.min(100, component.value));
  if (component.key === 'mental_load' || component.key === 'overload_risk') return value;
  return 100 - value;
}

function evidenceWindow(evidence: readonly EvidenceRef[]) {
  const valid = evidence
    .map((item) => ({ item, timestamp: Date.parse(item.observedAt) }))
    .filter((entry) => Number.isFinite(entry.timestamp))
    .sort((left, right) => left.timestamp - right.timestamp);

  return {
    start: valid[0]?.item.observedAt ?? null,
    end: valid.at(-1)?.item.observedAt ?? null,
  };
}

export function buildWhyExplanation(state: HumanStateVector): WhyExplanation {
  const factors = state.components
    .flatMap((component): WhyCandidateFactor[] => {
      if (!isWhyFactorKey(component.key)) return [];
      if (component.confidence.level === 'insufficient') return [];
      const strength = concernStrength(component);
      if (strength === null || strength < 20) return [];
      const window = evidenceWindow(component.evidence);

      return [{
        key: component.key,
        value: Math.max(0, Math.min(100, component.value as number)),
        concernStrength: strength,
        confidence: component.confidence,
        evidence: component.evidence,
        evidenceStartAt: window.start,
        evidenceEndAt: window.end,
      }];
    })
    .sort((left, right) => {
      const leftRank = left.concernStrength * left.confidence.score;
      const rightRank = right.concernStrength * right.confidence.score;
      const rankDiff = rightRank - leftRank;
      return Math.abs(rankDiff) > 0.0001 ? rankDiff : left.key.localeCompare(right.key);
    });

  return {
    generatedAt: state.generatedAt,
    factors,
    caveat: 'These are evidence-backed candidate factors present in your recent data. They are not diagnoses and do not prove that one factor caused how you feel.',
  };
}

export async function loadWhyExplanation(
  userId: string,
  generatedAt = new Date().toISOString(),
): Promise<DataResult<WhyExplanation>> {
  const stateResult = await loadCurrentHumanState(userId, generatedAt);
  if (!stateResult.ok) return stateResult;
  return { ok: true, value: buildWhyExplanation(stateResult.value) };
}
