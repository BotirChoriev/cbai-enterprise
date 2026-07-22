/**
 * Local Voice Operator session broker — development only.
 * Serves POST /api/voice/session and POST /session (broker URL base + /session).
 * Reads secrets from .dev.vars; never exposes OPENAI_API_KEY to the Next client bundle.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { handleVoiceSessionBrokerRequest } from "../lib/voice-operator/session-broker/pages-voice-session-broker.ts";

const PORT = Number(process.env.VOICE_BROKER_PORT || 8788);

function loadDevVars() {
  const path = ".dev.vars";
  if (!existsSync(path)) return {};
  /** @type {Record<string, string>} */
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const devEnv = loadDevVars();

function brokerEnv() {
  return {
    OPENAI_API_KEY: devEnv.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    VOICE_ALLOWED_ORIGINS:
      devEnv.VOICE_ALLOWED_ORIGINS ||
      process.env.VOICE_ALLOWED_ORIGINS ||
      "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8788,http://127.0.0.1:8788",
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function toHeaders(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value[0] : value);
  }
  return headers;
}

async function handleHttp(req, res) {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  const isSession =
    url.pathname === "/api/voice/session" ||
    url.pathname === "/session" ||
    url.pathname.endsWith("/api/voice/session");

  if (!isSession) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Voice broker: POST /api/voice/session");
    return;
  }

  const body = req.method === "POST" || req.method === "PUT" ? await readBody(req) : undefined;
  const request = new Request(`http://127.0.0.1${url.pathname}`, {
    method: req.method ?? "GET",
    headers: toHeaders(req),
    body,
  });

  const response = await handleVoiceSessionBrokerRequest(request, brokerEnv(), {
    exposeUpstreamDiagnostics: true,
  });
  const payload = Buffer.from(await response.arrayBuffer());
  if (response.status === 502) {
    try {
      const parsed = JSON.parse(payload.toString("utf8"));
      const upstream = parsed.upstream;
      console.error(
        `[voice-broker] upstream ${parsed.error ?? "broker_upstream_error"}` +
          (upstream?.status ? ` (HTTP ${upstream.status})` : "") +
          (upstream?.code ? ` code=${upstream.code}` : "") +
          (upstream?.requestId ? ` requestId=${upstream.requestId}` : ""),
      );
    } catch {
      console.error("[voice-broker] upstream broker_upstream_error (502)");
    }
  }
  /** @type {Record<string, string>} */
  const outHeaders = {};
  response.headers.forEach((value, key) => {
    outHeaders[key] = value;
  });
  res.writeHead(response.status, outHeaders);
  res.end(payload);
}

const server = createServer((req, res) => {
  void handleHttp(req, res).catch((error) => {
    console.error("[voice-broker] request failed:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "broker_internal_error" }));
  });
});

server.listen(PORT, "127.0.0.1", () => {
  const env = brokerEnv();
  const keyConfigured = Boolean(env.OPENAI_API_KEY?.trim());
  const origins = env.VOICE_ALLOWED_ORIGINS ?? "";
  console.log(`[voice-broker] listening on http://127.0.0.1:${PORT}/api/voice/session`);
  console.log(`[voice-broker] OPENAI_API_KEY: ${keyConfigured ? "configured" : "missing (.dev.vars)"}`);
  console.log(`[voice-broker] allowed origins: ${origins}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
