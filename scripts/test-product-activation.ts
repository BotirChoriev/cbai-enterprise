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
import { resolveAssistantContext } from "@/lib/assistant/assistant-context";
import { resolveEntityDataStatus } from "@/components/shared/entity-profile-copy";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_EXPLANATIONS,
  PRODUCT_STATUS_LABELS,
} from "@/lib/product-status";
import { resolveNextStep } from "@/lib/assistant/assistant-next-step";
import {
  ASSISTANT_AVATARS,
  DEFAULT_OPERATOR_NAME,
  ROLE_DEFAULT_WORKSPACE,
  WORKSPACE_ROLES,
  resolveOperatorName,
} from "@/lib/assistant/assistant-profile";
import { buildWorldIntelligenceMap, searchWorldMapCountries } from "@/lib/world-map";
import { countries } from "@/lib/countries";

const UNKNOWN_QUERY = "zzz-not-a-real-entity-or-topic-9182";

test("1. Global Search returns grouped real results for a real research topic", () => {
  const response = executeGatewaySearch("microbiology");
  assert.ok(response.hasResults, "microbiology should match the real research catalog");
  const group = response.groups.find((g) => g.id === "research_topics");
  assert.ok(group, "a research_topics group should be present");
  assert.ok(group!.entities.length > 0, "microbiology should match at least one real topic");
  assert.equal(group!.entities[0].entity.type, "research_topic");
  assert.equal(group!.entities[0].entity.id, "microbiology");
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

test("14. Assistant context resolves a real research topic from the page path", () => {
  const context = resolveAssistantContext("/research/microbiology", null);
  assert.ok(context);
  assert.equal(context!.kind, "research_topic");
  assert.equal(context!.href, "/research/microbiology");
});

test("15. Assistant context falls back to the focused platform entity when not on a topic page", () => {
  const context = resolveAssistantContext("/countries", {
    kind: "country",
    id: "japan",
    name: "Japan",
  });
  assert.ok(context);
  assert.equal(context!.kind, "country");
  assert.equal(context!.name, "Japan");
  assert.match(context!.href, /^\/countries\?country=japan$/);
});

test("16. Assistant context is honestly null with no page entity and no platform focus", () => {
  assert.equal(resolveAssistantContext("/dashboard", null), null);
});

test("17. Assistant context never invents a topic for a non-topic research route", () => {
  assert.equal(resolveAssistantContext("/research/workspace", null), null);
});

test("18. No saved profile: the next step is honestly to complete setup", () => {
  const inactive = { ...createEmptyAssistantProfile() };
  const step = resolveNextStep(inactive, null);
  assert.equal(step.id, "complete-setup");
  assert.equal(step.href, "/settings");
});

test("19. Saved profile with recent local work: the next step continues that real entity", () => {
  const active = { ...createEmptyAssistantProfile(), name: "Botir" };
  const step = resolveNextStep(active, { kind: "country", id: "japan", name: "Japan" });
  assert.equal(step.id, "continue-work");
  assert.match(step.href, /^\/countries\?country=japan$/);
});

test("20. Saved profile with no recent work: the next step opens the role's real default workspace", () => {
  const active = { ...createEmptyAssistantProfile(), name: "Botir", workspaceRole: "investor" as const };
  const step = resolveNextStep(active, null);
  assert.equal(step.id, "open-workspace");
  assert.equal(step.href, ROLE_DEFAULT_WORKSPACE.investor);
});

test("21. Every workspace role resolves to a real, declared default route", () => {
  for (const role of WORKSPACE_ROLES) {
    assert.ok(ROLE_DEFAULT_WORKSPACE[role].startsWith("/"), `${role} must map to a real route`);
  }
});

test("22. Operator name falls back to the honest product default when not set", () => {
  const empty = createEmptyAssistantProfile();
  assert.equal(resolveOperatorName(empty), DEFAULT_OPERATOR_NAME);
  assert.equal(resolveOperatorName({ ...empty, operatorName: "Ava" }), "Ava");
});

test("23. Every built-in avatar id has no duplicate and is a non-empty string", () => {
  const unique = new Set(ASSISTANT_AVATARS);
  assert.equal(unique.size, ASSISTANT_AVATARS.length);
  for (const avatar of ASSISTANT_AVATARS) {
    assert.ok(avatar.length > 0);
  }
});

test("24. World Intelligence Map only ever contains real catalog countries", () => {
  const groups = buildWorldIntelligenceMap();
  const mappedIds = groups.flatMap((group) => group.countries.map((entry) => entry.country.id));
  const realIds = countries.map((c) => c.id);
  assert.equal(mappedIds.length, realIds.length, "every real country must appear exactly once");
  for (const id of mappedIds) {
    assert.ok(realIds.includes(id), `${id} must be a real catalog country, never invented`);
  }
});

test("25. World Intelligence Map never fabricates a status outside the declared vocabulary", () => {
  const groups = buildWorldIntelligenceMap();
  for (const group of groups) {
    for (const entry of group.countries) {
      assert.ok(
        (PRODUCT_STATUSES as readonly string[]).includes(entry.status),
        `"${entry.status}" must be one of the declared PRODUCT_STATUSES`,
      );
    }
  }
});

test("26. World Intelligence Map country links route to the real country profile", () => {
  const groups = buildWorldIntelligenceMap();
  for (const group of groups) {
    for (const entry of group.countries) {
      assert.equal(entry.href, `/countries?country=${entry.country.id}`);
    }
  }
});

test("27. World Intelligence Map search is honestly empty for a non-existent country", () => {
  const results = searchWorldMapCountries("Not A Real Country Name");
  assert.deepEqual(results, []);
});

test("28. World Intelligence Map search finds a real country by name", () => {
  const results = searchWorldMapCountries("Japan");
  assert.ok(results.length >= 1);
  assert.ok(results.some((entry) => entry.country.name === "Japan"));
});
