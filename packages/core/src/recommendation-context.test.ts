import { describe, expect, it } from 'vitest';

import { buildRecommendationContextId } from './recommendation-context';
import type { HumanStateVector } from './types';

function state(evidenceId: string, observedAt: string, reverse = false): HumanStateVector {
  const components = [
    {
      key: 'energy',
      value: 40,
      confidence: { level: 'likely' as const, score: 0.6, evidenceCount: 1, freshnessDays: 0 },
      evidence: [{ id: evidenceId, source: 'self_reported' as const, observedAt, label: 'body:energy' }],
      source: 'self_reported' as const,
    },
    {
      key: 'recovery',
      value: 45,
      confidence: { level: 'likely' as const, score: 0.6, evidenceCount: 1, freshnessDays: 0 },
      evidence: [{ id: 'shared', source: 'self_reported' as const, observedAt, label: 'sleep:recovery' }],
      source: 'self_reported' as const,
    },
  ];
  return {
    generatedAt: '2026-09-18T00:00:00Z',
    maturity: 'learning',
    components: reverse ? [...components].reverse() : components,
  };
}

describe('buildRecommendationContextId', () => {
  it('is stable when state component order changes', () => {
    expect(buildRecommendationContextId(state('energy-1', '2026-09-18T00:00:00Z'))).toBe(
      buildRecommendationContextId(state('energy-1', '2026-09-18T00:00:00Z', true)),
    );
  });

  it('changes when a new persisted observation becomes evidence', () => {
    expect(buildRecommendationContextId(state('energy-1', '2026-09-18T00:00:00Z'))).not.toBe(
      buildRecommendationContextId(state('energy-2', '2026-09-18T01:00:00Z')),
    );
  });
});
