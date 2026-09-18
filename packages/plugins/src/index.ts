import type { PluginManifest } from '@mizan/core';

export * from './registry';

export const foundationalPlugin: PluginManifest = {
  id: 'foundational-life',
  version: '0.2.0',
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
  dataRequirements: [
    {
      id: 'foundational-health-context',
      capability: 'health_data',
      metricIds: ['energy', 'recovery', 'sleep_duration'],
      permissionScopes: ['read_recovery'],
      optional: true,
    },
    {
      id: 'foundational-time-context',
      capability: 'time_context',
      metricIds: ['available_margin_minutes'],
      permissionScopes: ['read_busy_time'],
      optional: true,
    },
  ],
};

export const bodyHealthPlugin: PluginManifest = {
  id: 'body-health',
  version: '0.1.0',
  labelKey: 'plugins.bodyHealth.label',
  optional: true,
  dimensions: [
    { id: 'body_energy', labelKey: 'dimensions.bodyEnergy', defaultWeight: 1, optional: true },
  ],
  actions: [],
  dataRequirements: [
    {
      id: 'body-health-data',
      capability: 'health_data',
      metricIds: ['steps', 'resting_heart_rate', 'sleep_duration'],
      permissionScopes: ['read_activity', 'read_recovery'],
      optional: true,
    },
  ],
};

export const mentalEmotionalPlugin: PluginManifest = {
  id: 'mental-emotional',
  version: '0.1.0',
  labelKey: 'plugins.mentalEmotional.label',
  optional: true,
  dimensions: [
    { id: 'mental_load', labelKey: 'dimensions.mentalLoad', defaultWeight: 1, optional: true },
  ],
  actions: [],
};

export const financialSafetyPlugin: PluginManifest = {
  id: 'financial-safety',
  version: '0.1.0',
  labelKey: 'plugins.financialSafety.label',
  optional: true,
  dimensions: [
    { id: 'financial_safety', labelKey: 'dimensions.financialSafety', defaultWeight: 1, optional: true },
  ],
  actions: [],
};

export const learningGrowthPlugin: PluginManifest = {
  id: 'learning-growth',
  version: '0.1.0',
  labelKey: 'plugins.learningGrowth.label',
  optional: true,
  dimensions: [
    { id: 'learning', labelKey: 'dimensions.learning', defaultWeight: 1, optional: true },
  ],
  actions: [],
};

export const habitsRoutinesPlugin: PluginManifest = {
  id: 'habits-routines',
  version: '0.1.0',
  labelKey: 'plugins.habitsRoutines.label',
  optional: true,
  dimensions: [
    { id: 'routines', labelKey: 'dimensions.routines', defaultWeight: 0.5, optional: true },
  ],
  actions: [],
};

export const restPlayPlugin: PluginManifest = {
  id: 'rest-play',
  version: '0.1.0',
  labelKey: 'plugins.restPlay.label',
  optional: true,
  dimensions: [
    { id: 'rest_play', labelKey: 'dimensions.restPlay', defaultWeight: 1, optional: true },
  ],
  actions: [],
};

export const environmentPlugin: PluginManifest = {
  id: 'personal-environment',
  version: '0.1.0',
  labelKey: 'plugins.environment.label',
  optional: true,
  dimensions: [
    { id: 'environment', labelKey: 'dimensions.environment', defaultWeight: 0.75, optional: true },
  ],
  actions: [],
  dataRequirements: [
    {
      id: 'environment-location-context',
      capability: 'location_context',
      metricIds: ['place_context'],
      permissionScopes: ['read_approximate_context'],
      optional: true,
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

export const firstPartyPlugins = [
  foundationalPlugin,
  bodyHealthPlugin,
  mentalEmotionalPlugin,
  financialSafetyPlugin,
  learningGrowthPlugin,
  habitsRoutinesPlugin,
  restPlayPlugin,
  environmentPlugin,
  spiritualGroundingPlugin,
] as const;
