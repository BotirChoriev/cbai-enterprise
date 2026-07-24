/**
 * Starts Next.js dev server + local voice session broker for Realtime development.
 * Usage: npm run dev:voice
 *
 * Port policy:
 * - If 8788 already hosts a healthy CBAI broker → reuse it (never duplicate).
 * - If 3000 already hosts a healthy Next app → reuse it.
 * - If a port is occupied by an unrelated process → exit with a precise stop command.
 * - Never kill arbitrary processes.
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
  localAppOriginsAllowed,
  probeHealthyCbaiBroker,
  probeHttp,
  readVoiceAllowedOrigins,
  waitForPort,
} from "./voice-dev-utils.mjs";

const children = [];
let ownsBroker = false;
let ownsApp = false;

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

function stopCommandForPort(port) {
  return `lsof -nP -iTCP:${port} -sTCP:LISTEN`;
}

async function printPreflight({ reusedBroker, reusedApp }) {
  const keyConfigured = isOpenAiKeyConfigured();
  const origins = localAppOriginsAllowed(readVoiceAllowedOrigins(), DEFAULT_APP_PORT);
  const brokerProbe = await probeHttp(BROKER_SESSION_URL, { method: "GET" });

  console.log("\nCBAI local voice preflight");
  console.log(`  App URL:           ${APP_URL}`);
  console.log(`  Broker URL:        ${BROKER_SESSION_URL}`);
  console.log(`  Key configured:    ${keyConfigured ? "yes" : "no"}`);
  console.log(`  Allowed origin localhost:${DEFAULT_APP_PORT}: ${origins.localhostOk ? "yes" : "no"}`);
  console.log(`  Allowed origin 127.0.0.1:${DEFAULT_APP_PORT}: ${origins.loopbackOk ? "yes" : "no"}`);
  console.log(
    `  Broker reachable:  ${brokerProbe.status === 405 || brokerProbe.status === 404 ? "yes (route up)" : brokerProbe.ok ? `yes (${brokerProbe.status})` : "no"}`,
  );
  console.log(`  Broker process:    ${reusedBroker ? "reused existing healthy CBAI broker" : ownsBroker ? "started by this command" : "not owned"}`);
  console.log(`  App process:       ${reusedApp ? "reused existing app listener" : ownsApp ? "started by this command" : "not owned"}`);

  if (!keyConfigured) {
    console.log("\n  Next action: copy .dev.vars.example → .dev.vars and set OPENAI_API_KEY (server-only).");
    console.log("  Text chat works now; mic stays disabled until key + broker path are ready.");
  } else if (!origins.localhostOk || !origins.loopbackOk) {
    console.log("\n  Next action: add both localhost and 127.0.0.1 app origins to VOICE_ALLOWED_ORIGINS in .dev.vars.");
  } else {
    console.log("\n  Next action: open Voice Operator in Safari at the app URL above.");
  }
  console.log("");
}

async function resolveBroker() {
  const busy = await waitForPort(DEFAULT_BROKER_PORT, "127.0.0.1", 800);
  if (!busy) {
    return { reuse: false };
  }

  const health = await probeHealthyCbaiBroker(DEFAULT_BROKER_PORT, "127.0.0.1");
  if (health.healthy) {
    console.log(
      `[dev:voice] Reusing healthy CBAI voice broker already listening on 127.0.0.1:${DEFAULT_BROKER_PORT} (via ${health.via}).`,
    );
    return { reuse: true };
  }

  console.error("[dev:voice] Broker port already in use by a non-CBAI process.");
  console.error(`  Port: 127.0.0.1:${DEFAULT_BROKER_PORT}`);
  console.error(`  Probe: GET/OPTIONS /api/voice/session did not match the CBAI broker contract.`);
  console.error(`  Identify the listener: ${stopCommandForPort(DEFAULT_BROKER_PORT)}`);
  console.error("  Stop that process yourself, or set VOICE_BROKER_PORT to a free port, then re-run npm run dev:voice.");
  console.error("  This command will not kill arbitrary processes.");
  process.exit(1);
}

async function resolveApp() {
  const busy = await waitForPort(DEFAULT_APP_PORT, "127.0.0.1", 800);
  if (!busy) {
    return { reuse: false };
  }

  const appProbe = await probeHttp(APP_URL, { method: "GET" });
  if (appProbe.ok && appProbe.status > 0 && appProbe.status < 500) {
    console.log(
      `[dev:voice] Reusing app already listening on port ${DEFAULT_APP_PORT} (HTTP ${appProbe.status}).`,
    );
    return { reuse: true };
  }

  console.error("[dev:voice] App port already in use by an unrelated or unhealthy process.");
  console.error(`  Port: ${DEFAULT_APP_PORT}`);
  console.error(`  Identify the listener: ${stopCommandForPort(DEFAULT_APP_PORT)}`);
  console.error("  Stop that process yourself, or set PORT to a free port, then re-run npm run dev:voice.");
  console.error("  This command will not kill arbitrary processes.");
  process.exit(1);
}

async function main() {
  if (!existsSync(".dev.vars")) {
    console.warn("[dev:voice] .dev.vars not found — copy .dev.vars.example and configure Realtime secrets.");
  }

  const brokerPlan = await resolveBroker();
  const appPlan = await resolveApp();

  ensureEnvLocalBrokerUrl(BROKER_BASE);

  if (!brokerPlan.reuse) {
    ownsBroker = true;
    run("broker", "node", ["--import", "./scripts/register-alias-loader.mjs", "scripts/local-voice-broker.mjs"], {
      VOICE_BROKER_PORT: String(DEFAULT_BROKER_PORT),
    });
    const brokerReady = await waitForPort(DEFAULT_BROKER_PORT);
    if (!brokerReady) {
      console.error("[dev:voice] Voice broker failed to start on port", DEFAULT_BROKER_PORT);
      shutdown(1);
      return;
    }
  }

  if (!appPlan.reuse) {
    ownsApp = true;
    run("next", "npx", ["next", "dev", "-p", String(DEFAULT_APP_PORT)], {
      NEXT_PUBLIC_VOICE_BROKER_URL: BROKER_BASE,
    });
    const appReady = await waitForPort(DEFAULT_APP_PORT, "127.0.0.1", 45000);
    if (!appReady) {
      console.warn("[dev:voice] App port not confirmed yet — Next may still be compiling.");
    }
  }

  await printPreflight({ reusedBroker: brokerPlan.reuse, reusedApp: appPlan.reuse });

  if (brokerPlan.reuse && appPlan.reuse) {
    console.log("[dev:voice] Both app and broker were already healthy — nothing else to start.");
    console.log("[dev:voice] Keeping this process alive so you can Ctrl+C when finished (no child kill needed).");
    // Stay alive without owning children so Ctrl+C only exits the supervisor.
    await new Promise(() => {});
  }
}

void main();
