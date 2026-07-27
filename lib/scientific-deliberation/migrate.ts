import {
  SDN_SCHEMA_VERSION,
  type DeliberationBundle,
  type DeliberationRoom,
  type ScientificClaim,
  type DeliberationEvidenceRecord,
} from "@/lib/scientific-deliberation/types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/** Additive, idempotent room migration — preserves unknown fields. */
export function migrateDeliberationRoom(raw: unknown): DeliberationRoom {
  const r = asRecord(raw);
  const known = new Set([
    "id",
    "schemaVersion",
    "title",
    "roomType",
    "scientificQuestion",
    "scope",
    "primaryClaimId",
    "proofStandard",
    "acceptedSourcePolicies",
    "languages",
    "visibility",
    "status",
    "participantRoles",
    "startsAt",
    "endsAt",
    "translationConsent",
    "transcriptConsent",
    "confidentiality",
    "intellectualPropertyStatus",
    "conflictDisclosures",
    "finalHumanApprover",
    "sourceRoute",
    "relatedEntityIds",
    "relatedOperationalObjectIds",
    "collaborationMode",
    "contentLocale",
    "createdLocale",
    "sourceLanguage",
    "createdAt",
    "updatedAt",
    "version",
    "unknownFields",
  ]);
  const unknownFields: Record<string, unknown> = { ...(asRecord(r.unknownFields) as Record<string, unknown>) };
  for (const [k, v] of Object.entries(r)) {
    if (!known.has(k)) unknownFields[k] = v;
  }
  const now = typeof r.updatedAt === "string" ? r.updatedAt : new Date(0).toISOString();
  return {
    id: typeof r.id === "string" ? r.id : "unknown-room",
    schemaVersion: SDN_SCHEMA_VERSION,
    title: typeof r.title === "string" ? r.title : "Untitled room",
    roomType: (typeof r.roomType === "string" ? r.roomType : "open_scientific_question") as DeliberationRoom["roomType"],
    scientificQuestion: typeof r.scientificQuestion === "string" ? r.scientificQuestion : "",
    scope: typeof r.scope === "string" ? r.scope : "",
    primaryClaimId: typeof r.primaryClaimId === "string" ? r.primaryClaimId : null,
    proofStandard: typeof r.proofStandard === "string" ? r.proofStandard : "unknown",
    acceptedSourcePolicies: Array.isArray(r.acceptedSourcePolicies)
      ? r.acceptedSourcePolicies.filter((x): x is string => typeof x === "string")
      : [],
    languages: Array.isArray(r.languages) ? r.languages.filter((x): x is string => typeof x === "string") : ["en"],
    visibility: r.visibility === "open" || r.visibility === "restricted" ? r.visibility : "local_only",
    status: (typeof r.status === "string" ? r.status : "draft") as DeliberationRoom["status"],
    participantRoles: Array.isArray(r.participantRoles)
      ? (r.participantRoles.filter((x): x is DeliberationRoom["participantRoles"][number] => typeof x === "string") as DeliberationRoom["participantRoles"])
      : ["claim_author", "final_human_approver"],
    startsAt: typeof r.startsAt === "string" ? r.startsAt : null,
    endsAt: typeof r.endsAt === "string" ? r.endsAt : null,
    translationConsent: Boolean(r.translationConsent),
    transcriptConsent: Boolean(r.transcriptConsent),
    confidentiality:
      r.confidentiality === "participants" || r.confidentiality === "embargoed" || r.confidentiality === "none"
        ? r.confidentiality
        : "unknown",
    intellectualPropertyStatus: typeof r.intellectualPropertyStatus === "string" ? r.intellectualPropertyStatus : "unknown",
    conflictDisclosures: typeof r.conflictDisclosures === "string" ? r.conflictDisclosures : "unknown",
    finalHumanApprover: typeof r.finalHumanApprover === "string" ? r.finalHumanApprover : "unknown",
    sourceRoute: typeof r.sourceRoute === "string" ? r.sourceRoute : "/evidence",
    relatedEntityIds: Array.isArray(r.relatedEntityIds)
      ? r.relatedEntityIds.filter((x): x is string => typeof x === "string")
      : [],
    relatedOperationalObjectIds: Array.isArray(r.relatedOperationalObjectIds)
      ? r.relatedOperationalObjectIds.filter((x): x is string => typeof x === "string")
      : [],
    collaborationMode: r.collaborationMode === "infrastructure_required" ? "infrastructure_required" : "local_only",
    contentLocale: typeof r.contentLocale === "string" ? r.contentLocale : "en",
    createdLocale: typeof r.createdLocale === "string" ? r.createdLocale : "en",
    sourceLanguage: typeof r.sourceLanguage === "string" ? r.sourceLanguage : null,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : now,
    updatedAt: now,
    version: typeof r.version === "number" ? r.version : 1,
    unknownFields: Object.keys(unknownFields).length ? unknownFields : undefined,
  };
}

export function migrateScientificClaim(raw: unknown): ScientificClaim {
  const r = asRecord(raw);
  const known = new Set([
    "id",
    "roomId",
    "statement",
    "claimType",
    "authorRef",
    "institutionRef",
    "status",
    "assumptions",
    "scope",
    "contentLocale",
    "createdLocale",
    "sourceLanguage",
    "createdAt",
    "updatedAt",
    "version",
    "revisionHistory",
    "unknownFields",
  ]);
  const unknownFields: Record<string, unknown> = { ...(asRecord(r.unknownFields) as Record<string, unknown>) };
  for (const [k, v] of Object.entries(r)) {
    if (!known.has(k)) unknownFields[k] = v;
  }
  const now = typeof r.updatedAt === "string" ? r.updatedAt : new Date(0).toISOString();
  return {
    id: typeof r.id === "string" ? r.id : "unknown-claim",
    roomId: typeof r.roomId === "string" ? r.roomId : "",
    statement: typeof r.statement === "string" ? r.statement : "",
    claimType: typeof r.claimType === "string" ? r.claimType : "scientific",
    authorRef: typeof r.authorRef === "string" ? r.authorRef : null,
    institutionRef: typeof r.institutionRef === "string" ? r.institutionRef : null,
    status: (typeof r.status === "string" ? r.status : "proposed") as ScientificClaim["status"],
    assumptions: Array.isArray(r.assumptions) ? r.assumptions.filter((x): x is string => typeof x === "string") : [],
    scope: typeof r.scope === "string" ? r.scope : "",
    contentLocale: typeof r.contentLocale === "string" ? r.contentLocale : "en",
    createdLocale: typeof r.createdLocale === "string" ? r.createdLocale : "en",
    sourceLanguage: typeof r.sourceLanguage === "string" ? r.sourceLanguage : null,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : now,
    updatedAt: now,
    version: typeof r.version === "number" ? r.version : 1,
    revisionHistory: Array.isArray(r.revisionHistory)
      ? r.revisionHistory.filter((x): x is string => typeof x === "string")
      : [],
    unknownFields: Object.keys(unknownFields).length ? unknownFields : undefined,
  };
}

export function migrateDeliberationEvidence(raw: unknown): DeliberationEvidenceRecord {
  const r = asRecord(raw);
  const known = new Set([
    "id",
    "roomId",
    "claimId",
    "stance",
    "evidenceType",
    "authors",
    "institutions",
    "doiOrStableId",
    "sourceUrl",
    "officialSourceName",
    "publicationDate",
    "updatedDate",
    "lastVerifiedDate",
    "freshnessStatus",
    "methodology",
    "sampleSize",
    "measurementUnits",
    "geographicalCoverage",
    "temporalCoverage",
    "statisticalUncertainty",
    "limitations",
    "conflictsOfInterest",
    "replicationStatus",
    "linkedCounterEvidenceIds",
    "originalSourceText",
    "cbaiInterpretation",
    "humanConfirmationStatus",
    "provenance",
    "contentLocale",
    "createdLocale",
    "sourceLanguage",
    "createdAt",
    "updatedAt",
    "version",
    "unknownFields",
  ]);
  const unknownFields: Record<string, unknown> = { ...(asRecord(r.unknownFields) as Record<string, unknown>) };
  for (const [k, v] of Object.entries(r)) {
    if (!known.has(k)) unknownFields[k] = v;
  }
  const now = typeof r.updatedAt === "string" ? r.updatedAt : new Date(0).toISOString();
  return {
    id: typeof r.id === "string" ? r.id : "unknown-evidence",
    roomId: typeof r.roomId === "string" ? r.roomId : "",
    claimId: typeof r.claimId === "string" ? r.claimId : "",
    stance: r.stance === "challenge" || r.stance === "context" ? r.stance : "support",
    evidenceType: typeof r.evidenceType === "string" ? r.evidenceType : "unknown",
    authors: Array.isArray(r.authors) ? r.authors.filter((x): x is string => typeof x === "string") : [],
    institutions: Array.isArray(r.institutions) ? r.institutions.filter((x): x is string => typeof x === "string") : [],
    doiOrStableId: typeof r.doiOrStableId === "string" ? r.doiOrStableId : null,
    sourceUrl: typeof r.sourceUrl === "string" ? r.sourceUrl : null,
    officialSourceName: typeof r.officialSourceName === "string" ? r.officialSourceName : null,
    publicationDate: typeof r.publicationDate === "string" ? r.publicationDate : null,
    updatedDate: typeof r.updatedDate === "string" ? r.updatedDate : null,
    lastVerifiedDate: typeof r.lastVerifiedDate === "string" ? r.lastVerifiedDate : null,
    freshnessStatus:
      r.freshnessStatus === "fresh" ||
      r.freshnessStatus === "stale" ||
      r.freshnessStatus === "withdrawn" ||
      r.freshnessStatus === "superseded"
        ? r.freshnessStatus
        : "unknown",
    methodology: typeof r.methodology === "string" ? r.methodology : null,
    sampleSize: typeof r.sampleSize === "string" ? r.sampleSize : null,
    measurementUnits: typeof r.measurementUnits === "string" ? r.measurementUnits : null,
    geographicalCoverage: typeof r.geographicalCoverage === "string" ? r.geographicalCoverage : null,
    temporalCoverage: typeof r.temporalCoverage === "string" ? r.temporalCoverage : null,
    statisticalUncertainty: typeof r.statisticalUncertainty === "string" ? r.statisticalUncertainty : null,
    limitations: typeof r.limitations === "string" ? r.limitations : null,
    conflictsOfInterest: typeof r.conflictsOfInterest === "string" ? r.conflictsOfInterest : null,
    replicationStatus: typeof r.replicationStatus === "string" ? r.replicationStatus : null,
    linkedCounterEvidenceIds: Array.isArray(r.linkedCounterEvidenceIds)
      ? r.linkedCounterEvidenceIds.filter((x): x is string => typeof x === "string")
      : [],
    originalSourceText: typeof r.originalSourceText === "string" ? r.originalSourceText : "",
    cbaiInterpretation: typeof r.cbaiInterpretation === "string" ? r.cbaiInterpretation : null,
    humanConfirmationStatus:
      r.humanConfirmationStatus === "confirmed" ||
      r.humanConfirmationStatus === "rejected" ||
      r.humanConfirmationStatus === "pending"
        ? r.humanConfirmationStatus
        : "unknown",
    provenance: typeof r.provenance === "string" ? r.provenance : "unknown",
    contentLocale: typeof r.contentLocale === "string" ? r.contentLocale : "en",
    createdLocale: typeof r.createdLocale === "string" ? r.createdLocale : "en",
    sourceLanguage: typeof r.sourceLanguage === "string" ? r.sourceLanguage : null,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : now,
    updatedAt: now,
    version: typeof r.version === "number" ? r.version : 1,
    unknownFields: Object.keys(unknownFields).length ? unknownFields : undefined,
  };
}

export function assertIdempotentRoomMigration(raw: unknown): void {
  const once = migrateDeliberationRoom(raw);
  const twice = migrateDeliberationRoom(once);
  if (JSON.stringify(once) !== JSON.stringify(twice)) {
    throw new Error("SDN room migration is not idempotent");
  }
}

export function migrateBundle(raw: unknown): DeliberationBundle {
  const r = asRecord(raw);
  return {
    room: migrateDeliberationRoom(r.room ?? r),
    claims: Array.isArray(r.claims) ? r.claims.map(migrateScientificClaim) : [],
    evidence: Array.isArray(r.evidence) ? r.evidence.map(migrateDeliberationEvidence) : [],
    methodReviews: Array.isArray(r.methodReviews) ? (r.methodReviews as DeliberationBundle["methodReviews"]) : [],
    replications: Array.isArray(r.replications) ? (r.replications as DeliberationBundle["replications"]) : [],
    contributions: Array.isArray(r.contributions) ? (r.contributions as DeliberationBundle["contributions"]) : [],
    synthesis: (r.synthesis as DeliberationBundle["synthesis"]) ?? null,
    glossary: Array.isArray(r.glossary) ? (r.glossary as DeliberationBundle["glossary"]) : [],
    participants: Array.isArray(r.participants) ? (r.participants as DeliberationBundle["participants"]) : [],
    checkpoints: Array.isArray(r.checkpoints) ? (r.checkpoints as DeliberationBundle["checkpoints"]) : [],
    audit: Array.isArray(r.audit) ? (r.audit as DeliberationBundle["audit"]) : [],
    contradictions: Array.isArray(r.contradictions) ? (r.contradictions as DeliberationBundle["contradictions"]) : [],
  };
}
