/**
 * Realtime voice transport abstraction — WebRTC/OpenAI Realtime when broker is configured.
 * No long-lived API keys in the browser; ephemeral credentials only.
 */

import {
  connectOpenAiWebRtcSession,
  RealtimeMicrophoneError,
  type RealtimeStateListener,
  type RealtimeToolCallListener,
  type RealtimeTranscriptListener,
  type WebRtcSessionHandle,
} from "@/lib/voice-operator/realtime/openai-webrtc-session";
import type { EphemeralRealtimeCredential } from "@/lib/voice-operator/types";
import { VOICE_VAD_CONFIG } from "@/lib/voice-operator/vad-config";
import { buildVoiceOperatorInstructions } from "@/lib/voice-operator/instructions";

export type RealtimeConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "user_speaking"
  | "thinking"
  | "responding"
  | "disconnected"
  | "backend_required"
  | "authentication_failed"
  | "connection_failed"
  | "error";

export type RealtimeVoiceProvider = {
  readonly kind: "openai_webrtc" | "mock" | "unavailable";
  connect: (credential: EphemeralRealtimeCredential, language: string) => Promise<void>;
  disconnect: () => void;
  interrupt: () => void;
  setMuted: (muted: boolean) => void;
  getState: () => RealtimeConnectionState;
  onStateChange: (listener: RealtimeStateListener) => () => void;
  onTranscript: (listener: RealtimeTranscriptListener) => () => void;
  onToolCall: (listener: RealtimeToolCallListener) => () => void;
  sendToolResults: (messages: readonly Record<string, unknown>[]) => void;
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
  const noop = () => () => {};
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
    onTranscript: noop,
    onToolCall: noop,
    sendToolResults() {},
  };
}

/** Test-only deterministic provider — never simulates live Uzbek without explicit injection. */
export function createMockRealtimeProvider(options?: {
  connectSucceeds?: boolean;
}): RealtimeVoiceProvider {
  const holder = createStateHolder("idle");
  const transcriptListeners = new Set<RealtimeTranscriptListener>();
  return {
    kind: "mock",
    async connect(credential, language) {
      holder.set("connecting");
      if (options?.connectSucceeds === false) {
        holder.set("connection_failed");
        return;
      }
      if (!credential.clientSecret || credential.clientSecret.startsWith("sk-")) {
        holder.set("error");
        return;
      }
      void buildVoiceOperatorInstructions(language);
      void VOICE_VAD_CONFIG;
      holder.set("connected");
      holder.set("listening");
    },
    disconnect() {
      holder.set("disconnected");
      holder.set("idle");
    },
    interrupt() {
      if (holder.get() === "responding") holder.set("listening");
    },
    setMuted() {},
    getState: holder.get,
    onStateChange: holder.subscribe,
    onTranscript(listener) {
      transcriptListeners.add(listener);
      return () => transcriptListeners.delete(listener);
    },
    onToolCall: () => () => {},
    sendToolResults() {},
  };
}

/**
 * OpenAI Realtime via WebRTC — GA shapes: client_secrets + /v1/realtime/calls.
 */
export function createOpenAiWebRtcRealtimeProvider(): RealtimeVoiceProvider {
  if (typeof window === "undefined" || typeof RTCPeerConnection === "undefined") {
    return createUnavailableRealtimeProvider();
  }

  let activeSession: WebRtcSessionHandle | null = null;
  let connectPromise: Promise<void> | null = null;
  let connectEpoch = 0;
  const holder = createStateHolder("idle");
  const transcriptListeners = new Set<RealtimeTranscriptListener>();
  const toolCallListeners = new Set<RealtimeToolCallListener>();
  let sessionUnsubs: Array<() => void> = [];

  const clearSessionBindings = () => {
    sessionUnsubs.forEach((unsub) => unsub());
    sessionUnsubs = [];
  };

  const bindSession = (session: WebRtcSessionHandle) => {
    clearSessionBindings();
    sessionUnsubs.push(
      session.onStateChange((state) => holder.set(state)),
      session.onTranscript((event) => {
        transcriptListeners.forEach((listener) => listener(event));
      }),
      session.onToolCall((event) => {
        toolCallListeners.forEach((listener) => listener(event));
      }),
    );
  };

  const disconnect = () => {
    connectEpoch += 1;
    connectPromise = null;
    clearSessionBindings();
    activeSession?.disconnect();
    activeSession = null;
    holder.set("idle");
  };

  return {
    kind: "openai_webrtc",
    async connect(credential, language) {
      if (!credential.clientSecret || credential.clientSecret.startsWith("sk-")) {
        holder.set("error");
        return;
      }

      if (connectPromise) {
        await connectPromise;
        return;
      }

      const epoch = connectEpoch;
      connectPromise = (async () => {
        activeSession?.disconnect();
        clearSessionBindings();

        const session = await connectOpenAiWebRtcSession({
          credential,
          language,
          deps: {
            RTCPeerConnection,
            fetch: window.fetch.bind(window),
            getUserMedia: (constraints) => navigator.mediaDevices.getUserMedia(constraints),
            createAudioElement: () => {
              const audio = document.createElement("audio");
              audio.autoplay = true;
              audio.setAttribute("playsinline", "true");
              return audio;
            },
          },
        });

        if (epoch !== connectEpoch) {
          session.disconnect();
          return;
        }

        activeSession = session;
        bindSession(session);
        holder.set(session.getState());
      })();

      try {
        await connectPromise;
      } catch (error) {
        if (epoch === connectEpoch) {
          if (error instanceof RealtimeMicrophoneError) throw error;
          holder.set("connection_failed");
        }
      } finally {
        connectPromise = null;
      }
    },
    disconnect,
    interrupt() {
      activeSession?.interrupt();
    },
    setMuted(muted) {
      activeSession?.setMuted(muted);
    },
    getState: () => activeSession?.getState() ?? holder.get(),
    onStateChange(listener) {
      return holder.subscribe(listener);
    },
    onTranscript(listener) {
      transcriptListeners.add(listener);
      return () => transcriptListeners.delete(listener);
    },
    onToolCall(listener) {
      toolCallListeners.add(listener);
      return () => toolCallListeners.delete(listener);
    },
    sendToolResults(messages) {
      activeSession?.sendToolResults(messages);
    },
  };
}

export function resolveRealtimeProvider(brokerConfigured: boolean): RealtimeVoiceProvider {
  if (!brokerConfigured) return createUnavailableRealtimeProvider();
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    return createMockRealtimeProvider({ connectSucceeds: true });
  }
  return createOpenAiWebRtcRealtimeProvider();
}

export { RealtimeMicrophoneError } from "@/lib/voice-operator/realtime/openai-webrtc-session";
export { mapRealtimeStateToDockState } from "@/lib/voice-operator/realtime/realtime-events";
