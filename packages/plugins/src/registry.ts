import type { ActionDefinition, DimensionDefinition, PluginManifest } from '@mizan/core';

export interface CapabilityAvailability {
  capability: string;
  available: boolean;
  grantedScopes: readonly string[];
}

export type PluginAvailabilityStatus = 'disabled' | 'ready' | 'degraded' | 'unavailable';

export interface ResolvedPlugin {
  manifest: PluginManifest;
  enabled: boolean;
  status: PluginAvailabilityStatus;
  missingRequirementIds: readonly string[];
  missingScopes: readonly string[];
}

export interface ActivePluginContributions {
  dimensions: readonly DimensionDefinition[];
  actions: readonly ActionDefinition[];
}

export function resolvePlugin(
  manifest: PluginManifest,
  enabled: boolean,
  capabilities: readonly CapabilityAvailability[],
): ResolvedPlugin {
  if (!enabled) {
    return {
      manifest,
      enabled: false,
      status: 'disabled',
      missingRequirementIds: [],
      missingScopes: [],
    };
  }

  const availability = new Map(capabilities.map((item) => [item.capability, item]));
  const missingRequirementIds: string[] = [];
  const missingScopes = new Set<string>();
  let requiredMissing = false;

  for (const requirement of manifest.dataRequirements ?? []) {
    const capability = availability.get(requirement.capability);
    const granted = new Set(capability?.grantedScopes ?? []);
    const missingForRequirement = requirement.permissionScopes.filter((scope) => !granted.has(scope));
    const satisfied = Boolean(capability?.available) && missingForRequirement.length === 0;
    if (!satisfied) {
      missingRequirementIds.push(requirement.id);
      missingForRequirement.forEach((scope) => missingScopes.add(scope));
      if (!requirement.optional) requiredMissing = true;
    }
  }

  return {
    manifest,
    enabled: true,
    status: requiredMissing
      ? 'unavailable'
      : missingRequirementIds.length > 0
        ? 'degraded'
        : 'ready',
    missingRequirementIds,
    missingScopes: [...missingScopes].sort(),
  };
}

export function activePluginContributions(
  plugins: readonly ResolvedPlugin[],
): ActivePluginContributions {
  const active = plugins.filter(
    (plugin) => plugin.enabled && plugin.status !== 'unavailable' && plugin.status !== 'disabled',
  );
  return {
    dimensions: active.flatMap((plugin) => plugin.manifest.dimensions),
    actions: active.flatMap((plugin) => plugin.manifest.actions),
  };
}
