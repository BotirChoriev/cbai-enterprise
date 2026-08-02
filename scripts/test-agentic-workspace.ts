import assert from "node:assert/strict";
import test from "node:test";
import { answerAgentRunNextQuestion, createAgentRunFromConversation, isAgenticBuildRequest } from "@/lib/agentic-workspace/agent-run-store";

const memory = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    },
    dispatchEvent: () => true,
  },
});

test("complex service request creates a real, evidence-honest run", () => {
  const request = "Truck repair servis biznesimni call center, VIN, ustalar va stock bilan tizimlashtirish kerak";
  assert.equal(isAgenticBuildRequest(request), true);
  const run = createAgentRunFromConversation(request);
  assert.equal(run.domain, "business_operations");
  assert.equal(run.status, "waiting_for_input");
  assert.equal(run.assumptions.length, 0);
  assert.match(run.nextQuestion, /location/i);
  assert.ok(run.artifacts.some((artifact) => artifact.type === "process_map" && artifact.status === "draft"));
  assert.ok(run.steps.some((step) => step.status === "blocked"));
  assert.ok(run.steps.some((step) => step.requiresHumanConfirmation));
});

test("ordinary conversation is not hijacked", () => {
  assert.equal(isAgenticBuildRequest("Salom, qalaysiz?"), false);
});

test("Uzbek project card request opens the real agent workspace path", () => {
  assert.equal(
    isAgenticBuildRequest("Hammasini kelishib loyiha kartasini ochamiz va ichiga kiritamiz"),
    true,
  );
  const run = createAgentRunFromConversation("Muammoga yechim uchun loyiha kartasini ochamiz");
  assert.ok(run.id.startsWith("agent-run-"));
  assert.ok(run.artifacts.some((artifact) => artifact.type === "process_map"));
  assert.ok(run.missingInformation.length > 0);
});

test("mission and problem-solution language creates a visible co-creation draft", () => {
  const request = "Missiya haqida yo'nalish berib, muammoga yechim va ish rejasini birga yaratamiz";
  assert.equal(isAgenticBuildRequest(request), true);
  const run = createAgentRunFromConversation(request);
  assert.match(run.goal, /inson bilan birgalikda/i);
  assert.ok(run.artifacts[0]?.items.includes("Missiyani aniqlash"));
  assert.equal(run.assumptions.length, 0);
});

test("human answers advance exactly one missing item without inference", () => {
  const run = createAgentRunFromConversation("Servis biznesim uchun ish reja tuz");
  const firstMissing = run.missingInformation[0];
  const updated = answerAgentRunNextQuestion(run.id, "Toshkent");
  assert.ok(updated);
  assert.equal(updated!.missingInformation.length, run.missingInformation.length - 1);
  assert.match(updated!.knownFacts.at(-1) ?? "", new RegExp(firstMissing, "i"));
  assert.match(updated!.knownFacts.at(-1) ?? "", /Toshkent/);
});
