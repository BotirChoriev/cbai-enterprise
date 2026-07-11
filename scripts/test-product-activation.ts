// Focused tests for CBAI Product Activation, Release 3 — empty-state honesty, Global Search,
// Command Center routing, entity data status, and Assistant/My Work integration. Same
// zero-dependency harness as scripts/test-research-slice.ts (Node's native `node:test` +
// the `@/` alias loader). Run with: npm run test:product-activation

import { test } from "node:test";
import assert from "node:assert/strict";
import { executeGatewaySearch } from "@/lib/search-gateway";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import {
  createEmptyAssistantProfile,
  isAssistantProfileActive,
} from "@/lib/assistant/assistant-profile";
import { loadAssistantProfile } from "@/lib/assistant/assistant-storage";
import { resolveEntityDataStatus } from "@/components/shared/entity-profile-copy";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_EXPLANATIONS,
  PRODUCT_STATUS_LABELS,
} from "@/lib/product-status";

const UNKNOWN_QUERY = "zzz-not-a-real-entity-or-topic-9182";

test("1. Global Search returns grouped real results for a real research topic", () => {
  const response = executeGatewaySearch("microbiology");
  assert.ok(response.hasResults, "microbiology should match the real research catalog");
  const group = response.groups.find((g) => g.id === "research_topics");
  assert.ok(group, "a research_topics group should be present");
  assert.ok(group!.researchTopics.length > 0, "microbiology should match at least one real topic");
  assert.equal(group!.researchTopics[0].topicId, "microbiology");
});

test("2. Global Search groups real entity results by type", () => {
  const response = executeGatewaySearch("Japan");
  assert.ok(response.hasResults);
  const countries = response.groups.find((g) => g.id === "countries");
  assert.ok(countries, "Japan should produce a countries group");
  assert.ok(countries!.entities.length > 0);
  assert.equal(countries!.entities[0].entity.name, "Japan");
});

test("3. Unknown search terms fail safely (no fabricated results)", () => {
  const response = executeGatewaySearch(UNKNOWN_QUERY);
  assert.equal(response.hasResults, false);
  assert.deepEqual(response.groups, []);
});

test("4. Empty search query returns an empty, non-crashing response", () => {
  const response = executeGatewaySearch("");
  assert.equal(response.hasResults, false);
  assert.equal(response.query, "");
});

test("5. Command Center resolves fixed commands to real routes", () => {
  const match = resolveAssistantCommand("Open my work");
  assert.ok(match);
  assert.equal(match!.kind, "fixed");
  assert.equal(match!.href, "/my-work");
});

test("6. Command Center resolves parameterized commands using real catalog data", () => {
  const match = resolveAssistantCommand("find country Japan");
  assert.ok(match);
  assert.equal(match!.kind, "parameterized");
  assert.match(match!.href, /^\/countries\?country=/);
});

test("7. Command Center resolves a real research topic by parameterized command", () => {
  const match = resolveAssistantCommand("show research topic microbiology");
  assert.ok(match);
  assert.equal(match!.href, "/research/microbiology");
});

test("8. Unknown Command Center input returns null (no fake AI response)", () => {
  const match = resolveAssistantCommand("please forecast the stock market for me");
  assert.equal(match, null, "unrecognized input must resolve to null, never a guessed route");
});

test("9. Empty Command Center input returns null", () => {
  assert.equal(resolveAssistantCommand(""), null);
  assert.equal(resolveAssistantCommand("   "), null);
});

test("10. Entity data status is derived honestly from real connected-source counts", () => {
  assert.equal(resolveEntityDataStatus(0, 5), "waiting_for_verified_data");
  assert.equal(resolveEntityDataStatus(3, 5), "partial");
  assert.equal(resolveEntityDataStatus(5, 5), "live");
});

test("11. Every product status has a visible label and a full-sentence explanation", () => {
  for (const status of PRODUCT_STATUSES) {
    assert.ok(PRODUCT_STATUS_LABELS[status].length > 0, `${status} must have a visible label`);
    assert.ok(
      PRODUCT_STATUS_EXPLANATIONS[status].length > 10,
      `${status} must have a real explanation, not a bare word`,
    );
  }
});

test("12. Assistant profile is honestly inactive until a real name is set (no fabricated identity)", () => {
  const empty = createEmptyAssistantProfile();
  assert.equal(isAssistantProfileActive(empty), false);
  assert.equal(isAssistantProfileActive({ ...empty, name: "Ava" }), true);
});

test("13. Loading the Assistant profile outside a browser is SSR-safe and never throws", () => {
  assert.doesNotThrow(() => {
    const profile = loadAssistantProfile();
    assert.equal(isAssistantProfileActive(profile), false);
  });
});
