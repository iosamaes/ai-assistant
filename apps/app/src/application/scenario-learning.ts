import {
  derivePersonalScenarioEffect,
  type PersonalScenarioEffect,
  type ScenarioImprovementDirection,
  type ScenarioTrialEvidence,
} from '@mizan/core';

import { loadRecentObservations, type DataResult, type StoredObservation } from '@/infrastructure/supabase/data-access';
import { loadScenarioTrialFeedback } from '@/infrastructure/supabase/scenario-trial-data';

export type LearnableScenarioId = 'earlier-bedtime' | 'quiet-focus' | 'short-walk';

type LearnableComponent = {
  componentKey: string;
  metric: string;
  improvementDirection: ScenarioImprovementDirection;
};

const DAY_MS = 86_400_000;
const LEARNING_WINDOW_DAYS = 90;
const MAX_FOLLOWUP_DAYS = 14;

const scenarioComponents: Readonly<Record<LearnableScenarioId, readonly LearnableComponent[]>> = {
  'earlier-bedtime': [
    { componentKey: 'recovery', metric: 'recovery', improvementDirection: 'higher' },
    { componentKey: 'energy', metric: 'energy', improvementDirection: 'higher' },
  ],
  'quiet-focus': [
    { componentKey: 'mental_load', metric: 'mental_load', improvementDirection: 'lower' },
    { componentKey: 'clarity', metric: 'clarity', improvementDirection: 'higher' },
  ],
  'short-walk': [
    { componentKey: 'energy', metric: 'energy', improvementDirection: 'higher' },
    { componentKey: 'mental_load', metric: 'mental_load', improvementDirection: 'lower' },
  ],
};

function findFollowupObservation(
  observations: readonly StoredObservation[],
  metric: string,
  afterIso: string,
): StoredObservation | null {
  const after = Date.parse(afterIso);
  if (!Number.isFinite(after)) return null;
  const latestAllowed = after + MAX_FOLLOWUP_DAYS * DAY_MS;
  return [...observations]
    .filter((observation) => {
      if (observation.metric !== metric || observation.value_number === null) return false;
      const observedAt = Date.parse(observation.observed_at);
      return Number.isFinite(observedAt) && observedAt > after && observedAt <= latestAllowed;
    })
    .sort((left, right) => Date.parse(left.observed_at) - Date.parse(right.observed_at))[0] ?? null;
}

export async function loadPersonalScenarioEffects(
  userId: string,
  scenarioId: LearnableScenarioId,
  now = new Date(),
): Promise<DataResult<PersonalScenarioEffect[]>> {
  const since = new Date(now.getTime() - LEARNING_WINDOW_DAYS * DAY_MS).toISOString();
  const [trialResult, observationResult] = await Promise.all([
    loadScenarioTrialFeedback(userId, scenarioId, since),
    loadRecentObservations(userId, since, 500),
  ]);
  if (!trialResult.ok) return trialResult;
  if (!observationResult.ok) return observationResult;

  const effects = scenarioComponents[scenarioId].flatMap((component) => {
    const trials: ScenarioTrialEvidence[] = trialResult.value.flatMap((trial) => {
      const baselineValue = trial.baseline[component.componentKey];
      if (baselineValue === undefined) return [];
      const followup = findFollowupObservation(
        observationResult.value,
        component.metric,
        trial.feedbackObservedAt,
      );
      if (!followup || followup.value_number === null) return [];
      return [{
        id: `${trial.eventId}:${component.componentKey}:${followup.id}`,
        scenarioId,
        componentKey: component.componentKey,
        baselineValue,
        followupValue: followup.value_number,
        actionOccurredAt: trial.occurredAt,
        feedbackObservedAt: trial.feedbackObservedAt,
        followupObservedAt: followup.observed_at,
        usefulness: trial.usefulness,
      }];
    });

    const effect = derivePersonalScenarioEffect({
      scenarioId,
      componentKey: component.componentKey,
      improvementDirection: component.improvementDirection,
      trials,
      now: now.toISOString(),
    });
    return effect ? [effect] : [];
  });

  return { ok: true, value: effects };
}
