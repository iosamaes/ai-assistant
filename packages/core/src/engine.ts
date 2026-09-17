import type {
  Confidence,
  EvidenceRef,
  EvidenceSource,
  HumanStateComponent,
  HumanStateVector,
  Observation,
} from './types';

export type HumanStateKey =
  | 'energy'
  | 'recovery'
  | 'mental_load'
  | 'clarity'
  | 'connection'
  | 'grounding'
  | 'perceived_control'
  | 'resilience'
  | 'overload_risk';

export type PersonalizationMaturity = 'cold_start' | 'learning' | 'personalized';

export interface PersonalBaseline {
  metric: string;
  median: number | null;
  lowerQuartile: number | null;
  upperQuartile: number | null;
  maturity: PersonalizationMaturity;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export const ENGINE_CONFIG = Object.freeze({
  currentStateWindowDays: 7,
  baselineWindowDays: 90,
  baselineLearningSamples: 3,
  baselinePersonalizedSamples: 7,
  confidenceKnownThreshold: 0.75,
  confidenceLikelyThreshold: 0.5,
  confidencePossibleThreshold: 0.25,
  freshnessLikelyDays: 7,
  freshnessPossibleDays: 28,
});

const HUMAN_STATE_KEYS: readonly HumanStateKey[] = [
  'energy',
  'recovery',
  'mental_load',
  'clarity',
  'connection',
  'grounding',
  'perceived_control',
  'resilience',
  'overload_risk',
];

const DAY_MS = 86_400_000;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseTimestamp(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function freshnessDays(observedAt: string, now: string): number | null {
  const observed = parseTimestamp(observedAt);
  const current = parseTimestamp(now);
  if (observed === null || current === null) return null;
  return Math.max(0, (current - observed) / DAY_MS);
}

function sourceWeight(source: EvidenceSource): number {
  if (source === 'observed' || source === 'self_reported') return 1;
  return 0.65;
}

function confidenceLevel(score: number): Confidence['level'] {
  if (score >= ENGINE_CONFIG.confidenceKnownThreshold) return 'known';
  if (score >= ENGINE_CONFIG.confidenceLikelyThreshold) return 'likely';
  if (score >= ENGINE_CONFIG.confidencePossibleThreshold) return 'possible';
  return 'insufficient';
}

export function calculateConfidence(
  evidence: readonly EvidenceRef[],
  now: string,
  targetEvidenceCount: number,
): Confidence {
  if (evidence.length === 0) {
    return { level: 'insufficient', score: 0, evidenceCount: 0, freshnessDays: null };
  }

  const freshnessValues = evidence
    .map((item) => freshnessDays(item.observedAt, now))
    .filter((value): value is number => value !== null);
  const freshest = freshnessValues.length > 0 ? Math.min(...freshnessValues) : null;
  const freshnessFactor =
    freshest === null
      ? 0.35
      : freshest <= 1
        ? 1
        : freshest <= ENGINE_CONFIG.freshnessLikelyDays
          ? 0.8
          : freshest <= ENGINE_CONFIG.freshnessPossibleDays
            ? 0.5
            : 0.2;
  const sampleFactor = clamp01(evidence.length / Math.max(1, targetEvidenceCount));
  const directness =
    evidence.reduce((total, item) => total + sourceWeight(item.source), 0) / evidence.length;
  const score = round(clamp01(sampleFactor * freshnessFactor * directness));

  return {
    level: confidenceLevel(score),
    score,
    evidenceCount: evidence.length,
    freshnessDays: freshest === null ? null : round(freshest, 2),
  };
}

function evidenceFromObservation(observation: Observation): EvidenceRef {
  return {
    id: observation.id,
    source: observation.source,
    observedAt: observation.observedAt,
    label: `${observation.dimensionId}:${observation.metric}`,
  };
}

function numericObservationValue(observation: Observation): number | null {
  if (typeof observation.value !== 'number' || !Number.isFinite(observation.value)) return null;
  if (observation.value < 0 || observation.value > 100) return null;
  return observation.value;
}

function recentNumericObservations(
  observations: readonly Observation[],
  metric: string,
  now: string,
  windowDays: number,
): Observation[] {
  const nowMs = parseTimestamp(now);
  if (nowMs === null) return [];
  const lowerBound = nowMs - windowDays * DAY_MS;

  return observations
    .filter((observation) => observation.metric === metric)
    .filter((observation) => numericObservationValue(observation) !== null)
    .filter((observation) => {
      const timestamp = parseTimestamp(observation.observedAt);
      return timestamp !== null && timestamp >= lowerBound && timestamp <= nowMs;
    })
    .sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt));
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  const current = ordered[middle];
  if (current === undefined) return null;
  if (ordered.length % 2 === 1) return current;
  const previous = ordered[middle - 1];
  return previous === undefined ? current : (previous + current) / 2;
}

function quantile(values: readonly number[], probability: number): number | null {
  if (values.length === 0) return null;
  const ordered = [...values].sort((a, b) => a - b);
  if (ordered.length === 1) return ordered[0] ?? null;
  const index = (ordered.length - 1) * clamp01(probability);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const lower = ordered[lowerIndex];
  const upper = ordered[upperIndex];
  if (lower === undefined || upper === undefined) return null;
  if (lowerIndex === upperIndex) return lower;
  return lower + (upper - lower) * (index - lowerIndex);
}

function maturityForEvidenceCount(count: number): PersonalizationMaturity {
  if (count < ENGINE_CONFIG.baselineLearningSamples) return 'cold_start';
  if (count < ENGINE_CONFIG.baselinePersonalizedSamples) return 'learning';
  return 'personalized';
}

export function derivePersonalBaseline(
  observations: readonly Observation[],
  metric: string,
  now: string,
): PersonalBaseline {
  const relevant = recentNumericObservations(
    observations,
    metric,
    now,
    ENGINE_CONFIG.baselineWindowDays,
  );
  const evidence = relevant.map(evidenceFromObservation);
  const values = relevant
    .map(numericObservationValue)
    .filter((value): value is number => value !== null);

  return {
    metric,
    median: median(values),
    lowerQuartile: quantile(values, 0.25),
    upperQuartile: quantile(values, 0.75),
    maturity: maturityForEvidenceCount(values.length),
    confidence: calculateConfidence(evidence, now, ENGINE_CONFIG.baselinePersonalizedSamples),
    evidence,
  };
}

function directStateComponent(
  key: HumanStateKey,
  observations: readonly Observation[],
  now: string,
): HumanStateComponent {
  const relevant = recentNumericObservations(
    observations,
    key,
    now,
    ENGINE_CONFIG.currentStateWindowDays,
  ).slice(0, 3);
  const evidence = relevant.map(evidenceFromObservation);
  const values = relevant
    .map(numericObservationValue)
    .filter((value): value is number => value !== null);
  const value = median(values);

  if (value === null) {
    return {
      key,
      value: null,
      confidence: calculateConfidence([], now, 3),
      evidence: [],
      source: 'unknown',
    };
  }

  const sources = new Set(relevant.map((item) => item.source));
  const source: EvidenceSource = sources.size === 1 ? relevant[0]?.source ?? 'inferred' : 'inferred';

  return {
    key,
    value: round(clamp100(value), 1),
    confidence: calculateConfidence(evidence, now, 3),
    evidence,
    source,
  };
}

function inferOverloadRisk(
  components: ReadonlyMap<string, HumanStateComponent>,
  now: string,
): HumanStateComponent | null {
  const energy = components.get('energy');
  const mentalLoad = components.get('mental_load');
  if (energy?.value === null || energy?.value === undefined) return null;
  if (mentalLoad?.value === null || mentalLoad?.value === undefined) return null;

  const evidence = [...energy.evidence, ...mentalLoad.evidence];
  const baseConfidence = calculateConfidence(evidence, now, 4);
  const adjustedScore = round(baseConfidence.score * 0.75);

  return {
    key: 'overload_risk',
    value: round(clamp100(mentalLoad.value * 0.6 + (100 - energy.value) * 0.4), 1),
    confidence: {
      ...baseConfidence,
      score: adjustedScore,
      level: confidenceLevel(adjustedScore),
    },
    evidence,
    source: 'inferred',
  };
}

export function deriveHumanStateVector(
  observations: readonly Observation[],
  generatedAt: string,
): HumanStateVector {
  const direct = HUMAN_STATE_KEYS.map((key) => directStateComponent(key, observations, generatedAt));
  const byKey = new Map(direct.map((component) => [component.key, component]));
  const inferredOverload = inferOverloadRisk(byKey, generatedAt);
  if (inferredOverload !== null && byKey.get('overload_risk')?.value === null) {
    byKey.set('overload_risk', inferredOverload);
  }

  const evidenceCount = observations.filter(
    (observation) => numericObservationValue(observation) !== null,
  ).length;

  return {
    generatedAt,
    maturity: maturityForEvidenceCount(evidenceCount),
    components: HUMAN_STATE_KEYS.map((key) => byKey.get(key) ?? directStateComponent(key, [], generatedAt)),
  };
}
