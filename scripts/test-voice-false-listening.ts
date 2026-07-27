/**
 * Voice Operator state-machine regressions — Listening vs broker failure.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  brokerIssueBlocksLiveListening,
  resolveCanonicalVoiceState,
  shouldShowLiveListeningBanner,
} from "@/lib/voice-operator/state-machine";
import {
  VOICE_OPERATOR_EN,
  VOICE_OPERATOR_RU,
  VOICE_OPERATOR_TR,
  VOICE_OPERATOR_UZ,
} from "@/lib/i18n/platform-copy-voice-operator";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("brokerIssue blocks Listening label even when micLive is stale", () => {
  assert.equal(brokerIssueBlocksLiveListening("unreachable"), true);
  assert.equal(brokerIssueBlocksLiveListening(null), false);

  const state = resolveCanonicalVoiceState({
    dockState: "listening",
    brokerIssue: "unreachable",
    permissionIssue: null,
    textUsable: true,
    micLive: true,
  });
  assert.equal(state, "text_fallback");
  assert.notEqual(state, "listening");
});

test("Live listening banner cannot render with brokerIssue", () => {
  assert.equal(
    shouldShowLiveListeningBanner({
      dockState: "listening",
      brokerIssue: "connection_failed",
      captureActive: true,
      micLive: true,
    }),
    false,
  );
  assert.equal(
    shouldShowLiveListeningBanner({
      dockState: "connecting",
      brokerIssue: null,
      captureActive: true,
      micLive: true,
    }),
    false,
  );
  assert.equal(
    shouldShowLiveListeningBanner({
      dockState: "listening",
      brokerIssue: null,
      captureActive: true,
      micLive: true,
    }),
    true,
  );
});

test("distinct broker issues map to distinct canonical states", () => {
  assert.equal(
    resolveCanonicalVoiceState({
      dockState: "error",
      brokerIssue: "invalid_api_key",
      permissionIssue: null,
      textUsable: true,
    }),
    "invalid_api_key",
  );
  assert.equal(
    resolveCanonicalVoiceState({
      dockState: "error",
      brokerIssue: "origin_blocked",
      permissionIssue: null,
      textUsable: true,
    }),
    "origin_blocked",
  );
  assert.equal(
    resolveCanonicalVoiceState({
      dockState: "error",
      brokerIssue: "quota_or_account_blocked",
      permissionIssue: null,
      textUsable: true,
    }),
    "quota_billing_unavailable",
  );
  assert.equal(
    resolveCanonicalVoiceState({
      dockState: "error",
      brokerIssue: "connection_failed",
      permissionIssue: null,
      textUsable: true,
    }),
    "webrtc_connection_failed",
  );
  assert.equal(
    resolveCanonicalVoiceState({
      dockState: "error",
      brokerIssue: "malformed_response",
      permissionIssue: null,
      textUsable: true,
    }),
    "malformed_broker_response",
  );
});

test("dock never shows Live listening active with broker notice", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /shouldShowLiveListeningBanner/);
  assert.match(dock, /showLiveListening/);
  assert.match(dock, /showBrokerError/);
});

test("EN/UZ/RU/TR voice operator broker notices have full parity", () => {
  const enKeys = Object.keys(VOICE_OPERATOR_EN).sort();
  assert.deepEqual(Object.keys(VOICE_OPERATOR_UZ).sort(), enKeys);
  assert.deepEqual(Object.keys(VOICE_OPERATOR_RU).sort(), enKeys);
  assert.deepEqual(Object.keys(VOICE_OPERATOR_TR).sort(), enKeys);
  assert.match(VOICE_OPERATOR_UZ.brokerConnectionFailedNotice, /Mikrofon to‘xtatildi|Mikrofon to'xtatildi/);
  assert.match(VOICE_OPERATOR_EN.brokerConnectionFailedNotice, /microphone was stopped/i);
  assert.ok(VOICE_OPERATOR_EN.brokerMalformedNotice);
  assert.ok(VOICE_OPERATOR_UZ.brokerMalformedNotice);
  assert.ok(VOICE_OPERATOR_RU.brokerRemoteAudioBlockedNotice);
  assert.ok(VOICE_OPERATOR_TR.brokerUnknownNotice);
});
