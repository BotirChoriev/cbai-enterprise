/**
 * External Preview locale + voice closure tests — Phase 7 gates.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  browserLocaleHint,
  canonicalizeUiLocale,
  isCanonicalUiLocale,
} from "@/lib/i18n/canonicalize-locale";
import { getDictionary } from "@/lib/i18n/translate";
import {
  isOriginAllowed,
  parseAllowedOrigins,
} from "@/lib/voice-operator/session-broker/pages-voice-session-broker";
import {
  resolveVoiceBrokerUrl,
  evaluateVoiceBrokerStatus,
} from "@/lib/voice-operator/session-broker/client";
import { classifyBrokerHttpResponse } from "@/lib/voice-operator/session-broker/broker-response";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("canonicalize maps uz-UZ / ru-RU / en-US / tr-TR idempotently", () => {
  assert.equal(canonicalizeUiLocale("uz-UZ"), "uz");
  assert.equal(canonicalizeUiLocale("uz_uz"), "uz");
  assert.equal(canonicalizeUiLocale("ru-RU"), "ru");
  assert.equal(canonicalizeUiLocale("en-US"), "en");
  assert.equal(canonicalizeUiLocale("tr-TR"), "tr");
  assert.equal(canonicalizeUiLocale(canonicalizeUiLocale("uz-UZ")), "uz");
  assert.equal(canonicalizeUiLocale("xx-YY"), "en");
  assert.ok(isCanonicalUiLocale("uz"));
  assert.equal(isCanonicalUiLocale("uz-UZ"), false);
});

test("UZ dictionary is used for uz-UZ input — never silent RU fallback", () => {
  const viaTag = getDictionary("uz-UZ");
  const viaUz = getDictionary("uz");
  const viaRu = getDictionary("ru");
  assert.equal(viaTag.voiceOperator.dockTitle, viaUz.voiceOperator.dockTitle);
  assert.notEqual(viaTag.voiceOperator.dockTitle, viaRu.voiceOperator.dockTitle);
});

test("browser locale hint is available but does not invent unsupported packs", () => {
  assert.equal(browserLocaleHint(["uz-UZ", "en-US"]), "uz");
  assert.equal(browserLocaleHint(["xx-YY"]), null);
});

test("RouteChromeFallback reads namespaced profile key — not bare legacy key alone", () => {
  const source = readSource("components/system/RouteChromeFallback.tsx");
  assert.match(source, /resolveStorageKey/);
  assert.match(source, /canonicalizeUiLocale/);
  assert.doesNotMatch(
    source,
    /localStorage\.getItem\("cbai-assistant-profile"\)\s*;/,
  );
});

test("LanguageSelector persists canonical preferredLanguage", () => {
  const source = readSource("components/i18n/LanguageSelector.tsx");
  assert.match(source, /canonicalizeUiLocale\(code\)/);
});

test("AssistantProfileProvider syncs locale across tabs via storage events", () => {
  const source = readSource("components/platform/context/AssistantProfileProvider.tsx");
  assert.match(source, /addEventListener\("storage"/);
  assert.match(source, /resolveStorageKey\("cbai-assistant-profile"\)/);
  assert.match(source, /canonicalizeUiLocale/);
});

test("parseAllowedOrigins trims, strips trailing slashes, rejects paths, keeps wildcards", () => {
  const parsed = parseAllowedOrigins(
    " https://preview-spatial-world-intell.cbai-enterprise.pages.dev/ , https://*.cbai-enterprise.pages.dev, https://evil.example/path, not-a-url ",
  );
  assert.deepEqual(parsed, [
    "https://preview-spatial-world-intell.cbai-enterprise.pages.dev",
    "https://*.cbai-enterprise.pages.dev",
  ]);
  assert.equal(
    isOriginAllowed("https://preview-spatial-world-intell.cbai-enterprise.pages.dev", parsed),
    true,
  );
  assert.equal(isOriginAllowed("https://hash.cbai-enterprise.pages.dev", parsed), true);
  assert.equal(isOriginAllowed("https://evil.example", parsed), false);
});

test("Pages Preview resolves same-origin broker even when loopback env is baked in", () => {
  const preview = "https://preview-spatial-world-intell.cbai-enterprise.pages.dev";
  const url = resolveVoiceBrokerUrl("http://127.0.0.1:8788/api/voice", preview);
  assert.equal(url, `${preview}/api/voice`);
  const status = evaluateVoiceBrokerStatus(preview);
  assert.equal(status.kind, "available");
});

test("Cloudflare Access HTML / redirect classifies as AUTHENTICATION_FAILED not mic denied", () => {
  const redirect = classifyBrokerHttpResponse({
    status: 302,
    contentType: "text/html",
    bodyText: "<html>login</html>",
  });
  assert.equal(redirect.ok, false);
  if (!redirect.ok) assert.equal(redirect.code, "AUTHENTICATION_FAILED");

  const html403 = classifyBrokerHttpResponse({
    status: 403,
    contentType: "text/html",
    bodyText: "<!doctype html><html>Access</html>",
  });
  assert.equal(html403.ok, false);
  if (!html403.ok) assert.equal(html403.code, "AUTHENTICATION_FAILED");
});

test("invalid_api_key is not mapped to microphone permission denied", () => {
  const res = classifyBrokerHttpResponse({
    status: 401,
    contentType: "application/json",
    bodyText: JSON.stringify({ error: "invalid_api_key" }),
  });
  // 401 is AUTHENTICATION_FAILED at HTTP layer; body-level invalid_api_key on other statuses:
  const body = classifyBrokerHttpResponse({
    status: 500,
    contentType: "application/json",
    bodyText: JSON.stringify({ error: "invalid_api_key" }),
  });
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.code, "AUTHENTICATION_FAILED");
  assert.equal(body.ok, false);
  if (!body.ok) assert.equal(body.code, "INVALID_API_KEY");
});

test("origin_blocked classifies correctly", () => {
  const res = classifyBrokerHttpResponse({
    status: 403,
    contentType: "application/json",
    bodyText: JSON.stringify({ error: "origin_blocked" }),
  });
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.code, "ORIGIN_BLOCKED");
});

test("external Preview diagnostics never lead with npm/.dev.vars for non-loopback hosts", () => {
  const diagnostics = readSource("components/voice-operator/VoiceOperatorDeveloperDiagnostics.tsx");
  assert.match(diagnostics, /showLocalSetupHint/);
  assert.match(diagnostics, /isLoopbackOrigin/);
  assert.match(diagnostics, /localCapabilityUserNotice/);
  // Setup hint still exists for local loopback only.
  assert.match(diagnostics, /localVoiceSetupHint/);
});

test("OPENAI_API_KEY stays out of client voice modules", () => {
  const client = readSource("lib/voice-operator/session-broker/client.ts");
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.doesNotMatch(client, /OPENAI_API_KEY\s*=/);
  assert.doesNotMatch(provider, /OPENAI_API_KEY/);
  assert.doesNotMatch(client, /sk-[A-Za-z0-9]{20,}/);
});

test("sanitizeProfile canonicalizes preferredLanguage on load", () => {
  const storage = readSource("lib/assistant/assistant-storage.ts");
  assert.match(storage, /canonicalizeUiLocale/);
  assert.match(storage, /preferredLanguage: canonicalizeUiLocale/);
});
