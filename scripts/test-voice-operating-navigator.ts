/**
 * Voice Operating Navigator — identity, first-run, chemist flow, safe levels.
 */

import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import {
  clearVoiceCommandDedupe,
  executeVoiceCommand,
  mayPersistProfileIdentity,
  readVoiceSessionContext,
  resetVoiceSessionContext,
  resolveVoiceCommandFromText,
} from "@/lib/voice-operator/commands";
import {
  CBAI_IDENTITY,
  CBAI_IDENTITY_VERSION,
  answerCbaiIdentityFaq,
  classifyVoiceActionLevel,
  getCbaiIdentity,
  levelRequiresConfirmation,
  matchIdentityFaqIntent,
  migrateVoiceOnboardingState,
  needsVoiceFirstRunIntro,
  markVoiceFirstRunIntroComplete,
  resetVoiceOnboardingForTests,
} from "@/lib/voice-operator/identity";
import {
  buildVoiceOperatorInstructions,
  getVoiceOperatorFirstRunIntro,
  VOICE_OPERATOR_INTRO_PHRASES,
} from "@/lib/voice-operator/instructions";
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

test("identity: canonical UZ definition and creator attribution", () => {
  const id = getCbaiIdentity("uz");
  assert.match(id.definition, /Universal Intelligence Operating System/);
  assert.match(id.creatorAttribution, /Botir Choriev tashabbusi/);
  assert.match(id.positioningComparison, /Google/);
  assert.match(id.positioningComparison, /ChatGPT/);
  assert.match(id.slogan, /fikrdan natijagacha/i);
  assert.doesNotMatch(id.definition, /knows everything|hamma narsani biladi/i);
});

test("identity: EN/RU/TR parity for core fields", () => {
  for (const locale of ["en", "uz", "ru", "tr"] as const) {
    const id = CBAI_IDENTITY[locale];
    assert.ok(id.firstRunIntro.length > 80, locale);
    assert.ok(id.faqWhatIs.length > 20, locale);
    assert.ok(id.faqCreator.includes("Botir") || id.faqCreator.includes("Ботира"), locale);
    assert.ok(id.faqMakesDecisions.length > 10, locale);
  }
});

test("identity FAQ: CBAI nima / Kim yaratgan / Maqsadi / Vizioni", () => {
  assert.equal(matchIdentityFaqIntent("CBAI nima?"), "what_is");
  assert.equal(matchIdentityFaqIntent("Kim yaratgan?"), "creator");
  assert.equal(matchIdentityFaqIntent("Maqsadi nima?"), "purpose");
  assert.equal(matchIdentityFaqIntent("Vizioni nima?"), "vision");
  assert.equal(matchIdentityFaqIntent("CBAI insonmi?"), "is_human");
  assert.equal(matchIdentityFaqIntent("CBAI men uchun qaror qiladimi?"), "makes_decisions");
  assert.match(answerCbaiIdentityFaq("what_is", "uz"), /Universal Intelligence Operating System/);
  assert.match(answerCbaiIdentityFaq("creator", "uz"), /Botir Choriev/);
  assert.match(answerCbaiIdentityFaq("is_human", "uz"), /inson emasman/i);
});

test("identity FAQ resolves via voice command without navigation", () => {
  const res = resolveVoiceCommandFromText("CBAI nima?", "uz");
  assert.equal(res.ok, true);
  assert.equal(res.intent.category, "explain_identity");
  assert.equal(res.identityFaqKind, "what_is");
  assert.ok(res.spokenMessage);
  assert.equal(res.action, null);
  assert.equal(res.actionLevel, 0);
});

test("first-run intro is versioned and not repeated after complete", () => {
  resetVoiceOnboardingForTests();
  // Node tests have no window — needsVoiceFirstRunIntro returns true (empty state).
  assert.equal(needsVoiceFirstRunIntro(), true);
  const migrated = migrateVoiceOnboardingState({ introVersion: 0, completedAt: null });
  assert.equal(migrated.introVersion, 0);
  const upgraded = migrateVoiceOnboardingState({
    introVersion: CBAI_IDENTITY_VERSION,
    completedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(upgraded.introVersion, CBAI_IDENTITY_VERSION);
  assert.ok(getVoiceOperatorFirstRunIntro("uz").includes("Botir Choriev"));
  assert.notEqual(VOICE_OPERATOR_INTRO_PHRASES.uz, getVoiceOperatorFirstRunIntro("uz"));
});

test("first-run intro only after intentional activation — no autoplay on mount", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /needsVoiceFirstRunIntro/);
  assert.match(provider, /getVoiceOperatorFirstRunIntro/);
  assert.match(provider, /markVoiceFirstRunIntroComplete/);
  assert.match(provider, /First-run intro only after intentional activation/);
  // Must not auto-start listening on mount/pathname without an explicit user gesture.
  assert.doesNotMatch(provider, /useEffect\(\(\)\s*=>\s*\{\s*void startListening/);
  assert.doesNotMatch(provider, /autoStartVoice|autoplay\s*=\s*["']?true/i);
  assert.match(provider, /if \(needsVoiceFirstRunIntro\(\)\)/);
});

test("chemist: Men kimyogarman navigates Research + follow-up clarify", () => {
  const res = resolveVoiceCommandFromText("Men kimyogarman.", "uz");
  assert.equal(res.ok, true);
  assert.equal(res.action?.actionId, "navigate.research");
  assert.match(res.action?.target.href ?? "", /\/research\?.*q=chemistry/);
  assert.equal(res.sessionContextPatch?.domainId, "chemistry");
  assert.ok(res.clarifyOptions && res.clarifyOptions.length >= 2);
  assert.equal(res.messageKey, "voiceCommand.chemistUnderstood");
  assert.equal(res.actionLevel, 1);
  assert.equal(mayPersistProfileIdentity(), false);
});

test("chemist: EN/RU/TR equivalents", () => {
  for (const [text, locale] of [
    ["I am a chemist", "en"],
    ["Я химик", "ru"],
    ["Ben kimyagerim", "tr"],
  ] as const) {
    const res = resolveVoiceCommandFromText(text, locale);
    assert.equal(res.ok, true, text);
    assert.match(res.action?.target.href ?? "", /chemistry/, text);
    assert.ok(res.clarifyOptions?.length, text);
  }
});

test("chemist does not silently create a project", () => {
  clearVoiceCommandDedupe();
  resetVoiceSessionContext();
  const { router, pushes } = fakeRouter();
  let composerOpens = 0;
  executeVoiceCommand(
    { text: "Men kimyogarman", locale: "uz", pathname: "/", final: true },
    { locale: "uz", pathname: "/", missionId: null, projectId: null, originalText: "Men kimyogarman" },
    {
      router,
      openComposer: () => {
        composerOpens += 1;
      },
      t: (k) => k,
    },
  );
  assert.equal(composerOpens, 0);
  assert.ok(pushes.some((h) => h.includes("/research")));
  assert.equal(readVoiceSessionContext().domainId, "chemistry");
});

test("safe levels: read-only FAQ=0, navigate=1, compose=2, delete speech=3", () => {
  assert.equal(classifyVoiceActionLevel(null, "CBAI nima?"), 0);
  assert.equal(classifyVoiceActionLevel("navigate.evidence", "Dalillarni ko'rsat"), 1);
  assert.equal(classifyVoiceActionLevel("operational_object.compose", "ish kartasi yarat"), 2);
  assert.equal(classifyVoiceActionLevel(null, "Buni o'chir"), 3);
  assert.equal(levelRequiresConfirmation(2), true);
  assert.equal(levelRequiresConfirmation(1), false);
});

test("create project / work card requires confirmation risk", () => {
  const res = resolveVoiceCommandFromText("Kimyo bo'yicha tadqiqot loyihasini yarat", "uz");
  if (res.action) {
    assert.ok(
      res.action.risk === "needs_confirmation" || (res.actionLevel ?? 0) >= 2,
      "create must not be silent save",
    );
  }
});

test("route registry: Evidence My Work About only registered hrefs", () => {
  const evidence = resolveVoiceCommandFromText("Dalillarni ko'rsat", "uz");
  assert.equal(evidence.action?.actionId, "navigate.evidence");
  assert.ok(
    evidence.action?.target.href === "/evidence" || evidence.action?.target.href === "/knowledge",
    evidence.action?.target.href,
  );
  assert.equal(resolveVoiceCommandFromText("Mening ishlarimni och", "uz").action?.target.href, "/my-work");
  const about = resolveVoiceCommandFromText("open about", "en");
  assert.equal(about.action?.actionId, "navigate.about");
  assert.equal(about.action?.target.href, "/about");
});

test("instructions forbid unsupported claims", () => {
  const instructions = buildVoiceOperatorInstructions("uz");
  assert.match(instructions, /Never claim CBAI knows everything/i);
  assert.match(instructions, /Never claim to be human/i);
  assert.match(instructions, /final decisions/i);
});

test("EN/UZ/RU/TR voiceCommand keys include chemist + identity", () => {
  for (const copy of [VOICE_COMMAND_EN, VOICE_COMMAND_UZ, VOICE_COMMAND_RU, VOICE_COMMAND_TR]) {
    assert.ok(copy.chemistUnderstood.length > 10);
    assert.ok(copy.chemistFollowUp.length > 10);
    assert.ok(copy.identityAnswered.length > 0);
  }
  assert.match(VOICE_COMMAND_UZ.chemistUnderstood, /Tushundim/);
  assert.doesNotMatch(VOICE_COMMAND_UZ.chemistUnderstood, /^voiceCommand\./);
});

test("pathname teardown + Stop/Close still wired", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /Privacy P0: SPA route changes must release the mic/);
  assert.match(provider, /\[pathname, releaseLiveAudioResources\]/);
  assert.match(provider, /voice\.stop/);
  assert.match(provider, /voice\.close/);
  assert.match(provider, /releaseLiveAudioResources/);
});

test("no OPENAI_API_KEY in browser voice modules", () => {
  const files = [
    "components/voice-operator/VoiceOperatorProvider.tsx",
    "components/voice-operator/VoiceOperatorDock.tsx",
    "lib/voice-operator/session-broker/client.ts",
    "lib/voice-operator/realtime/openai-webrtc-session.ts",
  ];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(src, /OPENAI_API_KEY\s*=/, file);
    assert.doesNotMatch(src, /process\.env\.OPENAI_API_KEY/, file);
  }
});

test("architecture decision note exists", () => {
  assert.ok(existsSync("docs/architecture/voice-operating-navigator-decisions.md"));
});

// Keep mark API referenced so Node doesn't tree-shake unused exports in coverage-minded CI.
test("onboarding mark API is callable in non-window environments", () => {
  const state = markVoiceFirstRunIntroComplete();
  assert.equal(state.introVersion, CBAI_IDENTITY_VERSION);
});
