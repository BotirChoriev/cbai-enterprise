/**
 * Evidence Pulse — restrained evidence readiness states from real project data.
 */

import { loadProjectEvidence, loadProjects } from "@/lib/project/project-store";
import type { Mission } from "@/lib/intelligence-os/mission.types";

export type EvidencePulseState =
  | "available"
  | "partial"
  | "missing"
  | "conflicting"
  | "outdated"
  | "unverified";

export type EvidencePulseReading = {
  readonly state: EvidencePulseState;
  readonly label: string;
  readonly count: number;
  readonly limitation: string;
};

export function deriveEvidencePulse(mission: Mission | null): EvidencePulseReading {
  const project = mission?.projectId
    ? loadProjects().find((p) => p.id === mission.projectId)
    : null;

  if (!project) {
    return {
      state: "missing",
      label: "No project linked to this mission",
      count: 0,
      limitation: "Link a project or add evidence to begin the evidence pulse.",
    };
  }

  const refs = loadProjectEvidence(project.id);
  if (refs.length === 0) {
    return {
      state: "missing",
      label: mission?.evidenceMissing || "No evidence linked yet",
      count: 0,
      limitation: "Evidence refs are user-authored — nothing is fabricated.",
    };
  }

  const withSource = refs.filter((r) => r.sourceUrl?.trim()).length;
  if (withSource === 0) {
    return {
      state: "unverified",
      label: `${refs.length} reference${refs.length === 1 ? "" : "s"} without verified source URLs`,
      count: refs.length,
      limitation: "Source URLs enable verification — add them where available.",
    };
  }

  if (withSource < refs.length) {
    return {
      state: "partial",
      label: `${withSource} of ${refs.length} references have source URLs`,
      count: refs.length,
      limitation: "Partial verification — live source integration not connected.",
    };
  }

  return {
    state: "available",
    label: `${refs.length} evidence reference${refs.length === 1 ? "" : "s"} linked`,
    count: refs.length,
    limitation: "Local references only — live API verification not connected.",
  };
}
