/**
 * Research Canvas stage UI — translation key helpers.
 */

import type { ProductStatusLabel } from "@/lib/product/status-vocabulary";
import type { ResearchCanvasStage } from "@/lib/research-canvas/research-canvas-types";
import type { CanvasActionKey, CanvasBlockedReasonKey } from "@/lib/research-canvas/canvas-stage-status";
import type { PersistenceMode } from "@/lib/product/persistence-mode";

export type ResearchCanvasCopyKey = keyof typeof import("@/lib/i18n/platform-copy-research-canvas-en").RESEARCH_CANVAS_EN & string;

const STAGE_KEYS: Record<ResearchCanvasStage, ResearchCanvasCopyKey> = {
  IDEA: "stageIdea",
  INTERPRET: "stageInterpret",
  MEASURE: "stageMeasure",
  DISCOVER: "stageDiscover",
  COMPARE: "stageCompare",
  MISSION: "stageMission",
  EXECUTE: "stageExecute",
  DECIDE: "stageDecide",
};

const STATUS_KEYS: Record<ProductStatusLabel, ResearchCanvasCopyKey> = {
  Draft: "statusDraft",
  "Needs confirmation": "statusNeedsConfirmation",
  "Ready for input": "statusReadyForInput",
  "Connector required": "statusConnectorRequired",
  "Instrument required": "statusInstrumentRequired",
  "Expert review required": "statusExpertReviewRequired",
  "Evidence missing": "statusEvidenceMissing",
  "Under human review": "statusUnderHumanReview",
  Supported: "statusSupported",
  Disputed: "statusDisputed",
  Inconclusive: "statusInconclusive",
  "Not implemented": "statusNotImplemented",
  Completed: "statusCompleted",
};

const BLOCKED_KEYS: Record<CanvasBlockedReasonKey, ResearchCanvasCopyKey> = {
  completeIdeaFirst: "blockedCompleteIdeaFirst",
  interpretUploadOrManual: "blockedInterpretUploadOrManual",
  interpretPendingConfirmation: "blockedInterpretPendingConfirmation",
  ideaModelRequired: "blockedIdeaModelRequired",
  measurementPlanningRequired: "blockedMeasurementPlanningRequired",
  discoveryRequired: "blockedDiscoveryRequired",
  externalSearchConsent: "blockedExternalSearchConsent",
  missionRequired: "blockedMissionRequired",
  missionContext: "blockedMissionContext",
};

const ACTION_KEYS: Record<CanvasActionKey, ResearchCanvasCopyKey> = {
  createSmartIdea: "actionCreateSmartIdea",
  uploadArtifact: "actionUploadArtifact",
  confirmInterpretation: "actionConfirmInterpretation",
  buildIdeaModel: "actionBuildIdeaModel",
  approveMeasurementPlanning: "actionApproveMeasurementPlanning",
  createMeasurementPlan: "actionCreateMeasurementPlan",
  createPassport: "actionCreatePassport",
  confirmExternalSearch: "actionConfirmExternalSearch",
  searchProviders: "actionSearchProviders",
  reviewComparison: "actionReviewComparison",
  createMission: "actionCreateMission",
  addExecutionTask: "actionAddExecutionTask",
  recordDecision: "actionRecordDecision",
  openStage: "actionOpenStage",
};

const PERSISTENCE_KEYS: Record<PersistenceMode, ResearchCanvasCopyKey> = {
  "device-local": "persistenceDeviceLocal",
  "authenticated-shared": "persistenceAuthenticatedShared",
  "offline-outbox": "persistenceOfflineOutbox",
  "backend-unavailable": "persistenceBackendUnavailable",
};

export function stageCopyKey(stage: ResearchCanvasStage): ResearchCanvasCopyKey {
  return STAGE_KEYS[stage];
}

export function statusCopyKey(status: ProductStatusLabel): ResearchCanvasCopyKey {
  return STATUS_KEYS[status];
}

export function blockedCopyKey(key: CanvasBlockedReasonKey): ResearchCanvasCopyKey {
  return BLOCKED_KEYS[key];
}

export function actionCopyKey(key: CanvasActionKey): ResearchCanvasCopyKey {
  return ACTION_KEYS[key];
}

export function persistenceCopyKey(mode: PersistenceMode): ResearchCanvasCopyKey {
  return PERSISTENCE_KEYS[mode];
}

export function stagePurposeCopyKey(stage: ResearchCanvasStage): ResearchCanvasCopyKey {
  const map: Record<ResearchCanvasStage, ResearchCanvasCopyKey> = {
    IDEA: "stagePurposeIdea",
    INTERPRET: "stagePurposeInterpret",
    MEASURE: "stagePurposeMeasure",
    DISCOVER: "stagePurposeDiscover",
    COMPARE: "stagePurposeCompare",
    MISSION: "stagePurposeMission",
    EXECUTE: "stagePurposeExecute",
    DECIDE: "stagePurposeDecide",
  };
  return map[stage];
}
