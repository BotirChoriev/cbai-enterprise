/**
 * Microphone access mapping — getUserMedia errors must not conflate with SpeechRecognition.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mapGetUserMediaError,
  mapSpeechRecognitionError,
} from "@/lib/voice-operator/microphone-access";

test("NotAllowedError maps to denied", () => {
  assert.equal(mapGetUserMediaError(new DOMException("denied", "NotAllowedError")), "denied");
});

test("SecurityError maps to denied", () => {
  assert.equal(mapGetUserMediaError(new DOMException("insecure", "SecurityError")), "denied");
});

test("NotFoundError maps to no_device", () => {
  assert.equal(mapGetUserMediaError(new DOMException("none", "NotFoundError")), "no_device");
});

test("NotReadableError maps to device_busy", () => {
  assert.equal(mapGetUserMediaError(new DOMException("busy", "NotReadableError")), "device_busy");
});

test("AbortError maps to dismissed", () => {
  assert.equal(mapGetUserMediaError(new DOMException("abort", "AbortError")), "dismissed");
});

test("SpeechRecognition not-allowed maps to speech_unavailable not denied", () => {
  assert.equal(mapSpeechRecognitionError("not-allowed"), "speech_unavailable");
  assert.equal(mapSpeechRecognitionError("service-not-allowed"), "speech_unavailable");
});

test("SpeechRecognition network maps to network_disconnected", () => {
  assert.equal(mapSpeechRecognitionError("network"), "network_disconnected");
});
