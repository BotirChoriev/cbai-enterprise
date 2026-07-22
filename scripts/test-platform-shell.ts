/**
 * Platform shell, atmosphere, and layout regression tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("dashboard layout uses progressive disclosure and unified platform shell", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /cbai-platform-shell/);
  assert.match(layout, /cbai-platform-main/);
  assert.match(layout, /LivingContextRibbon/);
  assert.match(layout, /shouldShowOperatingContextColumn/);
  assert.match(layout, /shouldShowContinuityTimeline/);
});

test("atmosphere depth reduced — no opaque gray curtain", () => {
  const atmosphere = readSource("lib/intelligence-os/intelligence-atmosphere.ts");
  assert.doesNotMatch(atmosphere, /depth: 0\.9[4-9]/);
  const css = readSource("app/globals.css");
  assert.match(css, /\.cbai-intelligence-atmosphere::before/);
  assert.match(css, /--cbai-shell-bg/);
  assert.match(css, /--cbai-dock-inset/);
});

test("navigation uses theme-aware nav tokens with spatial accent on home only", () => {
  const nav = readSource("components/operating/OperatingNavigator.tsx");
  assert.match(nav, /spatial=\{isHome\}/);
  assert.match(nav, /cbaiNavEyebrow/);
});

test("sidebar and topbar share unified dark shell", () => {
  const sidebar = readSource("components/layout/Sidebar.tsx");
  const topbar = readSource("components/layout/Topbar.tsx");
  assert.match(sidebar, /cbai-platform-sidebar/);
  assert.match(topbar, /cbai-platform-topbar/);
  assert.doesNotMatch(topbar, /bg-\[#07101f\]/);
});

test("investor and governance hide duplicate global mission chrome", () => {
  const disclosure = readSource("lib/intelligence-os/progressive-disclosure.ts");
  assert.match(disclosure, /"\/investor"/);
  assert.match(disclosure, /"\/governance"/);
});

test("entity overview section uses translated UI labels", () => {
  const overview = readSource("components/shared/EntityOverviewSection.tsx");
  assert.match(overview, /useTranslation/);
  assert.match(overview, /entityIntelligence\.availableInformation/);
  assert.doesNotMatch(overview, /title="Overview"/);
});

test("knowledge graph gives canvas majority width at lg breakpoint", () => {
  const graph = readSource("components/graph/GraphPageClient.tsx");
  assert.match(graph, /lg:col-span-6/);
  assert.match(graph, /min-h-\[min\(72vh/);
});

test("voice dock reserves main scroll space globally", () => {
  const css = readSource("app/globals.css");
  assert.match(css, /\.cbai-platform-main/);
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /cbai-platform-main/);
});

test("local voice broker dev path documented without committing secrets", () => {
  const example = readSource(".env.example");
  assert.match(example, /dev:voice/);
  const gitignore = readSource(".gitignore");
  assert.match(gitignore, /\.dev\.vars/);
  assert.doesNotMatch(readSource(".dev.vars.example"), /sk-/);
});
