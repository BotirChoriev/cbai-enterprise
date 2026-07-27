/**
 * Future multi-party conferencing transport adapter.
 * Preview MVP does not fabricate SFU/mesh signaling — capability is connection-required.
 * User-facing labels must never expose internal enums such as EXTERNAL_BLOCKED.
 */

export type LiveRoomTransportStage =
  | "available"
  | "preview"
  | "connection_required"
  | "unavailable"
  | "permission_required";

export type LiveRoomTransportCapability = {
  readonly available: boolean;
  readonly kind: "host_voice_operator_only" | "future_multiparty";
  readonly stage: LiveRoomTransportStage;
  /** Stable i18n key — never a raw enum for UI. */
  readonly labelKey: string;
  /** Developer/internal flag — do not render this string to end users. */
  readonly externalBlocked: boolean;
};

export function getLiveRoomTransportCapability(): LiveRoomTransportCapability {
  return {
    available: false,
    kind: "host_voice_operator_only",
    stage: "connection_required",
    labelKey: "liveRooms.multipartyNotice",
    externalBlocked: true,
  };
}

/** @deprecated Prefer labelKey + localized dictionary. Kept for migration of stored room metadata. */
export function getLiveRoomTransportLegacyLabel(): string {
  return "Multi-party live audio is not available in this Preview. Host capture uses Voice Operator; additional participants are simulated for translation UX tests only.";
}
