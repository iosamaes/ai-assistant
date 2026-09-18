import type { PostgrestError } from '@supabase/supabase-js';

import type { DataFailureKind, DataResult } from './data-access';
import { supabase } from './client';

export type StoredLifeSeason = 'balanced' | 'build' | 'recovery' | 'parenting' | 'study' | 'travel';
export type StoredPrivacyMode = 'minimal' | 'balanced';

export type OnboardingContext = {
  life_season: StoredLifeSeason | null;
  self_values: string[];
  privacy_mode: StoredPrivacyMode | null;
};

function classifyContextError(error: PostgrestError): DataFailureKind {
  const message = error.message.toLowerCase();

  if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === 'PGRST303') {
    return 'session-expired';
  }
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

function failure<T>(error: PostgrestError): DataResult<T> {
  return { ok: false, error: { kind: classifyContextError(error), code: error.code } };
}

function unavailable<T>(): DataResult<T> {
  return { ok: false, error: { kind: 'not-configured' } };
}

export async function loadOnboardingContext(
  userId: string,
): Promise<DataResult<OnboardingContext | null>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('profiles')
    .select('life_season,self_values,privacy_mode')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return failure(error);
  return { ok: true, value: (data as OnboardingContext | null) ?? null };
}

export async function upsertOnboardingContext(
  userId: string,
  context: OnboardingContext,
): Promise<DataResult<OnboardingContext>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...context }, { onConflict: 'user_id' })
    .select('life_season,self_values,privacy_mode')
    .single();

  if (error) return failure(error);
  return { ok: true, value: data as OnboardingContext };
}
