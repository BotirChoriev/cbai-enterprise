/**
 * Voice workspace + PhD document intake regression matrix.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveVoiceCommandFromText } from "@/lib/voice-operator/commands/voice-command-resolver";
import {
  clearVoiceCommandDedupe,
  executeVoiceCommand,
} from "@/lib/voice-operator/commands/voice-command-executor";
import { resetVoiceSessionContext } from "@/lib/voice-operator/commands/voice-command-context";
import {
  detectRoleIntent,
  getWorkspaceTemplate,
} from "@/lib/adaptive-workspace/templates";
import {
  buildWorkspaceCreationDraft,
  interpretRoleStatement,
} from "@/lib/adaptive-workspace/role-discovery";
import {
  createDocumentIntakeDraft,
  mockProcessUploadedDocument,
  validateDocumentUploadCandidate,
  isPdfSignature,
} from "@/lib/document-intake/document-intake";
import {
  getCapability,
  listPlatformCapabilities,
  matchCapabilityFromText,
  deriveDocumentUploadReadiness,
} from "@/lib/platform-capabilities/capability-registry";
import { buildVoiceActionOutcome, outcomeKindForUploadReadiness } from "@/lib/voice-operator/voice-action-outcomes";
import { getVoiceActionOutcomeCopy } from "@/lib/i18n/platform-copy-voice-action-outcomes";
import { VOICE_COMMAND_EN, VOICE_COMMAND_UZ, VOICE_COMMAND_RU, VOICE_COMMAND_TR } from "@/lib/i18n/platform-copy-voice-command";
import { PLATFORM_ACTION_UZ } from "@/lib/i18n/platform-copy-platform-actions";

function fakeRouter() {
  const pushes: string[] = [];
  return {
    pushes,
    router: {
      push: (href: string) => {
        pushes.push(href);
      },
      back: () => {},
      replace: () => {},
      prefetch: async () => {},
      refresh: () => {},
    } as never,
  };
}

test("capability registry includes required IDs with real readiness", () => {
  const ids = listPlatformCapabilities().map((c) => c.id);
  for (const id of [
    "open_home",
    "open_my_work",
    "open_search",
    "open_global_activity",
    "open_world_intelligence",
    "open_research",
    "open_evidence",
    "open_reports",
    "open_live_rooms",
    "open_settings",
    "open_about",
    "create_personal_workspace",
    "create_role_workspace",
    "create_research_project",
    "upload_research_document",
    "attach_document_to_workspace",
    "inspect_uploaded_document",
    "continue_active_work",
  ] as const) {
    assert.ok(ids.includes(id), id);
    assert.ok(getCapability(id));
  }
  assert.notEqual(deriveDocumentUploadReadiness(), "available");
  assert.equal(getCapability("open_my_work")?.destinationRoute, "/my-work");
  assert.equal(getCapability("open_my_work")?.readiness, "available");
});

test("UZ personal cabinet aliases → /my-work", () => {
  for (const phrase of [
    "Shaxsiy kabinetimni och",
    "kabinetimni och",
    "mening ishlarimni och",
    "ish maydonimni och",
    "loyihalarimni ko'rsat",
    "open my workspace",
    "open my personal cabinet",
    "show my projects",
  ]) {
    const res = resolveVoiceCommandFromText(phrase, "uz");
    assert.equal(res.action?.target.href, "/my-work", phrase);
    assert.equal(res.action?.actionId, "navigate.my_work", phrase);
  }
  assert.equal(matchCapabilityFromText("shaxsiy kabinetimni och")?.id, "open_my_work");
});

test("Men kimyogarman → chemist discovery on My Work, no Research, no silent create", () => {
  clearVoiceCommandDedupe();
  resetVoiceSessionContext();
  const res = resolveVoiceCommandFromText("Men kimyogarman", "uz");
  assert.equal(res.action?.actionId, "navigate.my_work");
  assert.match(res.action?.target.href ?? "", /discover=1/);
  assert.match(res.messageKey, /chemistUnderstood/);
  assert.doesNotMatch(res.action?.target.href ?? "", /\/research/);

  const detected = detectRoleIntent("Men kimyogarman");
  assert.equal(detected.templateId, "chemist_scientist");
  assert.ok(detected.missingFollowUps.length >= 3);

  const interpretation = interpretRoleStatement({ text: "Men kimyogarman", locale: "uz" });
  const draft = buildWorkspaceCreationDraft({ interpretation, locale: "uz" });
  assert.equal(draft.status, "awaiting_confirmation");
  assert.equal(draft.privacy, "private");
  assert.equal(getWorkspaceTemplate(draft.interpretation.suggestedTemplateId).id, "chemist_scientist");

  const { router, pushes } = fakeRouter();
  let composerOpens = 0;
  executeVoiceCommand(
    { text: "Men kimyogarman", locale: "uz", pathname: "/about", final: true },
    { locale: "uz", pathname: "/about", missionId: null, projectId: null, originalText: "Men kimyogarman" },
    {
      router,
      openComposer: () => {
        composerOpens += 1;
      },
      t: (k) => k,
    },
  );
  assert.equal(composerOpens, 0);
  assert.ok(pushes.every((h) => !h.includes("/research")));
  assert.ok(pushes.some((h) => h.includes("/my-work")));
});

test("PhD intake: storage unavailable → honest degraded, draft preserved, no fake upload", () => {
  const voice = resolveVoiceCommandFromText("400 sahifalik PhD ishimni yuklamoqchiman", "uz");
  assert.equal(voice.action?.actionId, "scientific_intake.compose");
  assert.equal(voice.messageKey, "voiceCommand.scientificIntakeStorageRequired");
  assert.match(VOICE_COMMAND_UZ.scientificIntakeStorageRequired, /ombor/);

  const session = createDocumentIntakeDraft({
    originalFilename: "thesis-400.pdf",
    fileSizeBytes: 40_000_000,
    contentLocale: "uz",
    privacy: "private",
  });
  assert.equal(session.storageConfigured, false);
  assert.equal(session.metadata.processingStatus, "awaiting_upload");
  assert.equal(session.metadata.privacy, "private");
  assert.ok(session.metadata.extractionWarnings.length >= 1);
  assert.equal(outcomeKindForUploadReadiness(deriveDocumentUploadReadiness()), "understood_capability_degraded");

  const validated = validateDocumentUploadCandidate({
    fileName: "thesis.pdf",
    sizeBytes: 1000,
    mimeType: "application/pdf",
    headerBytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
  });
  assert.equal(validated.ok, true);
  assert.equal(isPdfSignature(new Uint8Array([0x25, 0x50, 0x44, 0x46])), true);

  const mocked = mockProcessUploadedDocument(session, {
    outline: [
      { title: "Abstract", page: 2, kind: "abstract", detected: true },
      { title: "Methodology", page: 40, kind: "methodology", detected: true },
    ],
    passages: [{ id: "p1", page: 2, text: "Extracted abstract text", kind: "extracted", confidence: 0.9 }],
  });
  assert.equal(mocked.outline[0]?.page, 2);
  assert.equal(mocked.passages[0]?.kind, "extracted");
});

test("route exists → never claims closed; failed action stays off Home", () => {
  assert.doesNotMatch(PLATFORM_ACTION_UZ.failureNavigate, /mavjud emas/);
  assert.match(PLATFORM_ACTION_UZ.failureNavigate, /qolaman|yakunlanmadi/i);
  assert.match(VOICE_COMMAND_UZ.navigationDidNotComplete, /sahifada qolaman/i);

  clearVoiceCommandDedupe();
  const { router, pushes } = fakeRouter();
  executeVoiceCommand(
    { text: "xyzzy-unknown-command-99", locale: "uz", pathname: "/about", final: true },
    { locale: "uz", pathname: "/about", missionId: null, projectId: null, originalText: "xyzzy-unknown-command-99" },
    { router, openComposer: () => {}, t: (k) => k },
  );
  assert.ok(!pushes.includes("/"));
});

test("successful my-work announce key only after navigation target set", () => {
  const res = resolveVoiceCommandFromText("Shaxsiy kabinetimni och", "uz");
  assert.equal(res.messageKey, "voiceCommand.announcedMyWork");
  assert.equal(res.action?.target.href, "/my-work");
  const outcome = buildVoiceActionOutcome({
    kind: "understood_and_executed",
    capabilityId: "open_my_work",
    understood: "Shaxsiy kabinetimni och",
    action: "open_my_work",
    currentLocation: "/my-work",
    navigatedHref: "/my-work",
  });
  assert.equal(outcome.kind, "understood_and_executed");
  assert.equal(outcome.navigatedHref, "/my-work");
});

test("dedupe: repeated transcript does not double-execute", () => {
  clearVoiceCommandDedupe();
  const { router, pushes } = fakeRouter();
  const deps = { router, openComposer: () => {}, t: (k: string) => k };
  const ctx = { locale: "uz", pathname: "/", missionId: null, projectId: null, originalText: "Shaxsiy kabinetimni och" };
  const first = executeVoiceCommand({ text: "Shaxsiy kabinetimni och", locale: "uz", pathname: "/", final: true }, ctx, deps);
  const second = executeVoiceCommand({ text: "Shaxsiy kabinetimni och", locale: "uz", pathname: "/", final: true }, ctx, deps);
  assert.equal(first.executed, true);
  assert.equal(second.duplicate, true);
  assert.equal(pushes.filter((h) => h === "/my-work").length, 1);
});

test("EN/UZ/RU/TR outcome + chemist + storage copy present", () => {
  for (const copy of [VOICE_COMMAND_EN, VOICE_COMMAND_UZ, VOICE_COMMAND_RU, VOICE_COMMAND_TR]) {
    assert.ok(copy.scientificIntakeStorageRequired.length > 20);
    assert.ok(copy.navigationDidNotComplete.length > 10);
    assert.ok(copy.chemistUnderstood.length > 10);
    assert.doesNotMatch(copy.chemistUnderstood, /Opening the chemistry research workspace/i);
  }
  for (const locale of ["en", "uz", "ru", "tr"] as const) {
    const outcomes = getVoiceActionOutcomeCopy(locale);
    assert.ok(outcomes.understood_capability_degraded.length > 5);
    assert.ok(outcomes.navigation_failed.length > 5);
  }
  assert.doesNotMatch(VOICE_COMMAND_UZ.announcedMyWork, /My Work/);
});

test("chemist template fields cover required structure", () => {
  const template = getWorkspaceTemplate("chemist_scientist");
  const fieldIds = template.fields.map((f) => f.id);
  for (const id of [
    "overview",
    "researchQuestion",
    "hypothesis",
    "literatureSources",
    "thesisLibrary",
    "experimentsMethodology",
    "materialsData",
    "evidenceMap",
    "findings",
    "openQuestions",
    "risksSafety",
    "supervisorCollaborators",
    "tasksMilestones",
    "reports",
    "provenanceAudit",
  ]) {
    assert.ok(fieldIds.includes(id), id);
  }
});
