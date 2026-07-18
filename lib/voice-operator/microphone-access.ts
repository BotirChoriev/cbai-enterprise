/** Microphone access via getUserMedia — authoritative for Safari; not Permissions API. */

import type { VoicePermissionIssue } from "@/lib/voice-operator/types";

export type MicrophoneAccessResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly issue: VoicePermissionIssue };

export function mapGetUserMediaError(error: unknown): VoicePermissionIssue {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "denied";
      case "NotFoundError":
        return "no_device";
      case "NotReadableError":
        return "device_busy";
      case "AbortError":
        return "dismissed";
      default:
        return "unsupported";
    }
  }
  return "unsupported";
}

export function mapSpeechRecognitionError(code: string): VoicePermissionIssue | null {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      // Mic may already be granted via getUserMedia — this is STT availability, not mic denial.
      return "speech_unavailable";
    case "network":
      return "network_disconnected";
    case "aborted":
      return "dismissed";
    case "audio-capture":
      return "no_device";
    default:
      return null;
  }
}

export async function requestMicrophoneAccess(): Promise<MicrophoneAccessResult> {
  if (typeof window === "undefined") {
    return { ok: false, issue: "unsupported" };
  }
  if (!window.isSecureContext) {
    return { ok: false, issue: "insecure_origin" };
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, issue: "unsupported" };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true };
  } catch (error) {
    return { ok: false, issue: mapGetUserMediaError(error) };
  }
}
