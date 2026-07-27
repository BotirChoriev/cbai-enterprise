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

export type EvidencePulseLabelKey =
  | "pulseNoProject"
  | "pulseNoEvidence"
  | "pulseConflicts"
  | "pulseOutdated"
  | "pulseUnverified"
  | "pulsePartialSources"
  | "pulsePartialOutdated"
  | "pulseLinked";

/** Structured label part: translate `experienceEngineering.{key}` with params at render time. */
export type EvidencePulseLabelPart = {
  readonly key: EvidencePulseLabelKey;
  readonly params?: Readonly<Record<string, string>>;
};

export type EvidencePulseReading = {
  readonly state: EvidencePulseState;
  /** @deprecated English fallback. Prefer labelParts + i18n in UI; user content stays in label. */
  readonly label: string;
  /**
   * Structured i18n parts joined with " · " at render time. Empty when `label` carries
   * user-entered content (e.g. mission.evidenceMissing), which must never be machine-translated.
   */
  readonly labelParts: readonly EvidencePulseLabelPart[];
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
      labelParts: [{ key: "pulseNoProject" }],
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
      labelParts: mission?.evidenceMissing?.trim() ? [] : [{ key: "pulseNoEvidence" }],
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
      labelParts: [
        { key: "pulseConflicts", params: { count: String(conflictCount), total: String(refs.length) } },
      ],
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
      labelParts: [{ key: "pulseOutdated", params: { count: String(outdatedCount) } }],
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
      labelParts: [{ key: "pulseUnverified", params: { count: String(refs.length) } }],
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
    const labelParts: EvidencePulseLabelPart[] = [];
    if (withSource < refs.length) {
      parts.push(`${withSource} of ${refs.length} have source URLs`);
      labelParts.push({
        key: "pulsePartialSources",
        params: { withSource: String(withSource), total: String(refs.length) },
      });
    }
    if (outdatedCount > 0) {
      parts.push(`${outdatedCount} may be outdated`);
      labelParts.push({ key: "pulsePartialOutdated", params: { count: String(outdatedCount) } });
    }
    return {
      state: "partial",
      label: parts.join(" · "),
      labelParts,
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
    labelParts: [{ key: "pulseLinked", params: { count: String(refs.length) } }],
    count: refs.length,
    limitation: runtime.limitation,
    limitationKey: "deviceLocal",
    consensus: runtime.consensus,
    conflictCount,
    outdatedCount,
  };
}
