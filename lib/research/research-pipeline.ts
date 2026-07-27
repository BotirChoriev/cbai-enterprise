/**
 * Canonical research pipeline stages — evidence-first, confirmation-gated handoffs.
 */

import type { LinkedWorkPreset } from "@/lib/operational-objects/linked-work-draft";
import type { OperationalObjectType } from "@/lib/operational-objects/operational-object.types";

export type ResearchPipelineStageId =
  | "idea"
  | "problem"
  | "material"
  | "interpretation"
  | "hypothesis"
  | "measurements"
  | "known_facts"
  | "assumptions"
  | "unknowns"
  | "evidence_requirements"
  | "literature"
  | "experiment"
  | "safety_review"
  | "human_approval"
  | "execution"
  | "conclusions"
  | "report";

export type ResearchPipelineStage = {
  readonly id: ResearchPipelineStageId;
  readonly labelKey: string;
  readonly nextActionKey: string;
  readonly draftType: OperationalObjectType;
  readonly preset?: LinkedWorkPreset;
  readonly honestyKey: string;
};

export const RESEARCH_PIPELINE_STAGES: readonly ResearchPipelineStage[] = [
  {
    id: "idea",
    labelKey: "operationalObject.pipelineIdea",
    nextActionKey: "operationalObject.pipelineDefineProblem",
    draftType: "research_question",
    preset: "research_question",
    honestyKey: "operationalObject.pipelineHonestyNoAutoScience",
  },
  {
    id: "problem",
    labelKey: "operationalObject.pipelineProblem",
    nextActionKey: "operationalObject.pipelineAttachMaterial",
    draftType: "research_question",
    preset: "research_question",
    honestyKey: "operationalObject.pipelineHonestyNoAutoScience",
  },
  {
    id: "material",
    labelKey: "operationalObject.pipelineMaterial",
    nextActionKey: "operationalObject.pipelineReviewInterpretation",
    draftType: "pdf_review",
    honestyKey: "operationalObject.pipelineHonestyPendingVision",
  },
  {
    id: "interpretation",
    labelKey: "operationalObject.pipelineInterpretation",
    nextActionKey: "operationalObject.pipelineConfirmInterpretation",
    draftType: "review",
    honestyKey: "operationalObject.pipelineHonestyNoAutoScience",
  },
  {
    id: "hypothesis",
    labelKey: "operationalObject.pipelineHypothesis",
    nextActionKey: "operationalObject.pipelineDefineMeasurements",
    draftType: "research_question",
    honestyKey: "operationalObject.pipelineHonestyNoAutoScience",
  },
  {
    id: "measurements",
    labelKey: "operationalObject.pipelineMeasurements",
    nextActionKey: "operationalObject.pipelineAddMeasurement",
    draftType: "work_plan",
    preset: "experiment_plan",
    honestyKey: "operationalObject.pipelineHonestyNoAutoScience",
  },
  {
    id: "evidence_requirements",
    labelKey: "operationalObject.pipelineEvidenceReq",
    nextActionKey: "operationalObject.pipelineConnectEvidence",
    draftType: "evidence_request",
    preset: "evidence_request",
    honestyKey: "operationalObject.pipelineHonestyNoFakeDb",
  },
  {
    id: "literature",
    labelKey: "operationalObject.pipelineLiterature",
    nextActionKey: "operationalObject.pipelineLiteratureRequest",
    draftType: "work_plan",
    preset: "literature_review",
    honestyKey: "operationalObject.pipelineHonestyNoFakeDb",
  },
  {
    id: "experiment",
    labelKey: "operationalObject.pipelineExperiment",
    nextActionKey: "operationalObject.pipelineCreateExperiment",
    draftType: "work_plan",
    preset: "experiment_plan",
    honestyKey: "operationalObject.pipelineHonestyNoAutoScience",
  },
  {
    id: "safety_review",
    labelKey: "operationalObject.pipelineSafety",
    nextActionKey: "operationalObject.pipelineRequestHumanReview",
    draftType: "review",
    honestyKey: "operationalObject.pipelineHonestySafetyHuman",
  },
  {
    id: "report",
    labelKey: "operationalObject.pipelineReport",
    nextActionKey: "operationalObject.pipelineCreateReport",
    draftType: "work_plan",
    preset: "report_draft",
    honestyKey: "operationalObject.pipelineHonestyNoAutoScience",
  },
];
