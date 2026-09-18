import {
  estimateActionUsefulness,
  type ActionOutcomeFeedback,
  type ActionUsefulnessEstimate,
} from '@mizan/core';

import {
  insertFeedbackOutcome,
  loadActionOutcomeFeedback,
  type DataResult,
  type StoredActionFeedback,
} from '@/infrastructure/supabase/data-access';

const FEEDBACK_WINDOW_DAYS = 90;
const DAY_MS = 86_400_000;

export type RecordedActionFeedback = {
  feedbackId: string;
  estimate: ActionUsefulnessEstimate | null;
};

export function usefulnessToBenefit(usefulness: number): number | null {
  if (!Number.isInteger(usefulness) || usefulness < 1 || usefulness > 5) return null;
  return (usefulness - 3) * 50;
}

function toOutcomeFeedback(row: StoredActionFeedback): ActionOutcomeFeedback | null {
  if (row.usefulness === null) return null;
  const benefit = usefulnessToBenefit(row.usefulness);
  if (benefit === null) return null;
  const evidence = [{
    id: row.id,
    source: 'self_reported' as const,
    observedAt: row.observed_at,
    label: 'explicit_action_outcome',
  }];

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
    evidence,
  };
}

export async function recordExplicitActionOutcome(
  userId: string,
  actionId: string,
  actionEventId: string,
  usefulness: number,
  outcomeNote: string,
): Promise<DataResult<RecordedActionFeedback>> {
  if (usefulnessToBenefit(usefulness) === null) {
    return { ok: false, error: { kind: 'invalid' } };
  }

  const now = new Date();
  const observedAt = now.toISOString();
  const note = outcomeNote.trim();
  const saved = await insertFeedbackOutcome(userId, {
    action_event_id: actionEventId,
    usefulness,
    outcome_note: note.length > 0 ? note : undefined,
    observed_at: observedAt,
  });
  if (!saved.ok) return saved;

  const since = new Date(now.getTime() - FEEDBACK_WINDOW_DAYS * DAY_MS).toISOString();
  const history = await loadActionOutcomeFeedback(userId, actionId, since);
  if (!history.ok) {
    return { ok: true, value: { feedbackId: saved.value, estimate: null } };
  }

  const feedback = history.value.flatMap((row) => {
    const mapped = toOutcomeFeedback(row);
    return mapped ? [mapped] : [];
  });

  return {
    ok: true,
    value: {
      feedbackId: saved.value,
      estimate: estimateActionUsefulness(actionId, feedback, observedAt),
    },
  };
}
