/**
 * Scientific intake → Operational Object interpretation (honest, no OCR/CV claims).
 */

import { getDictionary } from "@/lib/i18n/translate";
import type { OperationalObjectDraft, OperationalObjectType } from "@/lib/operational-objects/operational-object.types";

export type IntakeAttachmentMeta = {
  readonly fileName: string;
  readonly mimeType: string | null;
  readonly fileSizeBytes: number | null;
  readonly source: "user_upload" | "user_capture" | "local_pdf";
  readonly createdAt: string;
  readonly userDescription: string;
  readonly contentLocale: string;
};

export type IntakeInterpretationProposal = {
  readonly type: OperationalObjectType;
  readonly labelKey: string;
  readonly rationaleKey: string;
};

export const INTAKE_OBJECT_PROPOSALS: readonly IntakeInterpretationProposal[] = [
  { type: "research_question", labelKey: "operationalObject.typeResearchQuestion", rationaleKey: "operationalObject.intakeProposeResearchQuestion" },
  { type: "evidence_request", labelKey: "operationalObject.typeEvidenceRequest", rationaleKey: "operationalObject.intakeProposeEvidenceRequest" },
  { type: "work_plan", labelKey: "operationalObject.templateExperiment", rationaleKey: "operationalObject.intakeProposeExperiment" },
  { type: "work_plan", labelKey: "operationalObject.templateLiterature", rationaleKey: "operationalObject.intakeProposeLiterature" },
  { type: "pdf_review", labelKey: "operationalObject.typePdfReview", rationaleKey: "operationalObject.intakeProposePdfReview" },
  { type: "work_plan", labelKey: "operationalObject.typeWorkPlan", rationaleKey: "operationalObject.intakeProposeWorkPlan" },
  { type: "review", labelKey: "operationalObject.typeReview", rationaleKey: "operationalObject.intakeProposeSafetyReview" },
  { type: "work_plan", labelKey: "operationalObject.typeReportDraft", rationaleKey: "operationalObject.intakeProposeReport" },
];

export function buildIntakeOperationalDraft(input: {
  readonly locale: string;
  readonly title: string;
  readonly purpose: string;
  readonly domainLabel: string;
  readonly documentType: string;
  readonly proposedType: OperationalObjectType;
  readonly attachment: IntakeAttachmentMeta | null;
  readonly userQuestion?: string;
}): { draft: OperationalObjectDraft; inferredFields: readonly string[] } {
  const copy = getDictionary(input.locale).operationalObject;
  const title =
    input.title.trim() ||
    input.userQuestion?.trim() ||
    `${input.documentType} — ${copy.typePdfReview}`;
  const inferred = [
    "type",
    "domain",
    "title",
    "objective",
    "nextAction",
    "knownInformation",
    "missingInformation",
    "assumptions",
  ] as const;

  const attachmentNote = input.attachment
    ? `${input.attachment.fileName} (${input.attachment.mimeType ?? "unknown"}; ${input.attachment.source})`
    : null;

  const draft: OperationalObjectDraft = {
    type: input.proposedType,
    title,
    summary: title,
    objective: input.purpose.trim() || input.userQuestion?.trim() || title,
    rationale: copy.intakeInterpretationRationale,
    expectedOutcome: "",
    domain: "research",
    status: "draft",
    priority: "normal",
    requiredInputs: [input.domainLabel, ...(attachmentNote ? [attachmentNote] : [])],
    evidenceRequirements: [copy.intakeEvidenceNeeded],
    nextAction: copy.intakeNextAction,
    humanDecision: "",
    relatedObjectIds: [],
    locale: input.locale,
    knownInformation: [
      copy.intakeKnownUserMaterial,
      ...(attachmentNote ? [attachmentNote] : []),
      ...(input.userQuestion ? [input.userQuestion] : []),
    ],
    missingInformation: [
      copy.intakeUnknownMeasurements,
      copy.intakeUnknownValidation,
    ],
    assumptions: [copy.intakeAssumptionNoAutoValidation],
    humanApprovalRequired: true,
    provenance: {
      source: "manual",
      routePath: "/scientific-documents",
      locale: input.locale,
      inferredFields: [...inferred],
      relatedEntityKind: "research",
      relatedEntityName: input.domainLabel,
    },
  };

  return { draft, inferredFields: [...inferred] };
}
