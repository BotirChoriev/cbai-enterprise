/**
 * EPIC-06 — Trust as a property of every evidence-bearing object.
 */

import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import type { EvidenceTrustSurface } from "@/lib/evidence-runtime/types";
import type { Mission } from "@/lib/intelligence-os/mission.types";

export function deriveMissionEvidenceTrustSurface(mission: Mission | null): EvidenceTrustSurface {
  const runtime = deriveEvidenceRuntime(mission);

  if (!runtime.projectId || runtime.records.length === 0) {
    return {
      whatWeKnow: mission?.evidenceHave?.trim() || "No evidence linked to the active mission yet.",
      howWeKnow: "User-authored project evidence references in local storage.",
      whoVerified: "No human verification recorded.",
      whenVerified: "Not applicable until sources are linked and reviewed.",
      whyTrust: "Trust is limited — add traceable sources before drawing conclusions.",
      whatMissing: mission?.evidenceMissing?.trim() || "Evidence references and source URLs.",
      whatContradicts: "None detected — insufficient evidence to compare.",
      needsResearch: mission?.evidenceMissing?.trim() || "Frame questions and link independent sources.",
    };
  }

  const labels = runtime.records.map((r) => r.evidence.label).join("; ");
  const sources = runtime.records
    .map((r) => r.evidence.originalSource)
    .filter(Boolean)
    .join("; ");

  return {
    whatWeKnow: `${runtime.records.length} linked reference${runtime.records.length === 1 ? "" : "s"}: ${labels}`,
    howWeKnow: sources
      ? `Traceable via user-provided source URLs (${runtime.humanValidationPartial} pending review).`
      : "References exist but lack source URLs — provenance incomplete.",
    whoVerified: runtime.humanValidationPartial > 0 ? "Human reviewer (partial — URLs provided, not machine-verified)" : "Pending human source review",
    whenVerified: runtime.freshnessCounts.outdated > 0
      ? `${runtime.freshnessCounts.outdated} reference(s) may be outdated — review dates.`
      : "Based on reference creation timestamps in local storage.",
    whyTrust: runtime.consensus === "conflicted"
      ? "Trust is reduced — conflicting sources detected. Human judgment required."
      : runtime.consensus === "aligned"
        ? "Sources align — still requires human scientific judgment."
        : "Partial trust — complete verification and resolve gaps.",
    whatMissing: runtime.missingKnowledge.slice(0, 3).join(" ") || "None documented.",
    whatContradicts:
      runtime.conflicts.length > 0
        ? `${runtime.conflicts.length} conflicting pair(s) — review before concluding.`
        : "No declared or detected conflicts.",
    needsResearch:
      mission?.evidenceMissing?.trim() ||
      (runtime.humanValidationPending > 0 ? "Add source URLs and independent references." : "Continue validation and impact review."),
  };
}
