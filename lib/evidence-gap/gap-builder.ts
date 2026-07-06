import { getIndicatorsForEntity, getDomain } from "@/lib/indicator-framework";
import type { IndicatorDefinition } from "@/lib/indicator-framework";
import type { ApplicableEntity } from "@/lib/indicator-framework/types";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import type { EvidenceSourceRecord } from "@/lib/evidence-infrastructure/types";
import { findConnectorsByEvidenceSourceId } from "@/lib/connectors";
import type { ConnectorDefinition } from "@/lib/connectors";
import {
  buildCountryEntityId,
  buildCompanyEntityId,
  buildUniversityEntityId,
  type EntityId,
} from "@/lib/registry";
import { resolveSourceDisplayName } from "@/lib/countries.coverage";
import type { Country } from "@/lib/countries";
import type { Company } from "@/lib/companies";
import type { University } from "@/lib/universities";
import {
  GAP_RECORD_VERSION,
  type EntityEvidenceGapProfile,
  type EvidenceGapEntityType,
  type EvidenceGapId,
  type EvidenceGapRecord,
  type EvidenceGapStatus,
  type EvidenceMissingReason,
} from "@/lib/evidence-gap/gap-types";

export const GAP_ID_PATTERN = /^gap-(country|company|university)-[a-z0-9-]+-[a-z0-9-]+$/;

const SOURCE_BY_SLUG = new Map(
  OFFICIAL_EVIDENCE_SOURCES.map((source) => [source.slug, source]),
);

function buildGapId(
  entityType: EvidenceGapEntityType,
  entitySlug: string,
  indicatorSlug: string,
): EvidenceGapId {
  return `gap-${entityType}-${entitySlug}-${indicatorSlug}` as EvidenceGapId;
}

function resolvePrimarySource(indicator: IndicatorDefinition): EvidenceSourceRecord | null {
  for (const slug of indicator.requiredEvidenceSources) {
    const source = SOURCE_BY_SLUG.get(slug);
    if (source) return source;
  }
  for (const slug of indicator.optionalEvidenceSources) {
    const source = SOURCE_BY_SLUG.get(slug);
    if (source) return source;
  }
  return OFFICIAL_EVIDENCE_SOURCES.find((source) =>
    source.supportedIndicators.includes(indicator.slug),
  ) ?? null;
}

function resolvePrimaryConnector(source: EvidenceSourceRecord | null): ConnectorDefinition | null {
  if (!source) return null;
  const connectors = findConnectorsByEvidenceSourceId(source.id);
  return connectors[0] ?? null;
}

function resolveMissingReason(
  indicator: IndicatorDefinition,
  source: EvidenceSourceRecord | null,
  connector: ConnectorDefinition | null,
  status: EvidenceGapStatus,
): EvidenceMissingReason | null {
  if (status === "available") return null;

  if (!source) return "Indicator not mapped";

  if (source.connectionStatus === "deprecated") return "Official source unavailable";

  if (connector?.status === "planned") return "Connector planned";

  if (source.connectionStatus === "planned") return "Evidence source not connected";

  if (source.verificationStatus === "verification_pending") return "Verification pending";

  if (
    !indicator.methodology.requiredEvidence.trim() ||
    indicator.methodology.missingEvidence.includes("not yet")
  ) {
    return "Methodology pending";
  }

  if (indicator.status === "not_connected") return "Evidence source not connected";

  return "Evidence source not connected";
}

function resolveVerificationBlocker(
  source: EvidenceSourceRecord | null,
  connector: ConnectorDefinition | null,
  status: EvidenceGapStatus,
): string | null {
  if (status === "available") return null;

  if (!source) return "Official source not yet connected";

  if (source.verificationStatus === "verification_pending") {
    return "Verification pending";
  }

  if (source.verificationStatus === "not_started") {
    return "Official source not yet connected";
  }

  if (source.verificationStatus === "failed") {
    return "Verification pending";
  }

  if (connector?.status === "planned") {
    return "Connector planned";
  }

  if (source.connectionStatus === "planned") {
    return "Official source not yet connected";
  }

  return "Evidence not connected";
}

function resolveGapStatus(
  indicator: IndicatorDefinition,
  source: EvidenceSourceRecord | null,
): EvidenceGapStatus {
  if (indicator.status === "connected") {
    if (source?.connectionStatus === "connected") return "available";
    return "missing";
  }

  if (indicator.status === "planned") return "planned";

  if (source?.verificationStatus === "failed") return "blocked";

  if (source?.connectionStatus === "deprecated") return "blocked";

  return "missing";
}

function resolveNextStep(
  status: EvidenceGapStatus,
  connector: ConnectorDefinition | null,
): string {
  if (status === "available") {
    return "Evidence available — human review required before evaluative use.";
  }

  if (connector) {
    return `Await ${connector.connectorName} connector implementation and source verification.`;
  }

  return "Connect official evidence source through validated connector pipeline.";
}

function buildGapRecord(
  entityType: EvidenceGapEntityType,
  entityId: EntityId,
  entitySlug: string,
  entityLabel: string,
  indicator: IndicatorDefinition,
): EvidenceGapRecord {
  const source = resolvePrimarySource(indicator);
  const connector = resolvePrimaryConnector(source);
  const status = resolveGapStatus(indicator, source);
  const domain = getDomain(indicator.category);

  return {
    gapId: buildGapId(entityType, entitySlug, indicator.slug),
    entityId,
    entityType,
    entityLabel,
    indicatorId: indicator.id,
    indicatorTitle: indicator.title,
    domainTitle: domain?.title ?? indicator.category,
    expectedSource: source ? resolveSourceDisplayName(source.slug) : "Official source not yet connected",
    expectedSourceId: source?.id ?? null,
    expectedConnector: connector?.connectorName ?? "Connector planned",
    expectedConnectorId: connector?.connectorId ?? null,
    currentStatus: status,
    missingReason: resolveMissingReason(indicator, source, connector, status),
    requiredEvidence: indicator.methodology.requiredEvidence,
    requiredMethodology: indicator.methodology.whyItExists,
    verificationBlocker: resolveVerificationBlocker(source, connector, status),
    nextPossibleStep: resolveNextStep(status, connector),
    humanReviewRequired: true,
  };
}

function buildStandardLimitations(): string[] {
  return [
    "Evidence Gap Explorer shows registry-derived gap status only — not analytics or predictions.",
    "Counts reflect applicable indicators from the Global Indicator Framework — no fabricated percentages.",
    "Gap reasons describe connection and verification posture — not government failure or data concealment.",
    "Human review is required before using gap information in any decision context.",
    "Static export — no live evidence ingestion or runtime verification.",
  ];
}

function buildProfile(
  entityType: EvidenceGapEntityType,
  entityId: EntityId,
  entitySlug: string,
  entityLabel: string,
): EntityEvidenceGapProfile {
  const applicableEntity = entityType as ApplicableEntity;
  const indicators = getIndicatorsForEntity(applicableEntity);

  const gaps = indicators.map((indicator) =>
    buildGapRecord(entityType, entityId, entitySlug, entityLabel, indicator),
  );

  const availableCount = gaps.filter((g) => g.currentStatus === "available").length;
  const plannedCount = gaps.filter((g) => g.currentStatus === "planned").length;
  const missingCount = gaps.filter((g) => g.currentStatus === "missing").length;
  const blockedCount = gaps.filter((g) => g.currentStatus === "blocked").length;

  return {
    entityId,
    entityType,
    entityLabel,
    gaps,
    availableCount,
    plannedCount,
    missingCount,
    blockedCount,
    totalIndicators: gaps.length,
    limitations: buildStandardLimitations(),
    humanReviewRequired: true,
    version: GAP_RECORD_VERSION,
  };
}

export function buildCountryEvidenceGapProfile(country: Country): EntityEvidenceGapProfile {
  const entityId = buildCountryEntityId(country.id);
  const entitySlug = entityId.replace(/^country-/, "");
  return buildProfile("country", entityId, entitySlug, country.name);
}

export function buildCompanyEvidenceGapProfile(company: Company): EntityEvidenceGapProfile {
  const entityId = buildCompanyEntityId(company.id);
  const entitySlug = entityId.replace(/^company-/, "");
  return buildProfile("company", entityId, entitySlug, company.name);
}

export function buildUniversityEvidenceGapProfile(
  university: University,
): EntityEvidenceGapProfile {
  const entityId = buildUniversityEntityId(university.id);
  const entitySlug = entityId.replace(/^university-/, "");
  return buildProfile("university", entityId, entitySlug, university.name);
}

export function isValidGapIdFormat(id: string): id is EvidenceGapId {
  return GAP_ID_PATTERN.test(id);
}
