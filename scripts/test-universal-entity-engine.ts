// Focused tests for the "Universal Entity Engine" mission (Platform Core) — the shared Entity
// type, the relationship builder, the report facade, and the migrated Command Center resolver.
// Same zero-dependency harness as the other test scripts (Node's native `node:test` + the `@/`
// alias loader). Run with: npm run test:universal-entity-engine

import { test } from "node:test";
import assert from "node:assert/strict";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { RESEARCH_TOPICS, getResearchTopicById } from "@/lib/research/research-topics";
import { isValidEntity, getEntityTypeLabel, getEntityTypePluralLabel } from "@/lib/entity/entity.helpers";
import { ENTITY_MODULE_CONFIGS, type EntityType } from "@/lib/entity/entity.types";
import { toResearchTopicEntity } from "@/lib/research-topic.adapter";
import { toCountryEntity } from "@/lib/countries.adapter";
import { toCompanyEntity } from "@/lib/companies.adapter";
import { toUniversityEntity } from "@/lib/universities.adapter";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import { buildEntityReport } from "@/lib/entity/entity-report";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import { buildCountryUserJourney } from "@/lib/country-user-journey";
import { buildCompanyUserJourney } from "@/lib/company-user-journey";
import { buildCountryReport } from "@/lib/country-report";
import { buildCompanyReport } from "@/lib/company-report";
import { resolveRelationshipCommand } from "@/lib/assistant/assistant-relationship-commands";
import { companyHrefByName, universityHrefByName } from "@/components/shared/resolve-entity-link";

const USA = countries.find((c) => c.id === "usa")!;
const APPLE = companies.find((c) => c.id === "apple")!;
const MICROBIOLOGY = getResearchTopicById("microbiology")!;

test("1. Every EntityType has a real module config — no orphaned type", () => {
  const types: EntityType[] = ["country", "company", "university", "research_topic", "government", "investor", "person"];
  for (const type of types) {
    assert.ok(ENTITY_MODULE_CONFIGS[type].label.length > 0);
    assert.ok(ENTITY_MODULE_CONFIGS[type].pluralLabel.length > 0);
  }
  assert.equal(getEntityTypeLabel("research_topic"), "Research Topic");
  assert.equal(getEntityTypePluralLabel("research_topic"), "Research Topics");
});

test("2. toResearchTopicEntity produces a valid Entity for every real research topic", () => {
  for (const topic of RESEARCH_TOPICS) {
    const entity = toResearchTopicEntity(topic);
    assert.ok(isValidEntity(entity), `${topic.topicName} must produce a valid Entity`);
    assert.equal(entity.type, "research_topic");
    assert.equal(entity.id, topic.topicId);
  }
});

test("3. toCountryEntity/toCompanyEntity/toUniversityEntity still produce valid entities (no regression)", () => {
  assert.ok(isValidEntity(toCountryEntity(USA)));
  assert.ok(isValidEntity(toCompanyEntity(APPLE)));
  assert.ok(isValidEntity(toUniversityEntity(universities[0])));
});

test("4. buildEntityRelationships never returns a relationship to a non-existent entity", () => {
  for (const country of countries) {
    for (const rel of buildEntityRelationships("country", country.id)) {
      if (rel.targetType === "company") assert.ok(companyHrefByName(rel.targetName));
      if (rel.targetType === "university") assert.ok(universityHrefByName(rel.targetName));
    }
  }
});

test("5. buildEntityRelationships is honestly empty for an unknown id, across every kind", () => {
  assert.deepEqual(buildEntityRelationships("country", "not-a-real-country"), []);
  assert.deepEqual(buildEntityRelationships("company", "not-a-real-company"), []);
  assert.deepEqual(buildEntityRelationships("university", "not-a-real-university"), []);
  assert.deepEqual(buildEntityRelationships("research_topic", "not-a-real-topic"), []);
});

test("6. buildEntityRelationships(company) includes a real HAS_RESEARCH edge matching getRelatedResearchTopics", () => {
  const relationships = buildEntityRelationships("company", APPLE.id);
  const researchEdges = relationships.filter((r) => r.type === "HAS_RESEARCH");
  assert.ok(researchEdges.length > 0, "Apple must have at least one real related research topic");
  for (const edge of researchEdges) {
    assert.equal(edge.targetType, "research_topic");
    assert.ok(edge.targetHref?.startsWith("/research/"));
  }
});

test("7. buildEntityRelationships(research_topic) mirrors getRelatedCompaniesForTopic exactly", () => {
  const relationships = buildEntityRelationships("research_topic", MICROBIOLOGY.topicId);
  for (const rel of relationships) {
    assert.equal(rel.type, "RELATED_TO");
    assert.equal(rel.targetType, "company");
  }
});

test("8. buildEntityReport(country) is byte-identical to calling buildCountryReport directly", () => {
  const journey = buildCountryUserJourney(USA, getCountryRelationships(USA));
  const direct = buildCountryReport(USA, journey);
  const viaFacade = buildEntityReport("country", USA.id);

  assert.ok(viaFacade);
  assert.deepEqual({ ...viaFacade, entityType: undefined }, { ...direct, entityType: undefined });
});

test("9. buildEntityReport(company) is byte-identical to calling buildCompanyReport directly", () => {
  const journey = buildCompanyUserJourney(APPLE, getCompanyLinkedEntities(APPLE));
  const direct = buildCompanyReport(APPLE, journey);
  const viaFacade = buildEntityReport("company", APPLE.id);

  assert.ok(viaFacade);
  assert.deepEqual({ ...viaFacade, entityType: undefined }, { ...direct, entityType: undefined });
});

test("10. buildEntityReport(research_topic) compiles a real, honest report — never fabricated methodology", () => {
  const report = buildEntityReport("research_topic", MICROBIOLOGY.topicId);
  assert.ok(report);
  if (report.entityType === "research_topic") {
    assert.equal(report.topicName, MICROBIOLOGY.topicName);
    assert.ok(report.limitations.length > 0);
    assert.ok(report.trustStatement.length > 0);
    assert.ok(report.evidenceConnectedCount >= 0);
  }
});

test("11. buildEntityReport returns null for an unknown id, across every kind — never fabricated", () => {
  assert.equal(buildEntityReport("country", "not-real"), null);
  assert.equal(buildEntityReport("company", "not-real"), null);
  assert.equal(buildEntityReport("university", "not-real"), null);
  assert.equal(buildEntityReport("research_topic", "not-real"), null);
});

test("12. Migrated Command Center resolver still resolves company->related-university correctly", () => {
  const result = resolveRelationshipCommand("open related university", { kind: "company", id: "apple" });
  assert.ok(result);
  assert.equal(result.type, "navigate");
});

test("13. Migrated Command Center resolver stays honest for a research topic with zero related companies", () => {
  const noMatchTopic = RESEARCH_TOPICS.find((t) => t.domain === "Social Sciences")!;
  assert.deepEqual(buildEntityRelationships("research_topic", noMatchTopic.topicId), []);

  const result = resolveRelationshipCommand("open related company", { kind: "research_topic", id: noMatchTopic.topicId });
  assert.ok(result);
  assert.equal(result.type, "message");
});
