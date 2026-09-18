export type IntegrationCapability = 'time_context' | 'health_data' | 'location_context';
export type IntegrationLifecycleStatus = 'configured' | 'connected' | 'disabled' | 'error';
export type IntegrationFailureKind = 'not-configured' | 'permission-denied' | 'unavailable' | 'invalid' | 'unknown';

export type IntegrationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { kind: IntegrationFailureKind; code?: string } };

export interface IntegrationConnectionState {
  capability: IntegrationCapability;
  providerId: string;
  status: IntegrationLifecycleStatus;
  scopes: readonly string[];
  consentedAt: string | null;
  lastSyncedAt: string | null;
  lastErrorCode: string | null;
  disconnectedAt: string | null;
  metadata: Readonly<Record<string, unknown>>;
}

export interface ProviderIdentity<C extends IntegrationCapability> {
  readonly capability: C;
  readonly providerId: string;
  readonly requiredScopes: readonly string[];
}

export interface TimeContextSnapshot {
  observedAt: string;
  busyMinutesPerWeek: number | null;
  availableMarginMinutesPerWeek: number | null;
  evidenceQuality: number | null;
}

export interface TimeContextProvider extends ProviderIdentity<'time_context'> {
  readWeeklyContext(): Promise<IntegrationResult<TimeContextSnapshot>>;
}

export type NormalizedExternalObservationValue = number | string | boolean;

export interface NormalizedExternalObservation {
  metric: string;
  value: NormalizedExternalObservationValue;
  unit: string | null;
  observedAt: string;
  providerId: string;
  externalItemId: string | null;
  dedupeKey: string;
  evidenceQuality: number | null;
}

export interface ObservationWindow {
  start: string;
  end: string;
}

export interface HealthDataProvider extends ProviderIdentity<'health_data'> {
  readObservations(window: ObservationWindow): Promise<IntegrationResult<readonly NormalizedExternalObservation[]>>;
}

export interface LocationContext {
  observedAt: string;
  context: 'home' | 'work' | 'travel' | 'other' | 'unknown';
  evidenceQuality: number | null;
}

export interface LocationContextProvider extends ProviderIdentity<'location_context'> {
  readApproximateContext(): Promise<IntegrationResult<LocationContext>>;
}
