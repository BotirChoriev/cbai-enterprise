/**
 * Spatial World Intelligence — homepage, globe, and honest data presentation tests.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getGlobeCountryPoints, latLngToUnitVector } from "@/lib/spatial-world/globe-geography";
import { getDictionary } from "@/lib/i18n/translate";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

test("PlatformHome renders Spatial World Intelligence homepage", () => {
  const home = readSource("components/platform/PlatformHome.tsx");
  assert.match(home, /SpatialWorldIntelligenceHome/);
  assert.doesNotMatch(home, /IntelligenceCanvas/);
});

test("globe geography uses registry countries only with factual capital coordinates", () => {
  const points = getGlobeCountryPoints();
  assert.equal(points.length, 6);
  for (const point of points) {
    assert.match(point.href, /^\/countries\?country=/);
    const vector = latLngToUnitVector(point.lat, point.lng);
    const magnitude = Math.hypot(vector.x, vector.y, vector.z);
    assert.ok(Math.abs(magnitude - 1) < 0.001);
  }
});

test("interactive globe has WebGL cleanup, keyboard access, and reduced-motion fallback", () => {
  const globe = readSource("components/spatial-world/InteractiveIntelligenceGlobe.tsx");
  assert.match(globe, /renderer\.dispose\(\)/);
  assert.match(globe, /prefers-reduced-motion/);
  assert.match(globe, /isMobileViewport/);
  assert.match(globe, /tabIndex=\{0\}/);
  assert.match(globe, /ArrowLeft/);
  assert.match(globe, /data-globe-reset/);
  assert.match(globe, /OrbitControls/);
  assert.doesNotMatch(globe, /globeArc|connectionArc|drawArc|fakeArc/i);
});

test("homepage uses calm teal voice entry and digital OperatorOrb — no fake stats or human avatar", () => {
  const home = readSource("components/spatial-world/SpatialWorldIntelligenceHome.tsx");
  assert.match(home, /vo\.openDock/);
  assert.match(home, /OperatorOrb/);
  assert.match(home, /loadProjects/);
  assert.match(home, /projectsEmpty/);
  assert.match(home, /noFakeData/);
  assert.doesNotMatch(home, /operatorOpenVoice/);
  assert.doesNotMatch(home, /12,846|98\.7%|lorem ipsum|Jane Doe|John Smith/i);
  assert.doesNotMatch(home, /<img[^>]+avatar/i);
});

test("country selection links to existing country intelligence route", () => {
  const home = readSource("components/spatial-world/SpatialWorldIntelligenceHome.tsx");
  assert.match(home, /InteractiveIntelligenceGlobe/);
  assert.match(home, /SpatialCountryContextPanel/);
  const geography = readSource("lib/spatial-world/globe-geography.ts");
  assert.match(geography, /\/countries\?country=/);
  const panel = readSource("components/spatial-world/SpatialCountryContextPanel.tsx");
  assert.match(panel, /point\.href/);
  const globe = readSource("components/spatial-world/InteractiveIntelligenceGlobe.tsx");
  assert.doesNotMatch(globe, /selected\.href/);
});

test("ecosystem strip links to real platform routes only", () => {
  const home = readSource("components/spatial-world/SpatialWorldIntelligenceHome.tsx");
  assert.match(home, /href: "\/research"/);
  assert.match(home, /href: "\/investor"/);
  assert.match(home, /href: "\/governance"/);
});

test("logo mark is intelligence sphere without crescent path", () => {
  const logo = readSource("components/brand/CBAILogo.tsx");
  assert.match(logo, /intelligence sphere/i);
  assert.doesNotMatch(logo, /Geometric C/);
  assert.match(logo, /#14b8a6/);
  assert.match(logo, /LOGO_SUBTITLE_PRIMARY/);
  assert.match(logo, /Operating System/);
  assert.doesNotMatch(logo, /\bIOS\b/);
  assert.match(logo, /compact[\s\S]*standalone/);
  const icon = readSource("app/icon.svg");
  assert.doesNotMatch(icon, /M44 18/);
});

test("spatial world i18n present in all four active languages", () => {
  for (const lang of ["en", "uz", "ru", "tr"] as const) {
    const dict = getDictionary(lang);
    assert.ok(dict.spatialWorld.welcomeTitle.length > 0);
    assert.ok(dict.spatialWorld.primaryAction.length > 0);
    assert.ok(dict.spatialWorld.trustLine.length > 0);
  }
});

test("Voice Operator dock and provider remain global — spatial home does not bypass privacy", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /VoiceOperatorProvider/);
  assert.match(layout, /VoiceOperatorDock/);
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /releaseLiveAudioResources/);
  assert.match(provider, /stopLiveAudioCapture/);
});

test("globe loaded with dynamic import for static export compatibility", () => {
  const home = readSource("components/spatial-world/SpatialWorldIntelligenceHome.tsx");
  assert.match(home, /dynamic\(/);
  assert.match(home, /ssr: false/);
});

test("globe uses bundled Natural Earth 110m geography without runtime map servers", () => {
  const globe = readSource("components/spatial-world/InteractiveIntelligenceGlobe.tsx");
  assert.match(globe, /buildNaturalEarthGlobeCanvas/);
  assert.match(globe, /NATURAL_EARTH_ATTRIBUTION/);
  const texture = readSource("lib/spatial-world/globe-natural-earth-texture.ts");
  assert.match(texture, /ne_110m_land/);
  assert.match(texture, /ne_110m_coastline/);
  assert.match(texture, /LAND = "#7399ad"/);
  assert.doesNotMatch(globe, /wireframe:\s*true/);
  assert.doesNotMatch(globe, /tiles\.|mapbox|openstreetmap/i);
});

test("spatial home avoids hero/header overlap and uses readable contrast tokens", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /cbai-spatial-main-scroll/);
  assert.match(layout, /cbai-spatial-main-canvas/);
  assert.match(layout, /LivingContextRibbon/);
  const css = readSource("app/globals.css");
  assert.match(css, /\.cbai-spatial-topbar/);
  assert.match(css, /cbai-spatial-nav-active/);
  assert.match(css, /cbai-section-eyebrow-spatial/);
  const home = readSource("components/spatial-world/SpatialWorldIntelligenceHome.tsx");
  assert.match(home, /text-slate-50/);
  assert.match(home, /cbai-section-eyebrow-spatial/);
  assert.doesNotMatch(home, /text-teal-300\/70/);
  assert.doesNotMatch(home, /text-zinc-500/);
});

test("integrated voice CTA and country panel avoid disconnected white pill styling", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /cbai-spatial-voice-cta/);
  assert.doesNotMatch(dock, /rounded-full border border-teal-500\/30 bg-slate-950\/95/);
  const panel = readSource("components/spatial-world/SpatialCountryContextPanel.tsx");
  assert.match(panel, /cbai-spatial-country-action/);
  assert.doesNotMatch(panel, /cbaiBtnSecondary/);
});

test("spatial navigation uses readable tokens with left active indicator", () => {
  const brand = readSource("components/brand/brand-classes.ts");
  assert.match(brand, /cbaiSpatialNavRowActive/);
  assert.match(brand, /cbai-nav-row-active/);
  const css = readSource("app/globals.css");
  assert.match(css, /\.cbai-nav-row-active::before/);
  const nav = readSource("components/operating/OperatingNavigator.tsx");
  assert.match(nav, /spatial=\{isHome\}/);
  assert.match(nav, /cbaiNavEyebrow/);
});

test("layout prevents horizontal overflow on spatial main canvas", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /overflow-x-hidden/);
  const home = readSource("components/spatial-world/SpatialWorldIntelligenceHome.tsx");
  assert.match(home, /min-w-0|w-full/);
});
