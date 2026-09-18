import {
  assessHumanROI,
  type EvidenceRef,
  type HumanROIAssessment,
} from '@mizan/core';

export interface ExplicitHumanROIInput {
  benefitRating: number | null;
  effortRating: number | null;
  timeHoursPerWeek: number | null;
  protectedMeaning: boolean;
  observedAt?: string;
}

const HOURS_PER_WEEK = 7 * 24;

function validRating(value: number | null): value is number {
  return value !== null && Number.isInteger(value) && value >= 1 && value <= 5;
}

function hoursToMinutes(value: number | null): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > HOURS_PER_WEEK) return null;
  return Math.round(value * 60 * 10) / 10;
}

export function assessExplicitHumanROI(input: ExplicitHumanROIInput): HumanROIAssessment {
  const observedAt = input.observedAt ?? new Date().toISOString();

  if (input.protectedMeaning) {
    const evidence: EvidenceRef[] = [{
      id: `human-roi:protected:${observedAt}`,
      source: 'self_reported',
      observedAt,
      label: 'explicit_protected_meaning',
    }];
    return assessHumanROI({
      benefitRating: null,
      effortRating: null,
      timeMinutesPerWeek: null,
      protectedMeaning: true,
      confidence: {
        level: 'known',
        score: 0.95,
        evidenceCount: evidence.length,
        freshnessDays: 0,
      },
      evidence,
    });
  }

  const benefitRating = validRating(input.benefitRating) ? input.benefitRating : null;
  const effortRating = validRating(input.effortRating) ? input.effortRating : null;
  const timeMinutesPerWeek = hoursToMinutes(input.timeHoursPerWeek);
  const evidence: EvidenceRef[] = [];

  if (benefitRating !== null) {
    evidence.push({
      id: `human-roi:benefit:${observedAt}`,
      source: 'self_reported',
      observedAt,
      label: 'explicit_benefit_rating',
    });
  }
  if (effortRating !== null) {
    evidence.push({
      id: `human-roi:effort:${observedAt}`,
      source: 'self_reported',
      observedAt,
      label: 'explicit_effort_rating',
    });
  }
  if (timeMinutesPerWeek !== null) {
    evidence.push({
      id: `human-roi:time:${observedAt}`,
      source: 'self_reported',
      observedAt,
      label: 'explicit_time_cost',
    });
  }

  const complete = benefitRating !== null && effortRating !== null && timeMinutesPerWeek !== null;
  return assessHumanROI({
    benefitRating,
    effortRating,
    timeMinutesPerWeek,
    protectedMeaning: false,
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
