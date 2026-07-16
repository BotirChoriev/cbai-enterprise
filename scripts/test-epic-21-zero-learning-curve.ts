// EPIC-21 — Zero Learning Curve / Invisible Operating System verification.
// Run with: npm run test:epic-21-zero-learning-curve

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { USER_GOALS, resolveGoalRoute } from "@/lib/intelligence-os/intelligence-gateway";
import { resolveProgressiveDisclosure } from "@/lib/intelligence-os/progressive-disclosure";
import { deriveFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import { listSimplicityMetrics } from "@/lib/intelligence-os/simplicity-metrics";
import { derivePrimaryEvidenceStates } from "@/lib/intelligence-os/evidence-primary-states";
import { deriveCapabilityAssessmentOffer } from "@/lib/intelligence-os/capability-assessment";
import {
  UNIVERSAL_COMMAND_EXAMPLES,
  resolveUniversalCommand,
  UNIVERSAL_COMMAND_NOTE,
} from "@/lib/intelligence-os/universal-command";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Intelligence Gateway — goal routes without fake AI", () => {
  assert.equal(USER_GOALS.length, 7);
  for (const goal of USER_GOALS) {
    const route = resolveGoalRoute(goal, null);
    assert.ok(route.href.startsWith("/"));
    assert.ok(route.reason.length > 0);
  }
  const gateway = readSource("lib/intelligence-os/intelligence-gateway.ts");
  assert.match(gateway, /no fabricated AI routing/i);
});

test("2. Universal Command extends assistant-commands deterministically", () => {
  assert.ok(UNIVERSAL_COMMAND_EXAMPLES.length >= 8);
  assert.match(UNIVERSAL_COMMAND_NOTE, /deterministic/i);
  const resolved = resolveUniversalCommand("Continue research");
  assert.ok(resolved);
});

test("3. Progressive disclosure reduces chrome in focused mode", () => {
  const focused = resolveProgressiveDisclosure("focused");
  const expert = resolveProgressiveDisclosure("expert");
  assert.equal(focused.primaryActionOnly, true);
  assert.equal(focused.showMentalModelStrip, false);
  assert.equal(expert.showCanvasExpertPanels, true);
  assert.equal(expert.showGraphAnalysis, true);
});

test("4. First minute action never exposes architecture", () => {
  const action = deriveFirstMinuteAction(null);
  assert.equal(action.exposesArchitecture, false);
  assert.ok(action.href.startsWith("/"));
});

test("5. Simplicity metrics architecture only — no fabricated values", () => {
  const metrics = listSimplicityMetrics();
  assert.equal(metrics.length, 6);
  for (const metric of metrics) {
    assert.equal(metric.value, null);
    assert.match(metric.limitation, /no analytics pipeline/i);
  }
});

test("6. Primary evidence states from real runtime", () => {
  const states = derivePrimaryEvidenceStates(null);
  assert.equal(states.length, 4);
  assert.deepEqual(
    states.map((s) => s.state),
    ["known", "unknown", "conflict", "needs_review"],
  );
});

test("7. Capability assessment optional and non-blocking", () => {
  const offer = deriveCapabilityAssessmentOffer("Operator");
  assert.equal(offer.mandatory, false);
  assert.equal(offer.blocksWork, false);
});

test("8. Intelligence Gateway wired on home and search", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  assert.match(canvas, /IntelligenceGatewayEntry/);
  const search = readSource("components/search/gateway/SearchGateway.tsx");
  assert.match(search, /IntelligenceGatewayEntry/);
});

test("9. Primary surfaces simplified — reports, graph, evidence", () => {
  const reports = readSource("components/reports/ReportsCenter.tsx");
  assert.match(reports, /ReportsPrimaryActions/);
  const graph = readSource("components/graph/GraphPageClient.tsx");
  assert.match(graph, /GraphPrimaryViews/);
  const evidence = readSource("components/evidence/EvidenceExplorer.tsx");
  assert.match(evidence, /EvidencePrimaryStatesPanel/);
});

test("10. Progressive disclosure gates experience chrome", () => {
  const mental = readSource("components/operating/MentalModelStrip.tsx");
  assert.match(mental, /useProgressiveDisclosure/);
  const floating = readSource("components/operating/FloatingIntelligencePresence.tsx");
  assert.match(floating, /useProgressiveDisclosure/);
});

test("11. Design constitution Section XVI — Zero Learning Curve", () => {
  const doc = readSource("docs/product/CBAI-LIVING-INTELLIGENCE-DESIGN-CONSTITUTION.md");
  assert.match(doc, /## XVI\. Zero Learning Curve/);
  assert.match(doc, /Invisible Operating System/);
  assert.match(doc, /One Door Many Depths/);
  assert.match(doc, /Intent Before Navigation/);
});

test("12. BUILD-020 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.zeroLearningCurve.gatewayEyebrow);
    assert.ok(dict.zeroLearningCurve.goalResearch);
    assert.ok(dict.zeroLearningCurve.reportsContinue);
    assert.ok(dict.zeroLearningCurve.noTutorial);
  }
});
