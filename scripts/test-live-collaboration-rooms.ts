/**
 * Live Collaboration Rooms — wizard, access, consent, migration, honesty.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  LIVE_ROOM_TYPES,
  WIZARD_PRIMARY_TYPES,
  buildCreateInputFromWizard,
  canAdvanceWizard,
  channelDeliveryAvailable,
  confirmInvitationDraft,
  createEmptyWizardState,
  createInvitationDraft,
  createLiveRoom,
  createLiveRoomFromWizard,
  getLiveRoom,
  getLiveRoomTransportCapability,
  listLiveRooms,
  migrateLiveIntelligenceRoom,
  migrateLiveRoomCollection,
  participantPublicView,
  phoneRequiredForGuest,
  proposeOperationalObjectsFromRoom,
  publicViewFromRoom,
  resetLiveRoomsForTests,
  setRoomLifecycle,
  validateWizardStep,
  BROWSER_DEVICE_CAPABILITIES,
  PROFESSIONAL_INTEGRATIONS,
  releaseMediaStream,
} from "@/lib/live-intelligence-rooms";
import { getLcrCopy, roomTypeLabel } from "@/lib/i18n/platform-copy-live-collaboration";

test("all collaboration room types are labeled in EN/UZ/RU/TR", () => {
  for (const lang of ["en", "uz", "ru", "tr"] as const) {
    const copy = getLcrCopy(lang);
    for (const type of LIVE_ROOM_TYPES) {
      const label = roomTypeLabel(copy, type);
      assert.ok(label.length > 1, `${lang} ${type}`);
      if (lang === "uz") {
        assert.notEqual(label, type);
      }
    }
  }
});

test("four-step wizard validates required fields", () => {
  let state = createEmptyWizardState("en", "Host");
  assert.equal(validateWizardStep(state, 1).ok, false);
  state = { ...state, title: "Council", purpose: "Review evidence", expectedOutcome: "Decision brief" };
  assert.equal(validateWizardStep(state, 1).ok, true);
  assert.equal(canAdvanceWizard({ ...state, step: 1 }), true);
  assert.equal(validateWizardStep(state, 2).ok, false);
  state = { ...state, step: 2, approverDisplayName: "Approver" };
  assert.equal(validateWizardStep(state, 2).ok, true);
  state = { ...state, step: 3, startNow: false, scheduledStart: "", timezone: "Asia/Tashkent" };
  assert.equal(validateWizardStep(state, 3).ok, false);
  state = { ...state, scheduledStart: "2026-08-01T10:00" };
  assert.equal(validateWizardStep(state, 3).ok, true);
  state = { ...state, step: 4, confirmedReview: false };
  assert.equal(validateWizardStep(state, 4).ok, false);
  state = { ...state, confirmedReview: true };
  assert.equal(validateWizardStep(state, 4).ok, true);
});

test("confirmation-before-create and no duplicate create", () => {
  resetLiveRoomsForTests();
  let state = createEmptyWizardState("uz", "Botir");
  state = {
    ...state,
    title: "Dalillar kengashi",
    purpose: "Qamrovni ko‘rib chiqish",
    expectedOutcome: "Qaror loyihasi",
    roomType: "scientific_deliberation",
    approverDisplayName: "Tasdiqlovchi",
    attendanceMode: "hybrid",
    accessMode: "invite",
    timezone: "Asia/Tashkent",
    scheduledStart: "2026-08-01T10:00",
    startNow: false,
    recurrence: "weekly",
    recordingAllowed: false,
    transcriptRetainAllowed: true,
    translationAudioAllowed: false,
    confirmedReview: true,
    materialTitle: "Protocol",
    materialSource: "https://example.org/protocol.pdf",
  };
  const built = buildCreateInputFromWizard(state, { createdLocale: "uz" });
  assert.ok(!("error" in built));
  if ("error" in built) return;
  assert.equal(built.confirmCreate, true);
  const a = createLiveRoomFromWizard(built);
  const b = createLiveRoomFromWizard(built);
  assert.equal(a.roomId, b.roomId);
  assert.equal(listLiveRooms().length, 1);
  assert.equal(a.schemaVersion, 2);
  assert.equal(a.attendanceMode, "hybrid");
  assert.equal(a.access.accessMode, "invite");
  assert.equal(a.schedule.timezone, "Asia/Tashkent");
  assert.equal(a.schedule.recurrence, "weekly");
  assert.equal(a.consent.transcriptRetainAllowed, true);
  assert.equal(a.consent.recordingAllowed, false);
  assert.equal(a.presentationMaterials.length, 1);
  assert.equal(a.presentationMaterials[0]?.cbaiAnalysisSeparate, true);
  assert.ok(a.auditEvents.some((e) => e.action === "room_created"));
});

test("createLiveRoomFromWizard refuses without confirmCreate", () => {
  assert.throws(() =>
    createLiveRoomFromWizard({
      roomType: "conference",
      title: "No confirm",
      hostDisplayName: "H",
      hostSpeakLocale: "en",
      hostReadLocale: "en",
      hostHearLocale: "en",
    } as never),
  );
});

test("online offline hybrid and access modes persist", () => {
  resetLiveRoomsForTests();
  for (const attendanceMode of ["online", "offline", "hybrid"] as const) {
    for (const accessMode of ["private", "invite", "link", "public"] as const) {
      const room = createLiveRoom({
        roomType: "collaboration",
        title: `${attendanceMode}-${accessMode}`,
        hostDisplayName: "Host",
        hostSpeakLocale: "en",
        hostReadLocale: "en",
        hostHearLocale: "en",
        attendanceMode,
        accessMode,
        confirmCreate: true,
      });
      assert.equal(room.attendanceMode, attendanceMode);
      assert.equal(room.access.accessMode, accessMode);
    }
  }
});

test("guest display name and unverified badge; phone not required", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "public_presentation",
    title: "Public",
    hostDisplayName: "Guest Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
    identityProvenance: "unverified_guest",
    confirmCreate: true,
  });
  const pub = participantPublicView({
    ...room.participants[0]!,
    emailPrivate: "secret@example.com",
    phonePrivate: "+998901112233",
  });
  assert.equal(pub.emailExposed, false);
  assert.equal(pub.phoneExposed, false);
  assert.equal(pub.identityProvenance, "unverified_guest");
  assert.equal(phoneRequiredForGuest(), false);
  assert.equal(room.participants[0]?.emailPrivate ?? null, null);
});

test("invitation not sent before confirmation; SMS/email delivery honest", () => {
  const draft = createInvitationDraft({
    channel: "email",
    recipientDisplay: "Dr. A",
    recipientContactPrivate: "a@example.com",
    accessLevel: "invite",
    expiresAt: "2026-08-02T00:00:00.000Z",
  });
  assert.equal(draft.status, "draft");
  assert.equal(draft.deliveryAvailable, false);
  const premature = confirmInvitationDraft(draft, {
    reviewedRecipient: false,
    reviewedChannel: true,
    reviewedRoom: true,
    reviewedAccessLevel: true,
    reviewedExpiry: true,
  });
  assert.ok("error" in premature);
  const confirmed = confirmInvitationDraft(draft, {
    reviewedRecipient: true,
    reviewedChannel: true,
    reviewedRoom: true,
    reviewedAccessLevel: true,
    reviewedExpiry: true,
  });
  assert.ok(!("error" in confirmed));
  if ("error" in confirmed) return;
  assert.equal(confirmed.status, "confirmed_pending_delivery");
  assert.notEqual(confirmed.status, "sent");
  assert.equal(channelDeliveryAvailable("sms").available, false);
  assert.equal(channelDeliveryAvailable("link").available, true);
});

test("timezone and recurring schedule migration is idempotent", () => {
  const raw = {
    roomId: "legacy-sched",
    title: "Legacy schedule",
    roomType: "meeting_hall",
    scheduledStart: "2026-07-01T09:00:00.000Z",
    timezone: "Europe/Moscow",
    participants: [{ id: "h", displayName: "H", role: "host", speakLocale: "ru" }],
    futureField: { keep: true },
  };
  const once = migrateLiveIntelligenceRoom(raw)!;
  assert.equal(once.schemaVersion, 2);
  assert.equal(once.schedule.timezone, "Europe/Moscow");
  assert.equal(once.schedule.scheduledStart, "2026-07-01T09:00:00.000Z");
  assert.equal((once as { futureField?: { keep: boolean } }).futureField?.keep, true);
  const twice = migrateLiveIntelligenceRoom(once)!;
  assert.equal(twice.roomId, once.roomId);
  assert.equal(twice.schedule.recurrence, "none");
  const withRecurrence = migrateLiveIntelligenceRoom({
    ...once,
    schedule: { ...once.schedule, recurrence: "weekly", recurrenceRule: "FREQ=WEEKLY" },
  })!;
  assert.equal(withRecurrence.schedule.recurrence, "weekly");
  const collection = migrateLiveRoomCollection([raw, once, withRecurrence]);
  assert.equal(collection.length, 3);
});

test("public presentation privacy hides confidential materials", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "public_presentation",
    title: "Open day",
    purpose: "Share agenda only",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
    confidentiality: "confidential",
    confirmCreate: true,
    publicSession: {
      enabled: true,
      landingTitle: "Open day",
      landingPurpose: "Public agenda",
      publicMaterialBoundary: "agenda_only",
    },
    materials: [
      {
        id: "m1",
        originalTitle: "Secret protocol",
        fileOrSource: "internal://secret",
        confidentiality: "confidential",
        version: "1",
        visibility: "host_only",
        sourceLanguage: "en",
        contentLocale: "en",
        verificationStatus: "unverified",
        cbaiAnalysisSeparate: true,
        humanConfirmationStatus: "not_required",
        kind: "pdf",
      },
      {
        id: "m2",
        originalTitle: "Public slide",
        fileOrSource: "https://example.org/slide",
        confidentiality: "open",
        version: "1",
        visibility: "public",
        sourceLanguage: "en",
        contentLocale: "en",
        verificationStatus: "official_source",
        cbaiAnalysisSeparate: true,
        humanConfirmationStatus: "not_required",
        kind: "presentation",
      },
    ],
  });
  const view = publicViewFromRoom(room);
  assert.equal(view.exposed, true);
  assert.deepEqual(view.publicMaterials, ["Public slide"]);
  assert.equal(view.confidentialHidden, true);
  assert.equal(room.publicSession.hostingAvailable, false);
});

test("recording transcript translation consent and original/translation separation", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "expert_council",
    title: "Consent",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "uz",
    hostHearLocale: "uz",
    recordingAllowed: true,
    transcriptRetainAllowed: true,
    translationAudioAllowed: true,
    confirmCreate: true,
  });
  assert.equal(room.recordingState, "consented_local_only");
  assert.equal(room.transcriptState, "consented_retain");
  assert.equal(room.consent.translationAudioAllowed, true);
});

test("device capabilities are honest; releaseMediaStream is safe", () => {
  assert.ok(BROWSER_DEVICE_CAPABILITIES.some((c) => c.id === "microphone"));
  assert.ok(PROFESSIONAL_INTEGRATIONS.some((c) => c.id === "rtsp_ndi_gateway" && c.stage === "unavailable"));
  assert.equal(getLiveRoomTransportCapability().externalBlocked, true);
  releaseMediaStream(null);
});

test("meeting-to-work drafts require human approval gate shape", () => {
  resetLiveRoomsForTests();
  const room = createLiveRoom({
    roomType: "scientific_deliberation",
    title: "Debate",
    hostDisplayName: "Host",
    hostSpeakLocale: "en",
    hostReadLocale: "en",
    hostHearLocale: "en",
    approverDisplayName: "Dean",
    confirmCreate: true,
  });
  setRoomLifecycle(room.roomId, "ended");
  const ended = getLiveRoom(room.roomId)!;
  const proposals = proposeOperationalObjectsFromRoom(ended);
  const keys = new Set(proposals.map((p) => p.catalogKey));
  for (const key of [
    "meeting_report",
    "evidence_request",
    "research_question",
    "comparative_study",
    "replication_plan",
    "experiment_plan",
    "collaboration_request",
    "joint_work_card",
    "project_presentation",
    "monitoring_plan",
    "decision_brief",
    "consensus_disagreement",
  ]) {
    assert.ok(keys.has(key), key);
  }
  assert.ok(proposals.every((p) => p.draft.status === "draft"));
  assert.ok(proposals.some((p) => /human|approv/i.test(p.draft.humanDecision)));
  assert.equal(ended.humanApprovalState, "pending");
  assert.ok(ended.approverIds.length >= 1);
});

test("wizard primary types cover product taxonomy", () => {
  assert.equal(WIZARD_PRIMARY_TYPES.length, 10);
  assert.ok(WIZARD_PRIMARY_TYPES.includes("scientific_deliberation"));
  assert.ok(WIZARD_PRIMARY_TYPES.includes("hybrid_meeting"));
});

test("EN/UZ/RU/TR parity for LCR copy keys; no English UI under UZ for title", () => {
  const en = getLcrCopy("en");
  const uz = getLcrCopy("uz");
  const ru = getLcrCopy("ru");
  const tr = getLcrCopy("tr");
  const keys = Object.keys(en) as (keyof typeof en)[];
  for (const key of keys) {
    assert.equal(typeof uz[key], "string", `uz.${key}`);
    assert.equal(typeof ru[key], "string", `ru.${key}`);
    assert.equal(typeof tr[key], "string", `tr.${key}`);
  }
  assert.notEqual(uz.title, en.title);
  assert.match(uz.title, /Jonli|xona/i);
  assert.ok(ru.confirmCreate.length < 80);
  assert.ok(tr.stepMaterialsConsent.length < 60);
});

test("UI wiring: wizard home, room shell cleanup, voice clearance", () => {
  const home = readFileSync("components/live-intelligence-rooms/LiveRoomsHome.tsx", "utf8");
  assert.match(home, /data-cbai-lcr-wizard/);
  assert.match(home, /data-cbai-lcr-confirm-create/);
  assert.match(home, /data-cbai-voice-dock-clearance/);
  const shell = readFileSync("components/live-intelligence-rooms/RoomShell.tsx", "utf8");
  assert.match(shell, /data-cbai-session-navigator/);
  assert.match(shell, /data-cbai-live-stage/);
  assert.match(shell, /data-cbai-intelligence-rail/);
  assert.match(shell, /data-cbai-room-controls/);
  assert.match(shell, /releaseAllLocalMedia|voice\.stopListening/);
  assert.match(shell, /confirmDecision/);
  assert.match(shell, /data-cbai-leave-room/);
  assert.ok(existsSync("docs/verification/live-collaboration-rooms/baseline-audit.md"));
  assert.ok(existsSync("docs/verification/live-collaboration-rooms/design-decisions.md"));
});

test("no fabricated multiparty or public hosting claims in copy", () => {
  const en = getLcrCopy("en");
  assert.match(en.multipartyHonest, /not available/i);
  assert.match(en.publicHostingUnavailable, /planned|not/i);
  assert.match(en.smsUnavailable, /unavailable|provider/i);
});
