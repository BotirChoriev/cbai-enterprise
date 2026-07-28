import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../lib/artifact-workspace/cloud-artifact-storage.ts", import.meta.url),
  "utf8",
);
const ui = readFileSync(
  new URL("../components/artifact-workspace/ArtifactResearchRoom.tsx", import.meta.url),
  "utf8",
);

test("cloud artifact upload targets private quarantine and never marks itself clean", () => {
  assert.match(source, /ARTIFACT_BUCKET\s*=\s*"cbai-artifacts"/);
  assert.match(source, /scan_status:\s*"pending"/);
  assert.match(source, /processing_status:\s*"quarantined"/);
  assert.doesNotMatch(source, /scan_status:\s*"clean"/);
  assert.doesNotMatch(source, /processing_status:\s*"human_confirmed"/);
});

test("failed metadata writes compensate by removing uploaded bytes", () => {
  assert.match(source, /\.remove\(\[storageKey\]\)/);
  assert.match(source, /\.delete\(\)\.eq\("id", storageObjectId\)/);
});

test("research room exposes honest quarantine status", () => {
  assert.match(ui, /data-cbai-artifact-cloud-upload/);
  assert.match(ui, /data-cbai-artifact-quarantined/);
  assert.match(ui, /malware scanner/i);
});
