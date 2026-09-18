import {
  evaluateExperiment,
  validateExperimentPlan,
  type ExperimentEvaluation,
  type ExperimentObservation,
  type ExperimentPlan,
} from '@mizan/core';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import {
  insertActionEvent,
  insertFeedbackOutcome,
  loadRecentObservations,
  type DataResult,
  type StoredObservation,
} from '@/infrastructure/supabase/data-access';
import {
  createExperiment,
  loadRecentExperiments,
  updateExperimentLifecycle,
  type StoredExperiment,
} from '@/infrastructure/supabase/experiments';
import { loadExperimentTrialEvent } from '@/infrastructure/supabase/scenario-trial-data';

export type ExperimentTemplateId = 'earlier-bedtime' | 'quiet-focus' | 'short-walk';

export type ExperimentTemplate = {
  id: ExperimentTemplateId;
  metric: 'recovery' | 'mental_load' | 'energy';
  expectedDirection: 'higher' | 'lower';
  durationDays: number;
  baselineComponentKeys: readonly string[];
};

export type ExperimentWithEvaluation = {
  experiment: StoredExperiment;
  evaluation: ExperimentEvaluation;
};

export const experimentTemplates: Readonly<Record<ExperimentTemplateId, ExperimentTemplate>> = {
  'earlier-bedtime': {
    id: 'earlier-bedtime',
    metric: 'recovery',
    expectedDirection: 'higher',
    durationDays: 5,
    baselineComponentKeys: ['recovery', 'energy'],
  },
  'quiet-focus': {
    id: 'quiet-focus',
    metric: 'mental_load',
    expectedDirection: 'lower',
    durationDays: 3,
    baselineComponentKeys: ['mental_load', 'clarity'],
  },
  'short-walk': {
    id: 'short-walk',
    metric: 'energy',
    expectedDirection: 'higher',
    durationDays: 5,
    baselineComponentKeys: ['energy', 'mental_load'],
  },
};

const DAY_MS = 86_400_000;
const BASELINE_WINDOW_DAYS = 7;
const HISTORY_WINDOW_DAYS = 120;

function invalid<T>(): DataResult<T> {
  return { ok: false, error: { kind: 'invalid' } };
}

function baselineSnapshot(
  componentKeys: readonly string[],
  state: Awaited<ReturnType<typeof loadCurrentHumanState>> extends DataResult<infer T> ? T : never,
): Record<string, number> {
  return Object.fromEntries(
    state.components.flatMap((component) =>
      componentKeys.includes(component.key) && component.value !== null
        ? [[component.key, component.value] as const]
        : [],
    ),
  );
}

export async function startExperiment(input: {
  userId: string;
  templateId: ExperimentTemplateId;
  hypothesis: string;
  consented: boolean;
  now?: Date;
}): Promise<DataResult<StoredExperiment>> {
  if (!input.consented) return invalid();
  const template = experimentTemplates[input.templateId];
  const now = input.now ?? new Date();
  const startedAt = now.toISOString();
  const plan: ExperimentPlan = {
    hypothesis: input.hypothesis.trim(),
    metric: template.metric,
    expectedDirection: template.expectedDirection,
    durationDays: template.durationDays,
    consentedAt: startedAt,
  };
  if (!validateExperimentPlan(plan)) return invalid();

  const state = await loadCurrentHumanState(input.userId, now);
  if (!state.ok) return state;

  return createExperiment(input.userId, {
    template_id: template.id,
    hypothesis: plan.hypothesis,
    metric: plan.metric,
    expected_direction: plan.expectedDirection,
    duration_days: plan.durationDays,
    consented_at: plan.consentedAt,
    status: 'active',
    started_at: startedAt,
    baseline_snapshot: baselineSnapshot(template.baselineComponentKeys, state.value),
  });
}

export async function cancelExperiment(
  userId: string,
  experimentId: string,
  now = new Date(),
): Promise<DataResult<StoredExperiment>> {
  return updateExperimentLifecycle(userId, experimentId, {
    status: 'cancelled',
    ended_at: now.toISOString(),
  });
}

export async function completeExperimentWithOutcome(input: {
  userId: string;
  experiment: StoredExperiment;
  usefulness: number;
  now?: Date;
}): Promise<DataResult<StoredExperiment>> {
  if (!Number.isInteger(input.usefulness) || input.usefulness < 1 || input.usefulness > 5) return invalid();
  if (input.experiment.status === 'cancelled') return invalid();

  const now = input.now ?? new Date();
  const observedAt = now.toISOString();
  const existing = await loadExperimentTrialEvent(input.userId, input.experiment.id);
  if (!existing.ok) return existing;

  let eventId = existing.value?.eventId ?? null;
  if (!eventId) {
    const event = await insertActionEvent(input.userId, {
      action_key: `experiment:${input.experiment.template_id ?? input.experiment.metric}`,
      event_type: 'completed',
      occurred_at: input.experiment.started_at ?? input.experiment.created_at,
      context: {
        source: 'what_if_trial',
        scenario_id: input.experiment.template_id,
        experiment_id: input.experiment.id,
        baseline: input.experiment.baseline_snapshot,
        metric: input.experiment.metric,
        duration_days: input.experiment.duration_days,
      },
    });
    if (!event.ok) return event;
    eventId = event.value;
  }

  if (existing.value?.usefulness === null || existing.value === null) {
    const feedback = await insertFeedbackOutcome(input.userId, {
      action_event_id: eventId,
      usefulness: input.usefulness,
      observed_at: observedAt,
    });
    if (!feedback.ok) return feedback;
  }

  return updateExperimentLifecycle(input.userId, input.experiment.id, {
    status: 'completed',
    ended_at: observedAt,
  });
}

function toExperimentObservation(observation: StoredObservation): ExperimentObservation | null {
  if (observation.value_number === null) return null;
  return {
    id: observation.id,
    value: observation.value_number,
    observedAt: observation.observed_at,
  };
}

function evaluateStoredExperiment(
  experiment: StoredExperiment,
  observations: readonly StoredObservation[],
  now: Date,
): ExperimentEvaluation {
  const startIso = experiment.started_at ?? experiment.created_at;
  const startMs = Date.parse(startIso);
  const endMs = experiment.ended_at ? Date.parse(experiment.ended_at) : now.getTime();
  const baselineStartMs = startMs - BASELINE_WINDOW_DAYS * DAY_MS;

  const metricObservations = observations.filter(
    (observation) => observation.metric === experiment.metric && observation.value_number !== null,
  );
  const baseline = metricObservations.flatMap((observation) => {
    const observedAt = Date.parse(observation.observed_at);
    const mapped = toExperimentObservation(observation);
    return mapped && observedAt >= baselineStartMs && observedAt < startMs ? [mapped] : [];
  });
  const followup = metricObservations.flatMap((observation) => {
    const observedAt = Date.parse(observation.observed_at);
    const mapped = toExperimentObservation(observation);
    return mapped && observedAt >= startMs && observedAt <= endMs ? [mapped] : [];
  });

  return evaluateExperiment({
    plan: {
      hypothesis: experiment.hypothesis,
      metric: experiment.metric,
      expectedDirection: experiment.expected_direction,
      durationDays: experiment.duration_days,
      consentedAt: experiment.consented_at,
    },
    baseline,
    followup,
    now: now.toISOString(),
  });
}

export async function loadExperimentHistory(
  userId: string,
  now = new Date(),
): Promise<DataResult<ExperimentWithEvaluation[]>> {
  const since = new Date(now.getTime() - HISTORY_WINDOW_DAYS * DAY_MS).toISOString();
  const [experiments, observations] = await Promise.all([
    loadRecentExperiments(userId, 20),
    loadRecentObservations(userId, since, 500),
  ]);
  if (!experiments.ok) return experiments;
  if (!observations.ok) return observations;

  return {
    ok: true,
    value: experiments.value.map((experiment) => ({
      experiment,
      evaluation: evaluateStoredExperiment(experiment, observations.value, now),
    })),
  };
}
