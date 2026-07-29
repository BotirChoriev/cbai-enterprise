import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const server = readFileSync(
  new URL("../services/clamav-scanner/server.mjs", import.meta.url),
  "utf8",
);
const dockerfile = readFileSync(
  new URL("../services/clamav-scanner/Dockerfile", import.meta.url),
  "utf8",
);
const entrypoint = readFileSync(
  new URL("../services/clamav-scanner/entrypoint.sh", import.meta.url),
  "utf8",
);

test("scanner authenticates service calls without ordinary string comparison", () => {
  assert.match(server, /timingSafeEqual/);
  assert.match(server, /SCANNER_TOKEN/);
  assert.match(server, /replace\(\/\^Bearer/);
});

test("scanner blocks SSRF and redirects outside the Supabase origin", () => {
  assert.match(server, /parsed\.protocol !== "https:"/);
  assert.match(server, /parsed\.origin !== ALLOWED_DOWNLOAD_ORIGIN/);
  assert.match(server, /ALLOW_INSECURE_LOCALHOST/);
  assert.match(server, /parsed\.hostname === "host\.docker\.internal"/);
  assert.match(server, /redirect:\s*"error"/);
});

test("scanner verifies size and SHA-256 before trusting ClamAV result", () => {
  assert.match(server, /expectedSha256/);
  assert.match(server, /byte_size_mismatch/);
  assert.match(server, /artifact_integrity_mismatch/);
  assert.match(server, /createHash\("sha256"\)/);
});

test("temporary private artifacts are deleted after every scan", () => {
  assert.match(server, /mkdtemp/);
  assert.match(server, /mode:\s*0o600/);
  assert.match(server, /finally/);
  assert.match(server, /rm\(directory,\s*\{\s*recursive:\s*true,\s*force:\s*true\s*\}\)/);
});

test("container installs signatures, starts clamd, and waits for readiness", () => {
  assert.match(dockerfile, /FROM clamav\/clamav:stable/);
  assert.match(dockerfile, /tini/);
  assert.match(entrypoint, /freshclam/);
  assert.match(entrypoint, /clamdscan --ping=1:1/);
  assert.match(entrypoint, /exec node/);
});
