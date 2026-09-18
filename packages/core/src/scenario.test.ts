import { describe, expect, it } from 'vitest';

import { simulateScenario, type ScenarioDefinition } from './scenario';
import type { HumanStateVector } from './types';

const state: HumanStateVector = {
  generatedAt: '2026-09-18T07:00:00Z',
  maturity: 'learning',
  components: [
    {
      key: 'recovery',
      value: 62,
      confidence: { level: 'likely', score: 0.72, evidenceCount: 5, freshnessDays: 0 },
      evidence: [],
      source: 'self_reported',
    },
    {
      key: 'clarity',
      value: null,
      confidence: { level: 'insufficient', score: 0, evidenceCount: 0, freshnessDays: null },
      evidence: [],
      source: 'unknown',
    },
  ],
};

const definition: ScenarioDefinition = {
  id: 'protect-margin',
  labelKey: 'scenario.protectMargin',
  assumptions: ['The proposed change is applied once today.', 'Other major conditions remain broadly similar.'],
  priorEffects: [
    {
      componentKey: 'recovery',
      deltaMin: 2,
      deltaMax: 8,
      confidence: { level: 'possible', score: 0.3, evidenceCount: 0, freshnessDays: null },
    },
    {
      componentKey: 'clarity',
      deltaMin: 1,
      deltaMax: 6,
      confidence: { level: 'possible', score: 0.3, evidenceCount: 0, freshnessDays: null },
    },
  ],
};

describe('simulateScenario', () => {
  it('uses conservative priors without inventing a current value for unknown state', () => {
    const result = simulateScenario({ definition, currentState: state, generatedAt: '2026-09-18T08:00:00Z' });

    expect(result.uncertainty).toBe('high');
    expect(result.effects[0]).toMatchObject({
      componentKey: 'recovery',
      source: 'conservative_prior',
      currentValue: 62,
      projectedMin: 64,
      projectedMax: 70,
    });
    expect(result.effects[1]).toMatchObject({
      componentKey: 'clarity',
      currentValue: null,
      projectedMin: null,
      projectedMax: null,
    });
  });

  it('prefers usable personal evidence and preserves its range', () => {
    const result = simulateScenario({
      definition,
      currentState: state,
      personalEffects: [
        {
          scenarioId: 'protect-margin',
          componentKey: 'recovery',
          deltaMin: 5,
          deltaMax: 11,
          evidenceCount: 4,
          confidence: { level: 'likely', score: 0.68, evidenceCount: 4, freshnessDays: 3 },
        },
      ],
    });

    expect(result.effects[0]).toMatchObject({
      source: 'personal',
      deltaMin: 5,
      deltaMax: 11,
      projectedMin: 67,
      projectedMax: 73,
      evidenceCount: 4,
    });
    expect(result.uncertainty).toBe('moderate');
  });

  it('rejects weak personal estimates and clamps projected values to the state scale', () => {
    const highState: HumanStateVector = {
      ...state,
      components: [{ ...state.components[0], value: 98 }],
    };
    const result = simulateScenario({
      definition: { ...definition, priorEffects: [definition.priorEffects[0]] },
      currentState: highState,
      personalEffects: [
        {
          scenarioId: 'protect-margin',
          componentKey: 'recovery',
          deltaMin: 20,
          deltaMax: 30,
          evidenceCount: 1,
          confidence: { level: 'possible', score: 0.2, evidenceCount: 1, freshnessDays: 1 },
        },
      ],
    });

    expect(result.effects[0].source).toBe('conservative_prior');
    expect(result.effects[0].projectedMax).toBe(100);
  });
});
