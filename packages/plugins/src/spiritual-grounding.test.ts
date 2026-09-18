import { describe, expect, it } from 'vitest';

import { firstPartyPlugins, spiritualGroundingPlugin } from './index';

describe('spiritual grounding plugin', () => {
  it('is explicitly optional and declares only optional grounding state', () => {
    expect(spiritualGroundingPlugin.optional).toBe(true);
    expect(spiritualGroundingPlugin.dimensions).toEqual([
      {
        id: 'grounding',
        labelKey: 'dimensions.grounding',
        defaultWeight: 1,
        optional: true,
      },
    ]);
    expect(spiritualGroundingPlugin.actions).toEqual([]);
  });

  it('keeps first-party plugin identifiers unique', () => {
    const ids = firstPartyPlugins.map((plugin) => plugin.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
