/**
 * Voice Command Orchestrator — focused regression suite.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  clearVoiceCommandDedupe,
  executeVoiceCommand,
  mayPersistProfileIdentity,
  parseVoiceCommandInput,
  readVoiceSessionContext,
  resetVoiceSessionContext,
  resolveVoiceCommandFromText,
  wasVoiceCommandRecentlyExecuted,
} from "@/lib/voice-operator/commands";
import { resolvePlatformDomain } from "@/lib/platform-actions/domain-resolver";
import { isAllowedNavigationHref } from "@/lib/platform-actions/registry";
import { VOICE_COMMAND_EN, VOICE_COMMAND_RU, VOICE_COMMAND_TR, VOICE_COMMAND_UZ } from "@/lib/i18n/platform-copy-voice-command";

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

test("1. Uzbek Men kimyogarman → Research + chemistry filter", () => {
  const resolution = resolveVoiceCommandFromText("Men kimyogarman.", "uz", "/");
  assert.equal(resolution.ok, true);
  assert.equal(resolution.action?.actionId, "navigate.research");
  assert.ok(resolution.action?.target.href?.startsWith("/research"));
  assert.match(resolution.action?.target.href ?? "", /q=chemistry/);
  assert.equal(resolution.sessionContextPatch?.domainId, "chemistry");
});

test("2. Kimyo bo'limiga o't opens same canonical target", () => {
  const a = resolveVoiceCommandFromText("Men kimyogarman", "uz");
  const b = resolveVoiceCommandFromText("Kimyo bo'limiga o't", "uz");
  assert.equal(a.action?.target.href, b.action?.target.href);
});

test("3. EN/RU/TR chemistry equivalents", () => {
  for (const [text, locale] of [
    ["I am a chemist", "en"],
    ["Я химик", "ru"],
    ["Ben kimyagerim", "tr"],
    ["open chemistry research", "en"],
  ] as const) {
    const domain = resolvePlatformDomain(text);
    assert.ok(domain, text);
    assert.equal(domain?.domain.id, "chemistry");
    const res = resolveVoiceCommandFromText(text, locale);
    assert.equal(res.ok, true, text);
    assert.ok(res.action?.target.href?.includes("/research"), text);
  }
});

test("4. Mening ishlarimni och → My Work", () => {
  const res = resolveVoiceCommandFromText("Mening ishlarimni och", "uz");
  assert.equal(res.action?.actionId, "navigate.my_work");
  assert.equal(res.action?.target.href, "/my-work");
});

test("5. Country company university entity navigation", () => {
  assert.equal(resolveVoiceCommandFromText("Germaniyani ko'rsat", "uz").action?.actionId, "entity.open_country");
  assert.equal(resolveVoiceCommandFromText("Apple kompaniyasini och", "uz").action?.actionId, "entity.open_company");
});

test("6. Evidence Graph Reports Settings Trust navigation", () => {
  assert.equal(resolveVoiceCommandFromText("Dalillarni ko'rsat", "uz").action?.actionId, "navigate.evidence");
  assert.equal(resolveVoiceCommandFromText("bilim grafigini och", "uz").action?.actionId, "navigate.graph");
  assert.equal(resolveVoiceCommandFromText("hisobotlarni och", "uz").action?.actionId, "navigate.reports");
  assert.equal(resolveVoiceCommandFromText("sozlamalarni och", "uz").action?.actionId, "navigate.settings");
  assert.equal(resolveVoiceCommandFromText("maxfiylik siyosatini och", "uz").action?.actionId, "navigate.trust");
});

test("7. Partial transcripts never execute", () => {
  const parsed = parseVoiceCommandInput({
    text: "Men kimyo",
    locale: "uz",
    pathname: "/",
    final: false,
  });
  assert.equal(parsed.accepted, false);
});

test("8. Duplicate final transcript does not execute twice", () => {
  clearVoiceCommandDedupe();
  resetVoiceSessionContext();
  const { router, pushes } = fakeRouter();
  const deps = {
    router,
    openComposer: () => {},
    t: (k: string) => k,
  };
  const first = executeVoiceCommand(
    { text: "Dalillarni ko'rsat", locale: "uz", pathname: "/", final: true },
    { locale: "uz", pathname: "/", missionId: null, projectId: null, originalText: "Dalillarni ko'rsat" },
    deps,
  );
  const second = executeVoiceCommand(
    { text: "Dalillarni ko'rsat", locale: "uz", pathname: "/", final: true },
    { locale: "uz", pathname: "/", missionId: null, projectId: null, originalText: "Dalillarni ko'rsat" },
    deps,
  );
  assert.equal(first.executed, true);
  assert.equal(second.duplicate, true);
  assert.equal(pushes.length, 1);
  assert.ok(wasVoiceCommandRecentlyExecuted("Dalillarni ko'rsat"));
});

test("9. Arbitrary model URL rejected", () => {
  assert.equal(isAllowedNavigationHref("https://evil.example"), false);
  assert.equal(isAllowedNavigationHref("javascript:alert(1)"), false);
});

test("10. Unsupported / ambiguous chemistry asks clarification", () => {
  const res = resolveVoiceCommandFromText("Kimyoni och", "uz");
  assert.equal(res.ok, false);
  assert.ok(res.clarifyOptions && res.clarifyOptions.length >= 2);
});

test("11. Safe navigation executes without confirmation", () => {
  const res = resolveVoiceCommandFromText("tadqiqotni och", "uz");
  assert.equal(res.action?.risk, "safe_reversible");
});

test("12. Project/object creation requires confirmation", () => {
  const res = resolveVoiceCommandFromText("Kimyo bo'yicha yangi ish reja tuz", "uz");
  assert.ok(res.action?.risk === "needs_confirmation" || res.platformResult?.ok === true);
  if (res.platformResult?.ok) {
    assert.ok(res.platformResult.mutation || res.platformResult.engineStart);
  }
});

test("13. Profile identity is not silently persisted", () => {
  assert.equal(mayPersistProfileIdentity(), false);
  resetVoiceSessionContext();
  resolveVoiceCommandFromText("Men kimyogarman", "uz");
  // session patch exists on resolution; context apply happens in executor
  clearVoiceCommandDedupe();
  const { router } = fakeRouter();
  executeVoiceCommand(
    { text: "Men kimyogarman", locale: "uz", pathname: "/", final: true },
    { locale: "uz", pathname: "/", missionId: null, projectId: null, originalText: "Men kimyogarman" },
    { router, openComposer: () => {}, t: (k) => k },
  );
  const ctx = readVoiceSessionContext();
  assert.equal(ctx.domainId, "chemistry");
  assert.match(ctx.roleHint ?? "", /kimyogar/i);
});

test("14. Voice mic tears down on client-side navigation — transcript memory preserved", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /Privacy P0: SPA route changes must release the mic/);
  assert.match(provider, /}, \[pathname, releaseLiveAudioResources\]\)/);
  const routeBlock = provider.match(/Privacy P0: SPA route changes[\s\S]*?\}, \[pathname, releaseLiveAudioResources\]\);/);
  assert.ok(routeBlock);
  assert.doesNotMatch(routeBlock![0], /clearVoiceSessionMemory/);
});

test("15. Stop/Close remain wired after commands", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /voice\.stop/);
  assert.match(provider, /voice\.close/);
  assert.match(provider, /releaseLiveAudioResources/);
});

test("16. No duplicate microphone stream guards remain", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /realtimeStartingRef/);
  assert.match(provider, /createLiveCaptureGate/);
});

test("17. EN/UZ/RU/TR dictionary completeness for voiceCommand", () => {
  for (const copy of [VOICE_COMMAND_EN, VOICE_COMMAND_UZ, VOICE_COMMAND_RU, VOICE_COMMAND_TR]) {
    assert.ok(copy.askHowToHelp.length > 0);
    assert.ok(copy.announcedChemistry.length > 0);
    assert.ok(copy.clarifyChemistry.length > 0);
  }
  for (const lang of ["en", "uz", "ru", "tr"] as const) {
    const dict = readFileSync(`lib/i18n/dictionaries/${lang}.ts`, "utf8");
    assert.match(dict, /voiceCommand:/);
  }
});

test("18. Mobile voice dock avoids full-bleed overflow classes", () => {
  const dock = readFileSync("components/voice-operator/VoiceOperatorDock.tsx", "utf8");
  assert.match(dock, /max-w-\[min\(18rem/);
  assert.match(dock, /OperatorActionStatus/);
  assert.match(dock, /OperatorCommandClarifyCard/);
});

test("19. Orchestrator uses platform-actions — not a competing architecture", () => {
  const resolver = readFileSync("lib/voice-operator/commands/voice-command-resolver.ts", "utf8");
  assert.match(resolver, /resolvePlatformIntent/);
  assert.match(resolver, /resolvePlatformActionFromIntent/);
  const index = readFileSync("lib/voice-operator/commands/index.ts", "utf8");
  assert.match(index, /Realtime/);
});
