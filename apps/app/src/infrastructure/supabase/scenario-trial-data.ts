import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from './client';
import type { DataFailureKind, DataResult } from './data-access';

export type StoredScenarioTrialFeedback = {
  eventId: string;
  scenarioId: string;
  occurredAt: string;
  baseline: Record<string, number>;
  usefulness: number;
  feedbackObservedAt: string;
};

function classify(error: PostgrestError): DataFailureKind {
  const message = error.message.toLowerCase();
  if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === 'PGRST303') return 'session-expired';
  if (error.code === '42501') return 'unauthorized';
  if (error.code.startsWith('22') || error.code.startsWith('23')) return 'invalid';
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
  return { ok: false, error: { kind: classify(error), code: error.code } };
}

function parseBaseline(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => {
      const candidate = entry[1];
      return typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0 && candidate <= 100;
    }),
  );
}

export async function loadScenarioTrialFeedback(
  userId: string,
  scenarioId: string,
  since: string,
  limit = 50,
): Promise<DataResult<StoredScenarioTrialFeedback[]>> {
  if (!supabase) return { ok: false, error: { kind: 'not-configured' } };
  const boundedLimit = Math.max(1, Math.min(limit, 100));
  const { data: events, error: eventsError } = await supabase
    .from('action_events')
    .select('id,context,occurred_at')
    .eq('user_id', userId)
    .eq('context->>source', 'what_if_trial')
    .eq('context->>scenario_id', scenarioId)
    .in('event_type', ['accepted', 'completed'])
    .gte('occurred_at', since)
    .order('occurred_at', { ascending: false })
    .limit(boundedLimit);
  if (eventsError) return failure(eventsError);

  const eventRows = (events ?? []) as Array<{
    id: string;
    context: Record<string, unknown> | null;
    occurred_at: string;
  }>;
  if (eventRows.length === 0) return { ok: true, value: [] };

  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback_outcomes')
    .select('action_event_id,usefulness,observed_at')
    .eq('user_id', userId)
    .in('action_event_id', eventRows.map((event) => event.id))
    .not('usefulness', 'is', null)
    .order('observed_at', { ascending: false })
    .limit(boundedLimit);
  if (feedbackError) return failure(feedbackError);

  const eventById = new Map(eventRows.map((event) => [event.id, event]));
  return {
    ok: true,
    value: ((feedback ?? []) as Array<{
      action_event_id: string;
      usefulness: number | null;
      observed_at: string;
    }>).flatMap((row) => {
      const event = eventById.get(row.action_event_id);
      if (!event || row.usefulness === null) return [];
      const context = event.context ?? {};
      const storedScenarioId = typeof context.scenario_id === 'string' ? context.scenario_id : scenarioId;
      return [{
        eventId: event.id,
        scenarioId: storedScenarioId,
        occurredAt: event.occurred_at,
        baseline: parseBaseline(context.baseline),
        usefulness: row.usefulness,
        feedbackObservedAt: row.observed_at,
      }];
    }),
  };
}
