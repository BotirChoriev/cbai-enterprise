import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { MAX_ASSISTANT_RESPONSE_MS } from "@/lib/voice-operator/realtime/openai-webrtc-session";
import { buildVoiceOperatorInstructions } from "@/lib/voice-operator/instructions";

test("spoken response has an emergency guard without truncating normal narration", () => {
  assert.equal(MAX_ASSISTANT_RESPONSE_MS, 120_000);
  const source = readFileSync(new URL("../lib/voice-operator/realtime/openai-webrtc-session.ts", import.meta.url), "utf8");
  assert.match(source, /response\.cancel/);
  assert.match(source, /audioEl\?\.pause\(\)/);
});

test("operator instructions require spoken content to appear in the UI", () => {
  const instructions = buildVoiceOperatorInstructions("uz");
  assert.match(instructions, /every described process, plan, fact, unknown, and next question must also be represented in the visible UI workspace/i);
  assert.match(instructions, /distinguish proposals from verified facts/i);
});

test("provider consumes partial assistant transcripts for live visualization", () => {
  const provider = readFileSync(new URL("../components/voice-operator/VoiceOperatorProvider.tsx", import.meta.url), "utf8");
  assert.match(provider, /extractLiveProcessItems/);
  assert.match(provider, /if \(!event\.final\) return/);
  assert.match(provider, /appendNarrationToLatestAgentRun/);
});

test("agentic co-creation runs before the guest mutation auth gate", () => {
  const provider = readFileSync(new URL("../components/voice-operator/VoiceOperatorProvider.tsx", import.meta.url), "utf8");
  const agenticIndex = provider.indexOf("if (isAgenticBuildRequest(userText))");
  const commandIndex = provider.indexOf("const orchestrated = executeVoiceCommand", agenticIndex);
  assert.ok(agenticIndex > -1);
  assert.ok(commandIndex > agenticIndex);
  assert.match(provider.slice(agenticIndex, commandIndex), /processConversationInput/);
  assert.match(provider.slice(agenticIndex, commandIndex), /operatorRouter\.push/);
});
