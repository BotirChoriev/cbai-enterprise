/**
 * CBAI Live Intelligence / Collaboration Rooms — canonical session model.
 * Schema v2 is additive: legacy v1 rooms migrate without data loss.
 * Multi-party conferencing remains adapter-gated; Preview uses host Voice Operator + honest placeholders.
 */

export const LIVE_ROOM_SCHEMA_VERSION = 2 as const;

/** Legacy + collaboration room types. Unknown values migrate safely. */
export type LiveRoomType =
  | "meeting_hall"
  | "laboratory"
  | "practice"
  | "collaboration"
  | "scientific_deliberation"
  | "project_presentation"
  | "live_laboratory"
  | "conference"
  | "methodology_clinic"
  | "replication_session"
  | "public_presentation"
  | "expert_council"
  | "hybrid_meeting";

export const LIVE_ROOM_TYPES: readonly LiveRoomType[] = [
  "scientific_deliberation",
  "project_presentation",
  "live_laboratory",
  "conference",
  "collaboration",
  "methodology_clinic",
  "replication_session",
  "public_presentation",
  "expert_council",
  "hybrid_meeting",
  "meeting_hall",
  "laboratory",
  "practice",
] as const;

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
  | "moderator"
  | "presenter"
  | "researcher"
  | "methodologist"
  | "statistician"
  | "institutional_representative"
  | "student"
  | "observer"
  | "public_audience"
  | "human_approver"
  | "participant"
  | "ai_simulated";

export const LIVE_PARTICIPANT_ROLES: readonly LiveParticipantRole[] = [
  "host",
  "moderator",
  "presenter",
  "researcher",
  "methodologist",
  "statistician",
  "institutional_representative",
  "student",
  "observer",
  "public_audience",
  "human_approver",
  "participant",
  "ai_simulated",
] as const;

export type LiveParticipantKind = "human" | "ai_simulated";

export type IdentityProvenance =
  | "verified_cbai_member"
  | "verified_institutional"
  | "researcher_identifier_verified"
  | "invited_guest"
  | "unverified_guest"
  | "public_observer"
  | "offline_attendee"
  | "ai_simulated";

export type AttendanceMode = "online" | "offline" | "hybrid";

export type AccessMode = "private" | "invite" | "link" | "public";

export type GuestPolicy = "none" | "display_name" | "moderated" | "open_observer";

export type ConfidentialityLevel = "open" | "internal" | "confidential" | "restricted";

export type IntellectualPropertyStatus =
  | "not_claimed"
  | "shared_under_review"
  | "institution_owned"
  | "unknown";

export type RecordingState = "off" | "consented_local_only" | "unavailable";

export type TranscriptState = "off" | "session_only" | "consented_retain" | "unavailable";

export type HumanApprovalState = "not_required" | "pending" | "approved" | "rejected";

export type CapabilityStage =
  | "available"
  | "preview"
  | "connection_required"
  | "unavailable"
  | "permission_required"
  | "planned";

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
  readonly transcriptRetainAllowed: boolean;
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

export type LiveMaterialProvenance = {
  readonly id: string;
  readonly originalTitle: string;
  readonly author?: string | null;
  readonly institution?: string | null;
  readonly fileOrSource: string;
  readonly uploadedOrPublishedAt?: string | null;
  readonly license?: string | null;
  readonly confidentiality: ConfidentialityLevel;
  readonly version: string;
  readonly visibility: "host_only" | "participants" | "public" | "unknown";
  readonly sourceLanguage: string;
  readonly contentLocale: string;
  readonly verificationStatus: "unverified" | "official_source" | "cbai_analysis" | "human_confirmed";
  readonly cbaiAnalysisSeparate: boolean;
  readonly humanConfirmationStatus: HumanApprovalState;
  readonly kind:
    | "pdf"
    | "image"
    | "video"
    | "audio"
    | "presentation"
    | "dataset"
    | "doi"
    | "orcid"
    | "url"
    | "research_summary"
    | "other";
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

export type LiveSchedule = {
  readonly startNow: boolean;
  readonly scheduledStart: string | null;
  readonly scheduledEnd: string | null;
  readonly timezone: string;
  readonly recurrence: "none" | "daily" | "weekly" | "monthly" | "custom";
  readonly recurrenceRule?: string | null;
};

export type LiveAccessPolicy = {
  readonly accessMode: AccessMode;
  readonly guestPolicy: GuestPolicy;
  readonly waitingRoom: boolean;
  readonly participantLimit: number | null;
  /** One-time codes are stored hashed locally; plaintext never listed to other participants. */
  readonly accessCodeHint: string | null;
  readonly inviteLinkToken: string | null;
};

export type LivePublicSessionConfig = {
  readonly enabled: boolean;
  readonly landingTitle: string;
  readonly landingPurpose: string;
  readonly registrationPolicy: "open" | "moderated" | "invite_only" | "unavailable";
  readonly audienceMode: "listen_only" | "moderated_questions" | "unavailable";
  readonly publicMaterialBoundary: "none_public" | "agenda_only" | "selected_materials";
  readonly replayPolicy: "none" | "planned" | "unavailable";
  readonly hostingAvailable: boolean;
  readonly hostingLabelKey: string;
};

export type LiveInvitationDraft = {
  readonly id: string;
  readonly channel: "link" | "email" | "sms" | "qr" | "access_code";
  readonly recipientDisplay: string;
  /** Never expose raw email/phone to other participants — stored only for host draft review. */
  readonly recipientContactPrivate: string | null;
  readonly accessLevel: AccessMode;
  readonly expiresAt: string | null;
  readonly status: "draft" | "confirmed_pending_delivery" | "sent" | "failed" | "cancelled";
  readonly deliveryAvailable: boolean;
  readonly deliveryUnavailableReason: string | null;
  readonly confirmedAt: string | null;
};

export type LiveAuditEvent = {
  readonly id: string;
  readonly at: string;
  readonly actorDisplayName: string;
  readonly action: string;
  readonly detail?: string | null;
};

export type LiveParticipant = {
  readonly id: string;
  readonly displayName: string;
  readonly kind: LiveParticipantKind;
  readonly role: LiveParticipantRole;
  readonly identityProvenance: IdentityProvenance;
  readonly speakLocale: LiveRoomLocale | string;
  readonly readLocale: LiveRoomLocale | string;
  readonly hearLocale: LiveRoomLocale | string;
  readonly hearTranslatedAudio: boolean;
  readonly joinedAt: string;
  readonly leftAt?: string | null;
  /** Private contact fields — never rendered to other participants by default. */
  readonly emailPrivate?: string | null;
  readonly phonePrivate?: string | null;
  readonly orcid?: string | null;
  readonly institutionName?: string | null;
};

export type LiveIntelligenceRoom = {
  readonly schemaVersion: typeof LIVE_ROOM_SCHEMA_VERSION;
  readonly roomId: string;
  readonly roomType: LiveRoomType;
  readonly title: string;
  readonly description: string;
  readonly objective: string;
  readonly purpose: string;
  readonly expectedOutcome: string;
  readonly topicDomain: string;
  readonly lifecycle: LiveRoomLifecycle;
  readonly connectionState: LiveRoomConnectionState;
  readonly status: LiveRoomLifecycle;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly operationalObjectIds: readonly string[];
  readonly relatedEntities: readonly LiveRelatedEntity[];
  readonly sourceRoute?: string | null;
  readonly hostParticipantId: string;
  readonly hostDisplayName: string;
  readonly moderatorIds: readonly string[];
  readonly approverIds: readonly string[];
  readonly participants: readonly LiveParticipant[];
  readonly activeSpeakerParticipantId?: string | null;
  readonly agenda: readonly LiveAgendaItem[];
  readonly glossary: readonly LiveGlossaryTerm[];
  readonly transcript: readonly LiveTranscriptTurn[];
  readonly questions: readonly LiveQuestion[];
  readonly decisions: readonly LiveDecision[];
  readonly actionItems: readonly LiveActionItem[];
  readonly evidenceRefs: readonly LiveEvidenceRef[];
  readonly presentationMaterials: readonly LiveMaterialProvenance[];
  readonly laboratory?: LiveLabState | null;
  readonly practice?: LivePracticeState | null;
  readonly consent: LiveConsentState;
  readonly schedule: LiveSchedule;
  readonly attendanceMode: AttendanceMode;
  readonly access: LiveAccessPolicy;
  readonly speakingLanguage: string;
  readonly readingLanguage: string;
  readonly listeningLanguage: string;
  readonly translationLanguages: readonly string[];
  readonly confidentiality: ConfidentialityLevel;
  readonly intellectualPropertyStatus: IntellectualPropertyStatus;
  readonly recordingState: RecordingState;
  readonly transcriptState: TranscriptState;
  readonly publicSession: LivePublicSessionConfig;
  readonly invitationDrafts: readonly LiveInvitationDraft[];
  readonly auditEvents: readonly LiveAuditEvent[];
  readonly humanApprovalState: HumanApprovalState;
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
  readonly purpose?: string;
  readonly expectedOutcome?: string;
  readonly topicDomain?: string;
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
  readonly transcriptRetainAllowed?: boolean;
  readonly retentionDays?: number;
  readonly createdLocale?: string;
  readonly attendanceMode?: AttendanceMode;
  readonly accessMode?: AccessMode;
  readonly guestPolicy?: GuestPolicy;
  readonly waitingRoom?: boolean;
  readonly participantLimit?: number | null;
  readonly schedule?: Partial<LiveSchedule>;
  readonly confidentiality?: ConfidentialityLevel;
  readonly intellectualPropertyStatus?: IntellectualPropertyStatus;
  readonly moderatorDisplayNames?: readonly string[];
  readonly presenterDisplayNames?: readonly string[];
  readonly approverDisplayName?: string | null;
  readonly materials?: readonly LiveMaterialProvenance[];
  readonly publicSession?: Partial<LivePublicSessionConfig>;
  readonly translationLanguages?: readonly string[];
  readonly identityProvenance?: IdentityProvenance;
  /** Required gate — room is not persisted without explicit confirmation. */
  readonly confirmCreate?: true;
};

export type WizardStepId = 1 | 2 | 3 | 4;

export type RoomCreateWizardState = {
  readonly step: WizardStepId;
  readonly title: string;
  readonly roomType: LiveRoomType;
  readonly purpose: string;
  readonly expectedOutcome: string;
  readonly topicDomain: string;
  readonly hostDisplayName: string;
  readonly moderatorDisplayName: string;
  readonly presenterDisplayNames: string;
  readonly observerNote: string;
  readonly approverDisplayName: string;
  readonly startNow: boolean;
  readonly scheduledStart: string;
  readonly scheduledEnd: string;
  readonly timezone: string;
  readonly recurrence: LiveSchedule["recurrence"];
  readonly attendanceMode: AttendanceMode;
  readonly accessMode: AccessMode;
  readonly guestPolicy: GuestPolicy;
  readonly waitingRoom: boolean;
  readonly participantLimit: string;
  readonly speakLocale: string;
  readonly readLocale: string;
  readonly hearLocale: string;
  readonly translationLanguages: string;
  readonly materialTitle: string;
  readonly materialSource: string;
  readonly materialKind: LiveMaterialProvenance["kind"];
  readonly confidentiality: ConfidentialityLevel;
  readonly intellectualPropertyStatus: IntellectualPropertyStatus;
  readonly recordingAllowed: boolean;
  readonly transcriptRetainAllowed: boolean;
  readonly translationAudioAllowed: boolean;
  readonly publicSessionEnabled: boolean;
  readonly confirmedReview: boolean;
};
