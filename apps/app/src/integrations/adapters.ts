import type {
  HealthDataProvider,
  IntegrationResult,
  LocationContext,
  LocationContextProvider,
  NormalizedExternalObservation,
  ObservationWindow,
  TimeContextProvider,
  TimeContextSnapshot,
} from './contracts';

export class UnavailableTimeContextProvider implements TimeContextProvider {
  readonly capability = 'time_context' as const;
  readonly providerId = 'unavailable-time-context';
  readonly requiredScopes: readonly string[] = [];

  async readWeeklyContext(): Promise<IntegrationResult<TimeContextSnapshot>> {
    return { ok: false, error: { kind: 'not-configured' } };
  }
}

export class DeterministicTimeContextProvider implements TimeContextProvider {
  readonly capability = 'time_context' as const;
  readonly providerId: string;
  readonly requiredScopes = ['read_busy_time'] as const;

  constructor(
    private readonly snapshot: TimeContextSnapshot,
    providerId = 'deterministic-time-context',
  ) {
    this.providerId = providerId;
  }

  async readWeeklyContext(): Promise<IntegrationResult<TimeContextSnapshot>> {
    return { ok: true, value: { ...this.snapshot } };
  }
}

export class UnavailableHealthDataProvider implements HealthDataProvider {
  readonly capability = 'health_data' as const;
  readonly providerId = 'unavailable-health-data';
  readonly requiredScopes: readonly string[] = [];

  async readObservations(
    _window: ObservationWindow,
  ): Promise<IntegrationResult<readonly NormalizedExternalObservation[]>> {
    return { ok: false, error: { kind: 'not-configured' } };
  }
}

export class DeterministicHealthDataProvider implements HealthDataProvider {
  readonly capability = 'health_data' as const;
  readonly providerId: string;
  readonly requiredScopes = ['read_activity', 'read_recovery'] as const;

  constructor(
    private readonly observations: readonly NormalizedExternalObservation[],
    providerId = 'deterministic-health-data',
  ) {
    this.providerId = providerId;
  }

  async readObservations(
    window: ObservationWindow,
  ): Promise<IntegrationResult<readonly NormalizedExternalObservation[]>> {
    const start = Date.parse(window.start);
    const end = Date.parse(window.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      return { ok: false, error: { kind: 'invalid' } };
    }
    return {
      ok: true,
      value: this.observations.filter((observation) => {
        const observedAt = Date.parse(observation.observedAt);
        return Number.isFinite(observedAt) && observedAt >= start && observedAt <= end;
      }),
    };
  }
}

export class UnavailableLocationContextProvider implements LocationContextProvider {
  readonly capability = 'location_context' as const;
  readonly providerId = 'unavailable-location-context';
  readonly requiredScopes: readonly string[] = [];

  async readApproximateContext(): Promise<IntegrationResult<LocationContext>> {
    return { ok: false, error: { kind: 'not-configured' } };
  }
}

export class DeterministicLocationContextProvider implements LocationContextProvider {
  readonly capability = 'location_context' as const;
  readonly providerId: string;
  readonly requiredScopes = ['read_approximate_context'] as const;

  constructor(
    private readonly context: LocationContext,
    providerId = 'deterministic-location-context',
  ) {
    this.providerId = providerId;
  }

  async readApproximateContext(): Promise<IntegrationResult<LocationContext>> {
    return { ok: true, value: { ...this.context } };
  }
}
