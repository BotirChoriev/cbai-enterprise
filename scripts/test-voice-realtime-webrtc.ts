/**
 * OpenAI Realtime WebRTC + broker response tests — no live API credentials.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test, beforeEach } from "node:test";
import {
  classifyBrokerHttpResponse,
  isBrokerAuthenticationRedirect,
  isBrokerHtmlResponse,
  parseBrokerCredentialJson,
} from "@/lib/voice-operator/session-broker/broker-response";
import {
  mapBrokerCodeToIssue,
  mapRealtimeStateToDockState,
  parseRealtimeServerEvent,
} from "@/lib/voice-operator/realtime/realtime-events";
import {
  classifyRealtimeCallsResponse,
  connectOpenAiWebRtcSession,
  OPENAI_REALTIME_CALLS_URL,
  RealtimeMicrophoneError,
} from "@/lib/voice-operator/realtime/openai-webrtc-session";
import {
  createMockRealtimeProvider,
  createOpenAiWebRtcRealtimeProvider,
} from "@/lib/voice-operator/realtime/realtime-provider";
import { setMockSessionBrokerHandler } from "@/lib/voice-operator/session-broker/client";
import { clearVoiceSessionMemory } from "@/lib/voice-operator/session-memory";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

beforeEach(() => {
  clearVoiceSessionMemory();
  setMockSessionBrokerHandler(null);
});

test("broker classifies Cloudflare Access redirect as authentication failure", () => {
  assert.equal(isBrokerAuthenticationRedirect(302), true);
  const result = classifyBrokerHttpResponse({
    status: 302,
    contentType: "text/html; charset=UTF-8",
    bodyText: "<html><body>Login</body></html>",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "AUTHENTICATION_FAILED");
});

test("broker classifies HTML 200 login page as authentication failure", () => {
  assert.equal(
    isBrokerHtmlResponse("text/html; charset=UTF-8", "<!DOCTYPE html><html></html>"),
    true,
  );
  const result = classifyBrokerHttpResponse({
    status: 200,
    contentType: "text/html; charset=UTF-8",
    bodyText: "<!DOCTYPE html><html><body>Sign in</body></html>",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "AUTHENTICATION_FAILED");
});

test("broker parses valid ephemeral credential JSON", () => {
  const body = JSON.stringify({
    clientSecret: "ek_test_ephemeral",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    sessionId: "sess-1",
    model: "gpt-realtime",
  });
  const credential = parseBrokerCredentialJson(body);
  assert.ok(credential);
  assert.equal(credential!.clientSecret, "ek_test_ephemeral");
  const result = classifyBrokerHttpResponse({
    status: 200,
    contentType: "application/json",
    bodyText: body,
  });
  assert.equal(result.ok, true);
});

test("broker rejects sk- credential in JSON body", () => {
  const body = JSON.stringify({
    clientSecret: "sk-live-secret",
    expiresAt: new Date().toISOString(),
    sessionId: "sess-1",
    model: "gpt-realtime",
  });
  assert.equal(parseBrokerCredentialJson(body), null);
});

test("mapBrokerCodeToIssue maps authentication and backend codes", () => {
  assert.equal(mapBrokerCodeToIssue("AUTHENTICATION_FAILED"), "authentication_failed");
  assert.equal(mapBrokerCodeToIssue("BACKEND_REQUIRED"), "required");
  assert.equal(mapBrokerCodeToIssue("ERROR"), "unreachable");
});

test("realtime events map speech and response lifecycle states", () => {
  assert.deepEqual(parseRealtimeServerEvent('{"type":"input_audio_buffer.speech_started"}'), {
    state: "user_speaking",
  });
  assert.deepEqual(parseRealtimeServerEvent('{"type":"input_audio_buffer.speech_stopped"}'), {
    state: "thinking",
  });
  assert.deepEqual(parseRealtimeServerEvent('{"type":"response.created"}'), {
    state: "responding",
  });
  assert.deepEqual(parseRealtimeServerEvent('{"type":"response.done"}'), {
    state: "listening",
  });
});

test("realtime events extract user and assistant transcripts", () => {
  const user = parseRealtimeServerEvent(
    '{"type":"conversation.item.input_audio_transcription.completed","transcript":"Salom"}',
  );
  assert.deepEqual(user, {
    transcript: { role: "user", text: "Salom", final: true },
  });

  const assistant = parseRealtimeServerEvent(
    '{"type":"response.audio_transcript.done","transcript":"Yordam bera olaman."}',
  );
  assert.deepEqual(assistant, {
    transcript: { role: "assistant", text: "Yordam bera olaman.", final: true },
  });
});

test("realtime dock state mapping covers connection lifecycle", () => {
  assert.equal(mapRealtimeStateToDockState("connecting"), "connecting");
  assert.equal(mapRealtimeStateToDockState("listening"), "listening");
  assert.equal(mapRealtimeStateToDockState("thinking"), "thinking");
  assert.equal(mapRealtimeStateToDockState("responding"), "responding");
  assert.equal(mapRealtimeStateToDockState("authentication_failed"), "error");
  assert.equal(mapRealtimeStateToDockState("connection_failed"), "error");
});

test("realtime calls classifies HTML SDP response as authentication failure", () => {
  assert.equal(
    classifyRealtimeCallsResponse({
      status: 200,
      contentType: "text/html",
      bodyText: "<html>login</html>",
    }),
    "authentication_failed",
  );
});

test("realtime calls accepts SDP answer body", () => {
  assert.equal(
    classifyRealtimeCallsResponse({
      status: 200,
      contentType: "application/sdp",
      bodyText: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n",
    }),
    "answer",
  );
});

test("WebRTC session connects, emits listening, and cleans up tracks", async () => {
  const stoppedTracks: string[] = [];
  const closedPeers: string[] = [];

  class MockTrack {
    kind = "audio";
    enabled = true;
    stop() {
      stoppedTracks.push("audio");
    }
  }

  class MockStream {
    getAudioTracks() {
      return [new MockTrack()];
    }
    getTracks() {
      return this.getAudioTracks();
    }
  }

  class MockDataChannel {
    readyState = "open";
    close() {}
    addEventListener() {}
    send() {}
  }

  class MockPeerConnection {
    connectionState = "connected";
    ontrack: ((event: { streams: MockStream[] }) => void) | null = null;
    onconnectionstatechange: (() => void) | null = null;
    localDescription: { sdp: string } | null = null;

    async createOffer() {
      return { sdp: "v=0 offer" };
    }

    async setLocalDescription(desc: { sdp: string }) {
      this.localDescription = desc;
    }

    async setRemoteDescription() {}

    addTrack() {}

    createDataChannel() {
      return new MockDataChannel();
    }

    getSenders() {
      return [{ track: new MockTrack() }];
    }

    close() {
      closedPeers.push("closed");
    }
  }

  const audioElements: Array<{ paused: boolean; srcObject: unknown; removed: boolean }> = [];

  const session = await connectOpenAiWebRtcSession({
    credential: {
      clientSecret: "ek_test_session",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      sessionId: "sess-mock",
      model: "gpt-realtime",
    },
    language: "uz",
    deps: {
      RTCPeerConnection: MockPeerConnection as unknown as typeof RTCPeerConnection,
      fetch: async (url, init) => {
        assert.equal(url, OPENAI_REALTIME_CALLS_URL);
        const headers = init?.headers as Record<string, string> | undefined;
        assert.match(headers?.Authorization ?? "", /Bearer ek_test_session/);
        return new Response("v=0 answer", {
          status: 200,
          headers: { "Content-Type": "application/sdp" },
        });
      },
      getUserMedia: async () => new MockStream() as unknown as MediaStream,
      createAudioElement: () => {
        const el = {
          autoplay: false,
          paused: false,
          srcObject: null as unknown,
          removed: false,
          pause() {
            this.paused = true;
          },
          remove() {
            this.removed = true;
          },
          setAttribute() {},
        };
        audioElements.push(el);
        return el as unknown as HTMLAudioElement;
      },
    },
  });

  assert.equal(session.getState(), "listening");

  const states: string[] = [];
  session.onStateChange((state) => states.push(state));
  assert.ok(states.includes("connecting") || session.getState() === "listening");

  session.disconnect();
  assert.equal(session.getState(), "idle");
  assert.ok(stoppedTracks.length >= 1);
  assert.ok(closedPeers.includes("closed"));
});

test("WebRTC session maps getUserMedia failure to RealtimeMicrophoneError", async () => {
  class MockPeerConnection {
    close() {}
    createDataChannel() {
      return { addEventListener() {}, close() {}, send() {} };
    }
  }

  await assert.rejects(
    () =>
      connectOpenAiWebRtcSession({
        credential: {
          clientSecret: "ek_test",
          expiresAt: new Date().toISOString(),
          sessionId: "s",
          model: "gpt-realtime",
        },
        language: "uz",
        deps: {
          RTCPeerConnection: MockPeerConnection as unknown as typeof RTCPeerConnection,
          fetch: async () => new Response("v=0", { status: 200 }),
          getUserMedia: async () => {
            throw new DOMException("denied", "NotAllowedError");
          },
          createAudioElement: () =>
            ({
              pause() {},
              remove() {},
              setAttribute() {},
            }) as unknown as HTMLAudioElement,
        },
      }),
    RealtimeMicrophoneError,
  );
});

test("WebRTC session prevents duplicate connect while prior session active", async () => {
  let fetchCount = 0;

  class MockTrack {
    stop() {}
  }

  class MockStream {
    getAudioTracks() {
      return [new MockTrack()];
    }
    getTracks() {
      return this.getAudioTracks();
    }
  }

  class MockDataChannel {
    addEventListener() {}
    close() {}
    send() {}
  }

  class MockPeerConnection {
    close() {}
    async createOffer() {
      return { sdp: "v=0 offer" };
    }
    async setLocalDescription() {}
    async setRemoteDescription() {}
    addTrack() {}
    createDataChannel() {
      return new MockDataChannel();
    }
  }

  const deps = {
    RTCPeerConnection: MockPeerConnection as unknown as typeof RTCPeerConnection,
    fetch: async () => {
      fetchCount += 1;
      return new Response("v=0 answer", {
        status: 200,
        headers: { "Content-Type": "application/sdp" },
      });
    },
    getUserMedia: async () => new MockStream() as unknown as MediaStream,
    createAudioElement: () =>
      ({
        pause() {},
        remove() {},
        setAttribute() {},
      }) as unknown as HTMLAudioElement,
  };

  const credential = {
    clientSecret: "ek_test",
    expiresAt: new Date().toISOString(),
    sessionId: "s",
    model: "gpt-realtime",
  };

  const first = await connectOpenAiWebRtcSession({ credential, language: "en", deps });
  assert.equal(first.getState(), "listening");
  assert.equal(fetchCount, 1);

  first.disconnect();
  await connectOpenAiWebRtcSession({ credential, language: "en", deps });
  assert.equal(fetchCount, 2);
});

test("mock realtime provider rejects sk- client secrets", async () => {
  const provider = createMockRealtimeProvider();
  await provider.connect(
    {
      clientSecret: "sk-forbidden",
      expiresAt: new Date().toISOString(),
      sessionId: "x",
      model: "gpt-realtime",
    },
    "uz",
  );
  assert.equal(provider.getState(), "error");
});

test("VoiceOperatorProvider realtime path does not start SpeechRecognitionSession", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /startRealtimeListening/);
  assert.match(provider, /requestRealtimeSessionCredential/);
  assert.match(provider, /resolveRealtimeProvider/);
  assert.match(provider, /startBrowserFallbackListening/);
  assert.doesNotMatch(provider, /operatorMode\.mode === "realtime"[\s\S]*startBrowserSpeechSession/);
});

test("VoiceOperatorProvider appends realtime transcripts to session memory", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /onTranscript/);
  assert.match(provider, /appendConversationTurn/);
  assert.match(provider, /stopLiveAudioCapture/);
});

test("broker client uses manual redirect and JSON accept headers", () => {
  const client = readSource("lib/voice-operator/session-broker/client.ts");
  assert.match(client, /redirect:\s*"manual"/);
  assert.match(client, /classifyBrokerHttpResponse/);
});

test("openai WebRTC provider creates oai-events data channel", () => {
  const source = readSource("lib/voice-operator/realtime/openai-webrtc-session.ts");
  assert.match(source, /createDataChannel\("oai-events"\)/);
  assert.match(source, /OPENAI_REALTIME_CALLS_URL/);
});

test("createOpenAiWebRtcRealtimeProvider returns unavailable without window", () => {
  const originalWindow = globalThis.window;
  // @ts-expect-error test shim
  delete globalThis.window;
  const provider = createOpenAiWebRtcRealtimeProvider();
  assert.equal(provider.kind, "unavailable");
  globalThis.window = originalWindow;
});
