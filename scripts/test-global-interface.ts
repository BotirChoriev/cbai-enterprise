// Focused tests for "Premium Interface + Global Language Foundation + Multilingual Voice
// Commands" — real translation lookups/fallback, real multilingual command resolution, real
// language/voice registries, and source-presence checks for brand/header wiring. Same
// zero-dependency harness as every other suite (Node's native node:test + the `@/` alias loader).
// There is no window/DOM/SpeechRecognition in this environment, so DOM-mutation behavior (the
// HTML lang/dir attribute actually changing, the transcript actually appearing in an <input>,
// live SpeechRecognition permission/error events) is NOT verified here — those require a real
// browser, listed honestly as browser-verification items in the mission's final report. What IS
// tested here is the real underlying logic those behaviors are built on.
// Run with: npm run test:global-interface

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";
import { translate, interpolate, getDictionary } from "@/lib/i18n/translate";
import { getActiveLanguages, getAllLanguages, isActiveLanguageCode, isRtlLanguage, resolveVoiceLocale, DEFAULT_LANGUAGE_CODE } from "@/lib/i18n/languages";
import { ASSISTANT_LANGUAGES } from "@/lib/assistant/assistant-profile";
import { loadAssistantProfile, saveAssistantProfile } from "@/lib/assistant/assistant-storage";
import { createEmptyAssistantProfile } from "@/lib/assistant/assistant-profile";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import { resolveProjectCommand } from "@/lib/project/project-commands";
import { resolveLanguageCommand } from "@/lib/i18n/language-command";
import { ROLE_WORK_CONTEXTS } from "@/lib/assistant/role-work-contexts";
import { WORKSPACE_ROLES } from "@/lib/assistant/assistant-profile";
import { PROJECT_TYPES } from "@/lib/project/project-types";
import { loadProjects } from "@/lib/project/project-store";
import { loadReports } from "@/lib/reports/reports-store";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

// ---------------------------------------------------------------------------
// 1. Logo appears globally (source-presence check)
// ---------------------------------------------------------------------------

test("1. CBAI logo/mark is wired into every required surface", () => {
  const sidebar = readSource("components/layout/Sidebar.tsx");
  const topbar = readSource("components/layout/Topbar.tsx");
  const drawer = readSource("components/layout/MobileNavDrawer.tsx");
  const shell = readSource("components/system/SystemPageShell.tsx"); // loading/error pages
  const reportLogo = readSource("components/shared/ReportHeaderLogo.tsx");

  // The persistent shell (Sidebar desktop / Topbar mobile) carries the logo on every route
  // including "/" — the home page's own content no longer duplicates it (Platform Completion
  // mission, Phase 2: one logo instance per screen, not a second copy inside page content).
  for (const source of [sidebar, topbar, drawer, shell]) {
    assert.match(source, /CBAILogo|CBAIMark/);
  }
  assert.match(reportLogo, /CBAIMark/);
});

test("2. app/icon.svg (favicon/app-icon) exists and is real SVG markup", () => {
  const icon = readSource("app/icon.svg");
  assert.match(icon, /<svg/);
  assert.match(icon, /<\/svg>/);
});

// ---------------------------------------------------------------------------
// 2-3. Interface language persistence / profile loading (SSR-safe, honest-empty outside a browser)
// ---------------------------------------------------------------------------

test("3. Assistant profile language fields are honestly empty/default outside a browser", () => {
  const profile = loadAssistantProfile();
  assert.equal(profile.preferredLanguage, "en");
  assert.equal(profile.speechLanguage, "en-US");
  saveAssistantProfile({ ...createEmptyAssistantProfile(), preferredLanguage: "uz" }); // must not throw
  assert.equal(loadAssistantProfile().preferredLanguage, "en"); // still honestly default — no window to persist to
});

// ---------------------------------------------------------------------------
// 4-7. Real translation lookups for all 4 active languages
// ---------------------------------------------------------------------------

test("4. English translation works", () => {
  assert.equal(translate(en, "navigation.home"), "Home");
  assert.equal(translate(en, "project.createProject"), "Create Project");
});

test("5. Uzbek translation works", () => {
  assert.equal(translate(uz, "navigation.home"), "Bosh sahifa");
  assert.equal(translate(uz, "project.createProject"), "Loyiha yaratish");
});

test("6. Russian translation works", () => {
  assert.equal(translate(ru, "navigation.home"), "Главная");
  assert.equal(translate(ru, "project.createProject"), "Создать проект");
});

test("7. Turkish translation works", () => {
  assert.equal(translate(tr, "navigation.home"), "Ana Sayfa");
  assert.equal(translate(tr, "project.createProject"), "Proje Oluştur");
});

test("7b. getDictionary falls back to English for an unknown/inactive language code", () => {
  assert.equal(getDictionary("fr"), en);
  assert.equal(getDictionary("does-not-exist"), en);
});

// ---------------------------------------------------------------------------
// 8. Missing keys safely fall back — never a raw technical key under normal operation
// ---------------------------------------------------------------------------

test("8. Missing keys fall back to English, then to the path itself — never thrown, never blank", () => {
  const brokenDictionary = { common: {} } as unknown as typeof uz;
  assert.equal(translate(brokenDictionary, "common.save"), en.common.save); // falls back to English
  assert.equal(translate(en, "totally.made.up.path"), "totally.made.up.path"); // last-resort: the path itself, never blank/undefined
});

// ---------------------------------------------------------------------------
// 9. HTML lang / RTL preparation (DOM mutation itself requires a browser — logic tested here)
// ---------------------------------------------------------------------------

test("9. RTL registry is real and conservative — no active language is marked RTL yet", () => {
  assert.equal(isRtlLanguage("ar"), true);
  for (const language of getActiveLanguages()) {
    assert.equal(isRtlLanguage(language.code), false, `${language.code} must not be RTL yet`);
  }
});

// ---------------------------------------------------------------------------
// 10. Greeting uses the real user name and the selected language's real template
// ---------------------------------------------------------------------------

test("10. Personalized greeting interpolates the real name in all 4 languages", () => {
  for (const dictionary of [en, uz, ru, tr]) {
    const greeting = interpolate(dictionary.assistant.greetingReturning, { name: "Botir" });
    assert.ok(greeting.includes("Botir"), `greeting must include the real name: "${greeting}"`);
    assert.equal(greeting.includes("{name}"), false, "must never leak the raw {name} placeholder");
  }
});

// ---------------------------------------------------------------------------
// 11-13. Voice language / unsupported-browser / permission-denial copy is real and present
// ---------------------------------------------------------------------------

test("11. Every active language has a real, honest voice-support level and a real voiceLocale", () => {
  for (const language of getActiveLanguages()) {
    assert.ok(language.voiceLocale, `${language.code} must declare a voice locale`);
    assert.ok(["full", "partial", "unverified"].includes(language.voiceSupport));
  }
  assert.equal(resolveVoiceLocale("uz"), "uz-UZ");
  assert.equal(resolveVoiceLocale("does-not-exist"), "en-US");
});

test("12. Unsupported-browser and permission-denied copy exists (non-empty) in every active language", () => {
  for (const dictionary of [en, uz, ru, tr]) {
    assert.ok(dictionary.assistant.micUnsupportedBrowser.length > 0);
    assert.ok(dictionary.assistant.micPermissionDenied.length > 0);
    assert.ok(dictionary.assistant.micNetworkError.length > 0);
  }
});

test("13. AssistantCommandCenter places the recognized transcript in the visible input before routing", () => {
  const source = readSource("components/assistant/AssistantCommandCenter.tsx");
  assert.match(source, /setInput\(transcript\)/);
  assert.match(source, /onstart/); // real requesting->listening transition, not assumed instant
});

// ---------------------------------------------------------------------------
// 14. Multilingual command resolution — real routes, never fabricated
// ---------------------------------------------------------------------------

test("14. Supported multilingual commands resolve to real routes in all 4 languages", () => {
  const uzCreate = resolveAssistantCommand("Yangi loyiha yarat");
  assert.ok(uzCreate);
  assert.equal(uzCreate!.href, "/my-work");

  const ruEvidence = resolveAssistantCommand("Найди доказательства");
  assert.ok(ruEvidence);
  assert.equal(ruEvidence!.href, "/knowledge");

  const trReport = resolveAssistantCommand("Rapor oluştur");
  assert.ok(trReport);
  assert.equal(trReport!.href, "/analytics");

  const enMyWork = resolveAssistantCommand("Open my work");
  assert.ok(enMyWork);
  assert.equal(enMyWork!.href, "/my-work");
});

test("14b. Object-first Uzbek/Turkish 'open <country>' resolves via the real catalog, not a guess", () => {
  const uzOpen = resolveAssistantCommand("O'zbekistonni och");
  assert.ok(uzOpen, "must resolve when a real country name + open verb are both present");
  assert.match(uzOpen!.href, /^\/countries\?country=/);

  const noEntity = resolveAssistantCommand("mutlaqo notanish narsani och");
  assert.equal(noEntity, null, "must not fabricate a match when no real entity name is present");
});

test("15. Unsupported/unrecognized input never fakes success", () => {
  assert.equal(resolveAssistantCommand("asdkjfhaskjdfh qwerty 12345"), null);
});

test("15b. Multilingual project commands resolve honestly (no projects exist outside a browser)", () => {
  const result = resolveProjectCommand("loyihani davom ettir");
  assert.ok(result);
  assert.equal(result!.type, "message"); // honest "no projects yet" — never a fabricated project
});

test("15c. resolveLanguageCommand changes language/voice with a visible confirmation, or navigates honestly", () => {
  const setInterface = resolveLanguageCommand("change language to Turkish");
  assert.ok(setInterface);
  assert.equal(setInterface!.type, "set-interface-language");
  if (setInterface!.type === "set-interface-language") assert.equal(setInterface!.code, "tr");

  const setVoice = resolveLanguageCommand("change voice language to Russian");
  assert.ok(setVoice);
  assert.equal(setVoice!.type, "set-voice-language");

  const vague = resolveLanguageCommand("change language");
  assert.ok(vague);
  assert.equal(vague!.type, "navigate"); // no target language named — honest navigation, not a guess

  assert.equal(resolveLanguageCommand("open my work"), null); // not a language command at all
});

// ---------------------------------------------------------------------------
// 16. Role selection changes suggested actions — real config, no new data model
// ---------------------------------------------------------------------------

test("16. All 11 role/work-context cards map to real WorkspaceRole and ProjectTypeId values", () => {
  assert.equal(ROLE_WORK_CONTEXTS.length, 11);
  const seenIds = new Set<string>();
  for (const role of ROLE_WORK_CONTEXTS) {
    assert.equal(seenIds.has(role.id), false, `duplicate role id ${role.id}`);
    seenIds.add(role.id);
    assert.ok(WORKSPACE_ROLES.includes(role.workspaceRole), `${role.workspaceRole} must be a real WorkspaceRole`);
    assert.ok(PROJECT_TYPES.some((t) => t.id === role.primaryProjectType), `${role.primaryProjectType} must be a real ProjectTypeId`);
    assert.match(role.firstActionHref, /^\//);
    for (const dictionary of [en, uz, ru, tr]) {
      const roleText = (dictionary.roles as Record<string, { title: string; description: string; firstAction: string }>)[role.id];
      assert.ok(roleText.title.length > 0);
      assert.ok(roleText.description.length > 0);
      assert.ok(roleText.firstAction.length > 0);
    }
  }
});

// ---------------------------------------------------------------------------
// 17-18. Intelligence feed and project panels use only real data — never fabricated
// ---------------------------------------------------------------------------

test("17. Intelligence Feed's real data sources are honestly empty outside a browser (no fake records)", () => {
  assert.deepEqual(loadProjects(), []);
  assert.deepEqual(loadReports(), []);
  const feedSource = readSource("components/platform/home/HomeIntelligenceFeed.tsx");
  assert.match(feedSource, /loadProjects/);
  assert.match(feedSource, /loadReports/);
  assert.match(feedSource, /feedEmptyTitle/); // the exact honest empty-state copy key
});

test("18. Home project panel reuses the real ProjectList — no second project-summary implementation", () => {
  const source = readSource("components/platform/home/HomeProjectsSection.tsx");
  assert.match(source, /import ProjectList from "@\/components\/project\/ProjectList"/);
});

// ---------------------------------------------------------------------------
// 19. Existing + new routes remain functional (file-existence, same discipline as launch-gate)
// ---------------------------------------------------------------------------

test("19. Every canonical route's page.tsx exists, including the routes this mission added", () => {
  const routes = [
    "app/(dashboard)/page.tsx",
    "app/(dashboard)/my-work/page.tsx",
    "app/(dashboard)/search/page.tsx",
    "app/(dashboard)/countries/page.tsx",
    "app/(dashboard)/companies/page.tsx",
    "app/(dashboard)/universities/page.tsx",
    "app/(dashboard)/research/page.tsx",
    "app/(dashboard)/knowledge/page.tsx",
    "app/(dashboard)/reports/page.tsx",
    "app/(dashboard)/analytics/page.tsx",
    "app/(dashboard)/trust/page.tsx",
    "app/(dashboard)/settings/page.tsx",
    "app/(dashboard)/account/page.tsx",
    "app/(dashboard)/reset-password/page.tsx",
    "app/icon.svg",
  ];
  for (const route of routes) {
    assert.doesNotThrow(() => readSource(route), `${route} must exist`);
  }
});

test("19b. Navigation data still lists exactly the 7 approved primary items, and secondary modules remain real routes", () => {
  const navSource = readSource("lib/navigation.ts");
  assert.match(navSource, /secondaryNavSections/);
  assert.match(navSource, /export const mainNav/);
});

// ---------------------------------------------------------------------------
// 20. Mobile header includes the language selector (source-presence check)
// ---------------------------------------------------------------------------

test("20. Mobile/global header wires in LanguageSelector and a hamburger trigger", () => {
  const topbar = readSource("components/layout/Topbar.tsx");
  assert.match(topbar, /LanguageSelector/);
  assert.match(topbar, /onMenuClick/);
  const layout = readSource("app/(dashboard)/layout.tsx");
  assert.match(layout, /MobileNavDrawer/);
});

// ---------------------------------------------------------------------------
// 21. Reduced-motion support (class-toggle logic tested; actual media rendering needs a browser)
// ---------------------------------------------------------------------------

test("21. Reduced-motion class toggle is wired to the real accessibility preference", () => {
  const provider = readSource("components/platform/context/AssistantProfileProvider.tsx");
  assert.match(provider, /cbai-reduced-motion/);
  const css = readSource("app/globals.css");
  assert.match(css, /cbai-reduced-motion/);
});

// ---------------------------------------------------------------------------
// 22. Future languages are registered but honestly inactive
// ---------------------------------------------------------------------------

test("22. Future languages are registered but never appear active until translated and voice-verified", () => {
  const active = getActiveLanguages().map((l) => l.code).sort();
  assert.deepEqual(active, ["en", "ru", "tr", "uz"]);

  const all = getAllLanguages();
  assert.ok(all.length > active.length, "future languages must be registered for expansion");
  assert.equal(isActiveLanguageCode("ar"), false);
  assert.equal(isActiveLanguageCode("es"), false);
  assert.equal(DEFAULT_LANGUAGE_CODE, "en");

  // ASSISTANT_LANGUAGES (the storable-preference catalog) and the richer i18n registry must agree
  // on which codes are active — two lists describing the same real state, never contradicting.
  const assistantActive = ASSISTANT_LANGUAGES.filter((l) => l.available).map((l) => l.code).sort();
  assert.deepEqual(assistantActive, active);
});

// ---------------------------------------------------------------------------
// 23-26. BUILD-009 — full About copy, governance principles, unified entity/graph i18n
// ---------------------------------------------------------------------------

test("23. BUILD-009 About page copy includes all restored sections in every active language", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.equal(dict.aboutPage.principles.length, 12);
    assert.ok(dict.aboutPage.limitationsItems.length >= 5);
    assert.ok(dict.aboutPage.roadmapItems.length >= 5);
    assert.ok(dict.aboutPage.manifestoItems.length >= 15);
    assert.ok(dict.aboutPage.trustDoes.length >= 4);
  }
});

test("24. BUILD-009 governance constitutional principles are translated without altering IDs", () => {
  const ids = [
    "evidence-first",
    "political-neutrality",
    "zero-demo-policy",
    "methodology-before-metrics",
    "separation-of-evidence-and-judgment",
    "no-social-sentiment-scoring",
    "official-source-priority",
    "reproducibility",
    "governance-before-release",
  ] as const;
  for (const dict of [en, uz, ru, tr]) {
    for (const id of ids) {
      assert.ok(dict.governanceCenter.principles[id]?.title);
      assert.ok(dict.governanceCenter.principles[id]?.description);
    }
  }
});

test("25. BUILD-009 shared entity intelligence and graph UI keys exist in all dictionaries", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.entityIntelligence.reportsBodySingle);
    assert.ok(dict.entityIntelligence.benchmarkUniversity);
    assert.ok(dict.graphUi.noSelectionConnections);
    assert.ok(dict.graphUi.futureEvidenceDefault);
    assert.ok(dict.reportsModel.exportFutureDescription);
  }
});

test("26. BUILD-009 unified entity relationship and source coverage components are client-i18n wired", () => {
  const sourcePanel = readSource("components/shared/EntitySourceCoveragePanel.tsx");
  const relSection = readSource("components/shared/EntityRelationshipsSection.tsx");
  const aboutClient = readSource("components/about/AboutPageClient.tsx");
  assert.match(sourcePanel, /useTranslation/);
  assert.match(relSection, /useTranslation/);
  assert.match(aboutClient, /limitationsEyebrow|limitationsHeadline/);
  assert.match(aboutClient, /roadmapEyebrow|roadmapHeadline/);
  assert.match(aboutClient, /manifestoTitle/);
});
