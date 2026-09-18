import {
  estimateActionUsefulness,
  type ActionOutcomeFeedback,
  type ActionUsefulnessEstimate,
} from '@mizan/core';
import { foundationalPlugin } from '@mizan/plugins';

import { usefulnessToBenefit } from '@/application/action-feedback';
import {
  loadActionOutcomeFeedback,
  type DataResult,
  type StoredActionFeedback,
} from '@/infrastructure/supabase/data-access';

const FEEDBACK_WINDOW_DAYS = 90;
const DAY_MS = 86_400_000;

export type PersonalLearningOutcome = {
  id: string;
  usefulness: number;
  benefit: number;
  outcomeNote: string | null;
  observedAt: string;
  completed: boolean;
};

export type PersonalLearningAction = {
  actionId: string;
  labelKey: string;
  estimate: ActionUsefulnessEstimate;
  outcomes: readonly PersonalLearningOutcome[];
};

function feedbackSince(now: Date): string {
  return new Date(now.getTime() - FEEDBACK_WINDOW_DAYS * DAY_MS).toISOString();
}

function toCoreFeedback(row: StoredActionFeedback): ActionOutcomeFeedback | null {
  if (row.usefulness === null) return null;
  const benefit = usefulnessToBenefit(row.usefulness);
  if (benefit === null) return null;

  return {
    id: row.id,
    actionId: row.action_key,
    completed: row.event_type === 'completed',
    benefit,
    observedAt: row.observed_at,
    confidence: {
      level: 'known',
      score: 1,
      evidenceCount: 1,
      freshnessDays: 0,
    },
    evidence: [
      {
        id: row.id,
        source: 'self_reported',
        observedAt: row.observed_at,
        label: 'explicit_action_outcome',
      },
    ],
  };
}

export function buildPersonalLearningAction(
  actionId: string,
  labelKey: string,
  rows: readonly StoredActionFeedback[],
  now: Date,
): PersonalLearningAction {
  const coreFeedback = rows.flatMap((row) => {
    const mapped = toCoreFeedback(row);
    return mapped ? [mapped] : [];
  });
  const estimate = estimateActionUsefulness(actionId, coreFeedback, now.toISOString());
  const outcomes = rows.flatMap((row) => {
    if (row.usefulness === null) return [];
    const benefit = usefulnessToBenefit(row.usefulness);
    if (benefit === null) return [];
    return [
      {
        id: row.id,
        usefulness: row.usefulness,
        benefit,
        outcomeNote: row.outcome_note,
        observedAt: row.observed_at,
        completed: row.event_type === 'completed',
      },
    ];
  });

  return {
    actionId,
    labelKey,
    estimate,
    outcomes: outcomes.sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt)),
  };
}

export async function loadPersonalLearning(
  userId: string,
  now = new Date(),
): Promise<DataResult<PersonalLearningAction[]>> {
  const since = feedbackSince(now);
  const results = await Promise.all(
    foundationalPlugin.actions.map(async (action) => {
      const history = await loadActionOutcomeFeedback(userId, action.id, since);
      return { action, history };
    }),
  );

  const failed = results.find((result) => !result.history.ok);
  if (failed && !failed.history.ok) return { ok: false, error: failed.history.error };

  return {
    ok: true,
    value: results.map(({ action, history }) =>
      buildPersonalLearningAction(action.id, action.labelKey, history.ok ? history.value : [], now),
    ),
  };
}
