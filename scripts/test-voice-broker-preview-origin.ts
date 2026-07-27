/**
 * Preview broker client resolution + origin allowlist wildcards.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveVoiceBrokerUrl } from "@/lib/voice-operator/session-broker/client";
import {
  isOriginAllowed,
  parseAllowedOrigins,
} from "@/lib/voice-operator/session-broker/pages-voice-session-broker";
import { classifyBrokerHttpResponse } from "@/lib/voice-operator/session-broker/broker-response";

test("resolveVoiceBrokerUrl keeps loopback doctor broker absolute", () => {
  const url = resolveVoiceBrokerUrl("http://127.0.0.1:8788/api/voice", "http://localhost:3000");
  assert.equal(url, "http://127.0.0.1:8788/api/voice");
});

test("resolveVoiceBrokerUrl ignores a stray loopback broker URL on deployed HTTPS", () => {
  // Regression: .env.local's `NEXT_PUBLIC_VOICE_BROKER_URL=http://127.0.0.1:8788/api/voice`
  // was baked into a Preview build and forced the browser to fetch an http loopback
  // from an https page (mixed content → TypeError → "temporarily unavailable").
  const preview = "https://preview-spatial-world-intell.cbai-enterprise.pages.dev";
  assert.equal(resolveVoiceBrokerUrl("http://127.0.0.1:8788/api/voice", preview), `${preview}/api/voice`);
  assert.equal(resolveVoiceBrokerUrl("http://localhost:8788/api/voice", preview), `${preview}/api/voice`);
  assert.equal(
    resolveVoiceBrokerUrl("http://127.0.0.1:8788/api/voice", "https://checkbalanceai.global"),
    "https://checkbalanceai.global/api/voice",
  );
});

test("resolveVoiceBrokerUrl forces same-origin /api/voice on Pages Preview hosts", () => {
  const page = "https://d0fec898.cbai-enterprise.pages.dev";
  const configured = "https://preview-voice-research-integ.cbai-enterprise.pages.dev/api/voice";
  assert.equal(resolveVoiceBrokerUrl(configured, page), `${page}/api/voice`);
});

test("resolveVoiceBrokerUrl keeps same-origin configured path", () => {
  const page = "https://preview-voice-research-integ.cbai-enterprise.pages.dev";
  assert.equal(resolveVoiceBrokerUrl(`${page}/api/voice`, page), `${page}/api/voice`);
});

test("resolveVoiceBrokerUrl defaults to same-origin on deployed HTTPS when unset", () => {
  const preview = "https://preview-spatial-world-intell.cbai-enterprise.pages.dev";
  assert.equal(resolveVoiceBrokerUrl("", preview), `${preview}/api/voice`);
  assert.equal(resolveVoiceBrokerUrl(null, preview), `${preview}/api/voice`);
  assert.equal(resolveVoiceBrokerUrl(null, "https://checkbalanceai.global"), "https://checkbalanceai.global/api/voice");
});

test("resolveVoiceBrokerUrl stays unset on localhost without explicit config", () => {
  assert.equal(resolveVoiceBrokerUrl(null, "http://localhost:3000"), null);
  assert.equal(resolveVoiceBrokerUrl("", "http://127.0.0.1:3000"), null);
  assert.equal(resolveVoiceBrokerUrl(null, null), null);
});

test("isOriginAllowed supports exact and *.cbai-enterprise.pages.dev wildcard", () => {
  const allowed = parseAllowedOrigins(
    "https://preview-voice-research-integ.cbai-enterprise.pages.dev,https://*.cbai-enterprise.pages.dev",
  );
  assert.equal(isOriginAllowed("https://preview-voice-research-integ.cbai-enterprise.pages.dev", allowed), true);
  assert.equal(isOriginAllowed("https://d0fec898.cbai-enterprise.pages.dev", allowed), true);
  assert.equal(isOriginAllowed("https://evil.example", allowed), false);
  assert.equal(isOriginAllowed("https://attacker.pages.dev", allowed), false);
});

test("403 HTML Access is authentication_failed not origin_blocked", () => {
  const result = classifyBrokerHttpResponse({
    status: 403,
    contentType: "text/html",
    bodyText: "<html><title>403 Forbidden</title></html>",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "AUTHENTICATION_FAILED");
});

test("403 JSON origin_blocked remains ORIGIN_BLOCKED", () => {
  const result = classifyBrokerHttpResponse({
    status: 403,
    contentType: "application/json",
    bodyText: JSON.stringify({ error: "origin_blocked" }),
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "ORIGIN_BLOCKED");
});
