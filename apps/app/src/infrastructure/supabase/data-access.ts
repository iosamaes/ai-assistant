import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from './client';

export type DataFailureKind =
  | 'not-configured'
  | 'session-expired'
  | 'unauthorized'
  | 'conflict'
  | 'invalid'
  | 'unavailable'
  | 'unknown';
export type DataResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { kind: DataFailureKind; code?: string } };

export type Profile = {
  user_id: string;
  locale: 'ar' | 'en';
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type DomainPreference = {
  user_id: string;
  domain_id: string;
  enabled: boolean;
  priority_weight: number;
  custom_label: string | null;
};
export type ObservationInput = {
  source: 'user' | 'integration' | 'inferred';
  metric: string;
  observed_at: string;
  value_number?: number;
  value_text?: string;
  value_boolean?: boolean;
  unit?: string | null;
};

export type ActionEventInput = {
  action_key: string;
  event_type: 'offered' | 'accepted' | 'deferred' | 'declined' | 'completed';
  context?: Record<string, unknown>;
  occurred_at?: string;
};

export type FeedbackOutcomeInput = {
  action_event_id: string;
  usefulness?: number;
  outcome_note?: string;
  observed_at?: string;
};

export type PluginSettingInput = {
  plugin_id: string;
  enabled: boolean;
  consented_at?: string | null;
  settings?: Record<string, unknown>;
};

function classifyPostgrestError(error: PostgrestError): DataFailureKind {
  const message = error.message.toLowerCase();

  if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === 'PGRST303') {
    return 'session-expired';
  }
  if (error.code === '42501') return 'unauthorized';
  if (error.code === '23505') return 'conflict';
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

function dataFailure(error: PostgrestError): DataResult<never> {
  return { ok: false, error: { kind: classifyPostgrestError(error), code: error.code } };
}

function unavailable<T>(): DataResult<T> {
  return { ok: false, error: { kind: 'not-configured' } };
}

export async function loadProfile(userId: string): Promise<DataResult<Profile | null>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) return dataFailure(error);
  return { ok: true, value: (data as Profile | null) ?? null };
}

export async function upsertProfile(
  userId: string,
  patch: Pick<Profile, 'locale' | 'timezone' | 'onboarding_completed'>,
): Promise<DataResult<Profile>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) return dataFailure(error);
  return { ok: true, value: data as Profile };
}

export async function loadDomainPreferences(userId: string): Promise<DataResult<DomainPreference[]>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase.from('domain_preferences').select('*').eq('user_id', userId);
  if (error) return dataFailure(error);
  return { ok: true, value: (data ?? []) as DomainPreference[] };
}

export async function upsertDomainPreferences(
  userId: string,
  preferences: readonly Omit<DomainPreference, 'user_id'>[],
): Promise<DataResult<DomainPreference[]>> {
  if (!supabase) return unavailable();
  const rows = preferences.map((preference) => ({ user_id: userId, ...preference }));
  const { data, error } = await supabase
    .from('domain_preferences')
    .upsert(rows, { onConflict: 'user_id,domain_id' })
    .select('*');
  if (error) return dataFailure(error);
  return { ok: true, value: (data ?? []) as DomainPreference[] };
}

export async function insertObservation(userId: string, input: ObservationInput): Promise<DataResult<string>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('observations')
    .insert({ user_id: userId, ...input })
    .select('id')
    .single();
  if (error) return dataFailure(error);
  return { ok: true, value: data.id as string };
}

export async function insertActionEvent(userId: string, input: ActionEventInput): Promise<DataResult<string>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('action_events')
    .insert({ user_id: userId, ...input })
    .select('id')
    .single();
  if (error) return dataFailure(error);
  return { ok: true, value: data.id as string };
}

export async function insertFeedbackOutcome(
  userId: string,
  input: FeedbackOutcomeInput,
): Promise<DataResult<string>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('feedback_outcomes')
    .insert({ user_id: userId, ...input })
    .select('id')
    .single();
  if (error) return dataFailure(error);
  return { ok: true, value: data.id as string };
}

export async function upsertPluginSetting(
  userId: string,
  input: PluginSettingInput,
): Promise<DataResult<null>> {
  if (!supabase) return unavailable();
  const { error } = await supabase
    .from('plugin_settings')
    .upsert({ user_id: userId, ...input }, { onConflict: 'user_id,plugin_id' });
  if (error) return dataFailure(error);
  return { ok: true, value: null };
}
