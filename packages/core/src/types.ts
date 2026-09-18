export type ISODateTime = string;

export type ConfidenceLevel = 'insufficient' | 'possible' | 'likely' | 'known';
export type EvidenceSource = 'observed' | 'self_reported' | 'inferred';

export interface EvidenceRef {
  id: string;
  source: EvidenceSource;
  observedAt: ISODateTime;
  label: string;
}

export interface Confidence {
  level: ConfidenceLevel;
  score: number;
  evidenceCount: number;
  freshnessDays: number | null;
}

export interface Observation {
  id: string;
  userId: string;
  dimensionId: string;
  metric: string;
  value: number | string | boolean | null;
  observedAt: ISODateTime;
  source: EvidenceSource;
}

export interface DimensionDefinition {
  id: string;
  labelKey: string;
  defaultWeight: number;
  optional: boolean;
}

export interface ActionDefinition {
  id: string;
  labelKey: string;
  dimensionIds: readonly string[];
  effort: number;
  timeMinutes: number;
  risk: number;
}

export interface PluginDataRequirement {
  id: string;
  capability: string;
  metricIds: readonly string[];
  permissionScopes: readonly string[];
  optional: boolean;
}

export interface PluginManifest {
  id: string;
  version: string;
  labelKey: string;
  optional: boolean;
  dimensions: readonly DimensionDefinition[];
  actions: readonly ActionDefinition[];
  dataRequirements?: readonly PluginDataRequirement[];
}

export interface HumanStateComponent {
  key: string;
  value: number | null;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
  source: EvidenceSource | 'unknown';
}

export interface HumanStateVector {
  generatedAt: ISODateTime;
  maturity: 'cold_start' | 'learning' | 'personalized';
  components: readonly HumanStateComponent[];
}

export interface RecommendationCandidate {
  actionId: string;
  expectedImpact: number;
  confidence: Confidence;
  leverageDimensions: readonly string[];
  identityAlignment: number;
  effortCost: number;
  timeCost: number;
  resistanceCost: number;
  riskCost: number;
  evidence: readonly EvidenceRef[];
}

export interface OneMove {
  actionId: string | null;
  reason: string;
  confidence: Confidence;
  evidence: readonly EvidenceRef[];
  alternatives: readonly string[];
}

export interface UserTargets {
  seasonId: string | null;
  dimensionWeights: Readonly<Record<string, number>>;
  dimensionBaselines?: Readonly<Record<string, number>>;
}
