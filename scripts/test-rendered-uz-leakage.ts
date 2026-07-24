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
