import type { Country } from "@/lib/countries";
import {
  buildCountryCoverageProfile,
  mapIndicatorStatusToLabel,
  resolveSourceDisplayName,
} from "@/lib/countries.coverage";
import { getIndicatorById } from "@/lib/indicator-framework";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { buildCountryEntityId, findEntityById } from "@/lib/registry";
import {
  assessTimelineReadiness,
  buildTimelineStandardLimitations,
  buildTimelineYearEntries,
} from "@/lib/timeline/timeline-readiness";
import {
  TIMELINE_DEFAULT_YEAR_SPAN,
  TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL,
  TIMELINE_RECORD_VERSION,
  TIMELINE_YEAR_STRUCTURE_PREPARED_LABEL,
} from "@/lib/timeline/timeline-types";
import type {
  CountryTimelineModel,
  TimelineId,
  TimelineIndicatorCoverageEntry,
  TimelineMethodologyReference,
  TimelineOfficialSourceEntry,
  TimelineRecord,
} from "@/lib/timeline/timeline-types";
import { TIMELINE_REFERENCE_YEAR } from "@/lib/timeline/timeline-version";

export const TIMELINE_ID_PATTERN = /^timeline-(country|company|university)-[a-z0-9-]+$/;

export function buildTimelineId(
  entityType: "country" | "company" | "university",
  slug: string,
): TimelineId {
  return `timeline-${entityType}-${slug}` as TimelineId;
}

export function isValidTimelineIdFormat(id: string): id is TimelineId {
  return TIMELINE_ID_PATTERN.test(id);
}

/** Generate structural year slots — not a claim of available time-series data. */
export function buildSupportedYearRange(
  endYear: number = TIMELINE_REFERENCE_YEAR,
  span: number = TIMELINE_DEFAULT_YEAR_SPAN,
): number[] {
  const startYear = endYear - span + 1;
  const years: number[] = [];
  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year);
  }
  return years;
}

function resolveAvailableEvidenceYears(
  indicators: TimelineIndicatorCoverageEntry[],
  supportedYears: readonly number[],
): number[] {
  const verifiedYears = new Set<number>();
  for (const entry of indicators) {
    for (const year of entry.availableYears) {
      if (supportedYears.includes(year)) {
        verifiedYears.add(year);
      }
    }
  }
  return supportedYears.filter((year) => verifiedYears.has(year));
}

function buildIndicatorCoverage(
  country: Country,
  supportedYears: readonly number[],
): TimelineIndicatorCoverageEntry[] {
  const coverage = buildCountryCoverageProfile(country);

  return coverage.indicatorsByDomain.flatMap((group) =>
    group.indicators.map((indicator) => {
      const statusLabel = indicator.statusLabel;
      // Year slots count only when traceable year-level evidence exists — never inferred from
      // indicator connection status, registry metadata, or structural placeholders.
      const availableYears: number[] = [];
      const missingYears = supportedYears.filter((y) => !availableYears.includes(y));

      return {
        indicatorId: indicator.id,
        indicatorTitle: indicator.title,
        domainTitle: group.domainTitle,
        statusLabel,
        availableYears,
        missingYears,
      };
    }),
  );
}

function buildOfficialSources(
  supportedYears: readonly number[],
): TimelineOfficialSourceEntry[] {
  return OFFICIAL_EVIDENCE_SOURCES.map((source) => ({
    sourceId: source.id,
    sourceName: resolveSourceDisplayName(source.slug),
    connectionStatus: source.connectionStatus,
    verificationStatus: source.verificationStatus,
    officialWebsite: source.officialWebsite,
    supportedYears: [...supportedYears],
  }));
}

function buildMethodologyReferences(
  indicatorIds: readonly string[],
): TimelineMethodologyReference[] {
  return indicatorIds
    .map((indicatorId) => {
      const indicator = getIndicatorById(indicatorId);
      if (!indicator) return null;
      return {
        indicatorId: indicator.id,
        indicatorTitle: indicator.title,
        whyItExists: indicator.methodology.whyItExists,
        requiredEvidence: indicator.methodology.requiredEvidence,
        missingEvidence: indicator.methodology.missingEvidence,
        standardReference: `indicator-framework/${indicator.category}/${indicator.slug}`,
      };
    })
    .filter((ref): ref is TimelineMethodologyReference => ref !== null);
}

/** Build country timeline record — evidence readiness structure only. */
export function buildCountryTimeline(country: Country): TimelineRecord {
  const entityId = buildCountryEntityId(country.id);
  const slug = entityId.replace(/^country-/, "");
  const supportedYears = buildSupportedYearRange();
  const indicatorCoverage = buildIndicatorCoverage(country, supportedYears);
  const officialSources = buildOfficialSources(supportedYears);

  const connectedIndicators = indicatorCoverage.filter(
    (entry) => entry.statusLabel === "Connected",
  ).length;
  const connectedSources = officialSources.filter(
    (source) => source.connectionStatus === "connected",
  ).length;

  const availableEvidenceYears = resolveAvailableEvidenceYears(
    indicatorCoverage,
    supportedYears,
  );
  const missingEvidenceYears = supportedYears.filter(
    (year) => !availableEvidenceYears.includes(year),
  );
  const futureEvidenceYears = missingEvidenceYears.filter(
    (year) => year >= TIMELINE_REFERENCE_YEAR,
  );

  const readinessStatus = assessTimelineReadiness({
    supportedYears,
    availableEvidenceYears,
    connectedIndicatorCount: connectedIndicators,
    totalIndicatorCount: indicatorCoverage.length,
    connectedSourceCount: connectedSources,
    totalSourceCount: officialSources.length,
  });

  const indicatorIds = indicatorCoverage.map((entry) => entry.indicatorId);

  return {
    timelineId: buildTimelineId("country", slug),
    entityId,
    entityType: "country",
    entityLabel: country.name,
    supportedYears,
    availableEvidenceYears,
    missingEvidenceYears,
    futureEvidenceYears,
    yearEntries: buildTimelineYearEntries(supportedYears, availableEvidenceYears),
    officialSources,
    indicatorCoverage,
    methodologyReferences: buildMethodologyReferences(indicatorIds),
    limitations: buildTimelineStandardLimitations(readinessStatus),
    readinessStatus,
    humanReviewRequired: true,
    version: TIMELINE_RECORD_VERSION,
  };
}

/** Build UI-facing country timeline model with empty-state detection. */
export function buildCountryTimelineModel(country: Country): CountryTimelineModel {
  const record = buildCountryTimeline(country);
  const evidenceNotConnected = record.availableEvidenceYears.length === 0;

  return {
    ...record,
    evidenceNotConnected,
    emptyStateMessage: evidenceNotConnected
      ? record.supportedYears.length > 0
        ? TIMELINE_YEAR_STRUCTURE_PREPARED_LABEL
        : TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL
      : `${record.availableEvidenceYears.length} of ${record.supportedYears.length} year slots have connected evidence.`,
  };
}

/** Verify entity exists in Global Registry before timeline build. */
export function assertCountryTimelineEntity(country: Country): void {
  const entityId = buildCountryEntityId(country.id);
  const entity = findEntityById(entityId);
  if (!entity) {
    throw new Error(`Country entity "${entityId}" not found in Global Registry.`);
  }
}

export { mapIndicatorStatusToLabel };
