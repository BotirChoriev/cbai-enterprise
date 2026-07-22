/**
 * Starts Next.js dev server + local voice session broker for Realtime development.
 * Usage: npm run dev:voice
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import {
  APP_URL,
  BROKER_BASE,
  BROKER_SESSION_URL,
  DEFAULT_APP_PORT,
  DEFAULT_BROKER_PORT,
  ensureEnvLocalBrokerUrl,
  isOpenAiKeyConfigured,
  probeHttp,
  readVoiceAllowedOrigins,
  waitForPort,
} from "./voice-dev-utils.mjs";

const children = [];

function run(label, command, args, env = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
    shell: process.platform === "win32",
  });
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`[dev:voice] ${label} exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });
  children.push(child);
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 250);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function printPreflight() {
  const keyConfigured = isOpenAiKeyConfigured();
  const allowed = readVoiceAllowedOrigins();
  const appOriginOk = allowed.includes(`http://localhost:${DEFAULT_APP_PORT}`);
  const appOrigin127Ok = allowed.includes(`http://127.0.0.1:${DEFAULT_APP_PORT}`);
  const brokerProbe = await probeHttp(BROKER_SESSION_URL, { method: "GET" });

  console.log("\nCBAI local voice preflight");
  console.log(`  App URL:           ${APP_URL}`);
  console.log(`  Broker URL:        ${BROKER_SESSION_URL}`);
  console.log(`  Key configured:    ${keyConfigured ? "yes" : "no"}`);
  console.log(`  Allowed origin localhost:${DEFAULT_APP_PORT}: ${appOriginOk ? "yes" : "no"}`);
  console.log(`  Allowed origin 127.0.0.1:${DEFAULT_APP_PORT}: ${appOrigin127Ok ? "yes" : "no"}`);
  console.log(`  Broker reachable:  ${brokerProbe.status === 405 || brokerProbe.status === 404 ? "yes (route up)" : brokerProbe.ok ? `yes (${brokerProbe.status})` : "no"}`);

  if (!keyConfigured) {
    console.log("\n  Next action: copy .dev.vars.example → .dev.vars and set OPENAI_API_KEY (server-only).");
    console.log("  Text chat works now; mic stays disabled until key + broker path are ready.");
  } else if (!appOriginOk || !appOrigin127Ok) {
    console.log("\n  Next action: add both localhost and 127.0.0.1 app origins to VOICE_ALLOWED_ORIGINS in .dev.vars.");
  } else {
    console.log("\n  Next action: open Voice Operator in Safari at the app URL above.");
  }
  console.log("");
}

async function main() {
  if (!existsSync(".dev.vars")) {
    console.warn("[dev:voice] .dev.vars not found — copy .dev.vars.example and configure Realtime secrets.");
  }

  const appPortBusy = await waitForPort(DEFAULT_APP_PORT, "127.0.0.1", 800);
  const brokerPortBusy = await waitForPort(DEFAULT_BROKER_PORT, "127.0.0.1", 800);
  if (appPortBusy || brokerPortBusy) {
    console.error("[dev:voice] Port already in use:");
    if (appPortBusy) console.error(`  - App port ${DEFAULT_APP_PORT} is listening. Stop the existing Next.js process or choose another PORT.`);
    if (brokerPortBusy) console.error(`  - Broker port ${DEFAULT_BROKER_PORT} is listening. Stop the existing voice broker or set VOICE_BROKER_PORT.`);
    console.error("  Tip: lsof -iTCP -sTCP:LISTEN -P | grep -E ':(3000|8788)'");
    process.exit(1);
  }

  ensureEnvLocalBrokerUrl(BROKER_BASE);

  run("broker", "node", ["--import", "./scripts/register-alias-loader.mjs", "scripts/local-voice-broker.mjs"], {
    VOICE_BROKER_PORT: String(DEFAULT_BROKER_PORT),
  });

  const brokerReady = await waitForPort(DEFAULT_BROKER_PORT);
  if (!brokerReady) {
    console.error("[dev:voice] Voice broker failed to start on port", DEFAULT_BROKER_PORT);
    shutdown(1);
    return;
  }

  run("next", "npx", ["next", "dev", "-p", String(DEFAULT_APP_PORT)], {
    NEXT_PUBLIC_VOICE_BROKER_URL: BROKER_BASE,
  });

  const appReady = await waitForPort(DEFAULT_APP_PORT, "127.0.0.1", 45000);
  if (!appReady) {
    console.warn("[dev:voice] App port not confirmed yet — Next may still be compiling.");
  }

  await printPreflight();
}

void main();
