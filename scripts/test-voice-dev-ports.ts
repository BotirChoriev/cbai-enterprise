/**
 * Regression coverage for local voice doctor/dev port + origin policy.
 * Never asserts on secret values.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_APP_PORT,
  localAppOriginsAllowed,
  originAllowed,
  parseAllowedOriginsList,
  probeHealthyCbaiBroker,
} from "./voice-dev-utils.mjs";

test("canonical voice development port is 3001", () => {
  assert.equal(DEFAULT_APP_PORT, 3001);
});

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

test("classifyClientVoiceMode distinguishes configured broker from fallback", async () => {
  const { classifyClientVoiceMode } = await import("./voice-dev-utils.mjs");
  assert.equal(classifyClientVoiceMode("http://127.0.0.1:8788/api/voice"), "realtime_broker_configured");
  assert.equal(classifyClientVoiceMode(""), "browser_fallback_backend_required");
  assert.equal(classifyClientVoiceMode(null), "browser_fallback_backend_required");
});

test("dev:voice source reuses healthy broker and never killalls", async () => {
  const { readFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const source = readFileSync(resolve("scripts/dev-voice.mjs"), "utf8");
  assert.match(source, /Reusing healthy CBAI voice broker/);
  assert.match(source, /will not kill arbitrary processes/i);
  assert.doesNotMatch(source, /killall/);
  assert.doesNotMatch(source, /pkill/);
});

test("doctor:voice reports port ownership and dual origins without secrets", async () => {
  const { readFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const source = readFileSync(resolve("scripts/doctor-voice.mjs"), "utf8");
  assert.match(source, /Port ownership/);
  assert.match(source, /Origin match localhost/);
  assert.match(source, /Origin match 127\.0\.0\.1/);
  assert.match(source, /Next action/);
  // Credential presence may be asserted via boolean/prefix; never log raw secrets.
  assert.match(source, /credentialOk \? "yes" : "no"/);
  assert.doesNotMatch(source, /console\.(log|error)\(`[^`]*\$\{postBody/);
});
