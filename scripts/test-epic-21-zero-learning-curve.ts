// EPIC-21 — Zero Learning Curve / Invisible Operating System verification.
// Run with: npm run test:epic-21-zero-learning-curve

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { USER_GOALS, resolveGoalRoute, deriveContextualGoals } from "@/lib/intelligence-os/intelligence-gateway";
import { resolveProgressiveDisclosure } from "@/lib/intelligence-os/progressive-disclosure";
import { deriveFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import { listSimplicityMetrics } from "@/lib/intelligence-os/simplicity-metrics";
import { derivePrimaryEvidenceStates } from "@/lib/intelligence-os/evidence-primary-states";
import { deriveCapabilityAssessmentOffer } from "@/lib/intelligence-os/capability-assessment";
import { deriveScreenSimplicityAudit } from "@/lib/intelligence-os/simplicity-metrics";
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
    assert.ok(dict.zeroLearningCurve.reasoningPurpose);
  }
});

test("13. EPIC-22 — operator silent unless intervention required", () => {
  const ambient = readSource("lib/intelligence-os/ambient-intelligence.ts");
  assert.match(ambient, /deriveOperatorPresenceMode/);
  const operator = readSource("components/mission/MissionOperatorPresence.tsx");
  assert.match(operator, /deriveOperatorPresenceMode/);
  const floating = readSource("components/operating/FloatingIntelligencePresence.tsx");
  assert.match(floating, /presence\.mode !== "intervention"/);
});

test("14. EPIC-22 — extended progressive disclosure flags", () => {
  const focused = resolveProgressiveDisclosure("focused");
  assert.equal(focused.showLivingContextRail, false);
  assert.equal(focused.showOperatingContextColumn, false);
  assert.equal(focused.showGlobalMissionBarDetail, false);
});

test("15. EPIC-22 — screen simplicity audit architecture", () => {
  const audit = deriveScreenSimplicityAudit("home", "professional");
  assert.ok(audit.score >= audit.target - 1);
  assert.match(audit.note, /Heuristic/i);
});

test("16. EPIC-23 — mission continuity wired in page shell", () => {
  const shell = readSource("components/shared/OperatingPageShell.tsx");
  assert.match(shell, /MissionOperatingContextBar/);
  const reasoning = readSource("components/reasoning/ReasoningExplorer.tsx");
  assert.doesNotMatch(reasoning, /href="\/reasoning"/);
});

test("17. EPIC-23 — contextual goals and mission creation entry", () => {
  assert.ok(deriveContextualGoals(null).length <= 4);
  const gateway = readSource("lib/intelligence-os/intelligence-gateway.ts");
  assert.match(gateway, /create=1/);
});

test("18. EPIC-24 — route companion and human memory architecture", () => {
  const firstMinute = readSource("lib/intelligence-os/first-minute.ts");
  assert.match(firstMinute, /deriveRouteCompanion/);
  assert.match(firstMinute, /deriveMissionStoryBeat/);
  assert.match(firstMinute, /routePurposeI18nKey/);
  const memory = readSource("lib/intelligence-os/living-memory.ts");
  assert.match(memory, /recordCompanionThought/);
  assert.match(memory, /loadCompanionThought/);
  const bar = readSource("components/mission/MissionOperatingContextBar.tsx");
  assert.match(bar, /deriveRouteCompanion/);
  assert.match(bar, /recordCompanionThought/);
  assert.doesNotMatch(bar, /mission\?\.problem/);
});

test("19. EPIC-24 — operator as guidance without greetings", () => {
  const operator = readSource("components/mission/MissionOperatorPresence.tsx");
  assert.doesNotMatch(operator, /assistant\.greeting/);
  assert.doesNotMatch(operator, /OperatorOrb/);
  assert.match(operator, /deriveOperatorPresenceMode/);
});

test("20. EPIC-24 — companion i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.zeroLearningCurve.companionEyebrow);
    assert.ok(dict.zeroLearningCurve.returnToMission);
    assert.ok(dict.zeroLearningCurve.routeEvidencePurpose);
    assert.ok(dict.zeroLearningCurve.storyBeatBeginning);
    assert.ok(dict.zeroLearningCurve.commandEyebrow);
  }
});

test("21. EPIC-24 — software language removed from primary copy", () => {
  assert.doesNotMatch(en.intelligenceSpaces.operatingEnvironment, /environment/i);
  assert.doesNotMatch(en.intelligenceCanvas.notDashboard, /dashboard/i);
  assert.doesNotMatch(en.intelligenceCanvas.notDashboard, /workspace/i);
  assert.doesNotMatch(en.missionThread.eyebrow, /thread/i);
  assert.doesNotMatch(en.universalWorkspace.workspaceEyebrow, /Universal Workspace/i);
  assert.match(en.zeroLearningCurve.universalCommandEyebrow, /Ask or search/i);
});
