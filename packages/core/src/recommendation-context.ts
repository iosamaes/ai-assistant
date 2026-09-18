import type { HumanStateVector } from './types';

export function buildRecommendationContextId(state: HumanStateVector): string {
  const evidenceKeys = Array.from(
    new Set(
      state.components.flatMap((component) =>
        component.evidence.map((evidence) => `${evidence.id}@${evidence.observedAt}`),
      ),
    ),
  ).sort();
  return `evidence-v1|${evidenceKeys.join('|')}`;
}
