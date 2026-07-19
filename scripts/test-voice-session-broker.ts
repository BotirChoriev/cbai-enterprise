/**
 * Cloudflare Pages voice session broker — deterministic unit tests (no live OpenAI credentials).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createOpenAiClientSecret,
  handleVoiceSessionBrokerRequest,
  OPENAI_REALTIME_CLIENT_SECRETS_URL,
  parseAllowedOrigins,
  resolveRequestOrigin,
} from "@/lib/voice-operator/session-broker/pages-voice-session-broker";

const ALLOWED = "https://cbai.example,http://localhost:3000";
const API_KEY = "sk-test-server-key-not-real";

function env(overrides: Partial<{ OPENAI_API_KEY: string; VOICE_ALLOWED_ORIGINS: string }> = {}) {
  return {
    OPENAI_API_KEY: API_KEY,
    VOICE_ALLOWED_ORIGINS: ALLOWED,
    ...overrides,
  };
}

function postRequest(
  body: unknown,
  origin = "http://localhost:3000",
  init?: { contentType?: string; rawBody?: string },
): Request {
  const payload = init?.rawBody ?? JSON.stringify(body);
  return new Request("https://cbai.example/api/voice/session", {
    method: "POST",
    headers: {
      "Content-Type": init?.contentType ?? "application/json",
      Origin: origin,
    },
    body: payload,
  });
}

function optionsRequest(origin = "http://localhost:3000"): Request {
  return new Request("https://cbai.example/api/voice/session", {
    method: "OPTIONS",
    headers: { Origin: origin },
  });
}

function upstreamSuccess() {
  return async (input: RequestInfo | URL) => {
    assert.equal(String(input), OPENAI_REALTIME_CLIENT_SECRETS_URL);
    return new Response(
      JSON.stringify({
        value: "ek_test_ephemeral_credential",
        expires_at: 1_700_000_000,
        session: {
          id: "sess_test_123",
          model: "gpt-realtime",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
}

function upstreamError(status: number, message = "invalid_request_error") {
  return async () =>
    new Response(JSON.stringify({ error: { message } }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
}

test("parseAllowedOrigins trims and drops empty entries", () => {
  assert.deepEqual(parseAllowedOrigins(" https://a.test , ,http://b.test "), [
    "https://a.test",
    "http://b.test",
  ]);
});

test("resolveRequestOrigin rejects mismatched header and body origins", () => {
  const req = new Request("https://x", {
    headers: { Origin: "http://localhost:3000" },
  });
  assert.equal(resolveRequestOrigin(req, "https://evil.example"), null);
});

test("GET returns 405", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    new Request("https://cbai.example/api/voice/session", {
      method: "GET",
      headers: { Origin: "http://localhost:3000" },
    }),
    env(),
  );
  assert.equal(res.status, 405);
  assert.equal((await res.json()).error, "method_not_allowed");
  assert.match(res.headers.get("Cache-Control") ?? "", /no-store/);
});

test("OPTIONS for allowed origin returns 204 with CORS", async () => {
  const res = await handleVoiceSessionBrokerRequest(optionsRequest(), env());
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "http://localhost:3000");
  assert.match(res.headers.get("Access-Control-Allow-Methods") ?? "", /POST/);
  assert.match(res.headers.get("Cache-Control") ?? "", /no-store/);
});

test("OPTIONS for blocked origin returns 403", async () => {
  const res = await handleVoiceSessionBrokerRequest(optionsRequest("https://evil.example"), env());
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), null);
});

test("missing VOICE_ALLOWED_ORIGINS returns 503", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    postRequest({ language: "uz", origin: "http://localhost:3000" }),
    env({ VOICE_ALLOWED_ORIGINS: "" }),
  );
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error, "backend_required");
});

test("missing OPENAI_API_KEY returns 503", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    postRequest({ language: "uz", origin: "http://localhost:3000" }),
    env({ OPENAI_API_KEY: "" }),
  );
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error, "backend_required");
});

test("blocked origin on POST returns 403", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    postRequest({ language: "uz", origin: "https://evil.example" }, "https://evil.example"),
    env(),
  );
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, "origin_blocked");
});

test("invalid JSON returns 400", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    postRequest({}, "http://localhost:3000", { rawBody: "{not-json" }),
    env(),
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_json");
});

test("oversized body returns 400", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    postRequest({}, "http://localhost:3000", { rawBody: "x".repeat(5000) }),
    env(),
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "payload_too_large");
});

test("successful POST returns ephemeral credential metadata only", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    postRequest({ language: "uz", origin: "http://localhost:3000", sessionHint: "hint-1" }),
    env(),
    { fetchFn: upstreamSuccess() as typeof fetch },
  );
  assert.equal(res.status, 200);
  const body = (await res.json()) as {
    clientSecret: string;
    expiresAt: string;
    sessionId: string;
    model: string;
  };
  assert.equal(body.clientSecret, "ek_test_ephemeral_credential");
  assert.ok(body.clientSecret.startsWith("ek_"));
  assert.equal(body.sessionId, "sess_test_123");
  assert.equal(body.model, "gpt-realtime");
  assert.ok(body.expiresAt.includes("T"));
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "http://localhost:3000");
  assert.match(res.headers.get("Cache-Control") ?? "", /no-store/);
});

test("upstream OpenAI error returns safe generic 502", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    postRequest({ language: "en", origin: "http://localhost:3000" }),
    env(),
    { fetchFn: upstreamError(401, `Incorrect API key provided: ${API_KEY}`) as typeof fetch },
  );
  assert.equal(res.status, 502);
  const text = await res.text();
  assert.equal(JSON.parse(text).error, "broker_upstream_error");
  assert.ok(!text.includes(API_KEY));
  assert.ok(!text.includes("sk-"));
});

test("secret-leak regression: success and error bodies never include server API key", async () => {
  const success = await handleVoiceSessionBrokerRequest(
    postRequest({ language: "uz", origin: "http://localhost:3000" }),
    env(),
    { fetchFn: upstreamSuccess() as typeof fetch },
  );
  const successText = await success.text();
  assert.ok(!successText.includes(API_KEY));

  const failure = await handleVoiceSessionBrokerRequest(
    postRequest({ language: "uz", origin: "http://localhost:3000" }),
    env(),
    {
      fetchFn: upstreamError(500, `Bearer ${API_KEY} leaked`) as typeof fetch,
    },
  );
  const failureText = await failure.text();
  assert.ok(!failureText.includes(API_KEY));
  assert.ok(!failureText.includes("sk-test-server-key"));
});

test("createOpenAiClientSecret uses official client_secrets endpoint shape", async () => {
  let seenBody = "";
  const fetchFn = async (input: RequestInfo | URL, init?: RequestInit) => {
    assert.equal(String(input), OPENAI_REALTIME_CLIENT_SECRETS_URL);
    seenBody = String(init?.body);
    return new Response(JSON.stringify({ value: "ek_x", expires_at: 1, session: { id: "s" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await createOpenAiClientSecret(API_KEY, "uz", fetchFn as typeof fetch);
  assert.equal(result.ok, true);
  const parsed = JSON.parse(seenBody) as {
    expires_after: { anchor: string; seconds: number };
    session: { type: string; model: string };
  };
  assert.equal(parsed.expires_after.anchor, "created_at");
  assert.equal(parsed.session.type, "realtime");
  assert.equal(parsed.session.model, "gpt-realtime");
  assert.match(seenBody, /Men CBAI Ovoz Operatoriman/);
  assert.match(seenBody, /Do NOT repeat this full introduction/i);
});

test("invalid upstream credential shape returns 502 without fallback secret", async () => {
  const res = await handleVoiceSessionBrokerRequest(
    postRequest({ language: "uz", origin: "http://localhost:3000" }),
    env(),
    {
      fetchFn: (async () =>
        new Response(JSON.stringify({ value: "sk-not-allowed", expires_at: 123 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })) as typeof fetch,
    },
  );
  assert.equal(res.status, 502);
  const body = await res.json();
  assert.equal(body.error, "broker_upstream_error");
  assert.equal(body.clientSecret, undefined);
});
