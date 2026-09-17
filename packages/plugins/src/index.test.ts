import { describe, expect, it } from 'vitest';

import { foundationalPlugin } from './index';

describe('foundational plugin', () => {
  it('exposes unique dimensions and actions through the core contract', () => {
    const dimensionIds = foundationalPlugin.dimensions.map((dimension) => dimension.id);
    const actionIds = foundationalPlugin.actions.map((action) => action.id);

    expect(new Set(dimensionIds).size).toBe(dimensionIds.length);
    expect(new Set(actionIds).size).toBe(actionIds.length);
  });

  it('references only dimensions declared by the same plugin', () => {
    const dimensions = new Set(foundationalPlugin.dimensions.map((dimension) => dimension.id));

    for (const action of foundationalPlugin.actions) {
      for (const dimensionId of action.dimensionIds) {
        expect(dimensions.has(dimensionId)).toBe(true);
      }
    }
  });
});
