/**
 * Regression coverage for local voice doctor/dev port + origin policy.
 * Never asserts on secret values.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  localAppOriginsAllowed,
  originAllowed,
  parseAllowedOriginsList,
  probeHealthyCbaiBroker,
} from "./voice-dev-utils.mjs";

test("parseAllowedOriginsList trims and drops empties", () => {
  assert.deepEqual(parseAllowedOriginsList(" http://a.test , ,http://b.test "), [
    "http://a.test",
    "http://b.test",
  ]);
});

test("localAppOriginsAllowed requires both localhost and 127.0.0.1", () => {
  const onlyLocalhost = localAppOriginsAllowed("http://localhost:3000", 3000);
  assert.equal(onlyLocalhost.localhostOk, true);
  assert.equal(onlyLocalhost.loopbackOk, false);

  const both = localAppOriginsAllowed(
    "http://localhost:3000,http://127.0.0.1:3000",
    3000,
  );
  assert.equal(both.localhostOk, true);
  assert.equal(both.loopbackOk, true);
  assert.equal(originAllowed("http://127.0.0.1:3000", both.allowed.join(",")), true);
});

test("probeHealthyCbaiBroker reports unreachable when nothing listens", async () => {
  const result = await probeHealthyCbaiBroker(59999, "127.0.0.1");
  assert.equal(result.healthy, false);
  assert.equal(result.via, "unreachable");
});
