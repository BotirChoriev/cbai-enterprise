// BUILD-028.5 — Source ingestion lifecycle tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionSourceLifecycle,
  assertSourceLifecycleTransition,
} from "@/lib/knowledge-ingestion/source-lifecycle";
import { normalizeDoi } from "@/lib/knowledge-ingestion/source-deduplication";
import {
  clearSavedKnowledgeSourcesForTests,
  linkSavedSourceToMission,
  loadSavedKnowledgeSource,
  requestSavedSourceReview,
  saveKnowledgeSourceFromCanonical,
} from "@/lib/knowledge-ingestion/saved-source-store";
import {
  clearSourceReviewsForTests,
  completeSavedSourceReview,
  loadSourceReviews,
} from "@/lib/knowledge-ingestion/source-review-store";
import {
  loadQualifyingProjectEvidence,
  deriveReportEvidenceBlocker,
} from "@/lib/knowledge-ingestion/qualifying-evidence";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { deriveKnowledgeTrustStateFromSavedSource } from "@/lib/intelligence-os/trust-derivation";
import {
  clearWorkflowEvents,
  loadWorkflowEvents,
  recordConfirmedMutation,
} from "@/lib/telemetry/workflow-telemetry";
import { clearProjectEvidenceForTests, saveProjectEvidence } from "@/lib/project/project-store";
import type { CanonicalKnowledgeSource } from "@/lib/knowledge-connectors/types";

function fixtureSource(overrides: Partial<CanonicalKnowledgeSource> = {}): CanonicalKnowledgeSource {
  return {
    id: "crossref-work-1",
    canonicalId: "10.1234/example.2024",
    provider: "crossref",
    sourceType: "journal-article",
    title: "Aral Sea salinity trends",
    subtitle: null,
    authors: ["A. Researcher"],
    publicationDate: "2024-01-15",
    retrievedAt: new Date().toISOString(),
    landingPageUrl: "https://doi.org/10.1234/example.2024",
    openAccessUrl: null,
    identifiers: [{ scheme: "doi", value: "10.1234/example.2024" }],
    provenance: {
      provider: "crossref",
      providerRecordId: "cr-1",
      originalSourceName: "Crossref",
      originalSourceUrl: "https://api.crossref.org",
      retrievedAt: new Date().toISOString(),
      providerUpdatedAt: null,
      retrievalMethod: "api",
      license: null,
      attributionRequired: true,
      dataCompleteness: "partial",
      provenanceLimitations: ["Metadata only — not full text."],
    },
    trustState: "retrieved",
    abstract: null,
    limitations: ["Crossref metadata only."],
    connectionState: "available",
    ...overrides,
  };
}

test("ING-T001 lifecycle allows canonical path", () => {
  assert.equal(canTransitionSourceLifecycle("search_result", "inspected"), true);
  assert.equal(canTransitionSourceLifecycle("inspected", "saved_source"), true);
  assert.equal(canTransitionSourceLifecycle("saved_source", "linked_to_mission"), true);
  assert.equal(canTransitionSourceLifecycle("linked_to_mission", "awaiting_review"), true);
  assert.equal(canTransitionSourceLifecycle("awaiting_review", "reviewed_evidence"), true);
});

test("ING-T002 invalid lifecycle transitions rejected", () => {
  assert.equal(canTransitionSourceLifecycle("search_result", "reviewed_evidence"), false);
  assert.throws(() => assertSourceLifecycleTransition("search_result", "reviewed_evidence"));
});

test("ING-T003 DOI normalization deduplicates", () => {
  assert.equal(normalizeDoi("https://doi.org/10.1234/ABC"), "10.1234/abc");
  assert.equal(normalizeDoi("DOI:10.1234/abc"), "10.1234/abc");
});

test("ING-T004 save persists and prevents duplicate DOI", () => {
  clearSavedKnowledgeSourcesForTests();
  const canonical = fixtureSource();
  const first = saveKnowledgeSourceFromCanonical(canonical);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.equal(first.duplicate, false);

  const second = saveKnowledgeSourceFromCanonical(canonical);
  assert.equal(second.ok, true);
  if (!second.ok) return;
  assert.equal(second.duplicate, true);
  assert.equal(second.source.id, first.source.id);
});

test("ING-T005 link, review request, and accept as evidence", () => {
  clearSavedKnowledgeSourcesForTests();
  clearSourceReviewsForTests();
  clearProjectEvidenceForTests();
  clearWorkflowEvents();

  const saved = saveKnowledgeSourceFromCanonical(fixtureSource());
  assert.equal(saved.ok, true);
  if (!saved.ok) return;

  const missionId = "mission-test-1";
  const projectId = "project-test-1";
  const linked = linkSavedSourceToMission(saved.source.id, missionId);
  assert.ok(linked);
  assert.equal(linked!.lifecycleState, "linked_to_mission");

  const awaiting = requestSavedSourceReview(saved.source.id);
  assert.ok(awaiting);
  assert.equal(awaiting!.lifecycleState, "awaiting_review");

  const review = completeSavedSourceReview({
    sourceId: saved.source.id,
    missionId,
    reviewerDisplayName: "Test Reviewer",
    decision: "accepted_as_evidence",
    relation: "supports",
  });
  assert.equal(review.ok, true);

  const reloaded = loadSavedKnowledgeSource(saved.source.id);
  assert.equal(reloaded?.lifecycleState, "reviewed_evidence");
  assert.equal(loadSourceReviews(saved.source.id).length, 1);

  saveProjectEvidence({
    projectId,
    title: saved.source.title,
    savedSourceId: saved.source.id,
    reviewOutcome: "accepted_as_evidence",
    evidenceRelation: "supports",
  });

  const qualifying = loadQualifyingProjectEvidence(projectId);
  assert.equal(qualifying.length, 1);
  assert.equal(deriveReportEvidenceBlocker(projectId, missionId), null);

  recordConfirmedMutation("source_saved", { objectType: "saved_source", objectId: saved.source.id });
  const events = loadWorkflowEvents();
  assert.ok(events.some((e) => e.event === "source_saved"));
});

test("ING-T006 context_only does not qualify for report readiness", () => {
  clearSavedKnowledgeSourcesForTests();
  clearSourceReviewsForTests();
  clearProjectEvidenceForTests();

  const saved = saveKnowledgeSourceFromCanonical(fixtureSource({ id: "crossref-work-2", canonicalId: "10.1234/context" }));
  assert.equal(saved.ok, true);
  if (!saved.ok) return;

  const missionId = "mission-test-2";
  const projectId = "project-test-2";
  linkSavedSourceToMission(saved.source.id, missionId);
  requestSavedSourceReview(saved.source.id);

  completeSavedSourceReview({
    sourceId: saved.source.id,
    missionId,
    reviewerDisplayName: "Reviewer",
    decision: "context_only",
    relation: "contextual",
  });

  saveProjectEvidence({
    projectId,
    title: saved.source.title,
    reviewOutcome: "context_only",
    evidenceRelation: "contextual",
  });

  assert.equal(loadQualifyingProjectEvidence(projectId).length, 0);
  const readiness = deriveReportReadiness(projectId);
  assert.equal(readiness.canClaimReadiness, false);
  assert.equal(readiness.state, "evidence_required");
});

test("ING-T007 rejected review preserved without qualifying evidence", () => {
  clearSavedKnowledgeSourcesForTests();
  clearSourceReviewsForTests();

  const saved = saveKnowledgeSourceFromCanonical(fixtureSource({ id: "crossref-work-3", canonicalId: "10.1234/reject" }));
  assert.equal(saved.ok, true);
  if (!saved.ok) return;

  const missionId = "mission-test-3";
  linkSavedSourceToMission(saved.source.id, missionId);
  requestSavedSourceReview(saved.source.id);

  completeSavedSourceReview({
    sourceId: saved.source.id,
    missionId,
    reviewerDisplayName: "Reviewer",
    decision: "rejected",
    relation: "insufficient",
  });

  const reloaded = loadSavedKnowledgeSource(saved.source.id);
  assert.equal(reloaded?.lifecycleState, "rejected");
  const trust = deriveKnowledgeTrustStateFromSavedSource(reloaded!);
  assert.equal(trust.state, "rejected");
});
