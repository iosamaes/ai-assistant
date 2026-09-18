import { describe, expect, it } from 'vitest';

import { assessHumanROI } from './human-roi';

const confidence = {
  level: 'known' as const,
  score: 0.86,
  evidenceCount: 3,
  freshnessDays: 0,
};

const evidence = [
  {
    id: 'benefit',
    source: 'self_reported' as const,
    observedAt: '2026-09-18T10:00:00Z',
    label: 'explicit_benefit_rating',
  },
  {
    id: 'effort',
    source: 'self_reported' as const,
    observedAt: '2026-09-18T10:00:00Z',
    label: 'explicit_effort_rating',
  },
  {
    id: 'time',
    source: 'self_reported' as const,
    observedAt: '2026-09-18T10:00:00Z',
    label: 'explicit_time_cost',
  },
];

describe('assessHumanROI', () => {
  it('keeps protected meaning outside quantitative comparison', () => {
    const result = assessHumanROI({
      benefitRating: 5,
      effortRating: 5,
      timeMinutesPerWeek: 600,
      protectedMeaning: true,
      confidence,
      evidence,
    });

    expect(result.status).toBe('protected');
    expect(result.reason).toBe('protected_meaning');
    expect(result.benefitRating).toBeNull();
    expect(result.effortRating).toBeNull();
    expect(result.timeMinutesPerWeek).toBeNull();
    expect(result.benefitEffortDelta).toBeNull();
  });

  it('stays insufficient until benefit, effort, and time are all explicit', () => {
    const result = assessHumanROI({
      benefitRating: 4,
      effortRating: 2,
      timeMinutesPerWeek: null,
      protectedMeaning: false,
      confidence,
      evidence: evidence.slice(0, 2),
    });

    expect(result.status).toBe('insufficient');
    expect(result.reason).toBe('missing_time');
    expect(result.confidence.level).toBe('insufficient');
    expect(result.benefitEffortDelta).toBeNull();
  });

  it('surfaces benefit-heavier explicit evidence without inventing a scalar ROI score', () => {
    const result = assessHumanROI({
      benefitRating: 5,
      effortRating: 2,
      timeMinutesPerWeek: 180,
      protectedMeaning: false,
      confidence,
      evidence,
    });

    expect(result.status).toBe('benefit_heavier');
    expect(result.reason).toBe('benefit_exceeds_effort');
    expect(result.benefitEffortDelta).toBe(3);
    expect(result.timeMinutesPerWeek).toBe(180);
  });

  it('keeps close benefit and effort readings mixed rather than forcing a verdict', () => {
    const result = assessHumanROI({
      benefitRating: 4,
      effortRating: 3,
      timeMinutesPerWeek: 120,
      protectedMeaning: false,
      confidence,
      evidence,
    });

    expect(result.status).toBe('mixed');
    expect(result.reason).toBe('benefit_and_effort_close');
    expect(result.benefitEffortDelta).toBe(1);
  });

  it('can surface cost-heavier explicit evidence without deciding whether the activity should be stopped', () => {
    const result = assessHumanROI({
      benefitRating: 2,
      effortRating: 5,
      timeMinutesPerWeek: 240,
      protectedMeaning: false,
      confidence,
      evidence,
    });

    expect(result.status).toBe('cost_heavier');
    expect(result.reason).toBe('effort_exceeds_benefit');
    expect(result.benefitEffortDelta).toBe(-3);
  });
});
