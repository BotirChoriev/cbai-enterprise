/**
 * Global Research Intelligence regression suite.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import {
  GRI_SCHEMA_VERSION,
  RESEARCH_LIFECYCLE_STATES,
  assertIdempotentGriMigration,
  buildControlCabinetDraft,
  buildGriGraphProjection,
  buildResearchIntelligenceProfileFromTopic,
  buildResearchMeetingDraft,
  isOpportunityActive,
  listLibraryBridge,
  listResearchOpportunityRadar,
  migrateResearchIntelligenceProfile,
  requiresStoppedReason,
  resolveGlobalResearchIntelligenceVoiceCommand,
  runResearchMatch,
} from "@/lib/global-research-intelligence";
import { GRI_COPY_LOCALES, getGriCopy } from "@/lib/i18n/platform-copy-global-research-intelligence";

const ROOT = process.cwd();
function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

test("GRI-1: schema, lifecycle vocabulary, profile honesty", () => {
  assert.equal(GRI_SCHEMA_VERSION, 1);
  assert.ok(RESEARCH_LIFECYCLE_STATES.includes("stopped"));
  assert.ok(requiresStoppedReason("stopped"));
  assert.equal(requiresStoppedReason("active"), false);
  const p = buildResearchIntelligenceProfileFromTopic(RESEARCH_TOPICS[0]!);
  assert.equal(p.mainResults, null);
  assert.equal(p.authorsAndInstitutions.length, 0);
  assert.ok(p.missingInformation.length > 0);
  assert.equal(p.lifecycleState, "idea");
});

test("GRI-2: idempotent migration preserves unknown fields", () => {
  const topic = { ...RESEARCH_TOPICS[0]!, legacyExtra: "keep" } as typeof RESEARCH_TOPICS[0] & {
    legacyExtra: string;
  };
  assert.ok(assertIdempotentGriMigration(topic));
  const migrated = migrateResearchIntelligenceProfile(topic);
  assert.equal((migrated.catalog as Record<string, unknown>).legacyExtra, "keep");
});

test("GRI-3: match deterministic 3–5, no best ranking", () => {
  const input = { topicHint: "water", geographyCountryIds: ["uzbekistan"] as const };
  const a = runResearchMatch(input);
  const b = runResearchMatch(input);
  assert.equal(a.inputFingerprint, b.inputFingerprint);
  assert.deepEqual(
    a.options.map((o) => o.topicId),
    b.options.map((o) => o.topicId),
  );
  assert.ok(a.options.length >= 3 && a.options.length <= 5);
  assert.ok(a.rankingForbiddenNotice.toLowerCase().includes("best") || a.rankingForbiddenNotice.includes("good/bad"));
  assert.ok(a.options.every((o) => o.humanVerificationRequired));
});

test("GRI-4: opportunity expiry honesty", () => {
  assert.equal(isOpportunityActive({ status: "expired", deadline: null }), false);
  assert.equal(
    isOpportunityActive({ status: "active", deadline: "2000-01-01" }, new Date("2026-01-01")),
    false,
  );
  const radar = listResearchOpportunityRadar();
  assert.equal(radar.items.length, 0);
  assert.equal(radar.status, "not_connected");
});

test("GRI-5: library bridge adapters without fabricated records", () => {
  const lib = listLibraryBridge("x");
  assert.equal(lib.records.length, 0);
  assert.ok(lib.adapters.some((a) => a.status === "connected"));
  assert.ok(lib.adapters.some((a) => a.status === "available_not_connected"));
});

test("GRI-6: control cabinet draft requires confirmation; unknowns explicit", () => {
  const draft = buildControlCabinetDraft({
    projectTitle: "Test",
    contentLocale: "uz",
  });
  assert.equal(draft.status, "draft");
  assert.equal(draft.requiresHumanConfirmation, true);
  assert.ok(draft.missingInformation.includes("methodology"));
  assert.equal(draft.userEnteredPreserved, true);
});

test("GRI-7: meeting draft does not claim live interpretation", () => {
  const m = buildResearchMeetingDraft();
  assert.equal(m.multilingualInterpretationAvailable, false);
  assert.ok(m.honestyNotice.toLowerCase().includes("not claimed") || m.honestyNotice.includes("not claimed"));
});

test("GRI-8: graph projection uses only registry/catalog", () => {
  const g = buildGriGraphProjection(5);
  assert.ok(g.nodes.every((n) => n.kind === "country" || n.kind === "university" || n.kind === "topic" || n.kind === "method"));
  assert.ok(g.honestyNotice.includes("No fabricated"));
  assert.ok(g.listFallback.length > 0);
});

test("GRI-9: EN/UZ/RU/TR copy parity", () => {
  const keys = Object.keys(getGriCopy("en")).sort();
  for (const locale of GRI_COPY_LOCALES) {
    const copy = getGriCopy(locale);
    assert.deepEqual(Object.keys(copy).sort(), keys);
    for (const [k, v] of Object.entries(copy)) {
      assert.ok(typeof v === "string" && v.length > 0);
      assert.notEqual(v, k);
    }
  }
  assert.ok(!/^Global Research Intelligence$/.test(getGriCopy("uz").title));
});

test("GRI-10: voice navigate vs draft; idempotent", () => {
  const opp = resolveGlobalResearchIntelligenceVoiceCommand("Find a research opportunity");
  assert.ok(opp && opp.type === "navigate");
  const cab = resolveGlobalResearchIntelligenceVoiceCommand("Create scientific work in the control cabinet");
  assert.ok(cab && cab.type === "suggest_draft");
  if (cab?.type === "suggest_draft") assert.equal(cab.requiresHumanConfirmation, true);
  const a = resolveGlobalResearchIntelligenceVoiceCommand("Open research match");
  const b = resolveGlobalResearchIntelligenceVoiceCommand("Open research match");
  assert.ok(a && b && a.idempotencyKey === b.idempotencyKey);
});

test("GRI-11: UI surfaces and docs exist", () => {
  const home = readSource("components/research/ResearchIntelligenceNetworkHome.tsx");
  assert.ok(home.includes("data-cbai-gri-network"));
  assert.ok(home.includes("data-cbai-primary-action"));
  assert.ok(home.includes("data-cbai-official-source"));
  assert.ok(home.includes("data-cbai-opportunity-radar"));
  assert.ok(home.includes("data-cbai-control-cabinet"));
  assert.ok(existsSync(join(ROOT, "docs/verification/global-research-intelligence/design-decisions.md")));
});
