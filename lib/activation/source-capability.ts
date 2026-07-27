/**
 * Honest Source Capability Map (Adaptive Intelligence Workspace, Phase 8).
 *
 * CBAI never claims generic "access to the world's best databases". Every
 * source class carries an explicit, truthful access status. This map is the
 * single place that states what is actually connected today.
 */

export const SOURCE_CAPABILITY_STATUSES = [
  "connected",
  "available_not_connected",
  "user_provided",
  "public_web",
  "restricted",
  "authentication_required",
  "not_available",
] as const;

export type SourceCapabilityStatus = (typeof SOURCE_CAPABILITY_STATUSES)[number];

export type SourceCapabilityEntry = {
  readonly id: string;
  readonly status: SourceCapabilityStatus;
};

/**
 * Truthful defaults for this build: user documents and links work today;
 * official/institutional connectors are designed but not connected, and the
 * map says so instead of pretending.
 */
export const SOURCE_CAPABILITY_MAP: readonly SourceCapabilityEntry[] = [
  { id: "userDocuments", status: "user_provided" },
  { id: "userLinks", status: "user_provided" },
  { id: "publicWebSources", status: "public_web" },
  { id: "officialStatistics", status: "available_not_connected" },
  { id: "academicDatabases", status: "available_not_connected" },
  { id: "commercialDatabases", status: "authentication_required" },
  { id: "restrictedRegistries", status: "restricted" },
  { id: "liveIndustrialTelemetry", status: "not_available" },
];

/** Full evidence descriptor (Phase 8) — fields stay null until truly known. */
export type EvidenceSourceDescriptor = {
  readonly sourceName: string;
  readonly directLink: string | null;
  readonly publisher: string | null;
  readonly publicationDate: string | null;
  readonly latestUpdate: string | null;
  readonly geographicCoverage: string | null;
  readonly timeCoverage: string | null;
  readonly methodology: string | null;
  /** Official titles and quotations remain in their source language. */
  readonly sourceLanguage: string | null;
  readonly accessStatus: SourceCapabilityStatus;
  readonly freshness: "current" | "dated" | "unknown";
  readonly verificationStatus: "verified" | "not_independently_verified" | "unknown";
  readonly limitations: readonly string[];
  readonly contradictions: readonly string[];
  readonly lastReviewedAt: string | null;
};
