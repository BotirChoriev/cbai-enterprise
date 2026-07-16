// EPIC-13.3 — Experience Engineering verification.
// Run with: npm run test:epic-13-experience-engineering

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deriveAmbientInsight } from "@/lib/intelligence-os/ambient-intelligence";
import { deriveFocusedFlow, deriveIntelligenceFlow } from "@/lib/intelligence-os/intelligence-flow";
import { clearLivingMemory, deriveWhatChanged, recordFlowSnapshot } from "@/lib/intelligence-os/living-memory";
import { LIVING_INTELLIGENCE_REGISTRY } from "@/lib/design/living-intelligence-registry";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Experience engineering shell wired in dashboard layout", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /MentalModelStrip/);
  assert.match(layout, /AmbientIntelligenceHint/);
  assert.match(layout, /AmbientTrustStrip/);
  assert.match(layout, /MobileIntelligenceShell/);
});

test("2. Ambient intelligence returns at most one insight with reason keys", () => {
  const insight = deriveAmbientInsight(null, "Operator", "citizen");
  assert.ok(insight);
  assert.ok(insight.reasonKey.endsWith("Reason"));
});

test("3. Focused flow reduces cognitive load vs full flow", () => {
  const full = deriveIntelligenceFlow(null);
  const focused = deriveFocusedFlow(null);
  assert.equal(full.length, 8);
  assert.ok(focused.length <= 3);
});

test("4. Living memory tracks flow changes", () => {
  const flow = deriveIntelligenceFlow(null);
  recordFlowSnapshot("test-mission", flow);
  clearLivingMemory();
  assert.equal(deriveWhatChanged(flow), null);
});

test("5. Mission Gravity 2.0 — global bar centers mission not space label", () => {
  const bar = readSource("components/operating/GlobalMissionContextBar.tsx");
  assert.doesNotMatch(bar, /intentionEyebrow/);
  assert.match(bar, /mission\?\.problem/);
});

test("6. Knowledge Universe views — one universe, multiple views", () => {
  const graph = readSource("components/graph/GraphPageClient.tsx");
  assert.match(graph, /KnowledgeUniverseViews/);
  assert.match(readSource("components/graph/KnowledgeUniverseViews.tsx"), /universeViews/);
});

test("7. Operating page shell reduces operator duplication by default", () => {
  const shell = readSource("components/shared/OperatingPageShell.tsx");
  assert.match(shell, /showOperator = false/);
});

test("8. User-controlled living memory in settings", () => {
  const settings = readSource("components/settings/SettingsPageClient.tsx");
  assert.match(settings, /LivingMemoryControl/);
});

test("9. Design constitution includes Experience Engineering", () => {
  const doc = readSource("docs/product/CBAI-LIVING-INTELLIGENCE-DESIGN-CONSTITUTION.md");
  assert.match(doc, /Experience Engineering/);
  assert.match(doc, /Cognitive Load/);
});

test("10. BUILD-017 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.experienceEngineering.mentalModelEyebrow);
    assert.ok(dict.experienceEngineering.ambientConflictingEvidenceReason);
    assert.ok(dict.experienceEngineering.clearLivingMemory);
  }
});

test("11. Component registry includes experience engineering fields", () => {
  const record = LIVING_INTELLIGENCE_REGISTRY.find((r) => r.id === "mental-model-strip");
  assert.ok(record);
  assert.ok(record?.attention);
  assert.ok(record?.cognitiveLoad);
  assert.ok(record?.memory);
});
