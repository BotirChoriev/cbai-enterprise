/**
 * Cloudflare Pages Function example — deploy separately from static export.
 * Secret OPENAI_API_KEY lives only in Cloudflare environment, never in browser.
 *
 * Endpoint: POST /api/voice/session
 * Returns ephemeral Realtime client credential via OpenAI /v1/realtime/client_secrets
 */

export type CloudflareVoiceBrokerEnv = {
  readonly OPENAI_API_KEY: string;
  readonly VOICE_ALLOWED_ORIGINS: string;
  readonly VOICE_RATE_LIMIT_PER_HOUR?: string;
};

export type CloudflareVoiceBrokerRequest = {
  readonly language: string;
  readonly origin: string;
  readonly sessionHint?: string;
};

export async function handleCloudflareVoiceSessionRequest(
  request: CloudflareVoiceBrokerRequest,
  env: CloudflareVoiceBrokerEnv,
): Promise<Response> {
  const allowed = env.VOICE_ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  if (!allowed.includes(request.origin)) {
    return new Response(JSON.stringify({ error: "origin_blocked" }), { status: 403 });
  }

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "backend_required" }), { status: 503 });
  }

  const openAiResponse = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: "gpt-realtime",
        instructions: "CBAI Voice Operator session.",
        audio: {
          input: { turn_detection: { type: "server_vad" } },
        },
      },
    }),
  });

  if (!openAiResponse.ok) {
    return new Response(JSON.stringify({ error: "broker_upstream_error" }), { status: 502 });
  }

  const upstream = (await openAiResponse.json()) as {
    client_secret?: { value?: string; expires_at?: string };
    id?: string;
  };

  return new Response(
    JSON.stringify({
      clientSecret: upstream.client_secret?.value ?? "",
      expiresAt: upstream.client_secret?.expires_at ?? new Date(Date.now() + 60_000).toISOString(),
      sessionId: upstream.id ?? request.sessionHint ?? "realtime-session",
      model: "gpt-realtime",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
