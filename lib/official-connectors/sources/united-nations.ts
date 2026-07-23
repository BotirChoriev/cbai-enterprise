/**
 * United Nations SDG API — institutional metadata + optional series data.
 * Series/List proves connectivity. Values publish only when Data returns observations.
 * Endpoint: https://unstats.un.org/SDGAPI/v1/...
 */

import { officialFetch, parseJsonBody } from "@/lib/official-connectors/framework/http-client";
import { appendAudit } from "@/lib/official-connectors/framework/audit";
import { computeFreshness, isoNow } from "@/lib/official-connectors/framework/validate";
import { publishObservation, setConnectorHealth } from "@/lib/official-connectors/store";
import type { ConnectorAttemptResult, VerifiedObservation } from "@/lib/official-connectors/types";

export const UN_CONNECTOR_ID = "conn-un-sdg-live";
export const UN_SERIES_LIST_URL = "https://unstats.un.org/SDGAPI/v1/sdg/Series/List?pageSize=5";

/**
 * Attempt a known SDG series for the United States (M49 area code 840).
 * If empty, no value is published — connector may still be healthy for metadata.
 */
export const UN_TRY_SERIES = {
  seriesCode: "SL_TLF_CHLDWK",
  name: "Proportion of children engaged in economic activity (SDG series probe)",
  areaCode: "840",
  entityId: "usa",
} as const;

export async function fetchUnitedNationsConnectivity(): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
  const started = Date.now();
  appendAudit({ connectorId: UN_CONNECTOR_ID, action: "fetch", detail: UN_SERIES_LIST_URL });

  const listResponse = await officialFetch(UN_SERIES_LIST_URL, { timeoutMs: 20_000, retries: 1 });
  if (!listResponse.ok) {
    setConnectorHealth({
      connectorId: UN_CONNECTOR_ID,
      sourceSlug: "united-nations",
      status: "unavailable",
      lastCheckedAt: checkedAt,
      lastSuccessAt: null,
      message: listResponse.message,
      liveCapable: true,
    });
    return {
      ok: false,
      failureClass: listResponse.failureClass,
      message: listResponse.message,
      checkedAt,
      durationMs: listResponse.durationMs,
      httpStatus: listResponse.status,
    };
  }

  const listParsed = parseJsonBody(listResponse.bodyText);
  if (!listParsed.ok || !Array.isArray(listParsed.value)) {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "UN Series/List payload malformed",
      checkedAt,
      durationMs: listResponse.durationMs,
    };
  }

  const seriesCount = listParsed.value.length;
  const published: VerifiedObservation[] = [];

  // Metadata observation — count of series listed (not an invented indicator value).
  const metaObservation: VerifiedObservation = {
    id: `un:meta:series-list:${checkedAt.slice(0, 10)}`,
    indicatorCode: "un-sdg-series-catalog",
    indicatorName: "UN SDG Series catalog connectivity",
    value: seriesCount,
    unit: "series listed on page",
    referencePeriod: checkedAt.slice(0, 10),
    entityType: "country",
    entityId: "usa",
    entityLabel: "United Nations Statistical System (global catalog)",
    officialSource: "United Nations SDG API",
    provenance: {
      sourceSlug: "united-nations",
      sourceName: "United Nations Statistics Division SDG API",
      sourceUrl: UN_SERIES_LIST_URL,
      publicationDate: null,
      retrievedAt: checkedAt,
      lastCheckedAt: checkedAt,
      updateFrequency: "As published by UNSD",
      jurisdiction: "Global",
      license: "UN data terms of use",
      connectorId: UN_CONNECTOR_ID,
      connectorVersion: "1.0.0",
    },
    verificationState: "verified",
    transformationNotes:
      "Catalog connectivity check only. Individual SDG indicator values are published separately when Data endpoint returns observations.",
    freshnessStatus: computeFreshness(checkedAt),
    confidenceBasis: "Successful authenticated-less UN SDG Series/List response with JSON array payload.",
    cbaiIndicatorSlug: null,
  };

  if (publishObservation(metaObservation)) published.push(metaObservation);

  // Optional country series — short timeout; empty results are not fabricated.
  const dataUrl = `https://unstats.un.org/SDGAPI/v1/sdg/Series/Data?seriesCode=${UN_TRY_SERIES.seriesCode}&areaCode=${UN_TRY_SERIES.areaCode}&pageSize=1`;
  appendAudit({ connectorId: UN_CONNECTOR_ID, action: "fetch", detail: dataUrl });
  const dataResponse = await officialFetch(dataUrl, { timeoutMs: 8_000, retries: 0 });
  if (dataResponse.ok) {
    const dataParsed = parseJsonBody(dataResponse.bodyText);
    if (dataParsed.ok && typeof dataParsed.value === "object" && dataParsed.value !== null) {
      const data = (dataParsed.value as { data?: unknown[] }).data;
      // Only publish if a concrete observation exists with a value field.
      if (Array.isArray(data) && data.length > 0) {
        const row = data[0] as { value?: string | number; timePeriodStart?: number | string };
        if (row.value !== undefined && row.value !== null && row.value !== "") {
          const numeric = typeof row.value === "number" ? row.value : Number(row.value);
          if (Number.isFinite(numeric)) {
            const period = String(row.timePeriodStart ?? checkedAt.slice(0, 4));
            const obs: VerifiedObservation = {
              id: `un:usa:${UN_TRY_SERIES.seriesCode}:${period}`,
              indicatorCode: UN_TRY_SERIES.seriesCode,
              indicatorName: UN_TRY_SERIES.name,
              value: numeric,
              unit: "as reported",
              referencePeriod: period,
              entityType: "country",
              entityId: "usa",
              entityLabel: "United States",
              officialSource: "United Nations SDG API",
              provenance: {
                sourceSlug: "united-nations",
                sourceName: "United Nations Statistics Division SDG API",
                sourceUrl: dataUrl,
                publicationDate: null,
                retrievedAt: checkedAt,
                lastCheckedAt: checkedAt,
                updateFrequency: "As published by UNSD",
                jurisdiction: "United States (M49 840)",
                license: "UN data terms of use",
                connectorId: UN_CONNECTOR_ID,
                connectorVersion: "1.0.0",
              },
              verificationState: "verified",
              transformationNotes: "Published only because UN Data returned a numeric observation.",
              freshnessStatus: computeFreshness(checkedAt),
              confidenceBasis: "Official UN SDG Series/Data observation.",
              cbaiIndicatorSlug: null,
            };
            if (publishObservation(obs)) published.push(obs);
          }
        }
      }
    }
  }

  setConnectorHealth({
    connectorId: UN_CONNECTOR_ID,
    sourceSlug: "united-nations",
    status: published.length > 0 ? "healthy" : "degraded",
    lastCheckedAt: checkedAt,
    lastSuccessAt: published.length > 0 ? checkedAt : null,
    message: `UN Series/List connected (${seriesCount} series on page). Country series values published only when present.`,
    liveCapable: true,
  });

  return {
    ok: true,
    observations: published,
    checkedAt,
    durationMs: Date.now() - started,
  };
}
