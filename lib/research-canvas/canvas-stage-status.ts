/**
 * Research Canvas stage status — honest prerequisites and next actions.
 */

import type { ResearchCanvasStage, SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import { loadMeasurementPlans, loadMeasurementPassports } from "@/lib/research-canvas/measurement-store";
import { loadDiscoveryResults } from "@/lib/research-canvas/research-discovery";
import type { ProductStatusLabel } from "@/lib/product/status-vocabulary";

export type CanvasStageStatus = {
  readonly stage: ResearchCanvasStage;
  readonly purpose: string;
  readonly status: ProductStatusLabel;
  readonly primaryAction: string;
  readonly blockedReason: string | null;
  readonly completed: boolean;
  readonly nextAction: string;
};

const STAGE_PURPOSES: Record<ResearchCanvasStage, string> = {
  IDEA: "Record a private Smart Idea and optional artifact.",
  INTERPRET: "Confirm or correct what CBAI extracted before scientific claims.",
  MEASURE: "Define measurand, method, units, and measurement records.",
  DISCOVER: "Search connected open-science metadata with sanitized queries.",
  COMPARE: "Compare your idea with sourced prior work and knowledge gaps.",
  MISSION: "Create or link a research Mission and Project.",
  EXECUTE: "Track tasks, progress, blockers, evidence, and reasoning.",
  DECIDE: "Review options and record your human decision.",
};

function normalizeStage(stage: string): ResearchCanvasStage {
  if (stage === "PLAN") return "EXECUTE";
  return stage as ResearchCanvasStage;
}

export function deriveCanvasStageStatuses(idea: SmartIdea | null): CanvasStageStatus[] {
  const stages: ResearchCanvasStage[] = [
    "IDEA",
    "INTERPRET",
    "MEASURE",
    "DISCOVER",
    "COMPARE",
    "MISSION",
    "EXECUTE",
    "DECIDE",
  ];

  if (!idea) {
    return stages.map((stage) => ({
      stage,
      purpose: STAGE_PURPOSES[stage],
      status: stage === "IDEA" ? "Ready for input" : "Draft",
      primaryAction: stage === "IDEA" ? "Create private Smart Idea" : "Complete IDEA first",
      blockedReason: stage === "IDEA" ? null : "No Smart Idea selected.",
      completed: false,
      nextAction: "Create a private Smart Idea on this page.",
    }));
  }

  const confirmed = idea.extractedItems.filter((e) => e.confirmationStatus === "Confirmed");
  const pendingConfirm = idea.extractedItems.filter(
    (e) => e.confirmationStatus === "Awaiting Human Confirmation" || e.confirmationStatus === "Machine-Extracted",
  );
  const plans = loadMeasurementPlans(idea.id);
  const passports = loadMeasurementPassports(idea.id);
  const discoveries = loadDiscoveryResults(idea.id);
  const current = normalizeStage(idea.stage);

  return stages.map((stage) => {
    let status: ProductStatusLabel = "Draft";
    let primaryAction = STAGE_PURPOSES[stage];
    let blockedReason: string | null = null;
    let completed = false;
    let nextAction = `Open ${stage} stage.`;

    switch (stage) {
      case "IDEA":
        completed = Boolean(idea.title.trim() && idea.problem.trim());
        status = completed ? "Completed" : "Ready for input";
        primaryAction = completed ? "Upload or describe artifact" : "Create private Smart Idea";
        nextAction = completed ? "Add artifact or continue to INTERPRET." : "Enter title and problem.";
        break;
      case "INTERPRET":
        if (idea.extractedItems.length === 0) {
          status = "Evidence missing";
          blockedReason = "Upload a supported artifact or add manual description.";
          primaryAction = "Upload artifact";
        } else if (pendingConfirm.length > 0) {
          status = "Needs confirmation";
          primaryAction = "Confirm or correct extractions";
          nextAction = `${pendingConfirm.length} item(s) awaiting confirmation.`;
        } else if (confirmed.length > 0 || idea.ideaModel) {
          completed = Boolean(idea.ideaModel);
          status = completed ? "Completed" : "Ready for input";
          primaryAction = "Build Idea Model";
        }
        if (!idea.title.trim()) blockedReason = "Complete IDEA intake first.";
        break;
      case "MEASURE":
        if (!idea.ideaModel) {
          blockedReason = "Confirm interpretation and build Idea Model first.";
          status = "Needs confirmation";
        } else if (plans.length === 0) {
          status = "Ready for input";
          primaryAction = "Create measurement plan";
        } else if (passports.length === 0) {
          status = "Evidence missing";
          primaryAction = "Create Measurement Passport";
        } else {
          completed = passports.some((p) => p.validationStatus === "Validated" || p.validationStatus === "Measured");
          status = completed ? "Completed" : "Under human review";
          primaryAction = "Validate measurement record";
        }
        break;
      case "DISCOVER":
        if (!idea.externalSearchConfirmed) {
          status = "Needs confirmation";
          primaryAction = "Confirm external metadata search";
          blockedReason = "Sanitized query consent required before transmission.";
        } else if (discoveries.length === 0) {
          status = "Connector required";
          primaryAction = "Search connected providers";
          nextAction = "Crossref available; other providers may require connector or backend.";
        } else {
          completed = true;
          status = "Supported";
          primaryAction = "Review discovery results";
        }
        break;
      case "COMPARE":
        if (discoveries.length === 0) {
          blockedReason = "Run discovery or import metadata first.";
          status = "Evidence missing";
        } else {
          completed = current === "COMPARE" || Boolean(idea.missionId);
          status = "Supported";
          primaryAction = "Review comparison and gaps";
        }
        break;
      case "MISSION":
        if (!idea.ideaModel) blockedReason = "Idea Model required.";
        completed = Boolean(idea.missionId);
        status = completed ? "Completed" : idea.ideaModel ? "Ready for input" : "Needs confirmation";
        primaryAction = "Create research mission";
        nextAction = completed ? "Open linked mission in My Work." : "Link Mission, Project, and LRO.";
        break;
      case "EXECUTE":
        if (!idea.missionId) {
          blockedReason = "Create Mission first.";
          status = "Draft";
        } else {
          status = "Ready for input";
          primaryAction = "Add task, progress, or open Reasoning";
          nextAction = "Use My Work and Reasoning with mission context preserved.";
        }
        break;
      case "DECIDE":
        if (!idea.missionId) blockedReason = "Mission context helps decision support.";
        completed = Boolean(idea.humanDecision);
        status = completed ? "Completed" : "Under human review";
        primaryAction = "Record human decision";
        nextAction = HUMAN_DECISION_HINT;
        break;
    }

    return { stage, purpose: STAGE_PURPOSES[stage], status, primaryAction, blockedReason, completed, nextAction };
  });
}

const HUMAN_DECISION_HINT =
  "Review Decision Support Package — CBAI does not choose the final path.";

export function deriveActiveStageNextAction(idea: SmartIdea | null): string {
  const statuses = deriveCanvasStageStatuses(idea);
  const current = idea ? normalizeStage(idea.stage) : "IDEA";
  const active = statuses.find((s) => s.stage === current);
  return active?.nextAction ?? statuses[0]!.nextAction;
}

export { normalizeStage as normalizeCanvasStage };
