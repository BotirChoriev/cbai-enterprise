/**
 * Localization closure — Investor/Governance, session memory, dictionary parity.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getDictionary } from "@/lib/i18n/translate";
import { translateInvestorWorkspace } from "@/lib/i18n/investor-translation";
import { translateGovernmentWorkspace } from "@/lib/i18n/government-translation";
import { buildInvestorWorkspace } from "@/lib/workspaces/investor";
import { buildGovernmentWorkspace } from "@/lib/workspaces/government";
import {
  normalizeCompanionThought,
  type CompanionThoughtSnapshot,
} from "@/lib/intelligence-os/living-memory";
import { routePurposeI18nKey } from "@/lib/intelligence-os/first-minute";

const INVESTOR_ENGLISH_UI = [
  "Evidence domains",
  "Investment evidence",
  "Entity Links",
  "No source connected",
  "Investor Intelligence Workspace",
  "Official sources for investment review",
  "Status by topic — information only",
  "Navigate to entity intelligence routes",
];

const GOVERNANCE_ENGLISH_UI = [
  "Review standards",
  "Constitutional Principles",
  "Related topics:",
  "Governance rule registry",
];

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

function dictionaryLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...dictionaryLeafKeys(value as Record<string, unknown>, path));
    } else if (typeof value === "string") {
      keys.push(path);
    }
  }
  return keys;
}

test("UZ investor workspace runtime copy has no identified English UI prose", () => {
  const uz = getDictionary("uz");
  const model = translateInvestorWorkspace(uz, buildInvestorWorkspace());
  const bundle = [
    uz.investorWorkspace.heroTitle,
    uz.investorWorkspace.heroDescription,
    uz.investorWorkspace.sectionInvestmentEvidenceHeading,
    uz.workspaceShared.entityLinksHeading,
    model.hero.title,
    model.hero.description,
    ...model.investmentEvidenceMap.map((row) => `${row.title} ${row.description}`),
    ...model.entityLinks.map((link) => `${link.label} ${link.description}`),
  ].join("\n");

  for (const phrase of INVESTOR_ENGLISH_UI) {
    assert.ok(!bundle.includes(phrase), `Found English phrase in UZ investor bundle: ${phrase}`);
  }
});

test("UZ government workspace runtime copy has no identified English UI prose", () => {
  const uz = getDictionary("uz");
  const model = translateGovernmentWorkspace(uz, buildGovernmentWorkspace());
  const bundle = [
    uz.governmentWorkspace.heroTitle,
    uz.governmentWorkspace.sectionGovernanceHeading,
    uz.governmentWorkspace.metricDomainsTracked,
    model.hero.title,
    ...model.governanceCoverage.map((row) => row.title),
  ].join("\n");
  assert.ok(!bundle.includes("Government Intelligence Workspace"));
  assert.ok(!bundle.includes("Domains tracked"));
  assert.ok(!bundle.includes("Public governance"));
  assert.ok(uz.governmentWorkspace.heroTitle.includes("Davlat"));
});

test("Government workspace component uses translateGovernmentWorkspace", () => {
  const source = readSource("components/workspaces/GovernmentWorkspace.tsx");
  assert.match(source, /translateGovernmentWorkspace/);
  assert.doesNotMatch(source, /versionLabel=\{`Government Workspace`\}/);
});

test("UZ governance center chrome avoids English section headings", () => {
  const uz = getDictionary("uz");
  const bundle = [
    uz.governancePage.title,
    uz.governancePage.description,
    uz.governanceCenter.reviewStandards,
    uz.governanceCenter.constitutionalPrinciples,
    uz.governanceCenter.reviewProcess,
    uz.governanceCenter.pillarsAria,
    ...Object.values(uz.governanceCenter.categories).map((c) => `${c.label} ${c.purpose}`),
  ].join("\n");

  for (const phrase of GOVERNANCE_ENGLISH_UI) {
    assert.ok(!bundle.includes(phrase), `Found English phrase in UZ governance bundle: ${phrase}`);
  }
});

test("EN/UZ/RU/TR dictionaries include investorWorkspace and workspaceShared keys", () => {
  const enKeys = new Set([
    ...dictionaryLeafKeys(getDictionary("en").investorWorkspace as unknown as Record<string, unknown>),
    ...dictionaryLeafKeys(getDictionary("en").workspaceShared as unknown as Record<string, unknown>),
  ]);

  for (const lang of ["uz", "ru", "tr"] as const) {
    const dict = getDictionary(lang);
    const langKeys = new Set([
      ...dictionaryLeafKeys(dict.investorWorkspace as unknown as Record<string, unknown>),
      ...dictionaryLeafKeys(dict.workspaceShared as unknown as Record<string, unknown>),
    ]);
    for (const key of enKeys) {
      assert.ok(langKeys.has(key), `${lang} missing investor/workspace key: ${key}`);
      const value =
        key.split(".").reduce<unknown>((acc, part) => {
          if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
          return undefined;
        }, dict.investorWorkspace as unknown) ??
        key.split(".").reduce<unknown>((acc, part) => {
          if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
          return undefined;
        }, dict.workspaceShared as unknown);
      if (typeof value === "string") {
        assert.notEqual(value, key, `${lang} raw dictionary key leaked: ${key}`);
        assert.ok(value.trim().length > 0, `${lang} empty value for ${key}`);
      }
    }
  }
});

test("investor and governance route purpose keys exist in all locales", () => {
  for (const lang of ["en", "uz", "ru", "tr"] as const) {
    const dict = getDictionary(lang);
    assert.ok(dict.zeroLearningCurve.routeInvestorPurpose.length > 0);
    assert.ok(dict.zeroLearningCurve.routeGovernancePurpose.length > 0);
    assert.ok(dict.zeroLearningCurve.resumeSavedInLocale.includes("{locale}"));
  }
  assert.equal(routePurposeI18nKey("investor"), "routeInvestorPurpose");
  assert.equal(routePurposeI18nKey("governance"), "routeGovernancePurpose");
});

test("companion thought backward compatibility assigns focus kind", () => {
  const legacy = normalizeCompanionThought({
    missionId: null,
    lastRoute: "/research",
    lastFocus: "Explore the research catalog.",
    recordedAt: new Date().toISOString(),
  });
  assert.equal(legacy.focusKind, "user");

  const system = normalizeCompanionThought({
    missionId: null,
    lastRoute: "/investor",
    lastFocus: "Mission home — progress",
    recordedAt: new Date().toISOString(),
    purposeKey: "routeInvestorPurpose",
  });
  assert.equal(system.focusKind, "system");
  assert.equal(system.purposeKey, "routeInvestorPurpose");
});

test("system companion focus regenerates from purposeKey without stale English UI", () => {
  const snapshot = normalizeCompanionThought({
    missionId: null,
    lastRoute: "/investor",
    lastFocus: "Mission home — progress",
    recordedAt: new Date().toISOString(),
    focusKind: "system",
    focusLocale: "en",
    purposeKey: "routeInvestorPurpose",
  });
  assert.ok(snapshot.purposeKey);
  const uzPurpose = getDictionary("uz").zeroLearningCurve[snapshot.purposeKey as "routeInvestorPurpose"];
  assert.ok(!uzPurpose.includes("Mission home"));
  assert.ok(uzPurpose.length > 0);
});

test("OperationalObjectIndex uses active locale — not hardcoded en", () => {
  const source = readSource("components/operational-objects/OperationalObjectIndex.tsx");
  assert.ok(source.includes("locale: language"));
  assert.doesNotMatch(source, /locale:\s*"en"/);
});

test("Investor workspace components use dictionary copy — no hardcoded English headings", () => {
  const investor = readSource("components/workspaces/InvestorWorkspace.tsx");
  assert.ok(investor.includes("translateInvestorWorkspace"));
  assert.doesNotMatch(investor, /heading="Investment evidence"/);
  assert.doesNotMatch(investor, /"Evidence domains"/);

  const grid = readSource("components/workspaces/WorkspaceCoverageGrid.tsx");
  assert.ok(grid.includes("translateWorkspaceStatusLabel"));
  assert.doesNotMatch(grid, /displayStatusLabel/);

  const governance = readSource("components/governance-control/GovernanceSections.tsx");
  assert.ok(governance.includes("gc.categories[category"));
  assert.doesNotMatch(governance, /ruleCategories\.join\(", "\)/);
});

test("MissionOperatingContextBar separates user content from system purpose recording", () => {
  const source = readSource("components/mission/MissionOperatingContextBar.tsx");
  assert.ok(source.includes('focusKind: "user"'));
  assert.ok(source.includes('focusKind: "system"'));
  assert.ok(source.includes("purposeKey"));
  assert.ok(source.includes("resumeSavedInLocale"));
});

test("GlobalMissionContextBar uses localized evidence pulse labels", () => {
  const source = readSource("components/operating/GlobalMissionContextBar.tsx");
  assert.ok(source.includes("translateEvidencePulseStateLabel"));
  assert.ok(source.includes("translateEvidencePulseLimitation"));
  assert.doesNotMatch(source, /evidencePulse\.label/);
});

test("UZ translated investor domain titles preserve official source names", () => {
  const model = translateInvestorWorkspace(getDictionary("uz"), buildInvestorWorkspace());
  const worldBank = model.sources.find((s) => s.slug === "world-bank");
  assert.ok(worldBank);
  assert.ok(worldBank!.name.includes("World Bank") || worldBank!.name.length > 0);
  assert.equal(model.investmentEvidenceMap[0]?.title, "Iqtisodiyot");
});

test("long RU governance category labels remain renderable without raw slugs", () => {
  const ru = getDictionary("ru");
  for (const category of Object.values(ru.governanceCenter.categories)) {
    assert.ok(category.label.length > 0);
    assert.ok(category.label.length < 48, `RU label unexpectedly long: ${category.label}`);
  }
});
