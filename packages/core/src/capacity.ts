import type { Confidence, EvidenceRef } from './types';

export type LifeDebtDirection = 'accumulating' | 'stable' | 'recovering' | 'unknown';
export type LifeDebtUrgency = 'low' | 'moderate' | 'high' | 'unknown';
export type BufferBand = 'low' | 'moderate' | 'strong' | 'unknown';
export type InteractionRiskStatus = 'insufficient' | 'none' | 'hypothesis' | 'elevated';

export const CAPACITY_CONFIG = Object.freeze({
  // Debt changes slowly on purpose: a single difficult day should not dominate the model.
  debtAccrualRatePerDay: 0.04,
  debtRecoveryRatePerDay: 0.06,
  maxDebtElapsedDays: 14,
  debtDirectionEpsilon: 0.1,
  // Buffer rewards average spare capacity but gives meaningful weight to the weakest margin.
  bufferAverageWeight: 0.7,
  bufferWeakestWeight: 0.3,
  bufferMinimumComparableSignals: 2,
  bufferMinimumCoverage: 0.5,
  // Interaction risk is only promoted above hypothesis when evidence confidence is at least likely.
  interactionElevatedConfidence: 0.5,
  interactionMinimumFactorSeverity: 55,
});

export interface LifeDebtInput {
  dimensionId: string;
  targetNeed: number | null;
  metNeed: number | null;
  priorAmount: number | null;
  elapsedDays: number;
  urgency: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface LifeDebtResult {
  dimensionId: string;
  amount: number | null;
  direction: LifeDebtDirection;
  velocityPerDay: number | null;
  urgency: LifeDebtUrgency;
  urgencyScore: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
  history: 'snapshot' | 'tracked' | 'unknown';
}

export interface CapacitySignal {
  key: string;
  capacity: number | null;
  load: number | null;
  weight: number;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface BufferComponent {
  key: string;
  margin: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface LifeBufferSummary {
  score: number | null;
  fragility: number | null;
  band: BufferBand;
  confidence: Confidence;
  components: readonly BufferComponent[];
  missingKeys: readonly string[];
  evidence: readonly EvidenceRef[];
}

export interface InteractionFactorSignal {
  key: string;
  severity: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
}

export interface InteractionRule {
  id: string;
  label: string;
  factorKeys: readonly string[];
  minSeverity: number;
  weight: number;
}

export interface InteractionRiskFinding {
  ruleId: string;
  status: InteractionRiskStatus;
  score: number | null;
  confidence: Confidence;
  factorKeys: readonly string[];
  evidence: readonly EvidenceRef[];
  rationale: string;
}

export interface InteractionRiskSummary {
  status: InteractionRiskStatus;
  score: number | null;
  confidence: Confidence;
  findings: readonly InteractionRiskFinding[];
  evidence: readonly EvidenceRef[];
}

export const DEFAULT_INTERACTION_RULES: readonly InteractionRule[] = [
  {
    id: 'recovery-load-margin',
    label: 'Low recovery margin combined with workload and low spare capacity',
    factorKeys: ['recovery_deficit', 'workload_pressure', 'margin_deficit'],
    minSeverity: CAPACITY_CONFIG.interactionMinimumFactorSeverity,
    weight: 1,
  },
];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function validPercent(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

function validWeight(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function confidenceLevel(score: number): Confidence['level'] {
  if (score >= 0.75) return 'known';
  if (score >= 0.5) return 'likely';
  if (score >= 0.25) return 'possible';
  return 'insufficient';
}

function withConfidenceScore(
  base: Confidence,
  score: number,
  evidenceCount: number,
): Confidence {
  const bounded = round(clamp01(score), 3);
  return {
    ...base,
    level: confidenceLevel(bounded),
    score: bounded,
    evidenceCount,
  };
}

function uniqueEvidence(items: readonly EvidenceRef[]): EvidenceRef[] {
  const byKey = new Map<string, EvidenceRef>();
  for (const item of items) {
    const key = `${item.id}|${item.observedAt}|${item.label}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }
  return [...byKey.values()].sort((left, right) => {
    const timeOrder = Date.parse(left.observedAt) - Date.parse(right.observedAt);
    return timeOrder !== 0 ? timeOrder : left.id.localeCompare(right.id);
  });
}

function urgencyBand(score: number | null): LifeDebtUrgency {
  if (score === null) return 'unknown';
  if (score >= 67) return 'high';
  if (score >= 34) return 'moderate';
  return 'low';
}

export function calculateLifeDebt(input: LifeDebtInput): LifeDebtResult {
  const evidence = uniqueEvidence(input.evidence);
  if (!validPercent(input.targetNeed) || !validPercent(input.metNeed)) {
    return {
      dimensionId: input.dimensionId,
      amount: null,
      direction: 'unknown',
      velocityPerDay: null,
      urgency: 'unknown',
      urgencyScore: null,
      confidence: withConfidenceScore(input.confidence, 0, evidence.length),
      evidence,
      history: 'unknown',
    };
  }

  const currentDeficit = clamp100(input.targetNeed - input.metNeed);
  const explicitUrgency = validPercent(input.urgency) ? input.urgency : null;

  if (!validPercent(input.priorAmount)) {
    const urgencyScore = round(
      explicitUrgency === null ? currentDeficit : currentDeficit * 0.7 + explicitUrgency * 0.3,
      1,
    );
    const snapshotConfidencePenalty = explicitUrgency === null ? 0.6 : 0.7;
    return {
      dimensionId: input.dimensionId,
      amount: round(currentDeficit, 1),
      direction: 'unknown',
      velocityPerDay: null,
      urgency: urgencyBand(urgencyScore),
      urgencyScore,
      confidence: withConfidenceScore(
        input.confidence,
        input.confidence.score * snapshotConfidencePenalty,
        evidence.length,
      ),
      evidence,
      history: 'snapshot',
    };
  }

  const elapsedDays =
    Number.isFinite(input.elapsedDays) && input.elapsedDays > 0
      ? Math.min(input.elapsedDays, CAPACITY_CONFIG.maxDebtElapsedDays)
      : 0;

  if (elapsedDays === 0) {
    const urgencyScore = round(
      explicitUrgency === null
        ? input.priorAmount
        : input.priorAmount * 0.7 + explicitUrgency * 0.3,
      1,
    );
    return {
      dimensionId: input.dimensionId,
      amount: round(input.priorAmount, 1),
      direction: 'stable',
      velocityPerDay: 0,
      urgency: urgencyBand(urgencyScore),
      urgencyScore,
      confidence: withConfidenceScore(input.confidence, input.confidence.score, evidence.length),
      evidence,
      history: 'tracked',
    };
  }

  const needGap = input.targetNeed - input.metNeed;
  const delta =
    needGap >= 0
      ? needGap * CAPACITY_CONFIG.debtAccrualRatePerDay * elapsedDays
      : needGap * CAPACITY_CONFIG.debtRecoveryRatePerDay * elapsedDays;
  const amount = round(clamp100(input.priorAmount + delta), 1);
  const actualDelta = amount - input.priorAmount;
  const velocityPerDay = round(actualDelta / elapsedDays, 2);
  const direction: LifeDebtDirection =
    actualDelta > CAPACITY_CONFIG.debtDirectionEpsilon
      ? 'accumulating'
      : actualDelta < -CAPACITY_CONFIG.debtDirectionEpsilon
        ? 'recovering'
        : 'stable';
  const urgencyScore = round(
    explicitUrgency === null ? amount : amount * 0.7 + explicitUrgency * 0.3,
    1,
  );
  const urgencyPenalty = explicitUrgency === null ? 0.9 : 1;

  return {
    dimensionId: input.dimensionId,
    amount,
    direction,
    velocityPerDay,
    urgency: urgencyBand(urgencyScore),
    urgencyScore,
    confidence: withConfidenceScore(
      input.confidence,
      input.confidence.score * urgencyPenalty,
      evidence.length,
    ),
    evidence,
    history: 'tracked',
  };
}

export function calculateLifeBuffer(signals: readonly CapacitySignal[]): LifeBufferSummary {
  const weightedSignals = signals.filter((signal) => validWeight(signal.weight));
  const totalWeight = weightedSignals.reduce((total, signal) => total + signal.weight, 0);
  const comparable = weightedSignals.filter(
    (signal) => validPercent(signal.capacity) && validPercent(signal.load),
  );
  const coveredWeight = comparable.reduce((total, signal) => total + signal.weight, 0);
  const coverage = totalWeight > 0 ? coveredWeight / totalWeight : 0;
  const evidence = uniqueEvidence(comparable.flatMap((signal) => signal.evidence));
  const missingKeys = weightedSignals
    .filter((signal) => !validPercent(signal.capacity) || !validPercent(signal.load))
    .map((signal) => signal.key)
    .sort();

  const components: BufferComponent[] = weightedSignals.map((signal) => ({
    key: signal.key,
    margin:
      validPercent(signal.capacity) && validPercent(signal.load)
        ? round(clamp100(signal.capacity - signal.load), 1)
        : null,
    confidence: signal.confidence,
    evidence: signal.evidence,
  }));

  const weightedConfidence =
    coveredWeight > 0
      ? comparable.reduce(
          (total, signal) => total + signal.weight * clamp01(signal.confidence.score),
          0,
        ) / coveredWeight
      : 0;
  const confidence = withConfidenceScore(
    comparable[0]?.confidence ?? {
      level: 'insufficient',
      score: 0,
      evidenceCount: 0,
      freshnessDays: null,
    },
    weightedConfidence * coverage,
    evidence.length,
  );

  const canSummarize =
    comparable.length >= CAPACITY_CONFIG.bufferMinimumComparableSignals &&
    coverage >= CAPACITY_CONFIG.bufferMinimumCoverage &&
    coveredWeight > 0;

  if (!canSummarize) {
    return {
      score: null,
      fragility: null,
      band: 'unknown',
      confidence,
      components,
      missingKeys,
      evidence,
    };
  }

  const margins = comparable.map((signal) =>
    clamp100((signal.capacity as number) - (signal.load as number)),
  );
  const weightedAverage =
    comparable.reduce(
      (total, signal) =>
        total + signal.weight * clamp100((signal.capacity as number) - (signal.load as number)),
      0,
    ) / coveredWeight;
  const weakestMargin = Math.min(...margins);
  const score = round(
    clamp100(
      weightedAverage * CAPACITY_CONFIG.bufferAverageWeight +
        weakestMargin * CAPACITY_CONFIG.bufferWeakestWeight,
    ),
    1,
  );
  const band: BufferBand = score >= 67 ? 'strong' : score >= 34 ? 'moderate' : 'low';

  return {
    score,
    fragility: round(100 - score, 1),
    band,
    confidence,
    components,
    missingKeys,
    evidence,
  };
}

function findingConfidence(
  factors: readonly InteractionFactorSignal[],
  evidence: readonly EvidenceRef[],
): Confidence {
  if (factors.length === 0) {
    return { level: 'insufficient', score: 0, evidenceCount: 0, freshnessDays: null };
  }
  const average =
    factors.reduce((total, factor) => total + clamp01(factor.confidence.score), 0) /
    factors.length;
  const freshnessValues = factors
    .map((factor) => factor.confidence.freshnessDays)
    .filter((value): value is number => value !== null);
  const score = round(clamp01(average), 3);
  return {
    level: confidenceLevel(score),
    score,
    evidenceCount: evidence.length,
    freshnessDays: freshnessValues.length > 0 ? round(Math.min(...freshnessValues), 2) : null,
  };
}

export function evaluateInteractionRisk(
  signals: readonly InteractionFactorSignal[],
  rules: readonly InteractionRule[] = DEFAULT_INTERACTION_RULES,
): InteractionRiskSummary {
  const signalByKey = new Map(signals.map((signal) => [signal.key, signal]));
  const findings: InteractionRiskFinding[] = rules.map((rule) => {
    const factors = rule.factorKeys
      .map((key) => signalByKey.get(key))
      .filter((factor): factor is InteractionFactorSignal => factor !== undefined);
    const evidence = uniqueEvidence(factors.flatMap((factor) => factor.evidence));
    const confidence = findingConfidence(factors, evidence);
    const complete =
      factors.length === rule.factorKeys.length &&
      factors.every((factor) => validPercent(factor.severity));

    if (!complete) {
      return {
        ruleId: rule.id,
        status: 'insufficient',
        score: null,
        confidence: withConfidenceScore(confidence, 0, evidence.length),
        factorKeys: rule.factorKeys,
        evidence,
        rationale: `${rule.label}: insufficient factor evidence.`,
      };
    }

    const severities = factors.map((factor) => factor.severity as number);
    const threshold = clamp100(rule.minSeverity);
    const active = severities.every((severity) => severity >= threshold);

    if (!active) {
      return {
        ruleId: rule.id,
        status: 'none',
        score: 0,
        confidence,
        factorKeys: rule.factorKeys,
        evidence,
        rationale: `${rule.label}: observed factors do not all cross the configured interaction threshold.`,
      };
    }

    const rawScore =
      (severities.reduce((total, severity) => total + severity, 0) / severities.length) *
      Math.max(0, Math.min(1, rule.weight));
    const score = round(clamp100(rawScore), 1);
    const status: InteractionRiskStatus =
      confidence.score >= CAPACITY_CONFIG.interactionElevatedConfidence
        ? 'elevated'
        : 'hypothesis';

    return {
      ruleId: rule.id,
      status,
      score,
      confidence,
      factorKeys: rule.factorKeys,
      evidence,
      rationale:
        status === 'elevated'
          ? `${rule.label}: combined factors cross the configured threshold with sufficient evidence confidence.`
          : `${rule.label}: combined factors cross the threshold, but evidence is too weak for more than a hypothesis.`,
    };
  });

  const activeFindings = findings.filter(
    (finding) => finding.status === 'elevated' || finding.status === 'hypothesis',
  );
  const completeFindings = findings.filter((finding) => finding.status !== 'insufficient');
  const evidence = uniqueEvidence(findings.flatMap((finding) => finding.evidence));
  const confidence =
    activeFindings.length > 0
      ? activeFindings.reduce((lowest, finding) =>
          finding.confidence.score < lowest.score ? finding.confidence : lowest,
        activeFindings[0]!.confidence)
      : completeFindings.length > 0
        ? completeFindings.reduce((lowest, finding) =>
            finding.confidence.score < lowest.score ? finding.confidence : lowest,
          completeFindings[0]!.confidence)
        : { level: 'insufficient' as const, score: 0, evidenceCount: 0, freshnessDays: null };

  const status: InteractionRiskStatus = findings.some((finding) => finding.status === 'elevated')
    ? 'elevated'
    : findings.some((finding) => finding.status === 'hypothesis')
      ? 'hypothesis'
      : completeFindings.length > 0
        ? 'none'
        : 'insufficient';
  const scores = activeFindings
    .map((finding) => finding.score)
    .filter((score): score is number => score !== null);

  return {
    status,
    score:
      status === 'insufficient' ? null : status === 'none' ? 0 : round(Math.max(...scores), 1),
    confidence: {
      ...confidence,
      evidenceCount: evidence.length,
    },
    findings,
    evidence,
  };
}
