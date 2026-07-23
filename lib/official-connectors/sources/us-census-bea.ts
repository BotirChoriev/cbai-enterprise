/**
 * U.S. Census ACS + BEA NIPA — runtime secrets only (never NEXT_PUBLIC).
 * Activates only validated series when keys are present.
 */

import { officialFetch, parseJsonBody } from "@/lib/official-connectors/framework/http-client";
import { appendAudit } from "@/lib/official-connectors/framework/audit";
import { computeFreshness, isoNow } from "@/lib/official-connectors/framework/validate";
import { publishObservation, setConnectorHealth } from "@/lib/official-connectors/store";
import type { ConnectorAttemptResult, VerifiedObservation } from "@/lib/official-connectors/types";

export const US_CENSUS_CONNECTOR_ID = "conn-us-census";
export const US_BEA_CONNECTOR_ID = "conn-us-bea";

/** Validated ACS series only — total population (B01003_001E), US national. */
const CENSUS_ACS_YEAR = "2022";
const CENSUS_ACS_VARIABLE = "B01003_001E";

/** Validated BEA NIPA series only — Table T10105 Line 1 GDP (A). */
const BEA_NIPA_TABLE = "T10105";
const BEA_NIPA_LINE = "1";

export async function fetchUsCensus(apiKey?: string): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
  const started = Date.now();
  if (!apiKey) {
    setConnectorHealth({
      connectorId: US_CENSUS_CONNECTOR_ID,
      sourceSlug: "us-census",
      status: "planned",
      lastCheckedAt: checkedAt,
      lastSuccessAt: null,
      message: "Awaiting CENSUS_API_KEY — no simulated Census values",
      liveCapable: false,
    });
    return {
      ok: false,
      failureClass: "awaiting_credentials",
      message: "U.S. Census API key not configured",
      checkedAt,
      durationMs: 0,
    };
  }

  const url =
    `https://api.census.gov/data/${CENSUS_ACS_YEAR}/acs/acs5` +
    `?get=NAME,${CENSUS_ACS_VARIABLE}&for=us:1&key=${encodeURIComponent(apiKey)}`;
  const safeAuditUrl = url.replace(apiKey, "[redacted]");
  appendAudit({ connectorId: US_CENSUS_CONNECTOR_ID, action: "fetch", detail: safeAuditUrl });

  const response = await officialFetch(url, { timeoutMs: 15_000, retries: 1 });
  if (!response.ok) {
    setConnectorHealth({
      connectorId: US_CENSUS_CONNECTOR_ID,
      sourceSlug: "us-census",
      status: "unavailable",
      lastCheckedAt: checkedAt,
      lastSuccessAt: null,
      message: response.message,
      liveCapable: true,
    });
    return {
      ok: false,
      failureClass: response.failureClass,
      message: response.message,
      checkedAt,
      durationMs: Date.now() - started,
      httpStatus: response.status,
    };
  }

  const parsed = parseJsonBody(response.bodyText);
  if (!parsed.ok || !Array.isArray(parsed.value) || parsed.value.length < 2) {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "Census ACS response malformed",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  const header = parsed.value[0] as unknown[];
  const row = parsed.value[1] as unknown[];
  const varIndex = header.indexOf(CENSUS_ACS_VARIABLE);
  if (varIndex < 0 || typeof row[varIndex] !== "string") {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "Census ACS validated variable missing",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  const numeric = Number(row[varIndex]);
  if (!Number.isFinite(numeric)) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "Census ACS value not finite — not published",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  const observation: VerifiedObservation = {
    id: `census:usa:ACS5:${CENSUS_ACS_VARIABLE}:${CENSUS_ACS_YEAR}`,
    indicatorCode: CENSUS_ACS_VARIABLE,
    indicatorName: "Total population (ACS 5-year)",
    value: numeric,
    unit: "people",
    referencePeriod: CENSUS_ACS_YEAR,
    entityType: "country",
    entityId: "usa",
    entityLabel: "United States",
    officialSource: "U.S. Census Bureau ACS",
    provenance: {
      sourceSlug: "us-census",
      sourceName: "U.S. Census Bureau",
      sourceUrl: safeAuditUrl,
      publicationDate: `${CENSUS_ACS_YEAR}-01-01`,
      retrievedAt: checkedAt,
      lastCheckedAt: checkedAt,
      updateFrequency: "ACS 5-year releases",
      jurisdiction: "United States",
      license: "U.S. Government work",
      connectorId: US_CENSUS_CONNECTOR_ID,
      connectorVersion: "1.0.0",
    },
    verificationState: "verified",
    transformationNotes: "Direct ACS 5-year B01003_001E for us:1; no estimation.",
    freshnessStatus: computeFreshness(checkedAt),
    confidenceBasis: "Official Census API ACS value with redacted-key source URL retained.",
    cbaiIndicatorSlug: null,
  };

  const published = publishObservation(observation);
  setConnectorHealth({
    connectorId: US_CENSUS_CONNECTOR_ID,
    sourceSlug: "us-census",
    status: published ? "healthy" : "degraded",
    lastCheckedAt: checkedAt,
    lastSuccessAt: published ? checkedAt : null,
    message: published ? "ACS B01003_001E verified" : "ACS retrieved but publish rejected",
    liveCapable: true,
  });

  if (!published) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "ACS retrieved but publish rejected",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  return {
    ok: true,
    observations: [observation],
    checkedAt,
    durationMs: Date.now() - started,
  };
}

export async function fetchUsBea(apiKey?: string): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
  const started = Date.now();
  if (!apiKey) {
    setConnectorHealth({
      connectorId: US_BEA_CONNECTOR_ID,
      sourceSlug: "us-bea",
      status: "planned",
      lastCheckedAt: checkedAt,
      lastSuccessAt: null,
      message: "Awaiting BEA_API_KEY — DEMO keys are rejected",
      liveCapable: false,
    });
    return {
      ok: false,
      failureClass: "awaiting_credentials",
      message: "U.S. BEA API key not configured",
      checkedAt,
      durationMs: 0,
    };
  }

  if (apiKey.trim().toUpperCase() === "DEMO") {
    return {
      ok: false,
      failureClass: "awaiting_credentials",
      message: "BEA DEMO key rejected",
      checkedAt,
      durationMs: 0,
    };
  }

  const url =
    `https://apps.bea.gov/api/data/?UserID=${encodeURIComponent(apiKey)}` +
    `&method=GetData&DataSetName=NIPA&TableName=${BEA_NIPA_TABLE}` +
    `&Frequency=A&Year=LAST5&ResultFormat=JSON`;
  const safeAuditUrl = url.replace(apiKey, "[redacted]");
  appendAudit({ connectorId: US_BEA_CONNECTOR_ID, action: "fetch", detail: safeAuditUrl });

  const response = await officialFetch(url, { timeoutMs: 15_000, retries: 1 });
  if (!response.ok) {
    setConnectorHealth({
      connectorId: US_BEA_CONNECTOR_ID,
      sourceSlug: "us-bea",
      status: "unavailable",
      lastCheckedAt: checkedAt,
      lastSuccessAt: null,
      message: response.message,
      liveCapable: true,
    });
    return {
      ok: false,
      failureClass: response.failureClass,
      message: response.message,
      checkedAt,
      durationMs: Date.now() - started,
      httpStatus: response.status,
    };
  }

  const parsed = parseJsonBody(response.bodyText);
  if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null) {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "BEA NIPA response malformed",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  const root = parsed.value as {
    BEAAPI?: {
      Results?: {
        Data?: Array<{
          LineNumber?: string;
          TimePeriod?: string;
          DataValue?: string;
          METRIC_NAME?: string;
        }>;
        Error?: unknown;
      };
    };
  };

  if (root.BEAAPI?.Results?.Error) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "BEA API returned an error payload",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  const rows = root.BEAAPI?.Results?.Data ?? [];
  const lineRows = rows
    .filter((row) => row.LineNumber === BEA_NIPA_LINE && typeof row.DataValue === "string")
    .sort((a, b) => String(b.TimePeriod).localeCompare(String(a.TimePeriod)));
  const latest = lineRows[0];
  if (!latest?.TimePeriod || !latest.DataValue) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "BEA NIPA GDP line not present — not invented",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  const numeric = Number(String(latest.DataValue).replace(/,/g, ""));
  if (!Number.isFinite(numeric)) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "BEA NIPA value not finite — not published",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  const observation: VerifiedObservation = {
    id: `bea:usa:NIPA:${BEA_NIPA_TABLE}:${BEA_NIPA_LINE}:${latest.TimePeriod}`,
    indicatorCode: `NIPA.${BEA_NIPA_TABLE}.${BEA_NIPA_LINE}`,
    indicatorName: "Gross domestic product (NIPA T10105 line 1)",
    value: numeric,
    unit: "millions of current dollars",
    referencePeriod: latest.TimePeriod,
    entityType: "country",
    entityId: "usa",
    entityLabel: "United States",
    officialSource: "U.S. Bureau of Economic Analysis (NIPA)",
    provenance: {
      sourceSlug: "us-bea",
      sourceName: "U.S. Bureau of Economic Analysis",
      sourceUrl: safeAuditUrl,
      publicationDate: null,
      retrievedAt: checkedAt,
      lastCheckedAt: checkedAt,
      updateFrequency: "Annual NIPA releases",
      jurisdiction: "United States",
      license: "U.S. Government work",
      connectorId: US_BEA_CONNECTOR_ID,
      connectorVersion: "1.0.0",
    },
    verificationState: "verified",
    transformationNotes: "Comma stripped from BEA DataValue; unit retained as millions of current dollars.",
    freshnessStatus: computeFreshness(checkedAt),
    confidenceBasis: "Official BEA NIPA GetData response for validated table/line only.",
    cbaiIndicatorSlug: "national-accounts",
  };

  const published = publishObservation(observation);
  setConnectorHealth({
    connectorId: US_BEA_CONNECTOR_ID,
    sourceSlug: "us-bea",
    status: published ? "healthy" : "degraded",
    lastCheckedAt: checkedAt,
    lastSuccessAt: published ? checkedAt : null,
    message: published ? "BEA NIPA GDP line verified" : "BEA retrieved but publish rejected",
    liveCapable: true,
  });

  if (!published) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "BEA retrieved but publish rejected",
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  return {
    ok: true,
    observations: [observation],
    checkedAt,
    durationMs: Date.now() - started,
  };
}
