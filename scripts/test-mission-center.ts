// BUILD-011 — Mission Center and Universal Intelligence OS interface tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CBAI_INTERFACE_PRINCIPLES } from "@/lib/design/cbai-interface-principles";
import { INTELLIGENCE_LENSES } from "@/lib/intelligence-os/intelligence-lenses";
import { deriveMissionThread } from "@/lib/intelligence-os/mission-engine";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. CBAI interface principles defined in code", () => {
  assert.ok(CBAI_INTERFACE_PRINCIPLES.length >= 8);
  assert.ok(CBAI_INTERFACE_PRINCIPLES.some((p) => p.id === "mission-center"));
});

test("2. Intelligence Lenses are not separate portals", () => {
  assert.ok(INTELLIGENCE_LENSES.length >= 7);
  for (const lens of INTELLIGENCE_LENSES) {
    assert.equal(lens.notAPortal, true);
    assert.ok(lens.route.startsWith("/"));
  }
});

test("3. Mission thread honest when no mission", () => {
  const thread = deriveMissionThread(null);
  assert.equal(thread.length, 7);
  assert.ok(thread.every((n) => n.status === "missing" || n.status === "partial"));
});

test("4. Evidence pulse honest without project", () => {
  const pulse = deriveEvidencePulse(null);
  assert.equal(pulse.state, "missing");
  assert.ok(pulse.limitation.length > 0);
});

test("5. BUILD-011 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.missionCenter.eyebrow);
    assert.ok(dict.missionCreation.problemLabel);
    assert.ok(dict.missionThread.mission);
    assert.ok(dict.evidencePulse.eyebrow);
    assert.ok(dict.systemAwakening.stageReady);
    assert.ok(dict.languageSelector.interfaceLanguage);
    assert.ok(dict.intelligenceLenses.notPortal);
  }
});

test("6. PlatformHome renders Intelligence Canvas — not marketing homepage stack", () => {
  const home = readSource("components/platform/PlatformHome.tsx");
  assert.match(home, /IntelligenceCanvas/);
  assert.doesNotMatch(home, /HomeEcosystems/);
  assert.doesNotMatch(home, /RoleWorkContextCards/);
  assert.doesNotMatch(home, /HomeIntelligenceGlobe/);
});

test("7. Intelligence Canvas includes signature systems and Operator presence", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /MissionOperatorPresence/);
  assert.match(canvas, /CanvasMissionTimeline/);
  assert.match(canvas, /CanvasContextLayer/);
  assert.match(canvas, /SystemAwakeningSequence/);
  assert.match(canvas, /CanvasOperatingObject/);
});

test("8. Language selector uses i18n keys in rendered panel", () => {
  const selector = readSource("components/i18n/LanguageSelector.tsx");
  assert.match(selector, /languageSelector\.interfaceLanguage/);
  assert.match(selector, /languageSelector\.voiceLanguage/);
  assert.match(selector, /languageSelector\.preparedNotActive/);
});

test("9. Sidebar on home shows readable labels — not ghost icon-only rail", () => {
  const sidebar = readSource("components/layout/Sidebar.tsx");
  assert.doesNotMatch(sidebar, /opacity-\[0\.22\]/);
  assert.match(sidebar, /w-56/);
});

test("10. Mineral surface token exists for operating panels", () => {
  const brand = readSource("components/brand/brand-classes.ts");
  assert.match(brand, /cbaiMineralSurface/);
});
