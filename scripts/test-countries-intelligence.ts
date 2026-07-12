// Focused tests for the "Countries Intelligence" activation mission — real official website
// facts, the honest (empty-by-design) Country<->Research connection, real report compilation,
// bidirectional relationship links, and Command Center coverage. Same zero-dependency harness as
// the other test scripts (Node's native `node:test` + the `@/` alias loader).
// Run with: npm run test:countries-intelligence

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { countries } from "@/lib/countries";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { buildCountryUserJourney } from "@/lib/country-user-journey";
import { buildCountryReport } from "@/lib/country-report";
import { companyHrefByName, universityHrefByName } from "@/components/shared/resolve-entity-link";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import { loadPinnedEntities, pinEntity } from "@/lib/context";

const USA = countries.find((c) => c.id === "usa")!;
const JAPAN = countries.find((c) => c.id === "japan")!;

test("1. Every real country has a real https official website or honestly none", () => {
  for (const country of countries) {
    if (country.officialWebsite !== undefined) {
      assert.match(
        country.officialWebsite,
        /^https:\/\//,
        `${country.name}'s official website must be a real URL`,
      );
    }
  }
});

test("2. The confirmed-dead CountryCoveragePanel.tsx was removed, not left unwired", () => {
  assert.equal(
    existsSync("components/countries/CountryCoveragePanel.tsx"),
    false,
    "CountryCoveragePanel.tsx had zero importers and was redundant with EntityEvidenceSection",
  );
});

test("3. Country report compiles only real, traceable data", () => {
  const relationships = getCountryRelationships(USA);
  const journey = buildCountryUserJourney(USA, relationships);
  const report = buildCountryReport(USA, journey);

  assert.equal(report.overview.name, USA.name);
  assert.equal(report.overview.code, USA.code);
  assert.equal(report.overview.capital, USA.capital);
  assert.equal(report.overview.officialWebsite, USA.officialWebsite);
  assert.ok(report.evidence.totalSources >= report.evidence.connectedSources);
  assert.ok(report.limitations.length > 0, "limitations must be stated, never omitted");
  assert.ok(report.methodology.length > 0);
  assert.equal(typeof report.trustStatement, "string");
  assert.ok(report.trustStatement.length > 0);
});

test("4. Country report never fabricates a Country<->Research connection", () => {
  const relationships = getCountryRelationships(JAPAN);
  const journey = buildCountryUserJourney(JAPAN, relationships);
  const report = buildCountryReport(JAPAN, journey);

  assert.match(report.research, /no research topics are connected/i);
});

test("5. Country report's related companies/universities only ever link to real catalog entries", () => {
  const relationships = getCountryRelationships(USA);
  const journey = buildCountryUserJourney(USA, relationships);
  const report = buildCountryReport(USA, journey);

  for (const link of report.relatedCompanies) {
    assert.equal(link.href, companyHrefByName(link.name));
  }
  for (const link of report.relatedUniversities) {
    assert.equal(link.href, universityHrefByName(link.name));
  }
});

test("6. Country graph relationships resolve to real, navigable entity links", () => {
  const relationships = getCountryRelationships(USA);
  const journey = buildCountryUserJourney(USA, relationships);
  const { graphRelationships } = journey.profile.coverage;

  for (const rel of graphRelationships) {
    if (rel.entityType === "company") {
      assert.ok(companyHrefByName(rel.entityName), `${rel.entityName} must resolve to a real company link`);
    }
    if (rel.entityType === "university") {
      assert.ok(universityHrefByName(rel.entityName), `${rel.entityName} must resolve to a real university link`);
    }
  }
});

test('7. Command Center resolves "open country" and "compare countries"', () => {
  const openCountry = resolveAssistantCommand("open country");
  assert.ok(openCountry);
  assert.equal(openCountry!.href, "/countries");

  const compare = resolveAssistantCommand("compare countries");
  assert.ok(compare);
  assert.equal(compare!.href, "/countries");
});

test('8. Command Center resolves "find country <name>" to a real country profile', () => {
  const match = resolveAssistantCommand("find country Japan");
  assert.ok(match);
  assert.equal(match!.kind, "parameterized");
  if (match!.kind === "parameterized") {
    assert.equal(match!.href, "/countries?country=japan");
  }
});

test('9. Command Center resolves "generate report"', () => {
  const match = resolveAssistantCommand("generate report");
  assert.ok(match);
  assert.equal(match!.href, "/analytics");
});

test('10. "save workspace" is not a pure-resolver navigation — it is a real action handled with context', () => {
  assert.equal(resolveAssistantCommand("save workspace"), null);
});

test("11. Pin/unpin architecture accepts country entities and never throws outside a browser", () => {
  assert.doesNotThrow(() => {
    const before = loadPinnedEntities();
    assert.deepEqual(before, []);
    const after = pinEntity({ kind: "country", id: "japan", name: "Japan", code: "JP" });
    assert.ok(Array.isArray(after));
  });
});

test("12. Every real country resolves to a real profile route", () => {
  for (const country of countries) {
    assert.doesNotThrow(() => {
      const relationships = getCountryRelationships(country);
      buildCountryUserJourney(country, relationships);
    });
  }
});
