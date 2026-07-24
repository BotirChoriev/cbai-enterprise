/**
 * CBAI Live Intelligence Rooms — canonical session model.
 * One underlying session system for Meeting Hall, Laboratory, Practice, Collaboration.
 * Multi-party conferencing transport is adapter-gated; MVP uses host Voice Operator + simulation.
 */

export const LIVE_ROOM_SCHEMA_VERSION = 1 as const;

export type LiveRoomType =
  | "meeting_hall"
  | "laboratory"
  | "practice"
  | "collaboration";

export type LiveRoomLifecycle =
  | "draft"
  | "ready"
  | "live"
  | "paused"
  | "ended"
  | "archived";

export type LiveRoomConnectionState =
  | "ready"
  | "connecting"
  | "listening"
  | "participant_speaking"
  | "translating"
  | "thinking"
  | "responding"
  | "paused"
  | "reconnecting"
  | "ended"
  | "mic_permission_denied"
  | "device_unavailable"
  | "speech_unavailable"
  | "broker_auth_failure"
  | "invalid_api_key"
  | "quota_rate_limit"
  | "origin_blocked"
  | "network_failure"
  | "unsupported_browser";

export type LiveRoomLocale = "en" | "uz" | "ru" | "tr";

export type LiveParticipantRole =
  | "host"
  | "presenter"
  | "participant"
  | "observer"
  | "ai_simulated";

export type LiveParticipantKind = "human" | "ai_simulated";

export type TranslationStatus =
  | "original_only"
  | "translated"
  | "uncertain"
  | "clarification_needed"
  | "failed"
  | "not_requested";

export type LiveConsentState = {
  readonly recordingAllowed: boolean;
  readonly translationAudioAllowed: boolean;
  readonly retentionDays: number;
  readonly acknowledgedAt: string | null;
  readonly policyVersion: string;
};

export type LiveGlossaryTerm = {
  readonly id: string;
  readonly term: string;
  readonly preferredTranslations: Partial<Record<LiveRoomLocale, string>>;
  readonly doNotTranslate: boolean;
  readonly definition?: string;
  readonly evidenceRefIds?: readonly string[];
  readonly approvedByParticipantId?: string | null;
};

export type LiveTranscriptTurn = {
  readonly id: string;
  readonly speakerParticipantId: string;
  readonly originalText: string;
  readonly originalLocale: LiveRoomLocale | string;
  readonly translatedVariants: Partial<Record<LiveRoomLocale | string, string>>;
  readonly translationStatus: TranslationStatus;
  readonly translationUncertainty?: string | null;
  readonly glossaryTermIds?: readonly string[];
  readonly createdAt: string;
  readonly isSyntheticAudio?: boolean;
};

export type LiveAgendaItem = {
  readonly id: string;
  readonly title: string;
  readonly done: boolean;
};

export type LiveQuestion = {
  readonly id: string;
  readonly text: string;
  readonly locale: string;
  readonly resolved: boolean;
  readonly createdAt: string;
};

export type LiveDecision = {
  readonly id: string;
  readonly text: string;
  readonly requiresHumanConfirmation: boolean;
  readonly confirmed: boolean;
  readonly createdAt: string;
};

export type LiveActionItem = {
  readonly id: string;
  readonly text: string;
  readonly ownerParticipantId?: string | null;
  readonly dueAt?: string | null;
  readonly done: boolean;
};

export type LiveEvidenceRef = {
  readonly id: string;
  readonly label: string;
  readonly href?: string | null;
  readonly note?: string | null;
};

export type LiveLabState = {
  readonly hypothesis?: string | null;
  readonly method?: string | null;
  readonly variables?: readonly string[];
  readonly observations?: readonly string[];
  readonly uncertainties?: readonly string[];
  readonly contradictions?: readonly string[];
  readonly safetyNotes?: string | null;
};

export type LivePracticeState = {
  readonly scenario?: string | null;
  readonly feedbackNotes?: readonly string[];
  readonly aiParticipantsLabeled: boolean;
};

export type LiveRelatedEntity = {
  readonly kind: string;
  readonly id: string;
  readonly name: string;
};

export type LiveParticipant = {
  readonly id: string;
  readonly displayName: string;
  readonly kind: LiveParticipantKind;
  readonly role: LiveParticipantRole;
  readonly speakLocale: LiveRoomLocale | string;
  readonly readLocale: LiveRoomLocale | string;
  readonly hearLocale: LiveRoomLocale | string;
  readonly hearTranslatedAudio: boolean;
  readonly joinedAt: string;
  readonly leftAt?: string | null;
};

export type LiveIntelligenceRoom = {
  readonly schemaVersion: typeof LIVE_ROOM_SCHEMA_VERSION;
  readonly roomId: string;
  readonly roomType: LiveRoomType;
  readonly title: string;
  readonly description: string;
  readonly objective: string;
  readonly lifecycle: LiveRoomLifecycle;
  readonly connectionState: LiveRoomConnectionState;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly operationalObjectIds: readonly string[];
  readonly relatedEntities: readonly LiveRelatedEntity[];
  readonly sourceRoute?: string | null;
  readonly hostParticipantId: string;
  readonly participants: readonly LiveParticipant[];
  readonly activeSpeakerParticipantId?: string | null;
  readonly agenda: readonly LiveAgendaItem[];
  readonly glossary: readonly LiveGlossaryTerm[];
  readonly transcript: readonly LiveTranscriptTurn[];
  readonly questions: readonly LiveQuestion[];
  readonly decisions: readonly LiveDecision[];
  readonly actionItems: readonly LiveActionItem[];
  readonly evidenceRefs: readonly LiveEvidenceRef[];
  readonly laboratory?: LiveLabState | null;
  readonly practice?: LivePracticeState | null;
  readonly consent: LiveConsentState;
  readonly multiPartyTransportAvailable: boolean;
  readonly multiPartyTransportLabel: string;
  readonly createdLocale: string;
  readonly contentLocale: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly startedAt?: string | null;
  readonly endedAt?: string | null;
  /** Unknown fields preserved across migrations. */
  readonly [key: string]: unknown;
};

export type CreateLiveRoomInput = {
  readonly roomType: LiveRoomType;
  readonly title: string;
  readonly description?: string;
  readonly objective?: string;
  readonly hostDisplayName: string;
  readonly hostSpeakLocale: LiveRoomLocale | string;
  readonly hostReadLocale: LiveRoomLocale | string;
  readonly hostHearLocale: LiveRoomLocale | string;
  readonly hearTranslatedAudio?: boolean;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly sourceRoute?: string | null;
  readonly recordingAllowed?: boolean;
  readonly translationAudioAllowed?: boolean;
  readonly retentionDays?: number;
  readonly createdLocale?: string;
};
