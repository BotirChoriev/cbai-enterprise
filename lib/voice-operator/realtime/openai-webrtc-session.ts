/**
 * OpenAI Realtime WebRTC session — ephemeral credential only, full lifecycle + cleanup.
 */

import { mapGetUserMediaError } from "@/lib/voice-operator/microphone-access";
import { buildVoiceOperatorInstructions } from "@/lib/voice-operator/instructions";
import { parseRealtimeServerEvent, type RealtimeToolCallEvent } from "@/lib/voice-operator/realtime/realtime-events";
import type { RealtimeConnectionState } from "@/lib/voice-operator/realtime/realtime-provider";
import type { EphemeralRealtimeCredential, VoicePermissionIssue } from "@/lib/voice-operator/types";
import {
  areAllTracksEnded,
  disposeAudioElement,
  stopMediaStreamTracks,
} from "@/lib/voice-operator/voice-session-lifecycle";

export const OPENAI_REALTIME_CALLS_URL = "https://api.openai.com/v1/realtime/calls";
export const REALTIME_SDP_TIMEOUT_MS = 15_000;

export async function fetchRealtimeSdp(
  fetchImpl: typeof fetch,
  init: RequestInit,
  upstreamSignal?: AbortSignal | null,
  timeoutMs = REALTIME_SDP_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const forwardAbort = () => controller.abort();
  if (upstreamSignal?.aborted) controller.abort();
  else upstreamSignal?.addEventListener("abort", forwardAbort, { once: true });
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await fetchImpl(OPENAI_REALTIME_CALLS_URL, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) throw new Error("realtime_sdp_timeout");
    throw error;
  } finally {
    clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener("abort", forwardAbort);
  }
}

export class RealtimeMicrophoneError extends Error {
  readonly issue: VoicePermissionIssue;

  constructor(issue: VoicePermissionIssue) {
    super(issue);
    this.name = "RealtimeMicrophoneError";
    this.issue = issue;
  }
}

export type RealtimeTranscriptListener = (event: {
  readonly role: "user" | "assistant";
  readonly text: string;
  readonly final: boolean;
}) => void;

export type RealtimeStateListener = (state: RealtimeConnectionState) => void;

export type WebRtcSessionDeps = {
  readonly RTCPeerConnection: typeof RTCPeerConnection;
  readonly fetch: typeof fetch;
  readonly getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  readonly createAudioElement: () => HTMLAudioElement;
};

export type RealtimeToolCallListener = (event: RealtimeToolCallEvent) => void;

export type WebRtcSessionHandle = {
  readonly disconnect: () => void;
  readonly interrupt: () => void;
  readonly setMuted: (muted: boolean) => void;
  readonly getState: () => RealtimeConnectionState;
  readonly onStateChange: (listener: RealtimeStateListener) => () => void;
  readonly onTranscript: (listener: RealtimeTranscriptListener) => () => void;
  readonly onToolCall: (listener: RealtimeToolCallListener) => () => void;
  readonly sendToolResults: (messages: readonly Record<string, unknown>[]) => void;
  readonly getLocalStream: () => MediaStream | null;
  readonly getRemoteStream: () => MediaStream | null;
};

type MutableSession = {
  peer: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  audioEl: HTMLAudioElement | null;
  abortController: AbortController | null;
  state: RealtimeConnectionState;
  assistantPartial: string;
  connectGeneration: number;
  disconnected: boolean;
  responseTimeoutId: ReturnType<typeof setTimeout> | null;
};

/** Emergency guard only; normal long-form narration remains available when visualized live. */
export const MAX_ASSISTANT_RESPONSE_MS = 120_000;

const TERMINAL_FAILURE_STATES = new Set<RealtimeConnectionState>([
  "authentication_failed",
  "connection_failed",
  "error",
]);

function createStateEmitter(session: MutableSession) {
  const listeners = new Set<RealtimeStateListener>();
  return {
    get: () => session.state,
    set(next: RealtimeConnectionState) {
      session.state = next;
      listeners.forEach((listener) => listener(next));
    },
    subscribe(listener: RealtimeStateListener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    waitForConnect(): Promise<RealtimeConnectionState> {
      if (session.state === "listening") return Promise.resolve("listening");
      if (TERMINAL_FAILURE_STATES.has(session.state)) return Promise.resolve(session.state);
      return new Promise((resolve) => {
        const unsub = this.subscribe((state) => {
          if (state === "listening" || TERMINAL_FAILURE_STATES.has(state)) {
            unsub();
            resolve(state);
          }
        });
      });
    },
  };
}

function createTranscriptEmitter() {
  const listeners = new Set<RealtimeTranscriptListener>();
  return {
    emit(event: Parameters<RealtimeTranscriptListener>[0]) {
      listeners.forEach((listener) => listener(event));
    },
    subscribe(listener: RealtimeTranscriptListener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function createToolCallEmitter() {
  const listeners = new Set<RealtimeToolCallListener>();
  return {
    emit(event: RealtimeToolCallEvent) {
      listeners.forEach((listener) => listener(event));
    },
    subscribe(listener: RealtimeToolCallListener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function isSdpAnswer(contentType: string | null, bodyText: string): boolean {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (normalized.includes("application/sdp")) return true;
  return bodyText.trim().startsWith("v=");
}

function isHtmlResponse(contentType: string | null, bodyText: string): boolean {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (normalized.includes("text/html")) return true;
  const trimmed = bodyText.trim().toLowerCase();
  return trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html");
}

export function classifyRealtimeCallsResponse(input: {
  readonly status: number;
  readonly contentType: string | null;
  readonly bodyText: string;
}): "answer" | "authentication_failed" | "connection_failed" {
  if (input.status === 401 || input.status === 403 || input.status === 407) {
    return "authentication_failed";
  }
  if (input.status >= 300 && input.status < 400) {
    return "authentication_failed";
  }
  if (!input.status || input.status < 200 || input.status >= 300) {
    return "connection_failed";
  }
  if (isHtmlResponse(input.contentType, input.bodyText)) {
    return "authentication_failed";
  }
  if (!isSdpAnswer(input.contentType, input.bodyText)) {
    return "connection_failed";
  }
  return "answer";
}

export function cleanupWebRtcSessionResources(session: MutableSession): void {
  session.abortController?.abort();
  session.abortController = null;

  if (session.dataChannel) {
    try {
      session.dataChannel.close();
    } catch {
      /* ignore */
    }
    session.dataChannel = null;
  }

  if (session.peer) {
    try {
      session.peer.close();
    } catch {
      /* ignore */
    }
    session.peer = null;
  }

  stopMediaStreamTracks(session.localStream);
  session.localStream = null;

  stopMediaStreamTracks(session.remoteStream);
  session.remoteStream = null;

  disposeAudioElement(session.audioEl);
  session.audioEl = null;
  session.assistantPartial = "";
  if (session.responseTimeoutId) clearTimeout(session.responseTimeoutId);
  session.responseTimeoutId = null;
}

export function verifyWebRtcSessionTracksEnded(session: Pick<MutableSession, "localStream" | "remoteStream">): boolean {
  return areAllTracksEnded(session.localStream, session.remoteStream);
}

function waitForDataChannelOpen(
  dataChannel: RTCDataChannel,
  signal: AbortSignal | null | undefined,
  timeoutMs = 15_000,
): Promise<void> {
  if (dataChannel.readyState === "open") return Promise.resolve();
  if (dataChannel.readyState === "closing" || dataChannel.readyState === "closed") {
    return Promise.reject(new Error("data_channel_closed"));
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      dataChannel.removeEventListener("open", onOpen);
      dataChannel.removeEventListener("error", onError);
      dataChannel.removeEventListener("close", onClose);
      signal?.removeEventListener("abort", onAbort);
      fn();
    };
    const onOpen = () => finish(() => resolve());
    const onError = () => finish(() => reject(new Error("data_channel_error")));
    const onClose = () => finish(() => reject(new Error("data_channel_closed")));
    const onAbort = () => finish(() => reject(new DOMException("Aborted", "AbortError")));
    const timeoutId = setTimeout(() => finish(() => reject(new Error("data_channel_timeout"))), timeoutMs);
    dataChannel.addEventListener("open", onOpen);
    dataChannel.addEventListener("error", onError);
    dataChannel.addEventListener("close", onClose);
    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

export async function connectOpenAiWebRtcSession(options: {
  readonly credential: EphemeralRealtimeCredential;
  readonly language: string;
  readonly deps: WebRtcSessionDeps;
}): Promise<WebRtcSessionHandle> {
  const session: MutableSession = {
    peer: null,
    dataChannel: null,
    localStream: null,
    remoteStream: null,
    audioEl: null,
    abortController: null,
    state: "idle",
    assistantPartial: "",
    connectGeneration: 0,
    disconnected: false,
    responseTimeoutId: null,
  };

  const stateEmitter = createStateEmitter(session);
  const transcriptEmitter = createTranscriptEmitter();
  const toolCallEmitter = createToolCallEmitter();

  const sendToolResults = (messages: readonly Record<string, unknown>[]) => {
    if (session.disconnected || session.dataChannel?.readyState !== "open") return;
    for (const message of messages) {
      session.dataChannel.send(JSON.stringify(message));
    }
  };

  const disconnect = () => {
    if (session.disconnected && session.state === "idle") return;
    session.disconnected = true;
    session.connectGeneration += 1;
    cleanupWebRtcSessionResources(session);
    if (session.state !== "idle") {
      stateEmitter.set("disconnected");
      stateEmitter.set("idle");
    }
  };

  const handleDataChannelMessage = (raw: string) => {
    if (session.disconnected) return;
    const parsed = parseRealtimeServerEvent(raw);
    if (!parsed) return;
    if (parsed.state) {
      if (session.responseTimeoutId) clearTimeout(session.responseTimeoutId);
      session.responseTimeoutId = null;
      if (parsed.state === "responding") {
        session.responseTimeoutId = setTimeout(() => {
          session.responseTimeoutId = null;
          if (session.disconnected || session.state !== "responding") return;
          if (session.dataChannel?.readyState === "open") {
            session.dataChannel.send(JSON.stringify({ type: "response.cancel" }));
          }
          session.audioEl?.pause();
          stateEmitter.set("listening");
        }, MAX_ASSISTANT_RESPONSE_MS);
      }
      stateEmitter.set(parsed.state);
    }
    if (parsed.transcript) {
      if (parsed.transcript.role === "assistant" && !parsed.transcript.final) {
        session.assistantPartial += parsed.transcript.text;
        if (session.assistantPartial.trim()) {
          transcriptEmitter.emit({ role: "assistant", text: session.assistantPartial.trim(), final: false });
        }
        return;
      }
      if (parsed.transcript.role === "assistant" && parsed.transcript.final) {
        const text = parsed.transcript.text || session.assistantPartial;
        session.assistantPartial = "";
        if (text.trim()) transcriptEmitter.emit({ role: "assistant", text: text.trim(), final: true });
        return;
      }
      if (parsed.transcript.final && parsed.transcript.text.trim()) {
        transcriptEmitter.emit({
          role: parsed.transcript.role,
          text: parsed.transcript.text.trim(),
          final: true,
        });
      }
    }
    if (parsed.toolCall) {
      toolCallEmitter.emit(parsed.toolCall);
    }
  };

  const handle: WebRtcSessionHandle = {
    disconnect,
    interrupt() {
      if (session.disconnected) return;
      if (session.dataChannel?.readyState === "open") {
        session.dataChannel.send(JSON.stringify({ type: "response.cancel" }));
      }
      session.audioEl?.pause();
      if (session.responseTimeoutId) clearTimeout(session.responseTimeoutId);
      session.responseTimeoutId = null;
      if (session.state === "responding") stateEmitter.set("listening");
    },
    setMuted(muted: boolean) {
      session.localStream?.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    },
    getState: stateEmitter.get,
    onStateChange: stateEmitter.subscribe,
    onTranscript: transcriptEmitter.subscribe,
    onToolCall: toolCallEmitter.subscribe,
    sendToolResults,
    getLocalStream: () => session.localStream,
    getRemoteStream: () => session.remoteStream,
  };

  if (!options.credential.clientSecret || options.credential.clientSecret.startsWith("sk-")) {
    stateEmitter.set("error");
    return handle;
  }

  cleanupWebRtcSessionResources(session);
  session.disconnected = false;
  session.connectGeneration += 1;
  const generation = session.connectGeneration;
  session.abortController = new AbortController();
  stateEmitter.set("connecting");

  try {
    const { RTCPeerConnection, fetch, getUserMedia, createAudioElement } = options.deps;
    void buildVoiceOperatorInstructions(options.language);

    const peer = new RTCPeerConnection();
    session.peer = peer;

    const audioEl = createAudioElement();
    audioEl.autoplay = true;
    session.audioEl = audioEl;

    peer.ontrack = (event) => {
      if (session.disconnected || generation !== session.connectGeneration) return;
      session.remoteStream = event.streams[0] ?? null;
      if (session.audioEl) {
        session.audioEl.srcObject = session.remoteStream;
      }
    };

    peer.onconnectionstatechange = () => {
      if (generation !== session.connectGeneration || session.disconnected) return;
      if (peer.connectionState === "failed") stateEmitter.set("connection_failed");
      if (peer.connectionState === "disconnected") stateEmitter.set("disconnected");
    };

    let localStream: MediaStream;
    try {
      localStream = await getUserMedia({ audio: true });
    } catch (error) {
      throw new RealtimeMicrophoneError(mapGetUserMediaError(error));
    }

    if (generation !== session.connectGeneration || session.disconnected) {
      stopMediaStreamTracks(localStream);
      return handle;
    }

    session.localStream = localStream;
    localStream.getAudioTracks().forEach((track) => peer.addTrack(track, localStream));

    const dataChannel = peer.createDataChannel("oai-events");
    session.dataChannel = dataChannel;
    dataChannel.addEventListener("message", (event) => {
      if (typeof event.data === "string") handleDataChannelMessage(event.data);
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    if (generation !== session.connectGeneration || session.disconnected) return handle;

    const sdpResponse = await fetchRealtimeSdp(fetch, {
      method: "POST",
      body: offer.sdp ?? "",
      headers: {
        Authorization: `Bearer ${options.credential.clientSecret}`,
        "Content-Type": "application/sdp",
      },
    }, session.abortController?.signal);

    if (generation !== session.connectGeneration || session.disconnected) return handle;

    const bodyText = await sdpResponse.text();
    const classification = classifyRealtimeCallsResponse({
      status: sdpResponse.status,
      contentType: sdpResponse.headers.get("Content-Type"),
      bodyText,
    });

    if (classification === "authentication_failed") {
      cleanupWebRtcSessionResources(session);
      stateEmitter.set("authentication_failed");
      return handle;
    }
    if (classification === "connection_failed") {
      cleanupWebRtcSessionResources(session);
      stateEmitter.set("connection_failed");
      return handle;
    }

    await peer.setRemoteDescription({ type: "answer", sdp: bodyText });
    if (generation !== session.connectGeneration || session.disconnected) return handle;

    // P0: Listening is forbidden until the OpenAI data channel is open.
    try {
      await waitForDataChannelOpen(dataChannel, session.abortController?.signal);
    } catch (error) {
      if (generation !== session.connectGeneration || session.disconnected) return handle;
      cleanupWebRtcSessionResources(session);
      if (error instanceof DOMException && error.name === "AbortError") {
        stateEmitter.set("idle");
        return handle;
      }
      stateEmitter.set("connection_failed");
      return handle;
    }
    if (generation !== session.connectGeneration || session.disconnected) return handle;

    // Best-effort remote audio readiness after a user gesture (mic start).
    try {
      await session.audioEl?.play();
    } catch {
      /* Safari may still unlock after the first remote track; do not fail the session solely here. */
    }

    stateEmitter.set("connected");
    stateEmitter.set("listening");
  } catch (error) {
    if (generation !== session.connectGeneration || session.disconnected) return handle;
    cleanupWebRtcSessionResources(session);
    if (error instanceof RealtimeMicrophoneError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      stateEmitter.set("idle");
      return handle;
    }
    stateEmitter.set("connection_failed");
  }

  await stateEmitter.waitForConnect();
  return handle;
}

export type { MutableSession };
