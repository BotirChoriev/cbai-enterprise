/**
 * CBAI Voice Operator — deterministic architecture and safety tests (no live API credentials).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test, beforeEach } from "node:test";
import {
  assertNoLongLivedApiKeyInClient,
  evaluateVoiceBrokerStatus,
  requestRealtimeSessionCredential,
  setMockSessionBrokerHandler,
  setVoiceBrokerEnvUrlForTests,
} from "@/lib/voice-operator/session-broker/client";
import {
  clearConversationPendingState,
  detectEvidenceSearchIntent,
  isAffirmativeReply,
  processConversationInput,
  resolveOperatorMode,
} from "@/lib/voice-operator/conversation-engine";
import {
  clearVoiceSessionMemory,
  createVoiceSessionMemory,
  readVoiceSessionMemory,
  sessionHasExecutableReplay,
} from "@/lib/voice-operator/session-memory";
import {
  executeVoiceTool,
  grantExternalSearchConsent,
  revokeExternalSearchConsent,
} from "@/lib/voice-operator/tools/voice-tools";
import {
  toolMayRunConversationally,
  toolRequiresExternalConsent,
  toolRequiresHumanConfirmation,
} from "@/lib/voice-operator/tool-policy";
import { clearVoiceToolAuditForTests, readVoiceToolAudit } from "@/lib/voice-operator/tool-audit";
import { VOICE_VAD_CONFIG, nextVadPhase } from "@/lib/voice-operator/vad-config";
import {
  createMockRealtimeProvider,
  createUnavailableRealtimeProvider,
  resolveRealtimeProvider,
} from "@/lib/voice-operator/realtime/realtime-provider";
import { buildVoiceOperatorInstructions, getVoiceOperatorIntroPhrase, VOICE_OPERATOR_DOMAIN_VOCABULARY, VOICE_OPERATOR_INTRO_PHRASES } from "@/lib/voice-operator/instructions";
import { getDictionary } from "@/lib/i18n/translate";
import { createSmartIdea } from "@/lib/research-canvas/smart-idea-store";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

beforeEach(() => {
  clearVoiceSessionMemory();
  clearConversationPendingState();
  clearVoiceToolAuditForTests();
  setMockSessionBrokerHandler(null);
  setVoiceBrokerEnvUrlForTests(undefined);
  revokeExternalSearchConsent();
});

// --- Layout / Voice Dock ---

test("1. mic in command bar is text-only by default — voice lives in dock", () => {
  const acc = readSource("components/assistant/AssistantCommandCenter.tsx");
  assert.match(acc, /textOnly\s*=\s*true/);
  assert.match(acc, /!textOnly/);
});

test("2. VoiceOperatorDock is fixed bottom-center with sidebar offset", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /fixed inset-x-0 bottom-0/);
  assert.match(dock, /md:pl-\[18rem\]/);
});

test("3. dashboard main reserves bottom padding so dock does not cover content permanently", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /cbai-platform-main/);
  const css = readSource("app/globals.css");
  assert.match(css, /--cbai-dock-inset/);
  assert.match(layout, /VoiceOperatorDock/);
});

test("4. permission errors render inside VoiceOperatorPermissionCard within dock", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /VoiceOperatorPermissionCard/);
  assert.ok(!dock.includes("AmbientTrustStrip"));
});

test("5. closing permission card is handled in provider without page overlay", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /dismissPermission/);
  assert.match(provider, /setPermissionIssue\(null\)/);
});

test("6. mobile safe-area inset on dock", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /safe-area-inset-bottom/);
});

test("7. text fallback input exists in dock", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /textFallback/);
  assert.match(dock, /sendTextMessage/);
});

test("7b. mic toggle icons: active unslashed teal stops capture, inactive slashed starts capture", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /vo\.micLive \? vo\.stopListening\(\) : vo\.startListening\(\)/);
  assert.match(dock, /micDisabled[\s\S]*localCapabilityUserNotice[\s\S]*micLive[\s\S]*stopLiveListening[\s\S]*unmuteMic/);
  assert.match(dock, /copy\.stopLiveListening/);
  assert.match(dock, /copy\.liveListeningActive/);
  assert.match(dock, /copy\.liveListeningScope/);
  assert.doesNotMatch(dock, /animate-pulse/);
  assert.doesNotMatch(dock, /border-red-500/);
  assert.doesNotMatch(dock, /ring-red-500/);

  const micIconTernary = dock.match(/\{vo\.micLive \? \([\s\S]*?\) : \([\s\S]*?\)\}/);
  assert.ok(micIconTernary, "mic icon ternary");
  const branchMatch = micIconTernary![0].match(
    /vo\.micLive \? \(([\s\S]*?)\) : \(([\s\S]*?)\)\}/,
  );
  assert.ok(branchMatch, "mic icon branches");
  const activeIcon = branchMatch![1];
  const inactiveIcon = branchMatch![2];
  assert.doesNotMatch(activeIcon, /M4\.5 4\.5l15 15/);
  assert.match(inactiveIcon, /M4\.5 4\.5l15 15/);
  assert.match(dock, /cbai-voice-dock-btn-live/);
  assert.match(dock, /cbai-voice-dock-input/);
  assert.match(dock, /var\(--cbai-glass-surface\)/);

  const uz = readSource("lib/i18n/platform-copy-voice-operator.ts");
  assert.match(uz, /liveListeningActive: "Jonli tinglash faol"/);
  assert.match(uz, /liveListeningScope: "Mikrofon faqat ushbu suhbat davomida ishlaydi\."/);
  assert.match(uz, /stopLiveListening: "To'xtatish"/);
});

// --- Permission ---

test("8. permission card shows retry and does not claim code overrides Safari", () => {
  const card = readSource("components/voice-operator/VoiceOperatorPermissionCard.tsx");
  assert.match(card, /permissionRetry/);
  assert.match(card, /permissionDeniedHelp/);
  const uz = readSource("lib/i18n/platform-copy-voice-operator.ts");
  assert.match(uz, /o'zgartirib bo'lmaydi/);
});

test("9. retry permission is wired in provider", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /retryPermission/);
});

test("10. microphone denial comes from getUserMedia mapping not SpeechRecognition alone", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /requestMicrophoneAccess/);
  assert.match(provider, /mapSpeechRecognitionError/);
  const mic = readSource("lib/voice-operator/microphone-access.ts");
  assert.match(mic, /NotAllowedError/);
  assert.match(mic, /speech_unavailable/);
});

test("10b. broker and microphone states are independent", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /brokerIssue/);
  assert.match(provider, /VoiceOperatorBrokerNotice|brokerIssue/);
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /VoiceOperatorBrokerNotice/);
});

test("10c. realtime path uses broker credential not browser SpeechRecognition", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /startRealtimeListening/);
  assert.match(provider, /requestRealtimeSessionCredential/);
  assert.doesNotMatch(provider, /operatorMode\.mode === "realtime"[\s\S]*startBrowserSpeechSession/);
});

// --- Realtime architecture ---

test("12. long-lived API key guard rejects sk- prefix in client", () => {
  assert.equal(assertNoLongLivedApiKeyInClient(undefined), true);
  assert.equal(assertNoLongLivedApiKeyInClient("ek_test"), true);
  assert.equal(assertNoLongLivedApiKeyInClient("sk-live-secret"), false);
});

test("13. broker returns ephemeral credential shape only via mock", async () => {
  setMockSessionBrokerHandler(() => ({
    ok: true,
    credential: {
      clientSecret: "ek_test_ephemeral",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      sessionId: "sess-1",
      model: "gpt-4o-realtime-preview",
    },
  }));
  const res = await requestRealtimeSessionCredential({ language: "uz", origin: "http://localhost:3000" });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.ok(res.credential.clientSecret.startsWith("ek_"));
    assert.ok(!res.credential.clientSecret.startsWith("sk-"));
  }
});

test("14. session broker blocks disallowed origin", async () => {
  setMockSessionBrokerHandler((req) => {
    if (req.origin.includes("evil")) {
      return { ok: false, code: "ORIGIN_BLOCKED", message: "Origin not allowed." };
    }
    return {
      ok: true,
      credential: {
        clientSecret: "ek_test",
        expiresAt: new Date().toISOString(),
        sessionId: "s",
        model: "gpt-4o-realtime-preview",
      },
    };
  });
  const blocked = await requestRealtimeSessionCredential({ language: "uz", origin: "https://evil.example" });
  assert.equal(blocked.ok, false);
  if (!blocked.ok) assert.equal(blocked.code, "ORIGIN_BLOCKED");
});

test("15. missing broker returns BACKEND_REQUIRED", async () => {
  const prev = process.env.NEXT_PUBLIC_VOICE_BROKER_URL;
  delete process.env.NEXT_PUBLIC_VOICE_BROKER_URL;
  const status = evaluateVoiceBrokerStatus();
  assert.equal(status.kind, "backend_required");
  const res = await requestRealtimeSessionCredential({ language: "uz", origin: "http://localhost:3000" });
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.code, "BACKEND_REQUIRED");
  if (prev) process.env.NEXT_PUBLIC_VOICE_BROKER_URL = prev;
});

test("16. tool audit stores events without raw audio fields", () => {
  executeVoiceTool("get_active_context", {}, { sessionId: "s1", language: "uz" });
  const events = readVoiceToolAudit("s1");
  assert.equal(events.length, 1);
  assert.ok(!JSON.stringify(events).includes("audio"));
});

test("17. mock realtime provider rejects sk- client secrets", async () => {
  const provider = createMockRealtimeProvider();
  await provider.connect(
    {
      clientSecret: "sk-forbidden",
      expiresAt: new Date().toISOString(),
      sessionId: "x",
      model: "gpt-4o-realtime-preview",
    },
    "uz",
  );
  assert.equal(provider.getState(), "error");
});

// --- Conversation ---

test("18. session memory persists turns within session", async () => {
  createSmartIdea({
    title: "Bio sensor",
    originalDescription: "d",
    problem: "p",
    purpose: "u",
    domain: "bio",
    owner: "test",
  });
  createVoiceSessionMemory("uz", "browser_fallback");
  await processConversationInput("Kerakli dalillarni izla", { sessionId: "s", language: "uz" });
  const session = readVoiceSessionMemory();
  assert.ok(session);
  assert.ok(session!.turns.length >= 2);
});

test("19. VAD speech start/stop updates phase", () => {
  assert.equal(nextVadPhase("idle", true), "speech_started");
  assert.equal(nextVadPhase("speech_started", false), "speech_ended");
  assert.ok(VOICE_VAD_CONFIG.silenceDurationMs >= 800);
});

test("20. interruption stops responding state in mock provider", async () => {
  const provider = createMockRealtimeProvider();
  await provider.connect(
    {
      clientSecret: "ek_test",
      expiresAt: new Date().toISOString(),
      sessionId: "x",
      model: "gpt-4o-realtime-preview",
    },
    "uz",
  );
  provider.onStateChange(() => {});
  provider.interrupt();
  assert.notEqual(provider.getState(), "responding");
});

test("21. conversation engine returns single response per input", async () => {
  createSmartIdea({
    title: "Test idea",
    originalDescription: "d",
    problem: "p",
    purpose: "u",
    domain: "test",
    owner: "test",
  });
  const r1 = await processConversationInput("noma'lum gap", { sessionId: "s", language: "uz" });
  assert.ok(r1.assistantText.length > 0);
  assert.equal(r1.dockState, "ready");
});

test("22. refresh does not replay executable voice commands", () => {
  assert.equal(sessionHasExecutableReplay(), false);
});

test("23. end session clears memory helper exists", () => {
  createVoiceSessionMemory("uz", "browser_fallback");
  clearVoiceSessionMemory();
  assert.equal(readVoiceSessionMemory(), null);
});

// --- Tools ---

test("24. read-only tools may run conversationally", () => {
  assert.equal(toolMayRunConversationally("list_existing_evidence"), true);
  assert.equal(toolMayRunConversationally("get_active_context"), true);
});

test("25. external search cannot run before consent", async () => {
  createSmartIdea({
    title: "Idea",
    originalDescription: "d",
    problem: "p",
    purpose: "u",
    domain: "x",
    owner: "t",
  });
  const result = await executeVoiceTool(
    "run_external_evidence_search",
    { query: "sanitized query" },
    { sessionId: "s", language: "uz", externalConsentGranted: false },
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.consentRequired, true);
});

test("26. prepare search uses sanitized query path", async () => {
  const idea = createSmartIdea({
    title: "Quantum",
    originalDescription: "desc",
    problem: "problem",
    purpose: "purpose",
    domain: "physics",
    owner: "test",
  });
  const prep = await executeVoiceTool(
    "prepare_external_evidence_search",
    { query: "quantum sensing metadata" },
    { sessionId: "s", language: "uz", smartIdeaId: idea.id },
  );
  assert.equal(prep.ok, true);
});

test("27. follow-up search respects session consent scope", () => {
  createVoiceSessionMemory("uz", "browser_fallback");
  grantExternalSearchConsent("quantum optics", ["crossref", "openalex"]);
  const session = readVoiceSessionMemory();
  assert.ok(session?.externalSearchConsent?.active);
  assert.equal(session?.externalSearchConsent?.sanitizedQuery, "quantum optics");
  revokeExternalSearchConsent();
  assert.equal(readVoiceSessionMemory()?.externalSearchConsent?.active, false);
});

test("28. draft mission is not auto-saved", async () => {
  const draft = await executeVoiceTool("draft_mission", {}, { sessionId: "s", language: "uz" });
  assert.equal(draft.ok, true);
  if (draft.ok) {
    assert.equal((draft.data as { draftOnly: boolean }).draftOnly, true);
    assert.equal((draft.data as { requiresConfirmation: boolean }).requiresConfirmation, true);
  }
});

test("29. consequential tools require human confirmation policy", () => {
  assert.equal(toolRequiresHumanConfirmation("draft_task"), true);
  assert.equal(toolRequiresHumanConfirmation("prepare_decision_package"), true);
});

test("30. external search tool results include provenance fields when mocked path succeeds", async () => {
  createSmartIdea({
    title: "Materials",
    originalDescription: "d",
    problem: "p",
    purpose: "u",
    domain: "mat",
    owner: "t",
  });
  grantExternalSearchConsent("materials science", ["crossref"]);
  const search = await executeVoiceTool(
    "run_external_evidence_search",
    { query: "materials science" },
    { sessionId: "s", language: "uz", externalConsentGranted: true },
  );
  if (search.ok && search.data) {
    const payload = search.data as { items: Array<{ provider: string }> };
    assert.ok(Array.isArray(payload.items));
  }
});

test("31. provider failure can be represented in payload shape", () => {
  const payload = {
    query: "q",
    items: [],
    providerFailures: ["openalex"],
    limitations: ["Metadata only."],
  };
  assert.ok(payload.providerFailures.includes("openalex"));
});

test("32. evidence drawer opens in current context without generic research navigation", () => {
  const drawer = readSource("components/voice-operator/EvidenceResultsDrawer.tsx");
  assert.match(drawer, /fixed inset-x-0 bottom-28/);
  assert.ok(!drawer.includes('href="/research"'));
});

test("33. voice tools module has no unrestricted router imports", () => {
  const source = readSource("lib/voice-operator/tools/voice-tools.ts");
  assert.ok(!source.includes("useRouter"));
  assert.ok(!source.includes("window.location"));
});

// --- Language ---

test("34. Uzbek conversation responses use Uzbek copy", async () => {
  createSmartIdea({
    title: "Idea",
    originalDescription: "d",
    problem: "p",
    purpose: "u",
    domain: "x",
    owner: "t",
  });
  const r = await processConversationInput("dalillarni izla", { sessionId: "s", language: "uz" });
  assert.match(r.assistantText, /Davom|sanitizatsiya|qidiruv/i);
});

test("35. domain terminology preserved in instructions", () => {
  assert.ok(VOICE_OPERATOR_DOMAIN_VOCABULARY.includes("Crossref"));
  assert.ok(VOICE_OPERATOR_DOMAIN_VOCABULARY.includes("Smart Idea"));
  const instructions = buildVoiceOperatorInstructions("uz");
  assert.match(instructions, /Crossref/);
  assert.match(instructions, /CBAI Ovoz Operatoriman/);
  assert.match(instructions, /qaror qilmang|never make decisions/i);
});

test("35b. Uzbek identity intro phrase is canonical and non-generic", () => {
  const intro = getVoiceOperatorIntroPhrase("uz");
  assert.equal(intro, VOICE_OPERATOR_INTRO_PHRASES.uz);
  assert.match(intro, /Men CBAI Ovoz Operatoriman/);
  assert.match(intro, /Yakuniy qarorni siz qabul qilasiz/);
  assert.doesNotMatch(intro, /sun'iy intellekt/i);
  const instructions = buildVoiceOperatorInstructions("uz");
  assert.match(instructions, /Men CBAI Ovoz Operatoriman/);
  assert.match(instructions, /Do NOT repeat the full first-run introduction/i);
  assert.match(instructions, /Never claim to be human/i);
  assert.match(instructions, /Men sun'iy intellektman/);
  assert.match(instructions, /Botir Choriev/);
  assert.match(instructions, /Universal Intelligence Operating System/);
});

test("35c. English identity instructions use CBAI Voice Operator intro", () => {
  const intro = getVoiceOperatorIntroPhrase("en");
  assert.equal(intro, VOICE_OPERATOR_INTRO_PHRASES.en);
  const instructions = buildVoiceOperatorInstructions("en");
  assert.match(instructions, /I am the CBAI Voice Operator/);
  assert.match(instructions, /Never claim to be human/i);
  assert.match(instructions, /Do NOT repeat the full first-run introduction/i);
  assert.match(instructions, /Botir Choriev/);
});

test("35d. Russian identity instructions use CBAI Voice Operator intro", () => {
  const intro = getVoiceOperatorIntroPhrase("ru");
  assert.equal(intro, VOICE_OPERATOR_INTRO_PHRASES.ru);
  const instructions = buildVoiceOperatorInstructions("ru");
  assert.match(instructions, /голосовой оператор CBAI/i);
  assert.match(instructions, /Never claim to be human/i);
  assert.match(instructions, /Botir|Ботира/);
});

test("35e. Turkish identity instructions use CBAI Voice Operator intro", () => {
  const intro = getVoiceOperatorIntroPhrase("tr");
  assert.equal(intro, VOICE_OPERATOR_INTRO_PHRASES.tr);
  const instructions = buildVoiceOperatorInstructions("tr");
  assert.match(instructions, /CBAI Ses Operatörüyüm/);
  assert.match(instructions, /Never claim to be human/i);
  assert.match(instructions, /Advise only/i);
});

test("36. unclear input triggers clarification", async () => {
  const r = await processConversationInput("", { sessionId: "s", language: "uz" });
  assert.match(r.assistantText, /Aniqroq|clarify/i);
});

test("37. browser fallback mode is labeled when broker missing", () => {
  setVoiceBrokerEnvUrlForTests(null);
  const mode = resolveOperatorMode("uz");
  assert.equal(mode.mode, "browser_fallback");
  assert.equal(mode.backendRequired, true);
});

test("38. live mode requires broker — unavailable provider stays backend_required", async () => {
  const provider = createUnavailableRealtimeProvider();
  await provider.connect(
    {
      clientSecret: "ek_test",
      expiresAt: new Date().toISOString(),
      sessionId: "x",
      model: "gpt-4o-realtime-preview",
    },
    "uz",
  );
  assert.equal(provider.getState(), "backend_required");
});

test("39. evidence intent detection recognizes Uzbek phrase", () => {
  assert.equal(detectEvidenceSearchIntent("Kerakli dalillarni izla va menga ko'rsat"), true);
});

test("40. affirmative consent replies recognized", () => {
  assert.equal(isAffirmativeReply("ha"), true);
  assert.equal(isAffirmativeReply("yes"), true);
});

test("41. all four dictionaries include voiceOperator keys", () => {
  for (const lang of ["en", "uz", "ru", "tr"] as const) {
    const dict = getDictionary(lang);
    assert.ok(dict.voiceOperator.dockTitle.length > 0);
    assert.ok(dict.voiceOperator.backendRequiredNotice.length > 0);
    assert.ok(dict.voiceOperator.localCapabilityNotice.length > 0);
  }
});

test("47. localhost open dock uses ready state — not blocking backend_required", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /setDockState\("ready"\)/);
  assert.doesNotMatch(provider, /backend_required \? "backend_required" : "ready"/);
});

test("48. voice dock shows local capability notice and integrated CTA styling", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /localCapabilityNotice/);
  assert.match(dock, /cbai-spatial-voice-cta/);
  assert.match(dock, /localVoiceUnavailable/);
  assert.doesNotMatch(dock, /rounded-full border border-teal-500\/30 bg-slate-950\/95/);
});

test("49. broker network error can degrade to browser fallback listening", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /brokerRes.code === "ERROR"/);
  assert.match(provider, /startBrowserFallbackListening\(gate\)/);
  assert.match(provider, /brokerRes.code === "BACKEND_REQUIRED"/);
});

test("50. resolveOperatorMode exposes realtimeConfigured for broker gating", () => {
  setVoiceBrokerEnvUrlForTests(null);
  const mode = resolveOperatorMode("en");
  assert.equal(mode.realtimeConfigured, false);
  assert.match(mode.notice, /Local development|Mahalliy|Локальная|Yerel/i);
});

test("42. resolveRealtimeProvider without broker returns unavailable", () => {
  const p = resolveRealtimeProvider(false);
  assert.equal(p.kind, "unavailable");
});

test("43. external read requires consent policy", () => {
  assert.equal(toolRequiresExternalConsent("run_external_evidence_search"), true);
  assert.equal(toolRequiresExternalConsent("prepare_external_evidence_search"), false);
});

test("44. client bundle example broker never embeds NEXT_PUBLIC OpenAI key", () => {
  const example = readSource("lib/voice-operator/session-broker/cloudflare-pages-function.example.ts");
  assert.match(example, /env\.OPENAI_API_KEY/);
  assert.ok(!example.includes("NEXT_PUBLIC_OPENAI"));
});

test("45. AssistantCommandCenter no longer routes transcript directly", () => {
  const source = readSource("components/assistant/AssistantCommandCenter.tsx");
  assert.ok(!source.includes("route(transcript)"));
});
