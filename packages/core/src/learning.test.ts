import { describe, expect, it } from 'vitest';

import {
  estimateActionUsefulness,
  evaluateRelationshipHypothesis,
  type ActionOutcomeFeedback,
  type Confidence,
  type EvidenceRef,
  type RelationshipPair,
} from './index';

function confidence(score: number): Confidence {
  return {
    level: score >= 0.75 ? 'known' : score >= 0.5 ? 'likely' : score >= 0.25 ? 'possible' : 'insufficient',
    score,
    evidenceCount: 1,
    freshnessDays: 0,
  };
}

function evidence(id: string, observedAt = '2026-09-17T12:00:00.000Z'): EvidenceRef {
  return { id, source: 'self_reported', observedAt, label: id };
}

function pair(id: string, fromValue: number | null, toValue: number | null, experimental = false): RelationshipPair {
  return {
    id,
    fromValue,
    toValue,
    observedAt: `2026-09-${10 + Number(id)}T12:00:00.000Z`,
    experimental,
    evidence: fromValue === null || toValue === null ? [] : [evidence(`pair:${id}`)],
  };
}

function feedback(
  id: string,
  benefit: number | null,
  observedAt: string,
  completed = true,
): ActionOutcomeFeedback {
  return {
    id,
    actionId: 'walk',
    completed,
    benefit,
    observedAt,
    confidence: confidence(0.8),
    evidence: benefit === null ? [] : [evidence(`feedback:${id}`, observedAt)],
  };
}

describe('relationship hypothesis learning', () => {
  it('keeps sparse paired evidence insufficient', () => {
    const result = evaluateRelationshipHypothesis('sleep', 'energy', [
      pair('1', 40, 45),
      pair('2', 60, 65),
    ]);

    expect(result.status).toBe('insufficient');
    expect(result.effect).toBeNull();
  });

  it('surfaces a strong personal association without calling it causal', () => {
    const result = evaluateRelationshipHypothesis('sleep', 'energy', [
      pair('1', 20, 25),
      pair('2', 40, 45),
      pair('3', 60, 62),
      pair('4', 80, 82),
    ]);

    expect(result.effect).toBeGreaterThan(0.9);
    expect(result.direction).toBe('positive');
    expect(result.status).toBe('hypothesis');
    expect(result.caveat).toContain('not proof');
  });

  it('lets N-of-1 experiment samples strengthen confidence without claiming universal causality', () => {
    const observational = evaluateRelationshipHypothesis('bedtime', 'recovery', [
      pair('1', 20, 30),
      pair('2', 40, 45),
      pair('3', 60, 65),
    ]);
    const experimental = evaluateRelationshipHypothesis('bedtime', 'recovery', [
      pair('1', 20, 30, true),
      pair('2', 40, 45, true),
      pair('3', 60, 65, true),
    ]);

    expect(experimental.confidence.score).toBeGreaterThan(observational.confidence.score);
    expect(experimental.caveat).toContain('does not prove universal causality');
  });

  it('does not turn missing pair values into zero observations', () => {
    const result = evaluateRelationshipHypothesis('sleep', 'energy', [
      pair('1', null, 20),
      pair('2', 40, null),
      pair('3', 60, 70),
    ]);

    expect(result.sampleSize).toBe(1);
    expect(result.status).toBe('insufficient');
  });
});

describe('feedback learning loop', () => {
  const now = '2026-09-18T00:00:00.000Z';

  it('does not learn benefit from completion alone', () => {
    const result = estimateActionUsefulness('walk', [
      feedback('1', null, '2026-09-17T10:00:00.000Z'),
    ], now);

    expect(result.adherenceCount).toBe(1);
    expect(result.feedbackCount).toBe(0);
    expect(result.usefulness).toBeNull();
    expect(result.reason).toContain('adherence evidence only');
  });

  it('weights recent personal outcomes more than old outcomes', () => {
    const result = estimateActionUsefulness('walk', [
      feedback('old', -80, '2026-07-01T00:00:00.000Z'),
      feedback('recent', 80, '2026-09-17T00:00:00.000Z'),
    ], now);

    expect(result.usefulness).toBeGreaterThan(0);
    expect(result.feedbackCount).toBe(2);
  });

  it('keeps feedback for another action out of the estimate', () => {
    const other = feedback('other', 100, '2026-09-17T00:00:00.000Z');
    const result = estimateActionUsefulness('stretch', [other], now);

    expect(result.usefulness).toBeNull();
    expect(result.feedbackCount).toBe(0);
  });
});
