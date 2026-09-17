import { describe, expect, it } from 'vitest';

import { coldStartFixture, sparseFixture } from './fixtures';
import {
  calculateConfidence,
  deriveHumanStateVector,
  derivePersonalBaseline,
} from './engine';
import type { EvidenceRef, Observation } from './types';

const now = '2026-09-17T12:00:00.000Z';
const userId = 'fixture-user';

function observation(
  id: string,
  metric: string,
  value: number,
  observedAt: string,
): Observation {
  return {
    id,
    userId,
    dimensionId: 'fixture',
    metric,
    value,
    observedAt,
    source: 'self_reported',
  };
}

describe('deterministic intelligence foundations', () => {
  it('keeps missing state unknown instead of silently converting it to zero', () => {
    const state = deriveHumanStateVector(coldStartFixture.observations, now);
    const energy = state.components.find((component) => component.key === 'energy');

    expect(state.maturity).toBe('cold_start');
    expect(energy?.value).toBeNull();
    expect(energy?.source).toBe('unknown');
    expect(energy?.confidence.level).toBe('insufficient');
  });

  it('uses direct sparse evidence conservatively', () => {
    const state = deriveHumanStateVector(sparseFixture.observations, now);
    const energy = state.components.find((component) => component.key === 'energy');

    expect(energy?.value).toBe(44);
    expect(energy?.evidence.map((item) => item.id)).toEqual(['s1']);
    expect(energy?.confidence.level).not.toBe('known');
  });

  it('derives overload risk only when both energy and mental-load evidence exist', () => {
    const state = deriveHumanStateVector(
      [
        observation('e1', 'energy', 20, '2026-09-17T08:00:00.000Z'),
        observation('m1', 'mental_load', 90, '2026-09-17T09:00:00.000Z'),
      ],
      now,
    );
    const overload = state.components.find((component) => component.key === 'overload_risk');

    expect(overload?.value).toBe(86);
    expect(overload?.source).toBe('inferred');
    expect(overload?.evidence.map((item) => item.id).sort()).toEqual(['e1', 'm1']);
  });

  it('builds a robust 90-day baseline without letting one outlier become the norm', () => {
    const observations = [30, 31, 32, 33, 34, 35, 100].map((value, index) =>
      observation(
        `b${index}`,
        'energy',
        value,
        `2026-09-${String(10 + index).padStart(2, '0')}T08:00:00.000Z`,
      ),
    );
    const baseline = derivePersonalBaseline(observations, 'energy', now);

    expect(baseline.maturity).toBe('personalized');
    expect(baseline.median).toBe(33);
    expect(baseline.upperQuartile).toBeLessThan(100);
    expect(baseline.evidence).toHaveLength(7);
  });

  it('keeps baseline maturity explicit when evidence is insufficient', () => {
    const baseline = derivePersonalBaseline(sparseFixture.observations, 'energy', now);

    expect(baseline.maturity).toBe('cold_start');
    expect(baseline.median).toBe(44);
    expect(baseline.confidence.level).toBe('insufficient');
  });

  it('reduces confidence as evidence becomes stale while remaining deterministic', () => {
    const fresh: EvidenceRef[] = [
      {
        id: 'fresh',
        source: 'observed',
        observedAt: '2026-09-17T11:00:00.000Z',
        label: 'fixture:energy',
      },
    ];
    const stale: EvidenceRef[] = [
      {
        id: 'stale',
        source: 'observed',
        observedAt: '2026-07-01T11:00:00.000Z',
        label: 'fixture:energy',
      },
    ];

    const freshConfidence = calculateConfidence(fresh, now, 1);
    const staleConfidence = calculateConfidence(stale, now, 1);

    expect(freshConfidence.score).toBeGreaterThan(staleConfidence.score);
    expect(calculateConfidence(fresh, now, 1)).toEqual(freshConfidence);
  });
});
