/**
 * World Bank Open Data API connector — live WDI observations.
 * Endpoint: https://api.worldbank.org/v2/country/{iso2}/indicator/{code}
 */

import { countries } from "@/lib/countries";
import { officialFetch, parseJsonBody } from "@/lib/official-connectors/framework/http-client";
import { cacheGet, cacheSet } from "@/lib/official-connectors/framework/cache";
import { appendAudit } from "@/lib/official-connectors/framework/audit";
import { computeFreshness, isoNow } from "@/lib/official-connectors/framework/validate";
import { publishObservation, setConnectorHealth } from "@/lib/official-connectors/store";
import { listApprovedLiveWdiCodes } from "@/lib/official-connectors/sources/wdi-mapping";
import type {
  ConnectorAttemptResult,
  VerifiedObservation,
} from "@/lib/official-connectors/types";

export const WORLD_BANK_CONNECTOR_ID = "conn-world-bank-wdi-live";
export const WORLD_BANK_API_BASE = "https://api.worldbank.org/v2";

/** Approved live WDI codes only (baseline + Phase 4 reviewed). */
export const WORLD_BANK_LIVE_INDICATORS = listApprovedLiveWdiCodes().map((item) => ({
  code: item.code,
  name: item.officialName,
  unit: item.unit,
  cbaiIndicatorSlug: item.cbaiIndicatorSlug,
}));


type WbRow = {
  indicator?: { id?: string; value?: string };
  country?: { id?: string; value?: string };
  date?: string;
  value?: number | null;
};

function countryByIso2(iso2: string) {
  return countries.find((c) => c.code.toUpperCase() === iso2.toUpperCase()) ?? null;
}

function buildObservation(
  row: WbRow,
  meta: (typeof WORLD_BANK_LIVE_INDICATORS)[number],
  entityId: string,
  entityLabel: string,
  sourceUrl: string,
  retrievedAt: string,
): VerifiedObservation | null {
  if (row.value === null || row.value === undefined) return null;
  if (typeof row.value !== "number" || !Number.isFinite(row.value)) return null;
  const period = typeof row.date === "string" ? row.date : null;
  if (!period) return null;

  return {
    id: `wb:${entityId}:${meta.code}:${period}`,
    indicatorCode: meta.code,
    indicatorName: meta.name,
    value: row.value,
    unit: meta.unit,
    referencePeriod: period,
    entityType: "country",
    entityId,
    entityLabel,
    officialSource: "World Bank Open Data (WDI)",
    provenance: {
      sourceSlug: "world-bank",
      sourceName: "World Bank Open Data",
      sourceUrl,
      publicationDate: period.length === 4 ? `${period}-01-01` : period,
      retrievedAt,
      lastCheckedAt: retrievedAt,
      updateFrequency: "Annual / as published by World Bank",
      jurisdiction: "Global (country-coded)",
      license: "World Bank Open Data Terms of Use",
      connectorId: WORLD_BANK_CONNECTOR_ID,
      connectorVersion: "1.0.0",
    },
    verificationState: "verified",
    transformationNotes: "Direct WDI observation; no interpolation or estimation applied.",
    freshnessStatus: computeFreshness(retrievedAt),
    confidenceBasis: "Official World Bank WDI API value with source URL and reference period retained.",
    cbaiIndicatorSlug: meta.cbaiIndicatorSlug,
  };
}

export async function fetchWorldBankForCountry(countryId: string): Promise<ConnectorAttemptResult> {
  const country = countries.find((c) => c.id === countryId);
  if (!country) {
    return {
      ok: false,
      failureClass: "unsupported_jurisdiction",
      message: `Country ${countryId} is not in the CBAI registry`,
      checkedAt: isoNow(),
      durationMs: 0,
    };
  }

  const checkedAt = isoNow();
  const started = Date.now();
  const published: VerifiedObservation[] = [];

  for (const meta of WORLD_BANK_LIVE_INDICATORS) {
    const url = `${WORLD_BANK_API_BASE}/country/${country.code}/indicator/${meta.code}?format=json&per_page=1&mrv=1`;
    const cacheKey = `wb:${country.code}:${meta.code}`;
    let bodyText = cacheGet(cacheKey);
    if (bodyText) {
      appendAudit({ connectorId: WORLD_BANK_CONNECTOR_ID, action: "cache_hit", detail: cacheKey });
    } else {
      appendAudit({ connectorId: WORLD_BANK_CONNECTOR_ID, action: "cache_miss", detail: cacheKey });
      appendAudit({ connectorId: WORLD_BANK_CONNECTOR_ID, action: "fetch", detail: url });
      const response = await officialFetch(url, { timeoutMs: 12_000, retries: 2 });
      if (!response.ok) {
        setConnectorHealth({
          connectorId: WORLD_BANK_CONNECTOR_ID,
          sourceSlug: "world-bank",
          status: "degraded",
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
      bodyText = response.bodyText;
      cacheSet(cacheKey, bodyText, 1000 * 60 * 60);
    }

    const parsed = parseJsonBody(bodyText);
    if (!parsed.ok) {
      return {
        ok: false,
        failureClass: "malformed_response",
        message: parsed.message,
        checkedAt,
        durationMs: Date.now() - started,
      };
    }

    if (!Array.isArray(parsed.value) || parsed.value.length < 2 || !Array.isArray(parsed.value[1])) {
      // Empty series is valid — skip without inventing
      continue;
    }

    const row = parsed.value[1][0] as WbRow;
    const observation = buildObservation(row, meta, country.id, country.name, url, checkedAt);
    if (!observation) continue;
    if (publishObservation(observation)) published.push(observation);
  }

  setConnectorHealth({
    connectorId: WORLD_BANK_CONNECTOR_ID,
    sourceSlug: "world-bank",
    status: published.length > 0 ? "healthy" : "degraded",
    lastCheckedAt: checkedAt,
    lastSuccessAt: published.length > 0 ? checkedAt : null,
    message:
      published.length > 0
        ? `Retrieved ${published.length} verified WDI observation(s)`
        : "Request succeeded but no publishable observations (null values omitted)",
    liveCapable: true,
  });

  return {
    ok: true,
    observations: published,
    checkedAt,
    durationMs: Date.now() - started,
  };
}

export async function fetchWorldBankForRegistryCountries(
  countryIds: readonly string[] = countries.map((c) => c.id),
): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
  const started = Date.now();
  const all: VerifiedObservation[] = [];
  for (const id of countryIds) {
    const result = await fetchWorldBankForCountry(id);
    if (result.ok) all.push(...result.observations);
  }
  return {
    ok: true,
    observations: all,
    checkedAt,
    durationMs: Date.now() - started,
  };
}

export { countryByIso2 };
