/**
 * Safe missing-source fallback — never invents evidence.
 */

import { getFoundationSourceBySlug } from "@/lib/official-connector-foundation/source-registry";
import type { MissingSourceFallback } from "@/lib/official-connector-foundation/types";

export function missingSourceFallback(params: {
  readonly sourceSlug: string;
  readonly indicatorName: string;
  readonly jurisdiction?: string;
}): MissingSourceFallback {
  const source = getFoundationSourceBySlug(params.sourceSlug);
  if (!source) {
    return {
      status: "Missing",
      reason: `No foundation registry entry for source slug "${params.sourceSlug}".`,
      expectedSource: params.sourceSlug,
      nextStep: "Register the official source in Phase 1 registry before connecting.",
    };
  }

  if (source.connectionStatus === "planned" || source.connectionStatus === "ready") {
    return {
      status: "Awaiting official source",
      reason: `${source.sourceName} is registered but not connected. Indicator "${params.indicatorName}" is not fabricated.`,
      expectedSource: source.sourceName,
      nextStep: `Connect ${source.sourceName} via verified retrieval; until then leave coverage as awaiting official source.`,
    };
  }

  if (source.connectionStatus === "connected" || source.connectionStatus === "live") {
    return {
      status: "Not checked",
      reason: `Source ${source.sourceName} is connected but indicator "${params.indicatorName}" was not retrieved for this query.`,
      expectedSource: source.sourceName,
      nextStep: "Run the connector check for this jurisdiction/indicator without inventing values.",
    };
  }

  return {
    status: "Planned",
    reason: `${source.sourceName} connection status is ${source.connectionStatus}.`,
    expectedSource: source.sourceName,
    nextStep: "Keep Planned / Missing until verified retrieval succeeds.",
  };
}

export function isSafeEmptyCoverage(fallback: MissingSourceFallback): boolean {
  return (
    fallback.status === "Missing" ||
    fallback.status === "Awaiting official source" ||
    fallback.status === "Planned" ||
    fallback.status === "Not checked"
  );
}
