/**
 * Research Canvas stage navigation — panel targets and prerequisite routing.
 */

import type { ResearchCanvasStage } from "@/lib/research-canvas/research-canvas-types";
import type { CanvasStageStatus } from "@/lib/research-canvas/canvas-stage-status";

export function stagePanelId(stage: ResearchCanvasStage): string {
  return `research-canvas-stage-${stage}`;
}

export function prerequisiteStageFor(
  stage: ResearchCanvasStage,
  status: CanvasStageStatus | undefined,
): ResearchCanvasStage | null {
  if (!status?.blockedReasonKey && !status?.blockedReason) return null;
  switch (stage) {
    case "INTERPRET":
      return status.blockedReasonKey === "completeIdeaFirst" ? "IDEA" : "IDEA";
    case "MEASURE":
      return "INTERPRET";
    case "COMPARE":
      return "DISCOVER";
    case "MISSION":
      return "INTERPRET";
    case "EXECUTE":
      return "MISSION";
    case "DECIDE":
      return status.blockedReasonKey === "missionContext" ? "MISSION" : null;
    default:
      return null;
  }
}

export const CANVAS_STAGES: ResearchCanvasStage[] = [
  "IDEA",
  "INTERPRET",
  "MEASURE",
  "DISCOVER",
  "COMPARE",
  "MISSION",
  "EXECUTE",
  "DECIDE",
];
