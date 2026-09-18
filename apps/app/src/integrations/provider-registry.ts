import {
  DeterministicHealthDataProvider,
  DeterministicLocationContextProvider,
  DeterministicTimeContextProvider,
  UnavailableHealthDataProvider,
  UnavailableLocationContextProvider,
  UnavailableTimeContextProvider,
} from './adapters';
import type {
  HealthDataProvider,
  LocationContextProvider,
  NormalizedExternalObservation,
  TimeContextProvider,
  TimeContextSnapshot,
} from './contracts';

export type TimeContextProviderId = 'unavailable' | 'deterministic-primary' | 'deterministic-alternate';
export type HealthDataProviderId = 'unavailable' | 'deterministic-health';
export type LocationContextProviderId = 'unavailable' | 'deterministic-location';

const primaryTimeSnapshot: TimeContextSnapshot = {
  observedAt: '2026-01-01T00:00:00.000Z',
  busyMinutesPerWeek: 2_400,
  availableMarginMinutesPerWeek: 420,
  evidenceQuality: 0.9,
};

const alternateTimeSnapshot: TimeContextSnapshot = {
  observedAt: '2026-01-01T00:00:00.000Z',
  busyMinutesPerWeek: 2_520,
  availableMarginMinutesPerWeek: 360,
  evidenceQuality: 0.8,
};

const timeContextFactories: Readonly<Record<TimeContextProviderId, () => TimeContextProvider>> = {
  unavailable: () => new UnavailableTimeContextProvider(),
  'deterministic-primary': () =>
    new DeterministicTimeContextProvider(primaryTimeSnapshot, 'deterministic-time-primary'),
  'deterministic-alternate': () =>
    new DeterministicTimeContextProvider(alternateTimeSnapshot, 'deterministic-time-alternate'),
};

export function createTimeContextProvider(providerId: TimeContextProviderId): TimeContextProvider {
  return timeContextFactories[providerId]();
}

export function createHealthDataProvider(
  providerId: HealthDataProviderId,
  observations: readonly NormalizedExternalObservation[] = [],
): HealthDataProvider {
  if (providerId === 'deterministic-health') {
    return new DeterministicHealthDataProvider(observations);
  }
  return new UnavailableHealthDataProvider();
}

export function createLocationContextProvider(
  providerId: LocationContextProviderId,
): LocationContextProvider {
  if (providerId === 'deterministic-location') {
    return new DeterministicLocationContextProvider({
      observedAt: '2026-01-01T00:00:00.000Z',
      context: 'unknown',
      evidenceQuality: null,
    });
  }
  return new UnavailableLocationContextProvider();
}
