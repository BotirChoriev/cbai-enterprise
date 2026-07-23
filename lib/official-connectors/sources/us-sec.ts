/**
 * U.S. SEC company tickers — official public metadata (not financial metrics).
 * Endpoint: https://www.sec.gov/files/company_tickers.json
 * Only binds to companies already in the CBAI registry (no invented companies).
 */

import { companies } from "@/lib/companies";
import { officialFetch, parseJsonBody } from "@/lib/official-connectors/framework/http-client";
import { appendAudit } from "@/lib/official-connectors/framework/audit";
import { computeFreshness, isoNow } from "@/lib/official-connectors/framework/validate";
import { publishObservation, setConnectorHealth } from "@/lib/official-connectors/store";
import type { ConnectorAttemptResult, VerifiedObservation } from "@/lib/official-connectors/types";

export const US_SEC_CONNECTOR_ID = "conn-us-sec-tickers";
export const US_SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";

type SecTickerRow = { cik_str?: number; ticker?: string; title?: string };

export async function fetchUsSecRegistryMatches(): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
  const started = Date.now();
  appendAudit({ connectorId: US_SEC_CONNECTOR_ID, action: "fetch", detail: US_SEC_TICKERS_URL });

  const response = await officialFetch(US_SEC_TICKERS_URL, {
    timeoutMs: 15_000,
    retries: 1,
    headers: {
      "User-Agent": "CBAI-Enterprise PreviewBot contact@cbai.enterprise",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    setConnectorHealth({
      connectorId: US_SEC_CONNECTOR_ID,
      sourceSlug: "us-sec",
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
      durationMs: response.durationMs,
      httpStatus: response.status,
    };
  }

  const parsed = parseJsonBody(response.bodyText);
  if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null) {
    return {
      ok: false,
      failureClass: "malformed_response",
      message: "SEC tickers payload malformed",
      checkedAt,
      durationMs: response.durationMs,
    };
  }

  const rows = Object.values(parsed.value as Record<string, SecTickerRow>);
  const published: VerifiedObservation[] = [];

  for (const company of companies) {
    const match = rows.find(
      (row) =>
        typeof row.title === "string" &&
        (row.title.toLowerCase() === company.name.toLowerCase() ||
          row.title.toLowerCase().startsWith(company.name.toLowerCase())),
    );
    if (!match?.ticker || match.cik_str === undefined) continue;

    const observation: VerifiedObservation = {
      id: `sec:${company.id}:ticker`,
      indicatorCode: "sec-ticker",
      indicatorName: "SEC registered ticker",
      value: match.ticker,
      unit: "ticker",
      referencePeriod: checkedAt.slice(0, 10),
      entityType: "company",
      entityId: company.id,
      entityLabel: company.name,
      officialSource: "U.S. Securities and Exchange Commission",
      provenance: {
        sourceSlug: "us-sec",
        sourceName: "U.S. SEC company tickers",
        sourceUrl: US_SEC_TICKERS_URL,
        publicationDate: null,
        retrievedAt: checkedAt,
        lastCheckedAt: checkedAt,
        updateFrequency: "As published by SEC",
        jurisdiction: "United States",
        license: "SEC public disclosure",
        connectorId: US_SEC_CONNECTOR_ID,
        connectorVersion: "1.0.0",
      },
      verificationState: "verified",
      transformationNotes: `Matched CBAI registry company to SEC title “${match.title}” (CIK ${match.cik_str}). No financial metrics inferred.`,
      freshnessStatus: computeFreshness(checkedAt),
      confidenceBasis: "Exact/prefix title match against official SEC ticker directory; registry company required.",
      cbaiIndicatorSlug: "industry-classification",
    };

    if (publishObservation(observation)) published.push(observation);
  }

  setConnectorHealth({
    connectorId: US_SEC_CONNECTOR_ID,
    sourceSlug: "us-sec",
    status: published.length > 0 ? "healthy" : "degraded",
    lastCheckedAt: checkedAt,
    lastSuccessAt: published.length > 0 ? checkedAt : null,
    message: `Matched ${published.length} CBAI registry company(ies) to SEC tickers`,
    liveCapable: true,
  });

  return {
    ok: true,
    observations: published,
    checkedAt,
    durationMs: Date.now() - started,
  };
}
