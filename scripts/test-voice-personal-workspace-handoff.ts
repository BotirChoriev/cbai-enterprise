import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { processConversationInput } from "@/lib/voice-operator/conversation-engine";
import { clearVoiceSessionMemory, readVoiceSessionMemory } from "@/lib/voice-operator/session-memory";
import { deviceLocalWorkspaceLifecycleRepository } from "@/lib/human-centered-workspace/device-local-workspace-lifecycle-repository";

class TestStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const storage = new TestStorage();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: storage,
    sessionStorage: storage,
    dispatchEvent: () => true,
  },
});

test("confirmed voice discovery creates and opens one checkpointed Personal Workspace", async () => {
  storage.clear();
  clearVoiceSessionMemory();
  const ctx = { sessionId: "voice-test", language: "uz", smartIdeaId: null } as const;
  const discovery = await processConversationInput(
    "Servis biznesim uchun ish reja va loyiha kartasini birga yarat",
    ctx,
  );
  assert.match(discovery.navigateHref ?? "", /^\/my-work\?agentRun=/);
  const pendingDraftId = readVoiceSessionMemory()?.pendingDraftId;
  assert.ok(pendingDraftId);

  for (const answer of ["Toshkent", "Hozircha Excel", "5 kishilik jamoa", "Kuniga 20 buyurtma", "3 oy, 20 ming dollar"]) {
    await processConversationInput(answer, ctx);
  }

  const confirmed = await processConversationInput("tasdiqlayman", ctx);
  assert.match(confirmed.navigateHref ?? "", /^\/workspace\?workspace=/);
  assert.match(confirmed.assistantText, /saqlandi; ekranda ochyapman/i);
  assert.equal(readVoiceSessionMemory()?.pendingDraftId, null);

  const url = new URL(confirmed.navigateHref!, "http://localhost");
  const workspaceId = url.searchParams.get("workspace");
  const runId = url.searchParams.get("run");
  assert.ok(workspaceId);
  assert.ok(runId);
  const workspace = deviceLocalWorkspaceLifecycleRepository.readWorkspace(workspaceId!);
  assert.equal(workspace?.workspaceId, workspaceId);
  assert.ok(workspace?.executionBlueprint?.modules.length);
  assert.deepEqual(workspace?.executionBlueprint?.integrations, []);
  assert.equal(deviceLocalWorkspaceLifecycleRepository.readRun(runId!)?.status, "completed");
});

test("provider routes pending human confirmation before generic command parsing", () => {
  const source = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  const pendingGate = source.indexOf("readVoiceSessionMemory()?.pendingDraftId");
  const genericResolver = source.indexOf("const orchestrated = executeVoiceCommand(");
  assert.ok(pendingGate > 0);
  assert.ok(genericResolver > pendingGate);
});

test("pending draft context stays in the Agent Run instead of falling into auth-gated mutations", async () => {
  storage.clear();
  clearVoiceSessionMemory();
  const ctx = { sessionId: "voice-context-test", language: "uz", smartIdeaId: null } as const;
  await processConversationInput("Servis biznesim uchun ish reja yarat", ctx);
  const response = await processConversationInput("Toshkent", ctx);
  assert.match(response.navigateHref ?? "", /^\/my-work\?agentRun=/);
  assert.match(response.assistantText, /Keyingi yetishmayotgan ma’lumot/i);
  assert.ok(readVoiceSessionMemory()?.pendingDraftId);
});

test("confirmation never creates a workspace while required context is still missing", async () => {
  storage.clear();
  clearVoiceSessionMemory();
  const ctx = { sessionId: "voice-early-confirmation", language: "uz", smartIdeaId: null } as const;
  await processConversationInput("Servis biznesim uchun ish reja yarat", ctx);
  const response = await processConversationInput("Tasdiqlayman", ctx);
  assert.match(response.navigateHref ?? "", /^\/my-work\?agentRun=/);
  assert.match(response.assistantText, /zarur ma’lumot ochiq/i);
  assert.ok(readVoiceSessionMemory()?.pendingDraftId);
});
