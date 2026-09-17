import { describe, expect, it } from 'vitest';

import { coldStartFixture, normalHistoryFixture, overloadedFixture, sparseFixture } from './fixtures';

describe('deterministic CP0 fixtures', () => {
  it('keeps cold start truly empty rather than inventing zero-valued evidence', () => {
    expect(coldStartFixture.observations).toEqual([]);
  });

  it('provides distinct evidence shapes for personalized, sparse, and overloaded states', () => {
    expect(normalHistoryFixture.observations.length).toBeGreaterThan(1);
    expect(sparseFixture.observations).toHaveLength(1);
    expect(overloadedFixture.observations.some((observation) => observation.metric === 'load')).toBe(true);
    expect(overloadedFixture.observations.some((observation) => observation.metric === 'energy')).toBe(true);
  });

  it('uses stable fixture ownership for deterministic tests', () => {
    const owners = [
      ...normalHistoryFixture.observations,
      ...sparseFixture.observations,
      ...overloadedFixture.observations,
    ].map((observation) => observation.userId);

    expect(new Set(owners)).toEqual(new Set(['fixture-user']));
  });
});
