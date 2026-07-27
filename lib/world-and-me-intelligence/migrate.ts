import {
  WIM_SCHEMA_VERSION,
  type WimEntityNode,
  type WimRelationship,
  type LiveIntelligenceRecord,
} from "@/lib/world-and-me-intelligence/types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function migrateWimEntityNode(raw: unknown): WimEntityNode {
  const r = asRecord(raw);
  const known = new Set([
    "id",
    "kind",
    "officialName",
    "fullLabel",
    "shortCode",
    "abbreviationForbiddenAlone",
    "contentLocale",
    "sourceLanguage",
    "geographicCoverage",
    "evidenceStatus",
    "classification",
    "lastVerifiedDate",
    "href",
    "unknownFields",
  ]);
  const unknownFields: Record<string, unknown> = { ...(asRecord(r.unknownFields) as Record<string, unknown>) };
  for (const [k, v] of Object.entries(r)) {
    if (!known.has(k)) unknownFields[k] = v;
  }
  const officialName = typeof r.officialName === "string" ? r.officialName : typeof r.label === "string" ? r.label : "Unknown";
  return {
    id: typeof r.id === "string" ? r.id : "unknown-node",
    kind: (typeof r.kind === "string" ? r.kind : typeof r.type === "string" ? r.type : "domain") as WimEntityNode["kind"],
    officialName,
    fullLabel: typeof r.fullLabel === "string" ? r.fullLabel : officialName,
    shortCode: typeof r.shortCode === "string" ? r.shortCode : null,
    abbreviationForbiddenAlone: true,
    contentLocale: typeof r.contentLocale === "string" ? r.contentLocale : "en",
    sourceLanguage: typeof r.sourceLanguage === "string" ? r.sourceLanguage : null,
    geographicCoverage: typeof r.geographicCoverage === "string" ? r.geographicCoverage : null,
    evidenceStatus:
      r.evidenceStatus === "connected" || r.evidenceStatus === "partial" || r.evidenceStatus === "not_connected"
        ? r.evidenceStatus
        : "unknown",
    classification:
      r.classification === "official_source" || r.classification === "cbai_inference" || r.classification === "user_entered"
        ? r.classification
        : "unknown",
    lastVerifiedDate: typeof r.lastVerifiedDate === "string" ? r.lastVerifiedDate : null,
    href: typeof r.href === "string" ? r.href : null,
    unknownFields: Object.keys(unknownFields).length ? unknownFields : undefined,
  };
}

export function migrateWimRelationship(raw: unknown): WimRelationship {
  const r = asRecord(raw);
  const known = new Set([
    "id",
    "type",
    "labelKey",
    "sourceNodeId",
    "targetNodeId",
    "evidenceStatus",
    "provenanceRefs",
    "validFrom",
    "validTo",
    "observedAt",
    "lastVerifiedDate",
    "confidenceOrCoverage",
    "classification",
    "relevanceExplanation",
    "unknownFields",
  ]);
  const unknownFields: Record<string, unknown> = { ...(asRecord(r.unknownFields) as Record<string, unknown>) };
  for (const [k, v] of Object.entries(r)) {
    if (!known.has(k)) unknownFields[k] = v;
  }
  const type = typeof r.type === "string" ? r.type : "linked_to_project";
  return {
    id: typeof r.id === "string" ? r.id : "unknown-rel",
    type: type as WimRelationship["type"],
    labelKey: typeof r.labelKey === "string" ? r.labelKey : `rel.${type}`,
    sourceNodeId: typeof r.sourceNodeId === "string" ? r.sourceNodeId : typeof r.source === "string" ? r.source : "",
    targetNodeId: typeof r.targetNodeId === "string" ? r.targetNodeId : typeof r.target === "string" ? r.target : "",
    evidenceStatus:
      r.evidenceStatus === "evidence_available" || r.evidenceStatus === "evidence_missing" ? r.evidenceStatus : "unknown",
    provenanceRefs: Array.isArray(r.provenanceRefs)
      ? r.provenanceRefs.filter((x): x is string => typeof x === "string")
      : [],
    validFrom: typeof r.validFrom === "string" ? r.validFrom : null,
    validTo: typeof r.validTo === "string" ? r.validTo : null,
    observedAt: typeof r.observedAt === "string" ? r.observedAt : null,
    lastVerifiedDate: typeof r.lastVerifiedDate === "string" ? r.lastVerifiedDate : null,
    confidenceOrCoverage:
      r.confidenceOrCoverage === "verified" || r.confidenceOrCoverage === "partial" ? r.confidenceOrCoverage : "unknown",
    classification:
      r.classification === "official_source" || r.classification === "cbai_inference" || r.classification === "user_entered"
        ? r.classification
        : "unknown",
    relevanceExplanation: typeof r.relevanceExplanation === "string" ? r.relevanceExplanation : null,
    unknownFields: Object.keys(unknownFields).length ? unknownFields : undefined,
  };
}

export function assertIdempotentWimNodeMigration(raw: unknown): void {
  const once = migrateWimEntityNode(raw);
  const twice = migrateWimEntityNode(once);
  if (JSON.stringify(once) !== JSON.stringify(twice)) throw new Error("WIM node migration not idempotent");
}

export function wimSchemaVersion(): typeof WIM_SCHEMA_VERSION {
  return WIM_SCHEMA_VERSION;
}

export function migrateLiveRecord(raw: unknown): LiveIntelligenceRecord {
  const r = asRecord(raw);
  return {
    id: typeof r.id === "string" ? r.id : "unknown-live",
    category: (typeof r.category === "string" ? r.category : "official_institutional_plan") as LiveIntelligenceRecord["category"],
    title: typeof r.title === "string" ? r.title : "",
    sourceName: typeof r.sourceName === "string" ? r.sourceName : null,
    sourceUrl: typeof r.sourceUrl === "string" ? r.sourceUrl : null,
    publisher: typeof r.publisher === "string" ? r.publisher : null,
    publicationDate: typeof r.publicationDate === "string" ? r.publicationDate : null,
    observedDate: typeof r.observedDate === "string" ? r.observedDate : null,
    lastVerificationDate: typeof r.lastVerificationDate === "string" ? r.lastVerificationDate : null,
    expectedRefreshFrequency: typeof r.expectedRefreshFrequency === "string" ? r.expectedRefreshFrequency : null,
    geographicCoverage: typeof r.geographicCoverage === "string" ? r.geographicCoverage : null,
    temporalCoverage: typeof r.temporalCoverage === "string" ? r.temporalCoverage : null,
    methodology: typeof r.methodology === "string" ? r.methodology : null,
    evidenceStatus: typeof r.evidenceStatus === "string" ? r.evidenceStatus : "unknown",
    officialMaterial: typeof r.officialMaterial === "string" ? r.officialMaterial : null,
    cbaiSummary: typeof r.cbaiSummary === "string" ? r.cbaiSummary : null,
    freshness: "no_verified_live_source",
    uncertainty: typeof r.uncertainty === "string" ? r.uncertainty : null,
    limitations: typeof r.limitations === "string" ? r.limitations : null,
    conflictingEvidence: Array.isArray(r.conflictingEvidence)
      ? r.conflictingEvidence.filter((x): x is string => typeof x === "string")
      : [],
    userGoalRelevance: typeof r.userGoalRelevance === "string" ? r.userGoalRelevance : null,
    contentLocale: typeof r.contentLocale === "string" ? r.contentLocale : "en",
    sourceLanguage: typeof r.sourceLanguage === "string" ? r.sourceLanguage : null,
  };
}
