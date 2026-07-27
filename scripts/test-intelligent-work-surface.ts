import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  detectWorkContext,
  toolsForWorkContext,
} from "@/lib/intelligent-work-surface/context";

test("chemistry material reveals domain-specific support tools", () => {
  assert.equal(detectWorkContext("kimyo bo‘yicha PhD nazariyasi.pdf"), "chemistry");
  const ids = toolsForWorkContext("chemistry").map((tool) => tool.id);
  for (const id of ["chemical-graph", "universities", "research", "evidence", "scenarios", "collaboration"]) {
    assert.ok(ids.includes(id), id);
  }
});

test("research and general contexts stay progressive", () => {
  assert.equal(detectWorkContext("doctoral thesis.pdf"), "research");
  assert.equal(detectWorkContext("notes.pdf"), "general");
  assert.ok(!toolsForWorkContext("general").some((tool) => tool.id === "chemical-graph"));
});

test("surface uses validated PDF intake and existing canonical routes", () => {
  const source = readFileSync("components/intelligent-work-surface/IntelligentWorkSurface.tsx", "utf8");
  assert.match(source, /validateDocumentUploadCandidate/);
  assert.match(source, /useVoiceOperator/);
  assert.match(source, /data-cbai-intelligent-work-surface/);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
});

test("graph opens the shared intelligent work surface", () => {
  const source = readFileSync("components/graph/GraphPageClient.tsx", "utf8");
  assert.match(source, /<IntelligentWorkSurface \/>/);
});
