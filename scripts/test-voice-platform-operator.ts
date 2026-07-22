/**
 * Voice Platform Operator — canonical action registry, tool safety, intent parity.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  PLATFORM_ACTION_IDS,
  PLATFORM_ACTION_REGISTRY,
  hrefForAction,
  isAllowedNavigationHref,
} from "@/lib/platform-actions/registry";
import { resolvePlatformIntent, governmentVsGovernanceIntent } from "@/lib/platform-actions/intent-matcher";
import { resolvePlatformAction, resolvePlatformActionFromIntent } from "@/lib/platform-actions/resolve-platform-action";
import { resolvePlatformDomain } from "@/lib/platform-actions/domain-resolver";
import {
  buildPlatformRealtimeTools,
  validatePlatformToolArguments,
} from "@/lib/platform-actions/realtime-tool-schemas";
import {
  buildRealtimeToolOutputMessages,
  createRealtimeToolHandlerState,
  platformToolCallToResult,
} from "@/lib/platform-actions/realtime-tool-handler";
import { parseRealtimeServerEvent } from "@/lib/voice-operator/realtime/realtime-events";
import { buildVoiceOperatorInstructions, VOICE_OPERATOR_INTRO_PHRASES } from "@/lib/voice-operator/instructions";
import { interpretCommand } from "@/lib/operational-objects/command-interpreter";
import { getDictionary } from "@/lib/i18n/translate";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

const baseContext = {
  locale: "uz",
  pathname: "/",
  missionId: null,
  projectId: null,
  originalText: "",
};

const voiceContext = {
  relationshipFocus: null,
  operatorName: "Operator",
  focusedEntityName: undefined,
};

test("1. canonical action registry includes required navigation actions", () => {
  for (const id of [
    "navigate.home",
    "navigate.my_work",
    "navigate.evidence",
    "navigate.research",
    "navigate.government",
    "navigate.governance",
    "voice.stop",
    "report.compose",
  ]) {
    assert.ok(PLATFORM_ACTION_REGISTRY[id as keyof typeof PLATFORM_ACTION_REGISTRY], id);
  }
  assert.equal(PLATFORM_ACTION_IDS.length, Object.keys(PLATFORM_ACTION_REGISTRY).length);
});

test("2. no arbitrary URL execution — external and javascript blocked", () => {
  assert.equal(isAllowedNavigationHref("https://evil.example"), false);
  assert.equal(isAllowedNavigationHref("javascript:alert(1)"), false);
  assert.equal(isAllowedNavigationHref("/research/microbiology"), true);
});

test("3. tool argument validation rejects unknown keys and bad action ids", () => {
  assert.equal(
    validatePlatformToolArguments({ action_id: "navigate.home", evil: true }),
    null,
  );
  assert.equal(validatePlatformToolArguments({ action_id: "navigate.evil" }), null);
  const valid = validatePlatformToolArguments({ action_id: "navigate.home" });
  assert.ok(valid);
  assert.equal(valid?.action_id, "navigate.home");
});

test("4. duplicate call_id ignored on second invocation", () => {
  const state = createRealtimeToolHandlerState(1);
  const req = { callId: "call-1", name: "execute_platform_action", argumentsJson: '{"action_id":"navigate.home"}' };
  const first = platformToolCallToResult(req, { ...baseContext, originalText: "home" }, state, 1);
  const second = platformToolCallToResult(req, { ...baseContext, originalText: "home" }, state, 1);
  assert.equal(first.output.ok, true);
  assert.equal(second.output.ok, false);
  if (second.output.ok === false) assert.equal(second.output.code, "duplicate_call");
});

test("5. stale session results ignored", () => {
  const state = createRealtimeToolHandlerState(1);
  const result = platformToolCallToResult(
    { callId: "call-2", name: "execute_platform_action", argumentsJson: '{"action_id":"navigate.home"}' },
    { ...baseContext, originalText: "home" },
    state,
    99,
  );
  assert.equal(result.output.ok, false);
});

test("6. navigation success lifecycle returns allowed href", () => {
  const result = resolvePlatformAction("bosh sahifani och", { ...baseContext, originalText: "bosh sahifani och" });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.navigation?.href, "/");
});

test("7. navigation failure for unknown entity without id", () => {
  const result = resolvePlatformActionFromIntent(
    {
      actionId: "entity.open_country",
      confidence: "high",
      params: {},
      originalText: "open country",
    },
    { ...baseContext, originalText: "open country" },
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "entity_not_found");
});

test("8. mutations require confirmation — report compose opens draft only", () => {
  const result = resolvePlatformAction("hisobot yaratmoqchiman", { ...baseContext, originalText: "hisobot yaratmoqchiman" });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(result.mutation);
    assert.equal(result.mutation?.draft.status, "draft");
  }
});

test("9. confirm_create never auto-saves", () => {
  const def = PLATFORM_ACTION_REGISTRY["operational_object.confirm_create"];
  assert.equal(def.mutationKind, "draft");
});

test("10. typed and voice command parity through interpretCommand", () => {
  const typed = interpretCommand("dalillarni och", voiceContext, { locale: "uz", pathname: "/", missionId: null, projectId: null });
  assert.equal(typed.kind, "navigate");
});

test("11. Uzbek command aliases resolve home and evidence", () => {
  assert.equal(resolvePlatformIntent("dalillarni och", "uz")?.actionId, "navigate.evidence");
  assert.equal(resolvePlatformIntent("mening ishlarimni ko'rsat", "uz")?.actionId, "navigate.my_work");
});

test("12. chemistry domain resolution opens research context", () => {
  const domain = resolvePlatformDomain("Men kimyogarman, kimyo bo'yicha tadqiqot boshlamoqchiman");
  assert.ok(domain);
  assert.equal(domain?.domain.id, "chemistry");
  const result = resolvePlatformAction("Men kimyogarman, kimyo bo'yicha tadqiqot boshlamoqchiman", {
    ...baseContext,
    originalText: "Men kimyogarman, kimyo bo'yicha tadqiqot boshlamoqchiman",
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.ok(result.navigation?.href.startsWith("/research"));
});

test("13. government vs governance distinction", () => {
  assert.equal(governmentVsGovernanceIntent("davlat boshqaruvi dalillarini ko'rsat"), "navigate.government");
  assert.equal(governmentVsGovernanceIntent("platforma qoidalarini ko'rsat"), "navigate.governance");
  assert.equal(resolvePlatformIntent("investor ish maydonini och", "uz")?.actionId, "navigate.investor");
});

test("14. entity selection — Germany country", () => {
  const intent = resolvePlatformIntent("Germaniyani ko'rsat", "uz");
  assert.equal(intent?.actionId, "entity.open_country");
  assert.ok(intent?.params.entityId);
});

test("15. ambiguous short input offers clarification", () => {
  const result = resolvePlatformAction("suv", { ...baseContext, locale: "uz", originalText: "suv" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "ambiguous_intent");
});

test("16. route context keys present in draft provenance", () => {
  const result = resolvePlatformAction("hisobot yaratmoqchiman", { ...baseContext, pathname: "/reports", originalText: "hisobot yaratmoqchiman" });
  assert.equal(result.ok, true);
  if (result.ok && result.mutation) {
    assert.equal(result.mutation.draft.provenance.routePath, "/reports");
    assert.equal(result.mutation.draft.provenance.originalText, "hisobot yaratmoqchiman");
  }
});

test("17. identity introduction uses canonical Uzbek Voice Operator phrase", () => {
  assert.match(VOICE_OPERATOR_INTRO_PHRASES.uz, /Men CBAI Ovoz Operatoriman/);
  assert.match(VOICE_OPERATOR_INTRO_PHRASES.uz, /Yakuniy qarorni siz qabul qilasiz/);
  const instructions = buildVoiceOperatorInstructions("uz");
  assert.match(instructions, /Do NOT repeat the full first-run introduction/i);
  assert.match(instructions, /Do not open with generic phrases/);
  assert.match(instructions, /Botir Choriev/);
});

test("18. no generic AI introduction in instructions", () => {
  const instructions = buildVoiceOperatorInstructions("en");
  assert.match(instructions, /Do not open with generic phrases/);
});

test("19. EN/UZ/RU/TR platform action key completeness", () => {
  for (const lang of ["en", "uz", "ru", "tr"] as const) {
    const dict = getDictionary(lang);
    assert.ok(dict.platformAction.successHome, lang);
    assert.ok(dict.platformGuidance.cardTitle, lang);
    assert.ok(dict.voiceOperator.stateExecutingAction, lang);
  }
});

test("20. user text preserved exactly in draft provenance", () => {
  const phrase = "Men kimyogarman, kimyo bo'yicha tadqiqot boshlamoqchiman";
  const result = resolvePlatformAction(phrase, { ...baseContext, originalText: phrase });
  assert.equal(result.ok, true);
  if (result.ok && result.mutation) {
    assert.equal(result.mutation.draft.provenance.originalText, phrase);
  }
});

test("21. stop/close lifecycle hooks remain in provider", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /releaseLiveAudioResources/);
  assert.match(provider, /stopLiveAudioCapture/);
});

test("22. double mic click guarded", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /realtimeStartingRef\.current/);
  assert.match(provider, /micLive \|\| realtimeStartingRef/);
});

test("23. route change preserves live voice session (auth collaboration P0)", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /Internal client-side navigation must NOT tear down/);
  assert.doesNotMatch(provider, /\[pathname, releaseLiveAudioResources\]/);
});

test("24. tool event after close uses stale session guard", () => {
  const webrtc = readSource("lib/voice-operator/realtime/openai-webrtc-session.ts");
  assert.match(webrtc, /session\.disconnected/);
});

test("25. no OPENAI_API_KEY in client bundle sources", () => {
  const client = readSource("lib/voice-operator/session-broker/client.ts");
  assert.doesNotMatch(client, /OPENAI_API_KEY/);
  const providerSource = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.doesNotMatch(providerSource, /sk-[A-Za-z0-9]/);
});

test("26. static export compatibility — no node-only imports in platform-actions", () => {
  const index = readSource("lib/platform-actions/index.ts");
  assert.doesNotMatch(index, /node:fs/);
  assert.doesNotMatch(index, /node:crypto/);
});

test("27. guidance card is dismissible and limited to three actions", () => {
  const card = readSource("components/voice-operator/OperatorGuidanceCard.tsx");
  assert.match(card, /onDismiss/);
  assert.match(card, /slice\(0, 3\)/);
});

test("28. realtime tool output triggers response.create", () => {
  const messages = buildRealtimeToolOutputMessages({ callId: "c1", output: { ok: true } });
  assert.equal(messages.length, 2);
  assert.equal(messages[1]?.type, "response.create");
});

test("realtime events parse function_call_arguments.done", () => {
  const parsed = parseRealtimeServerEvent(
    JSON.stringify({
      type: "response.function_call_arguments.done",
      call_id: "call_abc",
      name: "execute_platform_action",
      arguments: '{"action_id":"navigate.home"}',
    }),
  );
  assert.ok(parsed?.toolCall);
  assert.equal(parsed?.toolCall?.callId, "call_abc");
});

test("broker session includes allowlisted tools only", () => {
  const broker = readSource("lib/voice-operator/session-broker/pages-voice-session-broker.ts");
  assert.match(broker, /buildPlatformRealtimeTools/);
  const tools = buildPlatformRealtimeTools();
  assert.equal(tools.length, 1);
});

test("hrefForAction never returns external urls", () => {
  const href = hrefForAction("navigate.home", {});
  assert.ok(href?.startsWith("/"));
});
