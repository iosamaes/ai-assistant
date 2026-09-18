import type { PluginManifest } from '@mizan/core';

export const foundationalPlugin: PluginManifest = {
  id: 'foundational-life',
  version: '0.1.0',
  labelKey: 'plugins.foundational.label',
  optional: false,
  dimensions: [
    { id: 'recovery', labelKey: 'dimensions.recovery', defaultWeight: 1, optional: false },
    { id: 'connection', labelKey: 'dimensions.connection', defaultWeight: 1, optional: false },
    { id: 'work', labelKey: 'dimensions.work', defaultWeight: 1, optional: false },
    { id: 'margin', labelKey: 'dimensions.margin', defaultWeight: 1, optional: true },
  ],
  actions: [
    {
      id: 'protect-recovery-window',
      labelKey: 'actions.protectRecoveryWindow',
      dimensionIds: ['recovery', 'margin'],
      effort: 0.2,
      timeMinutes: 20,
      risk: 0,
    },
    {
      id: 'meaningful-connection',
      labelKey: 'actions.meaningfulConnection',
      dimensionIds: ['connection'],
      effort: 0.3,
      timeMinutes: 15,
      risk: 0,
    },
  ],
};

export const spiritualGroundingPlugin: PluginManifest = {
  id: 'spiritual-grounding',
  version: '0.1.0',
  labelKey: 'plugins.spiritualGrounding.label',
  optional: true,
  dimensions: [
    {
      id: 'grounding',
      labelKey: 'dimensions.grounding',
      defaultWeight: 1,
      optional: true,
    },
  ],
  actions: [],
};

export const firstPartyPlugins = [foundationalPlugin, spiritualGroundingPlugin] as const;
