import type {
  VoiceBrokerIssue,
  VoiceDockState,
  VoicePermissionIssue,
} from "@/lib/voice-operator/types";

export type CanonicalVoiceState =
  | "closed"
  | "ready"
  | "connecting"
  | "listening"
  | "user_speaking"
  | "thinking"
  | "responding"
  | "stopped"
  | "permission_required"
  | "broker_unavailable"
  | "authentication_failed"
  | "invalid_api_key"
  | "quota_billing_unavailable"
  | "rate_limited"
  | "origin_blocked"
  | "network_failure"
  | "malformed_broker_response"
  | "webrtc_connection_failed"
  | "remote_audio_blocked"
  | "speech_recognition_unavailable"
  | "text_fallback"
  | "unknown_voice_error";

const ACTIVE_STATE_MAP: Partial<Record<VoiceDockState, CanonicalVoiceState>> = {
  listening: "listening",
  user_speaking: "user_speaking",
  thinking: "thinking",
  searching_sources: "thinking",
  responding: "responding",
  action_confirmation: "thinking",
  executing_action: "responding",
  awaiting_confirmation: "thinking",
};

/**
 * Live Listening / Listening labels are forbidden whenever the broker path has
 * already failed. Capture must be torn down in that case; if a stale micLive
 * flag remains, prefer the honest error over a contradictory Listening label.
 */
export function brokerIssueBlocksLiveListening(brokerIssue: VoiceBrokerIssue | null): boolean {
  return brokerIssue != null;
}

/**
 * "Live listening active" may render only when capture is genuinely live and the
 * Realtime session is in a post-connect listening family — never while connecting
 * and never alongside a broker failure notice.
 */
export function shouldShowLiveListeningBanner(input: {
  readonly dockState: VoiceDockState;
  readonly brokerIssue: VoiceBrokerIssue | null;
  readonly captureActive: boolean;
  readonly micLive: boolean;
}): boolean {
  if (brokerIssueBlocksLiveListening(input.brokerIssue)) return false;
  if (!input.captureActive || !input.micLive) return false;
  return (
    input.dockState === "listening" ||
    input.dockState === "user_speaking" ||
    input.dockState === "thinking" ||
    input.dockState === "responding" ||
    input.dockState === "searching_sources"
  );
}

export function resolveCanonicalVoiceState(input: {
  readonly dockState: VoiceDockState;
  readonly brokerIssue: VoiceBrokerIssue | null;
  readonly permissionIssue: VoicePermissionIssue | null;
  readonly textUsable: boolean;
  /**
   * Whether real microphone tracks are live. Ignored for the status label when
   * brokerIssue is set — Listening + "service unavailable" must never coexist.
   */
  readonly micLive?: boolean;
}): CanonicalVoiceState {
  if (input.brokerIssue === "authentication_failed") return "authentication_failed";
  if (input.brokerIssue === "invalid_api_key") return "invalid_api_key";
  if (input.brokerIssue === "quota_or_account_blocked") return "quota_billing_unavailable";
  if (input.brokerIssue === "rate_limited") return "rate_limited";
  if (input.brokerIssue === "origin_blocked") return "origin_blocked";
  if (input.brokerIssue === "malformed_response") return "malformed_broker_response";
  if (input.brokerIssue === "remote_audio_blocked") return "remote_audio_blocked";
  if (input.brokerIssue === "connection_failed") return "webrtc_connection_failed";
  if (input.brokerIssue === "unreachable") {
    return input.textUsable ? "text_fallback" : "network_failure";
  }
  if (input.brokerIssue === "unknown") {
    return input.textUsable ? "text_fallback" : "unknown_voice_error";
  }
  if (input.brokerIssue === "required" || input.dockState === "backend_required") {
    return input.textUsable ? "text_fallback" : "broker_unavailable";
  }
  if (input.permissionIssue === "unsupported" || input.permissionIssue === "speech_unavailable") {
    return input.textUsable ? "text_fallback" : "speech_recognition_unavailable";
  }
  if (input.permissionIssue === "network_disconnected") return "network_failure";
  if (input.permissionIssue || input.dockState === "permission_required") return "permission_required";

  if (input.micLive && ACTIVE_STATE_MAP[input.dockState]) {
    return ACTIVE_STATE_MAP[input.dockState]!;
  }

  const stateMap: Partial<Record<VoiceDockState, CanonicalVoiceState>> = {
    ...ACTIVE_STATE_MAP,
    closed: "closed",
    ready: "ready",
    connecting: "connecting",
    disconnected: "stopped",
    error: input.textUsable ? "text_fallback" : "unknown_voice_error",
  };
  return stateMap[input.dockState] ?? "ready";
}
