/**
 * World Bank WDI adapter — first live connector on Official Connector Foundation.
 * Endpoint: https://api.worldbank.org/v2/country/{iso2}/indicator/{indicator}?format=json&per_page=1
 *
 * Pipeline: fetch → validation → normalization → provenance → store.
 * Never invents values. Marks World Bank Connected only after verified publish.
 */

import { countries } from "@/lib/countries";
import { fetchWithFoundationAdapter } from "@/lib/official-connector-foundation/fetch-adapter";
import type { FetchLike } from "@/lib/official-connector-foundation/fetch-adapter";
import { parseJsonResponse } from "@/lib/official-connector-foundation/validate";
import {
  normalizeValidatedObservation,
  deriveFreshnessState,
} from "@/lib/official-connector-foundation/normalize";
import { getFoundationSourceBySlug } from "@/lib/official-connector-foundation/source-registry";
import { foundationAuditLog } from "@/lib/official-connector-foundation/audit";
import { FoundationObservationStore } from "@/lib/official-connector-foundation/store";
import { missingSourceFallback } from "@/lib/official-connector-foundation/missing-source";
import type {
  ValidatedObservation,
  FailureClass,
} from "@/lib/official-connector-foundation/types";
import {
  getWorldBankRuntimeStatus,
  markWorldBankChecked,
  markWorldBankConnected,
  markWorldBankFailure,
} from "@/lib/official-connector-foundation/runtime-status";

export const WORLD_BANK_WDI_CONNECTOR_ID = "fconn-world-bank-wdi";
export const WORLD_BANK_WDI_API_BASE = "https://api.worldbank.org/v2";

/** Freshness window for WDI annual series (~14 months). */
export const WDI_FRESHNESS_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 425;

export const WORLD_BANK_WDI_INDICATORS = [
  {
    code: "NY.GDP.MKTP.CD",
    name: "GDP (current US$)",
    unit: "current US$",
  },
  {
    code: "SP.POP.TOTL",
    name: "Population, total",
    unit: "people",
  },
  {
    code: "FP.CPI.TOTL.ZG",
    name: "Inflation, consumer prices (annual %)",
    unit: "percent",
  },
  {
    code: "SL.UEM.TOTL.ZS",
    name: "Unemployment, total (% of total labor force)",
    unit: "percent of labor force",
  },
] as const;

export type WorldBankWdiIndicatorCode = (typeof WORLD_BANK_WDI_INDICATORS)[number]["code"];

export const foundationWdiStore = new FoundationObservationStore();

export type WdiFetchResult =
  | {
      readonly ok: true;
      readonly observations: readonly ValidatedObservation[];
      readonly connected: boolean;
      readonly checkedAt: string;
      readonly skippedNull: number;
    }
  | {
      readonly ok: false;
      readonly failureClass: FailureClass;
      readonly message: string;
      readonly connected: boolean;
      readonly checkedAt: string;
      readonly fallback: ReturnType<typeof missingSourceFallback>;
    };

type WbRow = {
  indicator?: { id?: string; value?: string };
  country?: { id?: string; value?: string };
  countryiso3code?: string;
  date?: string;
  value?: number | null;
};

function resolveCountry(countryIdOrIso2: string) {
  const key = countryIdOrIso2.trim().toLowerCase();
  return (
    countries.find((c) => c.id === key) ??
    countries.find((c) => c.code.toLowerCase() === key) ??
    null
  );
}

export function isSupportedWdiIndicator(code: string): code is WorldBankWdiIndicatorCode {
  return WORLD_BANK_WDI_INDICATORS.some((item) => item.code === code);
}

export function buildWdiEndpoint(iso2: string, indicatorCode: string): string {
  return `${WORLD_BANK_WDI_API_BASE}/country/${iso2.toUpperCase()}/indicator/${indicatorCode}?format=json&per_page=1`;
}

/**
 * Validate a single WDI JSON payload (World Bank returns [meta, rows[]]).
 * Rejects malformed shapes, invalid years, and null values (no invention).
 */
export function validateWdiPayload(
  raw: unknown,
  expectedCode: string
):
  | { ok: true; row: WbRow; year: string; value: number }
  | { ok: false; failureClass: FailureClass; message: string } {
  if (!Array.isArray(raw) || raw.length < 2) {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "WDI payload must be a two-element array [meta, rows]",
    };
  }
  const rows = raw[1];
  if (!Array.isArray(rows)) {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "WDI rows element must be an array",
    };
  }
  if (rows.length === 0) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "WDI returned empty series",
    };
  }
  const row = rows[0] as WbRow;
  if (!row || typeof row !== "object") {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "WDI row is not an object",
    };
  }
  const code = row.indicator?.id;
  if (code && code !== expectedCode) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: `Indicator mismatch: expected ${expectedCode}, got ${code}`,
    };
  }
  if (row.value === null || row.value === undefined) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "Null WDI value — not published",
    };
  }
  if (typeof row.value !== "number" || !Number.isFinite(row.value)) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: "Non-finite WDI value — not published",
    };
  }
  const year = typeof row.date === "string" ? row.date.trim() : "";
  if (!/^\d{4}$/.test(year)) {
    return {
      ok: false,
      failureClass: "validation_failed",
      message: `Invalid WDI year: ${row.date ?? "(missing)"}`,
    };
  }
  return { ok: true, row, year, value: row.value };
}

export async function fetchWorldBankWdiForCountry(
  countryId: string,
  options: {
    readonly indicatorCodes?: readonly string[];
    readonly fetchImpl?: FetchLike;
    readonly store?: FoundationObservationStore;
  } = {}
): Promise<WdiFetchResult> {
  const checkedAt = new Date().toISOString();
  const source = getFoundationSourceBySlug("world-bank");
  if (!source) {
    return {
      ok: false,
      failureClass: "missing_source",
      message: "World Bank missing from foundation registry",
      connected: false,
      checkedAt,
      fallback: missingSourceFallback({
        sourceSlug: "world-bank",
        indicatorName: "WDI",
      }),
    };
  }

  const country = resolveCountry(countryId);
  if (!country) {
    markWorldBankFailure(checkedAt, `Unsupported ISO/country: ${countryId}`);
    foundationAuditLog.record(
      WORLD_BANK_WDI_CONNECTOR_ID,
      "reject",
      `unsupported jurisdiction ${countryId}`,
      "unsupported_jurisdiction"
    );
    return {
      ok: false,
      failureClass: "unsupported_jurisdiction",
      message: `Country "${countryId}" is not in the CBAI ISO registry`,
      connected: isConnected(),
      checkedAt,
      fallback: missingSourceFallback({
        sourceSlug: "world-bank",
        indicatorName: "WDI",
        jurisdiction: countryId,
      }),
    };
  }

  const codes = options.indicatorCodes ?? WORLD_BANK_WDI_INDICATORS.map((i) => i.code);
  for (const code of codes) {
    if (!isSupportedWdiIndicator(code)) {
      markWorldBankFailure(checkedAt, `Invalid indicator ${code}`);
      foundationAuditLog.record(
        WORLD_BANK_WDI_CONNECTOR_ID,
        "reject",
        `invalid indicator ${code}`,
        "validation_failed"
      );
      return {
        ok: false,
        failureClass: "validation_failed",
        message: `Indicator "${code}" is not in the initial WDI support set`,
        connected: isConnected(),
        checkedAt,
        fallback: missingSourceFallback({
          sourceSlug: "world-bank",
          indicatorName: code,
          jurisdiction: country.name,
        }),
      };
    }
  }

  const store = options.store ?? foundationWdiStore;
  const published: ValidatedObservation[] = [];
  let skippedNull = 0;
  markWorldBankChecked(checkedAt, "Fetching World Bank WDI…");

  for (const code of codes) {
    const meta = WORLD_BANK_WDI_INDICATORS.find((i) => i.code === code)!;
    const url = buildWdiEndpoint(country.code, code);
    foundationAuditLog.record(WORLD_BANK_WDI_CONNECTOR_ID, "fetch", url);

    const fetchResult = await fetchWithFoundationAdapter(
      url,
      { timeoutMs: 12_000, maxRetries: 2, retryDelayMs: 200 },
      options.fetchImpl
    );

    if (!fetchResult.ok) {
      markWorldBankFailure(checkedAt, fetchResult.message);
      foundationAuditLog.record(
        WORLD_BANK_WDI_CONNECTOR_ID,
        "reject",
        fetchResult.message,
        fetchResult.failureClass
      );
      // Keep already-published observations; overall attempt failed for this indicator.
      if (published.length === 0) {
        return {
          ok: false,
          failureClass: fetchResult.failureClass,
          message: fetchResult.message,
          connected: isConnected(),
          checkedAt,
          fallback: missingSourceFallback({
            sourceSlug: "world-bank",
            indicatorName: meta.name,
            jurisdiction: country.name,
          }),
        };
      }
      continue;
    }

    const parsed = parseJsonResponse(fetchResult.bodyText);
    if (!parsed.ok) {
      foundationAuditLog.record(
        WORLD_BANK_WDI_CONNECTOR_ID,
        "reject",
        parsed.message,
        parsed.failureClass
      );
      if (published.length === 0) {
        markWorldBankFailure(checkedAt, parsed.message);
        return {
          ok: false,
          failureClass: parsed.failureClass,
          message: parsed.message,
          connected: isConnected(),
          checkedAt,
          fallback: missingSourceFallback({
            sourceSlug: "world-bank",
            indicatorName: meta.name,
            jurisdiction: country.name,
          }),
        };
      }
      continue;
    }

    foundationAuditLog.record(WORLD_BANK_WDI_CONNECTOR_ID, "validate", code);
    const validated = validateWdiPayload(parsed.data, code);
    if (!validated.ok) {
      if (validated.message.includes("Null")) skippedNull += 1;
      foundationAuditLog.record(
        WORLD_BANK_WDI_CONNECTOR_ID,
        "reject",
        validated.message,
        validated.failureClass
      );
      continue;
    }

    const retrievedAt = fetchResult.retrievedAt;
    const freshnessState = deriveFreshnessState(retrievedAt, WDI_FRESHNESS_MAX_AGE_MS);
    foundationAuditLog.record(WORLD_BANK_WDI_CONNECTOR_ID, "normalize", `${code}:${validated.year}`);

    const draft = normalizeValidatedObservation({
      source,
      indicatorCode: code,
      indicatorName: meta.name,
      value: validated.value,
      unit: meta.unit,
      referencePeriod: validated.year,
      entityType: "country",
      entityId: country.id,
      entityLabel: country.name,
      datasetOrEndpoint: url,
      jurisdiction: country.code,
      retrievedAt,
      lastCheckedAt: checkedAt,
      publicationDate: `${validated.year}-01-01`,
      transformationNotes: "Direct WDI observation via Official Connector Foundation; no estimation.",
      verificationState: "unverified",
      freshnessState,
      connectorHealth: "healthy",
    });

    const publish = store.publishValidated(draft);
    if (!publish.ok) {
      foundationAuditLog.record(
        WORLD_BANK_WDI_CONNECTOR_ID,
        "reject",
        publish.message,
        "duplicate_rejected"
      );
      continue;
    }
    foundationAuditLog.record(WORLD_BANK_WDI_CONNECTOR_ID, "publish", publish.observation.id);
    published.push(publish.observation);
  }

  if (published.length === 0) {
    const message =
      skippedNull > 0
        ? `WDI returned null/empty for requested indicators — values not invented (${skippedNull} null skip(s))`
        : "No verified WDI observations published";
    markWorldBankFailure(checkedAt, message);
    return {
      ok: false,
      failureClass: "validation_failed",
      message,
      connected: isConnected(),
      checkedAt,
      fallback: missingSourceFallback({
        sourceSlug: "world-bank",
        indicatorName: "WDI",
        jurisdiction: country.name,
      }),
    };
  }

  markWorldBankConnected(checkedAt);
  return {
    ok: true,
    observations: published,
    connected: true,
    checkedAt,
    skippedNull,
  };
}

function isConnected(): boolean {
  return getWorldBankRuntimeStatus().status === "connected";
}
