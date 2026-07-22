/**
 * Voice development diagnostics — never prints secrets.
 * Usage: npm run doctor:voice
 */
import {
  APP_URL,
  BROKER_SESSION_URL,
  classifyClientVoiceMode,
  devVarsExists,
  isOpenAiKeyConfigured,
  originAllowed,
  probeHttp,
  readEnvLocalBrokerUrl,
  readVoiceAllowedOrigins,
  upstreamNextAction,
  waitForPort,
} from "./voice-dev-utils.mjs";

const APP_ORIGIN = new URL(APP_URL).origin;
const failures = [];

function fail(reason) {
  failures.push(reason);
}

function parseBrokerPostBody(bodyText) {
  try {
    return JSON.parse(bodyText);
  } catch {
    return null;
  }
}

async function main() {
  const keyConfigured = isOpenAiKeyConfigured();
  const envBroker = readEnvLocalBrokerUrl();
  const processBroker = process.env.NEXT_PUBLIC_VOICE_BROKER_URL?.trim() ?? null;
  const resolvedBroker = processBroker || envBroker;
  const clientMode = classifyClientVoiceMode(resolvedBroker);
  const allowedRaw = readVoiceAllowedOrigins();

  console.log("CBAI voice doctor");
  console.log(`  .dev.vars present:        ${devVarsExists() ? "yes" : "no"}`);
  console.log(`  Local key configured:     ${keyConfigured ? "yes" : "no"}`);
  console.log(`  App origin:               ${APP_ORIGIN}`);
  console.log(`  Broker origin (resolved): ${resolvedBroker ?? "(not configured)"}`);
  console.log(`  Client mode:              ${clientMode}`);
  console.log(`  Allowed origins:          ${allowedRaw || "(empty)"}`);
  console.log(`  Origin match (app):       ${originAllowed(APP_ORIGIN, allowedRaw) ? "yes" : "no"}`);

  const appProbe = await probeHttp(APP_URL);
  console.log(`  App HTTP:                 ${appProbe.ok ? appProbe.status : "unreachable"}`);

  let postClassification = null;
  let postUpstream = null;

  if (!resolvedBroker) {
    fail("NEXT_PUBLIC_VOICE_BROKER_URL is not configured — run npm run dev:voice or set .env.local.");
  }

  if (resolvedBroker) {
    const brokerProbe = await probeHttp(BROKER_SESSION_URL, { method: "GET" });
    console.log(`  Broker GET /session:      ${brokerProbe.ok ? brokerProbe.status : "unreachable"}`);
    console.log(`  Broker content-type:    ${brokerProbe.contentType || "(none)"}`);
    if (!brokerProbe.ok || (brokerProbe.status !== 404 && brokerProbe.status !== 405)) {
      fail(`Broker route not healthy (status ${brokerProbe.status}). Start npm run dev:voice.`);
    }

    const postProbe = await probeHttp(
      BROKER_SESSION_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: APP_ORIGIN,
          Accept: "application/json",
        },
        body: JSON.stringify({ language: "en", origin: APP_ORIGIN }),
      },
      { maxBodyBytes: 4096 },
    );
    console.log(`  Broker POST /session:     ${postProbe.status}`);

    const postBody = parseBrokerPostBody(postProbe.bodyText);
    postClassification = postBody?.error ?? null;
    postUpstream = postBody?.upstream ?? null;

    if (postProbe.status === 403) {
      fail("Origin blocked — add both http://localhost:3000 and http://127.0.0.1:3000 to VOICE_ALLOWED_ORIGINS.");
    }
    if (!keyConfigured && postProbe.status !== 503) {
      fail("Expected 503 backend_required when key is absent.");
    }
    if (keyConfigured && postProbe.status === 503) {
      fail("Key is configured but broker returned backend_required — check .dev.vars loading.");
    }
    if (postProbe.status >= 300 && postProbe.status < 400) {
      fail("Broker redirected POST — check URL and proxy configuration.");
    }
    if (postProbe.status === 502) {
      const classification = postClassification ?? "broker_upstream_error";
      console.log(`  Upstream classification:  ${classification}`);
      if (postUpstream?.status) console.log(`  Upstream HTTP:            ${postUpstream.status}`);
      if (postUpstream?.type) console.log(`  OpenAI type:              ${postUpstream.type}`);
      if (postUpstream?.code) console.log(`  OpenAI code:              ${postUpstream.code}`);
      if (postUpstream?.message) console.log(`  Sanitized message:        ${postUpstream.message}`);
      if (postUpstream?.requestId) console.log(`  Request ID:               ${postUpstream.requestId}`);
      console.log(`  Next action:              ${upstreamNextAction(classification)}`);
      fail(`Broker upstream failure (${classification}).`);
    }
    if (keyConfigured && postProbe.status !== 200) {
      fail(`Expected 200 from broker POST when key is configured; got ${postProbe.status}.`);
    }
    if (postProbe.status === 200) {
      const credentialOk = Boolean(postBody?.clientSecret?.startsWith?.("ek_"));
      console.log(`  Ephemeral credential:     ${credentialOk ? "yes" : "no"}`);
      if (!credentialOk) {
        fail("Broker returned 200 without a valid ephemeral credential.");
      }
    }
  }

  if (!originAllowed(APP_ORIGIN, allowedRaw)) {
    fail(`App origin ${APP_ORIGIN} is not listed in VOICE_ALLOWED_ORIGINS.`);
  }

  const brokerPort = resolvedBroker ? Number(new URL(resolvedBroker).port || 8788) : 8788;
  const brokerListening = await waitForPort(brokerPort, "127.0.0.1", 1500);
  console.log(`  Broker port listening:    ${brokerListening ? "yes" : "no"}`);
  if (resolvedBroker && !brokerListening) {
    fail("Broker port is not listening — run npm run dev:voice.");
  }

  const secureContextEligible =
    APP_ORIGIN.startsWith("https://") || APP_ORIGIN.includes("localhost") || APP_ORIGIN.includes("127.0.0.1");
  console.log(`  Secure context eligible:  ${secureContextEligible ? "yes" : "no"}`);
  console.log(
    `  WebRTC APIs expected:     ${typeof RTCPeerConnection !== "undefined" ? "available in Node" : "browser-only"}`,
  );
  console.log(
    `  Mic expected:             ${keyConfigured && resolvedBroker && originAllowed(APP_ORIGIN, allowedRaw) ? "enabled after broker credential" : "disabled (honest)"}`,
  );

  if (failures.length) {
    console.error("\nVoice doctor: FAIL");
    for (const reason of failures) {
      console.error(`  - ${reason}`);
    }
    process.exit(1);
  }

  console.log("\nVoice doctor: PASS");
  if (!keyConfigured) {
    console.log("  Audible Realtime cannot be verified without a real server-side OPENAI_API_KEY.");
  }
}

void main();
