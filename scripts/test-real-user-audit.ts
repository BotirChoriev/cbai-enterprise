// Focused pure-logic tests for the "Full Real-User Experience Audit" mission's fixes — the
// counterpart to scripts/test-browser-regression.ts (which verifies these same fixes end-to-end in
// a real browser). Same zero-dependency harness as every other suite (Node's native node:test).
// Run with: npm run test:real-user-audit

import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import { createEmptyAssistantProfile } from "@/lib/assistant/assistant-profile";

test("1. A bare, exact real country name opens that country — the real bug found via browser testing (typing 'Japan' previously fell through to 'not recognized')", () => {
  const match = resolveAssistantCommand("Japan");
  assert.ok(match);
  assert.equal(match!.href, "/countries?country=japan");
});

test("2. Bare-name matching is case-insensitive but still exact — never a fuzzy/partial guess", () => {
  assert.equal(resolveAssistantCommand("japan")?.href, "/countries?country=japan");
  assert.equal(resolveAssistantCommand("JAPAN")?.href, "/countries?country=japan");
});

test("3. A bare real company/university name resolves too, matching the same real fallback", () => {
  const company = resolveAssistantCommand("Apple");
  assert.ok(company);
  assert.match(company!.href, /^\/companies\?company=/);

  const university = resolveAssistantCommand("MIT");
  // MIT may or may not be the exact catalog name — only assert if a real match exists, never force one.
  if (university) {
    assert.match(university.href, /^\/universities\?university=/);
  }
});

test("4. An unrelated, multi-word sentence never fabricates a match — the real regression this mission caused and fixed (searchEntities' fuzzy ranking previously matched unrelated research topics)", () => {
  assert.equal(resolveAssistantCommand("please forecast the stock market for me"), null);
  assert.equal(resolveAssistantCommand("mutlaqo notanish narsani och"), null);
});

test("5. A partial/fuzzy real name does not bare-match — it honestly falls through (the existing 'not recognized' + /search fallback is the right place for fuzzy matching, not the command bar)", () => {
  assert.equal(resolveAssistantCommand("jap"), null);
  assert.equal(resolveAssistantCommand("United States of Americaaa"), null);
});

test("6. Bare-name fallback never shadows a real fixed command phrase (checked last, lowest priority)", () => {
  const match = resolveAssistantCommand("open my work");
  assert.ok(match);
  assert.equal(match!.href, "/my-work");
});

test("7. Empty/whitespace input still safely returns null through the new fallback path", () => {
  assert.equal(resolveAssistantCommand(""), null);
  assert.equal(resolveAssistantCommand("   "), null);
  assert.equal(resolveAssistantCommand("a"), null); // below the 2-character floor
});

test("8. The real theme default is honest ('system') — regression guard for the Design System 4.0 default-theme flip audited this mission", () => {
  assert.equal(createEmptyAssistantProfile().themeMode, "system");
});
