import type { DataResult } from '@/infrastructure/supabase/data-access';
import {
  loadDomainBaselineTargets,
  type DomainBaselineTargets,
} from '@/infrastructure/supabase/baseline-targets';
import {
  loadLifeSeasonHistory,
  setLifeSeasonWithTargets,
  type LifeSeasonHistoryEntry,
} from '@/infrastructure/supabase/life-seasons';
import type { StoredLifeSeason } from '@/infrastructure/supabase/onboarding-context';

export interface LifeSeasonsState {
  targets: DomainBaselineTargets;
  history: LifeSeasonHistoryEntry[];
}

export async function loadLifeSeasonsState(userId: string): Promise<DataResult<LifeSeasonsState>> {
  const [targetsResult, historyResult] = await Promise.all([
    loadDomainBaselineTargets(userId),
    loadLifeSeasonHistory(userId),
  ]);

  if (!targetsResult.ok) return targetsResult;
  if (!historyResult.ok) return historyResult;
  return {
    ok: true,
    value: {
      targets: targetsResult.value,
      history: historyResult.value,
    },
  };
}

export async function saveLifeSeason(
  season: StoredLifeSeason,
  targets: DomainBaselineTargets,
): Promise<DataResult<null>> {
  return setLifeSeasonWithTargets(season, targets);
}
