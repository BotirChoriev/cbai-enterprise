/**
 * Digital Assistant mission intent + module routing smoke tests.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { detectMissionAssistantIntent } from "@/lib/voice-operator/mission-intent";
import { resolveUniversalIntent } from "@/lib/intelligence-os/universal-intent";
import { buildVoiceOperatorInstructions } from "@/lib/voice-operator/instructions";

test("analyze intent opens mission creation when no active mission", () => {
  const action = detectMissionAssistantIntent("Analyze renewable energy policy gaps in Central Asia", "en");
  assert.ok(action);
  assert.equal(action?.kind, "create");
  assert.equal(action?.href, "/?create=1");
  assert.ok((action?.problemSeed?.length ?? 0) > 8);
});

test("explicit continue mission intent targets my-work when no mission still creates", () => {
  const action = detectMissionAssistantIntent("continue mission", "en");
  assert.ok(action);
  assert.ok(action?.href === "/?create=1" || action?.href.startsWith("/my-work"));
});

test("module commands resolve for Research Evidence Countries Companies Universities Reports Trust", () => {
  const cases = [
    ["open research", "/research"],
    ["open evidence", "/knowledge"],
    ["countries", "/countries"],
    ["open companies", "/companies"],
    ["open universities", "/universities"],
    ["open reports", "/reports"],
    ["open trust", "/trust"],
    ["start a mission", "/?create=1"],
  ] as const;

  for (const [input, hrefPrefix] of cases) {
    const intent = resolveUniversalIntent(input);
    assert.ok(intent.command, `expected command for: ${input}`);
    assert.ok(
      intent.command?.href.startsWith(hrefPrefix) || intent.command?.href === hrefPrefix,
      `${input} → ${intent.command?.href} (expected ${hrefPrefix})`,
    );
  }
});

test("Realtime instructions identify Digital Assistant and modules", () => {
  const text = buildVoiceOperatorInstructions("en");
  assert.match(text, /Digital Assistant/);
  assert.match(text, /Research/);
  assert.match(text, /Evidence/);
  assert.match(text, /Mission/);
  assert.match(text, /Never say you are a configurable demo/i);
});
