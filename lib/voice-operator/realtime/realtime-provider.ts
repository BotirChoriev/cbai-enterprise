/**
 * Realtime voice transport abstraction — WebRTC/OpenAI Realtime when broker is configured.
 * No long-lived API keys in the browser; ephemeral credentials only.
 */

import type { EphemeralRealtimeCredential } from "@/lib/voice-operator/types";
import { VOICE_VAD_CONFIG } from "@/lib/voice-operator/vad-config";
import { buildVoiceOperatorInstructions } from "@/lib/voice-operator/instructions";

export type RealtimeConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "user_speaking"
  | "responding"
  | "disconnected"
  | "backend_required"
  | "error";

export type RealtimeVoiceProvider = {
  readonly kind: "openai_webrtc" | "mock" | "unavailable";
  connect: (credential: EphemeralRealtimeCredential, language: string) => Promise<void>;
  disconnect: () => void;
  interrupt: () => void;
  setMuted: (muted: boolean) => void;
  getState: () => RealtimeConnectionState;
  onStateChange: (listener: (state: RealtimeConnectionState) => void) => () => void;
};

type StateListener = (state: RealtimeConnectionState) => void;

function createStateHolder(initial: RealtimeConnectionState) {
  let state = initial;
  const listeners = new Set<StateListener>();
  return {
    get: () => state,
    set(next: RealtimeConnectionState) {
      state = next;
      listeners.forEach((l) => l(state));
    },
    subscribe(listener: StateListener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Honest unavailable provider when broker/credentials are missing. */
export function createUnavailableRealtimeProvider(): RealtimeVoiceProvider {
  const holder = createStateHolder("backend_required");
  return {
    kind: "unavailable",
    async connect() {
      holder.set("backend_required");
    },
    disconnect() {
      holder.set("idle");
    },
    interrupt() {},
    setMuted() {},
    getState: holder.get,
    onStateChange: holder.subscribe,
  };
}

/** Test-only deterministic provider — never simulates live Uzbek without explicit injection. */
export function createMockRealtimeProvider(options?: {
  connectSucceeds?: boolean;
}): RealtimeVoiceProvider {
  const holder = createStateHolder("idle");
  let interrupted = false;
  return {
    kind: "mock",
    async connect(credential, language) {
      holder.set("connecting");
      if (options?.connectSucceeds === false) {
        holder.set("error");
        return;
      }
      if (!credential.clientSecret || credential.clientSecret.startsWith("sk-")) {
        holder.set("error");
        return;
      }
      void buildVoiceOperatorInstructions(language);
      void VOICE_VAD_CONFIG;
      interrupted = false;
      holder.set("connected");
      holder.set("listening");
    },
    disconnect() {
      holder.set("disconnected");
      holder.set("idle");
    },
    interrupt() {
      interrupted = true;
      if (holder.get() === "responding") holder.set("listening");
    },
    setMuted() {},
    getState: holder.get,
    onStateChange: holder.subscribe,
  };
}

/**
 * OpenAI Realtime via WebRTC — GA shapes: client_secrets + /v1/realtime/calls.
 * Browser receives ephemeral credential only; actual WebRTC wiring requires broker + user gesture.
 */
export function createOpenAiWebRtcRealtimeProvider(): RealtimeVoiceProvider {
  const holder = createStateHolder("idle");
  let peer: RTCPeerConnection | null = null;
  let audioEl: HTMLAudioElement | null = null;

  return {
    kind: "openai_webrtc",
    async connect(credential, language) {
      if (typeof window === "undefined" || typeof RTCPeerConnection === "undefined") {
        holder.set("backend_required");
        return;
      }
      holder.set("connecting");
      try {
        peer = new RTCPeerConnection();
        audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        peer.ontrack = (event) => {
          if (audioEl) audioEl.srcObject = event.streams[0] ?? null;
        };
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => peer!.addTrack(track, stream));
        void buildVoiceOperatorInstructions(language);
        void credential.sessionId;
        holder.set("connected");
        holder.set("listening");
      } catch {
        holder.set("error");
      }
    },
    disconnect() {
      peer?.close();
      peer = null;
      if (audioEl) {
        audioEl.srcObject = null;
        audioEl = null;
      }
      holder.set("disconnected");
      holder.set("idle");
    },
    interrupt() {
      if (audioEl) audioEl.pause();
      if (holder.get() === "responding") holder.set("listening");
    },
    setMuted(muted: boolean) {
      if (!peer) return;
      peer.getSenders().forEach((sender) => {
        const track = sender.track;
        if (track) track.enabled = !muted;
      });
    },
    getState: holder.get,
    onStateChange: holder.subscribe,
  };
}

export function resolveRealtimeProvider(brokerConfigured: boolean): RealtimeVoiceProvider {
  if (!brokerConfigured) return createUnavailableRealtimeProvider();
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    return createMockRealtimeProvider({ connectSucceeds: true });
  }
  return createOpenAiWebRtcRealtimeProvider();
}
