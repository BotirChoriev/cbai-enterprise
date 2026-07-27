/**
 * Consent-based research meeting structure — no false live interpretation claims.
 */

export type ResearchMeetingDraft = {
  readonly schemaVersion: 1;
  readonly status: "draft";
  readonly multilingualInterpretationAvailable: false;
  readonly speakerSeparationAvailable: false;
  readonly consentRequiredFor: readonly string[];
  readonly sides: {
    readonly originalTranscript: string;
    readonly translatedTranscript: string;
    readonly cbaiSummary: string;
    readonly confirmedDecisions: readonly string[];
    readonly proposedActions: readonly string[];
    readonly unresolvedQuestions: readonly string[];
  };
  readonly honestyNotice: string;
};

export function buildResearchMeetingDraft(): ResearchMeetingDraft {
  return {
    schemaVersion: 1,
    status: "draft",
    multilingualInterpretationAvailable: false,
    speakerSeparationAvailable: false,
    consentRequiredFor: [
      "recording",
      "persistent_transcript_storage",
      "external_sharing",
      "creating_assignments_for_others",
    ],
    sides: {
      originalTranscript: "",
      translatedTranscript: "",
      cbaiSummary: "",
      confirmedDecisions: [],
      proposedActions: [],
      unresolvedQuestions: [],
    },
    honestyNotice:
      "Live multilingual interpretation is not claimed. Meeting structure is available; Realtime audio success must be verified separately by Voice Operator diagnostics.",
  };
}
