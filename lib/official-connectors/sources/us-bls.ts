/**
 * U.S. Bureau of Labor Statistics public API — unemployment series (no key required for limited use).
 * Endpoint: https://api.bls.gov/publicAPI/v2/timeseries/data/
 */

import { officialFetch, parseJsonBody } from "@/lib/official-connectors/framework/http-client";
import { appendAudit } from "@/lib/official-connectors/framework/audit";
import { computeFreshness, isoNow } from "@/lib/official-connectors/framework/validate";
import { publishObservation, setConnectorHealth } from "@/lib/official-connectors/store";
import type { ConnectorAttemptResult, VerifiedObservation } from "@/lib/official-connectors/types";

export const US_BLS_CONNECTOR_ID = "conn-us-bls-public";
export const US_BLS_ENDPOINT = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

/** Civilian unemployment rate (seasonally adjusted). */
export const BLS_UNEMPLOYMENT_SERIES = {
  seriesId: "LNS14000000",
  name: "Civilian Unemployment Rate (seasonally adjusted)",
  unit: "percent",
} as const;

export async function fetchUsBlsUnemployment(): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
  const started = Date.now();
  const year = new Date().getUTCFullYear();
  const body = JSON.stringify({
    seriesid: [BLS_UNEMPLOYMENT_SERIES.seriesId],
    startyear: String(year - 1),
    endyear: String(year),
  });

  appendAudit({ connectorId: US_BLS_CONNECTOR_ID, action: "fetch", detail: US_BLS_ENDPOINT });

  // BLS publicAPI requires POST.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  let bodyText = "";
  let durationMs = 0;
  try {
    const postStarted = Date.now();
    const post = await fetch(US_BLS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "CBAI-Enterprise-OfficialConnector/1.0",
      },
      body,
      signal: controller.signal,
    });
    durationMs = Date.now() - postStarted;
    bodyText = await post.text();
    if (!post.ok) {
      setConnectorHealth({
        connectorId: US_BLS_CONNECTOR_ID,
        sourceSlug: "us-bls",
        status: "unavailable",
        lastCheckedAt: checkedAt,
        lastSuccessAt: null,
        message: `HTTP ${post.status}`,
        liveCapable: true,
      });
      return {
        ok: false,
        failureClass: post.status === 429 ? "rate_limit" : "http_error",
        message: `HTTP ${post.status}`,
        checkedAt,
        durationMs,
        httpStatus: post.status,
      };
    }
  } catch (error) {
    clearTimeout(timer);
    const message = error instanceof Error ? error.message : String(error);
    setConnectorHealth({
      connectorId: US_BLS_CONNECTOR_ID,
      sourceSlug: "us-bls",
      status: "unavailable",
      lastCheckedAt: checkedAt,
      lastSuccessAt: null,
      message,
      liveCapable: true,
    });
    return {
      ok: false,
      failureClass: /aborted|timeout/i.test(message) ? "timeout" : "network_error",
      message,
      checkedAt,
      durationMs: Date.now() - started,
    };
  } finally {
    clearTimeout(timer);
  }

  const parsed = parseJsonBody(bodyText);
  if (!parsed.ok) {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: parsed.message,
      checkedAt,
      durationMs,
    };
  }

  const root = parsed.value as {
    status?: string;
    Results?: { series?: Array<{ seriesID?: string; data?: Array<{ year?: string; period?: string; periodName?: string; value?: string }> }> };
  };

  if (root.status !== "REQUEST_SUCCEEDED") {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: `BLS status: ${root.status ?? "unknown"}`,
      checkedAt,
      durationMs,
    };
  }

  const series = root.Results?.series?.[0];
  const latest = series?.data?.[0];
  if (!latest?.value || !latest.year || !latest.period) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "BLS response missing observation value",
      checkedAt,
      durationMs,
    };
  }

  const numeric = Number(latest.value);
  if (!Number.isFinite(numeric)) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "BLS value is not numeric",
      checkedAt,
      durationMs,
    };
  }

  const referencePeriod = `${latest.year}-${latest.period}`;
  const observation: VerifiedObservation = {
    id: `bls:usa:${BLS_UNEMPLOYMENT_SERIES.seriesId}:${referencePeriod}`,
    indicatorCode: BLS_UNEMPLOYMENT_SERIES.seriesId,
    indicatorName: BLS_UNEMPLOYMENT_SERIES.name,
    value: numeric,
    unit: BLS_UNEMPLOYMENT_SERIES.unit,
    referencePeriod,
    entityType: "country",
    entityId: "usa",
    entityLabel: "United States",
    officialSource: "U.S. Bureau of Labor Statistics",
    provenance: {
      sourceSlug: "us-bls",
      sourceName: "U.S. Bureau of Labor Statistics",
      sourceUrl: US_BLS_ENDPOINT,
      publicationDate: null,
      retrievedAt: checkedAt,
      lastCheckedAt: checkedAt,
      updateFrequency: "Monthly",
      jurisdiction: "United States",
      license: "BLS public API terms",
      connectorId: US_BLS_CONNECTOR_ID,
      connectorVersion: "1.0.0",
    },
    verificationState: "verified",
    transformationNotes: `Period ${latest.periodName ?? latest.period}; no seasonal adjustment changes applied by CBAI.`,
    freshnessStatus: computeFreshness(checkedAt),
    confidenceBasis: "Official BLS publicAPI v2 timeseries observation for the United States only.",
    cbaiIndicatorSlug: "labour-market-statistics",
  };

  const published = publishObservation(observation);
  setConnectorHealth({
    connectorId: US_BLS_CONNECTOR_ID,
    sourceSlug: "us-bls",
    status: published ? "healthy" : "degraded",
    lastCheckedAt: checkedAt,
    lastSuccessAt: published ? checkedAt : null,
    message: published ? "Verified BLS unemployment observation published" : "Validation rejected observation",
    liveCapable: true,
  });

  if (!published) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "Observation failed publish validation",
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
