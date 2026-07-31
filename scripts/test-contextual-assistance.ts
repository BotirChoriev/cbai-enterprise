import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deriveContextualAssistance,
  inferContextualDomain,
} from "@/lib/intelligence-os/contextual-assistance";

test("research material calls algorithm, cybernetics, and AI without taking a decision", () => {
  const result = deriveContextualAssistance({
    text: "My biology PhD experiment conflicts with the published molecular method",
    fileName: "living-molecules-phd.pdf",
    fileType: "application/pdf",
  });

  assert.equal(result.domain, "research");
  assert.deepEqual(result.suggestedEngines, ["algorithm", "cybernetics", "ai"]);
  assert.match(result.intent, /objective/i);
  assert.ok(result.evidenceGaps.length > 0);
  assert.ok(result.options.length > 0);
  assert.equal(JSON.stringify(result).toLowerCase().includes("best decision"), false);
});
test("feedback engine stays contextual when no monitoring signal exists", () => {
  const result = deriveContextualAssistance({
    text: "Help me structure a general goal",
  });

  assert.deepEqual(result.suggestedEngines, ["algorithm", "ai"]);
});

test("domain inference supports practical work contexts", () => {
  assert.equal(inferContextualDomain("motor diagnostic and repair"), "engineering");
  assert.equal(inferContextualDomain("o‘simlik kasalligini rasm orqali tekshirish"), "agriculture");
  assert.equal(inferContextualDomain("company market strategy"), "business");
});
