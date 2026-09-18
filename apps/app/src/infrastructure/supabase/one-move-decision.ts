import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from './client';
import type { DataFailureKind, DataResult } from './data-access';

export type PriorOneMoveDecision = {
  actionEventId: string;
  actionId: string;
  decision: 'accepted' | 'deferred' | 'declined';
  occurredAt: string;
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

export async function loadOneMoveDecisionForContext(
  userId: string,
  contextId: string,
): Promise<DataResult<PriorOneMoveDecision | null>> {
  if (!supabase) return { ok: false, error: { kind: 'not-configured' } };

  const { data, error } = await supabase
    .from('action_events')
    .select('id,action_key,event_type,occurred_at')
    .eq('user_id', userId)
    .in('event_type', ['accepted', 'deferred', 'declined'])
    .eq('context->>recommendation_context_id', contextId)
    .order('occurred_at', { ascending: false })
    .limit(1);
  if (error) return failure(error);

  const event = (data ?? [])[0] as
    | { id: string; action_key: string; event_type: PriorOneMoveDecision['decision']; occurred_at: string }
    | undefined;
  return {
    ok: true,
    value: event
      ? {
          actionEventId: event.id,
          actionId: event.action_key,
          decision: event.event_type,
          occurredAt: event.occurred_at,
        }
      : null,
  };
}
