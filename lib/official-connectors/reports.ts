/**
 * Evidence Report + Executive Summary — connected evidence only.
 * Never stronger than the evidence supports.
 */

import { listObservations, listConnectorHealth, connectedSourceSlugs } from "@/lib/official-connectors/store";
import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import type { VerifiedObservation } from "@/lib/official-connectors/types";

export type OfficialReportKind = "evidence" | "executive";

export type OfficialReportCitation = {
  readonly indicatorName: string;
  readonly value: string;
  readonly unit: string;
  readonly referencePeriod: string;
  readonly source: string;
  readonly sourceUrl: string;
  readonly retrievedAt: string;
};

export type OfficialGeneratedReport = {
  readonly kind: OfficialReportKind;
  readonly title: string;
  readonly generatedAt: string;
  readonly scope: string;
  readonly connectedSources: readonly string[];
  readonly missingSources: readonly string[];
  readonly evidenceTable: readonly OfficialReportCitation[];
  readonly freshnessNotes: readonly string[];
  readonly limitations: readonly string[];
  readonly confidenceExplanation: string;
  readonly humanReviewNotice: string;
  readonly narrative: string;
};

function citationFrom(observation: VerifiedObservation): OfficialReportCitation {
  return {
    indicatorName: observation.indicatorName,
    value: String(observation.value),
    unit: observation.unit,
    referencePeriod: observation.referencePeriod,
    source: observation.officialSource,
    sourceUrl: observation.provenance.sourceUrl,
    retrievedAt: observation.provenance.retrievedAt,
  };
}

export function generateEvidenceReport(entityId?: string): OfficialGeneratedReport {
  const observations = entityId
    ? listObservations({ entityId })
    : listObservations();
  const infra = getInfrastructureSummary();
  const live = connectedSourceSlugs();
  const missing = OFFICIAL_EVIDENCE_SOURCES.filter(
    (s) => s.connectionStatus !== "connected" && !live.includes(s.slug as never),
  ).map((s) => s.name);

  const table = observations.map(citationFrom);
  const health = listConnectorHealth();

  return {
    kind: "evidence",
    title: "Evidence Report",
    generatedAt: new Date().toISOString(),
    scope: entityId
      ? `Verified official observations for entity “${entityId}” plus connector health.`
      : "Verified official observations currently published in the Preview observation store.",
    connectedSources: [
      ...new Set([
        ...OFFICIAL_EVIDENCE_SOURCES.filter((s) => s.connectionStatus === "connected").map((s) => s.name),
        ...live,
      ]),
    ],
    missingSources: missing,
    evidenceTable: table,
    freshnessNotes: health.map(
      (h) =>
        `${h.connectorId}: ${h.status}; lastChecked=${h.lastCheckedAt ?? "not checked"}; ${h.message}`,
    ),
    limitations: [
      "Only observations that passed validation are listed.",
      "Null or missing official values are omitted — never estimated.",
      "Catalog sources without a successful live retrieval remain missing/planned.",
      `Infrastructure catalog reports ${infra.connectedSources} statically connected source(s).`,
    ],
    confidenceExplanation:
      table.length > 0
        ? "Confidence is limited to provenance-backed official API observations listed in the evidence table. No composite score is assigned."
        : "No verified live observations are published yet. Confidence cannot be assessed beyond registry architecture.",
    humanReviewNotice:
      "CBAI does not make decisions. A human must review citations, freshness, and gaps before any operational use.",
    narrative:
      table.length > 0
        ? `This Evidence Report lists ${table.length} verified observation(s) with source URLs and retrieval timestamps. It does not judge adequacy or recommend action.`
        : "No verified live observations are available to cite. Refresh official connectors before relying on this report.",
  };
}

export function generateExecutiveSummary(entityId?: string): OfficialGeneratedReport {
  const evidence = generateEvidenceReport(entityId);
  const count = evidence.evidenceTable.length;

  return {
    ...evidence,
    kind: "executive",
    title: "Executive Summary",
    scope: `Executive view of verified official evidence${entityId ? ` for ${entityId}` : ""}.`,
    narrative:
      count > 0
        ? [
            `Scope: ${evidence.scope}`,
            `Connected/live sources represented: ${evidence.connectedSources.join(", ") || "none"}.`,
            `Missing/planned sources: ${evidence.missingSources.length}.`,
            `Verified observations cited: ${count}.`,
            "This summary restates connected evidence only. It does not rank countries, score risk, or conclude investment merit.",
            evidence.humanReviewNotice,
          ].join(" ")
        : [
            "Executive Summary cannot assert coverage beyond the registry because no verified live observations are published.",
            "Refresh World Bank / BLS / SEC / UN connectors, then regenerate.",
            evidence.humanReviewNotice,
          ].join(" "),
    confidenceExplanation:
      count > 0
        ? "Executive confidence is descriptive only: citations exist with provenance. No decision-grade score is produced."
        : "Insufficient verified evidence for an executive assertion beyond acknowledging gaps.",
  };
}
