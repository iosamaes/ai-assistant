import { describe, expect, it } from 'vitest';

import { calculateBalance } from './balance';
import type { Confidence, DimensionBalanceSignal, EvidenceRef, UserTargets } from './index';

function confidence(score: number): Confidence {
  return {
    level: score >= 0.75 ? 'known' : score >= 0.5 ? 'likely' : score >= 0.25 ? 'possible' : 'insufficient',
    score,
    evidenceCount: 1,
    freshnessDays: 0,
  };
}

function evidence(id: string, dimensionId: string): EvidenceRef {
  return {
    id,
    source: 'self_reported',
    observedAt: '2026-09-17T12:00:00.000Z',
    label: `${dimensionId}:allocation`,
  };
}

function signal(
  dimensionId: string,
  currentWeight: number | null,
  confidenceScore = 0.8,
): DimensionBalanceSignal {
  return {
    dimensionId,
    currentWeight,
    confidence: confidence(confidenceScore),
    evidence: currentWeight === null ? [] : [evidence(`e-${dimensionId}`, dimensionId)],
  };
}

function targets(seasonId: string, work: number, recovery: number): UserTargets {
  return {
    seasonId,
    dimensionWeights: { work, recovery },
  };
}

describe('season-relative balance', () => {
  it('scores against the user season target rather than an equal split', () => {
    const signals = [signal('work', 80), signal('recovery', 20)];

    const buildingSeason = calculateBalance(signals, targets('building', 80, 20));
    const recoverySeason = calculateBalance(signals, targets('recovery', 30, 70));

    expect(buildingSeason.score).toBe(100);
    expect(buildingSeason.distanceFromTarget).toBe(0);
    expect(recoverySeason.score).toBe(50);
    expect(recoverySeason.distanceFromTarget).toBe(50);
  });

  it('keeps missing target-dimension data unknown instead of converting it to zero', () => {
    const summary = calculateBalance(
      [signal('work', 80), signal('recovery', null)],
      targets('building', 70, 30),
    );

    expect(summary.score).toBeNull();
    expect(summary.distanceFromTarget).toBeNull();
    expect(summary.missingDimensionIds).toEqual(['recovery']);
    expect(summary.dimensions.find((item) => item.dimensionId === 'recovery')?.currentShare).toBeNull();
  });

  it('treats an explicit zero allocation as evidence rather than as missing data', () => {
    const summary = calculateBalance(
      [signal('work', 100), signal('recovery', 0)],
      targets('building', 50, 50),
    );

    expect(summary.score).toBe(50);
    expect(summary.missingDimensionIds).toEqual([]);
    expect(summary.dimensions.find((item) => item.dimensionId === 'recovery')?.currentShare).toBe(0);
  });

  it('lowers confidence when a high-priority target dimension has weak evidence', () => {
    const summary = calculateBalance(
      [signal('work', 40, 0.9), signal('recovery', 60, 0.2)],
      targets('recovery', 20, 80),
    );

    expect(summary.score).not.toBeNull();
    expect(summary.confidence.score).toBe(0.34);
    expect(summary.confidence.level).toBe('possible');
  });
});
