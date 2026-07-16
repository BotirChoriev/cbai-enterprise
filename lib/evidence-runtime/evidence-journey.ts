/**
 * EPIC-06 — Evidence journey stages for mission visualization.
 */

import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import type { EvidenceJourneyStage } from "@/lib/evidence-runtime/types";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { loadProjectQuestions } from "@/lib/project/project-store";

export function deriveEvidenceJourney(mission: Mission | null): readonly EvidenceJourneyStage[] {
  const runtime = deriveEvidenceRuntime(mission);
  const projectId = runtime.projectId;
  const q = projectId ? `?project=${projectId}` : "";
  const questions = projectId ? loadProjectQuestions(projectId).length : 0;
  const readiness = projectId ? deriveReportReadiness(projectId) : null;

  return [
    {
      id: "question",
      label: "Question",
      status: questions > 0 || Boolean(mission?.whyExists?.trim()) ? "complete" : "missing",
      detail: questions > 0 ? `${questions} open question(s)` : "Frame the inquiry",
      href: projectId ? `/my-work${q}#project-questions` : "/my-work",
    },
    {
      id: "evidence",
      label: "Evidence",
      status:
        runtime.records.length === 0 ? "missing" : runtime.humanValidationPending > 0 ? "partial" : "complete",
      detail:
        runtime.records.length > 0
          ? `${runtime.records.length} reference(s)`
          : "Link evidence to the project",
      href: projectId ? `/my-work${q}#project-evidence` : "/knowledge",
    },
    {
      id: "provenance",
      label: "Provenance",
      status:
        runtime.records.length === 0
          ? "missing"
          : runtime.humanValidationPartial > 0
            ? "partial"
            : runtime.humanValidationPending === runtime.records.length
              ? "missing"
              : "partial",
      detail: `${runtime.humanValidationPartial} with source URLs`,
      href: "/knowledge",
    },
    {
      id: "validation",
      label: "Validation",
      status:
        runtime.conflicts.length > 0
          ? "attention"
          : runtime.consensus === "aligned"
            ? "complete"
            : runtime.records.length > 0
              ? "partial"
              : "missing",
      detail:
        runtime.conflicts.length > 0
          ? `${runtime.conflicts.length} conflict(s) detected`
          : "Human review — machine verification not connected",
      href: "/trust",
    },
    {
      id: "impact",
      label: "Impact link",
      status: readiness?.canClaimReadiness ? "complete" : readiness?.state === "impact_required" ? "missing" : "partial",
      detail: readiness?.limitation ?? "Complete humanity impact review",
      href: projectId ? `/my-work${q}#human-impact` : "/my-work",
    },
    {
      id: "report",
      label: "Report readiness",
      status: readiness?.canClaimReadiness ? "complete" : readiness ? "partial" : "missing",
      detail: readiness?.state ?? "Not assessed",
      href: projectId ? `/my-work${q}#project-report` : "/reports",
    },
  ];
}
