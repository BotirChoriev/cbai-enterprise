/**
 * Research Canvas stage status — honest prerequisites and next actions.
 */

import type { ResearchCanvasStage, SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import { loadMeasurementPlans, loadMeasurementPassports } from "@/lib/research-canvas/measurement-store";
import { loadDiscoveryResults } from "@/lib/research-canvas/research-discovery";
import type { ProductStatusLabel } from "@/lib/product/status-vocabulary";

export type CanvasBlockedReasonKey =
  | "completeIdeaFirst"
  | "interpretUploadOrManual"
  | "interpretPendingConfirmation"
  | "ideaModelRequired"
  | "measurementPlanningRequired"
  | "discoveryRequired"
  | "externalSearchConsent"
  | "missionRequired"
  | "missionContext";

export type CanvasActionKey =
  | "createSmartIdea"
  | "uploadArtifact"
  | "confirmInterpretation"
  | "buildIdeaModel"
  | "approveMeasurementPlanning"
  | "createMeasurementPlan"
  | "createPassport"
  | "confirmExternalSearch"
  | "searchProviders"
  | "reviewComparison"
  | "createMission"
  | "addExecutionTask"
  | "recordDecision"
  | "openStage";

export type CanvasStageStatus = {
  readonly stage: ResearchCanvasStage;
  readonly purposeKey: CanvasActionKey | "stagePurpose";
  readonly status: ProductStatusLabel;
  readonly primaryActionKey: CanvasActionKey;
  readonly blockedReason: string | null;
  readonly blockedReasonKey: CanvasBlockedReasonKey | null;
  readonly completed: boolean;
  readonly nextActionKey: CanvasActionKey;
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
      purposeKey: "stagePurpose" as const,
      status: stage === "IDEA" ? "Ready for input" : "Draft",
      primaryActionKey: stage === "IDEA" ? "createSmartIdea" : "openStage",
      blockedReason: stage === "IDEA" ? null : "No Smart Idea selected.",
      blockedReasonKey: stage === "IDEA" ? null : "completeIdeaFirst",
      completed: false,
      nextActionKey: stage === "IDEA" ? "createSmartIdea" : "openStage",
    }));
  }

  const confirmed = idea.extractedItems.filter((e) => e.confirmationStatus === "Confirmed");
  const pendingConfirm = idea.extractedItems.filter(
    (e) =>
      e.confirmationStatus === "Awaiting Human Confirmation" ||
      e.confirmationStatus === "Machine-Extracted" ||
      e.confirmationStatus === "Human-Corrected" ||
      e.confirmationStatus === "Insufficient Quality" ||
      e.confirmationStatus === "Needs Human Review" ||
      e.confirmationStatus === "Needs Correction",
  );
  const plans = loadMeasurementPlans(idea.id);
  const passports = loadMeasurementPassports(idea.id);
  const discoveries = loadDiscoveryResults(idea.id);
  const current = normalizeStage(idea.stage);

  return stages.map((stage) => {
    let status: ProductStatusLabel = "Draft";
    let primaryActionKey: CanvasActionKey = "openStage";
    let blockedReason: string | null = null;
    let blockedReasonKey: CanvasBlockedReasonKey | null = null;
    let completed = false;
    let nextActionKey: CanvasActionKey = "openStage";

    switch (stage) {
      case "IDEA":
        completed = Boolean(idea.title.trim() && idea.problem.trim());
        status = completed ? "Completed" : "Ready for input";
        primaryActionKey = completed ? "uploadArtifact" : "createSmartIdea";
        nextActionKey = completed ? "uploadArtifact" : "createSmartIdea";
        break;
      case "INTERPRET":
        if (idea.extractedItems.length === 0) {
          status = "Evidence missing";
          blockedReasonKey = "interpretUploadOrManual";
          blockedReason = "Upload a supported artifact or add manual description.";
          primaryActionKey = "uploadArtifact";
          nextActionKey = "uploadArtifact";
        } else if (pendingConfirm.length > 0) {
          status = "Needs confirmation";
          blockedReasonKey = "interpretPendingConfirmation";
          primaryActionKey = "confirmInterpretation";
          nextActionKey = "confirmInterpretation";
        } else if (confirmed.length > 0 || idea.ideaModel) {
          completed = Boolean(idea.ideaModel && idea.measurementPlanningApproved);
          status = idea.ideaModel
            ? idea.measurementPlanningApproved
              ? "Completed"
              : "Under human review"
            : "Ready for input";
          primaryActionKey = idea.ideaModel ? "approveMeasurementPlanning" : "buildIdeaModel";
          nextActionKey = idea.ideaModel ? "approveMeasurementPlanning" : "buildIdeaModel";
        }
        if (!idea.title.trim()) {
          blockedReasonKey = "completeIdeaFirst";
          blockedReason = "Complete IDEA intake first.";
        }
        break;
      case "MEASURE":
        if (!idea.ideaModel) {
          blockedReasonKey = "ideaModelRequired";
          blockedReason = "Confirm interpretation and build Idea Model first.";
          status = "Needs confirmation";
          primaryActionKey = "buildIdeaModel";
          nextActionKey = "buildIdeaModel";
        } else if (!idea.measurementPlanningApproved) {
          blockedReasonKey = "measurementPlanningRequired";
          blockedReason = "Review Idea Model and approve measurement planning first.";
          status = "Under human review";
          primaryActionKey = "approveMeasurementPlanning";
          nextActionKey = "approveMeasurementPlanning";
        } else if (plans.length === 0) {
          status = "Ready for input";
          primaryActionKey = "createMeasurementPlan";
          nextActionKey = "createMeasurementPlan";
        } else if (passports.length === 0) {
          status = "Evidence missing";
          primaryActionKey = "createPassport";
          nextActionKey = "createPassport";
        } else {
          completed = passports.some((p) => p.validationStatus === "Validated" || p.validationStatus === "Measured");
          status = completed ? "Completed" : "Under human review";
          primaryActionKey = "createPassport";
          nextActionKey = "createPassport";
        }
        break;
      case "DISCOVER":
        if (!idea.externalSearchConfirmed) {
          status = "Needs confirmation";
          primaryActionKey = "confirmExternalSearch";
          blockedReasonKey = "externalSearchConsent";
          blockedReason = "Sanitized query consent required before transmission.";
          nextActionKey = "confirmExternalSearch";
        } else if (discoveries.length === 0) {
          status = "Connector required";
          primaryActionKey = "searchProviders";
          nextActionKey = "searchProviders";
        } else {
          completed = true;
          status = "Supported";
          primaryActionKey = "searchProviders";
          nextActionKey = "searchProviders";
        }
        break;
      case "COMPARE":
        if (discoveries.length === 0) {
          blockedReasonKey = "discoveryRequired";
          blockedReason = "Run discovery or import metadata first.";
          status = "Evidence missing";
          primaryActionKey = "searchProviders";
          nextActionKey = "searchProviders";
        } else {
          completed = current === "COMPARE" || Boolean(idea.missionId);
          status = "Supported";
          primaryActionKey = "reviewComparison";
          nextActionKey = "reviewComparison";
        }
        break;
      case "MISSION":
        if (!idea.ideaModel) {
          blockedReasonKey = "ideaModelRequired";
          blockedReason = "Idea Model required.";
        }
        completed = Boolean(idea.missionId);
        status = completed ? "Completed" : idea.ideaModel ? "Ready for input" : "Needs confirmation";
        primaryActionKey = "createMission";
        nextActionKey = completed ? "openStage" : "createMission";
        break;
      case "EXECUTE":
        if (!idea.missionId) {
          blockedReasonKey = "missionRequired";
          blockedReason = "Create Mission first.";
          status = "Draft";
          primaryActionKey = "createMission";
          nextActionKey = "createMission";
        } else {
          status = "Ready for input";
          primaryActionKey = "addExecutionTask";
          nextActionKey = "addExecutionTask";
        }
        break;
      case "DECIDE":
        if (!idea.missionId) {
          blockedReasonKey = "missionContext";
          blockedReason = "Mission context helps decision support.";
        }
        completed = Boolean(idea.humanDecision);
        status = completed ? "Completed" : "Under human review";
        primaryActionKey = "recordDecision";
        nextActionKey = "recordDecision";
        break;
    }

    return {
      stage,
      purposeKey: "stagePurpose" as const,
      status,
      primaryActionKey,
      blockedReason,
      blockedReasonKey,
      completed,
      nextActionKey,
    };
  });
}

export function deriveActiveStageNextAction(idea: SmartIdea | null): CanvasActionKey {
  const statuses = deriveCanvasStageStatuses(idea);
  const current = idea ? normalizeStage(idea.stage) : "IDEA";
  const active = statuses.find((s) => s.stage === current);
  return active?.nextActionKey ?? statuses[0]!.nextActionKey;
}

export { normalizeStage as normalizeCanvasStage };
