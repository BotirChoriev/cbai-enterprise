// EPIC-13 — Adaptive Intelligence Interface verification.
// Run with: npm run test:epic-13-adaptive-interface

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  intelligenceSpaceI18nKey,
  resolveIntelligenceSpace,
} from "@/lib/intelligence-os/intelligence-spaces";
import { deriveNavLiveState } from "@/lib/intelligence-os/nav-live-state";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Dashboard layout implements spatial operating model", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /GlobalMissionContextBar/);
  assert.match(layout, /OperatingContextColumn/);
  assert.match(layout, /ContinuityTimelineStrip/);
  assert.match(layout, /cbai-operating-main/);
  assert.match(layout, /cbai-space-enter/);
});

test("2. Sidebar uses Operating Navigator with live state", () => {
  const sidebar = readSource("components/layout/Sidebar.tsx");
  assert.match(sidebar, /OperatingNavigator/);
  assert.doesNotMatch(sidebar, /OperatingNavigationPanel/);
});

test("3. Intelligence spaces resolve routes to named spaces", () => {
  assert.equal(resolveIntelligenceSpace("/"), "mission");
  assert.equal(resolveIntelligenceSpace("/graph"), "knowledge-universe");
  assert.equal(resolveIntelligenceSpace("/knowledge"), "evidence");
  assert.equal(intelligenceSpaceI18nKey("knowledge-universe"), "knowledgeUniverseSpace");
});

test("4. Living context rail supersedes canvas context layer", () => {
  const reexport = readSource("components/canvas/CanvasContextLayer.tsx");
  assert.match(reexport, /LivingContextRail/);
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /LivingContextRail/);
  assert.doesNotMatch(canvas, /CanvasContextLayer/);
});

test("5. Operating page shell wires route companion on mission routes", () => {
  const shell = readSource("components/shared/OperatingPageShell.tsx");
  assert.match(shell, /MissionOperatingContextBar/);
  assert.match(shell, /missionContextVariant/);
});

test("6. Capability Galaxy wired in My Work", () => {
  const myWork = readSource("components/my-work/MyWork.tsx");
  assert.match(myWork, /CapabilityGalaxy/);
  assert.match(myWork, /CapabilityPassportPanel/);
});

test("7. BUILD-015 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.intelligenceSpaces.missionSpace);
    assert.ok(dict.intelligenceSpaces.livingContext);
    assert.ok(dict.intelligenceSpaces.capabilityGalaxy);
    assert.ok(dict.intelligenceSpaces.operatingNavigator);
  }
});

test("8. Nav live state covers search, reasoning, settings, trust", () => {
  assert.equal(deriveNavLiveState("/search", "/knowledge"), "neutral");
  assert.equal(deriveNavLiveState("/reasoning", "/reasoning"), "active");
  assert.equal(deriveNavLiveState("/settings", "/knowledge"), "neutral");
  assert.equal(deriveNavLiveState("/trust", "/knowledge"), "neutral");
});

test("9. Spatial motion respects reduced motion in globals.css", () => {
  const css = readSource("app/globals.css");
  assert.match(css, /cbai-space-enter/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.cbai-reduced-motion \.cbai-space-enter/);
});
