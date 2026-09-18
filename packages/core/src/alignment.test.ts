import { describe, expect, it } from 'vitest';

import { summarizeValueAlignment, type Confidence, type EvidenceRef } from './index';

function confidence(score: number, evidenceCount = 1): Confidence {
  return {
    level: score >= 0.75 ? 'known' : score >= 0.5 ? 'likely' : score >= 0.25 ? 'possible' : 'insufficient',
    score,
    evidenceCount,
    freshnessDays: 1,
  };
}

function evidence(id: string): EvidenceRef {
  return {
    id,
    source: 'self_reported',
    observedAt: '2026-09-18T00:00:00.000Z',
    label: id,
  };
}

describe('value alignment', () => {
  it('keeps a value unknown when no usable evidence exists', () => {
    const result = summarizeValueAlignment('meaning', []);

    expect(result.status).toBe('insufficient');
    expect(result.confidence.level).toBe('insufficient');
    expect(result.evidence).toEqual([]);
  });

  it('surfaces possible drift when a supported value signal is declining', () => {
    const result = summarizeValueAlignment('family', [
      {
        key: 'connection',
        direction: 'declining',
        confidence: confidence(0.6, 6),
        evidence: [evidence('connection-1')],
      },
    ]);

    expect(result.status).toBe('watch');
    expect(result.watchSignals).toEqual(['connection']);
    expect(result.confidence.level).toBe('likely');
  });

  it('reports steady support without turning it into a worth or morality score', () => {
    const result = summarizeValueAlignment('stability', [
      {
        key: 'recovery',
        direction: 'improving',
        confidence: confidence(0.7, 6),
        evidence: [evidence('recovery-1')],
      },
      {
        key: 'perceived_control',
        direction: 'stable',
        confidence: confidence(0.55, 6),
        evidence: [evidence('control-1')],
      },
    ]);

    expect(result.status).toBe('supported');
    expect(result.supportingSignals).toEqual(['recovery', 'perceived_control']);
    expect(result.confidence.score).toBe(0.55);
  });
});
