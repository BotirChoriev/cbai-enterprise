/**
 * Idempotent Live Room migration — preserves unknown fields, IDs, timestamps.
 * Schema v2 additive fields default safely for legacy v1 rooms.
 */

import {
  LIVE_ROOM_SCHEMA_VERSION,
  LIVE_ROOM_TYPES,
  LIVE_PARTICIPANT_ROLES,
  type LiveConsentState,
  type LiveIntelligenceRoom,
  type LiveParticipant,
  type LiveParticipantRole,
  type LiveRoomLifecycle,
  type LiveRoomType,
  type LiveSchedule,
  type LiveAccessPolicy,
  type LivePublicSessionConfig,
  type IdentityProvenance,
} from "@/lib/live-intelligence-rooms/types";

const CONSENT_POLICY_VERSION = "live-rooms-consent-v2";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function defaultConsent(partial?: Partial<LiveConsentState>): LiveConsentState {
  return {
    recordingAllowed: partial?.recordingAllowed ?? false,
    translationAudioAllowed: partial?.translationAudioAllowed ?? false,
    transcriptRetainAllowed: partial?.transcriptRetainAllowed ?? false,
    retentionDays: partial?.retentionDays ?? 30,
    acknowledgedAt: partial?.acknowledgedAt ?? null,
    policyVersion: partial?.policyVersion ?? CONSENT_POLICY_VERSION,
  };
}

function normalizeRoomType(raw: string): LiveRoomType {
  if ((LIVE_ROOM_TYPES as readonly string[]).includes(raw)) return raw as LiveRoomType;
  return "meeting_hall";
}

function normalizeRole(raw: unknown): LiveParticipantRole {
  if (typeof raw === "string" && (LIVE_PARTICIPANT_ROLES as readonly string[]).includes(raw)) {
    return raw as LiveParticipantRole;
  }
  return "participant";
}

function defaultSchedule(partial?: Partial<LiveSchedule> | null): LiveSchedule {
  return {
    startNow: partial?.startNow ?? true,
    scheduledStart: partial?.scheduledStart ?? null,
    scheduledEnd: partial?.scheduledEnd ?? null,
    timezone: partial?.timezone || "UTC",
    recurrence: partial?.recurrence ?? "none",
    recurrenceRule: partial?.recurrenceRule ?? null,
  };
}

function defaultAccess(partial?: Partial<LiveAccessPolicy> | null): LiveAccessPolicy {
  return {
    accessMode: partial?.accessMode ?? "private",
    guestPolicy: partial?.guestPolicy ?? "display_name",
    waitingRoom: partial?.waitingRoom ?? false,
    participantLimit: typeof partial?.participantLimit === "number" ? partial.participantLimit : null,
    accessCodeHint: partial?.accessCodeHint ?? null,
    inviteLinkToken: partial?.inviteLinkToken ?? null,
  };
}

function defaultPublicSession(partial?: Partial<LivePublicSessionConfig> | null): LivePublicSessionConfig {
  return {
    enabled: partial?.enabled ?? false,
    landingTitle: partial?.landingTitle ?? "",
    landingPurpose: partial?.landingPurpose ?? "",
    registrationPolicy: partial?.registrationPolicy ?? "unavailable",
    audienceMode: partial?.audienceMode ?? "unavailable",
    publicMaterialBoundary: partial?.publicMaterialBoundary ?? "none_public",
    replayPolicy: partial?.replayPolicy ?? "unavailable",
    hostingAvailable: false,
    hostingLabelKey: partial?.hostingLabelKey ?? "lcr.publicHostingUnavailable",
  };
}

function migrateParticipant(raw: unknown, index: number): LiveParticipant | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = asString(r.id, `participant-${index}`);
  const displayName = asString(r.displayName, "Participant");
  const kind = r.kind === "ai_simulated" ? "ai_simulated" : "human";
  const role = normalizeRole(r.role);
  const identityProvenance: IdentityProvenance =
    typeof r.identityProvenance === "string"
      ? (r.identityProvenance as IdentityProvenance)
      : kind === "ai_simulated"
        ? "ai_simulated"
        : "unverified_guest";
  return {
    ...r,
    id,
    displayName,
    kind,
    role: kind === "ai_simulated" ? "ai_simulated" : role,
    identityProvenance,
    speakLocale: asString(r.speakLocale, "en"),
    readLocale: asString(r.readLocale, asString(r.speakLocale, "en")),
    hearLocale: asString(r.hearLocale, asString(r.readLocale, "en")),
    hearTranslatedAudio: Boolean(r.hearTranslatedAudio),
    joinedAt: asString(r.joinedAt, new Date(0).toISOString()),
    leftAt: typeof r.leftAt === "string" ? r.leftAt : null,
    emailPrivate: typeof r.emailPrivate === "string" ? r.emailPrivate : null,
    phonePrivate: typeof r.phonePrivate === "string" ? r.phonePrivate : null,
    orcid: typeof r.orcid === "string" ? r.orcid : null,
    institutionName: typeof r.institutionName === "string" ? r.institutionName : null,
  };
}

export function migrateLiveIntelligenceRoom(raw: unknown): LiveIntelligenceRoom | null {
  const r = asRecord(raw);
  if (!r) return null;
  const roomId = asString(r.roomId || r.id);
  if (!roomId) return null;

  const roomType = normalizeRoomType(asString(r.roomType, "meeting_hall"));
  const lifecycle = (asString(r.lifecycle, "draft") as LiveRoomLifecycle) || "draft";
  const participants = asArray(r.participants)
    .map((p, i) => migrateParticipant(p, i))
    .filter((p): p is LiveParticipant => p !== null);

  const hostParticipantId =
    asString(r.hostParticipantId) ||
    participants.find((p) => p.role === "host")?.id ||
    participants[0]?.id ||
    "host";

  const hostDisplayName =
    asString(r.hostDisplayName) ||
    participants.find((p) => p.id === hostParticipantId)?.displayName ||
    "Host";

  const consentRaw = asRecord(r.consent);
  const consent = defaultConsent(
    consentRaw
      ? {
          recordingAllowed: Boolean(consentRaw.recordingAllowed),
          translationAudioAllowed: Boolean(consentRaw.translationAudioAllowed),
          transcriptRetainAllowed: Boolean(consentRaw.transcriptRetainAllowed),
          retentionDays:
            typeof consentRaw.retentionDays === "number" ? consentRaw.retentionDays : 30,
          acknowledgedAt:
            typeof consentRaw.acknowledgedAt === "string" ? consentRaw.acknowledgedAt : null,
          policyVersion: asString(consentRaw.policyVersion, CONSENT_POLICY_VERSION),
        }
      : undefined,
  );

  const scheduleRaw = asRecord(r.schedule);
  const schedule = defaultSchedule(
    scheduleRaw
      ? {
          startNow: scheduleRaw.startNow !== false,
          scheduledStart: typeof scheduleRaw.scheduledStart === "string" ? scheduleRaw.scheduledStart : null,
          scheduledEnd: typeof scheduleRaw.scheduledEnd === "string" ? scheduleRaw.scheduledEnd : null,
          timezone: asString(scheduleRaw.timezone, "UTC"),
          recurrence:
            scheduleRaw.recurrence === "daily" ||
            scheduleRaw.recurrence === "weekly" ||
            scheduleRaw.recurrence === "monthly" ||
            scheduleRaw.recurrence === "custom"
              ? scheduleRaw.recurrence
              : "none",
          recurrenceRule: typeof scheduleRaw.recurrenceRule === "string" ? scheduleRaw.recurrenceRule : null,
        }
      : {
          startNow: true,
          scheduledStart: typeof r.scheduledStart === "string" ? r.scheduledStart : null,
          scheduledEnd: typeof r.scheduledEnd === "string" ? r.scheduledEnd : null,
          timezone: asString(r.timezone, "UTC"),
          recurrence: "none",
        },
  );

  const accessRaw = asRecord(r.access);
  const access = defaultAccess(
    accessRaw
      ? {
          accessMode:
            accessRaw.accessMode === "invite" ||
            accessRaw.accessMode === "link" ||
            accessRaw.accessMode === "public"
              ? accessRaw.accessMode
              : "private",
          guestPolicy:
            accessRaw.guestPolicy === "none" ||
            accessRaw.guestPolicy === "moderated" ||
            accessRaw.guestPolicy === "open_observer"
              ? accessRaw.guestPolicy
              : "display_name",
          waitingRoom: Boolean(accessRaw.waitingRoom),
          participantLimit:
            typeof accessRaw.participantLimit === "number" ? accessRaw.participantLimit : null,
          accessCodeHint: typeof accessRaw.accessCodeHint === "string" ? accessRaw.accessCodeHint : null,
          inviteLinkToken: typeof accessRaw.inviteLinkToken === "string" ? accessRaw.inviteLinkToken : null,
        }
      : undefined,
  );

  const publicRaw = asRecord(r.publicSession);
  const publicSession = defaultPublicSession(
    publicRaw
      ? {
          enabled: Boolean(publicRaw.enabled),
          landingTitle: asString(publicRaw.landingTitle),
          landingPurpose: asString(publicRaw.landingPurpose),
          registrationPolicy:
            publicRaw.registrationPolicy === "open" ||
            publicRaw.registrationPolicy === "moderated" ||
            publicRaw.registrationPolicy === "invite_only"
              ? publicRaw.registrationPolicy
              : "unavailable",
          audienceMode:
            publicRaw.audienceMode === "listen_only" || publicRaw.audienceMode === "moderated_questions"
              ? publicRaw.audienceMode
              : "unavailable",
          publicMaterialBoundary:
            publicRaw.publicMaterialBoundary === "agenda_only" ||
            publicRaw.publicMaterialBoundary === "selected_materials"
              ? publicRaw.publicMaterialBoundary
              : "none_public",
          replayPolicy:
            publicRaw.replayPolicy === "none" || publicRaw.replayPolicy === "planned"
              ? publicRaw.replayPolicy
              : "unavailable",
          hostingLabelKey: asString(publicRaw.hostingLabelKey, "lcr.publicHostingUnavailable"),
        }
      : undefined,
  );

  const now = new Date().toISOString();
  const purpose = asString(r.purpose, asString(r.objective));
  const objective = asString(r.objective, purpose);

  return {
    ...r,
    schemaVersion: LIVE_ROOM_SCHEMA_VERSION,
    roomId,
    roomType,
    title: asString(r.title, "Untitled room"),
    description: asString(r.description),
    objective,
    purpose,
    expectedOutcome: asString(r.expectedOutcome),
    topicDomain: asString(r.topicDomain),
    lifecycle,
    status: lifecycle,
    connectionState:
      typeof r.connectionState === "string"
        ? (r.connectionState as LiveIntelligenceRoom["connectionState"])
        : "ready",
    missionId: typeof r.missionId === "string" ? r.missionId : null,
    projectId: typeof r.projectId === "string" ? r.projectId : null,
    operationalObjectIds: asArray(r.operationalObjectIds).filter(
      (id): id is string => typeof id === "string",
    ),
    relatedEntities: asArray(r.relatedEntities)
      .map((e) => asRecord(e))
      .filter((e): e is Record<string, unknown> => e !== null)
      .map((e) => ({
        kind: asString(e.kind, "unknown"),
        id: asString(e.id),
        name: asString(e.name),
      }))
      .filter((e) => e.id),
    sourceRoute: typeof r.sourceRoute === "string" ? r.sourceRoute : null,
    hostParticipantId,
    hostDisplayName,
    moderatorIds: asArray(r.moderatorIds).filter((id): id is string => typeof id === "string"),
    approverIds: asArray(r.approverIds).filter((id): id is string => typeof id === "string"),
    participants,
    activeSpeakerParticipantId:
      typeof r.activeSpeakerParticipantId === "string" ? r.activeSpeakerParticipantId : null,
    agenda: asArray(r.agenda).map((item, i) => {
      const a = asRecord(item) ?? {};
      return {
        id: asString(a.id, `agenda-${i}`),
        title: asString(a.title, "Agenda item"),
        done: Boolean(a.done),
      };
    }),
    glossary: asArray(r.glossary).map((item, i) => {
      const g = asRecord(item) ?? {};
      return {
        id: asString(g.id, `glossary-${i}`),
        term: asString(g.term),
        preferredTranslations:
          (asRecord(g.preferredTranslations) as LiveIntelligenceRoom["glossary"][number]["preferredTranslations"]) ??
          {},
        doNotTranslate: Boolean(g.doNotTranslate),
        definition: typeof g.definition === "string" ? g.definition : undefined,
        evidenceRefIds: asArray(g.evidenceRefIds).filter((x): x is string => typeof x === "string"),
        approvedByParticipantId:
          typeof g.approvedByParticipantId === "string" ? g.approvedByParticipantId : null,
      };
    }),
    transcript: asArray(r.transcript).map((item, i) => {
      const t = asRecord(item) ?? {};
      return {
        id: asString(t.id, `turn-${i}`),
        speakerParticipantId: asString(t.speakerParticipantId, hostParticipantId),
        originalText: asString(t.originalText),
        originalLocale: asString(t.originalLocale, "en"),
        translatedVariants:
          (asRecord(t.translatedVariants) as LiveIntelligenceRoom["transcript"][number]["translatedVariants"]) ??
          {},
        translationStatus:
          (asString(t.translationStatus, "original_only") as LiveIntelligenceRoom["transcript"][number]["translationStatus"]) ||
          "original_only",
        translationUncertainty:
          typeof t.translationUncertainty === "string" ? t.translationUncertainty : null,
        glossaryTermIds: asArray(t.glossaryTermIds).filter((x): x is string => typeof x === "string"),
        createdAt: asString(t.createdAt, now),
        isSyntheticAudio: Boolean(t.isSyntheticAudio),
      };
    }),
    questions: asArray(r.questions).map((item, i) => {
      const q = asRecord(item) ?? {};
      return {
        id: asString(q.id, `q-${i}`),
        text: asString(q.text),
        locale: asString(q.locale, "en"),
        resolved: Boolean(q.resolved),
        createdAt: asString(q.createdAt, now),
      };
    }),
    decisions: asArray(r.decisions).map((item, i) => {
      const d = asRecord(item) ?? {};
      return {
        id: asString(d.id, `d-${i}`),
        text: asString(d.text),
        requiresHumanConfirmation: d.requiresHumanConfirmation !== false,
        confirmed: Boolean(d.confirmed),
        createdAt: asString(d.createdAt, now),
      };
    }),
    actionItems: asArray(r.actionItems).map((item, i) => {
      const a = asRecord(item) ?? {};
      return {
        id: asString(a.id, `a-${i}`),
        text: asString(a.text),
        ownerParticipantId: typeof a.ownerParticipantId === "string" ? a.ownerParticipantId : null,
        dueAt: typeof a.dueAt === "string" ? a.dueAt : null,
        done: Boolean(a.done),
      };
    }),
    evidenceRefs: asArray(r.evidenceRefs).map((item, i) => {
      const e = asRecord(item) ?? {};
      return {
        id: asString(e.id, `ev-${i}`),
        label: asString(e.label),
        href: typeof e.href === "string" ? e.href : null,
        note: typeof e.note === "string" ? e.note : null,
      };
    }),
    presentationMaterials: asArray(r.presentationMaterials).map((item, i) => {
      const m = asRecord(item) ?? {};
      return {
        id: asString(m.id, `mat-${i}`),
        originalTitle: asString(m.originalTitle, "Untitled material"),
        author: typeof m.author === "string" ? m.author : null,
        institution: typeof m.institution === "string" ? m.institution : null,
        fileOrSource: asString(m.fileOrSource, "unknown"),
        uploadedOrPublishedAt: typeof m.uploadedOrPublishedAt === "string" ? m.uploadedOrPublishedAt : null,
        license: typeof m.license === "string" ? m.license : null,
        confidentiality:
          m.confidentiality === "open" ||
          m.confidentiality === "internal" ||
          m.confidentiality === "restricted"
            ? m.confidentiality
            : "confidential",
        version: asString(m.version, "1"),
        visibility:
          m.visibility === "host_only" || m.visibility === "participants" || m.visibility === "public"
            ? m.visibility
            : "unknown",
        sourceLanguage: asString(m.sourceLanguage, "en"),
        contentLocale: asString(m.contentLocale, "en"),
        verificationStatus:
          m.verificationStatus === "official_source" ||
          m.verificationStatus === "cbai_analysis" ||
          m.verificationStatus === "human_confirmed"
            ? m.verificationStatus
            : "unverified",
        cbaiAnalysisSeparate: m.cbaiAnalysisSeparate !== false,
        humanConfirmationStatus:
          m.humanConfirmationStatus === "approved" ||
          m.humanConfirmationStatus === "rejected" ||
          m.humanConfirmationStatus === "pending"
            ? m.humanConfirmationStatus
            : "not_required",
        kind:
          m.kind === "pdf" ||
          m.kind === "image" ||
          m.kind === "video" ||
          m.kind === "audio" ||
          m.kind === "presentation" ||
          m.kind === "dataset" ||
          m.kind === "doi" ||
          m.kind === "orcid" ||
          m.kind === "url" ||
          m.kind === "research_summary"
            ? m.kind
            : "other",
      };
    }),
    laboratory: asRecord(r.laboratory)
      ? {
          hypothesis: typeof asRecord(r.laboratory)!.hypothesis === "string" ? String(asRecord(r.laboratory)!.hypothesis) : null,
          method: typeof asRecord(r.laboratory)!.method === "string" ? String(asRecord(r.laboratory)!.method) : null,
          variables: asArray(asRecord(r.laboratory)!.variables).filter((x): x is string => typeof x === "string"),
          observations: asArray(asRecord(r.laboratory)!.observations).filter((x): x is string => typeof x === "string"),
          uncertainties: asArray(asRecord(r.laboratory)!.uncertainties).filter((x): x is string => typeof x === "string"),
          contradictions: asArray(asRecord(r.laboratory)!.contradictions).filter((x): x is string => typeof x === "string"),
          safetyNotes:
            typeof asRecord(r.laboratory)!.safetyNotes === "string"
              ? String(asRecord(r.laboratory)!.safetyNotes)
              : null,
        }
      : null,
    practice: asRecord(r.practice)
      ? {
          scenario: typeof asRecord(r.practice)!.scenario === "string" ? String(asRecord(r.practice)!.scenario) : null,
          feedbackNotes: asArray(asRecord(r.practice)!.feedbackNotes).filter((x): x is string => typeof x === "string"),
          aiParticipantsLabeled: asRecord(r.practice)!.aiParticipantsLabeled !== false,
        }
      : roomType === "practice"
        ? { scenario: null, feedbackNotes: [], aiParticipantsLabeled: true }
        : null,
    consent,
    schedule,
    attendanceMode:
      r.attendanceMode === "offline" || r.attendanceMode === "hybrid" ? r.attendanceMode : "online",
    access,
    speakingLanguage: asString(r.speakingLanguage, asString(r.createdLocale, "en")),
    readingLanguage: asString(r.readingLanguage, asString(r.createdLocale, "en")),
    listeningLanguage: asString(r.listeningLanguage, asString(r.createdLocale, "en")),
    translationLanguages: asArray(r.translationLanguages).filter((x): x is string => typeof x === "string"),
    confidentiality:
      r.confidentiality === "open" ||
      r.confidentiality === "internal" ||
      r.confidentiality === "restricted"
        ? r.confidentiality
        : "internal",
    intellectualPropertyStatus:
      r.intellectualPropertyStatus === "shared_under_review" ||
      r.intellectualPropertyStatus === "institution_owned" ||
      r.intellectualPropertyStatus === "unknown"
        ? r.intellectualPropertyStatus
        : "not_claimed",
    recordingState:
      consent.recordingAllowed
        ? "consented_local_only"
        : r.recordingState === "unavailable"
          ? "unavailable"
          : "off",
    transcriptState:
      consent.transcriptRetainAllowed
        ? "consented_retain"
        : r.transcriptState === "session_only"
          ? "session_only"
          : r.transcriptState === "unavailable"
            ? "unavailable"
            : "off",
    publicSession,
    invitationDrafts: asArray(r.invitationDrafts).map((item, i) => {
      const inv = asRecord(item) ?? {};
      return {
        id: asString(inv.id, `inv-${i}`),
        channel:
          inv.channel === "email" ||
          inv.channel === "sms" ||
          inv.channel === "qr" ||
          inv.channel === "access_code"
            ? inv.channel
            : "link",
        recipientDisplay: asString(inv.recipientDisplay, "Guest"),
        recipientContactPrivate:
          typeof inv.recipientContactPrivate === "string" ? inv.recipientContactPrivate : null,
        accessLevel:
          inv.accessLevel === "invite" || inv.accessLevel === "link" || inv.accessLevel === "public"
            ? inv.accessLevel
            : "private",
        expiresAt: typeof inv.expiresAt === "string" ? inv.expiresAt : null,
        status:
          inv.status === "confirmed_pending_delivery" ||
          inv.status === "sent" ||
          inv.status === "failed" ||
          inv.status === "cancelled"
            ? inv.status
            : "draft",
        deliveryAvailable: Boolean(inv.deliveryAvailable),
        deliveryUnavailableReason:
          typeof inv.deliveryUnavailableReason === "string" ? inv.deliveryUnavailableReason : null,
        confirmedAt: typeof inv.confirmedAt === "string" ? inv.confirmedAt : null,
      };
    }),
    auditEvents: asArray(r.auditEvents).map((item, i) => {
      const a = asRecord(item) ?? {};
      return {
        id: asString(a.id, `audit-${i}`),
        at: asString(a.at, now),
        actorDisplayName: asString(a.actorDisplayName, "system"),
        action: asString(a.action, "unknown"),
        detail: typeof a.detail === "string" ? a.detail : null,
      };
    }),
    humanApprovalState:
      r.humanApprovalState === "approved" ||
      r.humanApprovalState === "rejected" ||
      r.humanApprovalState === "pending"
        ? r.humanApprovalState
        : "pending",
    multiPartyTransportAvailable: Boolean(r.multiPartyTransportAvailable),
    multiPartyTransportLabel: asString(
      r.multiPartyTransportLabel,
      "Multi-party live audio is not available in this Preview build — host Voice Operator + simulated listeners only.",
    ),
    createdLocale: asString(r.createdLocale, "en"),
    contentLocale: asString(r.contentLocale, asString(r.createdLocale, "en")),
    createdAt: asString(r.createdAt, now),
    updatedAt: asString(r.updatedAt, now),
    startedAt: typeof r.startedAt === "string" ? r.startedAt : null,
    endedAt: typeof r.endedAt === "string" ? r.endedAt : null,
  };
}

export function migrateLiveRoomCollection(raw: unknown): LiveIntelligenceRoom[] {
  const list = Array.isArray(raw) ? raw : asRecord(raw)?.rooms;
  if (!Array.isArray(list)) return [];
  const migrated = list
    .map((item) => migrateLiveIntelligenceRoom(item))
    .filter((r): r is LiveIntelligenceRoom => r !== null);
  return migrated.map((room) => migrateLiveIntelligenceRoom(room)!);
}

export { CONSENT_POLICY_VERSION, defaultSchedule, defaultAccess, defaultPublicSession };
