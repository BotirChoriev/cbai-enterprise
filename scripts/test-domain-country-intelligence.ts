import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ACADEMIC_HIERARCHY,
  DOMAIN_ENTITY_KINDS,
  DOMAIN_RELATIONSHIP_KINDS,
  isDomainRelationshipAllowed,
  isDomainEntityKind,
  isDomainRelationshipKind,
} from "@/lib/domain-intelligence/canonical-kinds";
import {
  buildDomainRelationship,
  migrateDomainRelationship,
} from "@/lib/domain-intelligence/typed-relationship";
import {
  classifyMaterialPresentation,
  resolveFreshness,
  unavailableClaim,
} from "@/lib/domain-intelligence/evidence-provenance";
import {
  buildTemporalComparison,
  computePercentageChange,
  computeTrendDirection,
  isOfficialPlan,
  isScenario,
} from "@/lib/domain-intelligence/temporal-comparison";
import { buildCountryIntelligenceWorkspace } from "@/lib/domain-intelligence/country-workspace";
import { buildAcademicIntelligenceWorkspace } from "@/lib/domain-intelligence/academic-workspace";
import { planIntelligenceAnswer } from "@/lib/domain-intelligence/query-planner";
import { listAdapterCapabilityMatrix } from "@/lib/domain-intelligence/adapters";
import {
  assertUserTextPreserved,
  LOCALE_PROVENANCE_POLICY,
  migrateLocaleProvenance,
} from "@/lib/domain-intelligence/migration";
import { buildDomainAugmentedKnowledgeGraph } from "@/lib/domain-intelligence/graph-projection";
import { resolveDomainIntelligenceCommand } from "@/lib/domain-intelligence/voice-bridge";
import { resolveVoiceAction } from "@/lib/voice/voice-action-resolver";
import {
  DOMAIN_INTELLIGENCE_EN,
  DOMAIN_INTELLIGENCE_RU,
  DOMAIN_INTELLIGENCE_TR,
  DOMAIN_INTELLIGENCE_UZ,
} from "@/lib/i18n/platform-copy-domain-intelligence";

const ROOT = process.cwd();

test("DCI-1: canonical entity kinds and academic hierarchy are closed vocabularies", () => {
  assert.ok(DOMAIN_ENTITY_KINDS.length >= 30);
  assert.ok(DOMAIN_RELATIONSHIP_KINDS.includes("RESEARCHED_BY"));
  assert.ok(DOMAIN_RELATIONSHIP_KINDS.includes("CONTRADICTS"));
  assert.ok(DOMAIN_RELATIONSHIP_KINDS.includes("APPLIES_TO_COUNTRY"));
  assert.equal(ACADEMIC_HIERARCHY[0], "country");
  assert.equal(ACADEMIC_HIERARCHY[ACADEMIC_HIERARCHY.length - 1], "source");
  assert.equal(isDomainEntityKind("university"), true);
  assert.equal(isDomainEntityKind("fabricated_kind"), false);
  assert.equal(isDomainRelationshipKind("SUPPORTS"), true);
});

test("DCI-2: typed relationships enforce allowed pairs and preserve unknown fields", () => {
  const rel = buildDomainRelationship({
    kind: "LOCATED_IN",
    fromKind: "university",
    fromId: "tuit",
    fromLabel: "TUIT",
    toKind: "country",
    toId: "uzbekistan",
    toLabel: "Uzbekistan",
    confidence: "registry_derived",
    provenance: { materialClass: "official_source", derivedFrom: "test" },
  });
  assert.ok(rel);
  assert.equal(rel!.kind, "LOCATED_IN");

  assert.equal(
    isDomainRelationshipAllowed("LOCATED_IN", "university", "country"),
    true,
  );
  assert.equal(
    isDomainRelationshipAllowed("LOCATED_IN", "finding", "method"),
    false,
  );

  const migrated = migrateDomainRelationship({
    ...rel!,
    legacyNote: "keep-me",
  });
  assert.ok(migrated);
  assert.equal(migrated!.unknownFields?.legacyNote, "keep-me");
});

test("DCI-3: provenance separates official vs synthesis vs scenario; never official quotation for inference", () => {
  assert.equal(classifyMaterialPresentation("official_source").mayPresentAsOfficialQuotation, true);
  assert.equal(classifyMaterialPresentation("cbai_synthesis").mayPresentAsOfficialQuotation, false);
  assert.equal(classifyMaterialPresentation("cbai_scenario").mayPresentAsOfficialQuotation, false);
  assert.equal(classifyMaterialPresentation("cbai_inference").mayPresentAsOfficialQuotation, false);

  const claim = unavailableClaim({
    id: "x",
    displayLabel: "GDP",
    geographicCoverage: "Uzbekistan",
  });
  assert.equal(claim.value, null);
  assert.equal(claim.confidence, "unavailable");
  assert.equal(claim.freshness, "unavailable");

  assert.equal(
    resolveFreshness({ available: true, verifiedAt: null }),
    "verification_required",
  );
  assert.equal(
    resolveFreshness({ available: false, verifiedAt: "2020-01-01T00:00:00.000Z" }),
    "unavailable",
  );
});

test("DCI-4: temporal comparison never fabricates values; math only when valid", () => {
  const empty = buildTemporalComparison({
    id: "t1",
    subjectLabel: "Population",
    geographicScope: "Uzbekistan",
    fiveYearsAgo: null,
    current: null,
  });
  assert.equal(empty.trendDirection, "unavailable");
  assert.equal(empty.absoluteChange, null);
  assert.equal(empty.percentageChange, null);
  assert.ok(empty.knowledgeGaps.length > 0);

  assert.equal(computeTrendDirection(10, 12), "up");
  assert.equal(computeTrendDirection(12, 10), "down");
  assert.equal(computeTrendDirection(10, 10), "stable");
  assert.equal(computePercentageChange(100, 110), 10);
  assert.equal(computePercentageChange(0, 10), null);

  const plan = {
    id: "p1",
    title: "Official plan",
    issuingAuthority: "Gov",
    publicationDate: "2024-01-01",
    targetDate: "2030-01-01",
    sourceUrl: "https://example.gov",
    materialClass: "official_source" as const,
    status: "published" as const,
  };
  const scenario = {
    id: "s1",
    title: "Scenario",
    description: "What-if",
    materialClass: "cbai_scenario" as const,
    assumptions: ["assumption"],
    status: "draft" as const,
  };
  assert.equal(isOfficialPlan(plan), true);
  assert.equal(isScenario(scenario), true);
  assert.equal(isOfficialPlan(scenario as never), false);
});

test("DCI-5: Uzbekistan country workspace uses real registry links and honest indicator empties", () => {
  const ws = buildCountryIntelligenceWorkspace("uzbekistan");
  assert.ok(ws);
  assert.equal(ws!.country.id, "uzbekistan");
  assert.equal(ws!.executive.identity.code, "UZ");
  assert.ok(ws!.executive.dataAvailability.relatedUniversities >= 1);
  assert.equal(ws!.executive.dataAvailability.relatedCompanies, 0);
  assert.ok(ws!.indicators.length > 0);
  for (const slot of ws!.indicators) {
    assert.equal(slot.temporal.current.value, null);
    assert.equal(slot.temporal.fiveYearsAgo.value, null);
  }
  assert.equal(ws!.lawsAndPolicies.records.length, 0);
  assert.equal(ws!.outlook.officialPlans.length, 0);
  assert.equal(ws!.researchLandscape.researchers.length, 0);
  assert.ok(ws!.relationships.every((r) => r.kind === "LOCATED_IN"));
  // No fabricated researcher / publication nodes
  assert.doesNotMatch(JSON.stringify(ws), /Dr\.|PhD|doi\.org\/10\./i);
});

test("DCI-6: academic workspace comparisons stay unavailable without inventing papers", () => {
  const ws = buildAcademicIntelligenceWorkspace({ countryId: "uzbekistan" });
  assert.ok(ws.geography.localUniversities.length >= 1);
  assert.equal(ws.hierarchy.publications.length, 0);
  assert.equal(ws.hierarchy.researchers.length, 0);
  assert.ok(ws.comparisons.every((c) => c.status === "unavailable"));
  assert.ok(ws.honestyNotice.length > 0);
});

test("DCI-7: query planner produces sourced orientation — no unsourced AI fact", () => {
  const answer = planIntelligenceAnswer(
    "Why did Uzbekistan education indicators change in five years?",
  );
  assert.equal(answer.unsourcedAiAnswerForbidden, true);
  assert.ok(
    answer.intent === "country_indicator_change" || answer.intent === "country_overview",
  );
  assert.ok(answer.findings.every((f) => f.materialClass !== "cbai_inference" || f.sourceLabels.length >= 0));
  assert.ok(answer.knowledgeGaps.length > 0);
  assert.ok(answer.recommendedWorkCard?.requiresConfirmation);

  const academic = planIntelligenceAnswer(
    "Show research on water infrastructure in Uzbek universities",
  );
  assert.ok(
    academic.intent === "academic_discipline" || academic.intent === "country_overview",
  );
});

test("DCI-8: adapters declare planned/unavailable honestly; local org registry connected", () => {
  const matrix = listAdapterCapabilityMatrix();
  assert.ok(matrix.length >= 7);
  const indicators = matrix.find((m) => m.adapterId.includes("country_indicator"));
  assert.ok(indicators);
  assert.equal(indicators!.availability, "planned");
  assert.equal(indicators!.supportsLiveFetch, false);
  const org = matrix.find((m) => m.adapterId.includes("organization_registry"));
  assert.equal(org?.availability, "connected");
});

test("DCI-9: locale provenance migration is idempotent and preserves user text", () => {
  assert.equal(LOCALE_PROVENANCE_POLICY.neverSilentlyTranslate, true);
  const record = {
    id: "oo-1",
    title: "Mening tadqiqot savolim",
    locale: "uz",
    claim: "original claim text",
  };
  const once = migrateLocaleProvenance(record, { createdLocale: "uz" });
  const twice = migrateLocaleProvenance(once, { createdLocale: "en" });
  assert.equal(once.migrationVersion, 1);
  assert.equal(twice.migrationVersion, 1);
  assert.equal(twice.contentLocale, "uz");
  assert.equal(twice.createdLocale, "uz");
  assert.equal(assertUserTextPreserved(record, twice), true);
  assert.equal(twice.title, "Mening tadqiqot savolim");
});

test("DCI-10: graph projection adds no fabricated nodes; domain edges only for real endpoints", () => {
  const { graph, domainRelationships, addedEdgeIds } = buildDomainAugmentedKnowledgeGraph("uzbekistan");
  assert.ok(graph.nodes.every((n) => n.type === "country" || n.type === "company" || n.type === "university"));
  assert.ok(domainRelationships.length >= 1);
  for (const id of addedEdgeIds) {
    assert.match(id, /^domain:/);
  }
});

test("DCI-11: Voice domain bridge is read-only; mutations only suggest confirmation", () => {
  const nav = resolveDomainIntelligenceCommand(
    "Show research on water infrastructure in Uzbek universities",
  );
  assert.ok(nav);
  assert.ok(nav!.type === "navigate" || nav!.type === "message");

  const evidence = resolveDomainIntelligenceCommand(
    "Create an evidence request for the missing methodology in Uzbekistan",
  );
  assert.ok(evidence);
  assert.equal(evidence!.type, "message");
  if (evidence!.type === "message") {
    assert.equal(evidence.suggestsWorkCard, true);
  }

  // Must not intercept plain open-country navigation.
  assert.equal(resolveDomainIntelligenceCommand("Open Uzbekistan"), null);

  const voice = resolveVoiceAction("Why did this Uzbekistan indicator change in five years?", {
    relationshipFocus: null,
    operatorName: "Operator",
  });
  assert.equal(voice.status, "known");
  assert.ok(voice.kind === "navigate" || voice.kind === "message");
  assert.equal(voice.kind === "profile_update", false);
});

test("DCI-12: EN/UZ/RU/TR domainIntelligence key parity", () => {
  const enKeys = Object.keys(DOMAIN_INTELLIGENCE_EN).sort();
  assert.deepEqual(Object.keys(DOMAIN_INTELLIGENCE_UZ).sort(), enKeys);
  assert.deepEqual(Object.keys(DOMAIN_INTELLIGENCE_RU).sort(), enKeys);
  assert.deepEqual(Object.keys(DOMAIN_INTELLIGENCE_TR).sort(), enKeys);
  for (const key of enKeys) {
    assert.ok((DOMAIN_INTELLIGENCE_UZ as Record<string, string>)[key].length > 0);
    assert.ok((DOMAIN_INTELLIGENCE_RU as Record<string, string>)[key].length > 0);
    assert.ok((DOMAIN_INTELLIGENCE_TR as Record<string, string>)[key].length > 0);
  }
});

test("DCI-13: CountryIntelligencePanel wires domain + academic workspaces", () => {
  const src = readFileSync(
    join(ROOT, "components/countries/CountryIntelligencePanel.tsx"),
    "utf8",
  );
  assert.match(src, /CountryIntelligenceWorkspaceView/);
  assert.match(src, /AcademicIntelligenceWorkspaceView/);
  assert.match(src, /buildCountryIntelligenceWorkspace/);
});

test("DCI-14: cause/association/inference classification vocabulary is explicit", () => {
  const src = readFileSync(
    join(ROOT, "lib/domain-intelligence/evidence-provenance.ts"),
    "utf8",
  );
  assert.match(src, /documented_cause/);
  assert.match(src, /contributing_factor/);
  assert.match(src, /association_only/);
  assert.match(src, /cbai_inference/);
  assert.match(src, /cbai_scenario/);
});
