import type { PostgrestError } from '@supabase/supabase-js';

import type { DataFailureKind, DataResult } from './data-access';
import { supabase } from './client';

export type InvisibleWinCategory =
  | 'rest'
  | 'boundary'
  | 'family'
  | 'repair'
  | 'disconnect'
  | 'health'
  | 'other';

export type StoredInvisibleWin = {
  id: string;
  user_id: string;
  category: InvisibleWinCategory;
  note: string;
  occurred_at: string;
  created_at: string;
};

export type InvisibleWinInput = {
  category: InvisibleWinCategory;
  note: string;
  occurred_at?: string;
  client_mutation_id?: string;
};

function classify(error: PostgrestError): DataFailureKind {
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

function failure(error: PostgrestError): DataResult<never> {
  return { ok: false, error: { kind: classify(error), code: error.code } };
}

export async function loadInvisibleWins(userId: string, limit = 20): Promise<DataResult<StoredInvisibleWin[]>> {
  if (!supabase) return { ok: false, error: { kind: 'not-configured' } };
  const { data, error } = await supabase
    .from('reflections')
    .select('id,user_id,category,note,occurred_at,created_at')
    .eq('user_id', userId)
    .eq('kind', 'invisible_win')
    .order('occurred_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 100)));
  if (error) return failure(error);
  return { ok: true, value: (data ?? []) as StoredInvisibleWin[] };
}

export async function insertInvisibleWin(userId: string, input: InvisibleWinInput): Promise<DataResult<StoredInvisibleWin>> {
  if (!supabase) return { ok: false, error: { kind: 'not-configured' } };
  const note = input.note.trim();
  const { data, error } = await supabase
    .from('reflections')
    .upsert(
      {
        user_id: userId,
        kind: 'invisible_win',
        category: input.category,
        note,
        occurred_at: input.occurred_at ?? new Date().toISOString(),
        client_mutation_id: input.client_mutation_id,
      },
      { onConflict: 'user_id,client_mutation_id' },
    )
    .select('id,user_id,category,note,occurred_at,created_at')
    .single();
  if (error) return failure(error);
  return { ok: true, value: data as StoredInvisibleWin };
}
