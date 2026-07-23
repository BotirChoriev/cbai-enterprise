// Phase 4 — Evidence engine lifecycle foundations.
// Run with: npm run test:phase-4-evidence-engine

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EVIDENCE_LIFECYCLE_STATUSES,
  canTransitionEvidenceStatus,
  evidenceStatusDisplayLabel,
  isEvidencePresentedAsVerified,
  transitionEvidenceStatus,
  type EvidenceRecord,
} from "@/lib/evidence-engine";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

function sampleRecord(status: EvidenceRecord["status"]): EvidenceRecord {
  return {
    id: "evidence-test-1",
    title: "Sample draft",
    summary: "Planned — no live source",
    status,
    provenance: {
      publisher: "Not specified",
      publicationDate: null,
      retrievalDate: null,
      jurisdiction: null,
      language: "en",
      confidenceBasis: "Not documented",
      reviewer: null,
      reviewNotes: null,
    },
    missionId: "mission-1",
    reportId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

test("1. Lifecycle statuses include the seven honest states", () => {
  assert.deepEqual([...EVIDENCE_LIFECYCLE_STATUSES], [
    "unverified",
    "under_review",
    "verified",
    "disputed",
    "rejected",
    "expired",
    "missing_source",
  ]);
});

test("2. Unverified cannot jump directly to verified", () => {
  assert.equal(canTransitionEvidenceStatus("unverified", "verified"), false);
  const result = transitionEvidenceStatus(sampleRecord("unverified"), "verified");
  assert.equal(result.ok, false);
});

test("3. Missing source cannot jump directly to verified", () => {
  assert.equal(canTransitionEvidenceStatus("missing_source", "verified"), false);
  const result = transitionEvidenceStatus(sampleRecord("missing_source"), "verified");
  assert.equal(result.ok, false);
});

test("4. Under review can become verified", () => {
  assert.equal(canTransitionEvidenceStatus("under_review", "verified"), true);
  const result = transitionEvidenceStatus(sampleRecord("under_review"), "verified", {
    reviewer: "alice",
    reviewNotes: "Checked provenance",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.record.status, "verified");
    assert.equal(result.record.provenance.reviewer, "alice");
  }
});

test("5. Display layer never presents unverified as verified", () => {
  assert.equal(evidenceStatusDisplayLabel("unverified"), "Unverified");
  assert.equal(isEvidencePresentedAsVerified("unverified"), false);
  assert.equal(isEvidencePresentedAsVerified("missing_source"), false);
  assert.equal(isEvidencePresentedAsVerified("under_review"), false);
  assert.equal(isEvidencePresentedAsVerified("verified"), true);
});

test("6. Allowed mid-lifecycle transitions remain honest", () => {
  assert.equal(canTransitionEvidenceStatus("verified", "disputed"), true);
  assert.equal(canTransitionEvidenceStatus("disputed", "under_review"), true);
  assert.equal(canTransitionEvidenceStatus("rejected", "under_review"), true);
  assert.equal(canTransitionEvidenceStatus("expired", "verified"), false);
});

test("7. Evidence workspace route and store wiring exist", () => {
  const page = readSource("app/(dashboard)/evidence/workspace/page.tsx");
  assert.match(page, /EvidenceWorkspacePageClient/);
  const store = readSource("lib/evidence-engine/evidence-store.ts");
  assert.match(store, /cbai-evidence-engine-records/);
  assert.match(store, /missionId/);
  assert.match(store, /reportId/);
  assert.match(store, /initialStatus === "verified"/);
});
