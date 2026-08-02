import assert from "node:assert/strict";
import test from "node:test";
import { extractLiveProcessItems } from "@/lib/agentic-workspace/live-process-visualization";

test("spoken process becomes ordered visible items", () => {
  const items = extractLiveProcessItems("First collect the VIN. Then create the work order. Which location should we use?");
  assert.equal(items.length, 3);
  assert.equal(items[0].kind, "step");
  assert.equal(items[2].kind, "question");
});

test("missing and required statements stay visually cautioned", () => {
  const items = extractLiveProcessItems("Business location is missing. Human confirmation is required.");
  assert.deepEqual(items.map((item) => item.kind), ["caution", "caution"]);
});
