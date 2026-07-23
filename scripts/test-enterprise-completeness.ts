/**
 * Smoke tests for enterprise completeness surfaces — no invented evidence.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { buildGlobalStatus, formatIndicatorCoverageLabel } from "../lib/enterprise/global-status.ts";
import {
  COMPANY_ARCHITECTURE_FIELDS,
  UNIVERSITY_ARCHITECTURE_FIELDS,
} from "../lib/enterprise/entity-architecture.ts";
import { ENTERPRISE_REPORT_ARCHITECTURE } from "../lib/enterprise/report-architecture.ts";
import { buildGovernanceUserMetrics } from "../lib/enterprise/governance-user-metrics.ts";
import { buildTrustOperatingModel } from "../lib/enterprise/trust-operating.ts";
import { buildResearchWorkspaceFacets } from "../lib/enterprise/research-workspace-facets.ts";
import { RESEARCH_TOPICS } from "../lib/research/research-topics.ts";
import { plainMissingReason } from "../components/shared/plain-gap-copy.ts";

test("global status never invents confidence scores", () => {
  const status = buildGlobalStatus();
  assert.ok(status.connectedSources >= 0);
  assert.ok(status.missingSources >= 0);
  assert.match(status.confidence, /Not assessed|Partial/);
  assert.match(status.lastUpdated, /Not checked|awaiting|20\d{2}/i);
});

test("indicator coverage labels are plural-aware", () => {
  assert.equal(formatIndicatorCoverageLabel(1, 10), "1 / 10 indicator connected");
  assert.equal(formatIndicatorCoverageLabel(2, 10), "2 / 10 indicators connected");
  assert.equal(formatIndicatorCoverageLabel(0, 10), "0 / 10 indicators connected");
});

test("company and university architecture fields are complete", () => {
  assert.ok(COMPANY_ARCHITECTURE_FIELDS.length >= 12);
  assert.ok(UNIVERSITY_ARCHITECTURE_FIELDS.length >= 10);
  assert.ok(COMPANY_ARCHITECTURE_FIELDS.every((f) => f.expectedSource && f.whyMissing));
  assert.ok(UNIVERSITY_ARCHITECTURE_FIELDS.every((f) => f.status !== undefined));
});

test("enterprise report architecture includes six families", () => {
  const ids = ENTERPRISE_REPORT_ARCHITECTURE.map((r) => r.id);
  for (const id of ["executive", "government", "investor", "academic", "risk", "evidence"]) {
    assert.ok(ids.includes(id as never));
  }
});

test("governance metrics are user-focused", () => {
  const metrics = buildGovernanceUserMetrics();
  const labels = metrics.map((m) => m.label);
  assert.ok(labels.includes("Evidence Coverage"));
  assert.ok(labels.includes("Confidence"));
  assert.ok(labels.includes("Verification Status"));
  assert.ok(labels.includes("Missing Sources"));
  assert.ok(labels.includes("Human Review Status"));
  assert.ok(labels.includes("Transparency Score"));
  assert.ok(!labels.some((l) => /engine version|schema version/i.test(l)));
});

test("trust operating model lists connected and missing sources", () => {
  const model = buildTrustOperatingModel();
  assert.ok(model.connectedOfficialSources.length >= 1);
  assert.ok(model.missingOfficialSources.length >= 1);
  assert.match(model.trustScoreBasis, /not an evidence quality grade/i);
});

test("research workspace facets cover mission and open science", () => {
  const topic = RESEARCH_TOPICS[0];
  const facets = buildResearchWorkspaceFacets(topic);
  const labels = facets.map((f) => f.label);
  assert.ok(labels.includes("Evidence"));
  assert.ok(labels.includes("Mission Workspace"));
  assert.ok(labels.includes("Open Science workflow"));
});

test("planned connector copy is professional, not generic filler", () => {
  const text = plainMissingReason("Connector planned");
  assert.ok(text);
  assert.doesNotMatch(text!, /^The official source is planned but not available yet\.$/);
  assert.match(text!, /Planned|Awaiting official source/i);
});
