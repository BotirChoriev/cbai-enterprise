/**
 * Research result integrity — separate metadata facts from inferred project status.
 */

import type { DiscoveryResultRecord } from "@/lib/research-canvas/research-canvas-types";

export const RESEARCH_AVAILABILITY_STATES = [
  "publication discovered",
  "metadata available",
  "full text available",
  "method described",
  "result reported",
  "result independently replicated",
  "result disputed",
  "negative result",
  "inconclusive result",
  "retracted/corrected",
  "status unknown",
] as const;

export type ResearchAvailabilityState = (typeof RESEARCH_AVAILABILITY_STATES)[number];

export function deriveAvailabilityFromRecord(record: DiscoveryResultRecord): ResearchAvailabilityState[] {
  const states: ResearchAvailabilityState[] = ["publication discovered"];
  if (record.doi || record.title) states.push("metadata available");
  if (record.abstract) states.push("method described");
  if (record.openAccessStatus?.includes("open")) states.push("full text available");
  if (record.projectStatus === "Negative Result") states.push("negative result");
  if (record.projectStatus === "Inconclusive") states.push("inconclusive result");
  if (record.projectStatus === "Status Unknown") states.push("status unknown");
  return [...new Set(states)];
}

export function assertNoSuccessFromTitleOnly(input: {
  title: string;
  statusEvidence: string;
}): { ok: boolean; limitation: string } {
  return {
    ok: false,
    limitation:
      input.statusEvidence ||
      "Publication title alone does not prove project success, failure, or replication — bibliographic metadata only.",
  };
}

export function personRelevanceDisclaimer(): string {
  return "People listed here appear in connected publication metadata — current employment or activity is not inferred without dated evidence.";
}
