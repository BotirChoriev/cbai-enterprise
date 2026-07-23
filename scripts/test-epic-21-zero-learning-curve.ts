// EPIC-21 — Zero Learning Curve / Invisible Operating System verification.
// Run with: npm run test:epic-21-zero-learning-curve

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { USER_GOALS, resolveGoalRoute, deriveContextualGoals } from "@/lib/intelligence-os/intelligence-gateway";
import { resolveProgressiveDisclosure, shouldShowGlobalMissionBar, shouldShowOperatingContextColumn, shouldShowAmbientTrustStrip } from "@/lib/intelligence-os/progressive-disclosure";
import { deriveSearchActivationStages } from "@/lib/intelligence-os/search-activation";
import { executeGatewaySearch } from "@/lib/search-gateway";
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
  assert.match(bar, /recordCompanionThought/);
  assert.match(bar, /priorThought\.lastFocus/);
});

test("19. EPIC-24 — operator as guidance without greetings", () => {
  const operator = readSource("components/mission/MissionOperatorPresence.tsx");
  assert.doesNotMatch(operator, /assistant\.greeting/);
  assert.match(operator, /DigitalAssistantPanel/);
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

test("22. Phase 2 — route-aware chrome reduces cognitive load", () => {
  const disclosure = readSource("lib/intelligence-os/progressive-disclosure.ts");
  assert.match(disclosure, /shouldShowGlobalMissionBar/);
  assert.match(disclosure, /shouldShowContinuityTimeline/);
  assert.match(disclosure, /showCompanionDetail/);
  assert.match(disclosure, /showGatewayGoalChips/);
  const companion = readSource("components/mission/MissionOperatingContextBar.tsx");
  assert.match(companion, /showCompanionDetail/);
  const gateway = readSource("components/gateway/IntelligenceGatewayEntry.tsx");
  assert.match(gateway, /showGatewayGoalChips/);
});

test("23. Entity explore routes — page companion hides duplicate global bar", () => {
  const disclosure = readSource("lib/intelligence-os/progressive-disclosure.ts");
  assert.match(disclosure, /ENTITY_EXPLORE_ROUTES/);
  assert.equal(shouldShowGlobalMissionBar("/countries"), false);
  assert.equal(shouldShowGlobalMissionBar("/companies"), false);
  assert.equal(shouldShowGlobalMissionBar("/universities"), false);
  assert.equal(shouldShowGlobalMissionBar("/my-work"), false);
  assert.equal(shouldShowGlobalMissionBar("/search"), false);
});

test("26. Platform convergence — mission home and contextual loading", () => {
  const flags = resolveProgressiveDisclosure("standard");
  assert.equal(shouldShowOperatingContextColumn("/my-work", flags), false);
  assert.equal(shouldShowOperatingContextColumn("/search", flags), false);
  assert.equal(shouldShowAmbientTrustStrip("/graph", flags), false);
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /RouteChromeFallback/);
  assert.doesNotMatch(layout, /fallback=\{null\}/);
  const graph = readSource("components/graph/GraphPageClient.tsx");
  assert.match(graph, /recordEntityView/);
  assert.match(graph, /setCountry/);
  const myWork = readSource("components/my-work/MyWorkPageClient.tsx");
  assert.match(myWork, /missionContextVariant="compact"/);
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.common.loadingResearch);
  }
});

test("24. Entity explore routes — companion purpose keys in all languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.zeroLearningCurve.routeCountriesPurpose);
    assert.ok(dict.zeroLearningCurve.routeCompaniesPurpose);
    assert.ok(dict.zeroLearningCurve.routeUniversitiesPurpose);
  }
});

test("25. Platform activation — search and voice i18n in all languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.activation.searchCompleted);
    assert.ok(dict.activation.voiceListening);
    assert.ok(dict.search.voiceSummary);
  }
  const stages = deriveSearchActivationStages("japan", executeGatewaySearch("japan"));
  assert.ok(stages.includes("completed"));
});

test("27. Product excellence — mission home and research dashboard i18n", () => {
  const myWork = readSource("components/my-work/MyWork.tsx");
  assert.match(myWork, /MissionHomeSummary/);
  const dashboard = readSource("components/research/topic/ResearchWorkspaceDashboard.tsx");
  assert.match(dashboard, /researchDashboard\./);
  assert.doesNotMatch(dashboard, /Research Dashboard/);
  const mobile = readSource("components/operating/LivingContextMobileToggle.tsx");
  assert.match(mobile, /shouldShowOperatingContextColumn/);
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.missionHome.eyebrow);
    assert.ok(dict.researchDashboard.eyebrow);
  }
});

test("28. Product unification — project panels and saved evidence i18n", () => {
  const saved = readSource("components/my-work/SavedEvidence.tsx");
  assert.match(saved, /savedEvidence\./);
  assert.match(saved, /EmptyState/);
  const evidence = readSource("components/project/ProjectEvidencePanel.tsx");
  assert.match(evidence, /projectPanel\./);
  assert.match(evidence, /ActivationStatusLine/);
  const timeline = readSource("components/project/ProjectTimelinePanel.tsx");
  assert.match(timeline, /projectPanel\.timelineEmpty/);
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.savedEvidence.empty);
    assert.ok(dict.projectPanel.evidenceAdded);
  }
});

test("29. Living platform — mission data revision and status feedback", () => {
  const hook = readSource("lib/hooks/use-mission-data-revision.ts");
  assert.match(hook, /MISSION_DATA_CHANGED/);
  const reports = readSource("lib/reports/reports-store.ts");
  assert.match(reports, /notifyMissionDataChanged\("report"\)/);
  const saveReportBtn = readSource("components/shared/SaveReportButton.tsx");
  assert.match(saveReportBtn, /ActivationStatusLine/);
  const bookmark = readSource("components/shared/SaveToWorkspaceButton.tsx");
  assert.match(bookmark, /activation\.bookmarkSaved/);
  const projects = readSource("components/project/ProjectList.tsx");
  assert.match(projects, /useMissionDataRevision/);
  assert.match(projects, /projectEvidenceCount/);
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.activation.graphUnknownsExplain);
    assert.ok(dict.activation.reportSaved);
  }
});

test("30. System integration — research activation, continuity, dead code removal", () => {
  const notes = readSource("components/research/topic/ResearchNotesPanel.tsx");
  assert.match(notes, /researchNotes\./);
  assert.match(notes, /ActivationStatusLine/);
  assert.match(notes, /useMissionDataRevision/);
  const lifecycle = readSource("components/research/topic/EvidenceLifecyclePanel.tsx");
  assert.match(lifecycle, /evidenceLifecycle\./);
  assert.match(lifecycle, /ActivationStatusLine/);
  const activity = readSource("components/research/topic/ResearchWorkspaceActivity.tsx");
  assert.match(activity, /useMissionDataRevision/);
  assert.match(activity, /EmptyState/);
  const search = readSource("components/search/gateway/SearchGatewayResults.tsx");
  assert.match(search, /recordEntityView/);
  const graph = readSource("components/graph/GraphPageClient.tsx");
  assert.match(graph, /prevFocus/);
  const workspace = readSource("components/research/workspace/ResearchWorkspacePageClient.tsx");
  assert.match(workspace, /RouteChromeFallback/);
  assert.doesNotMatch(readSource("app/(dashboard)/layout.tsx"), /fallback=\{null\}/);
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.researchNotes.notesEmpty);
    assert.ok(dict.evidenceLifecycle.stageCollected);
  }
});
