// BUILD-013 — Intelligence Canvas Phase 1 tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deriveOperatorInterventions } from "@/lib/intelligence-os/operator-awareness";
import { deriveNavLiveState } from "@/lib/intelligence-os/nav-live-state";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Intelligence Canvas replaces stacked card homepage", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /CanvasOperatingObject/);
  assert.match(canvas, /cbai-intelligence-canvas/);
  assert.doesNotMatch(canvas, /IntelligenceLensesGrid/);
  assert.doesNotMatch(canvas, /HomeIntelligenceGlobe/);
});

test("2. Operating navigation has live state indicators", () => {
  const sidebar = readSource("components/layout/Sidebar.tsx");
  assert.match(sidebar, /OperatingNavigationPanel/);
  assert.equal(deriveNavLiveState("/", "/"), "active");
});

test("3. Operator awareness derives honest interventions without mission", () => {
  const items = deriveOperatorInterventions();
  assert.ok(Array.isArray(items));
});

test("4. Context layer and mission timeline wired", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /CanvasContextLayer/);
  assert.match(canvas, /CanvasMissionTimeline/);
  assert.match(canvas, /MissionDnaStrip/);
});

test("5. BUILD-013 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.intelligenceCanvas.eyebrow);
    assert.ok(dict.operatorAwareness.needIndependentSources);
    assert.ok(dict.operatingNav.liveAttention);
    assert.ok(dict.intelligenceCanvas.knowledgeUniverse);
  }
});

test("6. PlatformHome renders Intelligence Canvas", () => {
  const home = readSource("components/platform/PlatformHome.tsx");
  assert.match(home, /IntelligenceCanvas/);
});

test("7. Graph uses Knowledge Universe framing", () => {
  const graph = readSource("components/graph/GraphPageClient.tsx");
  assert.match(graph, /intelligenceCanvas\.knowledgeUniverse/);
});
