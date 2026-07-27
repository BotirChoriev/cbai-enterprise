/**
 * Four-step Live Collaboration Rooms create wizard — validation + review.
 * Nothing is persisted until confirmCreate is true.
 */

import type {
  CreateLiveRoomInput,
  LiveMaterialProvenance,
  LiveRoomType,
  RoomCreateWizardState,
  WizardStepId,
} from "@/lib/live-intelligence-rooms/types";
import { LIVE_ROOM_TYPES } from "@/lib/live-intelligence-rooms/types";

export const WIZARD_PRIMARY_TYPES: readonly LiveRoomType[] = [
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
];

export function createEmptyWizardState(locale: string, hostName = ""): RoomCreateWizardState {
  return {
    step: 1,
    title: "",
    roomType: "scientific_deliberation",
    purpose: "",
    expectedOutcome: "",
    topicDomain: "",
    hostDisplayName: hostName || "Host",
    moderatorDisplayName: "",
    presenterDisplayNames: "",
    observerNote: "",
    approverDisplayName: "",
    startNow: true,
    scheduledStart: "",
    scheduledEnd: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    recurrence: "none",
    attendanceMode: "online",
    accessMode: "invite",
    guestPolicy: "display_name",
    waitingRoom: true,
    participantLimit: "",
    speakLocale: locale,
    readLocale: locale,
    hearLocale: locale,
    translationLanguages: "",
    materialTitle: "",
    materialSource: "",
    materialKind: "pdf",
    confidentiality: "internal",
    intellectualPropertyStatus: "not_claimed",
    recordingAllowed: false,
    transcriptRetainAllowed: false,
    translationAudioAllowed: false,
    publicSessionEnabled: false,
    confirmedReview: false,
  };
}

export type WizardValidation = {
  readonly ok: boolean;
  readonly errors: readonly string[];
};

export function validateWizardStep(state: RoomCreateWizardState, step: WizardStepId): WizardValidation {
  const errors: string[] = [];
  if (step === 1) {
    if (!state.title.trim()) errors.push("title_required");
    if (!state.purpose.trim()) errors.push("purpose_required");
    if (!state.expectedOutcome.trim()) errors.push("outcome_required");
    if (!(LIVE_ROOM_TYPES as readonly string[]).includes(state.roomType)) errors.push("type_invalid");
  }
  if (step === 2) {
    if (!state.hostDisplayName.trim()) errors.push("host_required");
    if (!state.approverDisplayName.trim()) errors.push("approver_required");
  }
  if (step === 3) {
    if (!state.startNow) {
      if (!state.scheduledStart.trim()) errors.push("schedule_start_required");
      if (!state.timezone.trim()) errors.push("timezone_required");
    }
    if (state.participantLimit.trim()) {
      const n = Number(state.participantLimit);
      if (!Number.isFinite(n) || n < 1) errors.push("participant_limit_invalid");
    }
  }
  if (step === 4) {
    if (!state.confirmedReview) errors.push("review_unconfirmed");
  }
  return { ok: errors.length === 0, errors };
}

export function canAdvanceWizard(state: RoomCreateWizardState): boolean {
  return validateWizardStep(state, state.step).ok;
}

export function buildCreateInputFromWizard(
  state: RoomCreateWizardState,
  options: { readonly createdLocale: string; readonly sourceRoute?: string },
): CreateLiveRoomInput | { error: string } {
  const step1 = validateWizardStep(state, 1);
  const step2 = validateWizardStep(state, 2);
  const step3 = validateWizardStep(state, 3);
  if (!step1.ok || !step2.ok || !step3.ok) {
    return { error: "wizard_incomplete" };
  }
  if (!state.confirmedReview) {
    return { error: "review_unconfirmed" };
  }

  const materials: LiveMaterialProvenance[] = [];
  if (state.materialTitle.trim() && state.materialSource.trim()) {
    materials.push({
      id: `mat-draft-${Date.now()}`,
      originalTitle: state.materialTitle.trim(),
      author: null,
      institution: null,
      fileOrSource: state.materialSource.trim(),
      uploadedOrPublishedAt: new Date().toISOString(),
      license: null,
      confidentiality: state.confidentiality,
      version: "1",
      visibility: state.accessMode === "public" ? "public" : "participants",
      sourceLanguage: state.speakLocale,
      contentLocale: options.createdLocale,
      verificationStatus: "unverified",
      cbaiAnalysisSeparate: true,
      humanConfirmationStatus: "not_required",
      kind: state.materialKind,
    });
  }

  const presenters = state.presenterDisplayNames
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    confirmCreate: true,
    roomType: state.roomType,
    title: state.title.trim(),
    purpose: state.purpose.trim(),
    objective: state.purpose.trim(),
    expectedOutcome: state.expectedOutcome.trim(),
    topicDomain: state.topicDomain.trim(),
    hostDisplayName: state.hostDisplayName.trim(),
    hostSpeakLocale: state.speakLocale,
    hostReadLocale: state.readLocale,
    hostHearLocale: state.hearLocale,
    createdLocale: options.createdLocale,
    sourceRoute: options.sourceRoute ?? "/rooms",
    recordingAllowed: state.recordingAllowed,
    translationAudioAllowed: state.translationAudioAllowed,
    transcriptRetainAllowed: state.transcriptRetainAllowed,
    attendanceMode: state.attendanceMode,
    accessMode: state.accessMode,
    guestPolicy: state.guestPolicy,
    waitingRoom: state.waitingRoom,
    participantLimit: state.participantLimit.trim() ? Number(state.participantLimit) : null,
    schedule: {
      startNow: state.startNow,
      scheduledStart: state.startNow ? null : state.scheduledStart || null,
      scheduledEnd: state.startNow ? null : state.scheduledEnd || null,
      timezone: state.timezone || "UTC",
      recurrence: state.recurrence,
    },
    confidentiality: state.confidentiality,
    intellectualPropertyStatus: state.intellectualPropertyStatus,
    moderatorDisplayNames: state.moderatorDisplayName.trim()
      ? [state.moderatorDisplayName.trim()]
      : [],
    presenterDisplayNames: presenters,
    approverDisplayName: state.approverDisplayName.trim(),
    materials,
    translationLanguages: state.translationLanguages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    publicSession: state.publicSessionEnabled
      ? {
          enabled: true,
          landingTitle: state.title.trim(),
          landingPurpose: state.purpose.trim(),
          registrationPolicy: "unavailable",
          audienceMode: "moderated_questions",
          publicMaterialBoundary: "agenda_only",
          replayPolicy: "unavailable",
          hostingAvailable: false,
          hostingLabelKey: "lcr.publicHostingUnavailable",
        }
      : { enabled: false },
    identityProvenance: "unverified_guest",
  };
}

export function publicViewFromRoom(room: {
  readonly publicSession: { readonly enabled: boolean; readonly landingTitle: string; readonly landingPurpose: string };
  readonly title: string;
  readonly purpose: string;
  readonly schedule: { readonly scheduledStart: string | null; readonly timezone: string };
  readonly confidentiality: string;
  readonly presentationMaterials: readonly { readonly visibility: string; readonly originalTitle: string }[];
}): {
  readonly exposed: boolean;
  readonly title: string;
  readonly purpose: string;
  readonly scheduleStart: string | null;
  readonly timezone: string;
  readonly publicMaterials: readonly string[];
  readonly confidentialHidden: boolean;
} {
  if (!room.publicSession.enabled) {
    return {
      exposed: false,
      title: "",
      purpose: "",
      scheduleStart: null,
      timezone: room.schedule.timezone,
      publicMaterials: [],
      confidentialHidden: true,
    };
  }
  return {
    exposed: true,
    title: room.publicSession.landingTitle || room.title,
    purpose: room.publicSession.landingPurpose || room.purpose,
    scheduleStart: room.schedule.scheduledStart,
    timezone: room.schedule.timezone,
    publicMaterials: room.presentationMaterials
      .filter((m) => m.visibility === "public")
      .map((m) => m.originalTitle),
    confidentialHidden: room.confidentiality !== "open",
  };
}
