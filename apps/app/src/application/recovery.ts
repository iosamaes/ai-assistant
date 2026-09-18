import { deriveRecoveryPlan, type RecoveryPlan } from '@mizan/core';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import type { DataResult } from '@/infrastructure/supabase/data-access';

export async function loadRecoveryPlan(
  userId: string,
  generatedAt = new Date().toISOString(),
): Promise<DataResult<RecoveryPlan>> {
  const stateResult = await loadCurrentHumanState(userId, generatedAt);
  if (!stateResult.ok) return stateResult;
  return { ok: true, value: deriveRecoveryPlan(stateResult.value) };
}
