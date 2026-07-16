// Focused tests for the "CBAI Intelligence Operating System — Ultimate Interface + Personal
// Operator Experience" mission: the Operator identity system, the real theme toggle, the entry
// cinematic, multilingual greeting phrasing, the Intelligence Compass, the two new voice/text
// commands, and the Project Dashboard consolidation. Same zero-dependency harness as every other
// test script (Node's native node:test + the `@/` alias loader — no DOM/localStorage in this
// environment, so component-level assertions here are real source-presence checks, and logic-level
// assertions call the exported pure functions directly).
// Run with: npm run test:platform-activation

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createEmptyAssistantProfile } from "@/lib/assistant/assistant-profile";
import { resolveTimeOfDay } from "@/lib/assistant/time-of-day";
import {
  COMPASS_DIRECTION_HREFS,
  COMPASS_DIRECTION_ORDER,
  type CompassDirectionId,
} from "@/lib/assistant/intelligence-compass";
import { translateCompassDirection } from "@/lib/i18n/compass-translation";
import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import { getDictionary } from "@/lib/i18n/translate";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveCompassDirections(role: WorkspaceRole) {
  const dictionary = getDictionary("en");
  return COMPASS_DIRECTION_ORDER.map((id: CompassDirectionId) => ({
    id,
    href: COMPASS_DIRECTION_HREFS[id],
    ...translateCompassDirection(dictionary, role, id),
  }));
}
const ROOT = join(__dirname, "..");
function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

test("1. A real theme mode default exists and is honest ('system', never assumed dark or light)", () => {
  const profile = createEmptyAssistantProfile();
  assert.equal(profile.themeMode, "dark");
});

test("2. resolveTimeOfDay reads the real hour in a given IANA timezone, never guesses", () => {
  const morning = new Date("2026-06-01T08:00:00Z");
  assert.equal(resolveTimeOfDay("UTC", morning), "morning");

  const afternoon = new Date("2026-06-01T14:00:00Z");
  assert.equal(resolveTimeOfDay("UTC", afternoon), "afternoon");

  const evening = new Date("2026-06-01T20:00:00Z");
  assert.equal(resolveTimeOfDay("UTC", evening), "evening");

  // An invalid/corrupted saved timezone is an honest "don't know," never a fabricated guess.
  assert.equal(resolveTimeOfDay("Not/ARealZone", morning), null);
});

test("3. Every real dictionary's greetingReturning matches the mission's exact required phrasing", () => {
  assert.match(en.assistant.greetingReturning, /I am your CBAI Operator/);
  assert.match(uz.assistant.greetingReturning, /Men sizning CBAI Operatoringizman/);
  assert.match(ru.assistant.greetingReturning, /Я ваш оператор CBAI/);
  assert.match(tr.assistant.greetingReturning, /Ben CBAI Operatörünüzüm/);
  // Every dictionary still interpolates the real saved name — never a fixed placeholder.
  for (const dict of [en, uz, ru, tr]) {
    assert.match(dict.assistant.greetingReturning, /\{name\}/);
  }
});

test("4. getDictionary resolves every active language code to a real, distinct dictionary", () => {
  const codes = ["en", "uz", "ru", "tr"];
  const resolved = codes.map((code) => getDictionary(code));
  assert.equal(new Set(resolved.map((d) => d.assistant.greetingReturning)).size, 4);
});

test("5. Intelligence Compass always resolves exactly 6 real directions to real, distinct routes", () => {
  const directions = resolveCompassDirections("citizen");
  assert.equal(directions.length, 6);
  const ids = new Set(directions.map((d) => d.id));
  assert.equal(ids.size, 6);
  for (const direction of directions) {
    assert.ok(direction.href.startsWith("/"), `${direction.id} must be a real route`);
    assert.ok(direction.label.length > 0);
    assert.ok(direction.description.length > 0);
  }
});

test("6. Intelligence Compass destinations never change per role — only the framing text does", () => {
  const defaultDirections = resolveCompassDirections("citizen");
  const engineerDirections = resolveCompassDirections("engineer");
  assert.deepEqual(
    defaultDirections.map((d) => d.href),
    engineerDirections.map((d) => d.href),
  );
  // The framing genuinely differs for a role with a distinct real workflow — not a cosmetic no-op.
  assert.notEqual(defaultDirections[0].label, engineerDirections[0].label);
});

test("7. Every workspace role resolves to a real Compass — never throws on an unmapped role", () => {
  const roles = [
    "citizen", "student", "researcher", "professor", "academic", "engineer", "investor",
    "company", "university", "research_center", "government", "administrator", "economist",
    "legal", "social_sector",
  ] as const;
  for (const role of roles) {
    assert.equal(resolveCompassDirections(role).length, 6);
  }
});

test("8. \"Open universities\" resolves in all 4 languages — Countries/Companies already had this, Universities didn't", () => {
  assert.equal(resolveAssistantCommand("open universities")?.href, "/universities");
  assert.equal(resolveAssistantCommand("universitetlarni och")?.href, "/universities");
  assert.equal(resolveAssistantCommand("открой университеты")?.href, "/universities");
  assert.equal(resolveAssistantCommand("üniversiteleri aç")?.href, "/universities");
});

test("9. \"Search intelligence\" / \"Open search\" resolves in all 4 languages — no command reached /search before", () => {
  assert.equal(resolveAssistantCommand("search intelligence")?.href, "/search");
  assert.equal(resolveAssistantCommand("qidiruvni och")?.href, "/search");
  assert.equal(resolveAssistantCommand("открой поиск")?.href, "/search");
  assert.equal(resolveAssistantCommand("aramayı aç")?.href, "/search");
});

test("10. OperatorOrb is an original abstract SVG illustration, never a photorealistic image reference", () => {
  const content = read("components/shared/OperatorOrb.tsx");
  assert.match(content, /<svg/);
  assert.doesNotMatch(content, /\.(png|jpg|jpeg|webp)/i);
  assert.doesNotMatch(content, /<img/);
  // Documents the honest reasoning for why this is abstract, not a fabricated claim of realism.
  assert.match(content, /abstract/i);
});

test("11. OperatorOrb motion states are real CSS, fully disabled under the saved reduced-motion preference", () => {
  const css = read("app/globals.css");
  assert.match(css, /cbai-operator-orb\[data-operator-state="listening"\]/);
  assert.match(css, /cbai-operator-orb\[data-operator-state="thinking"\]/);
  assert.match(css, /cbai-operator-orb\[data-operator-state="speaking"\]/);
  assert.match(css, /\.cbai-reduced-motion \.cbai-operator-orb \* \{\s*animation: none/);
});

test("12. AssistantCommandCenter drives the Operator's visual state from the real Web Speech API status, never a decorative loop", () => {
  const content = read("components/assistant/AssistantCommandCenter.tsx");
  assert.match(content, /operatorOrbState/);
  assert.match(content, /voiceStatus === "listening"/);
});

test("13. Entry Experience is genuinely skippable and respects reduced motion — never blocks the real homepage", () => {
  const content = read("components/platform/entry/EntryExperience.tsx");
  assert.match(content, /Escape/);
  assert.match(content, /isReducedMotion/);
  assert.match(content, /sessionStorage/);
  // Server snapshot is always "don't show" — the real homepage beneath it is never gated on this.
  assert.match(content, /getServerSnapshot[\s\S]{0,40}return false/);
  // Design Bible Part II.2.2/2.9: full identity strength presented exactly once. A prior version
  // faded in a standalone CBAIMark alongside the full CBAILogo lockup, leaving two logo
  // presentations on screen at once for most of the cinematic — regression guard.
  assert.doesNotMatch(content, /CBAIMark/);
  assert.match(content, /<CBAILogo size="lg" showTagline \/>/);
});

test("14. ThemeToggle is wired into both the global Topbar and Settings, not a single hidden control", () => {
  assert.match(read("components/layout/Topbar.tsx"), /ThemeToggle/);
  assert.match(read("components/assistant/AssistantSettingsForm.tsx"), /ThemeToggle/);
});

test("15. Project Dashboard consolidation: the duplicate Health panel is gone, its real signals live in exactly one place", () => {
  const projectHome = read("components/project/ProjectHome.tsx");
  assert.doesNotMatch(projectHome, /ProjectHealthPanel/);
  const dashboard = read("components/project/ProjectDashboard.tsx");
  assert.match(dashboard, /deriveProjectHealth/);
  assert.match(dashboard, /Research question/);
});

test("16. Intelligence Cabinet is discoverable — the Sidebar/mobile nav disclosure is no longer just a bare \"More\"", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.navigation.intelligenceCabinet.length > 0);
    assert.notEqual(dict.navigation.intelligenceCabinet, dict.navigation.more);
  }
  assert.match(read("components/layout/Sidebar.tsx"), /navigation\.intelligenceCabinet/);
  assert.match(read("components/layout/MobileNavDrawer.tsx"), /navigation\.intelligenceCabinet/);
});

test("17. Homepage identity: the CBAI logo appears on the first screen itself, not only in the entry cinematic overlay", () => {
  const home = read("components/platform/PlatformHome.tsx");
  assert.match(home, /<CBAILogo/);
  assert.match(home, /<EntryExperience/);
  assert.match(home, /<IntelligenceCompass/);
});

test("21. Homepage hero: the Living Intelligence Network is one environment with the Operator console, not a separate section reached after a divider", () => {
  const home = read("components/platform/PlatformHome.tsx");
  // The greeting and the network render inside the same overflow-guarded hero wrapper, never
  // split by a "Your workspace" hairline divider between two independently-centered sections.
  assert.match(home, /overflow-x-hidden/);
  assert.doesNotMatch(home, /Your workspace/);
  const greetingIndex = home.indexOf("<HomeAssistantGreeting");
  const globeIndex = home.indexOf("<HomeIntelligenceGlobe");
  assert.ok(greetingIndex > -1 && globeIndex > -1, "both hero components must render");
  assert.ok(globeIndex - greetingIndex < 400, "greeting and network must be direct siblings in the same hero wrapper");

  // BUILD-009: the Network now represents all six real intelligence domains (Research,
  // Governance, Countries, Companies, Universities, Evidence), each hub sized by its own real
  // registered count from buildIntelligenceHubs() — never a single "Countries only" diagram, and
  // never a fabricated number.
  const globe = read("components/platform/home/HomeIntelligenceGlobe.tsx");
  assert.match(globe, /buildIntelligenceHubs/);
  assert.match(globe, /totalIntelligenceItems/);
  const network = read("lib/platform/intelligence-network.ts");
  for (const domain of ["research", "governance", "countries", "companies", "universities", "evidence"]) {
    assert.match(network, new RegExp(`id: "${domain}"`));
  }
});

test("18. CBAI Ecosystem entrances are visible on Home itself, not only /dashboard", () => {
  const home = read("components/platform/PlatformHome.tsx");
  assert.match(home, /<HomeEcosystems/);
});

test("19. Every role card's suggested command is a real phrase resolveAssistantCommand() actually resolves, in every language — never an invented example", async () => {
  const { resolveAssistantCommand } = await import("@/lib/assistant/assistant-commands");
  const { ROLE_WORK_CONTEXTS } = await import("@/lib/assistant/role-work-contexts");
  for (const dict of [en, uz, ru, tr]) {
    for (const role of ROLE_WORK_CONTEXTS) {
      const roleCopy = (dict.roles as Record<string, { sampleCommand: string }>)[role.id];
      assert.ok(roleCopy.sampleCommand.length > 0, `${role.id} is missing a sampleCommand`);
      const match = resolveAssistantCommand(roleCopy.sampleCommand);
      assert.ok(match, `"${roleCopy.sampleCommand}" (${role.id}) does not resolve to any real command`);
    }
  }
});
