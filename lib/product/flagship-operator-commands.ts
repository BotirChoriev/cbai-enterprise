/**
 * Flagship workflow operator — deterministic guide across Research Canvas and Mission OS.
 */

import { loadSmartIdeas } from "@/lib/research-canvas/smart-idea-store";
import { deriveCanvasStageStatuses, deriveActiveStageNextAction } from "@/lib/research-canvas/canvas-stage-status";
import { buildExternalSearchConsent } from "@/lib/research-canvas/privacy-boundary";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { HUMAN_DECISION_BOUNDARY } from "@/lib/product/product-constitution";
import { resolvePersistenceMode, persistenceModeDisclaimer } from "@/lib/product/persistence-mode";
import type { GenesisCommandMatch } from "@/lib/genesis/genesis-operator-commands";

import type { CanvasActionKey } from "@/lib/research-canvas/canvas-stage-status";

const ACTION_LABELS: Record<CanvasActionKey, string> = {
  createSmartIdea: "Create private Smart Idea",
  uploadArtifact: "Upload artifact",
  confirmInterpretation: "Confirm interpretation",
  buildIdeaModel: "Build Idea Model",
  approveMeasurementPlanning: "Approve measurement planning",
  createMeasurementPlan: "Create measurement plan",
  createPassport: "Create Measurement Passport",
  confirmExternalSearch: "Confirm external metadata search",
  searchProviders: "Search connected providers",
  reviewComparison: "Review comparison and gaps",
  createMission: "Create research mission",
  addExecutionTask: "Add execution task",
  recordDecision: "Record human decision",
  openStage: "Open this stage",
};

function canvasHref(smartIdeaId?: string): string {
  return smartIdeaId ? `/research/canvas?smartIdea=${smartIdeaId}` : "/research/canvas";
}

export function resolveFlagshipOperatorCommand(input: string): GenesisCommandMatch | null {
  const q = input.toLowerCase().trim();

  if (q.includes("what should i do next") || q.includes("what's next") || q.includes("whats next")) {
    const ideas = loadSmartIdeas();
    const active = ideas[ideas.length - 1] ?? null;
    const next = deriveActiveStageNextAction(active);
    const mission = getCurrentMission();
    const lines = [
      `Next: ${ACTION_LABELS[next]}`,
      active ? `Smart Idea: ${active.title} (${active.stage})` : "No Smart Idea yet — start on Research Canvas.",
      mission ? `Active mission: ${mission.problem.slice(0, 80)}` : "No active mission.",
      `Persistence: ${persistenceModeDisclaimer(resolvePersistenceMode())}`,
      HUMAN_DECISION_BOUNDARY,
    ];
    return {
      type: "answer",
      message: lines.join("\n"),
      href: active ? canvasHref(active.id) : "/research/canvas",
      matchedKeyword: "what should i do next",
    };
  }

  if (q.includes("what is blocked") || q.includes("what's blocked")) {
    const ideas = loadSmartIdeas();
    const active = ideas[ideas.length - 1] ?? null;
    const statuses = deriveCanvasStageStatuses(active);
    const blocked = statuses.filter((s) => s.blockedReason);
    const message =
      blocked.length > 0
        ? blocked.map((s) => `${s.stage}: ${s.blockedReason}`).join("\n")
        : "No blocked stages in current Smart Idea workflow.";
    return { type: "answer", message, href: canvasHref(active?.id), matchedKeyword: "what is blocked" };
  }

  if (q.includes("is external research authorized") || q.includes("external search authorized")) {
    const ideas = loadSmartIdeas();
    const active = ideas[ideas.length - 1];
    if (!active) {
      return {
        type: "answer",
        message: "No Smart Idea — external research not applicable.",
        href: "/research/canvas",
        matchedKeyword: "external research authorized",
      };
    }
    const consent = buildExternalSearchConsent(active);
    return {
      type: "answer",
      message: consent.confirmed
        ? `External metadata search authorized at ${consent.consentAt}. Sanitized concepts: ${consent.sanitizedQueryPreview.join(" · ")}. Private artifacts are not transmitted.`
        : "External research not authorized — confirm sanitized search on Research Canvas → DISCOVER.",
      href: canvasHref(active.id),
      matchedKeyword: "external research authorized",
    };
  }

  if (q.includes("continue my active mission") || q.includes("continue mission")) {
    const mission = getCurrentMission();
    if (!mission) {
      return {
        type: "answer",
        message: "No active mission — start a Mission or create one from Research Canvas.",
        href: "/my-work",
        matchedKeyword: "continue mission",
      };
    }
    return {
      type: "answer",
      message: `Continue mission: ${mission.problem}`,
      href: `/my-work?mission=${mission.id}`,
      matchedKeyword: "continue mission",
    };
  }

  if (q.includes("which decision requires a human") || q.includes("human decision")) {
    return {
      type: "answer",
      message: `Human decision required for: final research path, funding/collaboration selection, scientific claims, capability verification, and report conclusions.\n${HUMAN_DECISION_BOUNDARY}`,
      href: "/research/canvas",
      matchedKeyword: "human decision",
    };
  }

  return null;
}
