/** OpenAI Realtime data-channel event parsing — pure, testable. */

import type { RealtimeConnectionState } from "@/lib/voice-operator/realtime/realtime-provider";
import type { VoiceBrokerIssue, VoiceDockState } from "@/lib/voice-operator/types";

export type RealtimeTranscriptEvent = {
  readonly role: "user" | "assistant";
  readonly text: string;
  readonly final: boolean;
};

export type RealtimeToolCallEvent = {
  readonly callId: string;
  readonly name: string;
  readonly argumentsJson: string;
};

export type RealtimeEventParseResult = {
  readonly state?: RealtimeConnectionState;
  readonly transcript?: RealtimeTranscriptEvent;
  readonly toolCall?: RealtimeToolCallEvent;
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
    case "response.function_call_arguments.done": {
      const callId = readString(event.call_id);
      const name = readString(event.name);
      const args = typeof event.arguments === "string" ? event.arguments : "";
      if (!callId || !name) return null;
      return { toolCall: { callId, name, argumentsJson: args } };
    }
    case "response.output_item.done": {
      const item = event.item;
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      if (readString(record.type) !== "function_call") return null;
      const callId = readString(record.call_id);
      const name = readString(record.name);
      const args = typeof record.arguments === "string" ? record.arguments : "";
      if (!callId || !name) return null;
      return { toolCall: { callId, name, argumentsJson: args } };
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

export function mapPlatformDockState(state: VoiceDockState): string {
  switch (state) {
    case "executing_action":
      return "stateExecutingAction";
    case "awaiting_confirmation":
      return "stateAwaitingConfirmation";
    default:
      return "stateReady";
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
  if (code === "INVALID_API_KEY") return "invalid_api_key";
  if (code === "QUOTA_OR_ACCOUNT_BLOCKED") return "quota_or_account_blocked";
  if (code === "AUTHENTICATION_FAILED") return "authentication_failed";
  if (code === "BACKEND_REQUIRED") return "required";
  return "unreachable";
}
