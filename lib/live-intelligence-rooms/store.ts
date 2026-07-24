/**
 * Live Intelligence Rooms persistence — namespaced localStorage, unknown-field safe.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { migrateLiveRoomCollection, migrateLiveIntelligenceRoom, CONSENT_POLICY_VERSION } from "@/lib/live-intelligence-rooms/migration";
import { buildTranscriptTurn } from "@/lib/live-intelligence-rooms/translation-routing";
import type {
  CreateLiveRoomInput,
  LiveGlossaryTerm,
  LiveIntelligenceRoom,
  LiveLabState,
  LiveParticipant,
  LivePracticeState,
  LiveRelatedEntity,
  LiveRoomLifecycle,
} from "@/lib/live-intelligence-rooms/types";

const STORAGE_KEY = "cbai-live-intelligence-rooms";

const memoryRooms: LiveIntelligenceRoom[] = [];
let cachedSnapshot: LiveIntelligenceRoom[] = [];
let cachedSnapshotToken = "";
const EMPTY_ROOMS: readonly LiveIntelligenceRoom[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAllRaw(): unknown {
  if (!isBrowser()) return memoryRooms;
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(STORAGE_KEY));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function snapshotToken(rooms: readonly LiveIntelligenceRoom[]): string {
  return rooms.map((r) => `${r.roomId}:${r.updatedAt}`).join("|");
}

function writeAll(rooms: LiveIntelligenceRoom[]): void {
  memoryRooms.length = 0;
  memoryRooms.push(...rooms);
  cachedSnapshot = rooms;
  cachedSnapshotToken = snapshotToken(rooms);
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(STORAGE_KEY), JSON.stringify(rooms));
  window.dispatchEvent(new Event("cbai-live-rooms-changed"));
}

export function listLiveRooms(): LiveIntelligenceRoom[] {
  const rooms = migrateLiveRoomCollection(readAllRaw()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const token = snapshotToken(rooms);
  if (token === cachedSnapshotToken && cachedSnapshot.length === rooms.length) {
    return cachedSnapshot;
  }
  cachedSnapshot = rooms;
  cachedSnapshotToken = token;
  return cachedSnapshot;
}

/** Stable empty snapshot for SSR (React useSyncExternalStore). */
export function getEmptyLiveRoomsSnapshot(): readonly LiveIntelligenceRoom[] {
  return EMPTY_ROOMS;
}

/** Subscribe to same-tab + cross-tab live room store changes (for useSyncExternalStore). */
export function subscribeLiveRooms(onStoreChange: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("cbai-live-rooms-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("cbai-live-rooms-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

export function getLiveRoom(roomId: string): LiveIntelligenceRoom | null {
  return listLiveRooms().find((r) => r.roomId === roomId) ?? null;
}

/** Cached room getter for useSyncExternalStore client snapshots. */
const roomSnapshotCache = new Map<string, LiveIntelligenceRoom | null>();

export function getLiveRoomSnapshot(roomId: string): LiveIntelligenceRoom | null {
  const room = getLiveRoom(roomId);
  const prev = roomSnapshotCache.get(roomId);
  if (prev && room && prev.updatedAt === room.updatedAt && prev.roomId === room.roomId) {
    return prev;
  }
  roomSnapshotCache.set(roomId, room);
  return room;
}

export function createLiveRoom(input: CreateLiveRoomInput): LiveIntelligenceRoom {
  const now = new Date().toISOString();
  const hostId = newId("host");
  const host: LiveParticipant = {
    id: hostId,
    displayName: input.hostDisplayName.trim() || "Host",
    kind: "human",
    role: "host",
    speakLocale: input.hostSpeakLocale,
    readLocale: input.hostReadLocale,
    hearLocale: input.hostHearLocale,
    hearTranslatedAudio: Boolean(input.hearTranslatedAudio),
    joinedAt: now,
    leftAt: null,
  };

  const room: LiveIntelligenceRoom = {
    schemaVersion: 1,
    roomId: newId("room"),
    roomType: input.roomType,
    title: input.title.trim() || "Untitled room",
    description: input.description?.trim() ?? "",
    objective: input.objective?.trim() ?? "",
    lifecycle: "ready",
    connectionState: "ready",
    missionId: input.missionId ?? null,
    projectId: input.projectId ?? null,
    operationalObjectIds: [],
    relatedEntities: [],
    sourceRoute: input.sourceRoute ?? "/rooms",
    hostParticipantId: hostId,
    participants: [host],
    activeSpeakerParticipantId: hostId,
    agenda: [],
    glossary: [],
    transcript: [],
    questions: [],
    decisions: [],
    actionItems: [],
    evidenceRefs: [],
    laboratory:
      input.roomType === "laboratory"
        ? {
            hypothesis: null,
            method: null,
            variables: [],
            observations: [],
            uncertainties: [],
            contradictions: [],
            safetyNotes:
              "CBAI does not perform physical laboratory work. High-risk scientific actions remain advisory and review-gated.",
          }
        : null,
    practice:
      input.roomType === "practice"
        ? { scenario: null, feedbackNotes: [], aiParticipantsLabeled: true }
        : null,
    consent: {
      recordingAllowed: Boolean(input.recordingAllowed),
      translationAudioAllowed: Boolean(input.translationAudioAllowed),
      retentionDays: input.retentionDays ?? 30,
      acknowledgedAt: null,
      policyVersion: CONSENT_POLICY_VERSION,
    },
    multiPartyTransportAvailable: false,
    multiPartyTransportLabel:
      "Multi-party live audio is not available in this Preview build — host Voice Operator + simulated listeners only.",
    createdLocale: input.createdLocale ?? input.hostSpeakLocale,
    contentLocale: input.createdLocale ?? input.hostSpeakLocale,
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    endedAt: null,
  };

  const rooms = listLiveRooms();
  rooms.unshift(room);
  writeAll(rooms);
  return room;
}

export function saveLiveRoom(room: LiveIntelligenceRoom): LiveIntelligenceRoom {
  const migrated = migrateLiveIntelligenceRoom({ ...room, updatedAt: new Date().toISOString() });
  if (!migrated) throw new Error("Invalid live room");
  const rooms = listLiveRooms();
  const idx = rooms.findIndex((r) => r.roomId === migrated.roomId);
  if (idx >= 0) rooms[idx] = migrated;
  else rooms.unshift(migrated);
  writeAll(rooms);
  return migrated;
}

export function acknowledgeRoomConsent(roomId: string): LiveIntelligenceRoom | null {
  const room = getLiveRoom(roomId);
  if (!room) return null;
  return saveLiveRoom({
    ...room,
    consent: {
      ...room.consent,
      acknowledgedAt: new Date().toISOString(),
      policyVersion: CONSENT_POLICY_VERSION,
    },
  });
}

export function setRoomLifecycle(roomId: string, lifecycle: LiveRoomLifecycle): LiveIntelligenceRoom | null {
  const room = getLiveRoom(roomId);
  if (!room) return null;
  const now = new Date().toISOString();
  return saveLiveRoom({
    ...room,
    lifecycle,
    startedAt: lifecycle === "live" ? room.startedAt ?? now : room.startedAt,
    endedAt: lifecycle === "ended" || lifecycle === "archived" ? now : room.endedAt,
    connectionState: lifecycle === "live" ? "listening" : lifecycle === "ended" ? "ended" : room.connectionState,
  });
}

export function addSimulatedParticipant(
  roomId: string,
  options: {
    displayName: string;
    speakLocale: string;
    readLocale: string;
    hearLocale: string;
  },
): LiveIntelligenceRoom | null {
  const room = getLiveRoom(roomId);
  if (!room) return null;
  if (room.participants.some((p) => p.displayName === options.displayName && p.kind === "ai_simulated")) {
    return room;
  }
  const participant: LiveParticipant = {
    id: newId("sim"),
    displayName: options.displayName,
    kind: "ai_simulated",
    role: "ai_simulated",
    speakLocale: options.speakLocale,
    readLocale: options.readLocale,
    hearLocale: options.hearLocale,
    hearTranslatedAudio: false,
    joinedAt: new Date().toISOString(),
    leftAt: null,
  };
  return saveLiveRoom({
    ...room,
    participants: [...room.participants, participant],
  });
}

export function appendHostUtterance(
  roomId: string,
  text: string,
): LiveIntelligenceRoom | null {
  const room = getLiveRoom(roomId);
  if (!room) return null;
  const host = room.participants.find((p) => p.id === room.hostParticipantId);
  if (!host) return null;
  const listenerLocales = [
    ...new Set(room.participants.map((p) => p.readLocale).filter(Boolean)),
  ];
  const turn = buildTranscriptTurn({
    id: newId("turn"),
    speakerParticipantId: host.id,
    originalText: text.trim(),
    originalLocale: host.speakLocale,
    listenerLocales,
    glossary: room.glossary,
  });
  if (!turn.originalText) return room;
  return saveLiveRoom({
    ...room,
    transcript: [...room.transcript, turn],
    activeSpeakerParticipantId: host.id,
    connectionState: turn.translationStatus === "clarification_needed" ? "translating" : "listening",
  });
}

export function upsertGlossaryTerm(
  roomId: string,
  term: Omit<LiveGlossaryTerm, "id"> & { id?: string },
): LiveIntelligenceRoom | null {
  const room = getLiveRoom(roomId);
  if (!room) return null;
  const id = term.id ?? newId("glossary");
  const next: LiveGlossaryTerm = {
    id,
    term: term.term,
    preferredTranslations: term.preferredTranslations ?? {},
    doNotTranslate: Boolean(term.doNotTranslate),
    definition: term.definition,
    evidenceRefIds: term.evidenceRefIds ?? [],
    approvedByParticipantId: term.approvedByParticipantId ?? null,
  };
  const existing = room.glossary.filter((g) => g.id !== id && g.term.toLowerCase() !== next.term.toLowerCase());
  return saveLiveRoom({ ...room, glossary: [...existing, next] });
}

export function linkOperationalObject(roomId: string, objectId: string): LiveIntelligenceRoom | null {
  const room = getLiveRoom(roomId);
  if (!room) return null;
  if (room.operationalObjectIds.includes(objectId)) return room;
  return saveLiveRoom({
    ...room,
    operationalObjectIds: [...room.operationalObjectIds, objectId],
  });
}

function touchRoom(roomId: string): LiveIntelligenceRoom | null {
  return getLiveRoom(roomId);
}

export function addAgendaItem(roomId: string, title: string): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  const trimmed = title.trim();
  if (!trimmed) return room;
  const item = { id: newId("agenda"), title: trimmed, done: false };
  return saveLiveRoom({ ...room, agenda: [...room.agenda, item] });
}

export function toggleAgendaItem(roomId: string, itemId: string): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  return saveLiveRoom({
    ...room,
    agenda: room.agenda.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
  });
}

export function addEvidenceRef(
  roomId: string,
  ref: { label: string; href?: string; note?: string },
): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  const label = ref.label.trim();
  if (!label) return room;
  const entry = {
    id: newId("evidence"),
    label,
    href: ref.href?.trim() || null,
    note: ref.note?.trim() || null,
  };
  return saveLiveRoom({ ...room, evidenceRefs: [...room.evidenceRefs, entry] });
}

export function addQuestion(roomId: string, text: string, locale: string): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  const trimmed = text.trim();
  if (!trimmed) return room;
  const now = new Date().toISOString();
  return saveLiveRoom({
    ...room,
    questions: [
      ...room.questions,
      { id: newId("question"), text: trimmed, locale, resolved: false, createdAt: now },
    ],
  });
}

export function addDecision(roomId: string, text: string): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  const trimmed = text.trim();
  if (!trimmed) return room;
  const now = new Date().toISOString();
  return saveLiveRoom({
    ...room,
    decisions: [
      ...room.decisions,
      {
        id: newId("decision"),
        text: trimmed,
        requiresHumanConfirmation: true,
        confirmed: false,
        createdAt: now,
      },
    ],
  });
}

/** Explicit human confirmation — never auto-confirm official decisions. */
export function confirmDecision(roomId: string, decisionId: string): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  if (!room.decisions.some((d) => d.id === decisionId)) return room;
  return saveLiveRoom({
    ...room,
    decisions: room.decisions.map((d) =>
      d.id === decisionId ? { ...d, confirmed: true, requiresHumanConfirmation: true } : d,
    ),
  });
}

export function addActionItem(
  roomId: string,
  text: string,
  ownerParticipantId?: string,
): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  const trimmed = text.trim();
  if (!trimmed) return room;
  return saveLiveRoom({
    ...room,
    actionItems: [
      ...room.actionItems,
      {
        id: newId("action"),
        text: trimmed,
        ownerParticipantId: ownerParticipantId ?? null,
        dueAt: null,
        done: false,
      },
    ],
  });
}

export function updateLaboratory(roomId: string, patch: Partial<LiveLabState>): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room || !room.laboratory) return null;
  return saveLiveRoom({
    ...room,
    laboratory: { ...room.laboratory, ...patch },
  });
}

export function updatePractice(roomId: string, patch: Partial<LivePracticeState>): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room || !room.practice) return null;
  return saveLiveRoom({
    ...room,
    practice: { ...room.practice, ...patch },
  });
}

export function leaveParticipant(roomId: string, participantId: string): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  const now = new Date().toISOString();
  return saveLiveRoom({
    ...room,
    participants: room.participants.map((p) =>
      p.id === participantId && !p.leftAt ? { ...p, leftAt: now } : p,
    ),
  });
}

export function linkRelatedEntity(
  roomId: string,
  entity: { kind: string; id: string; name: string },
): LiveIntelligenceRoom | null {
  const room = touchRoom(roomId);
  if (!room) return null;
  const kind = entity.kind.trim();
  const id = entity.id.trim();
  const name = entity.name.trim();
  if (!kind || !id) return room;
  if (room.relatedEntities.some((e) => e.kind === kind && e.id === id)) return room;
  const next: LiveRelatedEntity = { kind, id, name: name || id };
  return saveLiveRoom({ ...room, relatedEntities: [...room.relatedEntities, next] });
}

export function listRoomsForEntity(kind: string, id: string): LiveIntelligenceRoom[] {
  return listLiveRooms().filter((room) =>
    room.relatedEntities.some((e) => e.kind === kind && e.id === id),
  );
}

/** Test helper — clears in-memory + browser store for the current namespace. */
export function resetLiveRoomsForTests(): void {
  memoryRooms.length = 0;
  cachedSnapshot = [];
  cachedSnapshotToken = "";
  roomSnapshotCache.clear();
  if (isBrowser()) {
    window.localStorage.removeItem(resolveStorageKey(STORAGE_KEY));
    window.dispatchEvent(new Event("cbai-live-rooms-changed"));
  }
}
