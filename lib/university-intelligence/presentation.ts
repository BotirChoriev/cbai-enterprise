/**
 * Project Presentation Card — draft only; never auto-sends.
 */

export type PresentationDisclosure = {
  readonly whatWillBeShared: readonly string[];
  readonly recipients: readonly string[];
  readonly language: string;
  readonly provider: "not_connected" | string;
  readonly attachmentsIncluded: boolean;
  readonly transcriptWillBeStored: boolean;
};

export type ProjectPresentationCard = {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly version: number;
  readonly status: "draft" | "ready_for_review" | "approved_local" | "communication_blocked";
  readonly title: string;
  readonly researcherName: string;
  readonly affiliation: string;
  readonly problem: string;
  readonly scientificQuestion: string;
  readonly existingEvidence: string;
  readonly methodology: string;
  readonly preliminaryResults: string;
  readonly limitations: string;
  readonly readinessState: "draft" | "partial" | "ready_for_human_review";
  readonly requiredResearchers: readonly string[];
  readonly requiredLaboratory: string;
  readonly requiredEquipment: readonly string[];
  readonly fundingNeed: string;
  readonly timeline: string;
  readonly ethicsAndSafety: string;
  readonly intellectualPropertyState: string;
  readonly confidentialSections: readonly string[];
  readonly publicSections: readonly string[];
  readonly expectedCollaborationResult: string;
  readonly targetUniversityIds: readonly string[];
  readonly targetAcademicIds: readonly string[];
  readonly selectedCommunicationLanguage: string;
  readonly translatedPresentationCopy: string | null;
  readonly humanApprovalPoints: readonly string[];
  readonly contentLocale: string;
  readonly userEnteredPreserved: true;
  readonly inferredFields: readonly string[];
  readonly communicationProviderConnected: false;
  readonly disclosure: PresentationDisclosure;
  readonly audit: readonly { readonly at: string; readonly event: string }[];
};

export type BuildPresentationInput = {
  readonly title: string;
  readonly researcherName: string;
  readonly affiliation: string;
  readonly problem?: string;
  readonly scientificQuestion?: string;
  readonly methodology?: string;
  readonly contentLocale: string;
  readonly targetUniversityIds?: readonly string[];
  readonly selectedCommunicationLanguage?: string;
  /** Exact user text — preserved, never rewritten. */
  readonly userEnteredText?: string | null;
};

let presentationSeq = 0;

export function buildProjectPresentationCard(input: BuildPresentationInput): ProjectPresentationCard {
  presentationSeq += 1;
  const id = `ppc-${Date.now()}-${presentationSeq}`;
  const inferred: string[] = [];
  if (!input.problem) inferred.push("problem");
  if (!input.scientificQuestion) inferred.push("scientificQuestion");
  if (!input.methodology) inferred.push("methodology");

  const publicSections = [
    "title",
    "researcherName",
    "affiliation",
    "problem",
    "scientificQuestion",
    "methodology",
    "limitations",
    "expectedCollaborationResult",
  ];
  const confidentialSections = ["fundingNeed", "intellectualPropertyState", "preliminaryResults"];

  return {
    schemaVersion: 1,
    id,
    version: 1,
    status: "draft",
    title: input.title,
    researcherName: input.researcherName,
    affiliation: input.affiliation,
    problem: input.problem ?? "",
    scientificQuestion: input.scientificQuestion ?? "",
    existingEvidence: "",
    methodology: input.methodology ?? "",
    preliminaryResults: "",
    limitations: "",
    readinessState: "draft",
    requiredResearchers: [],
    requiredLaboratory: "",
    requiredEquipment: [],
    fundingNeed: "",
    timeline: "",
    ethicsAndSafety: "",
    intellectualPropertyState: "",
    confidentialSections,
    publicSections,
    expectedCollaborationResult: "",
    targetUniversityIds: [...(input.targetUniversityIds ?? [])],
    targetAcademicIds: [],
    selectedCommunicationLanguage: input.selectedCommunicationLanguage ?? input.contentLocale,
    translatedPresentationCopy: null,
    humanApprovalPoints: [
      "Confirm recipients",
      "Confirm public vs confidential sections",
      "Confirm communication language",
      "Explicit send approval required — nothing is sent automatically",
    ],
    contentLocale: input.contentLocale,
    userEnteredPreserved: true,
    inferredFields: inferred,
    communicationProviderConnected: false,
    disclosure: {
      whatWillBeShared: publicSections,
      recipients: [...(input.targetUniversityIds ?? [])],
      language: input.selectedCommunicationLanguage ?? input.contentLocale,
      provider: "not_connected",
      attachmentsIncluded: false,
      transcriptWillBeStored: false,
    },
    audit: [
      {
        at: new Date().toISOString(),
        event: "draft_created",
      },
    ],
  };
}

export type CommunicationAttemptResult =
  | {
      readonly ok: false;
      readonly reason: "provider_not_connected" | "missing_confirmation" | "empty_recipients";
      readonly message: string;
      readonly draft: ProjectPresentationCard;
    }
  | {
      readonly ok: true;
      readonly message: string;
      readonly draft: ProjectPresentationCard;
    };

/**
 * Attempt external communication. Without a connected provider, never claims success.
 */
export function attemptPresentationCommunication(
  card: ProjectPresentationCard,
  explicitHumanConfirmation: boolean,
): CommunicationAttemptResult {
  if (!explicitHumanConfirmation) {
    return {
      ok: false,
      reason: "missing_confirmation",
      message: "Explicit human confirmation is required before any communication.",
      draft: card,
    };
  }
  if (card.targetUniversityIds.length === 0) {
    return {
      ok: false,
      reason: "empty_recipients",
      message: "Select at least one recipient university.",
      draft: card,
    };
  }
  if (!card.communicationProviderConnected) {
    return {
      ok: false,
      reason: "provider_not_connected",
      message:
        "Communication provider not connected. Presentation draft is prepared for export/copy — nothing was sent.",
      draft: {
        ...card,
        status: "communication_blocked",
        audit: [
          ...card.audit,
          { at: new Date().toISOString(), event: "send_blocked_provider_not_connected" },
        ],
      },
    };
  }
  // Provider path not implemented in this deployment.
  return {
    ok: false,
    reason: "provider_not_connected",
    message: "Communication provider not connected.",
    draft: card,
  };
}

export function exportPresentationPlainText(card: ProjectPresentationCard): string {
  return [
    card.title,
    `Researcher: ${card.researcherName}`,
    `Affiliation: ${card.affiliation}`,
    `Problem: ${card.problem}`,
    `Question: ${card.scientificQuestion}`,
    `Methodology: ${card.methodology}`,
    `Limitations: ${card.limitations}`,
    `Targets: ${card.targetUniversityIds.join(", ") || "—"}`,
    `Language: ${card.selectedCommunicationLanguage}`,
    "STATUS: Communication provider not connected — draft only.",
  ].join("\n");
}
