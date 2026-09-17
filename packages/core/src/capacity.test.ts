import { describe, expect, it } from 'vitest';

import {
  calculateLifeBuffer,
  calculateLifeDebt,
  evaluateInteractionRisk,
  type CapacitySignal,
  type Confidence,
  type EvidenceRef,
  type InteractionFactorSignal,
} from './index';

function confidence(score: number): Confidence {
  return {
    level:
      score >= 0.75 ? 'known' : score >= 0.5 ? 'likely' : score >= 0.25 ? 'possible' : 'insufficient',
    score,
    evidenceCount: 1,
    freshnessDays: 0,
  };
}

function evidence(id: string): EvidenceRef {
  return {
    id,
    source: 'self_reported',
    observedAt: '2026-09-17T12:00:00.000Z',
    label: id,
  };
}

function capacity(
  key: string,
  available: number | null,
  load: number | null,
  score = 0.8,
  weight = 1,
): CapacitySignal {
  return {
    key,
    capacity: available,
    load,
    weight,
    confidence: confidence(score),
    evidence: available === null || load === null ? [] : [evidence(`capacity:${key}`)],
  };
}

function factor(
  key: string,
  severity: number | null,
  score = 0.8,
): InteractionFactorSignal {
  return {
    key,
    severity,
    confidence: confidence(score),
    evidence: severity === null ? [] : [evidence(`factor:${key}`)],
  };
}

describe('life debt', () => {
  it('preserves unknown need inputs instead of converting them to zero debt', () => {
    const result = calculateLifeDebt({
      dimensionId: 'recovery',
      targetNeed: null,
      metNeed: 40,
      priorAmount: 20,
      elapsedDays: 1,
      urgency: 50,
      confidence: confidence(0.8),
      evidence: [evidence('recovery')],
    });

    expect(result.amount).toBeNull();
    expect(result.direction).toBe('unknown');
    expect(result.urgency).toBe('unknown');
    expect(result.confidence.level).toBe('insufficient');
  });

  it('accumulates conservatively and then recovers when need is over-met', () => {
    const accumulating = calculateLifeDebt({
      dimensionId: 'recovery',
      targetNeed: 80,
      metNeed: 40,
      priorAmount: 30,
      elapsedDays: 2,
      urgency: 60,
      confidence: confidence(0.8),
      evidence: [evidence('recovery:a')],
    });
    const recovering = calculateLifeDebt({
      dimensionId: 'recovery',
      targetNeed: 50,
      metNeed: 90,
      priorAmount: accumulating.amount,
      elapsedDays: 2,
      urgency: 30,
      confidence: confidence(0.8),
      evidence: [evidence('recovery:b')],
    });

    expect(accumulating.amount).toBe(33.2);
    expect(accumulating.direction).toBe('accumulating');
    expect(accumulating.velocityPerDay).toBe(1.6);
    expect(recovering.amount).toBe(28.4);
    expect(recovering.direction).toBe('recovering');
    expect(recovering.velocityPerDay).toBe(-2.4);
  });

  it('labels a first measurement as a snapshot rather than inventing historical direction', () => {
    const result = calculateLifeDebt({
      dimensionId: 'recovery',
      targetNeed: 70,
      metNeed: 40,
      priorAmount: null,
      elapsedDays: 7,
      urgency: null,
      confidence: confidence(0.8),
      evidence: [evidence('snapshot')],
    });

    expect(result.amount).toBe(30);
    expect(result.history).toBe('snapshot');
    expect(result.direction).toBe('unknown');
    expect(result.velocityPerDay).toBeNull();
  });
});

describe('life buffer and fragility', () => {
  it('keeps a high-output but no-margin life in the low-buffer band', () => {
    const result = calculateLifeBuffer([
      capacity('time', 95, 92),
      capacity('energy', 90, 88),
      capacity('schedule_flexibility', 85, 84),
    ]);

    expect(result.score).toBeLessThan(10);
    expect(result.band).toBe('low');
    expect(result.fragility).toBeGreaterThan(90);
  });

  it('refuses a summary when too little capacity data is known', () => {
    const result = calculateLifeBuffer([
      capacity('time', 80, 40),
      capacity('energy', null, 50),
      capacity('financial_margin', null, null),
    ]);

    expect(result.score).toBeNull();
    expect(result.fragility).toBeNull();
    expect(result.band).toBe('unknown');
    expect(result.missingKeys).toEqual(['energy', 'financial_margin']);
  });

  it('penalizes a weak margin even when the average spare capacity is healthy', () => {
    const result = calculateLifeBuffer([
      capacity('time', 90, 30),
      capacity('energy', 90, 30),
      capacity('schedule_flexibility', 70, 68),
    ]);

    expect(result.score).toBeLessThan(50);
    expect(result.components.find((item) => item.key === 'schedule_flexibility')?.margin).toBe(2);
  });
});

describe('interaction risk', () => {
  const riskyFactors = [
    factor('recovery_deficit', 80),
    factor('workload_pressure', 75),
    factor('margin_deficit', 70),
  ];

  it('surfaces a transparent elevated interaction when all factors and evidence are strong', () => {
    const result = evaluateInteractionRisk(riskyFactors);

    expect(result.status).toBe('elevated');
    expect(result.score).toBe(75);
    expect(result.findings[0]?.factorKeys).toEqual([
      'recovery_deficit',
      'workload_pressure',
      'margin_deficit',
    ]);
    expect(result.findings[0]?.rationale).toContain('combined factors');
  });

  it('downgrades the same factor combination to a hypothesis when confidence is weak', () => {
    const result = evaluateInteractionRisk([
      factor('recovery_deficit', 80, 0.3),
      factor('workload_pressure', 75, 0.3),
      factor('margin_deficit', 70, 0.3),
    ]);

    expect(result.status).toBe('hypothesis');
    expect(result.confidence.level).toBe('possible');
  });

  it('keeps missing factors insufficient instead of treating them as safe zeros', () => {
    const result = evaluateInteractionRisk([
      factor('recovery_deficit', 80),
      factor('workload_pressure', 75),
      factor('margin_deficit', null),
    ]);

    expect(result.status).toBe('insufficient');
    expect(result.score).toBeNull();
  });

  it('returns no interaction when complete observed factors remain below threshold', () => {
    const result = evaluateInteractionRisk([
      factor('recovery_deficit', 40),
      factor('workload_pressure', 75),
      factor('margin_deficit', 70),
    ]);

    expect(result.status).toBe('none');
    expect(result.score).toBe(0);
  });
});
