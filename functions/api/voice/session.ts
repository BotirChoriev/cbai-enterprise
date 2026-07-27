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

export const onRequest: PagesFunction<Env> = (context) =>
  handleVoiceSessionBrokerRequest(context.request, context.env);
