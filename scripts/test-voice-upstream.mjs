/**
 * Voice upstream diagnostic — POST broker session, report sanitized classification only.
 * Usage: npm run test:voice-upstream
 */
import {
  APP_URL,
  BROKER_SESSION_URL,
  isOpenAiKeyConfigured,
  probeHttp,
} from "./voice-dev-utils.mjs";

const APP_ORIGIN = new URL(APP_URL).origin;

function parseClassification(bodyText) {
  try {
    const parsed = JSON.parse(bodyText);
    const upstream = parsed.upstream ?? {};
    return {
      error: parsed.error ?? "unknown",
      upstreamStatus: upstream.status ?? null,
      openAiType: upstream.type ?? null,
      openAiCode: upstream.code ?? null,
      message: upstream.message ?? null,
      requestId: upstream.requestId ?? null,
      hasCredential: Boolean(parsed.clientSecret?.startsWith?.("ek_") || parsed.clientSecret?.startsWith?.("ek_")),
    };
  } catch {
    return {
      error: "unparseable_response",
      upstreamStatus: null,
      openAiType: null,
      openAiCode: null,
      message: null,
      requestId: null,
      hasCredential: false,
    };
  }
}

async function main() {
  const keyConfigured = isOpenAiKeyConfigured();
  console.log("CBAI voice upstream test");
  console.log(`  Key configured: ${keyConfigured ? "yes" : "no"}`);
  console.log(`  Broker URL:     ${BROKER_SESSION_URL}`);

  const result = await probeHttp(
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

  console.log(`  Broker HTTP:    ${result.status}`);
  const classification = parseClassification(result.bodyText);
  const credential = (() => {
    try {
      return JSON.parse(result.bodyText).clientSecret;
    } catch {
      return null;
    }
  })();
  console.log(`  Result:         ${result.status === 200 && credential?.startsWith("ek_") ? "success" : "failure"}`);
  console.log(`  Classification: ${classification.error}`);
  if (classification.upstreamStatus !== null) {
    console.log(`  Upstream HTTP:  ${classification.upstreamStatus}`);
  }
  if (classification.openAiType) console.log(`  OpenAI type:    ${classification.openAiType}`);
  if (classification.openAiCode) console.log(`  OpenAI code:    ${classification.openAiCode}`);
  if (classification.message) console.log(`  Message:        ${classification.message}`);
  if (classification.requestId) console.log(`  Request ID:     ${classification.requestId}`);

  if (result.status === 200 && credential?.startsWith("ek_")) {
    process.exit(0);
  }
  process.exit(1);
}

void main();
