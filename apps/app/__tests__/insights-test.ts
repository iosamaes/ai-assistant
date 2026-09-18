import { buildInsightsSnapshot, pairMetricObservations } from '@/application/insights';
import type { StoredObservation } from '@/infrastructure/supabase/data-access';

function row(id: string, metric: string, value: number, observedAt: string): StoredObservation {
  return {
    id,
    user_id: 'user-1',
    source: 'user',
    metric,
    value_number: value,
    value_text: null,
    value_boolean: null,
    unit: 'score',
    observed_at: observedAt,
  };
}

const rows: StoredObservation[] = [
  row('r1', 'recovery', 25, '2026-09-15T08:00:00.000Z'),
  row('e1', 'energy', 30, '2026-09-15T08:30:00.000Z'),
  row('r2', 'recovery', 40, '2026-09-16T08:00:00.000Z'),
  row('e2', 'energy', 45, '2026-09-16T08:20:00.000Z'),
  row('r3', 'recovery', 55, '2026-09-17T08:00:00.000Z'),
  row('e3', 'energy', 60, '2026-09-17T08:10:00.000Z'),
  row('r4', 'recovery', 70, '2026-09-18T08:00:00.000Z'),
  row('e4', 'energy', 75, '2026-09-18T08:05:00.000Z'),
];

describe('personal insight pairing', () => {
  test('pairs nearby observations one-to-one without reusing targets', () => {
    const pairs = pairMetricObservations(
      rows,
      'recovery',
      'energy',
      '2026-09-18T12:00:00.000Z',
    );

    expect(pairs).toHaveLength(4);
    expect(new Set(pairs.map((pair) => pair.id.split(':')[1])).size).toBe(4);
    expect(pairs[0]?.evidence).toHaveLength(2);
  });

  test('builds an evidence-backed recovery/energy hypothesis from repeated pairs', () => {
    const snapshot = buildInsightsSnapshot(rows, '2026-09-18T12:00:00.000Z');

    expect(snapshot).not.toBeNull();
    expect(snapshot?.minimumPairs).toBe(3);
    expect(snapshot?.insights.some((insight) => insight.key === 'recovery_energy')).toBe(true);
  });

  test('rejects an invalid generation timestamp instead of fabricating insight timing', () => {
    expect(buildInsightsSnapshot(rows, 'not-a-date')).toBeNull();
  });
});
