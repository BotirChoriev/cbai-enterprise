/**
 * Voice Operator local preflight — reports capability without exposing secrets.
 */

import { evaluateVoiceBrokerStatus } from "@/lib/voice-operator/session-broker/client";

export type VoicePreflightCheck =
  | "mic_available"
  | "broker_configured"
  | "broker_reachable"
  | "credential_received"
  | "webrtc_supported"
  | "audio_playback_available";

export type VoicePreflightResult = {
  readonly micAvailable: boolean | null;
  readonly brokerConfigured: boolean;
  readonly brokerReachable: boolean | null;
  readonly credentialReceived: boolean | null;
  readonly webrtcSupported: boolean;
  readonly audioPlaybackAvailable: boolean | null;
  readonly connectionState: string;
  readonly brokerUrl: string | null;
};

export function isWebRtcSupported(): boolean {
  if (typeof RTCPeerConnection === "undefined") return false;
  return true;
}

export async function probeVoiceBrokerReachable(brokerUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${brokerUrl.replace(/\/$/, "")}/session`, {
      method: "OPTIONS",
      headers: { Origin: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000" },
    });
    return response.status === 204 || response.status === 200 || response.status === 403 || response.status === 503;
  } catch {
    return false;
  }
}

export function runVoicePreflight(options?: {
  readonly brokerReachable?: boolean;
  readonly micAvailable?: boolean;
  readonly credentialReceived?: boolean;
  readonly audioPlaybackAvailable?: boolean;
  readonly connectionState?: string;
}): VoicePreflightResult {
  const broker = evaluateVoiceBrokerStatus();
  const brokerConfigured = broker.kind === "available";
  const brokerUrl = brokerConfigured ? broker.brokerUrl : null;

  return {
    micAvailable: options?.micAvailable ?? null,
    brokerConfigured,
    brokerReachable: brokerConfigured ? (options?.brokerReachable ?? null) : false,
    credentialReceived: options?.credentialReceived ?? null,
    webrtcSupported: isWebRtcSupported(),
    audioPlaybackAvailable: options?.audioPlaybackAvailable ?? null,
    connectionState: options?.connectionState ?? "idle",
    brokerUrl,
  };
}

export function formatVoicePreflightReport(result: VoicePreflightResult): string {
  const lines = [
    `broker_configured=${result.brokerConfigured}`,
    `webrtc_supported=${result.webrtcSupported}`,
    `broker_reachable=${result.brokerReachable ?? "unknown"}`,
    `mic_available=${result.micAvailable ?? "unknown"}`,
    `credential_received=${result.credentialReceived ?? "unknown"}`,
    `audio_playback=${result.audioPlaybackAvailable ?? "unknown"}`,
    `connection_state=${result.connectionState}`,
  ];
  if (result.brokerUrl) lines.push(`broker_url=${result.brokerUrl}`);
  return lines.join("\n");
}

/** Static guard — forbidden client-side secret patterns. */
export function assertNoVoiceSecretLeak(value: string): boolean {
  if (/\bsk-[A-Za-z0-9_-]{8,}\b/.test(value)) return false;
  if (/\bek_[A-Za-z0-9_-]{20,}\b/.test(value) && value.includes("process.env")) return false;
  return true;
}
