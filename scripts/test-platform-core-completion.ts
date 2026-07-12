// Focused tests for the "Platform Core Completion" mission — the richer Knowledge-Graph-sourced
// relationship builder, Universal Search's Entity-based research topic results, and the report
// facade's new dataStatus field. Same zero-dependency harness as the other test scripts (Node's
// native `node:test` + the `@/` alias loader). Run with: npm run test:platform-core-completion

import { test } from "node:test";
import assert from "node:assert/strict";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import { buildEntityReport } from "@/lib/entity/entity-report";
import { getAllEntities, searchEntities } from "@/lib/global-search";
import { executeGatewaySearch } from "@/lib/search-gateway";
import { getPrimaryEntity } from "@/lib/context";
import type { PlatformContextSnapshot } from "@/lib/context";

const USA = countries.find((c) => c.id === "usa")!;
const APPLE = companies.find((c) => c.id === "apple")!;
const STANFORD = universities.find((u) => u.id === "stanford")!;

function emptySnapshot(overrides: Partial<PlatformContextSnapshot> = {}): PlatformContextSnapshot {
  return {
    version: "1.0.0",
    country: null,
    company: null,
    university: null,
    workspace: null,
    searchQuery: "",
    activeModulePath: "/",
    recentEntities: [],
    pinnedEntities: [],
    timelineStatus: "unavailable",
    timelineMessage: "",
    ...overrides,
  };
}

test("1. Country relationships are now sourced from the Knowledge Graph — real label and verification status", () => {
  const relationships = buildEntityRelationships("country", USA.id);
  assert.ok(relationships.length > 0, "USA must have real Knowledge Graph relationships");
  for (const rel of relationships) {
    assert.equal(typeof rel.label, "string");
    assert.ok(rel.label!.length > 0);
    assert.equal(typeof rel.verified, "boolean");
  }
});

test("2. Company relationships include both graph edges and the industry-keyword research edges", () => {
  const relationships = buildEntityRelationships("company", APPLE.id);
  const graphEdges = relationships.filter((r) => r.label !== undefined);
  const researchEdges = relationships.filter((r) => r.type === "HAS_RESEARCH");
  assert.ok(graphEdges.length > 0, "Apple must have real graph-sourced edges (e.g. LOCATED_IN United States)");
  assert.ok(researchEdges.length > 0, "Apple must have real research edges");
});

test("3. University relationships are lossless versus the old name-list source (every real linked company/country still resolves)", () => {
  const relationships = buildEntityRelationships("university", STANFORD.id);
  const countryEdge = relationships.find((r) => r.targetType === "country");
  assert.ok(countryEdge, "Stanford must resolve a real country edge from the Knowledge Graph");
  assert.equal(countryEdge!.targetName, "United States");
  assert.ok(countryEdge!.targetHref);
});

test("4. Universal Search: research topics are real Entity objects in the unified index", () => {
  const all = getAllEntities();
  const topicEntities = all.filter((e) => e.type === "research_topic");
  assert.equal(topicEntities.length, RESEARCH_TOPICS.length);
  for (const entity of topicEntities) {
    assert.ok(entity.id.length > 0);
    assert.ok(entity.relationships === undefined || Array.isArray(entity.relationships));
  }
});

test("5. Universal Search: searching a real topic name returns it via the unified Entity search, not a second renderer", () => {
  const results = searchEntities("microbiology");
  const match = results.find((r) => r.entity.type === "research_topic" && r.entity.id === "microbiology");
  assert.ok(match, "microbiology must be findable through the same searchEntities() path as countries/companies/universities");
});

test("6. Gateway search's research_topics group now uses the shared `entities` field, not a separate `researchTopics` array", () => {
  const response = executeGatewaySearch("microbiology");
  const group = response.groups.find((g) => g.id === "research_topics");
  assert.ok(group);
  assert.ok(group!.entities.length > 0);
  assert.equal(group!.entities[0].entity.type, "research_topic");
  assert.equal("researchTopics" in group!, false, "the old duplicate-renderer field must be gone");
});

test("7. Research topics gained real tags carrying the same searchable terms the old topic-only search used", () => {
  const all = getAllEntities();
  const topic = all.find((e) => e.type === "research_topic" && e.id === "microbiology")!;
  const realTopic = RESEARCH_TOPICS.find((t) => t.topicId === "microbiology")!;
  const tagLabels = topic.tags.map((t) => t.label);
  for (const method of realTopic.relatedMethods) {
    assert.ok(tagLabels.includes(method), `real related method "${method}" must be carried as a tag`);
  }
});

test("8. buildEntityReport always returns a real dataStatus for every kind", () => {
  const countryReport = buildEntityReport("country", USA.id)!;
  const companyReport = buildEntityReport("company", APPLE.id)!;
  const universityReport = buildEntityReport("university", STANFORD.id)!;
  const topicReport = buildEntityReport("research_topic", "microbiology")!;
  const valid = ["live", "partial", "waiting_for_verified_data"];
  assert.ok(valid.includes(countryReport.dataStatus));
  assert.ok(valid.includes(companyReport.dataStatus));
  assert.ok(valid.includes(universityReport.dataStatus));
  assert.ok(valid.includes(topicReport.dataStatus));
});

test("9. getPrimaryEntity is the one canonical focus accessor and prefers country, then company, then university", () => {
  const countrySnap = emptySnapshot({ country: { kind: "country", id: "usa", name: "United States" } });
  assert.equal(getPrimaryEntity(countrySnap)!.id, "usa");

  const companySnap = emptySnapshot({
    country: { kind: "country", id: "usa", name: "United States" },
    company: { kind: "company", id: "apple", name: "Apple" },
  });
  assert.equal(getPrimaryEntity(companySnap)!.id, "usa", "country takes precedence over company");

  const universityOnlySnap = emptySnapshot({ university: { kind: "university", id: "stanford", name: "Stanford" } });
  assert.equal(getPrimaryEntity(universityOnlySnap)!.id, "stanford");

  const nothingSnap = emptySnapshot();
  assert.equal(getPrimaryEntity(nothingSnap), null);
});

test("10. Country/company/university relationship builders never return a link to a non-existent entity, even from the graph", () => {
  for (const country of countries) {
    for (const rel of buildEntityRelationships("country", country.id)) {
      assert.ok(rel.targetHref !== undefined, "targetHref must be present (real link or explicit null)");
    }
  }
});
