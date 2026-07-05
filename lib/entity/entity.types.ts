/**
 * CBAI Universal Entity Framework
 * Shared type system for all intelligence modules.
 */

export type EntityType =
  | "country"
  | "company"
  | "university"
  | "government"
  | "investor"
  | "person";

export type EntityStatus =
  | "active"
  | "inactive"
  | "pending"
  | "archived"
  | "monitoring";

export type EntityMetricChange = "positive" | "negative" | "neutral";

export type EntityMetric = {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: EntityMetricChange;
  highlight?: boolean;
};

export type EntityTagVariant =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type EntityTag = {
  id: string;
  label: string;
  variant?: EntityTagVariant;
};

export type EntityTimelineType =
  | "milestone"
  | "update"
  | "alert"
  | "analysis"
  | "system";

export type EntityTimelineEvent = {
  id: string;
  title: string;
  description?: string;
  date: string;
  type?: EntityTimelineType;
};

export type EntityMetadataValue = string | number | boolean | null;

export type EntityMetadata = Record<string, EntityMetadataValue>;

export type EntityScores = {
  aiScore: number;
  riskScore: number;
  investmentScore: number;
};

/**
 * Universal entity interface consumed by all intelligence modules.
 * Every module maps its domain model to this shape before rendering.
 */
export type Entity = {
  id: string;
  type: EntityType;
  name: string;
  category: string;
  overview: string;
  status: EntityStatus;
  scores: EntityScores;
  tags: EntityTag[];
  timeline: EntityTimelineEvent[];
  aiSummary: string;
  metadata: EntityMetadata;
  metrics: EntityMetric[];
  /** Short code or initials displayed when no logo URL is provided */
  icon?: string;
  /** Optional logo URL — falls back to icon initials */
  logo?: string;
  /** Secondary line under the entity name (e.g. location, sector) */
  subtitle?: string;
};

/** Props shared by all entity presentation components */
export type EntityComponentProps = {
  entity: Entity;
};

/** Score card configuration for the three standard CBAI scores */
export type EntityScoreKey = keyof EntityScores;

export type EntityScoreConfig = {
  key: EntityScoreKey;
  label: string;
  inverted?: boolean;
  description?: string;
};

export const ENTITY_SCORE_CONFIGS: EntityScoreConfig[] = [
  { key: "aiScore", label: "AI Score", description: "AI readiness & capability" },
  {
    key: "investmentScore",
    label: "Investment Score",
    description: "Investment attractiveness",
  },
  {
    key: "riskScore",
    label: "Risk Score",
    inverted: true,
    description: "Risk exposure level",
  },
];

/** Metadata field display order is controlled by the module adapter */
export type EntityMetadataField = {
  key: string;
  label: string;
};

export type EntityModuleConfig = {
  type: EntityType;
  label: string;
  pluralLabel: string;
  metadataFields?: EntityMetadataField[];
};

export const ENTITY_MODULE_CONFIGS: Record<EntityType, EntityModuleConfig> = {
  country: {
    type: "country",
    label: "Country",
    pluralLabel: "Countries",
  },
  company: {
    type: "company",
    label: "Company",
    pluralLabel: "Companies",
  },
  university: {
    type: "university",
    label: "University",
    pluralLabel: "Universities",
  },
  government: {
    type: "government",
    label: "Government",
    pluralLabel: "Governments",
  },
  investor: {
    type: "investor",
    label: "Investor",
    pluralLabel: "Investors",
  },
  person: {
    type: "person",
    label: "Person",
    pluralLabel: "People",
  },
};
