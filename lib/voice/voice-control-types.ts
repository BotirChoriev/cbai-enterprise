/** Voice control — navigation lock and provenance types. */

export type VoiceControlPhase =
  | "idle"
  | "listening"
  | "transcript_review"
  | "action_review"
  | "executing"
  | "completed"
  | "cancelled"
  | "error";

export type VoiceCapabilityState =
  | "available"
  | "browser_dependent"
  | "listening"
  | "transcript_needs_confirmation"
  | "low_confidence"
  | "not_understood"
  | "permission_required"
  | "unsupported"
  | "error"
  | "manual_entry_recommended";

export type VoiceActionKind =
  | "navigate"
  | "profile_update"
  | "workspace_pin"
  | "message"
  | "search_suggestion"
  | "unknown";

export type VoiceActionProposal = {
  readonly status: "known" | "unknown" | "blocked";
  readonly understoodText: string;
  readonly actionLabel: string;
  readonly actionDescription: string;
  readonly actionVars?: Record<string, string>;
  readonly kind: VoiceActionKind;
  readonly href?: string;
  readonly message?: string;
  readonly profilePatch?: Readonly<{ preferredLanguage?: string; speechLanguage?: string }>;
  readonly pinEntity?: boolean;
  readonly requiresExternalConsent?: boolean;
  readonly blockedReasonKey?: string;
};

export type VoiceTranscriptRecord = {
  readonly transcript: string;
  readonly requestedLang: string;
  readonly confidence: number | null;
  readonly capturedAt: string;
  readonly humanConfirmed: boolean;
  readonly provenanceKind: "VOICE_TRANSCRIPT";
  readonly needsReview: boolean;
};
