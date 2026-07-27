/**
 * Country Intelligence System regression suite.
 * Honesty: no fabricated numeric fallbacks; missing stays null / “No verified data”.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { countries } from "@/lib/countries";
import {
  COUNTRY_INTELLIGENCE_DOMAINS,
  COUNTRY_INTELLIGENCE_SCHEMA_VERSION,
  buildCountryProfile,
  migrateCountryProfile,
  assertIdempotentMigration,
  buildHistoryChartSegments,
  historyTableRows,
  validateComparisonSelection,
  assessDomainComparability,
  buildCountryComparison,
  buildUzbekistanReferenceProfile,
  UZBEKISTAN_REFERENCE_DOMAINS,
  resolveCountryIntelligenceVoiceCommand,
  flagEmojiFromIsoAlpha2,
  resolveEmblemMetadata,
  COUNTRY_SOURCE_REGISTRY,
} from "@/lib/country-intelligence";
import {
  COUNTRY_INTELLIGENCE_COPY_LOCALES,
  getCountryIntelligenceCopy,
} from "@/lib/i18n/platform-copy-country-intelligence";
import { COUNTRY_LINKED_PRESETS, buildCountryLinkedWorkDraft } from "@/lib/operational-objects/linked-work-draft";

const ROOT = process.cwd();

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("CIS-1: schema version and twelve domains", () => {
  assert.equal(COUNTRY_INTELLIGENCE_SCHEMA_VERSION, 1);
  assert.equal(COUNTRY_INTELLIGENCE_DOMAINS.length, 12);
  assert.ok(COUNTRY_INTELLIGENCE_DOMAINS.includes("rule_of_law"));
  assert.ok(COUNTRY_INTELLIGENCE_DOMAINS.includes("public_administration"));
});

test("CIS-2: legacy Country migrates idempotently and preserves unknown fields", () => {
  const legacy = { ...countries[0], legacyCustomField: "keep-me", mystery: { nested: true } };
  const once = migrateCountryProfile(legacy);
  assert.equal(once.schemaVersion, 1);
  assert.equal(once.id, legacy.id);
  assert.equal((once.registry as Record<string, unknown>).legacyCustomField, "keep-me");
  assert.ok(assertIdempotentMigration(legacy));
  const twice = migrateCountryProfile(once as unknown as Record<string, unknown>);
  assert.equal(twice.schemaVersion, once.schemaVersion);
  assert.equal(twice.id, once.id);
});

test("CIS-3: profile never fabricates numeric indicator values", () => {
  for (const c of countries) {
    const p = buildCountryProfile(c);
    for (const slot of p.domainSlots) {
      assert.equal(slot.latest?.value ?? null, null);
      assert.equal(slot.latest?.missingDataReason != null, true);
      assert.ok(
        slot.latest?.missingDataReason?.includes("No verified") ||
          slot.latest?.evidenceStatus === "not_available",
      );
    }
  }
});

test("CIS-4: source registry is the adapter boundary (no hardcoded World Bank values in UI profile)", () => {
  assert.ok(COUNTRY_SOURCE_REGISTRY.length >= 8);
  assert.ok(COUNTRY_SOURCE_REGISTRY.every((s) => s.licenseNote.length > 0));
  const uz = buildCountryProfile(countries.find((c) => c.id === "uzbekistan")!);
  assert.equal(
    uz.domainSlots.every((s) => s.latest?.value == null),
    true,
  );
});

test("CIS-5: flag emoji from ISO; emblem unavailable without license", () => {
  assert.equal(flagEmojiFromIsoAlpha2("UZ").length > 0, true);
  assert.equal(flagEmojiFromIsoAlpha2("xx"), "");
  const emblem = resolveEmblemMetadata("uzbekistan");
  assert.equal(emblem.available, false);
  assert.equal(emblem.reasonIfUnavailable, "not_licensed");
});

test("CIS-6: history segments never invent continuous lines across gaps", () => {
  const segments = buildHistoryChartSegments([
    {
      year: 2019,
      value: 1,
      evidenceStatus: "verified",
      comparabilityStatus: "comparable",
      sourceOrganization: "test",
      methodologyBreak: false,
      gap: false,
      revisionNote: null,
    },
    {
      year: 2020,
      value: null,
      evidenceStatus: "not_available",
      comparabilityStatus: "unknown",
      sourceOrganization: null,
      methodologyBreak: false,
      gap: true,
      revisionNote: null,
    },
    {
      year: 2021,
      value: 2,
      evidenceStatus: "verified",
      comparabilityStatus: "methodology_break",
      sourceOrganization: "test",
      methodologyBreak: true,
      gap: false,
      revisionNote: "method changed",
    },
  ]);
  assert.ok(segments.some((s) => s.kind === "gap"));
  assert.ok(segments.some((s) => s.kind === "methodology_break" || s.kind === "point"));
  const table = historyTableRows([]);
  assert.equal(table.length, 0);
});

test("CIS-7: Then/Now/Next separates plans from scenarios", () => {
  const p = buildCountryProfile(countries.find((c) => c.id === "uzbekistan")!);
  assert.equal(p.thenNowNext.next.officialCommitments.length, 0);
  assert.equal(p.thenNowNext.next.cbaiScenarios.length, 0);
  assert.equal(p.thenNowNext.then.baselineYear, null);
  assert.equal(p.causes[0]?.classification, "insufficient_evidence");
  const copy = getCountryIntelligenceCopy("en");
  assert.ok(copy.officialPlanNotForecast.toLowerCase().includes("not forecasts"));
  assert.ok(copy.scenarioNotPrediction.toLowerCase().includes("not predictions"));
});

test("CIS-8: comparison blocks incompatible / missing data; never ranks best country", () => {
  assert.equal(validateComparisonSelection(["uzbekistan"]).ok, false);
  assert.equal(validateComparisonSelection(["uzbekistan", "germany", "japan", "usa", "china"]).ok, false);
  assert.equal(validateComparisonSelection(["uzbekistan", "germany"]).ok, true);

  const profiles = ["uzbekistan", "germany"].map((id) =>
    buildCountryProfile(countries.find((c) => c.id === id)!),
  );
  const eligibility = assessDomainComparability(profiles, "education_research");
  assert.equal(eligibility.ok, false);
  assert.ok(eligibility.reason && /No verified|missing|incompatible/i.test(eligibility.reason));

  const result = buildCountryComparison(profiles, {
    countryIds: ["uzbekistan", "germany"],
    domainId: "education_research",
    windowYears: 5,
  });
  assert.ok(result.rankingForbiddenNotice.toLowerCase().includes("best country"));
  assert.equal(result.eligibility.ok, false);
});

test("CIS-9: Uzbekistan reference covers required domains with honest empties", () => {
  const ref = buildUzbekistanReferenceProfile();
  assert.ok(ref);
  assert.equal(ref!.profile.id, "uzbekistan");
  assert.equal(UZBEKISTAN_REFERENCE_DOMAINS.length, 12);
  assert.ok(ref!.domainViews.every((d) => d.hasVerifiedSeries === false));
  assert.ok(ref!.honestyNotice.includes("does not invent"));
});

test("CIS-10: EN/UZ/RU/TR copy parity — no raw keys in UZ sample strings", () => {
  assert.equal(COUNTRY_INTELLIGENCE_COPY_LOCALES.length, 4);
  const keys = Object.keys(getCountryIntelligenceCopy("en")).sort();
  for (const locale of COUNTRY_INTELLIGENCE_COPY_LOCALES) {
    const copy = getCountryIntelligenceCopy(locale);
    assert.deepEqual(Object.keys(copy).sort(), keys);
    for (const [k, v] of Object.entries(copy)) {
      assert.equal(typeof v, "string");
      assert.ok(v.length > 0, `${locale}.${k} empty`);
      assert.notEqual(v, k, `${locale} leaked key ${k}`);
    }
  }
  const uz = getCountryIntelligenceCopy("uz");
  assert.ok(!/Country Intelligence$/.test(uz.title));
  assert.ok(uz.noVerifiedData.includes("Tasdiqlangan") || uz.noVerifiedData.includes("mavjud emas"));
  const longRu = getCountryIntelligenceCopy("ru").domainEconomy;
  const longTr = getCountryIntelligenceCopy("tr").domainEconomy;
  assert.ok(longRu.length > 20);
  assert.ok(longTr.length > 20);
});

test("CIS-11: country linked-work presets require draft confirmation path", () => {
  assert.ok(COUNTRY_LINKED_PRESETS.includes("comparative_study"));
  assert.ok(COUNTRY_LINKED_PRESETS.includes("monitoring_plan"));
  assert.ok(COUNTRY_LINKED_PRESETS.includes("decision_brief"));
  assert.ok(COUNTRY_LINKED_PRESETS.includes("policy_review"));
  const { draft } = buildCountryLinkedWorkDraft(
    {
      countryId: "uzbekistan",
      countryName: "Uzbekistan",
      routePath: "/countries?country=uzbekistan",
    },
    "evidence_request",
    "en",
  );
  assert.equal(draft.status, "draft");
  assert.equal(draft.type, "evidence_request");
});

test("CIS-12: voice commands — navigate vs draft; idempotent keys; UZ examples", () => {
  const five = resolveCountryIntelligenceVoiceCommand(
    "O‘zbekistonning qonun ustuvorligi bo‘yicha so‘nggi besh yillik holatini ko‘rsat.",
  );
  assert.ok(five);
  assert.equal(five!.type, "navigate");
  if (five!.type === "navigate") {
    assert.ok(five.href.includes("uzbekistan"));
    assert.ok(five.href.includes("history=5") || five.href.includes("domain=rule_of_law"));
  }

  const compare = resolveCountryIntelligenceVoiceCommand(
    "O‘zbekiston va Germaniyani ta’lim ko‘rsatkichlari bo‘yicha taqqosla.",
  );
  assert.ok(compare);
  assert.equal(compare!.type, "navigate");
  if (compare!.type === "navigate") {
    assert.ok(compare.href.includes("/countries/compare"));
    assert.ok(compare.href.includes("uzbekistan"));
    assert.ok(compare.href.includes("germany"));
  }

  const evidence = resolveCountryIntelligenceVoiceCommand(
    "Yetishmayotgan ma’lumotlar uchun Evidence Request yarat.",
  );
  assert.ok(evidence);
  assert.equal(evidence!.type, "suggest_draft");
  if (evidence!.type === "suggest_draft") {
    assert.equal(evidence.requiresHumanConfirmation, true);
    assert.equal(evidence.preset, "evidence_request");
  }

  const monitor = resolveCountryIntelligenceVoiceCommand(
    "Ushbu ko‘rsatkichlar bo‘yicha monitoring rejasi tayyorla.",
  );
  assert.ok(monitor);
  assert.equal(monitor!.type, "suggest_draft");

  const a = resolveCountryIntelligenceVoiceCommand("Compare Uzbekistan and Germany on education indicators");
  const b = resolveCountryIntelligenceVoiceCommand("Compare Uzbekistan and Germany on education indicators");
  assert.ok(a && b && a.type !== "message");
  if (a && b && "idempotencyKey" in a && "idempotencyKey" in b) {
    assert.equal(a.idempotencyKey, b.idempotencyKey);
  }

  assert.equal(resolveCountryIntelligenceVoiceCommand("Open settings"), null);
});

test("CIS-13: UI surfaces exist for official vs CBAI and compare route", () => {
  const profile = readSource("components/countries/CountryIntelligenceProfileView.tsx");
  assert.ok(profile.includes("data-cbai-official-source"));
  assert.ok(profile.includes("data-cbai-cbai-explanation"));
  assert.ok(profile.includes("data-cbai-human-decision"));
  assert.ok(profile.includes("data-cbai-then"));
  assert.ok(existsSync(join(ROOT, "app/(dashboard)/countries/compare/page.tsx")));
  const card = readSource("components/countries/CountryCard.tsx");
  assert.ok(card.includes("CountryFlagMark"));
  assert.ok(card.includes("addToComparison") || card.includes("Add to comparison") || card.includes("cis.addToComparison") || card.includes("cis."));
});

test("CIS-14: design and source policy docs exist", () => {
  assert.ok(existsSync(join(ROOT, "docs/verification/country-intelligence-system/design-decisions.md")));
  assert.ok(existsSync(join(ROOT, "docs/verification/country-intelligence-system/data-source-policy.md")));
});
