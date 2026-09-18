import { describe, expect, it } from 'vitest';

import { assessCostOfYes } from './cost-of-yes';

const confidence = {
  level: 'known' as const,
  score: 0.85,
  evidenceCount: 2,
  freshnessDays: 0,
};

const evidence = [
  {
    id: 'commitment',
    source: 'self_reported' as const,
    observedAt: '2026-09-18T10:00:00Z',
    label: 'explicit_commitment_time',
  },
  {
    id: 'margin',
    source: 'self_reported' as const,
    observedAt: '2026-09-18T10:00:00Z',
    label: 'explicit_available_margin',
  },
];

describe('assessCostOfYes', () => {
  it('refuses to invent displacement when available margin is unknown', () => {
    const result = assessCostOfYes({
      commitmentMinutesPerWeek: 240,
      availableMarginMinutesPerWeek: null,
      source: 'self_reported',
      confidence,
      evidence: evidence.slice(0, 1),
    });

    expect(result.status).toBe('insufficient');
    expect(result.reason).toBe('missing_margin');
    expect(result.remainingMarginMinutesPerWeek).toBeNull();
    expect(result.displacedMinutesPerWeek).toBeNull();
    expect(result.confidence.level).toBe('insufficient');
  });

  it('marks a commitment manageable when it uses at most half of known margin', () => {
    const result = assessCostOfYes({
      commitmentMinutesPerWeek: 180,
      availableMarginMinutesPerWeek: 420,
      source: 'self_reported',
      confidence,
      evidence,
    });

    expect(result.status).toBe('manageable');
    expect(result.reason).toBe('within_margin');
    expect(result.remainingMarginMinutesPerWeek).toBe(240);
    expect(result.displacedMinutesPerWeek).toBe(0);
    expect(result.marginUsedPercent).toBe(42.9);
  });

  it('marks margin as tight before claiming displacement', () => {
    const result = assessCostOfYes({
      commitmentMinutesPerWeek: 300,
      availableMarginMinutesPerWeek: 420,
      source: 'self_reported',
      confidence,
      evidence,
    });

    expect(result.status).toBe('tight');
    expect(result.reason).toBe('uses_most_margin');
    expect(result.remainingMarginMinutesPerWeek).toBe(120);
    expect(result.displacedMinutesPerWeek).toBe(0);
  });

  it('reports only the minimum time that must be displaced when the commitment exceeds known margin', () => {
    const result = assessCostOfYes({
      commitmentMinutesPerWeek: 600,
      availableMarginMinutesPerWeek: 420,
      source: 'self_reported',
      confidence,
      evidence,
    });

    expect(result.status).toBe('displacing');
    expect(result.reason).toBe('exceeds_margin');
    expect(result.remainingMarginMinutesPerWeek).toBe(0);
    expect(result.displacedMinutesPerWeek).toBe(180);
    expect(result.marginUsedPercent).toBe(142.9);
  });

  it('handles a known zero-margin context without division by zero or false precision', () => {
    const result = assessCostOfYes({
      commitmentMinutesPerWeek: 60,
      availableMarginMinutesPerWeek: 0,
      source: 'calendar',
      confidence,
      evidence,
    });

    expect(result.status).toBe('displacing');
    expect(result.displacedMinutesPerWeek).toBe(60);
    expect(result.marginUsedPercent).toBeNull();
  });
});
