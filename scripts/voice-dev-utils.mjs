/**
 * Shared local voice development utilities — no secrets logged.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createConnection } from "node:net";

export const DEFAULT_APP_PORT = Number(process.env.PORT || 3000);
export const DEFAULT_BROKER_PORT = Number(process.env.VOICE_BROKER_PORT || 8788);
export const BROKER_BASE = `http://127.0.0.1:${DEFAULT_BROKER_PORT}/api/voice`;
export const BROKER_SESSION_URL = `${BROKER_BASE}/session`;
export const APP_URL = `http://localhost:${DEFAULT_APP_PORT}`;
export const ENV_LOCAL = ".env.local";
export const ENV_VOICE_MARKER = "# CBAI voice dev (managed by npm run dev:voice)";

export function devVarsExists() {
  return existsSync(".dev.vars");
}

export function isOpenAiKeyConfigured() {
  if (!devVarsExists()) return false;
  const raw = readFileSync(".dev.vars", "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("OPENAI_API_KEY=")) {
      const value = trimmed.slice("OPENAI_API_KEY=".length).trim();
      return value.length > 0;
    }
  }
  return false;
}

export function readVoiceAllowedOrigins() {
  if (!devVarsExists()) {
    return "http://localhost:3000,http://127.0.0.1:3000";
  }
  const raw = readFileSync(".dev.vars", "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("VOICE_ALLOWED_ORIGINS=")) {
      return trimmed.slice("VOICE_ALLOWED_ORIGINS=".length).trim();
    }
  }
  return "http://localhost:3000,http://127.0.0.1:3000";
}

export function readEnvLocalBrokerUrl() {
  if (!existsSync(ENV_LOCAL)) return null;
  const raw = readFileSync(ENV_LOCAL, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_VOICE_BROKER_URL=")) {
      return trimmed.slice("NEXT_PUBLIC_VOICE_BROKER_URL=".length).trim();
    }
  }
  return null;
}

export function ensureEnvLocalBrokerUrl(brokerUrl = BROKER_BASE) {
  const line = `NEXT_PUBLIC_VOICE_BROKER_URL=${brokerUrl}`;
  let content = existsSync(ENV_LOCAL) ? readFileSync(ENV_LOCAL, "utf8") : "";
  if (content.includes("NEXT_PUBLIC_VOICE_BROKER_URL=")) {
    content = content.replace(/^NEXT_PUBLIC_VOICE_BROKER_URL=.*$/gm, line);
  } else {
    if (content && !content.endsWith("\n")) content += "\n";
    if (!content.includes(ENV_VOICE_MARKER)) {
      content += `${ENV_VOICE_MARKER}\n`;
    }
    content += `${line}\n`;
  }
  writeFileSync(ENV_LOCAL, content);
}

export async function waitForPort(port, host = "127.0.0.1", timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const socket = createConnection({ port, host }, () => {
          socket.end();
          resolve(true);
        });
        socket.on("error", reject);
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return false;
}

export async function probeHttp(url, init = {}, options = {}) {
  const maxBodyBytes = options.maxBodyBytes ?? 500;
  try {
    const response = await fetch(url, { ...init, redirect: "manual" });
    const contentType = response.headers.get("Content-Type") ?? "";
    const bodyText = (await response.text()).slice(0, maxBodyBytes);
    return { ok: true, status: response.status, contentType, bodyText };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      contentType: "",
      bodyText: error instanceof Error ? error.message : "fetch_failed",
    };
  }
}

export function classifyClientVoiceMode(brokerUrl) {
  return brokerUrl?.trim() ? "realtime_broker_configured" : "browser_fallback_backend_required";
}

export function originAllowed(appOrigin, allowedRaw) {
  const allowed = allowedRaw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return allowed.includes(appOrigin);
}

/** Maps broker upstream classification to one actionable next step — no secrets. */
export function upstreamNextAction(classification) {
  switch (classification) {
    case "invalid_api_key":
      return "Set a valid OPENAI_API_KEY in .dev.vars (full project key from https://platform.openai.com/api-keys), then restart npm run dev:voice.";
    case "insufficient_quota":
      return "Add billing credits or raise project usage limits in your OpenAI account, then retry.";
    case "project_or_model_access_denied":
      return "Enable Realtime model access for your OpenAI project/org, then retry.";
    case "rate_limited":
      return "Wait briefly and retry; reduce concurrent Realtime session creation.";
    case "invalid_realtime_request":
      return "Check broker Realtime payload against the current OpenAI GA contract and retry.";
    case "upstream_unreachable":
      return "Verify network access to https://api.openai.com and restart the local voice broker.";
    case "upstream_service_error":
      return "Retry later; if persistent, check OpenAI status and project health.";
    case "invalid_upstream_credential_shape":
      return "Broker received an unexpected credential shape from OpenAI — update response parsing or report upstream drift.";
    default:
      return "Inspect broker upstream diagnostics with npm run test:voice-upstream, then fix the reported classification.";
  }
}
