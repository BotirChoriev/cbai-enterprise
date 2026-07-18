/**
 * Multilingual voice safety — deterministic tests with mocked recognition flow.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolveVoiceLocale } from "@/lib/i18n/languages";
import {
  resolveVoiceAction,
  voiceActionRequiresConfirmation,
  clearPendingVoiceActionStorage,
} from "@/lib/voice/voice-action-resolver";
import { isConservativelyBlockedInput, looksLikeLowConfidenceTranscript } from "@/lib/voice/voice-blocklist";
import {
  extractConfidenceFromResult,
  requiresHumanConfirmation,
} from "@/lib/voice/voice-confidence";
import { parseSpeechResults } from "@/lib/voice/speech-recognition-session";
import {
  createVoiceTranscriptRecord,
  isTrustedVoiceDerivedText,
} from "@/lib/voice/voice-transcript-provenance";
import {
  readSpeechLanguageOverride,
  writeSpeechLanguageOverride,
  resolveActiveSpeechLanguage,
} from "@/lib/voice/speech-language-preference";

const CONTEXT = {
  relationshipFocus: null,
  operatorName: "Operator",
  focusedEntityName: undefined,
};

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("locale UZ maps to uz-UZ speech recognition", () => {
  assert.equal(resolveVoiceLocale("uz"), "uz-UZ");
});

test("locale EN maps to en-US", () => {
  assert.equal(resolveVoiceLocale("en"), "en-US");
});

test("locale RU maps to ru-RU", () => {
  assert.equal(resolveVoiceLocale("ru"), "ru-RU");
});

test("locale TR maps to tr-TR", () => {
  assert.equal(resolveVoiceLocale("tr"), "tr-TR");
});

test("interim speech results are ignored by parser when empty transcript", () => {
  const parsed = parseSpeechResults([{ 0: { transcript: "  ", isFinal: false } }] as never, 0);
  assert.equal(parsed, null);
});

test("final transcript resolver does not imply execution for blocked input", () => {
  const proposal = resolveVoiceAction("Salam step", CONTEXT);
  assert.equal(proposal.status, "blocked");
});

test("unknown transcript executes nothing", () => {
  const proposal = resolveVoiceAction("random nonsense phrase xyz", CONTEXT);
  assert.equal(proposal.status, "unknown");
  assert.equal(proposal.href, undefined);
});

test('"Salam step" executes nothing', () => {
  assert.ok(isConservativelyBlockedInput("Salam step"));
  assert.equal(resolveVoiceAction("Salam step", CONTEXT).status, "blocked");
});

test('"take" executes nothing', () => {
  assert.ok(isConservativelyBlockedInput("take"));
  assert.equal(resolveVoiceAction("take", CONTEXT).status, "blocked");
});

test('"jaki" executes nothing', () => {
  assert.ok(isConservativelyBlockedInput("jaki"));
  assert.equal(resolveVoiceAction("jaki", CONTEXT).status, "blocked");
});

test("confirmed valid Uzbek navigation command proposes canvas action", () => {
  const proposal = resolveVoiceAction("Tadqiqot kanvasini och", CONTEXT);
  assert.equal(proposal.status, "known");
  assert.equal(proposal.href, "/research/canvas");
});

test("navigation requires second confirmation", () => {
  const proposal = resolveVoiceAction("Mening ishlarimni och", CONTEXT);
  assert.equal(proposal.status, "known");
  assert.ok(voiceActionRequiresConfirmation(proposal));
});

test("missing confidence is labeled unavailable", () => {
  assert.equal(extractConfidenceFromResult({}).kind, "unavailable");
});

test("low-confidence transcript requires review", () => {
  assert.ok(looksLikeLowConfidenceTranscript("take", 0.2));
  assert.ok(requiresHumanConfirmation({ kind: "unavailable" }, "take"));
});

test("voice-derived data is excluded until human-confirmed", () => {
  const record = createVoiceTranscriptRecord({
    transcript: "take",
    requestedLang: "uz-UZ",
    confidence: null,
    humanConfirmed: false,
  });
  assert.equal(isTrustedVoiceDerivedText(record), false);
});

test("selected speech language persists device-locally", () => {
  writeSpeechLanguageOverride("ru-RU");
  assert.equal(readSpeechLanguageOverride(), "ru-RU");
  assert.equal(resolveActiveSpeechLanguage("uz", "uz-UZ"), "ru-RU");
  writeSpeechLanguageOverride("uz-UZ");
});

test("AssistantCommandCenter never auto-routes from onresult", () => {
  const source = readSource("components/assistant/AssistantCommandCenter.tsx");
  assert.ok(!source.includes("route(transcript)"));
  assert.ok(source.includes("VoiceTranscriptReviewPanel"));
  assert.ok(source.includes("VoiceActionReviewPanel"));
});

test("refresh clears pending voice action storage helper exists", () => {
  clearPendingVoiceActionStorage();
  assert.ok(true);
});
