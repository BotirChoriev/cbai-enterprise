/**
 * Rendered Uzbek UI leakage regression — exercises runtime translation, not dictionary files alone.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { getCompanyLinkedEntities } from "@/lib/companies.adapter";
import { getUniversityLinkedEntities } from "@/lib/universities.adapter";
import {
  buildCountryIntelligenceProfile,
  resolveCountryListEvidenceLabel,
} from "@/lib/countries.intelligence";
import {
  buildCompanyIntelligenceProfile,
  resolveCompanyListEvidenceLabel,
} from "@/lib/companies.intelligence";
import {
  buildUniversityIntelligenceProfile,
  resolveUniversityListEvidenceLabel,
} from "@/lib/universities.intelligence";
import { getDictionary } from "@/lib/i18n/translate";
import {
  REGISTRY_SOURCE_LABEL,
  assertNoEnglishEntityUiLeakage,
  translateEntityListEvidenceLabel,
  translateOfficialInformationLabel,
  UZ_ENTITY_UI_LEAKAGE_PHRASES,
} from "@/lib/i18n/entity-ui-translation";

test("UZ entity list evidence labels are translated at runtime", () => {
  const uz = getDictionary("uz");
  const country = countries.find((entry) => entry.id === "uzbekistan");
  assert.ok(country);
  const profile = buildCountryIntelligenceProfile(country!, getCountryRelationships(country!));
  const translated = translateEntityListEvidenceLabel(uz, resolveCountryListEvidenceLabel(profile));
  assertNoEnglishEntityUiLeakage(translated, "country list evidence");
  assert.match(translated, /ko'rsatkich|Reyestr|Dalillar/i);
});

test("UZ official information label is translated at runtime", () => {
  const uz = getDictionary("uz");
  const translated = translateOfficialInformationLabel(uz, REGISTRY_SOURCE_LABEL);
  assert.equal(translated, uz.entityUi.officialInformationAvailable);
  assertNoEnglishEntityUiLeakage(translated, "official information");
});

test("UZ company and university cards evidence strings avoid English UI leakage", () => {
  const uz = getDictionary("uz");
  const company = companies.find((entry) => entry.id === "apple");
  const university = universities.find((entry) => entry.id === "harvard");
  assert.ok(company);
  assert.ok(university);

  const companyLabel = translateEntityListEvidenceLabel(
    uz,
    resolveCompanyListEvidenceLabel(
      buildCompanyIntelligenceProfile(company!, getCompanyLinkedEntities(company!)),
    ),
  );
  const universityLabel = translateEntityListEvidenceLabel(
    uz,
    resolveUniversityListEvidenceLabel(
      buildUniversityIntelligenceProfile(university!, getUniversityLinkedEntities(university!)),
    ),
  );

  assertNoEnglishEntityUiLeakage(companyLabel, "company list evidence");
  assertNoEnglishEntityUiLeakage(universityLabel, "university list evidence");
});

test("UZ evidence-gap cards render localized labels, reasons, statuses, and next steps", () => {
  const uz = getDictionary("uz");
  const ru = getDictionary("ru");
  const tr = getDictionary("tr");
  // The gap card, summary, sources, and methodology sections previously hardcoded English.
  for (const dict of [uz, ru, tr]) {
    const gapKeys = [
      dict.entityIntelligence.gapWhyMissing,
      dict.entityIntelligence.gapExpectedSource,
      dict.entityIntelligence.gapNextStep,
      dict.entityIntelligence.gapStatusAvailable,
      dict.entityIntelligence.gapStatusPlanned,
      dict.entityIntelligence.gapStatusMissing,
      dict.entityIntelligence.gapStatusBlocked,
      dict.entityIntelligence.gapReasonNotConnected,
      dict.entityIntelligence.gapNextMissingNoSource,
      dict.entityIntelligence.gapSummaryTotalTopics,
      dict.entityIntelligence.gapSummaryHumanReview,
      dict.entityIntelligence.gapSourcesHeading,
      dict.entityIntelligence.gapMethodologyHeading,
    ];
    for (const value of gapKeys) {
      assert.ok(value && value.length > 0);
    }
  }
  // Exact English strings must not survive in the UZ dictionary values.
  assert.notEqual(uz.entityIntelligence.gapWhyMissing, "Why missing");
  assert.notEqual(uz.entityIntelligence.gapExpectedSource, "Expected source");
  assert.notEqual(uz.entityIntelligence.gapNextStep, "Next step");
  assert.notEqual(uz.entityIntelligence.gapStatusMissing, "Missing");
  assert.equal(uz.entityIntelligence.gapWhyMissing, "Nega yetishmayapti");
  assert.equal(uz.entityIntelligence.gapExpectedSource, "Kutilayotgan manba");
  assert.equal(uz.entityIntelligence.gapNextStep, "Keyingi qadam");
});

test("Evidence gap components use translation keys, not hardcoded English labels", async () => {
  const { readFileSync } = await import("node:fs");
  for (const file of [
    "components/evidence-gap/EvidenceGapCard.tsx",
    "components/evidence-gap/EvidenceGapSummary.tsx",
    "components/evidence-gap/EvidenceGapSources.tsx",
    "components/evidence-gap/EvidenceGapMethodology.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /useTranslation/, file);
    assert.doesNotMatch(source, />Why missing</, file);
    assert.doesNotMatch(source, />Expected source</, file);
    assert.doesNotMatch(source, />Next step</, file);
    assert.doesNotMatch(source, /"Available now"/, file);
    assert.doesNotMatch(source, /Official Source Coverage\s*</, file);
    assert.doesNotMatch(source, /Methodology References\s*</, file);
  }
});

test("Mental model strip, flow stages, and evidence pulse render via structured i18n keys", async () => {
  const { getDictionary } = await import("@/lib/i18n/translate");
  const { deriveEvidencePulse } = await import("@/lib/intelligence-os/evidence-pulse");
  const { deriveIntelligenceFlow } = await import("@/lib/intelligence-os/intelligence-flow");

  // Engines expose structured keys for every deterministic English fallback.
  const pulse = deriveEvidencePulse(null);
  assert.equal(pulse.labelParts.length, 1);
  assert.equal(pulse.labelParts[0]!.key, "pulseNoProject");

  const flow = deriveIntelligenceFlow(null);
  for (const stage of flow) {
    assert.ok(stage.labelKey.startsWith("flowLabel"), `${stage.id} labelKey`);
  }
  const question = flow.find((s) => s.id === "question");
  assert.equal(question?.detailKey, "flowDetailFrameInquiry");

  // All four dictionaries carry the keys, and UZ/RU/TR are not the raw English strings.
  for (const locale of ["en", "uz", "ru", "tr"] as const) {
    const dict = getDictionary(locale);
    const ee = dict.experienceEngineering as Record<string, string>;
    for (const key of [
      "flowLabelQuestion",
      "flowLabelLegacy",
      "flowDetailFrameInquiry",
      "flowDetailStatePurpose",
      "pulseNoProject",
      "pulseNoEvidence",
      "pulseConflicts",
      "pulseLinked",
    ]) {
      assert.ok(ee[key] && ee[key].length > 0, `${locale}.experienceEngineering.${key}`);
    }
  }
  const uzEe = getDictionary("uz").experienceEngineering as Record<string, string>;
  assert.notEqual(uzEe.pulseNoProject, "No project linked to this mission");
  assert.notEqual(uzEe.flowDetailFrameInquiry, "Frame the inquiry");

  // The rendering surfaces translate instead of printing the raw English fallbacks.
  const { readFileSync } = await import("node:fs");
  const strip = readFileSync("components/operating/MentalModelStrip.tsx", "utf8");
  assert.match(strip, /happeningParts/);
  assert.match(strip, /unfinishedStage/);
  assert.match(strip, /nextLabelKey/);
  const rail = readFileSync("components/operating/LivingContextRail.tsx", "utf8");
  assert.match(rail, /experienceEngineering\.\$\{stage\.labelKey\}/);
  const column = readFileSync("components/operating/OperatingContextColumn.tsx", "utf8");
  assert.match(column, /experienceEngineering\.\$\{stage\.labelKey\}/);
  const pulsePanel = readFileSync("components/intelligence-os/EvidencePulsePanel.tsx", "utf8");
  assert.match(pulsePanel, /labelParts/);
});

test("UZ project create and entity selected keys are localized", () => {
  const uz = getDictionary("uz");
  assert.equal(uz.project.createProject, "Loyiha yaratish");
  assert.equal(uz.entities.selected, "Tanlangan");
  assert.equal(uz.entities.share, "Ulashish");
  for (const phrase of UZ_ENTITY_UI_LEAKAGE_PHRASES) {
    if (phrase === "Create Project") {
      assert.notEqual(uz.project.createProject, phrase);
    }
    if (phrase === "Selected") {
      assert.notEqual(uz.entities.selected, phrase);
    }
    if (phrase === "Share") {
      assert.notEqual(uz.entities.share, phrase);
    }
  }
});
