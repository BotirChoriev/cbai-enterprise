import {
  EVIDENCE_PASSPORT_SCHEMA_VERSION,
  type EvidencePassport,
  type EvidenceStance,
  type KnowledgeState,
  type HumanVerificationStatus,
} from "@/lib/evidence-passport/types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}
function asString(v: unknown, fb = ""): string {
  return typeof v === "string" ? v : fb;
}
function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export function fingerprintPassport(parts: {
  readonly evidenceId: string;
  readonly claimText: string;
  readonly originalSourceContent: string;
  readonly directSourceUrl: string | null;
}): string {
  const raw = [parts.evidenceId, parts.claimText, parts.originalSourceContent, parts.directSourceUrl ?? ""].join("|");
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  return `fp-${h.toString(16)}`;
}

export function migrateEvidencePassport(raw: unknown): EvidencePassport | null {
  const r = asRecord(raw);
  if (!r) return null;
  const passportId = asString(r.passportId || r.id);
  const evidenceId = asString(r.evidenceId, passportId);
  if (!passportId && !evidenceId) return null;
  const id = passportId || `passport-${evidenceId}`;
  const claimText = asString(r.claimText, asString(r.label));
  const originalSourceContent = asString(r.originalSourceContent, asString(r.originalSource, claimText));
  const directSourceUrl =
    typeof r.directSourceUrl === "string"
      ? r.directSourceUrl
      : typeof r.originalSource === "string"
        ? r.originalSource
        : null;
  const stance: EvidenceStance =
    r.stance === "challenges" || r.stance === "contextualizes" ? r.stance : "supports";
  const knowledgeState: KnowledgeState =
    r.knowledgeState === "disputed" || r.knowledgeState === "unknown" ? r.knowledgeState : "known";
  const humanVerificationStatus: HumanVerificationStatus =
    r.humanVerificationStatus === "pending_review" ||
    r.humanVerificationStatus === "human_confirmed" ||
    r.humanVerificationStatus === "rejected"
      ? r.humanVerificationStatus
      : "unverified";
  const now = new Date().toISOString();
  const fp =
    asString(r.fingerprint) ||
    fingerprintPassport({
      evidenceId: evidenceId || id,
      claimText,
      originalSourceContent,
      directSourceUrl,
    });

  return {
    ...r,
    schemaVersion: EVIDENCE_PASSPORT_SCHEMA_VERSION,
    passportId: id,
    evidenceId: evidenceId || id,
    claimId: typeof r.claimId === "string" ? r.claimId : null,
    claimText,
    stance,
    evidenceType:
      r.evidenceType === "measurement" ||
      r.evidenceType === "publication" ||
      r.evidenceType === "official_statistic" ||
      r.evidenceType === "method_note" ||
      r.evidenceType === "negative_result" ||
      r.evidenceType === "replication" ||
      r.evidenceType === "dataset" ||
      r.evidenceType === "observation"
        ? r.evidenceType
        : "other",
    author: typeof r.author === "string" ? r.author : null,
    institution: typeof r.institution === "string" ? r.institution : null,
    directSourceUrl,
    publicationDate: typeof r.publicationDate === "string" ? r.publicationDate : null,
    updateDate: typeof r.updateDate === "string" ? r.updateDate : null,
    methodology: typeof r.methodology === "string" ? r.methodology : null,
    sampleSize: typeof r.sampleSize === "string" ? r.sampleSize : null,
    units: typeof r.units === "string" ? r.units : null,
    geographyCoverage: typeof r.geographyCoverage === "string" ? r.geographyCoverage : null,
    timeCoverage: typeof r.timeCoverage === "string" ? r.timeCoverage : null,
    statisticalUncertainty: typeof r.statisticalUncertainty === "string" ? r.statisticalUncertainty : null,
    limitations: asArray(r.limitations).filter((x): x is string => typeof x === "string"),
    conflictsOfInterest: typeof r.conflictsOfInterest === "string" ? r.conflictsOfInterest : null,
    replicationStatus:
      r.replicationStatus === "replicated" ||
      r.replicationStatus === "failed_replication" ||
      r.replicationStatus === "unknown"
        ? r.replicationStatus
        : "not_attempted",
    counterEvidenceIds: asArray(r.counterEvidenceIds).filter((x): x is string => typeof x === "string"),
    freshness:
      r.freshness === "fresh" || r.freshness === "aging" || r.freshness === "outdated" ? r.freshness : "unknown",
    license: typeof r.license === "string" ? r.license : null,
    originalSourceContent,
    localizedSummary: typeof r.localizedSummary === "string" ? r.localizedSummary : null,
    cbaiSynthesis: typeof r.cbaiSynthesis === "string" ? r.cbaiSynthesis : null,
    knowledgeState,
    humanVerificationStatus,
    verifierDisplayName: typeof r.verifierDisplayName === "string" ? r.verifierDisplayName : null,
    fingerprint: fp,
    version: asString(r.version, "1"),
    contentLocale: asString(r.contentLocale, "en"),
    createdLocale: asString(r.createdLocale, asString(r.contentLocale, "en")),
    createdAt: asString(r.createdAt, now),
    updatedAt: asString(r.updatedAt, now),
    auditHistory: asArray(r.auditHistory).map((item) => {
      const a = asRecord(item) ?? {};
      return {
        at: asString(a.at, now),
        actor: asString(a.actor, "system"),
        action: asString(a.action, "migrated"),
        detail: typeof a.detail === "string" ? a.detail : null,
      };
    }),
  };
}

export function migrateEvidencePassportCollection(raw: unknown): EvidencePassport[] {
  const list = Array.isArray(raw) ? raw : asRecord(raw)?.passports;
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => migrateEvidencePassport(item))
    .filter((p): p is EvidencePassport => p !== null)
    .map((p) => migrateEvidencePassport(p)!);
}
