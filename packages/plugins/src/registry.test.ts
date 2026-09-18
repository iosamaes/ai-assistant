import { describe, expect, it } from 'vitest';

import type { PluginManifest } from '@mizan/core';

import {
  activePluginContributions,
  bodyHealthPlugin,
  foundationalPlugin,
  resolvePlugin,
} from './index';

describe('plugin registry availability', () => {
  it('keeps disabled plugin contributions out without modifying the manifest', () => {
    const resolved = resolvePlugin(foundationalPlugin, false, []);
    const active = activePluginContributions([resolved]);

    expect(resolved.status).toBe('disabled');
    expect(active.dimensions).toEqual([]);
    expect(active.actions).toEqual([]);
    expect(foundationalPlugin.dimensions.length).toBeGreaterThan(0);
  });

  it('degrades when only optional external data is unavailable', () => {
    const resolved = resolvePlugin(bodyHealthPlugin, true, []);

    expect(resolved.status).toBe('degraded');
    expect(resolved.missingRequirementIds).toEqual(['body-health-data']);
    expect(activePluginContributions([resolved]).dimensions).toEqual(bodyHealthPlugin.dimensions);
  });

  it('becomes ready when the capability and scopes are available', () => {
    const resolved = resolvePlugin(bodyHealthPlugin, true, [
      {
        capability: 'health_data',
        available: true,
        grantedScopes: ['read_activity', 'read_recovery'],
      },
    ]);

    expect(resolved.status).toBe('ready');
    expect(resolved.missingRequirementIds).toEqual([]);
  });

  it('allows a sample plugin to be registered without core-engine edits', () => {
    const samplePlugin: PluginManifest = {
      id: 'sample-community',
      version: '0.0.1',
      labelKey: 'plugins.sampleCommunity.label',
      optional: true,
      dimensions: [
        {
          id: 'community',
          labelKey: 'dimensions.community',
          defaultWeight: 1,
          optional: true,
        },
      ],
      actions: [],
      dataRequirements: [],
    };

    const resolved = resolvePlugin(samplePlugin, true, []);
    const contributions = activePluginContributions([resolved]);

    expect(resolved.status).toBe('ready');
    expect(contributions.dimensions.map((dimension) => dimension.id)).toEqual(['community']);
  });
});
