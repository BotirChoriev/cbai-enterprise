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
  createLiveCaptureGate,
  isLiveMicDockState,
  stopMediaStreamTracks,
} from "@/lib/voice-operator/voice-session-lifecycle";

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

test("mic toggle UI: active unslashed red mic stops capture; inactive slashed mic starts", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /const stopListening = useCallback\(\(\) => \{[\s\S]*stopLiveAudioCapture\(\)/);
  assert.match(provider, /startListening/);

  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /vo\.micLive \? vo\.stopListening\(\) : vo\.startListening\(\)/);
  assert.match(dock, /vo\.micLive \? copy\.muteMic : copy\.unmuteMic/);
  assert.match(dock, /border-red-500/);
  assert.match(dock, /border-zinc-700/);

  const micIconTernary = dock.match(/\{vo\.micLive \?\s*\([\s\S]*?\)\s*:\s*\([\s\S]*?\)\s*\}/);
  assert.ok(micIconTernary, "mic icon ternary");
  const [, activeIcon, inactiveIcon] =
    micIconTernary![0].match(/vo\.micLive \?\s*\(([\s\S]*?)\)\s*:\s*\(([\s\S]*?)\)\s*\}/) ?? [];
  assert.ok(activeIcon && inactiveIcon, "mic icon branches");
  assert.doesNotMatch(activeIcon, /M4\.5 4\.5l15 15/, "active listening shows unslashed microphone");
  assert.match(inactiveIcon, /M4\.5 4\.5l15 15/, "inactive ready shows slashed microphone");
});

test("late broker connect cannot apply after capture cancelled", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /createLiveCaptureGate/);
  assert.match(provider, /if \(!gate\.isCurrent\(\)\) return/);
  assert.match(provider, /provider\.disconnect\(\)/);
});

test("route change stops live capture", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /usePathname\(\)/);
  assert.match(provider, /\[pathname, releaseLiveAudioResources\]/);
});

test("identity intro phrases for UZ/EN/RU/TR", () => {
  assert.equal(
    getVoiceOperatorIntroPhrase("uz"),
    "Men CBAI Ovoz Operatoriman. Sizga tadqiqot, dalillar va platformadagi ishlaringiz bo'yicha yordam beraman.",
  );
  assert.equal(getVoiceOperatorIntroPhrase("en"), VOICE_OPERATOR_INTRO_PHRASES.en);
  assert.equal(getVoiceOperatorIntroPhrase("ru"), VOICE_OPERATOR_INTRO_PHRASES.ru);
  assert.equal(getVoiceOperatorIntroPhrase("tr"), VOICE_OPERATOR_INTRO_PHRASES.tr);
  const uz = buildVoiceOperatorInstructions("uz");
  assert.match(uz, /Men sun'iy intellektman/);
  assert.match(uz, /Never claim to be human/i);
});
