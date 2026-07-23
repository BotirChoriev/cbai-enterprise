// Phase 12 — i18n / mobile polish (file existence + key presence).
// Run with: npm run test:phase-12-i18n-mobile

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PHASE_12_COVERAGE,
  phase12CoverageSummary,
  phase12LocalesCovered,
} from "@/lib/i18n/phase-12-coverage";
import {
  PHASE_12_LABELS,
  PHASE_12_LABEL_KEYS,
  getPhase12Labels,
  resolvePhase12Locale,
} from "@/lib/i18n/phase-12-labels";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

test("1. Phase 12 label stubs exist for EN/RU/UZ/TR with required keys", () => {
  assert.deepEqual([...phase12LocalesCovered()], ["en", "ru", "uz", "tr"]);
  for (const locale of phase12LocalesCovered()) {
    const bundle = PHASE_12_LABELS[locale];
    for (const key of PHASE_12_LABEL_KEYS) {
      assert.ok(typeof bundle[key] === "string" && bundle[key].length > 0, `${locale}.${key}`);
    }
  }
  assert.equal(resolvePhase12Locale("tr"), "tr");
  assert.equal(resolvePhase12Locale("de"), "en");
  assert.match(getPhase12Labels("en").billingTestModeBanner, /TEST MODE|never charges/i);
});

test("2. Coverage status module lists modes/evidence/mission/billing/digital-twin", () => {
  const ids = PHASE_12_COVERAGE.map((entry) => entry.id);
  assert.ok(ids.includes("modes-labels"));
  assert.ok(ids.includes("evidence-labels"));
  assert.ok(ids.includes("mission-labels"));
  assert.ok(ids.includes("billing-labels"));
  assert.ok(ids.includes("digital-twin-labels"));
  assert.ok(ids.includes("mobile-nav"));
  const summary = phase12CoverageSummary();
  assert.ok(summary.completeStub >= 5);
});

test("3. Required Phase 12 files exist", () => {
  for (const relative of [
    "lib/i18n/phase-12-labels.ts",
    "lib/i18n/phase-12-coverage.ts",
    "components/layout/MobileNavDrawer.tsx",
    "components/billing/BillingPageClient.tsx",
    "components/digital-twin/DigitalTwinPageClient.tsx",
    "components/user-modes/ModesPageClient.tsx",
    "components/evidence/EvidenceWorkspacePageClient.tsx",
  ]) {
    assert.equal(existsSync(join(process.cwd(), relative)), true, relative);
  }
});

test("4. New primary buttons have accessible labels; mobile notes present", () => {
  const billing = readSource("components/billing/BillingPageClient.tsx");
  assert.match(billing, /aria-label=\{`Select simulated plan/);
  assert.match(billing, /aria-label=\{`Add simulated usage/);
  assert.match(billing, /mobileNavNote/);
  assert.match(billing, /md:hidden/);

  const twin = readSource("components/digital-twin/DigitalTwinPageClient.tsx");
  assert.match(twin, /mobileNavNote/);
  assert.match(twin, /md:hidden|sm:grid-cols/);

  const mobile = readSource("components/layout/MobileNavDrawer.tsx");
  assert.match(mobile, /Phase 12/);
  assert.match(mobile, /aria-label="Close navigation"/);
  assert.match(mobile, /aria-label="Mobile navigation"/);
});
