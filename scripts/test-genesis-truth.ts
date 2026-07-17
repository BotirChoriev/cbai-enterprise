// BUILD-027/028 genesis truth and telemetry tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import { deriveMilestones } from "@/lib/research/readiness/readiness-derivation";
import { buildResearchReviewWorkspace } from "@/lib/research/intelligence/review-workspace-engine";
import { deriveResearchDecision } from "@/lib/research/intelligence/decision-engine";
import { deriveResearchWorkflow } from "@/lib/research/workflow/workflow-engine";
import { deriveResearchHealth } from "@/lib/research/health/health-engine";
import { parseCrossrefSearchResponse } from "@/lib/knowledge-connectors/crossref/crossref-adapter";
import {
  recordWorkflowEvent,
  loadWorkflowEvents,
  clearWorkflowEvents,
} from "@/lib/telemetry/workflow-telemetry";
import { evaluateOrganizationPermission } from "@/lib/organization-os/permissions-service";
import { deriveKnowledgeTrustStateFromSource } from "@/lib/intelligence-os/trust-derivation";

const CATALOG_TOPIC = "microbiology";

test("GEN-T001 catalog items are not live-connected evidence", () => {
  const intel = deriveEvidenceGapIntelligence(CATALOG_TOPIC);
  assert.ok(intel);
  assert.ok(intel!.catalogDocumentedEvidence.length > 0);
  assert.equal(intel!.connectedEvidence.length, 0);
  assert.equal(intel!.hasLiveConnectedEvidence, false);
});

test("GEN-T002 decision_reached requires finding and no_action_required", () => {
  const intel = deriveEvidenceGapIntelligence(CATALOG_TOPIC)!;
  const workspace = buildResearchReviewWorkspace(CATALOG_TOPIC)!;
  const decision = deriveResearchDecision(CATALOG_TOPIC)!;
  const milestones = deriveMilestones(intel, workspace, decision);
  const decisionMilestone = milestones.find((m) => m.id === "decision_reached");
  assert.ok(decisionMilestone);
  assert.equal(decisionMilestone!.complete, false);
});

test("GEN-T003 catalog topics have blocking factors", () => {
  const workflow = deriveResearchWorkflow(CATALOG_TOPIC);
  assert.ok(workflow);
  assert.ok(workflow!.blockingFactors.length > 0);
});

test("GEN-T004 catalog-only health is weak not stable", () => {
  const health = deriveResearchHealth(CATALOG_TOPIC);
  assert.ok(health);
  assert.equal(health!.state, "weak");
});

test("GEN-T005 workflow stage is evidence_connection_required for catalog-only", () => {
  const workflow = deriveResearchWorkflow(CATALOG_TOPIC);
  assert.equal(workflow!.currentStage, "evidence_connection_required");
});

test("BUILD-027 telemetry stores events without sensitive fields", () => {
  clearWorkflowEvents();
  recordWorkflowEvent("intent_resolved", { intentCategory: "search_entity", route: "/search" });
  const events = loadWorkflowEvents();
  assert.equal(events.length, 1);
  assert.equal(events[0]!.event, "intent_resolved");
  assert.ok(!JSON.stringify(events).includes("password"));
});

test("BUILD-028 Crossref parser preserves DOI and provenance", () => {
  const raw = {
    status: "ok",
    message: {
      "total-results": 1,
      items: [
        {
          DOI: "10.1038/nature12373",
          title: ["Test Article"],
          author: [{ given: "Jane", family: "Doe" }],
          published: { "date-parts": [[2013, 5, 15]] },
          URL: "https://doi.org/10.1038/nature12373",
        },
      ],
    },
  };
  const result = parseCrossrefSearchResponse(raw, { query: "test" }, new Date().toISOString());
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0]!.canonicalId, "10.1038/nature12373");
  assert.equal(result.records[0]!.trustState, "retrieved");
  assert.ok(result.records[0]!.limitations.some((l) => l.includes("review")));
});

test("BUILD-029 guest cannot edit organization", () => {
  assert.equal(
    evaluateOrganizationPermission("user-1", "org-1", "edit_organization"),
    false,
  );
});

test("BUILD-032 trust derivation is categorical not numeric", () => {
  const trust = deriveKnowledgeTrustStateFromSource({
    id: "x",
    canonicalId: "10.1/test",
    provider: "crossref",
    sourceType: "article",
    title: "T",
    subtitle: null,
    authors: [],
    publicationDate: null,
    retrievedAt: new Date().toISOString(),
    landingPageUrl: null,
    openAccessUrl: null,
    identifiers: [],
    provenance: {
      provider: "crossref",
      providerRecordId: "10.1/test",
      originalSourceName: "Crossref",
      originalSourceUrl: null,
      retrievedAt: new Date().toISOString(),
      providerUpdatedAt: null,
      retrievalMethod: "api",
      license: null,
      attributionRequired: true,
      dataCompleteness: "partial",
      provenanceLimitations: [],
    },
    trustState: "retrieved",
    abstract: null,
    limitations: [],
    connectionState: "available",
  });
  assert.equal(trust.requiredReview, "required");
  assert.ok(typeof trust.state === "string");
});
