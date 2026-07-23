/**
 * U.S. Census & BEA — require official API keys.
 * Without credentials: awaiting_credentials (never fake connected success).
 */

import { isoNow } from "@/lib/official-connectors/framework/validate";
import { setConnectorHealth } from "@/lib/official-connectors/store";
import type { ConnectorAttemptResult } from "@/lib/official-connectors/types";

export const US_CENSUS_CONNECTOR_ID = "conn-us-census";
export const US_BEA_CONNECTOR_ID = "conn-us-bea";

export async function fetchUsCensus(apiKey?: string): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
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

  // Key present — still require a verified endpoint path in a follow-up; do not invent.
  setConnectorHealth({
    connectorId: US_CENSUS_CONNECTOR_ID,
    sourceSlug: "us-census",
    status: "planned",
    lastCheckedAt: checkedAt,
    lastSuccessAt: null,
    message: "Census key present but series mapping not yet activated in Preview",
    liveCapable: false,
  });
  return {
    ok: false,
    failureClass: "not_implemented",
    message: "Census series mapping not activated — refusing to invent values",
    checkedAt,
    durationMs: 0,
  };
}

export async function fetchUsBea(apiKey?: string): Promise<ConnectorAttemptResult> {
  const checkedAt = isoNow();
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

  setConnectorHealth({
    connectorId: US_BEA_CONNECTOR_ID,
    sourceSlug: "us-bea",
    status: "planned",
    lastCheckedAt: checkedAt,
    lastSuccessAt: null,
    message: "BEA key present but NIPA series mapping not yet activated in Preview",
    liveCapable: false,
  });
  return {
    ok: false,
    failureClass: "not_implemented",
    message: "BEA series mapping not activated — refusing to invent values",
    checkedAt,
    durationMs: 0,
  };
}
