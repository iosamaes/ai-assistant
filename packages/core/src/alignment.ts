import { ENGINE_CONFIG } from './engine';
import type { MomentumDirection } from './temporal';
import type { Confidence, EvidenceRef } from './types';

export type ValueAlignmentStatus = 'supported' | 'watch' | 'insufficient';

export interface ValueAlignmentSignal {
  key: string;
  direction: MomentumDirection;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface ValueAlignmentSummary {
  valueId: string;
  status: ValueAlignmentStatus;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
  supportingSignals: readonly string[];
  watchSignals: readonly string[];
}

function confidenceLevel(score: number): Confidence['level'] {
  if (score >= ENGINE_CONFIG.confidenceKnownThreshold) return 'known';
  if (score >= ENGINE_CONFIG.confidenceLikelyThreshold) return 'likely';
  if (score >= ENGINE_CONFIG.confidencePossibleThreshold) return 'possible';
  return 'insufficient';
}

function dedupeEvidence(signals: readonly ValueAlignmentSignal[]): EvidenceRef[] {
  const seen = new Set<string>();
  const evidence: EvidenceRef[] = [];
  for (const signal of signals) {
    for (const item of signal.evidence) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      evidence.push(item);
    }
  }
  return evidence;
}

function insufficient(valueId: string): ValueAlignmentSummary {
  return {
    valueId,
    status: 'insufficient',
    confidence: { level: 'insufficient', score: 0, evidenceCount: 0, freshnessDays: null },
    evidence: [],
    supportingSignals: [],
    watchSignals: [],
  };
}

export function summarizeValueAlignment(
  valueId: string,
  signals: readonly ValueAlignmentSignal[],
): ValueAlignmentSummary {
  const usable = signals.filter(
    (signal) =>
      signal.direction !== 'unknown' &&
      signal.confidence.level !== 'insufficient' &&
      signal.evidence.length > 0,
  );
  if (usable.length === 0) return insufficient(valueId);

  const evidence = dedupeEvidence(usable);
  const score = Math.min(...usable.map((signal) => signal.confidence.score));
  const freshness = usable
    .map((signal) => signal.confidence.freshnessDays)
    .filter((value): value is number => value !== null);
  const watchSignals = usable
    .filter((signal) => signal.direction === 'declining')
    .map((signal) => signal.key);
  const supportingSignals = usable
    .filter((signal) => signal.direction === 'stable' || signal.direction === 'improving')
    .map((signal) => signal.key);

  return {
    valueId,
    status: watchSignals.length > 0 ? 'watch' : 'supported',
    confidence: {
      level: confidenceLevel(score),
      score,
      evidenceCount: evidence.length,
      freshnessDays: freshness.length > 0 ? Math.max(...freshness) : null,
    },
    evidence,
    supportingSignals,
    watchSignals,
  };
}
