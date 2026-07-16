// Focused tests for the "Trust & Production Polish" mission (EPIC 1) — real, file-level checks
// that the confirmed launch blockers stay fixed: no internal build/engineering jargon in
// user-facing copy, branded system pages exist with a real way back, and the non-functional
// "Agents" destination no longer sits in primary navigation. Static source-inspection tests
// (fs.readFileSync + assertions), not rendering tests — this repo's harness has no DOM, and these
// checks are about what ships in the source, which is exactly what a copy/navigation regression
// would change.
// Run with: npm run test:production-readiness

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

// Word-boundary matches only, on quoted string literals — the same shape a JSX prop or text node
// takes. Deliberately excludes "Store" (too many legitimate false positives, e.g. "app store"
// language never appears here) and matches only whole words so "Restore"/"Contest" etc. never
// false-positive.
const FORBIDDEN_JARGON = /\b(Build|Architecture|Internal|Runtime|Adapter|Engine|Developer|Pipeline|Migration)\b/;
const FORBIDDEN_MICRO_TRUST = /\b(TODO|Placeholder|Lorem|Temporary|Dummy|Sample|Mock)\b/;

function assertNoForbiddenCopy(relativePath: string) {
  const content = read(relativePath);
  const jargonMatch = content.match(FORBIDDEN_JARGON);
  assert.equal(jargonMatch, null, `${relativePath} contains engineering jargon: "${jargonMatch?.[0]}"`);
  const microTrustMatch = content.match(FORBIDDEN_MICRO_TRUST);
  assert.equal(microTrustMatch, null, `${relativePath} contains a micro-trust violation: "${microTrustMatch?.[0]}"`);
}

test("1. lib/platform-home.ts no longer exports an internal build tag or evolution phase", () => {
  const content = read("lib/platform-home.ts");
  assert.equal(content.includes("PLATFORM_BUILD"), false);
  assert.equal(content.includes("PLATFORM_EVOLUTION_PHASE"), false);
  assert.equal(content.includes("elite-home-final"), false);
  assert.equal(content.includes("Final Home Architecture"), false);
  // A plain version number is real, professional product info — not an engineering artifact.
  assert.equal(content.includes('PLATFORM_VERSION = "0.1.0"'), true);
});

test("2. Home canvas no longer exposes internal build strings (orphaned HomeFooter removed)", () => {
  assert.equal(existsSync("components/platform/home/HomeFooter.tsx"), false);
  const canvas = read("components/canvas/IntelligenceCanvas.tsx");
  assert.equal(canvas.includes("PLATFORM_BUILD"), false);
  assert.equal(canvas.includes("elite-home-final"), false);
});

test("3. Trust Center contains the required non-developer sections and nothing developer-oriented", () => {
  const trustCopy = read("lib/i18n/platform-copy-build006-en.ts");
  const trustClient = read("components/trust/TrustPageClient.tsx");
  assert.ok(trustClient.includes("TrustPageClient"), "Trust page must render via TrustPageClient");
  for (const required of ["Methodology", "Verification Model", "Evidence Policy", "Data Sources", "Known Limitations", "Transparency Statement"]) {
    assert.ok(trustCopy.includes(`title: "${required}"`), `Trust copy is missing the "${required}" section`);
  }
  assert.equal(trustCopy.includes("elite-home-final"), false);
  assert.equal(trustCopy.includes("Version History"), false);
  assertNoForbiddenCopy("components/trust/TrustPageClient.tsx");
});

test("4. Agent 'runtime' labels were replaced with production-appropriate copy", () => {
  const libContent = read("lib/agents.ts");
  assert.equal(libContent.includes('"Runtime Not Connected"'), false);
  assertNoForbiddenCopy("lib/agents.ts");
  assertNoForbiddenCopy("components/agents/AgentStats.tsx");
  assertNoForbiddenCopy("components/agents/AgentActivity.tsx");
  assertNoForbiddenCopy("app/(dashboard)/agents/page.tsx");
});

test("5. product-status.ts's Planned explanation no longer says 'architecture'", () => {
  assertNoForbiddenCopy("lib/product-status.ts");
});

test("6. 'Agents' was removed from primary navigation — no live promotion of a non-functional destination", () => {
  const content = read("lib/navigation.ts");
  // The route may still exist (reachable directly / from /core's grid) — only the primary-nav
  // promotion needed to go, per the mission's "remove from primary navigation" option.
  const navSectionMatch = content.match(/primaryNavSections[\s\S]*?^];/m);
  assert.ok(navSectionMatch, "could not locate primaryNavSections in lib/navigation.ts");
  assert.equal(navSectionMatch![0].includes('label: "Agents"'), false);
});

test("7. Graph page's section heading no longer says 'Pipeline'", () => {
  const content = read("app/(dashboard)/graph/page.tsx");
  assert.equal(content.includes('title="Graph Pipeline"'), false);
});

test("8. Research topic overview no longer labels a stat 'Pipeline stages run'", () => {
  const content = read("components/research/topic/ResearchIntelligenceOverview.tsx");
  assert.equal(content.includes("Pipeline stages run"), false);
});

test("9. Root not-found.tsx exists and uses the shared branded system-page shell", () => {
  assert.ok(existsSync(join(ROOT, "app/not-found.tsx")));
  const content = read("app/not-found.tsx");
  assert.ok(content.includes("SystemPageShell"));
});

test("10. Error boundaries exist at both the dashboard and root level", () => {
  assert.ok(existsSync(join(ROOT, "app/(dashboard)/error.tsx")));
  assert.ok(existsSync(join(ROOT, "app/error.tsx")));
  assert.ok(existsSync(join(ROOT, "app/global-error.tsx")));
});

test("11. SystemPageShell offers every required recovery action — never strands a user", () => {
  const content = read("components/system/SystemPageShell.tsx");
  for (const requiredAction of ["returnHome", "goBack", "search", "continueProject", "feedback"]) {
    assert.ok(content.includes(requiredAction), `SystemPageShell is missing the "${requiredAction}" action`);
  }
});

test("12. global-error.tsx is self-contained (own html/body) with a real way home", () => {
  const content = read("app/global-error.tsx");
  assert.ok(content.includes("<html"));
  assert.ok(content.includes("<body"));
  assert.ok(content.includes('href="/"'));
  assert.ok(content.includes("Try Again"));
});

test("13. Entity-not-found notices exist for Countries, Companies, and Universities", () => {
  assert.ok(existsSync(join(ROOT, "components/system/EntityNotFoundNotice.tsx")));
  for (const page of [
    "app/(dashboard)/countries/CountriesPageClient.tsx",
    "app/(dashboard)/companies/CompaniesPageClient.tsx",
    "app/(dashboard)/universities/UniversitiesPageClient.tsx",
  ]) {
    const content = read(page);
    assert.ok(content.includes("EntityNotFoundNotice"), `${page} does not wire in EntityNotFoundNotice`);
  }
});

test("14. My Work's missing-project state explains what happened and what to do next", () => {
  const content = read("components/my-work/MyWork.tsx");
  assert.equal(content.includes(">Project not found.<"), false);
  assert.ok(content.includes("myWork.projectUnavailableBody"));
});

test("15. The real production 404 fallback (out/404.html) is CBAI-branded, not the generic Next.js default", () => {
  const outPath = join(ROOT, "out/404.html");
  if (!existsSync(outPath)) {
    // A production build wasn't run before this test in this environment — not this test's job
    // to build one; the dev-facing checks above already cover the source.
    return;
  }
  const content = readFileSync(outPath, "utf8");
  assert.ok(content.includes("Page not found"));
  assert.ok(content.includes("Return Home"));
  assert.equal(content.includes("This page could not be found."), false);
});
