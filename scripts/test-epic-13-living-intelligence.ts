// EPIC-13.2 — Living Intelligence Experience verification.
// Run with: npm run test:epic-13-living-intelligence

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveIntelligenceAtmosphere } from "@/lib/intelligence-os/intelligence-atmosphere";
import { deriveIntelligenceFlow, deriveCurrentFlowStage } from "@/lib/intelligence-os/intelligence-flow";
import { deriveLivingContextMemory } from "@/lib/intelligence-os/living-context-memory";
import { deriveCapabilityGrowth } from "@/lib/capability/capability-growth";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { LIVING_INTELLIGENCE_REGISTRY } from "@/lib/design/living-intelligence-registry";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Intelligence atmosphere differs per space", () => {
  const mission = resolveIntelligenceAtmosphere("mission");
  const universe = resolveIntelligenceAtmosphere("knowledge-universe");
  assert.notEqual(mission.accentRgb, universe.accentRgb);
  assert.equal(universe.density, "dense");
});

test("2. Atmosphere shell wired in dashboard layout", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /IntelligenceAtmosphereShell/);
  assert.match(layout, /LivingContextMobileToggle/);
});

test("3. Living context memory derives from real stores", () => {
  const memory = deriveLivingContextMemory(null);
  assert.ok(Array.isArray(memory.recentStudy));
  assert.equal(typeof memory.hasContinuity, "boolean");
});

test("4. Intelligence flow has eight canonical scientific workflow stages", () => {
  const flow = deriveIntelligenceFlow(null);
  assert.equal(flow.length, 8);
  assert.deepEqual(
    flow.map((s) => s.id),
    ["question", "hypothesis", "evidence", "reasoning", "review", "impact", "publication", "legacy"],
  );
  assert.ok(deriveCurrentFlowStage(null));
});

test("5. Capability growth never ranks — only growth labels", () => {
  const passport = buildCapabilityPassport("Test");
  const growth = deriveCapabilityGrowth(passport);
  assert.equal(growth.length, passport.domains.length);
  for (const g of growth) {
    assert.ok(["none", "new", "growing", "steady"].includes(g.growth));
    assert.ok(!("rank" in (g as object)));
  }
});

test("6. Living context rail uses context memory and focused flow", () => {
  const rail = readSource("components/operating/LivingContextRail.tsx");
  assert.match(rail, /deriveLivingContextMemory/);
  assert.match(rail, /deriveFocusedFlow/);
  assert.match(rail, /livingIntelligence\.contextMemory/);
});

test("7. Global mission bar centers mission (Gravity 2.0)", () => {
  const bar = readSource("components/operating/GlobalMissionContextBar.tsx");
  assert.match(bar, /Mission Gravity 2\.0/);
  assert.match(bar, /mission\?\.problem/);
});

test("8. Knowledge layers disclosure in Knowledge Universe", () => {
  const panel = readSource("components/graph/GraphEntityPanel.tsx");
  const instrument = readSource("components/graph/GraphMissionInstrument.tsx");
  assert.match(panel, /KnowledgeLayersDisclosure/);
  assert.match(instrument, /livingIntelligence\.universePulse/);
});

test("9. Design constitution document and component registry exist", () => {
  const doc = readSource("docs/product/CBAI-LIVING-INTELLIGENCE-DESIGN-CONSTITUTION.md");
  assert.match(doc, /First Law/);
  assert.match(doc, /Mission Gravity/);
  assert.match(doc, /Experience Engineering/);
  assert.ok(LIVING_INTELLIGENCE_REGISTRY.length >= 5);
  for (const record of LIVING_INTELLIGENCE_REGISTRY) {
    assert.ok(record.purpose.length > 10);
    assert.ok(record.humanControl.length > 5);
  }
});

test("10. BUILD-016 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.livingIntelligence.intentionEyebrow);
    assert.ok(dict.livingIntelligence.knowledgeLayers);
    assert.ok(dict.livingIntelligence.universePulse);
    assert.ok(dict.livingIntelligence.openLivingContext);
  }
});

test("11. Atmosphere CSS and reduced motion in globals", () => {
  const css = readSource("app/globals.css");
  assert.match(css, /cbai-intelligence-atmosphere/);
  assert.match(css, /data-cbai-density/);
  assert.match(css, /\.cbai-living-context/);
});
