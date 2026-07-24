/**
 * Live Intelligence Rooms — schema, migration, translation, lifecycle, proposals.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  buildTranscriptTurn,
  createLiveRoom,
  getLiveRoom,
  listLiveRooms,
  migrateLiveIntelligenceRoom,
  migrateLiveRoomCollection,
  proposeOperationalObjectsFromRoom,
  resetLiveRoomsForTests,
  routeTranslation,
  setRoomLifecycle,
  appendHostUtterance,
  addSimulatedParticipant,
  upsertGlossaryTerm,
  acknowledgeRoomConsent,
  getLiveRoomTransportCapability,
  addAgendaItem,
  toggleAgendaItem,
  addEvidenceRef,
  addQuestion,
  addDecision,
  addActionItem,
  confirmDecision,
  updateLaboratory,
  leaveParticipant,
  linkRelatedEntity,
  listRoomsForEntity,
} from "@/lib/live-intelligence-rooms";

test("create + list + get room roundtrip", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "meeting_hall",
    title: "Council review",
    objective: "Review evidence coverage",
    hostDisplayName: "Botir",
    hostSpeakLocale: "uz",
    hostReadLocale: "uz",
    hostHearLocale: "en",
    createdLocale: "uz",
  });
  assert.equal(room.schemaVersion, 1);
  assert.ok(room.roomId);
  assert.equal(getLiveRoom(room.roomId)?.title, "Council review");
  assert.equal(listLiveRooms().length, 1);
});

test("migration preserves unknown fields and is idempotent", () => {
  const raw = {
    roomId: "room-legacy",
    title: "Legacy",
    futureField: { nested: true },
    participants: [{ id: "h1", displayName: "A", speakLocale: "en" }],
  };
  const once = migrateLiveIntelligenceRoom(raw);
  assert.ok(once);
  assert.equal((once as { futureField?: { nested: boolean } }).futureField?.nested, true);
  const twice = migrateLiveIntelligenceRoom(once);
  assert.equal(twice?.roomId, once?.roomId);
  assert.equal(twice?.schemaVersion, 1);
  const collection = migrateLiveRoomCollection([raw, once]);
  assert.equal(collection.length, 2);
});

test("Uzbek speaker to English listener routes known phrase", () => {
  const routed = routeTranslation({
    originalText: "Dalillar panelini oching",
    originalLocale: "uz",
    targetLocale: "en",
    glossary: [],
  });
  assert.equal(routed.status, "translated");
  assert.equal(routed.translatedText, "Open the evidence panel");
});

test("English speaker to Uzbek listener routes known phrase", () => {
  const routed = routeTranslation({
    originalText: "Open the evidence panel",
    originalLocale: "en",
    targetLocale: "uz",
    glossary: [],
  });
  assert.equal(routed.status, "translated");
  assert.match(routed.translatedText ?? "", /Dalillar/i);
});

test("two participants different preferred languages produce variants", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "meeting_hall",
    title: "Bilingual",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  addSimulatedParticipant(room.roomId, {
    displayName: "UZ listener",
    speakLocale: "uz",
    readLocale: "uz",
    hearLocale: "uz",
  });
  const updated = appendHostUtterance(room.roomId, "Open the evidence panel");
  assert.ok(updated);
  const turn = updated!.transcript.at(-1)!;
  assert.equal(turn.originalLocale, "en");
  assert.ok(turn.translatedVariants.uz);
});

test("glossary do-not-translate forces clarification", () => {
  const routed = routeTranslation({
    originalText: "Measure CRISPR off-target rate carefully",
    originalLocale: "en",
    targetLocale: "uz",
    glossary: [
      {
        id: "g1",
        term: "CRISPR",
        preferredTranslations: {},
        doNotTranslate: true,
      },
    ],
  });
  assert.equal(routed.status, "clarification_needed");
  assert.match(routed.uncertainty ?? "", /CRISPR/);
});

test("uncertain unknown phrase does not invent fluent translation", () => {
  const routed = routeTranslation({
    originalText: "qwerty unmapped scientific utterance 42",
    originalLocale: "en",
    targetLocale: "ru",
    glossary: [],
  });
  assert.equal(routed.status, "uncertain");
  assert.equal(routed.translatedText, "qwerty unmapped scientific utterance 42");
});

test("consent + lifecycle end preserves transcript", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "collaboration",
    title: "Collab",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  acknowledgeRoomConsent(room.roomId);
  setRoomLifecycle(room.roomId, "live");
  appendHostUtterance(room.roomId, "Open the evidence panel");
  const ended = setRoomLifecycle(room.roomId, "ended");
  assert.equal(ended?.lifecycle, "ended");
  assert.equal(ended?.transcript.length, 1);
  assert.ok(ended?.consent.acknowledgedAt);
});

test("operational object proposals require confirmation shape", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "laboratory",
    title: "Lab",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  upsertGlossaryTerm(room.roomId, {
    term: "CRISPR",
    preferredTranslations: {},
    doNotTranslate: true,
  });
  const fresh = getLiveRoom(room.roomId)!;
  const proposals = proposeOperationalObjectsFromRoom(fresh);
  assert.ok(proposals.length >= 1);
  assert.ok(proposals.every((p) => p.draft.status === "draft"));
  assert.ok(proposals.some((p) => p.draft.type === "work_plan" || p.draft.type === "evidence_request"));
});

test("duplicate glossary term does not explode collection", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "practice",
    title: "Practice",
    hostDisplayName: "Host",
    hostSpeakLocale: "tr",
    hostReadLocale: "tr",
    hostHearLocale: "en",
  });
  upsertGlossaryTerm(room.roomId, { term: "PCR", preferredTranslations: { en: "PCR" }, doNotTranslate: true });
  upsertGlossaryTerm(room.roomId, { term: "PCR", preferredTranslations: { en: "PCR" }, doNotTranslate: true });
  assert.equal(getLiveRoom(room.roomId)?.glossary.filter((g) => g.term === "PCR").length, 1);
});

test("buildTranscriptTurn separates original and translated", () => {
  const turn = buildTranscriptTurn({
    id: "t1",
    speakerParticipantId: "h",
    originalText: "Open the evidence panel",
    originalLocale: "en",
    listenerLocales: ["en", "uz"],
    glossary: [],
  });
  assert.equal(turn.originalText, "Open the evidence panel");
  assert.ok(turn.translatedVariants.uz);
  assert.notEqual(turn.translatedVariants.uz, undefined);
});

test("transport capability is honestly EXTERNAL_BLOCKED", () => {
  const cap = getLiveRoomTransportCapability();
  assert.equal(cap.available, false);
  assert.equal(cap.externalBlocked, true);
});

test("Live Rooms pages and nav wiring exist", () => {
  assert.ok(existsSync("app/(dashboard)/rooms/page.tsx"));
  assert.ok(existsSync("app/(dashboard)/rooms/session/page.tsx"));
  assert.ok(existsSync("components/live-intelligence-rooms/CountryLiveRoomsPanel.tsx"));
  const countryPanel = readFileSync("components/countries/CountryIntelligencePanel.tsx", "utf8");
  assert.match(countryPanel, /CountryLiveRoomsPanel/);
  const nav = readFileSync("lib/navigation.ts", "utf8");
  assert.match(nav, /href: "\/rooms"/);
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /Privacy P0: SPA route changes must release the mic/);
});

test("agenda evidence question decision helpers", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "meeting_hall",
    title: "Helpers",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  const withAgenda = addAgendaItem(room.roomId, "Intro");
  assert.equal(withAgenda?.agenda.length, 1);
  assert.equal(withAgenda?.agenda[0]?.done, false);
  const toggled = toggleAgendaItem(room.roomId, withAgenda!.agenda[0]!.id);
  assert.equal(toggled?.agenda[0]?.done, true);

  addEvidenceRef(room.roomId, { label: "Registry note" });
  assert.equal(getLiveRoom(room.roomId)?.evidenceRefs.length, 1);

  addQuestion(room.roomId, "What is missing?", "en");
  assert.equal(getLiveRoom(room.roomId)?.questions.length, 1);

  addDecision(room.roomId, "Proceed with review");
  const decision = getLiveRoom(room.roomId)?.decisions[0];
  assert.ok(decision);
  assert.equal(decision?.requiresHumanConfirmation, true);
  assert.equal(decision?.confirmed, false);

  addActionItem(room.roomId, "Follow up", room.hostParticipantId);
  assert.equal(getLiveRoom(room.roomId)?.actionItems.length, 1);
});

test("leaveParticipant sets leftAt", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "collaboration",
    title: "Leave",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  addSimulatedParticipant(room.roomId, {
    displayName: "Guest",
    speakLocale: "uz",
    readLocale: "uz",
    hearLocale: "uz",
  });
  const sim = getLiveRoom(room.roomId)!.participants.find((p) => p.kind === "ai_simulated")!;
  leaveParticipant(room.roomId, sim.id);
  const left = getLiveRoom(room.roomId)!.participants.find((p) => p.id === sim.id);
  assert.ok(left?.leftAt);
});

test("listRoomsForEntity filters relatedEntities", () => {
  resetLiveRoomsForTests();
  const a = createLiveRoom({
    roomType: "meeting_hall",
    title: "A",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  createLiveRoom({
    roomType: "practice",
    title: "B",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  linkRelatedEntity(a.roomId, { kind: "country", id: "UZ", name: "Uzbekistan" });
  const linked = listRoomsForEntity("country", "UZ");
  assert.equal(linked.length, 1);
  assert.equal(linked[0]?.roomId, a.roomId);
});

test("laboratory create defaults include safety state", () => {
  resetLiveRoomsForTests();
  const lab = createLiveRoom({
    roomType: "laboratory",
    title: "Lab defaults",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  assert.ok(lab.laboratory);
  assert.equal(lab.laboratory?.hypothesis, null);
  assert.match(lab.laboratory?.safetyNotes ?? "", /does not perform physical/i);
  updateLaboratory(lab.roomId, { hypothesis: "Testable claim" });
  assert.equal(getLiveRoom(lab.roomId)?.laboratory?.hypothesis, "Testable claim");
});

test("confirmDecision requires explicit human action", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "meeting_hall",
    title: "Council",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
  });
  addDecision(room.roomId, "Approve glossary CRISPR");
  const pending = getLiveRoom(room.roomId)!;
  assert.equal(pending.decisions[0]?.confirmed, false);
  confirmDecision(room.roomId, pending.decisions[0]!.id);
  assert.equal(getLiveRoom(room.roomId)?.decisions[0]?.confirmed, true);
});

test("Voice Operator lifecycle helpers remain for room Stop/Close teardown", () => {
  const lifecycle = readFileSync("lib/voice-operator/voice-session-lifecycle.ts", "utf8");
  assert.match(lifecycle, /streamHasLiveTracks/);
  assert.match(lifecycle, /captureResourcesAreLive/);
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /releaseLiveAudioResources/);
  const shell = readFileSync("components/live-intelligence-rooms/RoomShell.tsx", "utf8");
  assert.match(shell, /voice\.stopListening/);
  assert.match(shell, /confirmDecision/);
});
