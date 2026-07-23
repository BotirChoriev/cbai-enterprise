/** OpenAI Realtime data-channel event parsing — pure, testable. */

import type { RealtimeConnectionState } from "@/lib/voice-operator/realtime/realtime-provider";
import type { VoiceBrokerIssue, VoiceDockState } from "@/lib/voice-operator/types";

export type RealtimeTranscriptEvent = {
  readonly role: "user" | "assistant";
  readonly text: string;
  readonly final: boolean;
};

export type RealtimeEventParseResult = {
  readonly state?: RealtimeConnectionState;
  readonly transcript?: RealtimeTranscriptEvent;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function parseRealtimeServerEvent(raw: string): RealtimeEventParseResult | null {
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }

  const type = readString(event.type);
  if (!type) return null;

  switch (type) {
    case "input_audio_buffer.speech_started":
      return { state: "user_speaking" };
    case "input_audio_buffer.speech_stopped":
      return { state: "thinking" };
    case "response.created":
    case "response.output_audio.started":
    case "output_audio_buffer.started":
      return { state: "responding" };
    case "response.done":
    case "response.output_audio.done":
    case "output_audio_buffer.stopped":
      return { state: "listening" };
    case "conversation.item.input_audio_transcription.completed": {
      const transcript = readString(event.transcript);
      if (!transcript) return null;
      return { transcript: { role: "user", text: transcript, final: true } };
    }
    case "response.audio_transcript.delta": {
      const delta = readString(event.delta);
      if (!delta) return null;
      return { transcript: { role: "assistant", text: delta, final: false } };
    }
    case "response.audio_transcript.done": {
      const transcript = readString(event.transcript);
      if (!transcript) return null;
      return { transcript: { role: "assistant", text: transcript, final: true } };
    }
    case "error":
      return { state: "connection_failed" };
    default:
      return null;
  }
}

export function mapRealtimeStateToDockState(state: RealtimeConnectionState): VoiceDockState {
  switch (state) {
    case "idle":
      return "ready";
    case "connecting":
      return "connecting";
    case "connected":
    case "listening":
      return "listening";
    case "user_speaking":
      return "user_speaking";
    case "thinking":
      return "thinking";
    case "responding":
      return "responding";
    case "disconnected":
      return "disconnected";
    case "backend_required":
      return "backend_required";
    case "authentication_failed":
      return "error";
    case "connection_failed":
      return "error";
    case "error":
      return "error";
    default:
      return "ready";
  }
}

export function mapBrokerCodeToIssue(
  code:
    | "BACKEND_REQUIRED"
    | "ORIGIN_BLOCKED"
    | "RATE_LIMITED"
    | "AUTHENTICATION_FAILED"
    | "INVALID_API_KEY"
    | "QUOTA_OR_ACCOUNT_BLOCKED"
    | "ERROR",
): VoiceBrokerIssue {
  if (code === "INVALID_API_KEY") return "authentication_failed";
  if (code === "AUTHENTICATION_FAILED") return "authentication_failed";
  if (code === "BACKEND_REQUIRED") return "required";
  // ORIGIN_BLOCKED, RATE_LIMITED, QUOTA_OR_ACCOUNT_BLOCKED, ERROR
  return "unreachable";
}
