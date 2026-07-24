/**
 * Future multi-party conferencing transport adapter.
 * Preview MVP does not fabricate SFU/mesh signaling — capability is EXTERNAL_BLOCKED.
 */

export type LiveRoomTransportCapability = {
  readonly available: boolean;
  readonly kind: "host_voice_operator_only" | "future_multiparty";
  readonly label: string;
  readonly externalBlocked: boolean;
};

export function getLiveRoomTransportCapability(): LiveRoomTransportCapability {
  return {
    available: false,
    kind: "host_voice_operator_only",
    label:
      "Multi-party live audio transport is EXTERNAL_BLOCKED in this Preview. Host capture uses the existing Voice Operator broker; additional participants are simulated for translation UX tests.",
    externalBlocked: true,
  };
}
