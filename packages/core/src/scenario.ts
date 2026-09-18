import type { Confidence, HumanStateVector, ISODateTime } from './types';

export type ScenarioEffectSource = 'personal' | 'conservative_prior';

export interface ScenarioEffectEstimate {
  componentKey: string;
  deltaMin: number;
  deltaMax: number;
  confidence: Confidence;
  source: ScenarioEffectSource;
  evidenceCount: number;
}

export interface ScenarioDefinition {
  id: string;
  labelKey: string;
  assumptions: readonly string[];
  priorEffects: readonly Omit<ScenarioEffectEstimate, 'source' | 'evidenceCount'>[];
}

export interface PersonalScenarioEffect {
  scenarioId: string;
  componentKey: string;
  deltaMin: number;
  deltaMax: number;
  confidence: Confidence;
  evidenceCount: number;
}

export interface ScenarioProjectionEffect {
  componentKey: string;
  source: ScenarioEffectSource;
  deltaMin: number;
  deltaMax: number;
  currentValue: number | null;
  projectedMin: number | null;
  projectedMax: number | null;
  confidence: Confidence;
  evidenceCount: number;
}

export interface ScenarioProjection {
  scenarioId: string;
  generatedAt: ISODateTime;
  assumptions: readonly string[];
  effects: readonly ScenarioProjectionEffect[];
  uncertainty: 'high' | 'moderate' | 'lower';
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));

function usablePersonalEffect(effect: PersonalScenarioEffect): boolean {
  return effect.evidenceCount >= 2 && effect.confidence.level !== 'insufficient' && effect.confidence.score >= 0.4;
}

function projectionUncertainty(effects: readonly ScenarioProjectionEffect[]): ScenarioProjection['uncertainty'] {
  if (effects.length === 0) return 'high';
  const personalCount = effects.filter((effect) => effect.source === 'personal').length;
  const likelyOrKnown = effects.filter(
    (effect) => effect.confidence.level === 'likely' || effect.confidence.level === 'known',
  ).length;
  if (personalCount === effects.length && likelyOrKnown === effects.length) return 'lower';
  if (personalCount > 0 || likelyOrKnown > 0) return 'moderate';
  return 'high';
}

export function simulateScenario(input: {
  definition: ScenarioDefinition;
  currentState: HumanStateVector;
  personalEffects?: readonly PersonalScenarioEffect[];
  generatedAt?: ISODateTime;
}): ScenarioProjection {
  const personalEffects = input.personalEffects ?? [];
  const componentByKey = new Map(input.currentState.components.map((component) => [component.key, component]));

  const effects = input.definition.priorEffects.map((prior): ScenarioProjectionEffect => {
    const personal = personalEffects.find(
      (effect) =>
        effect.scenarioId === input.definition.id &&
        effect.componentKey === prior.componentKey &&
        usablePersonalEffect(effect),
    );
    const chosen = personal
      ? { ...personal, source: 'personal' as const }
      : { ...prior, source: 'conservative_prior' as const, evidenceCount: 0 };
    const current = componentByKey.get(chosen.componentKey);
    const currentValue = current?.value ?? null;

    return {
      componentKey: chosen.componentKey,
      source: chosen.source,
      deltaMin: Math.min(chosen.deltaMin, chosen.deltaMax),
      deltaMax: Math.max(chosen.deltaMin, chosen.deltaMax),
      currentValue,
      projectedMin: currentValue === null ? null : clamp(currentValue + Math.min(chosen.deltaMin, chosen.deltaMax)),
      projectedMax: currentValue === null ? null : clamp(currentValue + Math.max(chosen.deltaMin, chosen.deltaMax)),
      confidence: chosen.confidence,
      evidenceCount: chosen.evidenceCount,
    };
  });

  return {
    scenarioId: input.definition.id,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    assumptions: input.definition.assumptions,
    effects,
    uncertainty: projectionUncertainty(effects),
  };
}
