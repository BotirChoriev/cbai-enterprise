/**
 * Idempotent Live Room migration — preserves unknown fields, IDs, timestamps.
 */

import {
  LIVE_ROOM_SCHEMA_VERSION,
  type LiveConsentState,
  type LiveIntelligenceRoom,
  type LiveParticipant,
  type LiveRoomLifecycle,
  type LiveRoomType,
} from "@/lib/live-intelligence-rooms/types";

const CONSENT_POLICY_VERSION = "live-rooms-consent-v1";

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
    retentionDays: partial?.retentionDays ?? 30,
    acknowledgedAt: partial?.acknowledgedAt ?? null,
    policyVersion: partial?.policyVersion ?? CONSENT_POLICY_VERSION,
  };
}

function migrateParticipant(raw: unknown, index: number): LiveParticipant | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = asString(r.id, `participant-${index}`);
  const displayName = asString(r.displayName, "Participant");
  return {
    ...r,
    id,
    displayName,
    kind: r.kind === "ai_simulated" ? "ai_simulated" : "human",
    role:
      r.role === "presenter" ||
      r.role === "observer" ||
      r.role === "ai_simulated" ||
      r.role === "host"
        ? r.role
        : "participant",
    speakLocale: asString(r.speakLocale, "en"),
    readLocale: asString(r.readLocale, asString(r.speakLocale, "en")),
    hearLocale: asString(r.hearLocale, asString(r.readLocale, "en")),
    hearTranslatedAudio: Boolean(r.hearTranslatedAudio),
    joinedAt: asString(r.joinedAt, new Date(0).toISOString()),
    leftAt: typeof r.leftAt === "string" ? r.leftAt : null,
  };
}

export function migrateLiveIntelligenceRoom(raw: unknown): LiveIntelligenceRoom | null {
  const r = asRecord(raw);
  if (!r) return null;
  const roomId = asString(r.roomId || r.id);
  if (!roomId) return null;

  const roomType = (asString(r.roomType, "meeting_hall") as LiveRoomType) || "meeting_hall";
  const lifecycle = (asString(r.lifecycle, "draft") as LiveRoomLifecycle) || "draft";
  const participants = asArray(r.participants)
    .map((p, i) => migrateParticipant(p, i))
    .filter((p): p is LiveParticipant => p !== null);

  const hostParticipantId =
    asString(r.hostParticipantId) ||
    participants.find((p) => p.role === "host")?.id ||
    participants[0]?.id ||
    "host";

  const consentRaw = asRecord(r.consent);
  const consent = defaultConsent(
    consentRaw
      ? {
          recordingAllowed: Boolean(consentRaw.recordingAllowed),
          translationAudioAllowed: Boolean(consentRaw.translationAudioAllowed),
          retentionDays:
            typeof consentRaw.retentionDays === "number" ? consentRaw.retentionDays : 30,
          acknowledgedAt:
            typeof consentRaw.acknowledgedAt === "string" ? consentRaw.acknowledgedAt : null,
          policyVersion: asString(consentRaw.policyVersion, CONSENT_POLICY_VERSION),
        }
      : undefined,
  );

  const now = new Date().toISOString();

  return {
    ...r,
    schemaVersion: LIVE_ROOM_SCHEMA_VERSION,
    roomId,
    roomType:
      roomType === "laboratory" ||
      roomType === "practice" ||
      roomType === "collaboration" ||
      roomType === "meeting_hall"
        ? roomType
        : "meeting_hall",
    title: asString(r.title, "Untitled room"),
    description: asString(r.description),
    objective: asString(r.objective),
    lifecycle,
    connectionState:
      typeof r.connectionState === "string" ? (r.connectionState as LiveIntelligenceRoom["connectionState"]) : "ready",
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
  // Idempotent: second pass yields same roomIds and schemaVersion.
  return migrated.map((room) => migrateLiveIntelligenceRoom(room)!);
}

export { CONSENT_POLICY_VERSION };
