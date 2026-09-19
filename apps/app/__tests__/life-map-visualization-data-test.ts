import { buildLifeMapSnapshot } from '@/application/life-map';
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

describe('life map visualization data', () => {
  test('normalizes lower-is-better metrics before exposing positive radar signals', () => {
    const snapshot = buildLifeMapSnapshot(
      [
        row('energy-1', 'energy', 80, '2026-09-18T08:00:00.000Z'),
        row('recovery-1', 'recovery', 60, '2026-09-18T08:05:00.000Z'),
        row('load-1', 'mental_load', 80, '2026-09-18T08:10:00.000Z'),
      ],
      ['recovery', 'work'],
      '2026-09-19T08:00:00.000Z',
    );

    const recovery = snapshot?.domains.find((domain) => domain.domainId === 'recovery');
    const work = snapshot?.domains.find((domain) => domain.domainId === 'work');

    expect(recovery?.score).toBe(70);
    expect(work?.score).toBe(20);
    expect(work?.metrics[0]?.latestValue).toBe(80);
    expect(work?.metrics[0]?.latestScore).toBe(20);
  });

  test('keeps an enabled domain with no supported observation unknown instead of zero', () => {
    const snapshot = buildLifeMapSnapshot(
      [row('energy-1', 'energy', 75, '2026-09-18T08:00:00.000Z')],
      ['recovery', 'connection', 'margin'],
      '2026-09-19T08:00:00.000Z',
    );

    expect(snapshot?.domains.find((domain) => domain.domainId === 'connection')?.score).toBeNull();
    expect(snapshot?.domains.find((domain) => domain.domainId === 'margin')?.score).toBeNull();
    expect(snapshot?.domains.find((domain) => domain.domainId === 'recovery')?.score).toBe(75);
  });

  test('ignores future observations when deriving the current visual signal', () => {
    const snapshot = buildLifeMapSnapshot(
      [
        row('energy-current', 'energy', 55, '2026-09-18T08:00:00.000Z'),
        row('energy-future', 'energy', 95, '2026-09-20T08:00:00.000Z'),
      ],
      ['recovery'],
      '2026-09-19T08:00:00.000Z',
    );

    expect(snapshot?.domains[0]?.metrics[0]?.latestValue).toBe(55);
    expect(snapshot?.domains[0]?.score).toBe(55);
  });
});
