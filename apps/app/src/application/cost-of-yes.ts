import {
  assessCostOfYes,
  type CostOfYesAssessment,
  type EvidenceRef,
} from '@mizan/core';

import type { IntegrationResult, TimeContextProvider } from '@/integrations/contracts';

export interface ExplicitCostOfYesInput {
  commitmentHoursPerWeek: number | null;
  availableMarginHoursPerWeek: number | null;
  observedAt?: string;
}

const HOURS_PER_WEEK = 7 * 24;

function validHours(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= HOURS_PER_WEEK;
}

function hoursToMinutes(value: number | null): number | null {
  return validHours(value) ? Math.round(value * 60 * 10) / 10 : null;
}

export function assessExplicitCostOfYes(input: ExplicitCostOfYesInput): CostOfYesAssessment {
  const observedAt = input.observedAt ?? new Date().toISOString();
  const commitmentMinutesPerWeek = hoursToMinutes(input.commitmentHoursPerWeek);
  const availableMarginMinutesPerWeek = hoursToMinutes(input.availableMarginHoursPerWeek);
  const evidence: EvidenceRef[] = [];

  if (commitmentMinutesPerWeek !== null) {
    evidence.push({
      id: `cost-of-yes:commitment:${observedAt}`,
      source: 'self_reported',
      observedAt,
      label: 'explicit_commitment_time',
    });
  }

  if (availableMarginMinutesPerWeek !== null) {
    evidence.push({
      id: `cost-of-yes:margin:${observedAt}`,
      source: 'self_reported',
      observedAt,
      label: 'explicit_available_margin',
    });
  }

  const complete = commitmentMinutesPerWeek !== null && availableMarginMinutesPerWeek !== null;
  return assessCostOfYes({
    commitmentMinutesPerWeek,
    availableMarginMinutesPerWeek,
    source: 'self_reported',
    confidence: complete
      ? {
          level: 'known',
          score: 0.85,
          evidenceCount: evidence.length,
          freshnessDays: 0,
        }
      : {
          level: 'insufficient',
          score: 0,
          evidenceCount: evidence.length,
          freshnessDays: 0,
        },
    evidence,
  });
}

export async function assessCostOfYesWithTimeContext(
  commitmentHoursPerWeek: number | null,
  provider: TimeContextProvider,
  observedAt = new Date().toISOString(),
): Promise<IntegrationResult<CostOfYesAssessment>> {
  const commitmentMinutesPerWeek = hoursToMinutes(commitmentHoursPerWeek);
  const contextResult = await provider.readWeeklyContext();
  if (!contextResult.ok) return contextResult;

  const context = contextResult.value;
  const evidence: EvidenceRef[] = [];
  if (commitmentMinutesPerWeek !== null) {
    evidence.push({
      id: `cost-of-yes:commitment:${observedAt}`,
      source: 'self_reported',
      observedAt,
      label: 'explicit_commitment_time',
    });
  }
  if (context.availableMarginMinutesPerWeek !== null) {
    evidence.push({
      id: `cost-of-yes:${provider.providerId}:${context.observedAt}`,
      source: 'observed',
      observedAt: context.observedAt,
      label: 'provider_available_margin',
    });
  }

  const quality = context.evidenceQuality ?? 0;
  const complete = commitmentMinutesPerWeek !== null && context.availableMarginMinutesPerWeek !== null;
  return {
    ok: true,
    value: assessCostOfYes({
      commitmentMinutesPerWeek,
      availableMarginMinutesPerWeek: context.availableMarginMinutesPerWeek,
      source: 'calendar',
      confidence: {
        level: quality >= 0.75 ? 'known' : quality >= 0.5 ? 'likely' : quality >= 0.25 ? 'possible' : 'insufficient',
        score: complete ? quality : 0,
        evidenceCount: evidence.length,
        freshnessDays: 0,
      },
      evidence,
    }),
  };
}
