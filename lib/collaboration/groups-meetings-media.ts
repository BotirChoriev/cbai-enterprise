/**
 * Groups, meetings, and media — canonical types with honest capability states.
 *
 * Multi-party live translation and cloud object storage are not claimed until
 * those pipelines are configured and tested.
 */

export type GroupVisibility = "public" | "request_to_join" | "invite_only" | "private";

export type GroupRecord = {
  readonly id: string;
  readonly title: string;
  readonly topicOrDomain: string;
  readonly visibility: GroupVisibility;
  readonly ownerIds: readonly string[];
  readonly moderatorIds: readonly string[];
  readonly language: string;
  readonly contentLocale: string;
  readonly createdLocale: string;
  readonly moderationEntryPoint: string;
  readonly createdAt: string;
};

export type MeetingConsentState = "not_requested" | "granted" | "denied";
export type TranslationCapability = "not_available" | "text_only" | "live_audio_pipeline_required";

export type MeetingRecord = {
  readonly id: string;
  readonly title: string;
  readonly purpose: string;
  readonly startAt: string | null;
  readonly endAt: string | null;
  readonly timeZone: string | null;
  readonly participantLanguages: readonly string[];
  readonly agenda: readonly string[];
  readonly notes: string;
  readonly transcriptStatus: "none" | "original_only" | "translation_pending";
  readonly translationCapability: TranslationCapability;
  readonly consentRecording: MeetingConsentState;
  readonly linkedProjectOrWorkspaceId: string | null;
  readonly decisions: readonly string[];
  readonly actionItems: readonly string[];
  readonly contentLocale: string;
  readonly createdLocale: string;
};

export type MediaKind = "pdf" | "image" | "video" | "document";
export type MediaUploadState =
  | "local_only"
  | "configuration_required"
  | "uploaded"
  | "extraction_pending"
  | "failed";

export type MediaAttachment = {
  readonly id: string;
  readonly kind: MediaKind;
  readonly fileName: string;
  readonly ownerId: string;
  readonly visibility: "private" | "shared" | "public";
  readonly uploadState: MediaUploadState;
  readonly uploadedAt: string | null;
  readonly sourceOrPublisher: string | null;
  readonly publicationDate: string | null;
  readonly language: string | null;
  readonly pageCount: number | null;
  readonly linkedProjectOrEvidenceId: string | null;
  readonly originalPreserved: boolean;
  readonly extractedTextIsSourceMaterial: boolean;
};

export type TranslationState =
  | "original"
  | "translated"
  | "translation_pending"
  | "unavailable"
  | "needs_review";

export type LocalizedContentView = {
  readonly originalText: string;
  readonly originalLanguage: string;
  readonly interfaceTranslation: string | null;
  readonly optionalTranslatedSummary: string | null;
  readonly translationState: TranslationState;
  readonly machineTranslationLabeled: boolean;
};

export function createOriginalContentView(input: {
  readonly originalText: string;
  readonly originalLanguage: string;
}): LocalizedContentView {
  return {
    originalText: input.originalText,
    originalLanguage: input.originalLanguage,
    interfaceTranslation: null,
    optionalTranslatedSummary: null,
    translationState: "original",
    machineTranslationLabeled: false,
  };
}

/** Live meeting audio translation is not available until a complete pipeline exists. */
export function meetingTranslationCapability(): TranslationCapability {
  return "live_audio_pipeline_required";
}

/** Persistent object storage is not configured on this static-export deployment. */
export function mediaUploadCapability(): "configuration_required" | "available" {
  return "configuration_required";
}
