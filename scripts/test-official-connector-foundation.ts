/**
 * Official Connector Foundation — focused tests (non-live plumbing).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertUnrelatedConnectorsRemainPlanned,
  buildProvenance,
  classifyHttpFailure,
  getFoundationSourceRegistry,
  getFoundationConnectorContracts,
  deriveFreshnessState,
  fetchWithFoundationAdapter,
  FoundationAuditLog,
  FoundationObservationStore,
  getFoundationSourceBySlug,
  isSafeEmptyCoverage,
  missingSourceFallback,
  normalizeValidatedObservation,
  parseJsonResponse,
  plannedHealthSnapshot,
  resetWorldBankRuntimeForTests,
  validateObservationPayload,
  type FetchLike,
} from "../lib/official-connector-foundation/index.ts";

test("static registry defaults Planned; unrelated connectors stay planned", () => {
  resetWorldBankRuntimeForTests();
  assert.doesNotThrow(() => assertUnrelatedConnectorsRemainPlanned());
  assert.ok(getFoundationSourceRegistry().every((s) => s.connectionStatus === "planned"));
  assert.ok(getFoundationConnectorContracts().every((c) => c.liveEnabled === false));
});

test("malformed response is rejected", () => {
  const bad = parseJsonResponse("{not-json");
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.equal(bad.failureClass, "malformed_response");

  const empty = parseJsonResponse("   ");
  assert.equal(empty.ok, false);

  const invalidObs = validateObservationPayload({ indicatorCode: "X" });
  assert.equal(invalidObs.ok, false);
  if (!invalidObs.ok) assert.equal(invalidObs.failureClass, "validation_failed");
});

test("timeout is classified and retried then fails", async () => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => {
    calls += 1;
    const err = new Error("The operation was aborted");
    err.name = "AbortError";
    throw err;
  };
  const result = await fetchWithFoundationAdapter(
    "https://example.test/timeout",
    { timeoutMs: 50, maxRetries: 2, retryDelayMs: 1 },
    fetchImpl
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.failureClass, "timeout");
    assert.equal(result.attemptCount, 3);
  }
  assert.equal(calls, 3);
});

test("rate limit is classified and not treated as success", async () => {
  assert.equal(classifyHttpFailure(429), "rate_limit");
  const fetchImpl: FetchLike = async () => ({
    status: 429,
    ok: false,
    text: async () => "Too Many Requests",
  });
  const result = await fetchWithFoundationAdapter(
    "https://example.test/rate",
    { maxRetries: 2, retryDelayMs: 1 },
    fetchImpl
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.failureClass, "rate_limit");
    assert.equal(result.attemptCount, 1);
  }
});

test("duplicate prevention rejects second identical observation", () => {
  const store = new FoundationObservationStore();
  const source = getFoundationSourceBySlug("world-bank");
  assert.ok(source);
  const retrievedAt = "2026-07-22T00:00:00.000Z";
  const draft = normalizeValidatedObservation({
    source,
    indicatorCode: "NY.GDP.MKTP.CD",
    indicatorName: "GDP (current US$)",
    value: 1,
    unit: "current US$",
    referencePeriod: "2024",
    entityType: "country",
    entityId: "usa",
    entityLabel: "United States",
    datasetOrEndpoint: "WDI/NY.GDP.MKTP.CD",
    jurisdiction: "USA",
    retrievedAt,
    lastCheckedAt: retrievedAt,
    publicationDate: "2024-01-01",
    transformationNotes: "foundation test draft — not live evidence",
    verificationState: "unverified",
    freshnessState: "fresh",
    connectorHealth: "planned",
  });

  const first = store.publishValidated(draft);
  assert.equal(first.ok, true);
  const second = store.publishValidated(draft);
  assert.equal(second.ok, false);
  if (!second.ok) {
    assert.equal(second.duplicate, true);
    assert.ok(second.existingId);
  }
  assert.equal(store.list().length, 1);
});

test("provenance retention keeps all required fields", () => {
  const source = getFoundationSourceBySlug("world-bank");
  assert.ok(source);
  const retrievedAt = "2026-07-22T12:00:00.000Z";
  const lastCheckedAt = "2026-07-22T12:05:00.000Z";
  const provenance = buildProvenance({
    source,
    indicatorCode: "SP.POP.TOTL",
    indicatorName: "Population, total",
    value: 100,
    unit: "people",
    referencePeriod: "2023",
    entityType: "country",
    entityId: "uzb",
    entityLabel: "Uzbekistan",
    datasetOrEndpoint: "WDI/SP.POP.TOTL",
    jurisdiction: "UZB",
    retrievedAt,
    lastCheckedAt,
    publicationDate: null,
    transformationNotes: "none",
    verificationState: "unverified",
    freshnessState: "not_checked",
    connectorHealth: "planned",
  });

  const required = [
    "sourceName",
    "sourceType",
    "officialSourceUrl",
    "datasetOrEndpoint",
    "indicatorName",
    "jurisdiction",
    "referencePeriod",
    "retrievedAt",
    "lastCheckedAt",
    "publicationDate",
    "unit",
    "transformationNotes",
    "verificationState",
    "freshnessState",
    "connectorHealth",
  ] as const;

  for (const field of required) {
    assert.ok(field in provenance, `missing ${field}`);
  }
  assert.equal(provenance.sourceName, "World Bank Open Data");
  assert.equal(provenance.retrievedAt, retrievedAt);
  assert.equal(provenance.lastCheckedAt, lastCheckedAt);
  assert.equal(provenance.publicationDate, null);
  assert.equal(deriveFreshnessState(null, 1000), "not_checked");
  assert.equal(
    deriveFreshnessState(lastCheckedAt, 24 * 60 * 60 * 1000, Date.parse(lastCheckedAt) + 1000),
    "fresh"
  );
});

test("missing-source fallback never invents evidence", () => {
  resetWorldBankRuntimeForTests();
  const unknown = missingSourceFallback({
    sourceSlug: "does-not-exist",
    indicatorName: "GDP",
  });
  assert.equal(unknown.status, "Missing");
  assert.ok(isSafeEmptyCoverage(unknown));

  const planned = missingSourceFallback({
    sourceSlug: "world-bank",
    indicatorName: "GDP (current US$)",
    jurisdiction: "USA",
  });
  assert.equal(planned.status, "Awaiting official source");
  assert.ok(isSafeEmptyCoverage(planned));
  assert.equal(plannedHealthSnapshot("fconn-world-bank-wdi").health, "planned");
});

test("audit log records reject and missing_source actions", () => {
  const audit = new FoundationAuditLog();
  audit.record("fconn-world-bank-wdi", "reject", "malformed", "malformed_response");
  audit.record("fconn-world-bank-wdi", "missing_source", "awaiting World Bank");
  const entries = audit.list();
  assert.equal(entries.length, 2);
  assert.equal(entries[0]?.failureClass, "malformed_response");
  assert.equal(entries[1]?.action, "missing_source");
});

test("successful mocked fetch returns retrievedAt", async () => {
  const fetchImpl: FetchLike = async () => ({
    status: 200,
    ok: true,
    text: async () => JSON.stringify({ ok: true }),
  });
  const result = await fetchWithFoundationAdapter(
    "https://example.test/ok",
    { maxRetries: 0 },
    fetchImpl
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(result.retrievedAt);
    assert.equal(result.attemptCount, 1);
    const parsed = parseJsonResponse(result.bodyText);
    assert.equal(parsed.ok, true);
  }
});
