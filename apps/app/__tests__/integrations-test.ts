import {
  createHealthDataProvider,
  createLocationContextProvider,
  createTimeContextProvider,
} from '@/integrations/provider-registry';
import type { NormalizedExternalObservation } from '@/integrations/contracts';

const observations: NormalizedExternalObservation[] = [
  {
    metric: 'energy',
    value: 70,
    unit: 'score',
    observedAt: '2026-09-18T09:00:00.000Z',
    providerId: 'fixture-health',
    externalItemId: 'inside',
    dedupeKey: 'fixture:inside',
    evidenceQuality: 0.8,
  },
  {
    metric: 'recovery',
    value: 40,
    unit: 'score',
    observedAt: '2026-09-10T09:00:00.000Z',
    providerId: 'fixture-health',
    externalItemId: 'outside',
    dedupeKey: 'fixture:outside',
    evidenceQuality: 0.7,
  },
];

describe('unified integration provider boundaries', () => {
  test('deterministic health provider normalizes and filters the requested window', async () => {
    const provider = createHealthDataProvider('deterministic-health', observations);
    const result = await provider.readObservations({
      start: '2026-09-18T00:00:00.000Z',
      end: '2026-09-18T23:59:59.999Z',
    });

    expect(result).toEqual({ ok: true, value: [observations[0]] });
  });

  test('health provider rejects an invalid observation window', async () => {
    const provider = createHealthDataProvider('deterministic-health', observations);
    const result = await provider.readObservations({
      start: '2026-09-19T00:00:00.000Z',
      end: '2026-09-18T00:00:00.000Z',
    });

    expect(result).toEqual({ ok: false, error: { kind: 'invalid' } });
  });

  test('unconfigured capability paths degrade explicitly instead of faking success', async () => {
    await expect(createTimeContextProvider('unavailable').readWeeklyContext())
      .resolves.toEqual({ ok: false, error: { kind: 'not-configured' } });
    await expect(createLocationContextProvider('unavailable').readApproximateContext())
      .resolves.toEqual({ ok: false, error: { kind: 'not-configured' } });
  });

  test('provider selection remains centralized and swappable', async () => {
    const primary = await createTimeContextProvider('deterministic-primary').readWeeklyContext();
    const alternate = await createTimeContextProvider('deterministic-alternate').readWeeklyContext();

    expect(primary.ok).toBe(true);
    expect(alternate.ok).toBe(true);
    if (!primary.ok || !alternate.ok) return;
    expect(primary.value.availableMarginMinutesPerWeek).toBe(420);
    expect(alternate.value.availableMarginMinutesPerWeek).toBe(360);
  });
});
