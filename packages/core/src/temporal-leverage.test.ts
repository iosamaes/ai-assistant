import { describe, expect, it } from 'vitest';

import { chooseOneMove, rankRecommendations } from './leverage';
import { summarizeTemporalMetric } from './temporal';
import type { Confidence, EvidenceRef, Observation, RecommendationCandidate } from './types';

const now = '2026-09-17T12:00:00.000Z';
const userId = 'fixture-user';

function observation(id: string, value: number, observedAt: string): Observation {
  return {
    id,
    userId,
    dimensionId: 'recovery',
    metric: 'energy',
    value,
    observedAt,
    source: 'self_reported',
  };
}

function confidence(score: number): Confidence {
  return {
    level: score >= 0.75 ? 'known' : score >= 0.5 ? 'likely' : score >= 0.25 ? 'possible' : 'insufficient',
    score,
    evidenceCount: 3,
    freshnessDays: 0,
  };
}

function candidate(
  actionId: string,
  expectedImpact: number,
  confidenceScore: number,
  evidence: readonly EvidenceRef[] = [],
): RecommendationCandidate {
  return {
    actionId,
    expectedImpact,
    confidence: confidence(confidenceScore),
    leverageDimensions: ['recovery', 'clarity'],
    identityAlignment: 0.7,
    effortCost: 0.2,
    timeCost: 0.2,
    resistanceCost: 0.2,
    riskCost: 0.1,
    evidence,
  };
}

describe('temporal memory', () => {
  it('keeps empty windows unknown instead of manufacturing zeroes', () => {
    const summary = summarizeTemporalMetric([], 'energy', now);

    expect(summary.windows.day.median).toBeNull();
    expect(summary.windows.quarter.median).toBeNull();
    expect(summary.momentum.direction).toBe('unknown');
    expect(summary.momentum.relativeChange).toBeNull();
  });

  it('distinguishes improving momentum from current level', () => {
    const observations = [
      observation('p1', 40, '2026-09-05T08:00:00.000Z'),
      observation('p2', 42, '2026-09-07T08:00:00.000Z'),
      observation('p3', 44, '2026-09-09T08:00:00.000Z'),
      observation('r1', 55, '2026-09-12T08:00:00.000Z'),
      observation('r2', 58, '2026-09-14T08:00:00.000Z'),
      observation('r3', 60, '2026-09-16T08:00:00.000Z'),
    ];
    const summary = summarizeTemporalMetric(observations, 'energy', now);

    expect(summary.windows.week.median).toBe(58);
    expect(summary.momentum.direction).toBe('improving');
    expect(summary.momentum.relativeChange).not.toBeNull();
  });

  it('can orient lower-is-better metrics without changing raw evidence', () => {
    const observations = [
      observation('p1', 80, '2026-09-05T08:00:00.000Z'),
      observation('p2', 78, '2026-09-08T08:00:00.000Z'),
      observation('r1', 60, '2026-09-12T08:00:00.000Z'),
      observation('r2', 55, '2026-09-16T08:00:00.000Z'),
    ].map((item) => ({ ...item, metric: 'mental_load' }));
    const summary = summarizeTemporalMetric(observations, 'mental_load', now, false);

    expect(summary.momentum.direction).toBe('improving');
    expect(summary.windows.week.evidenceCount).toBe(2);
  });
});

describe('life leverage and The One Move', () => {
  it('ranks by expected personal leverage rather than action id or completion', () => {
    const ranked = rankRecommendations([
      candidate('small-impact', 0.35, 0.8),
      candidate('high-impact', 0.85, 0.75),
    ]);

    expect(ranked[0]?.candidate.actionId).toBe('high-impact');
    expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? Number.NEGATIVE_INFINITY);
  });

  it('returns evidence, confidence, alternatives, and an inspectable deterministic reason', () => {
    const evidence: EvidenceRef[] = [
      {
        id: 'e1',
        source: 'self_reported',
        observedAt: '2026-09-17T10:00:00.000Z',
        label: 'recovery:energy',
      },
    ];
    const move = chooseOneMove([
      candidate('walk', 0.8, 0.8, evidence),
      candidate('pause-notifications', 0.6, 0.7),
    ]);

    expect(move.actionId).toBe('walk');
    expect(move.confidence.score).toBe(0.8);
    expect(move.evidence.map((item) => item.id)).toEqual(['e1']);
    expect(move.alternatives).toEqual(['pause-notifications']);
    expect(move.reason).toContain('highest_expected_personal_leverage');
  });

  it('declines to fabricate a move when there are no candidates', () => {
    const move = chooseOneMove([]);

    expect(move.actionId).toBeNull();
    expect(move.confidence.level).toBe('insufficient');
    expect(move.evidence).toEqual([]);
  });
});
