// EPIC governance — roadmap, standards, module mapping, safety rules.
// Run with: npm run test:epic-governance

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EPIC_DEFINITIONS,
  getAllEpicDocPaths,
  getEpicForRoute,
  ROUTE_EPIC_MAP,
} from "@/lib/epics/epic-registry";
import {
  CAPABILITY_SAFETY_RULES,
  DISCOVERY_FAIRNESS_RULES,
  FORBIDDEN_CAPABILITY_PATTERNS,
} from "@/lib/epics/capability-safety-rules";
import {
  MODULE_ACCOUNTABILITY,
  getModuleAccountability,
  getUnregisteredPrimaryRoutes,
  toExtendedAccountability,
} from "@/lib/intelligence-os/module-accountability";
import { primaryNavSections } from "@/lib/navigation";

const PRIMARY_NAV_ITEMS = primaryNavSections.flatMap((s) => s.items);

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. All fifteen EPIC documents exist on disk", () => {
  assert.equal(EPIC_DEFINITIONS.length, 15);
  for (const path of getAllEpicDocPaths()) {
    assert.ok(existsSync(join(process.cwd(), path)), `Missing EPIC doc: ${path}`);
  }
  assert.ok(existsSync(join(process.cwd(), "docs/epics/README.md")));
  assert.ok(existsSync(join(process.cwd(), "docs/epics/REPOSITORY-EPIC-MAP.md")));
  assert.ok(existsSync(join(process.cwd(), "docs/epics/EPIC-MATURITY-MATRIX.md")));
});

test("2. Product standards documents exist and link to constitution — no duplicate constitution", () => {
  const standards = [
    "docs/product/CBAI-UNIVERSAL-INTELLIGENCE-OS.md",
    "docs/product/CBAI-EPIC-OPERATING-MODEL.md",
    "docs/product/CBAI-CAPABILITY-ETHICS.md",
    "docs/product/CBAI-DISCOVERY-FAIRNESS.md",
    "docs/product/CBAI-HUMANITY-IMPACT-STANDARD.md",
    "docs/product/CBAI-HUMAN-DECISION-BOUNDARY.md",
    "docs/product/CBAI-KNOWLEDGE-LEGACY-STANDARD.md",
  ];
  for (const path of standards) {
    const content = readSource(path);
    assert.ok(content.includes("docs/standards/01-cbai-constitution.md") || content.includes("CBAI Constitution"));
    assert.ok(!content.match(/^# CBAI Constitution Standard/m), `${path} must not duplicate constitution`);
  }
});

test("3. Primary navigation routes map to an EPIC and have accountability records", () => {
  for (const item of PRIMARY_NAV_ITEMS) {
    const epic = getEpicForRoute(item.href);
    assert.ok(epic, `Primary nav ${item.href} must map to an EPIC`);
    const accountability = getModuleAccountability(item.href);
    assert.ok(accountability, `Primary nav ${item.href} must have module accountability`);
    assert.notEqual(accountability.maturity, "planned", `${item.href} must not be planned-only in primary nav`);
  }
  const gaps = getUnregisteredPrimaryRoutes(PRIMARY_NAV_ITEMS.map((i) => i.href));
  assert.deepEqual(gaps, []);
});

test("4. Extended module accountability includes EPIC ownership", () => {
  for (const entry of MODULE_ACCOUNTABILITY) {
    const ext = toExtendedAccountability(entry);
    assert.ok(ext.epicOwnership);
    assert.ok(ext.privacyConsiderations.length > 0);
    assert.ok(ext.purpose.length > 0);
  }
});

test("5. Capability Passport safety rules documented and code avoids forbidden patterns", () => {
  assert.ok(CAPABILITY_SAFETY_RULES.length >= 10);
  assert.ok(DISCOVERY_FAIRNESS_RULES.length >= 6);
  const passportBuilder = readSource("lib/capability/capability-passport-builder.ts");
  const discovery = readSource("lib/discovery/discovery-engine.ts");
  for (const pattern of FORBIDDEN_CAPABILITY_PATTERNS) {
    assert.ok(!pattern.test(passportBuilder), `Forbidden pattern in capability builder: ${pattern}`);
    assert.ok(!pattern.test(discovery), `Forbidden pattern in discovery engine: ${pattern}`);
  }
});

test("6. No profession-only portal routing in primary navigation", () => {
  const nav = readSource("lib/navigation.ts");
  assert.ok(nav.includes("Intelligence Lenses"));
  assert.ok(!nav.match(/href:\s*"\/doctor"/));
  assert.ok(!nav.match(/href:\s*"\/professor"/));
});

test("7. No global human ranking in capability or discovery modules", () => {
  const sources = [
    "lib/capability/capability-passport-builder.ts",
    "lib/discovery/discovery-engine.ts",
    "lib/intelligence-os/adaptive-intelligence.ts",
  ];
  for (const path of sources) {
    const src = readSource(path);
    assert.ok(!/globalRank|humanRank|prestigeScore/i.test(src), `${path} must not implement global ranking`);
  }
});

test("8. Human Decision Boundary wired on conclusion surfaces", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  const context = readSource("components/operating/LivingContextRail.tsx");
  const reports = readSource("components/reports/ReportsCenter.tsx");
  const reasoning = readSource("components/reasoning/ReasoningExplorer.tsx");
  assert.match(canvas, /HumanDecisionBoundary/);
  assert.match(context, /HumanDecisionBoundary/);
  assert.match(reports, /missionContextVariant="full"/);
  assert.match(reasoning, /missionContextVariant="full"/);
});

test("9. Legacy Trail derives from real artifacts — wired on Intelligence Canvas", () => {
  const legacy = readSource("lib/intelligence-os/legacy-trail.ts");
  assert.match(legacy, /loadProjectEvidence/);
  assert.match(legacy, /loadProjectNotes/);
  assert.match(legacy, /loadProjectQuestions/);
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /LegacyTrail/);
});

test("10. Route EPIC map covers all accountability routes", () => {
  for (const entry of MODULE_ACCOUNTABILITY) {
    if (entry.maturity === "planned") continue;
    const epic = getEpicForRoute(entry.route) ?? ROUTE_EPIC_MAP[entry.route];
    assert.ok(epic, `Accountability route ${entry.route} must map to an EPIC`);
  }
});
