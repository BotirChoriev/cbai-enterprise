/**
 * Intelligence OS theme + IA regression (source contracts).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("dark theme guards remapped white workspace backgrounds", () => {
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /html:not\(\.theme-light\) \.cbai-page-workspace \.bg-white/);
  assert.match(css, /\.cbai-operating-card/);
  assert.match(css, /--cbai-solid-surface/);
});

test("brand section title uses semantic text token", () => {
  const brand = readFileSync("components/brand/brand-classes.ts", "utf8");
  assert.match(brand, /cbaiSectionTitle[\s\S]*--cbai-text-primary/);
});

test("collaboration IA is progressive disclosure only", () => {
  const nav = readFileSync("lib/navigation.ts", "utf8");
  const primaryEnd = nav.indexOf("secondaryNavSections");
  const primary = nav.slice(0, primaryEnd);
  assert.equal(primary.includes('href: "/publications"'), false);
  assert.ok(nav.includes('title: "Collaboration"'));
});

test("voice provider tears down live capture on pathname change", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /Privacy P0: SPA route changes must release the mic/);
  assert.match(provider, /useEffect\(\(\) => \{[\s\S]*releaseLiveAudioResources[\s\S]*\}\s*,\s*\[pathname, releaseLiveAudioResources\]\)/);
  assert.doesNotMatch(provider, /void pathname/);
});

test("voice navigation announces only after route land", () => {
  const provider = readFileSync("components/voice-operator/VoiceOperatorProvider.tsx", "utf8");
  assert.match(provider, /scheduleNavSuccessAnnounce/);
  assert.match(provider, /pendingNavAnnounceRef/);
  assert.match(provider, /hrefMatchesPathname/);
});

test("my work demotes engine and project create behind progressive disclosure", () => {
  const myWork = readFileSync("components/my-work/MyWork.tsx", "utf8");
  assert.match(myWork, /advancedEngineSummary/);
  assert.match(myWork, /createProjectSummary/);
  assert.match(myWork, /secondaryExplore/);
  assert.match(myWork, /<details/);
});
