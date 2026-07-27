import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  assertIdempotentWimNodeMigration,
  buildWorldAndMeProjection,
  consumeWimDraftIdempotency,
  emptyMyWorldConsent,
  everyRelationshipHasType,
  explainRelationship,
  filterMyWorldNodes,
  forbidUnexplainedAbbreviation,
  listWorldChangeRadar,
  migrateWimRelationship,
  previewMapToActionDraft,
  relationshipLabelEn,
  resetWimDraftIdempotencyForTests,
  resolveWorldAndMeVoiceCommand,
  WIM_ENTITY_KINDS,
  WIM_RELATIONSHIP_TYPES,
} from "@/lib/world-and-me-intelligence";
import { getWimCopy, WIM_COPY_LOCALES } from "@/lib/i18n/platform-copy-world-and-me";

const root = process.cwd();

test("WIM-1: canonical entity and relationship vocabularies", () => {
  assert.ok(WIM_ENTITY_KINDS.includes("country"));
  assert.ok(WIM_ENTITY_KINDS.includes("scientific_debate"));
  assert.ok(WIM_RELATIONSHIP_TYPES.includes("supports_claim"));
  assert.ok(WIM_RELATIONSHIP_TYPES.includes("requires_human_approval"));
  assert.ok(relationshipLabelEn("located_in").length > 3);
});

test("WIM-2: projection relationships all typed; abbreviations explained", () => {
  const p = buildWorldAndMeProjection({ maxNodes: 40 });
  assert.ok(everyRelationshipHasType(p.relationships));
  for (const n of p.nodes) {
    assert.equal(forbidUnexplainedAbbreviation(n), true);
    if (n.shortCode) assert.ok(n.fullLabel.includes(n.officialName) || n.fullLabel.length > 0);
  }
  assert.equal(p.liveRecords.length, 0);
  assert.equal(p.liveSourceStatus, "no_verified_live_source");
});

test("WIM-3: migration idempotent; unknown fields preserved", () => {
  assertIdempotentWimNodeMigration({
    id: "x",
    kind: "country",
    officialName: "Uzbekistan",
    futureExtra: 1,
  });
  const rel = migrateWimRelationship({
    id: "e1",
    type: "partners_with",
    source: "a",
    target: "b",
    legacyMeta: "keep",
  });
  assert.equal(rel.unknownFields?.legacyMeta, "keep");
});

test("WIM-4: World Change Radar honesty — no fabricated live", () => {
  const radar = listWorldChangeRadar();
  assert.equal(radar.records.length, 0);
  assert.equal(radar.freshness, "no_verified_live_source");
  assert.match(radar.emptyState, /No verified live source/i);
});

test("WIM-5: Relationship Explainer success and no-evidence paths", () => {
  const p = buildWorldAndMeProjection({ maxNodes: 60 });
  const none = explainRelationship(p.nodes, p.relationships, "missing-a", "missing-b");
  assert.equal(none.found, false);
  assert.equal(none.manufacturedConnection, false);

  const withEdge = p.relationships[0];
  if (withEdge) {
    const found = explainRelationship(p.nodes, p.relationships, withEdge.sourceNodeId, withEdge.targetNodeId);
    if (found.found) {
      assert.ok(found.path.length >= 1);
      assert.equal(found.requiresHumanApproval, true);
    }
  }
});

test("WIM-6: Map → Draft Work Card confirmation + exactly-once", () => {
  resetWimDraftIdempotencyForTests();
  const p = buildWorldAndMeProjection({ maxNodes: 20 });
  const preview = previewMapToActionDraft({
    kind: "evidence_request",
    locale: "uz",
    selected: p.nodes[0] ?? null,
    relationships: p.relationships.slice(0, 3),
  });
  assert.equal(preview.confirmationRequired, true);
  assert.equal(preview.draft.humanApprovalRequired, true);
  assert.ok(preview.paths.length >= 3 && preview.paths.length <= 5);
  assert.equal(consumeWimDraftIdempotency(preview.idempotencyKey, false), false);
  assert.equal(consumeWimDraftIdempotency(preview.idempotencyKey, true), true);
  assert.equal(consumeWimDraftIdempotency(preview.idempotencyKey, true), false);
});

test("WIM-7: My World consent gate", () => {
  const p = buildWorldAndMeProjection({ maxNodes: 20 });
  const denied = emptyMyWorldConsent("en");
  assert.equal(filterMyWorldNodes(p.nodes, denied).every((n) => n.kind === "user"), true);
  const allowed = { ...denied, consentGiven: true as const, watchedEntityIds: [] as const };
  assert.ok(filterMyWorldNodes(p.nodes, allowed).length >= 1);
});

test("WIM-8: EN/UZ/RU/TR copy parity; UZ question not English", () => {
  const keys = Object.keys(getWimCopy("en")).sort();
  for (const locale of WIM_COPY_LOCALES) {
    assert.deepEqual(Object.keys(getWimCopy(locale)).sort(), keys);
  }
  assert.ok(!/^What changed in the world/.test(getWimCopy("uz").primaryQuestion));
  assert.ok(!/^World and Me — Live Intelligence Map$/.test(getWimCopy("uz").title));
});

test("WIM-9: voice navigate vs confirmation drafts; no auto send", () => {
  const deny = resolveWorldAndMeVoiceCommand("Auto create and email them the best answer");
  assert.ok(deny && deny.kind === "draft_suggestion" && deny.confirmationRequired);
  const draft = resolveWorldAndMeVoiceCommand("Link to My Work from World and Me map");
  assert.ok(draft && draft.kind === "draft_suggestion" && draft.confirmationRequired);
  const nav = resolveWorldAndMeVoiceCommand("Open World and Me intelligence map");
  assert.ok(nav && (nav.kind === "navigate" || nav.kind === "draft_suggestion"));
});

test("WIM-10: UI surfaces and docs exist", () => {
  const files = [
    "components/graph/WorldAndMeIntelligenceHome.tsx",
    "lib/world-and-me-intelligence/index.ts",
    "docs/verification/world-and-me-intelligence-map/baseline-audit.md",
    "docs/verification/world-and-me-intelligence-map/design-decisions.md",
  ];
  for (const f of files) assert.ok(existsSync(join(root, f)), f);
  const client = readFileSync(join(root, "components/graph/GraphPageClient.tsx"), "utf8");
  assert.ok(client.includes("WorldAndMeIntelligenceHome"));
  assert.ok(client.includes("data-cbai-voice-dock-clearance") || client.includes("getWimCopy"));
});
