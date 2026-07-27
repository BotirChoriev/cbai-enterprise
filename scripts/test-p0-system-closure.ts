/**
 * P0 system closure — focused regressions for voice broker origin,
 * search aliases, rooms honesty, and evidence escape chrome.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  evaluateVoiceBrokerStatus,
  resolveVoiceBrokerUrl,
  setVoiceBrokerEnvUrlForTests,
} from "@/lib/voice-operator/session-broker/client";
import { searchEntities } from "@/lib/global-search";
import { getLiveRoomTransportCapability } from "@/lib/live-intelligence-rooms/transport-adapter";
import { VOICE_OPERATOR_UZ, VOICE_OPERATOR_EN } from "@/lib/i18n/platform-copy-voice-operator";
import { LIVE_ROOMS_UZ } from "@/lib/i18n/platform-copy-live-rooms";
import { resolveVoiceCommandFromText } from "@/lib/voice-operator/commands/voice-command-resolver";

const PREVIEW = "https://preview-spatial-world-intell.cbai-enterprise.pages.dev";

test("Preview origin → same-origin /api/voice when env empty", () => {
  setVoiceBrokerEnvUrlForTests(null);
  assert.equal(resolveVoiceBrokerUrl(null, PREVIEW), `${PREVIEW}/api/voice`);
  const status = evaluateVoiceBrokerStatus(PREVIEW);
  assert.equal(status.kind, "available");
  setVoiceBrokerEnvUrlForTests(undefined);
});

test("Loopback env on Preview host is ignored in favor of same-origin", () => {
  assert.equal(
    resolveVoiceBrokerUrl("http://127.0.0.1:8788/api/voice", PREVIEW),
    `${PREVIEW}/api/voice`,
  );
});

test("Uzbek agrarian university search resolves registry entry", () => {
  const hits = searchEntities("toshkent davlat agrar universiteti");
  assert.ok(hits.length >= 1, "expected at least one hit");
  assert.ok(
    hits.some((h) => h.entity.id === "tsau" || /agrarian/i.test(h.entity.name)),
    hits.map((h) => h.entity.name).join(", "),
  );
});

test("rooms transport capability never exposes EXTERNAL_BLOCKED to UI labelKey path", () => {
  const cap = getLiveRoomTransportCapability();
  assert.equal(cap.available, false);
  assert.equal(cap.labelKey, "liveRooms.multipartyNotice");
  assert.doesNotMatch(cap.labelKey, /EXTERNAL_BLOCKED/);
  assert.doesNotMatch(LIVE_ROOMS_UZ.multipartyNotice, /EXTERNAL_BLOCKED/);
});

test("voice diagnostics copy has no EXTERNAL_BLOCKED for end users", () => {
  assert.doesNotMatch(VOICE_OPERATOR_EN.diagnosticsClassificationInvalidKey, /EXTERNAL_BLOCKED/);
  assert.doesNotMatch(VOICE_OPERATOR_UZ.diagnosticsClassificationInvalidKey, /EXTERNAL_BLOCKED/);
});

test("evidence workspace sheet includes Back/Close/Escape wiring", () => {
  const source = readFileSync("components/forward-deployed/EngineWorkspaceProvider.tsx", "utf8");
  assert.match(source, /backToEvidence/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /closeWorkspace/);
  assert.match(source, /role="dialog"/);
});

test("canonical UZ destinations do not fall to Home", () => {
  for (const [phrase, href] of [
    ["Shaxsiy kabinetimni och", "/my-work"],
    ["mening ishlarimni och", "/my-work"],
    ["tadqiqotni och", "/research"],
    ["dalillarni och", "/knowledge"],
    ["davlatlarni och", "/countries"],
  ] as const) {
    const res = resolveVoiceCommandFromText(phrase, "uz");
    assert.ok(res.action?.target.href, phrase);
    assert.ok(
      res.action?.target.href === href || res.action?.target.href?.startsWith(href.split("?")[0]!),
      `${phrase} → ${res.action?.target.href}`,
    );
    assert.notEqual(res.action?.target.href, "/");
  }
});

test("/knowledge documents Evidence alias", () => {
  const page = readFileSync("app/(dashboard)/knowledge/page.tsx", "utf8");
  assert.match(page, /redirect\("\/evidence"\)/);
  assert.match(page, /\/graph/);
  assert.match(page, /Evidence \(primary\)/);
});
