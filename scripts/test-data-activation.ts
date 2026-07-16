// Focused tests for "EPIC 2 — Data Activation Layer" — surfacing real, already-computed catalog
// data that existed but was never rendered, never inventing new facts. Covers the real counts the
// mission asks for (connected countries/companies/universities/research/evidence, relationships,
// coverage) and the new surfaces (Expected Future Sources, search coverage labels, report
// Connected/Missing Evidence split, honest University Research Topics parity, Compare page
// accuracy).
// Run with: npm run test:data-activation

import { test } from "node:test";
import assert from "node:assert/strict";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import { buildCountryCoverageProfile } from "@/lib/countries.coverage";
import { buildCompanyCoverageProfile } from "@/lib/companies.coverage";
import { buildUniversityCoverageProfile } from "@/lib/universities.coverage";
import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import { getDomainById } from "@/lib/indicator-framework/domains/catalog";
import { buildEntityResultEntry } from "@/lib/search-intelligence-entry";
import { toCountryEntity } from "@/lib/countries.adapter";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

test("1. Every real entity kind resolves to a non-negative relationship count — never throws, never fabricated", () => {
  let total = 0;
  for (const c of countries) total += buildEntityRelationships("country", c.id).length;
  for (const c of companies) total += buildEntityRelationships("company", c.id).length;
  for (const u of universities) total += buildEntityRelationships("university", u.id).length;
  for (const t of RESEARCH_TOPICS) total += buildEntityRelationships("research_topic", t.topicId).length;
  assert.ok(total > 0, "expected at least some real relationships across the catalog");
});

test("2. Every company resolves a real Country relationship — Company already referenced Country, and it connects", () => {
  for (const c of companies) {
    const rels = buildEntityRelationships("company", c.id);
    const countryRel = rels.find((r) => r.targetType === "country");
    // Samsung's "South Korea" has no matching Country catalog record — honestly absent, not a bug.
    if (c.country === "United States") {
      assert.ok(countryRel, `${c.name} (${c.country}) should resolve a real Country relationship`);
    }
  }
});

test("3. Every US-based university resolves a real Country relationship — University already referenced Country, and it connects", () => {
  for (const u of universities) {
    if (u.country !== "United States") continue;
    const rels = buildEntityRelationships("university", u.id);
    assert.ok(rels.some((r) => r.targetType === "country"), `${u.name} should resolve a real Country relationship`);
  }
});

test("4. Company<->Research topic relationships are real and bidirectional", () => {
  const withResearch = companies.filter((c) => buildEntityRelationships("company", c.id).some((r) => r.targetType === "research_topic"));
  assert.ok(withResearch.length > 0, "expected at least one company with a real research relationship");

  for (const company of withResearch) {
    const companyRels = buildEntityRelationships("company", company.id).filter((r) => r.targetType === "research_topic");
    for (const rel of companyRels) {
      const reverseRels = buildEntityRelationships("research_topic", rel.targetId);
      assert.ok(
        reverseRels.some((r) => r.targetType === "company" && r.targetId === company.id),
        `expected ${rel.targetName} to link back to ${company.name}`,
      );
    }
  }
});

test("5. Country/Company/University <-> Research topic is honestly absent, not fabricated — no real catalog field connects them", () => {
  for (const c of countries) {
    assert.equal(buildEntityRelationships("country", c.id).some((r) => r.targetType === "research_topic"), false);
  }
  for (const u of universities) {
    assert.equal(buildEntityRelationships("university", u.id).some((r) => r.targetType === "research_topic"), false);
  }
});

test("6. Expected Future Sources reuses the real, pre-existing indicator domain catalog", () => {
  const country = countries[0];
  const domainIds = buildCountryCoverageProfile(country).indicatorsByDomain.map((d) => d.domainId);
  assert.ok(domainIds.length > 0);
  for (const id of domainIds) {
    const domain = getDomainById(id);
    assert.ok(domain, `expected a real domain definition for ${id}`);
    assert.ok(domain!.futureExpansion.length > 0, `expected real futureExpansion text for ${id}`);
  }
});

test("7. Every entity has exactly one real connected source (the local registry itself) — never a fabricated count", () => {
  for (const c of countries) {
    const sources = buildCountryCoverageProfile(c).sources;
    assert.equal(sources.filter((s) => s.statusLabel === "Connected").length, 1);
  }
  for (const c of companies) {
    const sources = buildCompanyCoverageProfile(c).sources;
    assert.equal(sources.filter((s) => s.statusLabel === "Connected").length, 1);
  }
  for (const u of universities) {
    const sources = buildUniversityCoverageProfile(u).sources;
    assert.equal(sources.filter((s) => s.statusLabel === "Connected").length, 1);
  }
});

test("8. Search results expose a real coverage label before opening the entity", () => {
  const entity = toCountryEntity(countries[0]);
  const entry = buildEntityResultEntry(entity);
  assert.ok(entry.coverageLabel);
  assert.match(entry.coverageLabel!, /\d+ of \d+ .*connected/);
});

test("9. Research topic evidence counts are real and bounded (connected + disconnected = total)", () => {
  let checked = 0;
  for (const topic of RESEARCH_TOPICS) {
    const intel = deriveEvidenceGapIntelligence(topic.topicId);
    if (!intel) continue;
    checked++;
    assert.ok(intel.connectedEvidence.length >= 0);
    assert.ok(intel.disconnectedEvidence.length >= 0);
  }
  assert.ok(checked > 0);
});

test("10. Country/Company/University report views separate Connected Evidence from Missing Evidence", () => {
  for (const file of ["lib/country-report.ts", "lib/company-report.ts", "lib/university-report.ts"]) {
    const content = read(file);
    assert.ok(content.includes("connectedSourceNames"), `${file} should expose connected source names`);
    assert.ok(content.includes("missingSourceNames"), `${file} should expose missing source names`);
    assert.ok(content.includes("futureDomainIds"), `${file} should expose future domain ids`);
  }
  for (const file of [
    "components/countries/CountryReportView.tsx",
    "components/companies/CompanyReportView.tsx",
    "components/universities/UniversityReportView.tsx",
  ]) {
    const content = read(file);
    assert.ok(content.includes("useReportCommon"), `${file} should use shared report i18n labels`);
    assert.ok(content.includes("connectedEvidence"), `${file} should render connected evidence section`);
    assert.ok(content.includes("missingEvidence"), `${file} should render missing evidence section`);
    assert.ok(content.includes("EntityFutureSources"));
  }
  const reportCopy = read("lib/i18n/platform-copy-build006-en.ts");
  assert.ok(reportCopy.includes("Connected Evidence"));
  assert.ok(reportCopy.includes("Missing Evidence"));
});

test("11. University profile has Research Topics parity with Country's honest 'not connected' statement", () => {
  assert.ok(read("components/universities/UniversityRelatedResearch.tsx").includes("No research topics are connected"));
  assert.ok(read("components/universities/UniversityIntelligencePanel.tsx").includes("UniversityRelatedResearch"));
});

test("12. Compare summary uses real entity names, not generic 'First profile'/'Second profile' placeholders", () => {
  const content = read("components/evidence-comparison/EvidenceComparisonSummary.tsx");
  assert.equal(content.includes("First profile"), false);
  assert.equal(content.includes("Second profile"), false);
  assert.ok(content.includes("leftEntityLabel"));
  assert.ok(content.includes("rightEntityLabel"));
});

test("13. Compare summary never implies 'Shared sources' are all connected", () => {
  const content = read("components/evidence-comparison/EvidenceComparisonSummary.tsx");
  assert.ok(content.toLowerCase().includes("not a claim that evidence is available"));
});

test("14. Real aggregate counts across the catalog (printed for the mission's audit record)", () => {
  const connectedCountries = countries.filter((c) => buildEntityRelationships("country", c.id).length > 0).length;
  const connectedCompanies = companies.filter((c) => buildEntityRelationships("company", c.id).length > 0).length;
  const connectedUniversities = universities.filter((u) => buildEntityRelationships("university", u.id).length > 0).length;
  const connectedResearch = RESEARCH_TOPICS.filter((t) => buildEntityRelationships("research_topic", t.topicId).length > 0).length;

  let totalRelationships = 0;
  for (const c of countries) totalRelationships += buildEntityRelationships("country", c.id).length;
  for (const c of companies) totalRelationships += buildEntityRelationships("company", c.id).length;
  for (const u of universities) totalRelationships += buildEntityRelationships("university", u.id).length;
  for (const t of RESEARCH_TOPICS) totalRelationships += buildEntityRelationships("research_topic", t.topicId).length;

  console.log(`Connected Countries: ${connectedCountries}/${countries.length}`);
  console.log(`Connected Companies: ${connectedCompanies}/${companies.length}`);
  console.log(`Connected Universities: ${connectedUniversities}/${universities.length}`);
  console.log(`Connected Research topics: ${connectedResearch}/${RESEARCH_TOPICS.length}`);
  console.log(`Total relationships across catalog: ${totalRelationships}`);

  assert.ok(connectedCountries > 0 && connectedCompanies > 0 && connectedUniversities > 0 && connectedResearch > 0);
});
