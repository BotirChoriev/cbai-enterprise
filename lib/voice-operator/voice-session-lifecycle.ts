/** Live microphone / Realtime capture lifecycle helpers — privacy-critical cleanup. */

import type { VoiceDockState } from "@/lib/voice-operator/types";

const LIVE_MIC_DOCK_STATES = new Set<VoiceDockState>([
  "connecting",
  "listening",
  "user_speaking",
  "thinking",
  "responding",
  "searching_sources",
]);

export function isLiveMicDockState(state: VoiceDockState): boolean {
  return LIVE_MIC_DOCK_STATES.has(state);
}

export function stopMediaStreamTracks(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => {
    if (track.readyState !== "ended") {
      track.stop();
    }
  });
}

export function areAllTracksEnded(...streams: Array<MediaStream | null | undefined>): boolean {
  const tracks = streams.flatMap((stream) => stream?.getTracks() ?? []);
  if (tracks.length === 0) return true;
  return tracks.every((track) => track.readyState === "ended");
}

export function disposeAudioElement(audioEl: HTMLAudioElement | null | undefined): void {
  if (!audioEl) return;
  audioEl.pause();
  const srcObject = audioEl.srcObject;
  if (srcObject && typeof srcObject === "object" && "getTracks" in srcObject) {
    stopMediaStreamTracks(srcObject as MediaStream);
  }
  audioEl.srcObject = null;
  audioEl.remove();
}

export type LiveCaptureGate = {
  readonly generation: number;
  readonly isCurrent: () => boolean;
};

export function createLiveCaptureGate(
  readGeneration: () => number,
  capturedGeneration = readGeneration(),
): LiveCaptureGate {
  return {
    generation: capturedGeneration,
    isCurrent: () => capturedGeneration === readGeneration(),
  };
}
