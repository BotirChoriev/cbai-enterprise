/**
 * Final product completion — semantic tokens, shell, voice, localization guards.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

const FORBIDDEN_UZ_UI_STRINGS = [
  "Shows essential mission and object context only.",
  "Search by country, university name, institution type",
  "Complete the mission problem statement.",
  "REGISTRY AVAILABLE",
  "World Intelligence Map",
  "Which countries have profiles?",
  "Search countries",
  "Graph edges",
  "Selected topic",
  "Shared methods",
];

test("semantic design tokens defined for dark and light themes", () => {
  const css = readSource("app/globals.css");
  for (const token of [
    "--cbai-canvas",
    "--cbai-text-primary",
    "--cbai-accent-primary",
    "--cbai-nav-text-active",
    "--cbai-topbar-bg",
    "--cbai-surface-glass",
    "--cbai-border-subtle",
    "--cbai-shell-gutter",
    "--cbai-section-gap",
    "--cbai-depth-glass",
  ]) {
    assert.match(css, new RegExp(token));
  }
  assert.match(css, /html\.theme-light[\s\S]*--cbai-nav-text-active/);
  assert.match(css, /\.cbai-nav-row-active/);
  assert.match(css, /\.cbai-linked-work-menu/);
});

test("light theme remaps slate navigation text for readability", () => {
  const css = readSource("app/globals.css");
  assert.match(css, /html\.theme-light \[class~="text-slate-300"\]/);
  assert.match(css, /html\.theme-light \[class\*="bg-\[#07101f\]"\]/);
});

test("sidebar and topbar consume shared platform chrome tokens", () => {
  const sidebar = readSource("components/layout/Sidebar.tsx");
  const topbar = readSource("components/layout/Topbar.tsx");
  assert.match(sidebar, /cbai-platform-sidebar/);
  assert.match(topbar, /cbai-platform-topbar/);
  assert.doesNotMatch(topbar, /bg-\[#07101f\]/);
  assert.match(sidebar, /variant="auto"/);
});

test("operating navigator uses spatial styling only on home", () => {
  const nav = readSource("components/operating/OperatingNavigator.tsx");
  assert.match(nav, /spatial=\{isHome\}/);
  assert.match(nav, /cbaiNavRow/);
});

test("voice dock hides duplicate closed CTA on home and disables mic when local voice unavailable", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  assert.match(dock, /if \(isHome\)/);
  assert.match(dock, /micDisabled/);
  assert.match(dock, /localCapabilityUserNotice/);
  assert.match(dock, /VoiceOperatorDeveloperDiagnostics/);
  assert.doesNotMatch(dock, /title=\{copy\.localVoiceSetupHint/);
  assert.doesNotMatch(dock, /dark:/);
});

test("indicator explorer panels use localized dictionary keys", () => {
  const coverage = readSource("components/indicator-explorer/IndicatorCoverage.tsx");
  const sources = readSource("components/indicator-explorer/IndicatorSources.tsx");
  assert.match(coverage, /indicatorExplorer\.coverageHeading/);
  assert.match(sources, /connectionKey/);
  assert.match(sources, /indicatorExplorer\.\$\{labelKey\}/);
  assert.doesNotMatch(coverage, />Coverage Status</);
});

test("dev:voice orchestrates next dev and local broker without exposing API key", () => {
  const pkg = readSource("package.json");
  assert.match(pkg, /"dev:voice": "node scripts\/dev-voice.mjs"/);
  const script = readSource("scripts/dev-voice.mjs");
  assert.match(script, /NEXT_PUBLIC_VOICE_BROKER_URL/);
  assert.match(script, /local-voice-broker/);
  const broker = readSource("scripts/local-voice-broker.mjs");
  assert.doesNotMatch(broker, /sk-[A-Za-z0-9]/);
  assert.match(broker, /handleVoiceSessionBrokerRequest/);
  assert.match(broker, /\.dev\.vars/);
});

test("voice preflight utility exists with secret guards", () => {
  const preflight = readSource("lib/voice-operator/preflight.ts");
  assert.match(preflight, /runVoicePreflight/);
  assert.match(preflight, /assertNoVoiceSecretLeak/);
  assert.match(preflight, /isWebRtcSupported/);
});

test("reports route avoids duplicate mission context bar", () => {
  const reports = readSource("components/reports/ReportsCenter.tsx");
  assert.match(reports, /showMissionContext=\{false\}/);
});

test("universities filters are fully localized", () => {
  const filters = readSource("components/universities/UniversityFilters.tsx");
  const uzDict = readSource("lib/i18n/dictionaries/uz.ts");
  assert.match(filters, /useTranslation/);
  assert.match(filters, /universities\.searchPlaceholder/);
  assert.doesNotMatch(filters, /Search by country/);
  assert.match(uzDict, /filterAll: "Hammasi"/);
});

test("known English UI leakage absent from Uzbek dictionary paths", () => {
  const uzJson = readSource("lib/i18n/dictionaries/uz.ts");
  for (const forbidden of FORBIDDEN_UZ_UI_STRINGS) {
    assert.doesNotMatch(uzJson, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  const adaptive = readSource("components/operating/AdaptiveDensityControl.tsx");
  assert.doesNotMatch(adaptive, /densityModeExplanation/);
});

test("governance pillars chart documents registry rule counts", () => {
  const pillars = readSource("components/governance-control/GovernancePillars.tsx");
  const enGov = readSource("lib/i18n/platform-copy-build008-en.ts");
  assert.match(pillars, /pillarsCaption/);
  assert.match(enGov, /pillarsCaption:/);
});

test("realtime broker failures do not silently fall back when backend is required", () => {
  const provider = readSource("components/voice-operator/VoiceOperatorProvider.tsx");
  assert.match(provider, /backend_required/);
  assert.match(provider, /brokerRes.code === "BACKEND_REQUIRED"/);
});

test("operating page shell uses shared max-width workspace", () => {
  const shell = readSource("components/shared/OperatingPageShell.tsx");
  assert.match(shell, /cbaiPageWorkspace/);
  const header = readSource("components/shared/EntityPageHeader.tsx");
  assert.match(header, /cbaiPageHeader/);
  assert.doesNotMatch(header, /cbai-display/);
});

test("living context ribbon replaces duplicate global mission bar", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  const ribbon = readSource("components/operating/LivingContextRibbon.tsx");
  assert.match(layout, /LivingContextRibbon/);
  assert.doesNotMatch(layout, /GlobalMissionContextBar/);
  assert.match(ribbon, /shouldShowLivingContextRibbon/);
  assert.match(ribbon, /translateFirstMinuteAction/);
});

test("world intelligence map and share controls are localized", () => {
  const map = readSource("components/countries/WorldIntelligenceMap.tsx");
  const share = readSource("components/shared/ShareButton.tsx");
  const notice = readSource("components/system/EntityNotFoundNotice.tsx");
  assert.match(map, /entities\.worldMapTitle/);
  assert.doesNotMatch(map, /World Intelligence Map/);
  assert.match(share, /entities\.share/);
  assert.match(notice, /entities\.entityNotFound/);
});

test("voice diagnostics panel in settings uses preflight without secrets", () => {
  const settings = readSource("components/settings/SettingsPageClient.tsx");
  const panel = readSource("components/settings/VoiceDiagnosticsPanel.tsx");
  assert.match(settings, /VoiceDiagnosticsPanel/);
  assert.match(panel, /runVoicePreflight/);
  assert.doesNotMatch(panel, /OPENAI_API_KEY/);
  assert.doesNotMatch(panel, /sk-/);
});

test("navigation IA uses intelligence operations oversight advanced system groups", () => {
  const nav = readSource("lib/navigation.ts");
  assert.match(nav, /title: "Intelligence"/);
  assert.match(nav, /title: "Operations"/);
  assert.match(nav, /title: "Oversight"/);
  assert.match(nav, /title: "Advanced"/);
  assert.match(nav, /title: "System"/);
  assert.match(nav, /href: "\/graph"/);
  assert.match(nav, /href: "\/government"/);
});

test("operating page shell does not duplicate mission chrome", () => {
  const shell = readSource("components/shared/OperatingPageShell.tsx");
  assert.doesNotMatch(shell, /MissionOperatingContextBar/);
  assert.match(readSource("app/(dashboard)/layout.tsx"), /LivingContextRibbon/);
});

test("evidence coverage panels use localized explorer copy", () => {
  const entity = readSource("components/evidence/EntityEvidenceCoverage.tsx");
  const source = readSource("components/evidence/EvidenceSourceCoverage.tsx");
  assert.match(entity, /evidenceExplorer\.entityCoverageTitle/);
  assert.match(source, /evidenceExplorer\.sourceCoverageTitle/);
  assert.doesNotMatch(entity, /Available evidence by profile/);
  assert.doesNotMatch(source, /Official website/);
});

test("account menu sign-in label is localized", () => {
  const menu = readSource("components/assistant/AccountMenu.tsx");
  assert.match(menu, /accountPage\.signIn/);
  assert.doesNotMatch(menu, />Sign In</);
});

test("voice dock anchors bottom-right and main reserves scroll space", () => {
  const dock = readSource("components/voice-operator/VoiceOperatorDock.tsx");
  const layout = readSource("app/(dashboard)/layout.tsx");
  const css = readSource("app/globals.css");
  assert.match(dock, /justify-end/);
  assert.match(layout, /cbai-voice-reserved-main/);
  assert.match(css, /cbai-voice-reserved-main/);
});

test("spatial home keeps dark sidebar in light theme", () => {
  const layout = readSource("app/(dashboard)/layout.tsx");
  const css = readSource("app/globals.css");
  assert.match(layout, /cbai-spatial-home-chrome/);
  assert.match(css, /cbai-spatial-home-chrome/);
});
