/**
 * Scientific Control Cabinet — transparent research workspace draft.
 * Confirmation required before Operational Object creation.
 */

export type ControlCabinetDraft = {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly status: "draft";
  readonly role: string;
  readonly projectTitle: string;
  readonly problem: string;
  readonly researchQuestion: string;
  readonly hypothesis: string;
  readonly currentKnowledge: string;
  readonly attachedSources: readonly string[];
  readonly missingInformation: readonly string[];
  readonly methodology: string;
  readonly experimentPlan: string;
  readonly sampleAndMeasurements: string;
  readonly ethicsAndSafety: string;
  readonly dataManagementPlan: string;
  readonly requiredLaboratoryEquipment: string;
  readonly requiredExperts: string;
  readonly budgetFundingNeeds: string;
  readonly milestones: readonly string[];
  readonly risks: readonly string[];
  readonly monitoringIndicators: readonly string[];
  readonly reportingPlan: string;
  readonly approvals: readonly string[];
  readonly contentLocale: string;
  readonly userEnteredPreserved: true;
  readonly inferredFields: readonly string[];
  readonly version: number;
  readonly audit: readonly { readonly at: string; readonly event: string }[];
  readonly requiresHumanConfirmation: true;
};

export type BuildCabinetInput = {
  readonly role?: string;
  readonly projectTitle: string;
  readonly problem?: string;
  readonly researchQuestion?: string;
  readonly hypothesis?: string;
  readonly contentLocale: string;
  readonly userText?: string | null;
};

let seq = 0;

export function buildControlCabinetDraft(input: BuildCabinetInput): ControlCabinetDraft {
  seq += 1;
  const inferred: string[] = [];
  if (!input.problem) inferred.push("problem");
  if (!input.researchQuestion) inferred.push("researchQuestion");
  if (!input.hypothesis) inferred.push("hypothesis");
  if (!input.role) inferred.push("role");

  return {
    schemaVersion: 1,
    id: `gri-cabinet-${Date.now()}-${seq}`,
    status: "draft",
    role: input.role ?? "",
    projectTitle: input.projectTitle,
    problem: input.problem ?? "",
    researchQuestion: input.researchQuestion ?? "",
    hypothesis: input.hypothesis ?? "",
    currentKnowledge: "",
    attachedSources: [],
    missingInformation: [
      "methodology",
      "ethics_and_safety",
      "required_laboratory",
      "funding",
      "monitoring_indicators",
    ],
    methodology: "",
    experimentPlan: "",
    sampleAndMeasurements: "",
    ethicsAndSafety: "",
    dataManagementPlan: "",
    requiredLaboratoryEquipment: "",
    requiredExperts: "",
    budgetFundingNeeds: "",
    milestones: [],
    risks: [],
    monitoringIndicators: [],
    reportingPlan: "",
    approvals: [
      "Human confirms draft before Operational Object creation",
      "Human approves any external collaboration request",
    ],
    contentLocale: input.contentLocale,
    userEnteredPreserved: true,
    inferredFields: inferred,
    version: 1,
    audit: [{ at: new Date().toISOString(), event: "draft_created" }],
    requiresHumanConfirmation: true,
  };
}
