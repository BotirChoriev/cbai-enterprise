/**
 * Official connector framework tests — success, failure classes, provenance, reports.
 */

import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { officialFetch, parseJsonBody } from "../lib/official-connectors/framework/http-client.ts";
import { cacheClear, cacheGet, cacheSet } from "../lib/official-connectors/framework/cache.ts";
import {
  assertPublishable,
  computeFreshness,
  dedupeKey,
} from "../lib/official-connectors/framework/validate.ts";
import {
  clearObservations,
  listObservations,
  observationCount,
  publishObservation,
} from "../lib/official-connectors/store.ts";
import { fetchWorldBankForCountry, WORLD_BANK_API_BASE } from "../lib/official-connectors/sources/world-bank.ts";
import { isOecdMemberCountry, fetchOecdForCountry } from "../lib/official-connectors/sources/oecd.ts";
import { fetchUsCensus } from "../lib/official-connectors/sources/us-census-bea.ts";
import {
  generateEvidenceReport,
  generateExecutiveSummary,
} from "../lib/official-connectors/reports.ts";
import type { VerifiedObservation } from "../lib/official-connectors/types.ts";

function sampleObservation(overrides: Partial<VerifiedObservation> = {}): VerifiedObservation {
  const retrievedAt = new Date().toISOString();
  return {
    id: "test:usa:NY.GDP.MKTP.CD:2024",
    indicatorCode: "NY.GDP.MKTP.CD",
    indicatorName: "GDP (current US$)",
    value: 1,
    unit: "current US$",
    referencePeriod: "2024",
    entityType: "country",
    entityId: "usa",
    entityLabel: "United States",
    officialSource: "World Bank Open Data (WDI)",
    provenance: {
      sourceSlug: "world-bank",
      sourceName: "World Bank Open Data",
      sourceUrl: `${WORLD_BANK_API_BASE}/country/US/indicator/NY.GDP.MKTP.CD`,
      publicationDate: "2024-01-01",
      retrievedAt,
      lastCheckedAt: retrievedAt,
      updateFrequency: "Annual",
      jurisdiction: "Global",
      license: "World Bank Open Data Terms of Use",
      connectorId: "conn-world-bank-wdi-live",
      connectorVersion: "1.0.0",
    },
    verificationState: "verified",
    transformationNotes: "test",
    freshnessStatus: "fresh",
    confidenceBasis: "test",
    cbaiIndicatorSlug: "national-accounts",
    ...overrides,
  };
}

test("parseJsonBody rejects malformed responses", () => {
  const bad = parseJsonBody("{not-json");
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.equal(bad.failureClass, "malformed_response");
});

test("cache stores and expires conceptually via clear", () => {
  cacheClear();
  cacheSet("k", "v", 60_000);
  assert.equal(cacheGet("k"), "v");
  cacheClear();
  assert.equal(cacheGet("k"), null);
});

test("assertPublishable rejects stale and unverified", () => {
  assert.equal(assertPublishable(sampleObservation()), null);
  assert.ok(assertPublishable(sampleObservation({ verificationState: "pending" })));
  assert.ok(assertPublishable(sampleObservation({ freshnessStatus: "stale" })));
  assert.ok(assertPublishable(sampleObservation({ value: Number.NaN })));
});

test("duplicate prevention uses provenance key", () => {
  clearObservations();
  const a = sampleObservation();
  const b = sampleObservation({ id: "other-id", value: 2 });
  assert.equal(dedupeKey(a), dedupeKey(b));
  assert.equal(publishObservation(a), true);
  assert.equal(publishObservation(b), true);
  assert.equal(observationCount(), 1);
  assert.equal(listObservations()[0]?.value, 2);
});

test("freshness marks old retrievals stale", () => {
  const old = new Date(Date.now() - 1000 * 60 * 60 * 24 * 500).toISOString();
  assert.equal(computeFreshness(old), "stale");
  assert.equal(computeFreshness(new Date().toISOString()), "fresh");
});

test("OECD unsupported jurisdiction for Uzbekistan", async () => {
  assert.equal(isOecdMemberCountry("uzbekistan"), false);
  const result = await fetchOecdForCountry("uzbekistan");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failureClass, "unsupported_jurisdiction");
});

test("Census without key awaits credentials", async () => {
  const result = await fetchUsCensus(undefined);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failureClass, "awaiting_credentials");
});

test("officialFetch classifies timeout", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = mock.fn(async () => {
    await new Promise((r) => setTimeout(r, 50));
    throw Object.assign(new Error("The operation was aborted"), { name: "AbortError" });
  }) as typeof fetch;
  try {
    const result = await officialFetch("https://example.test/timeout", {
      timeoutMs: 1,
      retries: 0,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.failureClass, "timeout");
  } finally {
    globalThis.fetch = original;
  }
});

test("officialFetch classifies rate limit", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = mock.fn(async () =>
    new Response("slow down", { status: 429 }),
  ) as typeof fetch;
  try {
    const result = await officialFetch("https://example.test/rl", { retries: 0 });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.failureClass, "rate_limit");
  } finally {
    globalThis.fetch = original;
  }
});

test("World Bank connector success with mocked WDI payload", async () => {
  clearObservations();
  cacheClear();
  const original = globalThis.fetch;
  globalThis.fetch = mock.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    assert.match(url, /api\.worldbank\.org\/v2\/country\/US\/indicator\//);
    const code = url.match(/indicator\/([^?]+)/)?.[1] ?? "X";
    return new Response(
      JSON.stringify([
        { page: 1, pages: 1 },
        [
          {
            indicator: { id: code, value: "Test" },
            country: { id: "US", value: "United States" },
            date: "2024",
            value: 100,
          },
        ],
      ]),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const result = await fetchWorldBankForCountry("usa");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.ok(result.observations.length >= 1);
      assert.ok(result.observations.every((o) => o.provenance.sourceUrl.includes("worldbank")));
      assert.ok(result.observations.every((o) => o.verificationState === "verified"));
    }
  } finally {
    globalThis.fetch = original;
  }
});

test("World Bank omits null values — no invented numbers", async () => {
  clearObservations();
  cacheClear();
  const original = globalThis.fetch;
  globalThis.fetch = mock.fn(async () =>
    new Response(
      JSON.stringify([
        { page: 1 },
        [{ indicator: { id: "SP.POP.TOTL" }, country: { id: "US" }, date: "2024", value: null }],
      ]),
      { status: 200 },
    ),
  ) as typeof fetch;
  try {
    const result = await fetchWorldBankForCountry("usa");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.observations.length, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test("reports cite only published observations and include human review notice", () => {
  clearObservations();
  publishObservation(sampleObservation());
  const evidence = generateEvidenceReport("usa");
  const executive = generateExecutiveSummary("usa");
  assert.equal(evidence.evidenceTable.length, 1);
  assert.equal(evidence.evidenceTable[0]?.sourceUrl.includes("worldbank"), true);
  assert.match(evidence.humanReviewNotice, /human/i);
  assert.match(executive.narrative, /does not rank|cannot assert|restates connected evidence/i);
  assert.doesNotMatch(executive.narrative, /guaranteed complete|definitive ranking/i);
});

test("missing-source fallback remains for empty store", () => {
  clearObservations();
  const evidence = generateEvidenceReport();
  assert.equal(evidence.evidenceTable.length, 0);
  assert.match(evidence.narrative, /No verified live observations/i);
});
