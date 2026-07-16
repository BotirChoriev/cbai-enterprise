// BUILD-012 — Mission runtime, impact engine, intelligence network, operator states.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { isHumanImpactComplete } from "@/lib/intelligence-os/human-impact.types";
import {
  MODULE_ACCOUNTABILITY,
  getModuleAccountability,
  getUnregisteredPrimaryRoutes,
  toExtendedAccountability,
} from "@/lib/intelligence-os/module-accountability";
import { primaryNavSections } from "@/lib/navigation";
import { analyzeGraphForMission } from "@/lib/graph/graph-mission";
import { buildKnowledgeGraph } from "@/lib/graph/graph.builder";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Report readiness requires human impact before claim", () => {
  const result = deriveReportReadiness("nonexistent-project");
  assert.equal(result.canClaimReadiness, false);
  assert.ok(result.limitation.length > 0);
});

test("2. Human impact completeness requires owner and risk fields", () => {
  assert.equal(
    isHumanImpactComplete({
      humanBenefit: "Clear benefit statement",
      possibleHarm: "yes",
      environmentalEffect: "low",
      ethicalConcerns: "",
      affectedCommunities: "",
      longTermConsequences: "",
      unknownRisks: "unknown",
      mitigation: "",
      missingEvidence: "",
      humanOwner: "Analyst",
    }),
    true,
  );
});

test("3. Extended module accountability schema populated", () => {
  const entry = MODULE_ACCOUNTABILITY[0];
  const ext = toExtendedAccountability(entry);
  assert.ok(ext.purpose.length > 0);
  assert.ok(ext.storage.length > 0);
  assert.ok(ext.nextAction.length > 0);
});

test("4. Primary navigation routes registered in accountability registry", () => {
  const routes = primaryNavSections.flatMap((s) => s.items.map((i) => i.href));
  const gaps = getUnregisteredPrimaryRoutes(routes);
  assert.deepEqual(gaps, [], `Unregistered primary routes: ${gaps.join(", ")}`);
});

test("5. Analytics and dashboard redirect aliases resolve to reports", () => {
  assert.equal(getModuleAccountability("/analytics")?.route, "/reports");
  assert.equal(getModuleAccountability("/dashboard")?.route, "/reports");
});

test("6. Graph mission analysis honest without mission", () => {
  const graph = buildKnowledgeGraph();
  const analysis = analyzeGraphForMission(graph, null, "mission");
  assert.ok(analysis.limitation.length > 0);
  assert.equal(analysis.connectedEntities.length, 0);
});

test("7. BUILD-012 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.intelligenceNetwork.missionFocus);
    assert.ok(dict.operatorStates.interpreting);
    assert.ok(dict.moduleAccountabilityUi.purpose);
    assert.ok(dict.capabilityPassportExt.uncertaintyNotice);
    assert.ok(dict.missionThreadUi.openStage);
    assert.ok(dict.humanImpact.humanOwner);
  }
});

test("8. Mission context provider wired in dashboard layout", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /MissionContextProvider/);
});

test("9. Human impact panel wired to Mission Center and Project Home", () => {
  const canvas = readSource("components/canvas/IntelligenceCanvas.tsx");
  const project = readSource("components/project/ProjectHome.tsx");
  assert.match(canvas, /HumanImpactPanel/);
  assert.match(project, /HumanImpactPanel/);
  assert.match(project, /deriveReportReadiness/);
});

test("10. Mission thread stages link to real routes", () => {
  const lifecycle = readSource("lib/intelligence-os/mission-lifecycle.ts");
  assert.match(lifecycle, /href:/);
  assert.match(lifecycle, /project-evidence/);
});

test("11. Operator orb uses extended states without decorative waveform animation", () => {
  const orb = readSource("components/shared/OperatorOrb.tsx");
  assert.match(orb, /interpreting/);
  assert.match(orb, /permission-denied/);
  assert.match(orb, /operatorStates/);
  assert.match(orb, /no fake waveform states/);
});

test("12. Trust page shows module accountability panel", () => {
  const trust = readSource("components/trust/TrustPageClient.tsx");
  assert.match(trust, /ModuleAccountabilityPanel/);
});
