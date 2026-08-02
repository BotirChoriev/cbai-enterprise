import assert from "node:assert/strict";
import { test } from "node:test";
import { generateExecutionBlueprint } from "@/lib/human-centered-workspace/execution-blueprint";

test("confirmed process becomes an ordered executable dependency graph", () => {
  const blueprint = generateExecutionBlueprint({
    goal: "Operate a service business",
    processItems: ["Customer intake", "Work order", "Quality review"],
    originalRequest: "Build my service workflow",
    unresolvedInputs: ["Decision owner"],
    generatedAt: "2026-08-01T00:00:00.000Z",
  });
  assert.equal(blueprint.modules.length, 3);
  assert.equal(blueprint.modules[0]?.status, "ready");
  assert.deepEqual(blueprint.modules[0]?.dependsOn, []);
  assert.deepEqual(blueprint.modules[1]?.dependsOn, [blueprint.modules[0]?.moduleId]);
  assert.equal(blueprint.modules[2]?.humanConfirmationRequired, true);
  assert.deepEqual(blueprint.unresolvedInputs, ["Decision owner"]);
});

test("vendor integrations are never invented", () => {
  const none = generateExecutionBlueprint({
    goal: "Build operations",
    processItems: ["Intake"],
    originalRequest: "Create an operating plan",
    unresolvedInputs: [],
  });
  assert.deepEqual(none.integrations, []);

  const named = generateExecutionBlueprint({
    goal: "Build operations",
    processItems: ["Payments", "Deployment"],
    originalRequest: "Use Stripe and Supabase when approved",
    unresolvedInputs: [],
  });
  assert.deepEqual(named.integrations.map((item) => item.integrationId), ["stripe", "supabase"]);
  assert.ok(named.integrations.every((item) => item.state === "mentioned_unverified"));
});

test("duplicate process labels receive stable unique module identities", () => {
  const blueprint = generateExecutionBlueprint({
    goal: "Review twice",
    processItems: ["Review", "Review"],
    originalRequest: "Review twice",
    unresolvedInputs: [],
  });
  assert.deepEqual(blueprint.modules.map((item) => item.moduleId), ["review", "review-2"]);
});
