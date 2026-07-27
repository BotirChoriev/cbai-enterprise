/**
 * Intelligence OS unification regression gates.
 *
 * Covers the P0 "one canonical Voice surface" + strict UZ taxonomy localization
 * closure work:
 *   - single Home Voice entry point (hero action only)
 *   - transcript lives inside the dock panel, never as a separate floating card
 *   - transcript auto-collapses on route navigation (memory preserved)
 *   - platform taxonomy (industries / research domains) is localized, while
 *     registered proper names pass through unchanged.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  KNOWN_INDUSTRY_LABELS,
  KNOWN_RESEARCH_DOMAIN_LABELS,
  localizeIndustryLabel,
  localizeResearchDomainLabel,
} from "@/lib/i18n/entity-domain-labels";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

// --- Taxonomy localization ------------------------------------------------

test("company industry taxonomy is localized for uz / ru / tr", () => {
  assert.equal(localizeIndustryLabel("Artificial Intelligence", "uz"), "Sun’iy intellekt");
  assert.equal(localizeIndustryLabel("Automotive", "uz"), "Avtomobil sanoati");
  assert.equal(localizeIndustryLabel("Consumer Electronics", "uz"), "Maishiy elektronika");
  assert.equal(localizeIndustryLabel("E-Commerce", "uz"), "Elektron tijorat");
  assert.equal(localizeIndustryLabel("Semiconductors", "uz"), "Yarimo‘tkazgichlar");
  assert.equal(localizeIndustryLabel("Technology", "uz"), "Texnologiya");
  // canonicalizes tagged locales
  assert.equal(localizeIndustryLabel("Automotive", "uz-UZ"), "Avtomobil sanoati");
  assert.equal(localizeIndustryLabel("Technology", "ru-RU"), "Технологии");
  assert.equal(localizeIndustryLabel("Technology", "tr-TR"), "Teknoloji");
});

test("english locale returns the canonical english taxonomy label", () => {
  for (const label of KNOWN_INDUSTRY_LABELS) {
    assert.equal(localizeIndustryLabel(label, "en"), label);
  }
  for (const label of KNOWN_RESEARCH_DOMAIN_LABELS) {
    assert.equal(localizeResearchDomainLabel(label, "en"), label);
  }
});

test("research domain taxonomy is localized under uz", () => {
  assert.equal(localizeResearchDomainLabel("Life Sciences", "uz"), "Hayot fanlari");
  assert.equal(localizeResearchDomainLabel("Computer Science", "uz"), "Kompyuter fanlari");
  assert.equal(localizeResearchDomainLabel("Climate & Environment", "uz"), "Iqlim va atrof-muhit");
});

test("registered proper names and unknown labels pass through unchanged", () => {
  // Proper names must never be routed to a localized taxonomy value.
  assert.equal(localizeIndustryLabel("Apple", "uz"), "Apple");
  assert.equal(localizeIndustryLabel("United States", "ru"), "United States");
  assert.equal(localizeResearchDomainLabel("Stanford University", "tr"), "Stanford University");
});

// --- One canonical Voice surface -----------------------------------------

test("Home exposes exactly one interactive Voice entry through ActivationExperience", () => {
  const home = readSource("components/spatial-world/SpatialWorldIntelligenceHome.tsx");
  const activation = readSource("components/activation/ActivationExperience.tsx");
  const openDockCalls = activation.match(/vo\.openDock\(\)/g) ?? [];
  assert.equal(
    openDockCalls.length,
    1,
    "ActivationExperience must have exactly one interactive Voice Operator launcher.",
  );
  assert.equal(
    (home.match(/<ActivationExperience\b/g) ?? []).length,
    1,
    "Home must render exactly one ActivationExperience entry surface.",
  );
  assert.match(home, /commandCopy\.operatorFromHero/);
  assert.doesNotMatch(home, /commandCopy\.openOperator/);
  assert.match(
    activation,
    /disabled=\{vo\.dockOpen\}/,
    "The activation Voice action must be disabled whenever the canonical dock is open.",
  );
});

test("Rooms does not create a page-specific Voice launcher or Stop control", () => {
  const src = readSource("components/live-intelligence-rooms/RoomShell.tsx");
  assert.doesNotMatch(src, /voice\.openDock\(/);
  assert.doesNotMatch(src, /voiceOperator\.openDock/);
  assert.doesNotMatch(src, /voiceOperator\.stopLiveListening/);
  // Ending the room may still stop global capture as lifecycle cleanup.
  assert.match(src, /function endLive\(\)[^]*voice\.stopListening\(\)/);
});

test("dock transcript lives inside the panel, not a separate floating card", () => {
  const src = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  const panelIndex = src.indexOf("cbai-voice-dock-panel");
  const transcriptIndex = src.indexOf("copy.transcriptTitle");
  assert.ok(panelIndex >= 0, "dock panel wrapper must exist");
  assert.ok(transcriptIndex >= 0, "transcript block must exist");
  assert.ok(
    transcriptIndex > panelIndex,
    "transcript must render inside the dock panel (after cbai-voice-dock-panel), never as a separate floating card above it.",
  );
  // Guard against reintroducing a detached floating transcript window.
  assert.doesNotMatch(src, /backdrop-blur-md[^]*copy\.transcriptTitle/);
});

test("route navigation auto-collapses the transcript while preserving memory", () => {
  const src = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  // The pathname teardown effect must collapse the transcript on every route change.
  const effectStart = src.indexOf("pathnameForTeardownRef.current = pathname;");
  assert.ok(effectStart >= 0, "pathname teardown effect must exist");
  const window = src.slice(effectStart, effectStart + 400);
  assert.match(
    window,
    /setTranscriptVisible\(false\)/,
    "the route-change effect must auto-collapse the transcript (spec 2C).",
  );
});

test("entity filters route category labels through the localized taxonomy", () => {
  const companyFilters = readSource("components/companies/CompanyFilters.tsx");
  assert.match(companyFilters, /localizeIndustryLabel\(item, language\)/);
  const domainFilter = readSource("components/research/ResearchDomainFilter.tsx");
  assert.match(domainFilter, /localizeResearchDomainLabel\(domain\.domainName, language\)/);
});

test("research catalog cards use curated locale helpers", () => {
  const card = readSource("components/research/ResearchTopicCard.tsx");
  assert.match(card, /localizeResearchTopic\(/);
  assert.match(card, /localizeResearchMethodLabel\(/);
  assert.match(card, /localizeResearchEvidenceTypeLabel\(/);
});

test("biodiversity mapping and field surveys localize under uz", async () => {
  const { localizeResearchTopic, localizeResearchMethodLabel, localizeResearchEvidenceTypeLabel } =
    await import("@/lib/i18n/research-catalog-locale");
  const { getResearchTopicById } = await import("@/lib/research/research-topics");
  const topic = getResearchTopicById("biodiversity-mapping");
  assert.ok(topic);
  const localized = localizeResearchTopic(topic!, "uz");
  assert.equal(localized.topicName, "Biodiversitet xaritalash");
  assert.match(localized.description, /Turlar tarqalishi/);
  assert.equal(localizeResearchMethodLabel("Field surveys", "uz"), "Dala so‘rovlari");
  assert.equal(localizeResearchEvidenceTypeLabel("Survey datasets", "uz"), "So‘rov ma’lumot to‘plamlari");
});

test("document data attribute drives dock layout reservation", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /dataset\.cbaiVoiceDock/);
  const css = readSource("app/globals.css");
  assert.match(css, /html\[data-cbai-voice-dock="open"\]/);
  assert.match(css, /--cbai-voice-dock-width/);
  // Overlay only — no phantom right column
  assert.doesNotMatch(css, /padding-right:\s*var\(--cbai-voice-dock-width/);
});

test("Voice dock markup exposes exactly one mic control and close action when open", () => {
  const src = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  const micActions = src.match(/data-voice-action="mic"/g) ?? [];
  const closeActions = src.match(/data-voice-action="close"/g) ?? [];
  assert.equal(micActions.length, 1);
  assert.equal(closeActions.length, 1);
  assert.match(src, /data-voice-entry="launcher"/);
  assert.match(src, /data-voice-dock="open"/);
});

test("canonical UZ voice identity does not volunteer founder on short intro", async () => {
  const { getShortOperatorIdentity, getOperatorIntroduction } = await import(
    "@/lib/brand/canonical-identity"
  );
  const short = getShortOperatorIdentity("uz");
  const intro = getOperatorIntroduction("uz");
  assert.match(short, /CBAI Ovoz Operatoriman/);
  assert.match(intro, /CBAI Ovoz Operatoriman/);
  assert.doesNotMatch(short, /Botir/);
  assert.doesNotMatch(intro, /Botir/);
});

test("ResearchCockpit localizes workflow reason at render time", () => {
  const src = readSource("components/research/topic/ResearchCockpit.tsx");
  assert.match(src, /localizeWorkflowReason/);
  assert.match(src, /workflowReasonBlocked/);
  assert.doesNotMatch(src, /\{workflow\.reason\}/);
});
