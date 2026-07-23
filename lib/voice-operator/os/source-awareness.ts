/**
 * Source-awareness replies — explain Connected / Missing / Coverage / Confidence from registry.
 */

import { buildGlobalStatus } from "@/lib/enterprise/global-status";
import { buildTrustOperatingModel } from "@/lib/enterprise/trust-operating";
import { buildGovernanceUserMetrics } from "@/lib/enterprise/governance-user-metrics";

const SOURCE_AWARENESS =
  /\b(connected sources?|missing sources?|evidence coverage|confidence|verification status|source health|official sources?|show (me )?(the )?sources|source awareness|how (complete|ready) is|coverage %|trust score)\b/i;

export type SourceAwarenessResult = {
  readonly assistantText: string;
  readonly href: string;
};

export function detectSourceAwarenessIntent(raw: string): SourceAwarenessResult | null {
  if (!SOURCE_AWARENESS.test(raw)) return null;

  const status = buildGlobalStatus();
  const trust = buildTrustOperatingModel();
  const metrics = buildGovernanceUserMetrics();
  const verification = metrics.find((m) => m.id === "verification-status");

  const coverage =
    status.coveragePercent === null ? "not assessed" : `${status.coveragePercent}%`;

  const assistantText = [
    `Connected sources: ${status.connectedSources} of ${status.totalSources}.`,
    `Missing sources: ${status.missingSources} (${status.plannedSources} planned).`,
    `Evidence coverage: ${coverage} — ${status.coverageBasis}.`,
    `Confidence: ${status.confidence}.`,
    `Verification: ${verification?.value ?? "Not assessed"} — ${verification?.detail ?? ""}.`,
    `Evidence health: ${status.evidenceHealth}.`,
    `Freshness: ${trust.evidenceFreshness}.`,
    "I never invent missing values — open Trust or Evidence to review the catalog.",
  ].join(" ");

  const href = /\btrust\b/i.test(raw) ? "/trust" : "/knowledge";
  return { assistantText, href };
}
