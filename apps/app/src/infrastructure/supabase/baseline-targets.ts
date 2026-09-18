import type { PostgrestError } from '@supabase/supabase-js';

import type { DataResult } from './data-access';
import { supabase } from './client';

export type BaselineTargetRating = 1 | 2 | 3 | 4 | 5;
export type DomainBaselineTargets = Partial<Record<string, BaselineTargetRating>>;

function isBaselineTargetRating(value: unknown): value is BaselineTargetRating {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

function failure(error: PostgrestError): DataResult<never> {
  const message = error.message.toLowerCase();
  if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === 'PGRST303') {
    return { ok: false, error: { kind: 'session-expired', code: error.code } };
  }
  if (error.code === '42501') return { ok: false, error: { kind: 'unauthorized', code: error.code } };
  if (error.code.startsWith('22') || error.code.startsWith('23')) {
    return { ok: false, error: { kind: 'invalid', code: error.code } };
  }
  if (
    error.code.startsWith('08') ||
    error.code === 'PGRST000' ||
    error.code === 'PGRST001' ||
    error.code === 'PGRST002' ||
    message.includes('failed to fetch') ||
    message.includes('network')
  ) {
    return { ok: false, error: { kind: 'unavailable', code: error.code } };
  }
  return { ok: false, error: { kind: 'unknown', code: error.code } };
}

export async function loadDomainBaselineTargets(
  userId: string,
): Promise<DataResult<DomainBaselineTargets>> {
  if (!supabase) return { ok: false, error: { kind: 'not-configured' } };
  const { data, error } = await supabase
    .from('domain_preferences')
    .select('domain_id,baseline_target_rating')
    .eq('user_id', userId);
  if (error) return failure(error);

  const targets: DomainBaselineTargets = {};
  for (const row of (data ?? []) as Array<{ domain_id: string; baseline_target_rating: unknown }>) {
    if (isBaselineTargetRating(row.baseline_target_rating)) {
      targets[row.domain_id] = row.baseline_target_rating;
    }
  }
  return { ok: true, value: targets };
}

export async function saveDomainBaselineTargets(
  userId: string,
  enabledDomainIds: readonly string[],
  targets: DomainBaselineTargets,
): Promise<DataResult<null>> {
  if (!supabase) return { ok: false, error: { kind: 'not-configured' } };
  if (enabledDomainIds.length === 0) return { ok: true, value: null };

  const rows = enabledDomainIds.map((domainId) => ({
    user_id: userId,
    domain_id: domainId,
    baseline_target_rating: targets[domainId] ?? null,
  }));
  const { error } = await supabase
    .from('domain_preferences')
    .upsert(rows, { onConflict: 'user_id,domain_id' });
  if (error) return failure(error);
  return { ok: true, value: null };
}
