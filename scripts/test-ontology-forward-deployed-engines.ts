/**
 * Ontology + Forward-Deployed Engines regression suite.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ONTOLOGY_OBJECT_KINDS, isOntologyObjectKind } from "@/lib/ontology/object-kinds";
import { isRelationshipAllowed, ONTOLOGY_RELATIONSHIP_KINDS } from "@/lib/ontology/relationship-kinds";
import { validateOntologyDraft } from "@/lib/ontology/validation";
import { draftToRecord } from "@/lib/ontology/normalization";
import { migrateOntologyStore } from "@/lib/ontology/migrations";
import { operationalObjectToOntologyDraft } from "@/lib/ontology/legacy-adapters";
import type { OperationalObject } from "@/lib/operational-objects/operational-object.types";
import { listEngineDefinitions, isForwardDeployedEngineId } from "@/lib/forward-deployed-engines/engine-registry";
import { runEnginePlanner } from "@/lib/forward-deployed-engines/engine-planner";
import { canExecuteEngine, isActionAllowlisted, planIntegrityCheck } from "@/lib/forward-deployed-engines/engine-policy";
import { resolvePlatformActionFromIntent } from "@/lib/platform-actions/resolve-platform-action";
import { matchEngineIntent } from "@/lib/platform-actions/engine-intent-matcher";
import { isAllowedNavigationHref } from "@/lib/platform-actions/registry";
import { FORWARD_DEPLOYED_EN } from "@/lib/i18n/platform-copy-forward-deployed-en";
import { FORWARD_DEPLOYED_UZ } from "@/lib/i18n/platform-copy-forward-deployed-uz";
import { FORWARD_DEPLOYED_RU } from "@/lib/i18n/platform-copy-forward-deployed-ru";
import { FORWARD_DEPLOYED_TR } from "@/lib/i18n/platform-copy-forward-deployed-tr";

test("1. Ontology — canonical object kinds registered", () => {
  assert.equal(ONTOLOGY_OBJECT_KINDS.length, 27);
  assert.ok(isOntologyObjectKind("claim"));
  assert.ok(!isOntologyObjectKind("fake_kind"));
});

test("2. Ontology — typed relationships allowlist", () => {
  assert.ok(ONTOLOGY_RELATIONSHIP_KINDS.includes("supported_by"));
  assert.ok(isRelationshipAllowed("contains", "project", "task"));
  assert.ok(!isRelationshipAllowed("supported_by", "project", "task"));
});

test("3. Ontology — validation rejects empty title", () => {
  const result = validateOntologyDraft({
    kind: "task",
    title: "",
    contentLocale: "en",
    createdLocale: "en",
    provenance: { source: "user_created" },
  });
  assert.equal(result.valid, false);
});

test("4. Ontology — migration preserves unknown fields", () => {
  const { objects, result } = migrateOntologyStore([
    {
      id: "task-test-1",
      kind: "task",
      title: "Legacy task",
      description: "desc",
      status: "active",
      contentLocale: "en",
      createdLocale: "en",
      provenance: { source: "legacy_adapter" },
      sourceReferences: [],
      relationshipIds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      schemaVersion: 1,
      metadata: {},
      legacyCustomField: "preserved",
    },
  ]);
  assert.equal(objects.length, 1);
  assert.equal((objects[0] as Record<string, unknown>).legacyCustomField, "preserved");
  assert.ok(result.unknownFieldsPreserved >= 1);
});

test("5. Ontology — idempotent migration", () => {
  const raw = [{ id: "task-a", kind: "task", title: "A", contentLocale: "en", createdLocale: "en", provenance: { source: "user_created" } }];
  const first = migrateOntologyStore(raw);
  const second = migrateOntologyStore(first.objects);
  assert.equal(first.objects.length, second.objects.length);
});

test("6. Legacy adapter — operational object maps without data loss", () => {
  const oo: OperationalObject = {
    id: "oo-1",
    version: 1,
    type: "research_question",
    title: "Water quality in Uzbekistan",
    summary: "summary",
    objective: "obj",
    rationale: "",
    expectedOutcome: "",
    domain: "research",
    status: "draft",
    priority: "normal",
    requiredInputs: [],
    evidenceRequirements: [],
    nextAction: "",
    humanDecision: "",
    relatedObjectIds: [],
    locale: "uz",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    provenance: { source: "typed_command", locale: "uz" },
  };
  const draft = operationalObjectToOntologyDraft(oo);
  assert.equal(draft.kind, "research_question");
  assert.equal(draft.provenance.legacyRecordId, "oo-1");
  assert.equal(draft.contentLocale, "uz");
});

test("7. Engine registry — 7 initial engines", () => {
  const engines = listEngineDefinitions();
  assert.equal(engines.length, 7);
  assert.ok(isForwardDeployedEngineId("research"));
  assert.ok(isForwardDeployedEngineId("multilingual_meeting"));
});

test("8. Engine lifecycle — plan requires confirmation before execute", () => {
  const plan = runEnginePlanner({
    engineId: "research",
    objective: { statement: "Kimyo bo'yicha tadqiqot", locale: "uz", domain: "chemistry" },
    context: { pathname: "/research", locale: "uz" },
  });
  assert.ok(plan.clarifiedObjective.includes("Kimyo"));
  assert.ok(plan.mutationRequired);
  const integrity = planIntegrityCheck(plan);
  assert.equal(integrity.allowed, true);

  const fakeRun = {
    id: "run-1",
    engineId: "research" as const,
    engineVersion: "1.0.0",
    schemaVersion: 1 as const,
    state: "planning" as const,
    objective: { statement: "test", locale: "en" as const },
    context: { pathname: "/", locale: "en" as const },
    plan,
    ontologyObjectIds: [],
    auditTrail: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  assert.equal(canExecuteEngine(fakeRun).allowed, false);
});

test("9. Engine policy — allowlisted actions only", () => {
  assert.ok(isActionAllowlisted("research", "operational_object.compose"));
  assert.ok(!isActionAllowlisted("research", "navigate.fake"));
});

test("10. Platform actions — engine intent Uzbek research phrase", () => {
  const intent = matchEngineIntent("Kimyo bo'yicha yangi tadqiqot boshlamoqchiman");
  assert.ok(intent);
  assert.equal(intent?.actionId, "engine.research.start");
});

test("11. Platform actions — governance review intent", () => {
  const intent = matchEngineIntent("Ushbu xulosani governance tekshiruvidan o'tkaz");
  assert.ok(intent);
  assert.equal(intent?.actionId, "engine.governance.start");
});

test("12. Platform actions — no arbitrary navigation hrefs", () => {
  assert.ok(!isAllowedNavigationHref("/admin/delete-all"));
  assert.ok(!isAllowedNavigationHref("javascript:alert(1)"));
  assert.ok(isAllowedNavigationHref("/knowledge"));
});

test("13. Platform actions — engine start returns engineStart not mutation", () => {
  const intent = matchEngineIntent("Kimyo bo'yicha yangi tadqiqot boshlamoqchiman");
  assert.ok(intent);
  const result = resolvePlatformActionFromIntent(intent!, {
    locale: "uz",
    pathname: "/research",
    originalText: intent!.originalText,
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(result.engineStart);
    assert.equal(result.mutation, undefined);
  }
});

test("14. Evidence engine — read-only default", () => {
  const plan = runEnginePlanner({
    engineId: "evidence",
    objective: { statement: "United States bo'yicha mavjud dalillarni ko'rsat", locale: "uz" },
    context: { pathname: "/knowledge", locale: "uz", countryCode: "usa" },
  });
  assert.equal(plan.mutationRequired, false);
});

test("15. Government vs Governance — distinct engine and navigation", () => {
  const govIntent = matchEngineIntent("governance tekshiruvidan o'tkaz");
  assert.equal(govIntent?.actionId, "engine.governance.start");
});

test("16. Locale completeness — forwardDeployed EN/UZ/RU/TR", () => {
  for (const copy of [FORWARD_DEPLOYED_EN, FORWARD_DEPLOYED_UZ, FORWARD_DEPLOYED_RU, FORWARD_DEPLOYED_TR]) {
    assert.ok(copy.workspaceTitle.length > 0);
    assert.ok(copy.engines.research.length > 0);
    assert.ok(copy.statusBadge.awaiting_confirmation.length > 0);
  }
});

test("17. Multilingual meeting — honest limitation copy", () => {
  const plan = runEnginePlanner({
    engineId: "multilingual_meeting",
    objective: { statement: "English and Uzbek", locale: "en" },
    context: { pathname: "/", locale: "en" },
  });
  assert.ok(plan.limitations.some((l) => /not implemented|emas|не|değil/i.test(l.description)));
});

test("18. Normalization — draft to record carries locale provenance", () => {
  const record = draftToRecord({
    kind: "mission",
    title: "Test mission",
    contentLocale: "tr",
    createdLocale: "tr",
    provenance: { source: "user_created", userProvidedFields: ["title"] },
  });
  assert.equal(record.contentLocale, "tr");
  assert.equal(record.createdLocale, "tr");
});

test("19. Hydration stability — engine workspace uses client-only bridge", () => {
  const provider = readFileSync("components/forward-deployed/EngineWorkspaceProvider.tsx", "utf8");
  assert.match(provider, /registerEngineStartListener/);
  assert.match(provider, /useEffect/);
});

test("20. Source vs UI copy — official source note in evidence requirements component", () => {
  const panel = readFileSync("components/forward-deployed/EvidenceRequirements.tsx", "utf8");
  assert.match(panel, /officialSourceNote/);
});

test("21. Route integration — engine entry strip mounts on core surfaces", () => {
  const strip = readFileSync("components/forward-deployed/EngineRouteEntryStrip.tsx", "utf8");
  assert.match(strip, /\/countries/);
  assert.match(strip, /\/government/);
  assert.match(strip, /\/graph/);
  assert.match(strip, /prefix !== "\/"/);
  const entityShell = readFileSync("components/shared/EntityExploreShell.tsx", "utf8");
  assert.match(entityShell, /EngineRouteEntryStrip/);
  const graph = readFileSync("components/graph/GraphPageClient.tsx", "utf8");
  assert.match(graph, /EngineRouteEntryStrip/);
  const governance = readFileSync("components/governance-control/GovernancePageClient.tsx", "utf8");
  assert.match(governance, /EngineRouteEntryStrip/);
  const reports = readFileSync("components/reports/ReportsCenter.tsx", "utf8");
  assert.match(reports, /EngineRouteEntryStrip/);
  const government = readFileSync("components/workspaces/GovernmentPageClient.tsx", "utf8");
  assert.match(government, /EngineRouteEntryStrip/);
});
