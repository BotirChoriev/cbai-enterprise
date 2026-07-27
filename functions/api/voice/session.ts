/**
 * Cloudflare Pages Function — POST /api/voice/session
 * Ephemeral OpenAI Realtime credentials only; long-lived API keys stay in encrypted env.
 */

import { handleVoiceSessionBrokerRequest } from "../../../lib/voice-operator/session-broker/pages-voice-session-broker";

export interface Env {
  readonly OPENAI_API_KEY: string;
  readonly VOICE_ALLOWED_ORIGINS: string;
}

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
}) => Response | Promise<Response>;

function isPagesPreviewRequest(request: Request): boolean {
  const origin = request.headers.get("Origin")?.trim();
  if (!origin) return false;
  try {
    return new URL(origin).hostname.endsWith(".pages.dev");
  } catch {
    return false;
  }
}

export const onRequest: PagesFunction<Env> = (context) =>
  handleVoiceSessionBrokerRequest(context.request, context.env, {
    // Staging exposes only the already-redacted classification/status/code.
    // The production custom domain continues returning a generic broker error.
    exposeUpstreamDiagnostics: isPagesPreviewRequest(context.request),
  });
