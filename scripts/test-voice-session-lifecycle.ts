/**
 * Voice Operator live capture lifecycle tests — privacy-critical cleanup.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  getVoiceOperatorIntroPhrase,
  buildVoiceOperatorInstructions,
  VOICE_OPERATOR_INTRO_PHRASES,
} from "@/lib/voice-operator/instructions";
import {
  cleanupWebRtcSessionResources,
  connectOpenAiWebRtcSession,
  verifyWebRtcSessionTracksEnded,
  type MutableSession,
} from "@/lib/voice-operator/realtime/openai-webrtc-session";
import {
  areAllTracksEnded,
  captureResourcesAreLive,
  createLiveCaptureGate,
  isLiveMicDockState,
  stopMediaStreamTracks,
  streamHasLiveTracks,
} from "@/lib/voice-operator/voice-session-lifecycle";
import { requestRealtimeSessionCredential, setMockSessionBrokerHandler } from "@/lib/voice-operator/session-broker/client";
import { createMockRealtimeProvider } from "@/lib/voice-operator/realtime/realtime-provider";
import { SpeechRecognitionSession } from "@/lib/voice/speech-recognition-session";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

class MockTrack {
  readyState: MediaStreamTrackState = "live";
  stop() {
    this.readyState = "ended";
  }
}

class MockStream {
  readonly tracks: MockTrack[];

  constructor(tracks: MockTrack[]) {
    this.tracks = tracks;
  }

  getTracks() {
    return this.tracks;
  }

  getAudioTracks() {
    return this.tracks;
  }
}

test("stopMediaStreamTracks ends live tracks", () => {
  const track = new MockTrack();
  const stream = new MockStream([track]) as unknown as MediaStream;
  stopMediaStreamTracks(stream);
  assert.equal(track.readyState, "ended");
  assert.equal(areAllTracksEnded(stream), true);
});

test("cleanupWebRtcSessionResources closes peer, data channel, and ends tracks", () => {
  const localTrack = new MockTrack();
  const remoteTrack = new MockTrack();
  let dataChannelClosed = false;
  let peerClosed = false;
  let audioRemoved = false;

  const session: MutableSession = {
    peer: {
      close() {
        peerClosed = true;
      },
    } as unknown as RTCPeerConnection,
    dataChannel: {
      close() {
        dataChannelClosed = true;
      },
    } as unknown as RTCDataChannel,
    localStream: new MockStream([localTrack]) as unknown as MediaStream,
    remoteStream: new MockStream([remoteTrack]) as unknown as MediaStream,
    audioEl: {
      pause() {},
      remove() {
        audioRemoved = true;
      },
      srcObject: new MockStream([remoteTrack]) as unknown as MediaStream,
    } as unknown as HTMLAudioElement,
    abortController: new AbortController(),
    state: "listening",
    assistantPartial: "",
    connectGeneration: 1,
    disconnected: false,
  };

  cleanupWebRtcSessionResources(session);
  assert.equal(dataChannelClosed, true);
  assert.equal(peerClosed, true);
  assert.equal(audioRemoved, true);
  assert.equal(localTrack.readyState, "ended");
  assert.equal(remoteTrack.readyState, "ended");
  assert.equal(verifyWebRtcSessionTracksEnded(session), true);
});

test("WebRTC disconnect is idempotent", async () => {
  class MockDataChannel {
    closed = false;
    addEventListener() {}
    close() {
      this.closed = true;
    }
    send() {}
  }

  class MockPeerConnection {
    closed = false;
    async createOffer() {
      return { sdp: "v=0 offer" };
    }
    async setLocalDescription() {}
    async setRemoteDescription() {}
    addTrack() {}
    createDataChannel() {
      return new MockDataChannel();
    }
    close() {
      this.closed = true;
    }
  }

  const session = await connectOpenAiWebRtcSession({
    credential: {
      clientSecret: "ek_test",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      sessionId: "sess",
      model: "gpt-realtime",
    },
    language: "uz",
    deps: {
      RTCPeerConnection: MockPeerConnection as unknown as typeof RTCPeerConnection,
      fetch: async () =>
        new Response("v=0 answer", {
          status: 200,
          headers: { "Content-Type": "application/sdp" },
        }),
      getUserMedia: async () => new MockStream([new MockTrack()]) as unknown as MediaStream,
      createAudioElement: () =>
        ({
          pause() {},
          remove() {},
          setAttribute() {},
        }) as unknown as HTMLAudioElement,
    },
  });

  session.disconnect();
  session.disconnect();
  assert.equal(session.getState(), "idle");
});

test("live capture gate rejects stale async work", () => {
  let generation = 0;
  const gate = createLiveCaptureGate(() => generation, 0);
  assert.equal(gate.isCurrent(), true);
  generation += 1;
  assert.equal(gate.isCurrent(), false);
});

test("isLiveMicDockState covers active capture states", () => {
  assert.equal(isLiveMicDockState("listening"), true);
  assert.equal(isLiveMicDockState("responding"), true);
  assert.equal(isLiveMicDockState("ready"), false);
  assert.equal(isLiveMicDockState("closed"), false);
});

test("closeDock stops live audio capture but preserves transcript memory", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  const closeDockMatch = provider.match(/const closeDock = useCallback\(\(\) => \{([\s\S]*?)\}, \[releaseLiveAudioResources\]\)/);
  assert.ok(closeDockMatch);
  assert.match(closeDockMatch![1], /releaseLiveAudioResources\(\)/);
  assert.doesNotMatch(closeDockMatch![1], /clearVoiceSessionMemory/);
});

test("endSession performs full cleanup and clears transcript memory", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /const endSession = useCallback\(\(\) => \{[\s\S]*stopLiveAudioCapture\(\)/);
  assert.match(provider, /clearVoiceSessionMemory\(\)/);
});

test("mic toggle UI: active unslashed teal mic stops capture; inactive slashed mic starts", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /const stopListening = useCallback\(\(\) => \{[\s\S]*stopLiveAudioCapture\(\)/);
  assert.match(provider, /startListening/);

  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /vo\.micLive \? vo\.stopListening\(\) : vo\.startListening\(\)/);
  assert.match(dock, /copy\.stopLiveListening/);
  assert.match(dock, /copy\.unmuteMic/);
  assert.match(dock, /vo\.micLive[\s\S]*copy\.stopLiveListening[\s\S]*copy\.unmuteMic/);
  assert.match(dock, /copy\.liveListeningActive/);
  assert.match(dock, /copy\.liveListeningScope/);
  assert.doesNotMatch(dock, /animate-pulse/);
  assert.doesNotMatch(dock, /border-red-500/);
  assert.match(dock, /cbai-voice-dock-btn-live/);
  assert.match(readSource("app/globals.css"), /\.cbai-voice-dock-btn-live[\s\S]*--cbai-accent-primary/);

  const micIconTernary = dock.match(/\{vo\.micLive \?\s*\([\s\S]*?\)\s*:\s*\([\s\S]*?\)\s*\}/);
  assert.ok(micIconTernary, "mic icon ternary");
  const [, activeIcon, inactiveIcon] =
    micIconTernary![0].match(/vo\.micLive \?\s*\(([\s\S]*?)\)\s*:\s*\(([\s\S]*?)\)\s*\}/) ?? [];
  assert.ok(activeIcon && inactiveIcon, "mic icon branches");
  assert.doesNotMatch(activeIcon, /M4\.5 4\.5l15 15/, "active listening shows unslashed microphone");
  assert.match(inactiveIcon, /M4\.5 4\.5l15 15/, "inactive ready shows slashed microphone");
});

test("streamHasLiveTracks and captureResourcesAreLive mirror MediaStreamTrack.readyState", () => {
  const live = new MockTrack();
  const ended = new MockTrack();
  ended.stop();
  const stream = new MockStream([live]) as unknown as MediaStream;
  assert.equal(streamHasLiveTracks(stream), true);
  assert.equal(captureResourcesAreLive({ localStream: stream }), true);
  stopMediaStreamTracks(stream);
  assert.equal(streamHasLiveTracks(stream), false);
  assert.equal(captureResourcesAreLive({ localStream: stream, speechRecognitionActive: true }), true);
  assert.equal(captureResourcesAreLive({ localStream: new MockStream([ended]) as unknown as MediaStream }), false);
});

test("mock realtime provider hasLiveCaptureResources clears on disconnect", async () => {
  const provider = createMockRealtimeProvider();
  assert.equal(provider.hasLiveCaptureResources(), false);
  await provider.connect(
    {
      clientSecret: "ek_test",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      sessionId: "sess",
      model: "gpt-realtime",
    },
    "en",
  );
  assert.equal(provider.hasLiveCaptureResources(), true);
  provider.disconnect();
  assert.equal(provider.hasLiveCaptureResources(), false);
});

test("broker credential request respects AbortSignal", async () => {
  let calls = 0;
  setMockSessionBrokerHandler(() => {
    calls += 1;
    return {
      ok: true,
      credential: {
        clientSecret: "ek_test",
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        sessionId: "sess",
        model: "gpt-realtime",
      },
    };
  });
  const controller = new AbortController();
  controller.abort();
  const res = await requestRealtimeSessionCredential(
    { language: "en", origin: "http://localhost:3000" },
    { signal: controller.signal },
  );
  assert.equal(res.ok, false);
  if (!res.ok) assert.match(res.message, /abort/i);
  assert.equal(calls, 0);
  setMockSessionBrokerHandler(null);
});

test("SpeechRecognitionSession.stop aborts recognition", () => {
  let aborted = false;
  let stopped = false;
  const Recognition = function (this: {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onstart: null;
    onresult: null;
    onerror: null;
    onend: null;
    start: () => void;
    stop: () => void;
    abort: () => void;
  }) {
    this.lang = "";
    this.interimResults = false;
    this.maxAlternatives = 1;
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.start = () => {};
    this.stop = () => {
      stopped = true;
    };
    this.abort = () => {
      aborted = true;
    };
  } as unknown as new () => SpeechRecognition;
  (globalThis as { window?: unknown }).window = {
    SpeechRecognition: Recognition,
  };
  const session = new SpeechRecognitionSession();
  assert.equal(session.start("en-US"), true);
  session.stop();
  assert.equal(aborted, true);
  assert.equal(stopped, false);
  delete (globalThis as { window?: unknown }).window;
});

test("micLive stays true while Realtime capture is active across orchestration dock states", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /captureActive/);
  assert.match(provider, /setCaptureActive\(true\)/);
  assert.match(provider, /setCaptureActive\(false\)/);
  assert.match(provider, /hasLiveCaptureResources/);
  assert.match(provider, /pagehide/);
  assert.match(provider, /beforeunload/);
  // Browser fallback must not claim capture until SpeechRecognition actually starts.
  assert.match(provider, /const started = startBrowserSpeechSession\(/);
  assert.match(provider, /if \(!started\) \{\s*setCaptureActive\(false\);/);
});

test("SpeechRecognition teardown prefers abort for prompt mic release", () => {
  const session = readSource("lib/voice/speech-recognition-session.ts");
  assert.match(session, /abort\?: \(\) => void/);
  assert.match(session, /recognition\.abort\(\)/);
  assert.match(session, /event\.error === "aborted"/);
});

test("late broker connect cannot apply after capture cancelled", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /createLiveCaptureGate/);
  assert.match(provider, /if \(!gate\.isCurrent\(\)\) return/);
  assert.match(provider, /provider\.disconnect\(\)/);
  assert.match(provider, /brokerAbortRef/);
  assert.match(provider, /beginBrokerRequest/);
});

test("route change tears down live capture but preserves transcript memory", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /usePathname\(\)/);
  assert.match(provider, /pathnameForTeardownRef/);
  assert.match(provider, /Privacy P0: SPA route changes must release the mic/);
  assert.match(
    provider,
    /useEffect\(\(\) => \{[\s\S]*pathnameForTeardownRef\.current === pathname[\s\S]*releaseLiveAudioResources\(\)[\s\S]*\}\s*,\s*\[pathname, releaseLiveAudioResources\]\)/,
  );
  // Route teardown must not clear transcript/session memory.
  const routeEffect = provider.match(
    /Privacy P0: SPA route changes[\s\S]*?\}, \[pathname, releaseLiveAudioResources\]\);/,
  );
  assert.ok(routeEffect);
  assert.doesNotMatch(routeEffect![0], /clearVoiceSessionMemory/);
  assert.match(provider, /brokerAbortRef\.current\?\.abort\(\)/);
  assert.match(provider, /sessionRef\.current\?\.stop\(\)/);
  assert.match(provider, /realtimeProviderRef\.current\?\.disconnect\(\)/);
  assert.match(provider, /setCaptureActive\(false\)/);
});

test("Close Stop End and unmount still release live audio resources", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  const closeDockMatch = provider.match(/const closeDock = useCallback\(\(\) => \{([\s\S]*?)\}, \[releaseLiveAudioResources\]\)/);
  assert.ok(closeDockMatch);
  assert.match(closeDockMatch![1], /releaseLiveAudioResources\(\)/);
  assert.match(provider, /const stopListening = useCallback\(\(\) => \{[\s\S]*stopLiveAudioCapture\(\)/);
  assert.match(provider, /const endSession = useCallback\(\(\) => \{[\s\S]*stopLiveAudioCapture\(\)/);
  assert.match(provider, /clearVoiceSessionMemory\(\)/);
  assert.match(provider, /pagehide/);
  assert.match(provider, /beforeunload/);
  // Idempotent release: generation bump + disconnect on every release path.
  assert.match(provider, /liveCaptureGenerationRef\.current \+= 1/);
});

test("identity intro phrases for UZ/EN/RU/TR", () => {
  assert.equal(getVoiceOperatorIntroPhrase("uz"), VOICE_OPERATOR_INTRO_PHRASES.uz);
  assert.equal(getVoiceOperatorIntroPhrase("en"), VOICE_OPERATOR_INTRO_PHRASES.en);
  assert.equal(getVoiceOperatorIntroPhrase("ru"), VOICE_OPERATOR_INTRO_PHRASES.ru);
  assert.equal(getVoiceOperatorIntroPhrase("tr"), VOICE_OPERATOR_INTRO_PHRASES.tr);
  const uz = buildVoiceOperatorInstructions("uz");
  assert.match(uz, /Men sun'iy intellektman/);
  assert.match(uz, /Never claim to be human/i);
  assert.match(uz, /Botir Choriev/);
});
