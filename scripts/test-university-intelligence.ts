/**
 * University Intelligence & Collaboration Network regression suite.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { universities } from "@/lib/universities";
import {
  UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION,
  buildUniversityNetworkProfile,
  migrateUniversityIntelligenceProfile,
  assertIdempotentUniversityMigration,
  resolveUniversityLogo,
  neutralMonogram,
  runAcademicMatch,
  buildProjectPresentationCard,
  attemptPresentationCommunication,
  listOpportunityRadar,
  buildEmptyFiveYearTimeline,
  classifyTimelinePoint,
  resolveUniversityIntelligenceVoiceCommand,
} from "@/lib/university-intelligence";
import {
  UNIVERSITY_INTELLIGENCE_COPY_LOCALES,
  getUniversityIntelligenceCopy,
} from "@/lib/i18n/platform-copy-university-intelligence";
import { UNIVERSITY_LINKED_PRESETS, buildUniversityLinkedWorkDraft } from "@/lib/operational-objects/linked-work-draft";

const ROOT = process.cwd();

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("UIS-1: schema and network profile never fabricate scientific counts", () => {
  assert.equal(UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION, 1);
  for (const u of universities) {
    const p = buildUniversityNetworkProfile(u);
    assert.equal(p.identity.officialName, u.name);
    assert.equal(p.snapshot.metrics.every((m) => m.value === null), true);
    assert.equal(p.structure.faculties.length, 0);
    assert.equal(p.academics.length, 0);
    assert.equal(p.projects.length, 0);
    assert.equal(p.opportunities.length, 0);
  }
});

test("UIS-2: migration is idempotent and preserves unknown fields", () => {
  const legacy = { ...universities[0], legacyCustom: "keep", mystery: 42 };
  const once = migrateUniversityIntelligenceProfile(legacy);
  assert.equal((once.registry as Record<string, unknown>).legacyCustom, "keep");
  assert.ok(assertIdempotentUniversityMigration(legacy));
});

test("UIS-3: logo policy — no fabricated official logos; neutral monogram", () => {
  const logo = resolveUniversityLogo("tuit");
  assert.equal(logo.isOfficialAsset, false);
  assert.equal(logo.usageStatus, "not_connected");
  assert.equal(neutralMonogram("TUIT"), "TUIT");
  assert.ok(!readSource("lib/university-intelligence/logo.ts").includes("http://logo"));
});

test("UIS-4: five-year timeline classification separates plan vs scenario", () => {
  assert.equal(
    classifyTimelinePoint({
      isFuture: true,
      hasOfficialSource: true,
      isCbaiScenario: false,
      hasObservedValue: false,
    }),
    "official_future_plan",
  );
  assert.equal(
    classifyTimelinePoint({
      isFuture: true,
      hasOfficialSource: false,
      isCbaiScenario: true,
      hasObservedValue: false,
    }),
    "cbai_scenario",
  );
  const years = buildEmptyFiveYearTimeline(2026);
  assert.equal(years.length, 5);
  assert.ok(years.every((y) => y.publications === null));
});

test("UIS-5: Academic Match is deterministic, 3–5 options, no best ranking", () => {
  const input = {
    projectTheme: "water purification",
    geographyCountryIds: ["germany", "uzbekistan"] as const,
    languages: ["tr", "en"] as const,
  };
  const a = runAcademicMatch(input);
  const b = runAcademicMatch(input);
  assert.equal(a.inputFingerprint, b.inputFingerprint);
  assert.deepEqual(
    a.options.map((o) => o.universityId),
    b.options.map((o) => o.universityId),
  );
  assert.ok(a.options.length >= 3 && a.options.length <= 5);
  assert.ok(a.rankingForbiddenNotice.toLowerCase().includes("best") || a.rankingForbiddenNotice.includes("good/bad"));
  assert.ok(a.options.every((o) => o.humanVerificationRequired === true));
});

test("UIS-6: presentation never sends without provider; confirmation required", () => {
  const card = buildProjectPresentationCard({
    title: "Water purification",
    researcherName: "A. Researcher",
    affiliation: "Demo Lab",
    contentLocale: "tr",
    targetUniversityIds: ["tuit", "nuuz"],
  });
  assert.equal(card.communicationProviderConnected, false);
  assert.equal(card.userEnteredPreserved, true);
  const noConfirm = attemptPresentationCommunication(card, false);
  assert.equal(noConfirm.ok, false);
  if (!noConfirm.ok) assert.equal(noConfirm.reason, "missing_confirmation");
  const blocked = attemptPresentationCommunication(card, true);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) {
    assert.equal(blocked.reason, "provider_not_connected");
    assert.ok(blocked.message.toLowerCase().includes("not connected"));
  }
});

test("UIS-7: Opportunity Radar has no synthetic opportunities", () => {
  const radar = listOpportunityRadar("tuit");
  assert.equal(radar.items.length, 0);
  assert.equal(radar.status, "not_connected");
  assert.ok(radar.honestyNotice.includes("synthetic") || radar.honestyNotice.includes("verified"));
});

test("UIS-8: EN/UZ/RU/TR copy parity — no raw keys", () => {
  const keys = Object.keys(getUniversityIntelligenceCopy("en")).sort();
  for (const locale of UNIVERSITY_INTELLIGENCE_COPY_LOCALES) {
    const copy = getUniversityIntelligenceCopy(locale);
    assert.deepEqual(Object.keys(copy).sort(), keys);
    for (const [k, v] of Object.entries(copy)) {
      assert.ok(typeof v === "string" && v.length > 0);
      assert.notEqual(v, k);
    }
  }
  const uz = getUniversityIntelligenceCopy("uz");
  assert.ok(!/^University Intelligence$/.test(uz.title));
  assert.ok(getUniversityIntelligenceCopy("ru").primaryAction.length > 10);
  assert.ok(getUniversityIntelligenceCopy("tr").primaryAction.length > 5);
});

test("UIS-9: university OO drafts stay draft; presets expanded", () => {
  assert.ok(UNIVERSITY_LINKED_PRESETS.includes("research_question"));
  assert.ok(UNIVERSITY_LINKED_PRESETS.includes("decision_brief"));
  const { draft } = buildUniversityLinkedWorkDraft(
    {
      universityId: "tuit",
      universityName: "Tashkent University of Information Technologies",
      routePath: "/universities?university=tuit",
    },
    "evidence_request",
    "uz",
  );
  assert.equal(draft.status, "draft");
});

test("UIS-10: voice commands — navigate vs draft; idempotent", () => {
  const labs = resolveUniversityIntelligenceVoiceCommand(
    "Show laboratories working on water purification.",
  );
  assert.ok(labs && labs.type === "navigate");
  if (labs?.type === "navigate") assert.ok(labs.href.includes("laboratories"));

  const present = resolveUniversityIntelligenceVoiceCommand(
    "I want to present my water purification project to universities in Germany and Uzbekistan.",
  );
  assert.ok(present && present.type === "suggest_draft");
  if (present?.type === "suggest_draft") {
    assert.equal(present.requiresHumanConfirmation, true);
    assert.equal(present.preset, "project_presentation");
  }

  const a = resolveUniversityIntelligenceVoiceCommand("Find universities in Germany and Uzbekistan.");
  const b = resolveUniversityIntelligenceVoiceCommand("Find universities in Germany and Uzbekistan.");
  assert.ok(a && b && "idempotencyKey" in a && "idempotencyKey" in b);
  if (a && b && "idempotencyKey" in a && "idempotencyKey" in b) {
    assert.equal(a.idempotencyKey, b.idempotencyKey);
  }
});

test("UIS-11: UI surfaces — official/CBAI, primary action, monogram", () => {
  const view = readSource("components/universities/UniversityIntelligenceNetworkView.tsx");
  assert.ok(view.includes("data-cbai-official-source"));
  assert.ok(view.includes("data-cbai-cbai-analysis"));
  assert.ok(view.includes("data-cbai-primary-action"));
  assert.ok(view.includes("data-cbai-presentation-card"));
  assert.ok(view.includes("data-cbai-opportunity-radar"));
  assert.ok(readSource("components/universities/UniversityLogoMark.tsx").includes("data-cbai-neutral-monogram"));
  assert.ok(existsSync(join(ROOT, "docs/verification/university-intelligence/design-decisions.md")));
});
