// EPIC-05 — Organization Operating System foundation verification.
// Run with: npm run test:epic-05-organization-os

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  deriveOrganizationWorkspace,
  deriveOrganizationObjectContract,
  deriveMissionRoom,
  deriveCapabilityRequirements,
  deriveOrganizationInspector,
  deriveKnowledgeDna,
  emptyMissionMarketplace,
  emptyDecisionLedger,
  emptyPermissionMatrix,
  DEVICE_LOCAL_CLOUD_ADAPTER,
  MISSION_DISCUSSION_RULES,
  KNOWLEDGE_CONTRIBUTION_RULES,
  KNOWLEDGE_DNA_RULES,
  EPIC_05_MATURITY,
  loadOrganizations,
  ORGANIZATION_KINDS,
  KNOWLEDGE_CONTRIBUTION_TYPES,
  PERMISSION_SCOPES,
} from "@/lib/organization-os";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

const sampleMission: Mission = {
  id: "m-epic05",
  problem: "Reduce hospital-acquired infections in regional clinics",
  whyExists: "Patient safety",
  whoBenefits: "Patients and clinical staff",
  whoCouldBeHarmed: "Patients if protocols are wrong",
  evidenceHave: "WHO guidelines",
  evidenceMissing: "Local surveillance data for two regions",
  disciplines: ["epidemiology"],
  capabilitiesNeeded: "Epidemiology expertise",
  environmentalImpact: "Minimal",
  successCriteria: "Documented evidence chain with impact review",
  projectId: "p-epic05",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test("1. Organization OS module exists with maturity flags", () => {
  assert.equal(EPIC_05_MATURITY.architecture, "foundation");
  assert.equal(EPIC_05_MATURITY.multiUser, false);
  assert.equal(EPIC_05_MATURITY.messaging, false);
  assert.equal(EPIC_05_MATURITY.fakeCollaborators, false);
});

test("2. Organization kinds include hospital, NGO, independent laboratory", () => {
  assert.ok(ORGANIZATION_KINDS.includes("hospital"));
  assert.ok(ORGANIZATION_KINDS.includes("ngo"));
  assert.ok(ORGANIZATION_KINDS.includes("independent_laboratory"));
});

test("3. Organization store empty by default — no fabricated orgs", () => {
  assert.deepEqual(loadOrganizations(), []);
});

test("4. Mission Room derives eight sections from real mission data", () => {
  const room = deriveMissionRoom(sampleMission);
  assert.equal(room.sections.length, 8);
  assert.equal(room.cloudCollaborationConnected, false);
  assert.match(room.limitation, /single-operator|not connected/i);
});

test("5. Mission discussion requires anchor — no standalone messaging", () => {
  assert.equal(MISSION_DISCUSSION_RULES.standaloneMessaging, false);
  assert.equal(MISSION_DISCUSSION_RULES.genericChatRooms, false);
  assert.equal(MISSION_DISCUSSION_RULES.requiredAnchor, true);
});

test("6. Decision ledger empty with honest limitation", () => {
  const ledger = emptyDecisionLedger();
  assert.equal(ledger.entries.length, 0);
  assert.equal(ledger.cloudPersisted, false);
});

test("7. Knowledge contribution — no gamification", () => {
  assert.equal(KNOWLEDGE_CONTRIBUTION_RULES.points, false);
  assert.equal(KNOWLEDGE_CONTRIBUTION_RULES.rankings, false);
  assert.equal(KNOWLEDGE_CONTRIBUTION_TYPES.length, 10);
});

test("8. Knowledge DNA excludes prestige and title evaluations", () => {
  assert.equal(KNOWLEDGE_DNA_RULES.evaluatesPrestige, false);
  assert.equal(KNOWLEDGE_DNA_RULES.evaluatesTitle, false);
  const dna = deriveKnowledgeDna("operator", buildCapabilityPassport("Operator"));
  assert.ok(dna.excludedEvaluations.includes("prestige"));
  assert.ok(dna.excludedEvaluations.includes("job title"));
});

test("9. Mission marketplace empty — architecture only", () => {
  const market = emptyMissionMarketplace();
  assert.equal(market.listings.length, 0);
  assert.equal(market.externalMarketplaceConnected, false);
});

test("10. Capability matching never recommends people", () => {
  const match = deriveCapabilityRequirements(sampleMission);
  assert.equal(match.recommendsPeople, false);
  assert.equal(match.externalMatchingConnected, false);
  assert.ok(match.requirements.length > 0);
  assert.match(match.explanation, /lack|gap|documented/i);
});

test("11. Organization inspector derives from mission without fabrication", () => {
  const inspector = deriveOrganizationInspector(sampleMission);
  assert.match(inspector.missionHealth, /Reduce hospital-acquired/);
  assert.ok(Array.isArray(inspector.unknowns));
});

test("12. Permissions matrix architecture-only", () => {
  const matrix = emptyPermissionMatrix();
  assert.equal(matrix.authConnected, false);
  assert.equal(PERMISSION_SCOPES.length, 8);
});

test("13. Cloud adapter honest — not connected", async () => {
  assert.equal(DEVICE_LOCAL_CLOUD_ADAPTER.connected, false);
  const result = await DEVICE_LOCAL_CLOUD_ADAPTER.pushOrganization({
    id: "org-test",
    name: "Test Lab",
    kind: "independent_laboratory",
    missionStatement: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    maturity: "architecture_only",
  });
  assert.equal(result.ok, false);
});

test("14. Organization inspector panel wired on Trust page", () => {
  const trust = readSource("components/trust/TrustPageClient.tsx");
  assert.match(trust, /OrganizationInspectorPanel/);
});

test("15. Design constitution includes Organization Intelligence section", () => {
  const doc = readSource("docs/product/CBAI-LIVING-INTELLIGENCE-DESIGN-CONSTITUTION.md");
  assert.match(doc, /Organization Intelligence/);
  assert.match(doc, /Decision Memory/);
  assert.match(doc, /Capability Discovery/);
});

test("16. BUILD-019 i18n in all four active languages", () => {
  for (const dict of [en, uz, ru, tr]) {
    assert.ok(dict.organizationOs.inspectorEyebrow);
    assert.ok(dict.organizationOs.noPeopleRecommended);
    assert.ok(dict.organizationOs.cloudNotConnected);
  }
});

test("17. Organization workspace honest when no org configured", () => {
  const ws = deriveOrganizationWorkspace();
  assert.equal(ws.cloudSyncConnected, false);
  const contract = deriveOrganizationObjectContract();
  assert.ok(contract.mission === null || typeof contract.mission === "string");
});
