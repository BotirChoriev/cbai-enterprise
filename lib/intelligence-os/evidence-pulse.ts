/**
 * Evidence Pulse — restrained evidence readiness states from real project data.
 * EPIC-06: delegates to Evidence Runtime for conflicts, freshness, and consensus.
 */

import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import { loadProjects } from "@/lib/project/project-store";
import type { Mission } from "@/lib/intelligence-os/mission.types";

export type EvidencePulseState =
  | "available"
  | "partial"
  | "missing"
  | "conflicting"
  | "outdated"
  | "unverified";

export type EvidencePulseLimitationKey =
  | "noProject"
  | "noRefs"
  | "conflicting"
  | "outdated"
  | "unverified"
  | "deviceLocal";

export type EvidencePulseReading = {
  readonly state: EvidencePulseState;
  readonly label: string;
  readonly count: number;
  /** @deprecated Prefer limitationKey + i18n in UI. Kept for scripts and tooltips. */
  readonly limitation: string;
  readonly limitationKey: EvidencePulseLimitationKey;
  readonly consensus: ReturnType<typeof deriveEvidenceRuntime>["consensus"];
  readonly conflictCount: number;
  readonly outdatedCount: number;
};

export function deriveEvidencePulse(mission: Mission | null): EvidencePulseReading {
  const runtime = deriveEvidenceRuntime(mission);
  const project = mission?.projectId
    ? loadProjects().find((p) => p.id === mission.projectId)
    : null;

  if (!project) {
    return {
      state: "missing",
      label: "No project linked to this mission",
      count: 0,
      limitation: "Link a project or add evidence to begin.",
      limitationKey: "noProject",
      consensus: "none",
      conflictCount: 0,
      outdatedCount: 0,
    };
  }

  const refs = runtime.records;
  if (refs.length === 0) {
    return {
      state: "missing",
      label: mission?.evidenceMissing || "No evidence linked yet",
      count: 0,
      limitation: "Your references only — nothing is fabricated.",
      limitationKey: "noRefs",
      consensus: "none",
      conflictCount: 0,
      outdatedCount: 0,
    };
  }

  const conflictCount = runtime.conflicts.length;
  const outdatedCount = runtime.freshnessCounts.outdated;

  if (conflictCount > 0) {
    return {
      state: "conflicting",
      label: `${conflictCount} potential conflict${conflictCount === 1 ? "" : "s"} among ${refs.length} reference${refs.length === 1 ? "" : "s"}`,
      count: refs.length,
      limitation: "Review conflicting sources before you decide.",
      limitationKey: "conflicting",
      consensus: runtime.consensus,
      conflictCount,
      outdatedCount,
    };
  }

  if (outdatedCount > 0 && outdatedCount === refs.length) {
    return {
      state: "outdated",
      label: `${outdatedCount} reference${outdatedCount === 1 ? "" : "s"} older than one year`,
      count: refs.length,
      limitation: "Some sources may need refresh.",
      limitationKey: "outdated",
      consensus: runtime.consensus,
      conflictCount,
      outdatedCount,
    };
  }

  const withSource = refs.filter((r) => r.evidence.originalSource?.trim()).length;
  if (withSource === 0) {
    return {
      state: "unverified",
      label: `${refs.length} reference${refs.length === 1 ? "" : "s"} without verified source URLs`,
      count: refs.length,
      limitation: "Add source URLs where you can.",
      limitationKey: "unverified",
      consensus: runtime.consensus,
      conflictCount,
      outdatedCount,
    };
  }

  if (withSource < refs.length || outdatedCount > 0) {
    const parts: string[] = [];
    if (withSource < refs.length) parts.push(`${withSource} of ${refs.length} have source URLs`);
    if (outdatedCount > 0) parts.push(`${outdatedCount} may be outdated`);
    return {
      state: "partial",
      label: parts.join(" · "),
      count: refs.length,
      limitation: runtime.limitation,
      limitationKey: "deviceLocal",
      consensus: runtime.consensus,
      conflictCount,
      outdatedCount,
    };
  }

  return {
    state: "available",
    label: `${refs.length} evidence reference${refs.length === 1 ? "" : "s"} linked`,
    count: refs.length,
    limitation: runtime.limitation,
    limitationKey: "deviceLocal",
    consensus: runtime.consensus,
    conflictCount,
    outdatedCount,
  };
}
