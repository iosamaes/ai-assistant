import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from './client';
import type { DataFailureKind, DataResult } from './data-access';

export type PendingAcceptedAction = {
  actionEventId: string;
  actionId: string;
  acceptedAt: string;
};

function classifyQueryError(error: PostgrestError): DataFailureKind {
  const message = error.message.toLowerCase();
  if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === 'PGRST303') {
    return 'session-expired';
  }
  if (error.code === '42501') return 'unauthorized';
  if (
    error.code.startsWith('08') ||
    error.code === 'PGRST000' ||
    error.code === 'PGRST001' ||
    error.code === 'PGRST002' ||
    message.includes('failed to fetch') ||
    message.includes('network')
  ) {
    return 'unavailable';
  }
  return 'unknown';
}

function failure(error: PostgrestError): DataResult<never> {
  return { ok: false, error: { kind: classifyQueryError(error), code: error.code } };
}

export async function loadLatestPendingAcceptedAction(
  userId: string,
  since: string,
  limit = 50,
): Promise<DataResult<PendingAcceptedAction | null>> {
  if (!supabase) return { ok: false, error: { kind: 'not-configured' } };
  const boundedLimit = Math.max(1, Math.min(limit, 100));
  const { data: events, error: eventError } = await supabase
    .from('action_events')
    .select('id,action_key,occurred_at')
    .eq('user_id', userId)
    .eq('event_type', 'accepted')
    .gte('occurred_at', since)
    .order('occurred_at', { ascending: false })
    .limit(boundedLimit);
  if (eventError) return failure(eventError);

  const accepted = (events ?? []) as Array<{ id: string; action_key: string; occurred_at: string }>;
  if (accepted.length === 0) return { ok: true, value: null };

  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback_outcomes')
    .select('action_event_id')
    .eq('user_id', userId)
    .in('action_event_id', accepted.map((event) => event.id));
  if (feedbackError) return failure(feedbackError);

  const answered = new Set((feedback ?? []).map((row) => row.action_event_id as string));
  const pending = accepted.find((event) => !answered.has(event.id));
  return {
    ok: true,
    value: pending
      ? { actionEventId: pending.id, actionId: pending.action_key, acceptedAt: pending.occurred_at }
      : null,
  };
}
