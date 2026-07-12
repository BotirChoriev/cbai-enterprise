// Focused tests for the "Platform Relationship Activation" mission — University report parity,
// the research-topic workspace/bookmark extension, and the new relationship-aware Command Center
// resolver. Same zero-dependency harness as the other test scripts (Node's native `node:test` +
// the `@/` alias loader). Run with: npm run test:relationship-activation

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { universities } from "@/lib/universities";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { getUniversityRelationships } from "@/lib/universities.adapter";
import { buildUniversityUserJourney } from "@/lib/university-user-journey";
import { buildUniversityReport } from "@/lib/university-report";
import { countryHrefByName, companyHrefByName } from "@/components/shared/resolve-entity-link";
import { loadPinnedEntities, pinEntity } from "@/lib/context";
import { resolveRelationshipCommand } from "@/lib/assistant/assistant-relationship-commands";

const STANFORD = universities.find((u) => u.id === "stanford")!;

test("1. University report compiles only real, traceable data", () => {
  const relationships = getUniversityRelationships(STANFORD);
  const journey = buildUniversityUserJourney(STANFORD, relationships);
  const report = buildUniversityReport(STANFORD, journey);

  assert.equal(report.overview.name, STANFORD.name);
  assert.equal(report.overview.city, STANFORD.city);
  assert.equal(report.overview.website, STANFORD.website);
  assert.ok(report.evidence.totalSources >= report.evidence.connectedSources);
  assert.ok(report.limitations.length > 0, "limitations must be stated, never omitted");
  assert.ok(report.methodology.length > 0);
  assert.ok(report.trustStatement.length > 0);
});

test("2. University report's related country/companies only ever link to real catalog entries", () => {
  const relationships = getUniversityRelationships(STANFORD);
  const journey = buildUniversityUserJourney(STANFORD, relationships);
  const report = buildUniversityReport(STANFORD, journey);

  if (report.relatedCountry) {
    assert.equal(report.relatedCountry.href, countryHrefByName(report.relatedCountry.name));
  }
  for (const link of report.relatedCompanies) {
    assert.equal(link.href, companyHrefByName(link.name));
  }
});

test("3. University report never fabricates a Country<->Research connection", () => {
  const relationships = getUniversityRelationships(STANFORD);
  const journey = buildUniversityUserJourney(STANFORD, relationships);
  const report = buildUniversityReport(STANFORD, journey);

  assert.match(report.research, /no research topics are connected/i);
});

test("4. The confirmed-dead UniversityCoveragePanel.tsx was removed, not left unwired", () => {
  assert.equal(
    existsSync("components/universities/UniversityCoveragePanel.tsx"),
    false,
    "UniversityCoveragePanel.tsx had zero importers and was redundant with EntityEvidenceSection",
  );
});

test("5. Pin architecture accepts a research_topic entity and round-trips it without throwing", () => {
  assert.doesNotThrow(() => {
    const before = loadPinnedEntities();
    assert.deepEqual(before, []);
    const after = pinEntity({ kind: "research_topic", id: "microbiology", name: "Microbiology" });
    assert.ok(Array.isArray(after));
  });
});

test("6. Relationship command: country with several real companies opens the real listing", () => {
  const result = resolveRelationshipCommand("open related company", { kind: "country", id: "usa" });
  assert.ok(result);
  assert.equal(result!.type, "navigate");
  if (result!.type === "navigate") assert.equal(result!.href, "/companies");
});

test("7. Relationship command: country with zero real companies is an honest empty message", () => {
  const result = resolveRelationshipCommand("open related company", { kind: "country", id: "japan" });
  assert.ok(result);
  assert.equal(result!.type, "message");
});

test("8. Relationship command: company's related country navigates to the real country profile", () => {
  const result = resolveRelationshipCommand("open country", { kind: "company", id: "apple" });
  assert.ok(result);
  assert.equal(result!.type, "navigate");
  if (result!.type === "navigate") assert.equal(result!.href, countryHrefByName("United States"));
});

test("9. Relationship command: university's related country navigates to the real country profile", () => {
  const result = resolveRelationshipCommand("open country", { kind: "university", id: "stanford" });
  assert.ok(result);
  assert.equal(result!.type, "navigate");
  if (result!.type === "navigate") assert.equal(result!.href, countryHrefByName("United States"));
});

test('10. Relationship command: "open country" while already viewing a country is honest, not a fabricated jump', () => {
  const result = resolveRelationshipCommand("open country", { kind: "country", id: "usa" });
  assert.ok(result);
  assert.equal(result!.type, "message");
});

test("11. Relationship command: research topic with real related companies navigates to a real destination", () => {
  const result = resolveRelationshipCommand("open related company", { kind: "research_topic", id: "ai-safety" });
  assert.ok(result);
  assert.equal(result!.type, "navigate");
  if (result!.type === "navigate") {
    const isRealCompanyHref = companies.some((c) => companyHrefByName(c.name) === result!.href);
    assert.ok(result!.href === "/companies" || isRealCompanyHref, "must be either the real listing or a real company profile");
  }
});

test("12. Relationship command: evidence link is real and entity-specific, not the disconnected generic hub", () => {
  const companyResult = resolveRelationshipCommand("open evidence", { kind: "company", id: "apple" });
  assert.ok(companyResult);
  assert.equal(companyResult!.type, "navigate");
  if (companyResult!.type === "navigate") assert.equal(companyResult!.href, "/companies?company=apple#evidence");

  const topicResult = resolveRelationshipCommand("open evidence", { kind: "research_topic", id: "microbiology" });
  assert.ok(topicResult);
  assert.equal(topicResult!.type, "navigate");
  if (topicResult!.type === "navigate") assert.equal(topicResult!.href, "/research/microbiology#evidence");

  const unfocusedResult = resolveRelationshipCommand("open evidence", null);
  assert.ok(unfocusedResult);
  assert.equal(unfocusedResult!.type, "navigate");
  if (unfocusedResult!.type === "navigate") assert.equal(unfocusedResult!.href, "/knowledge");
});

test("13. Relationship resolver returns null for phrases it doesn't own, falling through to the fixed table", () => {
  assert.equal(resolveRelationshipCommand("open my work", { kind: "country", id: "usa" }), null);
});

test("14. Every real country resolves through the University<->Country relationship without throwing", () => {
  for (const country of countries) {
    assert.doesNotThrow(() => {
      resolveRelationshipCommand("open related university", { kind: "country", id: country.id });
    });
  }
});
