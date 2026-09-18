import {
  summarizeTemporalMetric,
  summarizeValueAlignment,
  type Observation,
  type ValueAlignmentSignal,
  type ValueAlignmentSummary,
} from '@mizan/core';

import {
  loadRecentObservations,
  type DataResult,
  type StoredObservation,
} from '@/infrastructure/supabase/data-access';
import type { DomainId, PersonalValue } from '@/state/app-state';

type SignalRule = {
  key: string;
  metric: string;
  domainId: DomainId;
  higherIsBetter: boolean;
};

export interface PersonalValueAlignment extends ValueAlignmentSummary {
  valueId: PersonalValue;
}

const HISTORY_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

const rulesByValue: Readonly<Record<PersonalValue, readonly SignalRule[]>> = {
  stability: [
    { key: 'recovery', metric: 'recovery', domainId: 'recovery', higherIsBetter: true },
    { key: 'mental_load', metric: 'mental_load', domainId: 'work', higherIsBetter: false },
  ],
  family: [
    { key: 'connection', metric: 'connection', domainId: 'connection', higherIsBetter: true },
  ],
  // The current vertical slice has no direct self-report for learning/growth or meaning.
  // Keeping these values unknown is more honest than borrowing an unrelated productivity signal.
  growth: [],
  meaning: [],
};

function numericValue(row: StoredObservation): number | null {
  if (row.value_number === null || !Number.isFinite(row.value_number)) return null;
  if (row.value_number < 0 || row.value_number > 100) return null;
  return row.value_number;
}

function toCoreObservation(row: StoredObservation, domainId: DomainId): Observation {
  return {
    id: row.id,
    userId: row.user_id,
    dimensionId: domainId,
    metric: row.metric,
    value: numericValue(row),
    observedAt: row.observed_at,
    source: row.source === 'user' ? 'self_reported' : row.source === 'integration' ? 'observed' : 'inferred',
  };
}

export function buildPersonalValueAlignment(
  value: PersonalValue,
  enabledDomains: readonly DomainId[],
  rows: readonly StoredObservation[],
  generatedAt: string,
): PersonalValueAlignment {
  const signals: ValueAlignmentSignal[] = rulesByValue[value]
    .filter((rule) => enabledDomains.includes(rule.domainId))
    .map((rule) => {
      const observations = rows
        .filter((row) => row.metric === rule.metric && numericValue(row) !== null)
        .map((row) => toCoreObservation(row, rule.domainId));
      const temporal = summarizeTemporalMetric(observations, rule.metric, generatedAt, rule.higherIsBetter);
      return {
        key: rule.key,
        direction: temporal.momentum.direction,
        confidence: temporal.momentum.confidence,
        evidence: temporal.momentum.evidence,
      };
    });

  return summarizeValueAlignment(value, signals) as PersonalValueAlignment;
}

export async function loadPersonalValueAlignments(
  userId: string,
  values: readonly PersonalValue[],
  enabledDomains: readonly DomainId[],
  generatedAt = new Date().toISOString(),
): Promise<DataResult<PersonalValueAlignment[]>> {
  const generatedAtMs = Date.parse(generatedAt);
  if (!Number.isFinite(generatedAtMs)) return { ok: false, error: { kind: 'invalid' } };

  const since = new Date(generatedAtMs - HISTORY_WINDOW_MS).toISOString();
  const result = await loadRecentObservations(userId, since, 500);
  if (!result.ok) return result;

  return {
    ok: true,
    value: values.map((value) => buildPersonalValueAlignment(value, enabledDomains, result.value, generatedAt)),
  };
}
