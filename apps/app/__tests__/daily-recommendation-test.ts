import type { EvidenceRef, HumanStateComponent, HumanStateVector } from '@mizan/core';

import { prepareDailyRecommendation } from '@/application/daily-recommendation';

const observedAt = '2026-09-18T12:00:00.000Z';
const evidence: EvidenceRef[] = [
  { id: 'e1', source: 'self_reported', observedAt, label: 'recovery' },
  { id: 'e2', source: 'self_reported', observedAt, label: 'recovery' },
  { id: 'e3', source: 'self_reported', observedAt, label: 'recovery' },
];

function component(key: string, value: number, score: number): HumanStateComponent {
  return {
    key,
    value,
    confidence: {
      level: score >= 0.75 ? 'known' : score >= 0.5 ? 'likely' : score >= 0.25 ? 'possible' : 'insufficient',
      score,
      evidenceCount: evidence.length,
      freshnessDays: 0,
    },
    evidence,
    source: 'self_reported',
  };
}

function state(components: HumanStateComponent[]): HumanStateVector {
  return { generatedAt: observedAt, maturity: 'learning', components };
}

describe('daily recommendation application boundary', () => {
  test('selects the recovery action when recovery need is strong and supported', () => {
    const result = prepareDailyRecommendation(state([
      component('recovery', 15, 0.95),
      component('energy', 25, 0.9),
      component('connection', 80, 0.9),
      component('overload_risk', 20, 0.9),
    ]));

    expect(result).not.toBeNull();
    expect(result?.primary.actionId).toBe('protect-recovery-window');
    expect(result?.primary.reasonSignal).toMatch(/recovery|energy/);
    expect(result?.primary.contextId).toBeTruthy();
  });

  test('does not invent a move from weak evidence', () => {
    const result = prepareDailyRecommendation(state([
      component('recovery', 10, 0.2),
      component('energy', 10, 0.2),
      component('connection', 10, 0.2),
      component('overload_risk', 90, 0.2),
    ]));

    expect(result).toBeNull();
  });
});
