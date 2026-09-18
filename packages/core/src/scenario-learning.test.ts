import { describe, expect, it } from 'vitest';

import { derivePersonalScenarioEffect, type ScenarioTrialEvidence } from './scenario-learning';

const baseTrial: ScenarioTrialEvidence = {
  id: 'trial-1',
  scenarioId: 'short-walk',
  componentKey: 'mental_load',
  baselineValue: 68,
  followupValue: 60,
  actionOccurredAt: '2026-09-17T09:00:00Z',
  feedbackObservedAt: '2026-09-17T10:00:00Z',
  followupObservedAt: '2026-09-17T11:00:00Z',
  usefulness: 5,
};

describe('derivePersonalScenarioEffect', () => {
  it('requires explicit feedback plus a subsequent compatible observation', () => {
    const result = derivePersonalScenarioEffect({
      scenarioId: 'short-walk',
      componentKey: 'mental_load',
      improvementDirection: 'lower',
      now: '2026-09-18T09:00:00Z',
      trials: [
        {
          ...baseTrial,
          followupObservedAt: '2026-09-17T08:59:00Z',
        },
      ],
    });

    expect(result).toBeNull();
  });

  it('derives a bounded personal effect from repeated explicit-outcome evidence', () => {
    const result = derivePersonalScenarioEffect({
      scenarioId: 'short-walk',
      componentKey: 'mental_load',
      improvementDirection: 'lower',
      now: '2026-09-18T09:00:00Z',
      trials: [
        baseTrial,
        {
          ...baseTrial,
          id: 'trial-2',
          baselineValue: 64,
          followupValue: 58,
          actionOccurredAt: '2026-09-16T09:00:00Z',
          feedbackObservedAt: '2026-09-16T10:00:00Z',
          followupObservedAt: '2026-09-16T11:00:00Z',
          usefulness: 4,
        },
      ],
    });

    expect(result).not.toBeNull();
    expect(result?.evidenceCount).toBe(2);
    expect(result?.deltaMin).toBeLessThan(0);
    expect(result?.deltaMax).toBeLessThanOrEqual(0);
    expect(result?.confidence.score).toBeGreaterThanOrEqual(0.4);
  });

  it('keeps one-off evidence below the simulator personal-effect threshold', () => {
    const result = derivePersonalScenarioEffect({
      scenarioId: 'short-walk',
      componentKey: 'mental_load',
      improvementDirection: 'lower',
      now: '2026-09-18T09:00:00Z',
      trials: [baseTrial],
    });

    expect(result?.evidenceCount).toBe(1);
  });
});
