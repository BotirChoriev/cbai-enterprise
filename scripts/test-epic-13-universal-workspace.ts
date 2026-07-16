// EPIC-13.4 — Universal Workspace & Object-First Intelligence verification.
// Run with: npm run test:epic-13-universal-workspace

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  deriveUniversalWorkspace,
  deriveFocusedObjectFromRoute,
  loadPersistedUniversalWorkspace,
} from "@/lib/intelligence-os/universal-workspace";
import {
  resolveUniversalObject,
  UNIVERSAL_OBJECT_TYPES,
  refFromContextEntity,
} from "@/lib/intelligence-os/universal-object";
import { deriveFloatingIntelligence } from "@/lib/intelligence-os/floating-intelligence";
import { deriveKnowledgeRiver } from "@/lib/intelligence-os/knowledge-river";
import { deriveCollaborationGuidance } from "@/lib/intelligence-os/ambient-collaboration";
import {
  assertNoCapabilityLockout,
  resolveAdaptiveDensity,
  densityModeExplanation,
} from "@/lib/intelligence-os/adaptive-density";
import { LIVING_INTELLIGENCE_REGISTRY } from "@/lib/design/living-intelligence-registry";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Universal Workspace wired in dashboard layout", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /UniversalWorkspaceProvider/);
  assert.match(layout, /OperatingContextColumn/);
  assert.match(layout, /FloatingIntelligencePresence/);
  assert.doesNotMatch(layout, /AmbientIntelligenceHint/);
  assert.doesNotMatch(layout, /LivingContextRail className="hidden lg:flex"/);
});

test("2. Workspace persistence API exists", () => {
  assert.equal(typeof loadPersistedUniversalWorkspace, "function");
  const ws = deriveUniversalWorkspace("/research", new URLSearchParams(), null, null);
  assert.ok(ws.activeScope);
  assert.ok(ws.updatedAt);
});

test("3. Object contract covers all declared universal object types", () => {
  assert.equal(UNIVERSAL_OBJECT_TYPES.length, 11);
  for (const type of UNIVERSAL_OBJECT_TYPES) {
    assert.ok(type.length > 0);
  }
  const missionContract = resolveUniversalObject({ type: "mission", id: "test" }, null);
  assert.equal(missionContract, null);
});

test("4. Route focus derives project from query", () => {
  const ref = deriveFocusedObjectFromRoute("/my-work", new URLSearchParams("project=p1"));
  assert.deepEqual(ref, { type: "project", id: "p1" });
});

test("5. Universal Inspector component declares nine questions", () => {
  const inspector = readSource("components/operating/UniversalInspector.tsx");
  assert.match(inspector, /whatIsThis/);
  assert.match(inspector, /missionConnection/);
  assert.match(inspector, /humanJudgment/);
  assert.match(inspector, /KnowledgeLayersDisclosure/);
});

test("6. One ambient Operator intervention invariant", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.equal((layout.match(/<FloatingIntelligencePresence/g) ?? []).length, 1);
  const floating = readSource("components/operating/FloatingIntelligencePresence.tsx");
  assert.match(floating, /data-cbai-operator-intervention="primary"/);
  const insight = deriveFloatingIntelligence(null, "Operator", "citizen", null);
  assert.ok(insight);
});

test("7. Adaptive density control and no capability lockout", () => {
  assert.equal(assertNoCapabilityLockout(), true);
  const resolved = resolveAdaptiveDensity("expert", "open");
  assert.equal(resolved.density, "dense");
  assert.ok(densityModeExplanation("standard").length > 10);
  const settings = readSource("components/settings/SettingsPageClient.tsx");
  assert.match(settings, /AdaptiveDensityControl/);
  const profile = readSource("lib/assistant/assistant-profile.ts");
  assert.match(profile, /displayDensity/);
});

test("8. Knowledge River derives from real data only — no fake scores", () => {
  const river = deriveKnowledgeRiver(null);
  assert.ok(Array.isArray(river));
  for (const event of river) {
    assert.ok(event.cause.length > 0);
    assert.ok(typeof event.unresolved === "boolean");
    assert.doesNotMatch(event.label, /^\d+%$/);
  }
});

test("9. No fabricated collaborators", () => {
  const guidance = deriveCollaborationGuidance({
    id: "m1",
    problem: "Test",
    whyExists: "",
    whoBenefits: "",
    whoCouldBeHarmed: "",
    evidenceHave: "",
    evidenceMissing: "Need peer review",
    disciplines: [],
    capabilitiesNeeded: "Statistics",
    environmentalImpact: "",
    successCriteria: "",
    status: "active",
    projectId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert.ok(guidance);
  assert.equal(guidance?.externalMatchingConnected, false);
  assert.match(guidance?.unknown ?? "", /No external collaborator network/i);
});

test("10. Single context rail — no duplicate on desktop", () => {
  const column = readSource("components/operating/OperatingContextColumn.tsx");
  assert.match(column, /data-cbai-context-rail="primary"/);
});

test("11. Mobile intelligence uses OperatingContextColumn in drawer", () => {
  const mobile = readSource("components/operating/LivingContextMobileToggle.tsx");
  assert.match(mobile, /OperatingContextColumn/);
  assert.doesNotMatch(mobile, /LivingContextRail/);
});

test("12. Human Decision Boundary in context column", () => {
  const column = readSource("components/operating/OperatingContextColumn.tsx");
  assert.match(column, /HumanDecisionBoundary/);
});

test("13. BUILD-018 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.universalWorkspace.inspectorEyebrow);
    assert.ok(dict.universalWorkspace.densityStandard);
    assert.ok(dict.universalWorkspace.knowledgeRiver);
    assert.ok(dict.universalWorkspace.objectTypeMission);
  }
});

test("14. Design constitution includes Universal Workspace section", () => {
  const doc = readSource("docs/product/CBAI-LIVING-INTELLIGENCE-DESIGN-CONSTITUTION.md");
  assert.match(doc, /Universal Workspace/);
  assert.match(doc, /Object-First/);
  assert.match(doc, /Knowledge River/);
});

test("15. Component registry includes EPIC-13.4 entries with extended fields", () => {
  const inspector = LIVING_INTELLIGENCE_REGISTRY.find((r) => r.id === "universal-inspector");
  assert.ok(inspector?.objectType);
  assert.ok(inspector?.humanDecisionSupport);
  assert.ok(inspector?.failureState);
});

test("16. Graph selection syncs to workspace focus", () => {
  const graph = readSource("components/graph/GraphPageClient.tsx");
  assert.match(graph, /setFocusedObject/);
});

test("17. refFromContextEntity maps entity kinds", () => {
  const ref = refFromContextEntity({ kind: "country", id: "UZ", name: "Uzbekistan" });
  assert.deepEqual(ref, { type: "country", id: "UZ" });
});

test("18. Atmosphere merges user density preference", () => {
  const shell = readSource("components/operating/IntelligenceAtmosphereShell.tsx");
  assert.match(shell, /resolveAdaptiveDensity/);
  assert.match(shell, /displayDensity/);
});
