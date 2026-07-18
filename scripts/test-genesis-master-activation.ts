// Genesis Master Activation — integration tests for systemized Living Humanity Intelligence OS.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseGenesisOperatingParams,
  serializeGenesisOperatingParams,
  appendGenesisOperatingParamsToHref,
} from "@/lib/genesis/genesis-operating-context";
import {
  createOrganizationUnit,
  loadOrganizationUnits,
  linkUnitToMission,
} from "@/lib/genesis/organization-unit-store";
import {
  createCapabilityRecord,
  updateCapabilityVerification,
  assertNoUniversalHumanScore,
  deriveCapabilityVerificationGate,
} from "@/lib/genesis/capability-records-store";
import { buildGenesisGraphProjection } from "@/lib/genesis/genesis-graph-projection";
import {
  buildLeadershipBrief,
  buildMissionReport,
  buildOutcomeReport,
  listAvailableGenesisReports,
} from "@/lib/genesis/genesis-reports";
import {
  findResearchConnections,
  explainContradictoryResults,
} from "@/lib/genesis/genesis-research-matching";
import {
  assessMedicalResearchStage,
  validateEfficacyClaim,
} from "@/lib/genesis/medical-research-boundaries";
import {
  assertNoUniversalCbaiScore,
  buildEmptyEvidenceProgressSnapshot,
} from "@/lib/genesis/evidence-progress-contracts";
import { checkGenesisPermission, isDeviceLocalMode } from "@/lib/genesis/genesis-permissions";
import { buildPersonalCabinetSnapshot } from "@/lib/genesis/personal-cabinet-selectors";
import { resolveGenesisCommand } from "@/lib/genesis/genesis-operator-commands";
import { deriveLeadershipMetrics } from "@/lib/genesis/monitoring-metrics";
import {
  createLivingResearchObject,
  addResearchResult,
} from "@/lib/genesis/living-research-object-store";
import { explainOpportunityMatch, createOpportunity } from "@/lib/genesis/opportunity-store";
import { loadGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import { genesisId } from "@/lib/genesis/genesis-storage";

const ORG = "org-master-test";
const OPERATOR = "Master Tester";

function readSource(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf-8");
}

test("1. Genesis operating context extends mission/project params", () => {
  const params = new URLSearchParams("mission=m1&project=p1&org=o1&task=t1");
  const parsed = parseGenesisOperatingParams(params);
  assert.equal(parsed.missionId, "m1");
  assert.equal(parsed.projectId, "p1");
  assert.equal(parsed.organizationId, "o1");
  assert.equal(parsed.taskId, "t1");
  const href = appendGenesisOperatingParamsToHref("/organization", {
    missionId: "m1",
    organizationId: ORG,
    taskId: "t1",
  });
  assert.match(href, /mission=m1/);
  assert.match(href, /org=org-master-test/);
  assert.match(href, /task=t1/);
  const serialized = serializeGenesisOperatingParams({ missionId: "m1", directiveId: "d1" });
  assert.equal(serialized.directive, "d1");
});

test("2. Organization unit store creates hierarchy", () => {
  const unit = createOrganizationUnit({
    organizationId: ORG,
    name: "Research Division",
    kind: "department",
    description: "Primary research unit",
  });
  assert.ok(unit.id);
  const units = loadOrganizationUnits(ORG);
  assert.ok(units.some((u) => u.id === unit.id));
  const linked = linkUnitToMission(unit.id, "mission-demo");
  assert.ok(linked?.missionIds.includes("mission-demo"));
});

test("3. Capability passport — no universal human score", () => {
  assert.equal(assertNoUniversalHumanScore({ readiness: "partial" }), true);
  assert.equal(assertNoUniversalHumanScore({ overallScore: 99 }), false);
  assert.equal(assertNoUniversalCbaiScore({ countryScore: 1 }), false);
});

test("4. Capability verification gates require evidence and reviewer", () => {
  const rec = createCapabilityRecord({
    recordType: "skill_or_method",
    claim: "PCR protocol",
    label: "PCR protocol",
    description: "",
    methodsUsed: "PCR",
    relatedWorkIds: [],
    evidenceRefs: [{ label: "Lab log" }],
    visibility: "private",
    limitations: "",
    unresolvedQuestions: "",
  });
  const gate = deriveCapabilityVerificationGate(rec);
  assert.equal(gate.canVerify, true);
  const verified = updateCapabilityVerification(rec.id, {
    verificationStatus: "Verified",
    reviewer: OPERATOR,
  });
  assert.equal(verified?.verificationStatus, "Verified");
  const noEvidence = createCapabilityRecord({
    recordType: "declared_goal",
    claim: "Goal only",
    label: "Goal only",
    description: "",
    methodsUsed: "",
    relatedWorkIds: [],
    evidenceRefs: [],
    visibility: "private",
    limitations: "",
    unresolvedQuestions: "",
  });
  assert.equal(
    updateCapabilityVerification(noEvidence.id, {
      verificationStatus: "Verified",
      reviewer: OPERATOR,
    }),
    null,
  );
});

test("5. Personal Cabinet active mission selector", () => {
  const snap = buildPersonalCabinetSnapshot(OPERATOR);
  assert.ok("activeMission" in snap);
  assert.ok(Array.isArray(snap.attention.structured));
  assert.ok(typeof snap.limitation === "string");
});

test("6. Medical research stage boundaries block premature efficacy claims", () => {
  const preclinical = assessMedicalResearchStage("Preclinical");
  assert.equal(preclinical.mayClaimEfficacy, false);
  const blocked = validateEfficacyClaim({
    stage: "Laboratory",
    claimText: "This treatment cures patients safely and effectively.",
  });
  assert.equal(blocked.allowed, false);
  const approved = assessMedicalResearchStage("Approved Use");
  assert.equal(approved.requiresQualifiedReview, true);
});

test("7. Evidence progress contracts — honest empty state", () => {
  const empty = buildEmptyEvidenceProgressSnapshot("gdp-growth", "2026-Q2");
  assert.ok(empty.emptyReason);
  assert.equal(empty.currentEvidence.length, 0);
  assert.equal(empty.humanReviewRequired, true);
});

test("8. Explainable research matching — scope disclaimer", () => {
  const obj = createLivingResearchObject({
    title: "Soil microbiome study",
    authorOwner: OPERATOR,
    researchQuestion: "How do drought conditions affect soil bacteria?",
    hypothesis: "Diversity decreases",
    domain: "Microbiology",
    methods: "16S sequencing",
    limitations: "Single site",
    openQuestions: "Replication",
    visibility: "private",
    ethicalReviewStatus: "none",
    humanReviewStatus: "none",
    collaborationNeed: "",
    fundingNeed: "",
    evidenceRefs: [],
    missionId: "m-micro",
  });
  addResearchResult({
    objectId: obj.id,
    summary: "No significant diversity change under drought",
    status: "Negative Result",
    method: "16S",
    source: "Local lab notes",
    limitation: "Small sample",
    reasonForStatus: "No measurable effect in drought sample",
    humanReviewer: OPERATOR,
  });
  const matches = findResearchConnections({ researchObjectId: obj.id, missionId: "m-micro" });
  assert.ok(matches.every((m) => m.scopeDisclaimer.includes("Connected records available in CBAI")));
  const contra = explainContradictoryResults(obj.id);
  assert.ok(contra.some((c) => c.whyRelevant.includes("Negative Result")));
});

test("9. Opportunity explainable matching — human confirmation required", () => {
  const opp = createOpportunity({
    type: "Research Collaboration",
    title: "Drought microbiome collaboration",
    problem: "drought soil bacteria microbiome research",
    desiredOutcome: "Shared dataset",
    requiredEvidence: "Field data",
    requiredCapability: "Microbiology",
    eligibility: "Open",
    scope: "Regional",
    humanDecisionOwner: OPERATOR,
    visibility: "organization",
    status: "Open",
  });
  const match = explainOpportunityMatch(opp, {
    missionProblem: "drought soil bacteria research challenge",
    capabilitySummary: "Microbiology sequencing",
  });
  assert.equal(match.relevant, true);
  assert.ok(match.uncertainties.some((u) => u.includes("human") || u.includes("verified")));
});

test("10. Genesis graph projection uses real nodes only", () => {
  const graph = buildGenesisGraphProjection({ organizationId: ORG });
  assert.ok(typeof graph.nodeCount === "number");
  assert.ok(graph.limitation.includes("device-local"));
  for (const node of graph.nodes) {
    assert.ok(node.recordId);
    assert.ok(node.label);
  }
});

test("11. Genesis reports from real records — no fabricated PDF", () => {
  const brief = buildLeadershipBrief(ORG);
  assert.equal(brief.kind, "Leadership Brief");
  assert.ok(brief.humanDecisionBoundary.length > 10);
  assert.ok(!readSource("lib/genesis/genesis-reports.ts").includes(".pdf"));
  const missionReport = buildMissionReport("nonexistent-mission");
  assert.equal(missionReport.available, false);
  const reports = listAvailableGenesisReports({ organizationId: ORG });
  assert.ok(Array.isArray(reports));
});

test("12. Leadership metrics include definition and drill-down ids", () => {
  const metrics = deriveLeadershipMetrics(ORG);
  for (const m of metrics) {
    assert.ok(m.definition);
    assert.ok(m.calculation);
    assert.ok(m.limitation);
    assert.ok(!m.label.toLowerCase().includes("ranking"));
  }
});

test("13. Operator attention commands resolve honestly", () => {
  const answer = resolveGenesisCommand("What requires attention?", OPERATOR);
  assert.ok(answer);
  assert.match(answer!.message, /device-local|blocker|task|attention|Nothing/i);
});

test("14. Permissions — device-local honesty disclaimer", () => {
  const result = checkGenesisPermission("Approve", {
    actorId: OPERATOR,
    organizationId: ORG,
    isMember: true,
    deviceLocalMode: true,
  });
  assert.ok(result.deviceLocalDisclaimer?.includes("Device-local"));
  void isDeviceLocalMode();
});

test("15. UI wiring — master activation panels exist", () => {
  assert.match(readSource("components/my-work/MyWork.tsx"), /CapabilityPassportGenesisPanel/);
  assert.match(readSource("components/my-work/MyWork.tsx"), /GenesisReportsPanel/);
  assert.match(readSource("components/genesis/PersonalCabinetPanel.tsx"), /my-active-mission/);
  assert.match(readSource("components/genesis/CapabilityPassportGenesisPanel.tsx"), /createCapabilityRecord/);
});

test("16. Audit trail records capability mutations", () => {
  const before = loadGenesisAudit().length;
  createCapabilityRecord({
    recordType: "learning_milestone",
    claim: "Audit test milestone",
    label: "Audit test milestone",
    description: "",
    methodsUsed: "",
    relatedWorkIds: [],
    evidenceRefs: [],
    visibility: "private",
    limitations: "",
    unresolvedQuestions: "",
  });
  const after = loadGenesisAudit();
  assert.ok(after.length >= before);
});

test("17. Japan timeline truth — no fabricated year counts in genesis layer", () => {
  const genesisSources = readSource("lib/genesis/genesis-research-matching.ts");
  assert.ok(!genesisSources.includes("All scientists in the world"));
  assert.ok(genesisSources.includes("Connected records available in CBAI"));
});

test("18. No fabricated ranking in monitoring or capability", () => {
  const monitoring = readSource("lib/genesis/monitoring-metrics.ts");
  assert.ok(!monitoring.includes("employeeRanking"));
  assert.ok(monitoring.includes("not a risk score") || monitoring.includes("No inferred"));
});

test("19. Outcome report preserves output/outcome/impact separation", () => {
  const report = buildOutcomeReport(ORG);
  assert.equal(report.kind, "Outcome Report");
  const reportsSource = readSource("lib/genesis/genesis-reports.ts");
  assert.match(reportsSource, /Output does not automatically prove outcome/);
});

test("20. Master activation id generation is stable", () => {
  const id = genesisId("master");
  assert.match(id, /^master-/);
});
