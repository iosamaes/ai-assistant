import { describe, expect, it } from 'vitest';

import { evaluateExperiment, type ExperimentPlan } from './experiment';

const plan: ExperimentPlan = {
  hypothesis: 'An earlier bedtime may improve my self-reported recovery.',
  metric: 'recovery',
  expectedDirection: 'higher',
  durationDays: 5,
  consentedAt: '2026-09-10T08:00:00Z',
};

describe('evaluateExperiment', () => {
  it('keeps sparse experiments explicitly insufficient', () => {
    const result = evaluateExperiment({
      plan,
      baseline: [{ id: 'b1', value: 55, observedAt: '2026-09-10T09:00:00Z' }],
      followup: [{ id: 'f1', value: 65, observedAt: '2026-09-15T09:00:00Z' }],
      now: '2026-09-16T09:00:00Z',
    });

    expect(result.outcome).toBe('insufficient');
    expect(result.confidence.level).toBe('insufficient');
    expect(result.limitations).toContain('personal_experiment_not_causal_proof');
  });

  it('compares robust baseline and follow-up medians without claiming causality', () => {
    const result = evaluateExperiment({
      plan,
      baseline: [
        { id: 'b1', value: 52, observedAt: '2026-09-09T09:00:00Z' },
        { id: 'b2', value: 56, observedAt: '2026-09-10T09:00:00Z' },
        { id: 'b3', value: 54, observedAt: '2026-09-10T18:00:00Z' },
      ],
      followup: [
        { id: 'f1', value: 63, observedAt: '2026-09-14T09:00:00Z' },
        { id: 'f2', value: 65, observedAt: '2026-09-15T09:00:00Z' },
        { id: 'f3', value: 64, observedAt: '2026-09-15T18:00:00Z' },
      ],
      now: '2026-09-16T09:00:00Z',
    });

    expect(result.baselineMedian).toBe(54);
    expect(result.followupMedian).toBe(64);
    expect(result.delta).toBe(10);
    expect(result.outcome).toBe('improved');
    expect(result.limitations).toContain('other_factors_may_have_changed');
  });

  it('respects lower-is-better outcome direction', () => {
    const result = evaluateExperiment({
      plan: { ...plan, metric: 'mental_load', expectedDirection: 'lower' },
      baseline: [
        { id: 'b1', value: 72, observedAt: '2026-09-10T09:00:00Z' },
        { id: 'b2', value: 70, observedAt: '2026-09-10T18:00:00Z' },
      ],
      followup: [
        { id: 'f1', value: 62, observedAt: '2026-09-15T09:00:00Z' },
        { id: 'f2', value: 60, observedAt: '2026-09-15T18:00:00Z' },
      ],
    });

    expect(result.outcome).toBe('improved');
    expect(result.delta).toBeLessThan(0);
  });
});
