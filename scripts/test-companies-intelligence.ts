// Focused tests for the "Companies Intelligence" activation mission — bidirectional navigation,
// the honest Company<->Research subject-matter connection, real report compilation, and the new
// Command Center commands. Same zero-dependency harness as the other test scripts (Node's native
// `node:test` + the `@/` alias loader). Run with: npm run test:companies-intelligence

import { test } from "node:test";
import assert from "node:assert/strict";
import { companies } from "@/lib/companies";
import { countries } from "@/lib/countries";
import { universities } from "@/lib/universities";
import {
  countryHrefByName,
  companyHrefByName,
  universityHrefByName,
  hrefForEntity,
} from "@/components/shared/resolve-entity-link";
import { getRelatedResearchTopics, getRelatedCompaniesForTopic } from "@/lib/company-research";
import { RESEARCH_TOPICS, getResearchTopicById } from "@/lib/research/research-topics";
import { buildCompanyReport } from "@/lib/company-report";
import { buildCompanyUserJourney } from "@/lib/company-user-journey";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import { loadPinnedEntities, pinEntity } from "@/lib/context";

const APPLE = companies.find((c) => c.id === "apple")!;
const MICROBIOLOGY = getResearchTopicById("microbiology")!;

test("1. Real country names resolve to real country links", () => {
  for (const country of countries) {
    assert.equal(countryHrefByName(country.name), `/countries?country=${country.id}`);
  }
});

test("2. Real company names resolve to real company links", () => {
  for (const company of companies) {
    assert.equal(companyHrefByName(company.name), `/companies?company=${company.id}`);
  }
});

test("3. Real university names resolve to real university links", () => {
  for (const university of universities) {
    assert.equal(universityHrefByName(university.name), `/universities?university=${university.id}`);
  }
});

test("4. Unknown names never resolve to a fabricated link", () => {
  assert.equal(countryHrefByName("Not A Real Country"), null);
  assert.equal(companyHrefByName("Not A Real Company"), null);
  assert.equal(universityHrefByName("Not A Real University"), null);
});

test("5. hrefForEntity dispatches correctly by entity type", () => {
  assert.equal(hrefForEntity("company", "Apple"), "/companies?company=apple");
  assert.equal(hrefForEntity("country", "Japan"), "/countries?country=japan");
});

test("6. Company-Research matches only ever reference real catalog topics", () => {
  const matches = getRelatedResearchTopics(APPLE);
  const realIds = new Set(RESEARCH_TOPICS.map((t) => t.topicId));
  for (const match of matches) {
    assert.ok(realIds.has(match.topic.topicId));
    assert.ok(match.matchedKeyword.length > 0, "every match must name a real matched keyword");
  }
});

test("7. Company-Research matching is honestly empty for an unmapped industry", () => {
  const unmapped = { ...APPLE, industry: "Not A Real Industry Category" };
  assert.deepEqual(getRelatedResearchTopics(unmapped), []);
});

test("8. Research-to-company reverse lookup only ever references real companies", () => {
  const matches = getRelatedCompaniesForTopic(MICROBIOLOGY);
  const realIds = new Set(companies.map((c) => c.id));
  for (const match of matches) {
    assert.ok(realIds.has(match.company.id));
  }
});

test("9. Company report compiles only real, traceable data", () => {
  const relationships = getCompanyLinkedEntities(APPLE);
  const journey = buildCompanyUserJourney(APPLE, relationships);
  const report = buildCompanyReport(APPLE, journey);

  assert.equal(report.overview.name, APPLE.name);
  assert.equal(report.overview.industry, APPLE.industry);
  assert.equal(report.overview.website, APPLE.website);
  assert.ok(report.evidence.totalSources >= report.evidence.connectedSources);
  assert.ok(report.limitations.length > 0, "limitations must be stated, never omitted");
  assert.ok(report.methodology.length > 0);
  assert.equal(typeof report.trustStatement, "string");
  assert.ok(report.trustStatement.length > 0);
});

test("10. Company report never fabricates a country link that doesn't exist", () => {
  const relationships = getCompanyLinkedEntities(APPLE);
  const journey = buildCompanyUserJourney(APPLE, relationships);
  const report = buildCompanyReport(APPLE, journey);

  if (report.country) {
    assert.equal(countryHrefByName(report.country.name), report.country.href);
  }
});

test("11. Every real company either has a real https website or honestly none", () => {
  for (const company of companies) {
    if (company.website !== undefined) {
      assert.match(company.website, /^https:\/\//, `${company.name}'s website must be a real URL`);
    }
  }
});

test('12. Command Center resolves "open company" and "compare companies"', () => {
  const openCompany = resolveAssistantCommand("open company");
  assert.ok(openCompany);
  assert.equal(openCompany!.href, "/companies");

  const compare = resolveAssistantCommand("compare companies");
  assert.ok(compare);
  assert.equal(compare!.href, "/companies");
});

test('13. Command Center resolves "generate report"', () => {
  const match = resolveAssistantCommand("generate report");
  assert.ok(match);
  assert.equal(match!.href, "/analytics");
});

test('14. "save workspace" is not a pure-resolver navigation — it is a real action handled with context, never faked', () => {
  // The pure command resolver never invents an href for this phrase; the Command Center
  // component handles it as a real pin action using the currently focused entity instead.
  assert.equal(resolveAssistantCommand("save workspace"), null);
});

test("15. Pin/unpin architecture is SSR-safe outside a browser and never throws", () => {
  assert.doesNotThrow(() => {
    const before = loadPinnedEntities();
    assert.deepEqual(before, []);
    const after = pinEntity({ kind: "company", id: "apple", name: "Apple" });
    // No window in this test environment, so the write is a no-op — still must not throw and
    // must still return the real in-memory list it computed.
    assert.ok(Array.isArray(after));
  });
});
