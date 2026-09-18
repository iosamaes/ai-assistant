import { describe, expect, it } from 'vitest';

import { deriveRecoveryPlan } from './recovery';
import type { HumanStateComponent, HumanStateVector } from './types';

function component(
  key: string,
  value: number | null,
  confidenceScore: number,
): HumanStateComponent {
  return {
    key,
    value,
    confidence: {
      level: confidenceScore >= 0.5 ? 'likely' : confidenceScore >= 0.25 ? 'possible' : 'insufficient',
      score: confidenceScore,
      evidenceCount: value === null ? 0 : 1,
      freshnessDays: value === null ? null : 0.5,
    },
    evidence: value === null ? [] : [{ id: key, source: 'self_reported', observedAt: '2026-09-18T08:00:00Z', label: key }],
    source: value === null ? 'unknown' : 'self_reported',
  };
}

function state(components: HumanStateComponent[]): HumanStateVector {
  return { generatedAt: '2026-09-18T09:00:00Z', maturity: 'learning', components };
}

describe('deriveRecoveryPlan', () => {
  it('keeps the trigger explicitly insufficient when there is no supported state evidence', () => {
    const result = deriveRecoveryPlan(state([
      component('energy', null, 0),
      component('recovery', null, 0),
      component('mental_load', null, 0),
      component('overload_risk', null, 0),
    ]));

    expect(result.need).toBe('insufficient_evidence');
    expect(result.reasons).toHaveLength(0);
    expect(result.steps.map((step) => step.id)).toEqual(['pause_inputs', 'restore_body', 'reduce_load']);
    expect(result.limitations).toContain('insufficient_evidence_for_trigger');
  });

  it('strongly suggests recovery for a high likely overload signal', () => {
    const result = deriveRecoveryPlan(state([
      component('overload_risk', 82, 0.65),
      component('mental_load', 76, 0.55),
      component('energy', 45, 0.5),
    ]));

    expect(result.need).toBe('strongly_suggested');
    expect(result.reasons[0]?.key).toBe('high_overload');
    expect(result.steps.map((step) => step.id)).toContain('reduce_load');
  });

  it('does not promote a severe value when confidence is below the possible threshold', () => {
    const result = deriveRecoveryPlan(state([component('mental_load', 95, 0.2)]));

    expect(result.need).toBe('insufficient_evidence');
    expect(result.reasons).toHaveLength(0);
  });

  it('suggests a small reset when multiple moderate supported factors combine', () => {
    const result = deriveRecoveryPlan(state([
      component('mental_load', 62, 0.35),
      component('energy', 38, 0.4),
    ]));

    expect(result.need).toBe('suggested');
    expect(result.reasons.map((reason) => reason.key)).toEqual(['high_mental_load', 'low_energy']);
    expect(result.steps.map((step) => step.id)).toEqual(['pause_inputs', 'restore_body', 'reduce_load']);
  });
});
