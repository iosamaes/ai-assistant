import type { PostgrestError } from '@supabase/supabase-js';

import type {
  BaselineTargetRating,
  DomainBaselineTargets,
} from './baseline-targets';
import type { DataFailureKind, DataResult } from './data-access';
import type { StoredLifeSeason } from './onboarding-context';
import { supabase } from './client';

export interface LifeSeasonHistoryEntry {
  id: string;
  user_id: string;
  season: StoredLifeSeason;
  target_snapshot: DomainBaselineTargets;
  started_at: string;
  ended_at: string | null;
}

function classifyError(error: PostgrestError): DataFailureKind {
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

function failure<T>(error: PostgrestError): DataResult<T> {
  return { ok: false, error: { kind: classifyError(error), code: error.code } };
}

function unavailable<T>(): DataResult<T> {
  return { ok: false, error: { kind: 'not-configured' } };
}

function isRating(value: unknown): value is BaselineTargetRating {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

function normalizeSnapshot(value: unknown): DomainBaselineTargets {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: DomainBaselineTargets = {};
  for (const [key, rating] of Object.entries(value as Record<string, unknown>)) {
    if (isRating(rating)) result[key] = rating;
  }
  return result;
}

export async function loadLifeSeasonHistory(
  userId: string,
  limit = 20,
): Promise<DataResult<LifeSeasonHistoryEntry[]>> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from('life_season_history')
    .select('id,user_id,season,target_snapshot,started_at,ended_at')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 50)));

  if (error) return failure(error);
  const rows = (data ?? []) as {
    id: string;
    user_id: string;
    season: StoredLifeSeason;
    target_snapshot: unknown;
    started_at: string;
    ended_at: string | null;
  }[];

  return {
    ok: true,
    value: rows.map((row) => ({
      ...row,
      target_snapshot: normalizeSnapshot(row.target_snapshot),
    })),
  };
}

export async function setLifeSeasonWithTargets(
  season: StoredLifeSeason,
  targets: DomainBaselineTargets,
): Promise<DataResult<null>> {
  if (!supabase) return unavailable();
  const targetSnapshot = Object.fromEntries(
    Object.entries(targets).filter((entry): entry is [string, BaselineTargetRating] => isRating(entry[1])),
  );
  const { error } = await supabase.rpc('set_life_season', {
    p_season: season,
    p_target_snapshot: targetSnapshot,
  });
  if (error) return failure(error);
  return { ok: true, value: null };
}
