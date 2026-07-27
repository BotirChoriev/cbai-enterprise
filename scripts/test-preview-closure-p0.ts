/**
 * Preview Closure P0 — regression coverage for voice broker resolution,
 * command destinations, search confidence, and knowledge→evidence alias.
 */
import assert from "node:assert/strict";
import { closestRegistryMatches, searchEntities } from "@/lib/global-search";
import {
  resolveVoiceBrokerUrl,
  setVoiceBrokerEnvUrlForTests,
  evaluateVoiceBrokerStatus,
} from "@/lib/voice-operator/session-broker/client";
import { matchDestinationsFromCommand } from "@/lib/navigation/canonical-destinations";
import { resolvePlatformIntent } from "@/lib/platform-actions/intent-matcher";
import { primaryNavSections, secondaryNavSections } from "@/lib/navigation";
import { executeGatewaySearch } from "@/lib/search-gateway";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function section(title: string) {
  console.log(`\n== ${title} ==`);
}

section("V-01 same-origin broker resolution");
setVoiceBrokerEnvUrlForTests(null);
const preview = "https://preview-spatial-world-intell.cbai-enterprise.pages.dev";
assert.equal(
  resolveVoiceBrokerUrl(null, preview),
  `${preview}/api/voice`,
  "deployed HTTPS must default to same-origin /api/voice",
);
assert.equal(resolveVoiceBrokerUrl(null, "http://localhost:3000"), null, "localhost requires explicit config");
assert.equal(
  resolveVoiceBrokerUrl("https://example.com/api/voice", preview),
  `${preview}/api/voice`,
  "Pages host must prefer colocated same-origin broker",
);
assert.equal(evaluateVoiceBrokerStatus(preview).kind, "available");
setVoiceBrokerEnvUrlForTests(undefined);

section("C-01 command destinations EN/UZ");
const commands: Array<{ cmd: string; lang: string; action: string }> = [
  { cmd: "Dalillarni och", lang: "uz", action: "navigate.evidence" },
  { cmd: "Mening ishlarimni och", lang: "uz", action: "navigate.my_work" },
  { cmd: "Yig'ilish zalini och", lang: "uz", action: "navigate.rooms" },
  { cmd: "Open evidence", lang: "en", action: "navigate.evidence" },
  { cmd: "Show my active work", lang: "en", action: "navigate.my_work" },
  { cmd: "Tadqiqot sahifasiga o't", lang: "uz", action: "navigate.research" },
];
for (const row of commands) {
  const intent = resolvePlatformIntent(row.cmd, row.lang);
  assert.ok(intent, `intent for ${row.cmd}`);
  assert.equal(intent!.actionId, row.action, row.cmd);
}
assert.deepEqual(
  matchDestinationsFromCommand("Bilim grafiga o't").map((d) => d.id),
  ["graph"],
);

section("S-01 search typo honesty");
const typo = "toshkent davlat agrar unversetiti";
const hits = searchEntities(typo);
// Real registry entity TSAU may resolve via alias/fuzzy typo tolerance — never invent ids.
assert.ok(hits.length >= 1, "TSAU alias typo should resolve to registry entity");
assert.ok(hits.every((h) => h.entity.id === "tsau"), "must only return real TSAU registry id");
assert.ok(hits.every((h) => h.confidence !== "weak"), "TSAU typo match must not be weak-only promotion");
const closest = closestRegistryMatches(typo, undefined, 3);
assert.ok(closest.length >= 0);
const gateway = executeGatewaySearch(typo);
assert.equal(gateway.hasResults, true);
assert.ok(Array.isArray(gateway.closestMatches));

const uzbekistan = searchEntities("Uzbekistan");
assert.ok(uzbekistan.length >= 1);
assert.ok(uzbekistan.every((r) => r.confidence !== "weak"));

section("E-02 knowledge alias");
const knowledgePage = readFileSync(resolve("app/(dashboard)/knowledge/page.tsx"), "utf8");
assert.match(knowledgePage, /redirect\("\/evidence"\)/);

section("IA canonical CORE Intelligence Operations Oversight System");
const primaryCount = primaryNavSections.flatMap((s) => s.items).length;
assert.ok(primaryCount >= 15, `expected full primary IA set, got ${primaryCount}`);
const hrefs = primaryNavSections.flatMap((s) => s.items.map((i) => i.href));
assert.ok(hrefs.includes("/rooms"), "Live Rooms must be in Operations");
assert.ok(hrefs.includes("/reports"), "Reports must be in Operations");
assert.ok(hrefs.includes("/governance"), "Governance must be in Oversight");
assert.ok(!hrefs.includes("/discover"), "Global Activity stays in Advanced");
assert.ok(primaryNavSections.some((s) => s.title === "Intelligence"));
assert.ok(primaryNavSections.some((s) => s.title === "Operations"));
assert.ok(secondaryNavSections.some((s) => s.title === "Advanced"));
assert.ok(secondaryNavSections.flatMap((s) => s.items.map((i) => i.href)).includes("/discover"));

console.log("\npreview-closure-p0: PASS");
