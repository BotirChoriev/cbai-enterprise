/**
 * Adaptive workspace + canonical CheckBalanceAI.Global brand regression suite.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  ABOUT_IDENTITY_LAST_UPDATED,
  CANONICAL_BRAND_FACTS,
  CANONICAL_BRAND_VERSION,
  answerBrandFaq,
  assertsNoInventedFounder,
  getCanonicalBrand,
  getOperatorIntroduction,
  getShortOperatorIdentity,
} from "@/lib/brand/canonical-identity";
import {
  ADAPTIVE_WORKSPACE_MAPPINGS,
  buildWorkspaceCreationDraft,
  interpretRoleStatement,
} from "@/lib/adaptive-workspace/role-discovery";
import {
  detectRoleIntent,
  getWorkspaceTemplate,
  listWorkspaceTemplates,
} from "@/lib/adaptive-workspace/templates";
import {
  DEFAULT_NEW_WORK_PRIVACY,
  describeDiscoveryCapability,
  listPublicActivity,
  type GlobalActivityItem,
} from "@/lib/discovery/global-activity";
import {
  createOriginalContentView,
  mediaUploadCapability,
  meetingTranslationCapability,
} from "@/lib/collaboration/groups-meetings-media";
import {
  answerCbaiIdentityFaq,
  CBAI_IDENTITY_VERSION,
  getCbaiIdentity,
  levelRequiresConfirmation,
  classifyVoiceActionLevel,
} from "@/lib/voice-operator/identity";
import { buildVoiceOperatorInstructions, getVoiceOperatorFirstRunIntro } from "@/lib/voice-operator/instructions";
import { primaryNavSections, secondaryNavSections } from "@/lib/navigation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateNavLabel, translateNavSectionTitle } from "@/lib/i18n/nav-translation";

test("canonical brand facts are authoritative and locale-stable", () => {
  assert.equal(CANONICAL_BRAND_FACTS.publicPlatformName, "CheckBalanceAI.Global");
  assert.equal(CANONICAL_BRAND_FACTS.canonicalDomain, "checkbalanceai.global");
  assert.equal(CANONICAL_BRAND_FACTS.productSystemName, "CBAI Intelligence Operating System");
  assert.equal(CANONICAL_BRAND_FACTS.founderName, "Botir Choriev");
  assert.match(CANONICAL_BRAND_FACTS.relationship, /powers the CheckBalanceAI\.Global platform/);
  assert.equal(ABOUT_IDENTITY_LAST_UPDATED, "2026-07-24");
  assert.equal(CANONICAL_BRAND_VERSION, CBAI_IDENTITY_VERSION);
});

test("founder and platform FAQ answers never invent unrelated founders", () => {
  for (const locale of ["en", "uz", "ru", "tr"] as const) {
    const who = answerBrandFaq("who_founded", locale);
    const created = answerBrandFaq("who_created", locale);
    const platform = answerBrandFaq("what_is_platform", locale);
    const cbai = answerBrandFaq("what_is_cbai", locale);
    assert.match(who, /Botir Choriev/);
    assert.match(created, /Botir Choriev/);
    assert.match(platform, /CheckBalanceAI\.Global/);
    assert.match(cbai, /CBAI/);
    assert.match(cbai, /CheckBalanceAI\.Global/);
    assert.ok(assertsNoInventedFounder(who));
    assert.ok(assertsNoInventedFounder(created));
    assert.equal(assertsNoInventedFounder("Founded by Sam Altman"), false);
  }
});

test("Uzbek operator introduction matches the required semantic baseline", () => {
  const intro = getOperatorIntroduction("uz");
  // Short UZ intro uses CBAI voice identity; CheckBalanceAI.Global remains in FAQ / platform answers.
  assert.match(intro, /^Men CBAI Ovoz Operatoriman\./);
  assert.doesNotMatch(intro, /Botir/);
  assert.doesNotMatch(intro, /^Men CBAIman/);
  assert.doesNotMatch(intro, /Men sun['‘]iy intellektman/);
  assert.match(answerCbaiIdentityFaq("who_founded", "uz"), /Botir Choriev/);
  assert.match(answerCbaiIdentityFaq("what_is_platform", "uz"), /CheckBalanceAI\.Global/);
  const shortId = getShortOperatorIdentity("uz");
  assert.match(shortId, /^Men CBAI Ovoz Operatoriman/);
  assert.match(getVoiceOperatorFirstRunIntro("uz"), /^Men CBAI Ovoz Operatoriman/);
});

test("Voice identity adapter consumes the brand registry", () => {
  const id = getCbaiIdentity("en");
  assert.equal(id.founderName, "Botir Choriev");
  assert.equal(id.publicPlatformName, "CheckBalanceAI.Global");
  assert.match(answerCbaiIdentityFaq("creator", "en"), /Botir Choriev/);
  assert.match(buildVoiceOperatorInstructions("en"), /never invent founders/i);
  assert.match(buildVoiceOperatorInstructions("uz"), /CheckBalanceAI\.Global/);
});

test("About platform identity section uses the brand registry", () => {
  const about = readFileSync("components/about/PlatformIdentitySection.tsx", "utf8");
  assert.match(about, /getCanonicalBrand/);
  assert.match(about, /CANONICAL_BRAND_FACTS/);
  assert.match(about, /ABOUT_IDENTITY_LAST_UPDATED/);
  assert.match(about, /data-platform-identity="canonical"/);
  assert.match(readFileSync("components/about/AboutPageClient.tsx", "utf8"), /PlatformIdentitySection/);
});

test("role detection covers every supported template role", () => {
  const cases: Array<{ text: string; templateId: string }> = [
    { text: "I am a student studying biology", templateId: "student" },
    { text: "I am a researcher working on climate", templateId: "researcher_scientist" },
    { text: "I am a scientist testing a hypothesis", templateId: "researcher_scientist" },
    { text: "I am an educator preparing a course", templateId: "academic_educator" },
    { text: "I am an academic writing a syllabus", templateId: "academic_educator" },
    { text: "Men iqtisodchiman. O‘zbekiston inflyatsiyasi", templateId: "economist" },
    { text: "I work in government public administration", templateId: "government" },
    { text: "I am an investor analysing a sector", templateId: "investor_analyst" },
    { text: "I represent an organization building a team", templateId: "organization" },
    { text: "I am a chemist preparing a thesis", templateId: "chemist_scientist" },
    { text: "I am not sure yet", templateId: "general" },
  ];
  for (const item of cases) {
    const detected = detectRoleIntent(item.text);
    assert.equal(detected.templateId, item.templateId, item.text);
  }
  assert.equal(listWorkspaceTemplates().length, 9);
});

test("role interpretation requires confirmation and defaults to private", () => {
  const interpretation = interpretRoleStatement({
    text: "I am a student.",
    locale: "en",
  });
  assert.equal(interpretation.understoodRole, "student");
  assert.equal(interpretation.privacy, "private");
  assert.ok(interpretation.missingInformation.length >= 1);
  assert.ok(interpretation.missingInformation.length <= 3);
  const draft = buildWorkspaceCreationDraft({ interpretation, locale: "en" });
  assert.equal(draft.status, "awaiting_confirmation");
  assert.equal(draft.privacy, "private");
  assert.equal(draft.operationalObjectDraft.humanApprovalRequired, true);
  assert.equal(draft.operationalObjectDraft.status, "draft");
  assert.ok(draft.firstThreeActions.length === 3);
});

test("command-to-workspace draft is transparent and editable without silent create", () => {
  const interpretation = interpretRoleStatement({
    text: "Men iqtisodchiman. O‘zbekiston inflyatsiyasi bo‘yicha tahlil qilmoqchiman.",
    locale: "uz",
  });
  const draft = buildWorkspaceCreationDraft({
    interpretation,
    locale: "uz",
    edits: {
      workspaceName: "Inflation desk",
      projectName: "Uzbekistan inflation 2026",
      privacy: "private",
    },
  });
  assert.equal(draft.interpretation.suggestedTemplateId, "economist");
  assert.equal(draft.country, "Uzbekistan");
  assert.equal(draft.topic, "inflation");
  assert.equal(draft.proposedWorkspaceName, "Inflation desk");
  assert.equal(draft.proposedProjectName, "Uzbekistan inflation 2026");
  assert.ok(draft.suggestedOfficialSources.length > 0);
  assert.ok(draft.suggestedIndicators.length > 0);
  assert.equal(draft.status, "awaiting_confirmation");
  const client = readFileSync("components/adaptive-workspace/AdaptiveWorkspaceClient.tsx", "utf8");
  assert.match(client, /openComposer/);
  assert.match(client, /awaiting_confirmation/);
  assert.doesNotMatch(client, /createObject\(/);
});

test("every template field remains editable starting structure", () => {
  for (const template of listWorkspaceTemplates()) {
    assert.equal(template.defaultPrivacy, "private");
    assert.ok(template.fields.length >= 5);
    assert.ok(getWorkspaceTemplate(template.id).id === template.id);
  }
  assert.ok(ADAPTIVE_WORKSPACE_MAPPINGS.workspace.includes("OperationalObject"));
  assert.ok(ADAPTIVE_WORKSPACE_MAPPINGS.userProfile.includes("workspaceRole"));
});

test("public discovery only includes opted-in public items", () => {
  assert.equal(DEFAULT_NEW_WORK_PRIVACY, "private");
  assert.equal(describeDiscoveryCapability({ publicItemCount: 0 }), "empty");
  const mixed: GlobalActivityItem[] = [
    {
      id: "private-1",
      actorOrOrganization: "User",
      objectType: "public_project",
      title: "Hidden",
      shortDescription: "Should not appear",
      sourceProvenance: "user",
      publishedOrUpdatedAt: "2026-07-24T00:00:00.000Z",
      language: "en",
      evidenceStatus: "unverified",
      visibility: "private",
      relatedEntityOrTopic: null,
      openHref: "/my-work",
    },
    {
      id: "public-1",
      actorOrOrganization: "Org",
      objectType: "public_research",
      title: "Visible",
      shortDescription: "Opted in",
      sourceProvenance: "user",
      publishedOrUpdatedAt: "2026-07-24T00:00:00.000Z",
      language: "en",
      evidenceStatus: "partial",
      visibility: "public",
      relatedEntityOrTopic: "education",
      openHref: "/research",
    },
  ];
  const publicOnly = listPublicActivity(mixed);
  assert.equal(publicOnly.length, 1);
  assert.equal(publicOnly[0]?.id, "public-1");
  assert.ok(existsSync("app/(dashboard)/discover/page.tsx"));
});

test("original language is preserved and translation metadata is honest", () => {
  const view = createOriginalContentView({
    originalText: "Men iqtisodchiman",
    originalLanguage: "uz",
  });
  assert.equal(view.translationState, "original");
  assert.equal(view.originalLanguage, "uz");
  assert.equal(view.interfaceTranslation, null);
  assert.equal(view.machineTranslationLabeled, false);
  assert.equal(meetingTranslationCapability(), "live_audio_pipeline_required");
  assert.equal(mediaUploadCapability(), "configuration_required");
});

test("consequential voice actions require confirmation; navigation may be immediate", () => {
  assert.equal(levelRequiresConfirmation(classifyVoiceActionLevel("navigate.home")), false);
  assert.equal(levelRequiresConfirmation(classifyVoiceActionLevel("project.compose")), true);
  assert.equal(levelRequiresConfirmation(classifyVoiceActionLevel(null, "please publish this report")), true);
  assert.equal(levelRequiresConfirmation(classifyVoiceActionLevel(null, "delete this record")), true);
  const instructions = buildVoiceOperatorInstructions("en");
  assert.match(instructions, /require explicit confirmation/i);
  assert.match(instructions, /Safe navigation may proceed immediately/i);
});

test("primary IA uses CORE Intelligence Operations Oversight System with Advanced disclosure", () => {
  const hrefs = primaryNavSections.flatMap((section) => section.items).map((item) => item.href);
  assert.ok(hrefs.includes("/"));
  assert.ok(hrefs.includes("/my-work"));
  assert.ok(hrefs.includes("/search"));
  assert.ok(hrefs.includes("/countries"));
  assert.ok(hrefs.includes("/research"));
  assert.ok(hrefs.includes("/evidence"));
  assert.ok(hrefs.includes("/graph"));
  assert.ok(hrefs.includes("/rooms"));
  assert.ok(hrefs.includes("/reports"));
  assert.ok(hrefs.includes("/governance"));
  assert.ok(hrefs.includes("/trust"));
  assert.ok(hrefs.includes("/settings"));
  assert.ok(hrefs.includes("/about"));
  assert.ok(!hrefs.includes("/discover"), "Discover remains Advanced disclosure");
  const secondary = secondaryNavSections.flatMap((section) => section.items).map((item) => item.href);
  assert.ok(secondary.includes("/discover"));
  assert.ok(secondary.includes("/notifications"));
  assert.ok(secondaryNavSections.some((section) => section.title === "Advanced"));
});

test("EN/UZ/RU/TR navigation keys exist for canonical IA sections", () => {
  for (const locale of ["en", "uz", "ru", "tr"] as const) {
    const nav = getDictionary(locale).navigation;
    assert.ok(nav.globalActivity.length > 0, locale);
    assert.ok(nav.intelligence.length > 0, locale);
    assert.ok(nav.operations.length > 0, locale);
    assert.ok(nav.oversight.length > 0, locale);
    assert.ok(nav.system.length > 0, locale);
    assert.ok(nav.advanced.length > 0, locale);
    assert.ok(nav.core.length > 0, locale);
    assert.ok(nav.privacy.length > 0, locale);
    const t = (path: string) => {
      const [root, key] = path.split(".");
      return (getDictionary(locale) as Record<string, Record<string, string>>)[root!]![key!]!;
    };
    assert.equal(translateNavLabel(t, "/discover", "Global Activity"), nav.globalActivity);
    assert.equal(translateNavSectionTitle(t, "Intelligence"), nav.intelligence);
    assert.equal(translateNavSectionTitle(t, "Operations"), nav.operations);
    assert.equal(translateNavSectionTitle(t, "Oversight"), nav.oversight);
    assert.equal(translateNavSectionTitle(t, "System"), nav.system);
    assert.equal(translateNavSectionTitle(t, "Advanced"), nav.advanced);
    assert.equal(translateNavLabel(t, "/settings", "Privacy"), nav.privacy);
  }
});

test("brand locale copy is complete for About identity surfaces", () => {
  for (const locale of ["en", "uz", "ru", "tr"] as const) {
    const brand = getCanonicalBrand(locale);
    assert.ok(brand.platformIdentityHeading.length > 3);
    assert.ok(brand.labelFounder.length > 2);
    assert.ok(brand.mission.length > 10);
    assert.ok(brand.privacyAndVoice.length > 10);
  }
});
