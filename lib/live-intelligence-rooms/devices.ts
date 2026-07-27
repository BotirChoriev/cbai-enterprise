/**
 * Browser-safe device discovery / preflight helpers.
 * Professional media-gateway integrations remain EXTERNAL_BLOCKED / planned.
 */

import type { CapabilityStage } from "@/lib/live-intelligence-rooms/types";

export type DevicePermissionState = "unknown" | "granted" | "denied" | "prompt" | "unsupported";

export type DeviceCapability = {
  readonly id: string;
  readonly labelKey: string;
  readonly stage: CapabilityStage;
  readonly browserSafe: boolean;
};

export const BROWSER_DEVICE_CAPABILITIES: readonly DeviceCapability[] = [
  { id: "microphone", labelKey: "lcr.deviceMic", stage: "permission_required", browserSafe: true },
  { id: "camera", labelKey: "lcr.deviceCamera", stage: "permission_required", browserSafe: true },
  { id: "speaker", labelKey: "lcr.deviceSpeaker", stage: "preview", browserSafe: true },
  { id: "screen_share", labelKey: "lcr.deviceScreen", stage: "permission_required", browserSafe: true },
  { id: "usb_hint", labelKey: "lcr.deviceUsb", stage: "preview", browserSafe: true },
];

export const PROFESSIONAL_INTEGRATIONS: readonly DeviceCapability[] = [
  { id: "multi_camera", labelKey: "lcr.proMultiCamera", stage: "unavailable", browserSafe: false },
  { id: "room_mics", labelKey: "lcr.proRoomMics", stage: "unavailable", browserSafe: false },
  { id: "presenter_computer", labelKey: "lcr.proPresenterPc", stage: "planned", browserSafe: false },
  { id: "smart_display", labelKey: "lcr.proSmartDisplay", stage: "planned", browserSafe: false },
  { id: "control_tablet", labelKey: "lcr.proControlTablet", stage: "planned", browserSafe: false },
  { id: "speaker_tracking", labelKey: "lcr.proSpeakerTracking", stage: "unavailable", browserSafe: false },
  { id: "lab_feed", labelKey: "lcr.proLabFeed", stage: "unavailable", browserSafe: false },
  { id: "rtsp_ndi_gateway", labelKey: "lcr.proRtspNdi", stage: "unavailable", browserSafe: false },
  { id: "qr_room_display", labelKey: "lcr.proQrPairing", stage: "planned", browserSafe: false },
];

export type LocalMediaHandle = {
  readonly stream: MediaStream | null;
  readonly permission: DevicePermissionState;
  readonly error: string | null;
};

export async function probeMicrophonePreview(): Promise<LocalMediaHandle> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { stream: null, permission: "unsupported", error: "getUserMedia_unavailable" };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return { stream, permission: "granted", error: null };
  } catch (err) {
    const name = err instanceof Error ? err.name : "Error";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return { stream: null, permission: "denied", error: name };
    }
    return { stream: null, permission: "denied", error: name };
  }
}

export async function probeCameraPreview(): Promise<LocalMediaHandle> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { stream: null, permission: "unsupported", error: "getUserMedia_unavailable" };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    return { stream, permission: "granted", error: null };
  } catch (err) {
    const name = err instanceof Error ? err.name : "Error";
    return { stream: null, permission: name === "NotAllowedError" ? "denied" : "denied", error: name };
  }
}

export function releaseMediaStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      // ignore
    }
  }
}

export function listInputDevicesSafe(): Promise<readonly { readonly kind: string; readonly label: string; readonly deviceId: string }[]> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return Promise.resolve([]);
  }
  return navigator.mediaDevices.enumerateDevices().then((devices) =>
    devices.map((d) => ({
      kind: d.kind,
      // Labels may be empty before permission — never invent device names.
      label: d.label || "(permission required for label)",
      deviceId: d.deviceId,
    })),
  );
}
