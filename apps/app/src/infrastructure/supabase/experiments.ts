import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from './client';
import type { DataFailureKind, DataResult } from './data-access';

export type ExperimentStatus = 'planned' | 'active' | 'completed' | 'cancelled';
export type ExperimentDirection = 'higher' | 'lower';

export type StoredExperiment = {
  id: string;
  user_id: string;
  template_id: string | null;
  hypothesis: string;
  metric: string;
  expected_direction: ExperimentDirection;
  duration_days: number;
  status: ExperimentStatus;
  consented_at: string;
  started_at: string | null;
  ended_at: string | null;
  baseline_snapshot: Record<string, number>;
  created_at: string;
  updated_at: string;
};

export type CreateExperimentInput = {
  template_id?: string | null;
  hypothesis: string;
  metric: string;
  expected_direction: ExperimentDirection;
  duration_days: number;
  consented_at: string;
  status?: ExperimentStatus;
  started_at?: string | null;
  ended_at?: string | null;
  baseline_snapshot?: Record<string, number>;
};

function classify(error: PostgrestError): DataFailureKind {
  const message = error.message.toLowerCase();
  if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === 'PGRST303') return 'session-expired';
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

function failure(error: PostgrestError): DataResult<never> {
  return { ok: false, error: { kind: classify(error), code: error.code } };
}

function unavailable<T>(): DataResult<T> {
  return { ok: false, error: { kind: 'not-configured' } };
}

export async function createExperiment(
  userId: string,
  input: CreateExperimentInput,
): Promise<DataResult<StoredExperiment>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('experiments')
    .insert({ user_id: userId, ...input, baseline_snapshot: input.baseline_snapshot ?? {} })
    .select('*')
    .single();
  if (error) return failure(error);
  return { ok: true, value: data as StoredExperiment };
}

export async function loadRecentExperiments(
  userId: string,
  limit = 20,
): Promise<DataResult<StoredExperiment[]>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 50)));
  if (error) return failure(error);
  return { ok: true, value: (data ?? []) as StoredExperiment[] };
}

export async function updateExperimentLifecycle(
  userId: string,
  experimentId: string,
  patch: Partial<Pick<StoredExperiment, 'status' | 'started_at' | 'ended_at'>>,
): Promise<DataResult<StoredExperiment>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('experiments')
    .update(patch)
    .eq('user_id', userId)
    .eq('id', experimentId)
    .select('*')
    .single();
  if (error) return failure(error);
  return { ok: true, value: data as StoredExperiment };
}
