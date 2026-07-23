/**
 * OECD connector — member-country datasets only.
 * Unsupported countries return unsupported_jurisdiction (no invented OECD values).
 * Live SDMX endpoints are attempted; failures stay honest (planned/unavailable).
 */

import { countries } from "@/lib/countries";
import { officialFetch, parseJsonBody } from "@/lib/official-connectors/framework/http-client";
import { appendAudit } from "@/lib/official-connectors/framework/audit";
import { computeFreshness, isoNow } from "@/lib/official-connectors/framework/validate";
import { publishObservation, setConnectorHealth } from "@/lib/official-connectors/store";
import type { ConnectorAttemptResult, VerifiedObservation } from "@/lib/official-connectors/types";

export const OECD_CONNECTOR_ID = "conn-oecd-member-live";

/** OECD member country IDs present in the CBAI registry. */
export const OECD_MEMBER_COUNTRY_IDS = new Set(["usa", "japan", "germany"]);

/**
 * OECD Data Explorer public REST probe (MEI unemployment idea replaced with structure ping).
 * If the endpoint cannot return parseable observations, we do not publish values.
 */
export const OECD_PROBE_URL =
  "https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI,4.0/USA.M.LI...?...";

export function isOecdMemberCountry(countryId: string): boolean {
  return OECD_MEMBER_COUNTRY_IDS.has(countryId);
}

export async function fetchOecdForCountry(countryId: string): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
  const started = Date.now();
  const country = countries.find((c) => c.id === countryId);

  if (!country) {
    return {
      ok: false,
      failureClass: "unsupported_jurisdiction",
      message: `Unknown country ${countryId}`,
      checkedAt,
      durationMs: 0,
    };
  }

  if (!isOecdMemberCountry(countryId)) {
    setConnectorHealth({
      connectorId: OECD_CONNECTOR_ID,
      sourceSlug: "oecd",
      status: "planned",
      lastCheckedAt: checkedAt,
      lastSuccessAt: null,
      message: `${country.name} is not treated as an OECD member dataset target in CBAI Preview`,
      liveCapable: true,
    });
    return {
      ok: false,
      failureClass: "unsupported_jurisdiction",
      message: `OECD values are not shown for unsupported country ${country.name}`,
      checkedAt,
      durationMs: Date.now() - started,
    };
  }

  // Prefer a lightweight agency dataflows probe that confirms OECD SDMX availability.
  const probeUrl =
    "https://sdmx.oecd.org/public/rest/dataflow/OECD.SDD.STES/all/latest?references=none";
  appendAudit({ connectorId: OECD_CONNECTOR_ID, action: "fetch", detail: probeUrl });
  const response = await officialFetch(probeUrl, {
    timeoutMs: 12_000,
    retries: 1,
    headers: {
      Accept: "application/vnd.sdmx.structure+json;charset=utf-8;version=1.0",
    },
  });

  if (!response.ok) {
    setConnectorHealth({
      connectorId: OECD_CONNECTOR_ID,
      sourceSlug: "oecd",
      status: "unavailable",
      lastCheckedAt: checkedAt,
      lastSuccessAt: null,
      message: `OECD SDMX probe failed: ${response.message}`,
      liveCapable: true,
    });
    return {
      ok: false,
      failureClass: response.failureClass,
      message: response.message,
      checkedAt,
      durationMs: response.durationMs,
      httpStatus: response.status,
    };
  }

  // Structure responses may be JSON or XML depending on content negotiation.
  const parsed = parseJsonBody(response.bodyText);
  if (!parsed.ok) {
    // Non-JSON structure still proves connectivity if HTTP 200 — publish connectivity metadata only.
    const meta: VerifiedObservation = {
      id: `oecd:meta:dataflow:${country.id}:${checkedAt.slice(0, 10)}`,
      indicatorCode: "oecd-sdmx-connectivity",
      indicatorName: "OECD SDMX dataflow connectivity",
      value: "connected",
      unit: "status",
      referencePeriod: checkedAt.slice(0, 10),
      entityType: "country",
      entityId: country.id,
      entityLabel: country.name,
      officialSource: "OECD SDMX API",
      provenance: {
        sourceSlug: "oecd",
        sourceName: "Organisation for Economic Co-operation and Development",
        sourceUrl: probeUrl,
        publicationDate: null,
        retrievedAt: checkedAt,
        lastCheckedAt: checkedAt,
        updateFrequency: "As published by OECD",
        jurisdiction: country.name,
        license: "OECD data terms",
        connectorId: OECD_CONNECTOR_ID,
        connectorVersion: "1.0.0",
      },
      verificationState: "verified",
      transformationNotes:
        "HTTP 200 from OECD SDMX dataflow endpoint. No numeric indicator value published because payload was not JSON observations.",
      freshnessStatus: computeFreshness(checkedAt),
      confidenceBasis: "Successful OECD SDMX structure response for a member country only.",
      cbaiIndicatorSlug: null,
    };
    const published = publishObservation(meta);
    setConnectorHealth({
      connectorId: OECD_CONNECTOR_ID,
      sourceSlug: "oecd",
      status: published ? "healthy" : "degraded",
      lastCheckedAt: checkedAt,
      lastSuccessAt: published ? checkedAt : null,
      message: "OECD SDMX reachable; numeric datasets remain selective",
      liveCapable: true,
    });
    return {
      ok: published,
      observations: published ? [meta] : [],
      checkedAt,
      durationMs: Date.now() - started,
      ...(published
        ? {}
        : { failureClass: "validation_failed" as const, message: "Rejected meta observation" }),
    } as ConnectorAttemptResult;
  }

  // JSON structure — still no invented series values.
  const metaJson: VerifiedObservation = {
    id: `oecd:meta:dataflow-json:${country.id}:${checkedAt.slice(0, 10)}`,
    indicatorCode: "oecd-sdmx-connectivity",
    indicatorName: "OECD SDMX dataflow connectivity",
    value: "connected",
    unit: "status",
    referencePeriod: checkedAt.slice(0, 10),
    entityType: "country",
    entityId: country.id,
    entityLabel: country.name,
    officialSource: "OECD SDMX API",
    provenance: {
      sourceSlug: "oecd",
      sourceName: "Organisation for Economic Co-operation and Development",
      sourceUrl: probeUrl,
      publicationDate: null,
      retrievedAt: checkedAt,
      lastCheckedAt: checkedAt,
      updateFrequency: "As published by OECD",
      jurisdiction: country.name,
      license: "OECD data terms",
      connectorId: OECD_CONNECTOR_ID,
      connectorVersion: "1.0.0",
    },
    verificationState: "verified",
    transformationNotes: "OECD SDMX JSON structure confirmed. Indicator observations not fabricated.",
    freshnessStatus: computeFreshness(checkedAt),
    confidenceBasis: "Successful OECD SDMX JSON structure response for a member country.",
    cbaiIndicatorSlug: null,
  };

  const published = publishObservation(metaJson);
  setConnectorHealth({
    connectorId: OECD_CONNECTOR_ID,
    sourceSlug: "oecd",
    status: published ? "healthy" : "degraded",
    lastCheckedAt: checkedAt,
    lastSuccessAt: published ? checkedAt : null,
    message: "OECD SDMX reachable for member country; values only when series explicitly mapped",
    liveCapable: true,
  });

  return {
    ok: true,
    observations: published ? [metaJson] : [],
    checkedAt,
    durationMs: Date.now() - started,
  };
}
