/**
 * World Bank WDI — first live foundation connector tests.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  fetchWorldBankWdiForCountry,
  validateWdiPayload,
  buildWdiEndpoint,
  isSupportedWdiIndicator,
  foundationWdiStore,
  deriveFreshnessState,
  WDI_FRESHNESS_MAX_AGE_MS,
  resetWorldBankRuntimeForTests,
  getWorldBankRuntimeStatus,
  assertUnrelatedConnectorsRemainPlanned,
  getFoundationConnectorContracts,
  getFoundationSourceRegistry,
  type FetchLike,
} from "../lib/official-connector-foundation/index.ts";

function wdiJson(code: string, value: number | null, date = "2024") {
  return JSON.stringify([
    { page: 1, pages: 1 },
    [
      {
        indicator: { id: code, value: "Name" },
        country: { id: "US", value: "United States" },
        date,
        value,
      },
    ],
  ]);
}

function mockFetchSequence(
  handlers: Array<(url: string) => { status: number; ok: boolean; body: string } | Error>
): FetchLike {
  let i = 0;
  return async (input) => {
    const url = String(input);
    const handler = handlers[Math.min(i, handlers.length - 1)]!;
    i += 1;
    const result = handler(url);
    if (result instanceof Error) throw result;
    return {
      status: result.status,
      ok: result.ok,
      text: async () => result.body,
    };
  };
}

test("unrelated connectors remain planned before and after WDI connect", async () => {
  resetWorldBankRuntimeForTests();
  foundationWdiStore.clear();
  assert.doesNotThrow(() => assertUnrelatedConnectorsRemainPlanned());
  assert.ok(
    getFoundationSourceRegistry()
      .filter((s) => s.slug !== "world-bank")
      .every((s) => s.connectionStatus === "planned")
  );

  const fetchImpl = mockFetchSequence([
    (url) => ({
      status: 200,
      ok: true,
      body: wdiJson(url.match(/indicator\/([^?]+)/)?.[1] ?? "X", 100),
    }),
  ]);
  const result = await fetchWorldBankWdiForCountry("usa", {
    indicatorCodes: ["NY.GDP.MKTP.CD"],
    fetchImpl,
    store: foundationWdiStore,
  });
  assert.equal(result.ok, true);
  assert.equal(getWorldBankRuntimeStatus().status, "connected");
  assert.doesNotThrow(() => assertUnrelatedConnectorsRemainPlanned());
  assert.ok(
    getFoundationConnectorContracts()
      .filter((c) => c.connectorId !== "fconn-world-bank-wdi")
      .every((c) => c.liveEnabled === false)
  );
});

test("successful retrieval publishes provenance and marks Connected", async () => {
  resetWorldBankRuntimeForTests();
  foundationWdiStore.clear();
  const fetchImpl = mockFetchSequence([
    () => ({ status: 200, ok: true, body: wdiJson("NY.GDP.MKTP.CD", 1_000) }),
  ]);
  const result = await fetchWorldBankWdiForCountry("usa", {
    indicatorCodes: ["NY.GDP.MKTP.CD"],
    fetchImpl,
    store: foundationWdiStore,
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.connected, true);
  assert.equal(result.observations.length, 1);
  const obs = result.observations[0]!;
  assert.equal(obs.indicatorCode, "NY.GDP.MKTP.CD");
  assert.equal(obs.value, 1000);
  assert.equal(obs.unit, "current US$");
  assert.equal(obs.referencePeriod, "2024");
  assert.equal(obs.provenance.sourceName, "World Bank Open Data");
  assert.ok(obs.provenance.datasetOrEndpoint.includes("NY.GDP.MKTP.CD"));
  assert.ok(obs.provenance.retrievedAt);
  assert.ok(obs.provenance.lastCheckedAt);
  assert.equal(obs.provenance.freshnessState, "fresh");
  assert.equal(obs.provenance.verificationState, "validated");
  assert.equal(obs.provenance.jurisdiction, "US");
  assert.equal(getWorldBankRuntimeStatus().liveEnabled, true);
});

test("null values are not invented and status stays Planned when nothing publishes", async () => {
  resetWorldBankRuntimeForTests();
  foundationWdiStore.clear();
  const fetchImpl = mockFetchSequence([
    () => ({ status: 200, ok: true, body: wdiJson("SP.POP.TOTL", null) }),
  ]);
  const result = await fetchWorldBankWdiForCountry("usa", {
    indicatorCodes: ["SP.POP.TOTL"],
    fetchImpl,
    store: foundationWdiStore,
  });
  assert.equal(result.ok, false);
  assert.equal(foundationWdiStore.list().length, 0);
  assert.equal(getWorldBankRuntimeStatus().status, "planned");
});

test("invalid indicator is rejected", async () => {
  resetWorldBankRuntimeForTests();
  foundationWdiStore.clear();
  assert.equal(isSupportedWdiIndicator("FAKE.CODE"), false);
  const result = await fetchWorldBankWdiForCountry("usa", {
    indicatorCodes: ["FAKE.CODE"],
    fetchImpl: async () => {
      throw new Error("should not fetch");
    },
    store: foundationWdiStore,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failureClass, "validation_failed");
  assert.equal(getWorldBankRuntimeStatus().status, "planned");
});

test("malformed payload is rejected", () => {
  const bad = validateWdiPayload({ not: "array" }, "NY.GDP.MKTP.CD");
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.equal(bad.failureClass, "malformed_response");

  const badYear = validateWdiPayload(
    [{}, [{ indicator: { id: "NY.GDP.MKTP.CD" }, date: "2024-Q1", value: 1 }]],
    "NY.GDP.MKTP.CD"
  );
  assert.equal(badYear.ok, false);
});

test("timeout keeps Planned", async () => {
  resetWorldBankRuntimeForTests();
  foundationWdiStore.clear();
  const err = new Error("The operation was aborted");
  err.name = "AbortError";
  const fetchImpl: FetchLike = async () => {
    throw err;
  };
  const result = await fetchWorldBankWdiForCountry("usa", {
    indicatorCodes: ["NY.GDP.MKTP.CD"],
    fetchImpl,
    store: foundationWdiStore,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failureClass, "timeout");
  assert.equal(getWorldBankRuntimeStatus().status, "planned");
});

test("duplicate prevention rejects second identical observation", async () => {
  resetWorldBankRuntimeForTests();
  foundationWdiStore.clear();
  const fetchImpl = mockFetchSequence([
    () => ({ status: 200, ok: true, body: wdiJson("FP.CPI.TOTL.ZG", 2.5) }),
    () => ({ status: 200, ok: true, body: wdiJson("FP.CPI.TOTL.ZG", 2.5) }),
  ]);
  const first = await fetchWorldBankWdiForCountry("usa", {
    indicatorCodes: ["FP.CPI.TOTL.ZG"],
    fetchImpl,
    store: foundationWdiStore,
  });
  assert.equal(first.ok, true);
  const second = await fetchWorldBankWdiForCountry("usa", {
    indicatorCodes: ["FP.CPI.TOTL.ZG"],
    fetchImpl,
    store: foundationWdiStore,
  });
  // Second publish is duplicate — store still has one observation
  assert.equal(foundationWdiStore.list().length, 1);
  assert.equal(second.ok, false);
});

test("provenance integrity includes required foundation fields", async () => {
  resetWorldBankRuntimeForTests();
  foundationWdiStore.clear();
  const fetchImpl = mockFetchSequence([
    () => ({ status: 200, ok: true, body: wdiJson("SL.UEM.TOTL.ZS", 4.2) }),
  ]);
  const result = await fetchWorldBankWdiForCountry("usa", {
    indicatorCodes: ["SL.UEM.TOTL.ZS"],
    fetchImpl,
    store: foundationWdiStore,
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const p = result.observations[0]!.provenance;
  for (const field of [
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
  ] as const) {
    assert.ok(field in p, field);
  }
  assert.equal(p.unit, "percent of labor force");
  assert.match(buildWdiEndpoint("US", "SL.UEM.TOTL.ZS"), /country\/US\/indicator\/SL\.UEM\.TOTL\.ZS/);
});

test("freshness calculation", () => {
  const now = Date.parse("2026-07-23T00:00:00.000Z");
  assert.equal(deriveFreshnessState(null, WDI_FRESHNESS_MAX_AGE_MS, now), "not_checked");
  assert.equal(
    deriveFreshnessState("2026-07-22T00:00:00.000Z", WDI_FRESHNESS_MAX_AGE_MS, now),
    "fresh"
  );
  assert.equal(
    deriveFreshnessState("2024-01-01T00:00:00.000Z", WDI_FRESHNESS_MAX_AGE_MS, now),
    "stale"
  );
});

test("unsupported ISO country stays Planned", async () => {
  resetWorldBankRuntimeForTests();
  foundationWdiStore.clear();
  const result = await fetchWorldBankWdiForCountry("xx-not-a-country", {
    store: foundationWdiStore,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failureClass, "unsupported_jurisdiction");
  assert.equal(getWorldBankRuntimeStatus().status, "planned");
});
