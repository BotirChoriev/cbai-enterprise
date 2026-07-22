/**
 * Auth-aware collaborative Voice OS — P0 regression suite.
 */

import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import {
  clearVoiceCommandDedupe,
  executeVoiceCommand,
  resolveVoiceCommandFromText,
  resetVoiceSessionContext,
} from "@/lib/voice-operator/commands";
import { applyPlatformActionResult } from "@/lib/platform-actions/apply-platform-action";
import { resolvePlatformActionFromIntent } from "@/lib/platform-actions/resolve-platform-action";
import { isAllowedNavigationHref } from "@/lib/platform-actions/registry";
import { validateNavigationHref, isRegisteredPlatformAction } from "@/lib/platform-actions/action-registry";
import {
  guestMayExecute,
  createPendingAuthIntent,
  savePendingAuthIntent,
  readPendingAuthIntent,
  clearPendingAuthIntent,
} from "@/lib/voice-operator/auth-action-policy";
import {
  confirmScientificIntake,
  createScientificIntakeDraft,
  matchScientificIntakeIntent,
} from "@/lib/scientific-intake/scientific-intake";
import { AUTH_COLLAB_EN, AUTH_COLLAB_UZ, AUTH_COLLAB_RU, AUTH_COLLAB_TR } from "@/lib/i18n/platform-copy-auth-collab";
import { platformToolCallToResult, createRealtimeToolHandlerState } from "@/lib/platform-actions/realtime-tool-handler";

function fakeRouter() {
  const pushes: string[] = [];
  return {
    pushes,
    router: {
      push: (href: string) => {
        pushes.push(href);
      },
      back: () => {},
    } as unknown as import("next/dist/shared/lib/app-router-context.shared-runtime").AppRouterInstance,
  };
}

test("typed navigation Kimyo sahifasini och executes research chemistry", () => {
  const res = resolveVoiceCommandFromText("Kimyo sahifasini och.", "uz");
  assert.equal(res.ok, true);
  assert.equal(res.action?.actionId, "navigate.research");
  assert.match(res.action?.target.href ?? "", /\/research\?q=chemistry/);
});

test("Dalillar / My Work / Reports navigation routes", () => {
  assert.equal(resolveVoiceCommandFromText("Dalillarni och", "uz").action?.actionId, "navigate.evidence");
  assert.equal(resolveVoiceCommandFromText("Mening ishlarimni och", "uz").action?.target.href, "/my-work");
  assert.equal(resolveVoiceCommandFromText("Hisobotlarni och", "uz").action?.target.href, "/reports");
});

test("UZ/EN/RU/TR closure navigation fixtures resolve allowlisted routes", () => {
  const cases: Array<[string, string, string | RegExp]> = [
    ["Bosh sahifani och", "uz", "/"],
    ["Tadqiqot sahifasini och", "uz", "/research"],
    ["Kimyo tadqiqotini och", "uz", /\/research\?.*q=chemistry/],
    ["Dalillarni och", "uz", "/knowledge"],
    ["Bilim grafigini och", "uz", "/graph"],
    ["Mening ishlarimni och", "uz", "/my-work"],
    ["Hisobotlarni och", "uz", "/reports"],
    ["Sozlamalarni och", "uz", "/settings"],
    ["Ilmiy hujjatlarni och", "uz", "/scientific-documents"],
    ["Fayllarimni och", "uz", "/files"],
    ["Jamoalarimni och", "uz", "/teams"],
    ["Xabarlarni och", "uz", "/messages"],
    ["Nashrlarimni och", "uz", "/publications"],
    ["open research", "en", "/research"],
    ["открой доказательства", "ru", "/knowledge"],
    ["araştırmayı aç", "tr", "/research"],
  ];
  for (const [text, locale, expected] of cases) {
    const href = resolveVoiceCommandFromText(text, locale as "en" | "uz" | "ru" | "tr").action?.target.href ?? "";
    if (typeof expected === "string") {
      assert.equal(href.split("?")[0], expected.split("?")[0], text);
      if (expected.includes("?")) assert.match(href, new RegExp(expected.replace(/[?]/g, "\\$&")));
    } else {
      assert.match(href, expected, text);
    }
  }
});

test("entity open fixtures for country/company/university", () => {
  assert.match(
    resolveVoiceCommandFromText("AQSh davlat sahifasini och", "uz").action?.target.href ?? "",
    /\/countries/,
  );
  assert.match(
    resolveVoiceCommandFromText("Apple kompaniyasini och", "uz").action?.target.href ?? "",
    /\/companies/,
  );
  assert.match(
    resolveVoiceCommandFromText("Stanford universitetini och", "uz").action?.target.href ?? "",
    /\/universities/,
  );
});

test("Realtime tool validation rejects unknown action and arbitrary URLs", () => {
  assert.equal(isRegisteredPlatformAction("navigate.home"), true);
  assert.equal(isRegisteredPlatformAction("hack.me"), false);
  assert.equal(isAllowedNavigationHref("https://evil.example"), false);
  assert.equal(validateNavigationHref("/research?q=chemistry"), true);
  const state = createRealtimeToolHandlerState(1);
  const bad = platformToolCallToResult(
    { callId: "1", name: "execute_platform_action", argumentsJson: '{"action_id":"not.real"}' },
    { locale: "en", pathname: "/", missionId: null, projectId: null, originalText: "x" },
    state,
    1,
  );
  assert.equal(bad.output.ok, false);
});

test("Realtime tool action_id applies navigation via applyPlatformActionResult", () => {
  const { router, pushes } = fakeRouter();
  const result = resolvePlatformActionFromIntent(
    {
      actionId: "navigate.evidence",
      confidence: "high",
      params: {},
      originalText: "dalillarni och",
    },
    { locale: "uz", pathname: "/", missionId: null, projectId: null, originalText: "dalillarni och" },
  );
  const outcome = applyPlatformActionResult(result, {
    router,
    openComposer: () => {},
    t: (k) => k,
  });
  assert.equal(outcome.handled, true);
  assert.equal(pushes[0], "/knowledge");
});

test("engine/mutation companion navigation still pushes", () => {
  const { router, pushes } = fakeRouter();
  const result = resolvePlatformActionFromIntent(
    {
      actionId: "engine.research.start",
      confidence: "high",
      params: { domain: "research" },
      originalText: "start research",
    },
    { locale: "en", pathname: "/", missionId: null, projectId: null, originalText: "start research" },
  );
  assert.equal(result.ok, true);
  if (result.ok) assert.ok(result.navigation?.href);
  applyPlatformActionResult(result, { router, openComposer: () => {}, t: (k) => k });
  assert.ok(pushes.length >= 1);
});

test("internal navigation session persistence — no pathname teardown", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /Internal client-side navigation must NOT tear down/);
  assert.doesNotMatch(provider, /\[pathname, releaseLiveAudioResources\]/);
  assert.match(provider, /applyPlatformActionResult/);
  assert.match(provider, /scheduleNavSuccessAnnounce/);
  assert.match(provider, /pendingNavAnnounceRef/);
});

test("Stop/Close cleanup and duplicate session guards remain", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /releaseLiveAudioResources/);
  assert.match(provider, /realtimeStartingRef/);
  assert.match(provider, /createLiveCaptureGate/);
});

test("guest protected PhD intake is gated — no auto upload", () => {
  assert.equal(matchScientificIntakeIntent("Menda 400 sahifalik PhD bor, qayerga yuboraman?"), true);
  const res = resolveVoiceCommandFromText("Menda 400 sahifalik PhD bor, qayerga yuboraman?", "uz");
  assert.equal(res.action?.actionId, "scientific_intake.compose");
  assert.equal(guestMayExecute("scientific_intake.compose"), false);
  clearVoiceCommandDedupe();
  resetVoiceSessionContext();
  const { router, pushes } = fakeRouter();
  let composer = 0;
  const out = executeVoiceCommand(
    { text: "Menda 400 sahifalik PhD bor, qayerga yuboraman?", locale: "uz", pathname: "/", final: true },
    { locale: "uz", pathname: "/", missionId: null, projectId: null, originalText: "Menda 400 sahifalik PhD bor, qayerga yuboraman?" },
    {
      router,
      openComposer: () => {
        composer += 1;
      },
      t: (k) => k,
      isSignedIn: false,
      onRequireSignIn: () => {},
    },
  );
  assert.equal(out.awaitingConfirmation, true);
  assert.equal(composer, 0);
  assert.equal(pushes.length, 0);
});

test("pending intent resume storage has no file payload", () => {
  clearPendingAuthIntent();
  const pending = createPendingAuthIntent({
    osAction: "prepare_upload",
    platformActionId: "scientific_intake.compose",
    href: "/scientific-documents?prepare=1",
    titleHint: null,
    originalText: "upload phd",
    locale: "en",
    metadata: {},
  });
  savePendingAuthIntent(pending);
  const read = readPendingAuthIntent();
  assert.ok(read);
  assert.equal("file" in (read?.metadata ?? {}), false);
  clearPendingAuthIntent();
});

test("authenticated PhD intake opens prepare surface without saving", () => {
  clearVoiceCommandDedupe();
  const { router, pushes } = fakeRouter();
  executeVoiceCommand(
    { text: "I have a 400-page chemistry PhD. Where do I upload it?", locale: "en", pathname: "/", final: true },
    {
      locale: "en",
      pathname: "/",
      missionId: null,
      projectId: null,
      originalText: "I have a 400-page chemistry PhD. Where do I upload it?",
    },
    { router, openComposer: () => {}, t: (k) => k, isSignedIn: true },
  );
  assert.ok(pushes.some((h) => h.includes("/scientific-documents")));
  assert.ok(pushes.some((h) => h.includes("prepare=1")));
});

test("team create and publication prepare require confirmation surfaces", () => {
  const team = resolveVoiceCommandFromText("Jamoa yarat", "uz");
  assert.equal(team.action?.actionId, "team.compose");
  assert.equal(team.action?.risk, "needs_confirmation");
  const pub = resolveVoiceCommandFromText("Ilmiy ishimni ommaga chiqar", "uz");
  assert.equal(pub.action?.actionId, "publication.prepare");
  assert.equal(pub.action?.risk, "needs_confirmation");
});

test("scientific intake confirm stays queued_pending — never fake ready", () => {
  const draft = createScientificIntakeDraft({
    title: "PhD",
    createdLocale: "en",
    copyrightConfirmed: true,
    fileName: "thesis.pdf",
    fileSizeBytes: 1024,
    fileMime: "application/pdf",
  });
  const queued = confirmScientificIntake(draft);
  assert.equal(queued.status, "queued_pending");
  assert.notEqual(queued.status, "ready");
});

test("Realtime tool path gates protected actions for guests (source contract)", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /guestMayExecute/);
  assert.match(provider, /recentToolStatementRef/);
  assert.match(provider, /savePendingAuthIntent/);
  assert.match(provider, /!isSignedIn && !guestMayExecute/);
});

test("collaboration routes appear in progressive disclosure nav", () => {
  const nav = readFileSync("lib/navigation.ts", "utf8");
  assert.match(nav, /title: "Collaboration"/);
  assert.match(nav, /href: "\/workspace"/);
  assert.match(nav, /href: "\/publications"/);
  assert.match(nav, /href: "\/scientific-documents"/);
});

test("no automatic account/project/team/publication creation from guest speech", () => {
  assert.equal(guestMayExecute("team.compose"), false);
  assert.equal(guestMayExecute("publication.prepare"), false);
  assert.equal(guestMayExecute("project.compose"), false);
  assert.equal(guestMayExecute("navigate.research"), true);
});

test("EN/UZ/RU/TR authCollab completeness", () => {
  for (const copy of [AUTH_COLLAB_EN, AUTH_COLLAB_UZ, AUTH_COLLAB_RU, AUTH_COLLAB_TR]) {
    assert.ok(copy.intakeTitle.length > 3);
    assert.ok(copy.guestNeedsSignInUpload.length > 10);
    assert.ok(copy.pubNeverAuto.length > 5);
  }
});

test("workspace routes exist", () => {
  for (const route of [
    "app/(dashboard)/workspace/page.tsx",
    "app/(dashboard)/scientific-documents/page.tsx",
    "app/(dashboard)/files/page.tsx",
    "app/(dashboard)/teams/page.tsx",
    "app/(dashboard)/messages/page.tsx",
    "app/(dashboard)/notifications/page.tsx",
    "app/(dashboard)/publications/page.tsx",
  ]) {
    assert.ok(existsSync(route), route);
  }
});

test("architecture decision note exists", () => {
  assert.ok(existsSync("docs/architecture/auth-collaboration-voice-os-decisions.md"));
});
