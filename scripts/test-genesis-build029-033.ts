// BUILD-029 through BUILD-033 integration tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { clearOrganizationsForTests } from "@/lib/organization-os/organization-store";
import {
  createOrganizationWithOwner,
  inviteOrganizationMember,
  acceptOrganizationInvitationByToken,
  clearOrganizationMembershipForTests,
} from "@/lib/organization-os/organization-membership-store";
import { clearOrganizationAuditForTests } from "@/lib/organization-os/organization-audit-store";
import { authorizeOrganizationAction } from "@/lib/organization-os/authorization-policy";
import { evaluateOrganizationPermission } from "@/lib/organization-os/permissions-service";
import {
  createLivingRelationship,
  clearLivingRelationshipsForTests,
} from "@/lib/living-object-network/living-relationship-store";
import { backfillLivingRelationships } from "@/lib/living-object-network/living-relationship-backfill";
import { resolveLivingObject } from "@/lib/living-object-network/living-object-resolver";
import { isValidRelationshipPair } from "@/lib/living-object-network/living-relationship-validation";
import {
  createMissionCollaboration,
  inviteCollaborationParticipant,
  acceptCollaborationInvite,
  shareObjectInCollaboration,
  revokeSharedObject,
  loadSharedObjects,
  loadCollaborationParticipants,
  clearCollaborationForTests,
} from "@/lib/collaboration/collaboration-store";
import { buildLivingGraphProjection } from "@/lib/living-graph/living-graph-projection";
import { deriveKnowledgeTrustState } from "@/lib/intelligence-os/trust-derivation";
import { clearSavedKnowledgeSourcesForTests, saveKnowledgeSourceFromCanonical } from "@/lib/knowledge-ingestion/saved-source-store";
import type { CanonicalKnowledgeSource } from "@/lib/knowledge-connectors/types";

function fixtureSource(): CanonicalKnowledgeSource {
  return {
    id: "cr-1",
    canonicalId: "10.5555/genesis.test",
    provider: "crossref",
    sourceType: "article",
    title: "Genesis test source",
    subtitle: null,
    authors: ["A Author"],
    publicationDate: "2024-01-01",
    retrievedAt: new Date().toISOString(),
    landingPageUrl: "https://doi.org/10.5555/genesis.test",
    openAccessUrl: null,
    identifiers: [{ scheme: "doi", value: "10.5555/genesis.test" }],
    provenance: {
      provider: "crossref",
      providerRecordId: "cr-1",
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
  };
}

test("ORG-T001 organization creation assigns owner membership", () => {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  clearOrganizationAuditForTests();
  const { organization, membership } = createOrganizationWithOwner({
    name: "Test Lab",
    kind: "independent_laboratory",
    ownerUserId: "user-a",
    ownerDisplayName: "User A",
  });
  assert.equal(organization.identityKind, "workspace_organization");
  assert.equal(membership.role, "owner");
  assert.equal(evaluateOrganizationPermission("user-a", organization.id, "edit_organization"), true);
});

test("ORG-T002 invitation accept grants role; guest cannot edit", () => {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  clearOrganizationAuditForTests();
  const { organization } = createOrganizationWithOwner({
    name: "Invite Org",
    kind: "other",
    ownerUserId: "user-a",
    ownerDisplayName: "User A",
  });
  const inv = inviteOrganizationMember({
    organizationId: organization.id,
    inviterId: "user-a",
    inviterDisplayName: "User A",
    inviteeEmail: "b@test.local",
    role: "researcher",
  });
  assert.ok(!("error" in inv));
  if ("error" in inv) return;
  const member = acceptOrganizationInvitationByToken(inv.rawToken, "user-b", "User B", "b@test.local");
  assert.ok(!("error" in member));
  if ("error" in member) return;
  assert.equal(member.role, "researcher");
  assert.equal(evaluateOrganizationPermission("user-b", organization.id, "edit_organization"), false);
  assert.equal(evaluateOrganizationPermission("user-b", organization.id, "add_evidence"), true);
});

test("ORG-T003 authorization policy blocks non-member", () => {
  const result = authorizeOrganizationAction({
    actorId: "stranger",
    organizationId: "org-missing",
    action: "organization.view",
  });
  assert.equal(result.ok, false);
});

test("LON-T001 invalid relationship pairs rejected", () => {
  assert.equal(isValidRelationshipPair("supports", "organization", "claim"), false);
  assert.equal(isValidRelationshipPair("member_of", "user", "organization"), true);
});

test("LON-T002 saved source resolves in living object resolver", () => {
  clearSavedKnowledgeSourcesForTests();
  clearLivingRelationshipsForTests();
  const saved = saveKnowledgeSourceFromCanonical(fixtureSource());
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  const resolved = resolveLivingObject({ objectType: "source", objectId: saved.source.id }, "user-a");
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.object.label, "Genesis test source");
});

test("LON-T003 backfill is idempotent", () => {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  clearLivingRelationshipsForTests();
  createOrganizationWithOwner({
    name: "Backfill Org",
    kind: "other",
    ownerUserId: "user-a",
    ownerDisplayName: "User A",
  });
  const first = backfillLivingRelationships("user-a");
  const second = backfillLivingRelationships("user-a");
  assert.ok(first.relationshipsCreated >= 1);
  assert.equal(second.skipped >= first.relationshipsCreated, true);
});

test("COL-T001 collaboration share and revoke boundaries", () => {
  clearCollaborationForTests();
  clearLivingRelationshipsForTests();
  const collab = createMissionCollaboration({
    missionId: "mission-1",
    createdBy: "user-a",
    title: "Review collaboration",
  });
  assert.ok(!("error" in collab));
  if ("error" in collab) return;

  inviteCollaborationParticipant({
    collaborationId: collab.id,
    invitedBy: "user-a",
    participantId: "user-b",
    role: "reviewer",
  });
  const participants = loadCollaborationParticipants(collab.id);
  const invited = participants.find((p) => p.participantId === "user-b");
  const p = acceptCollaborationInvite(collab.id, "user-b", invited?.version ?? 1);
  assert.ok(!("error" in p));

  clearSavedKnowledgeSourcesForTests();
  const saved = saveKnowledgeSourceFromCanonical(fixtureSource());
  if (!saved.ok) return;

  const shared = shareObjectInCollaboration({
    collaborationId: collab.id,
    sharedBy: "user-a",
    object: { objectType: "source", objectId: saved.source.id },
    access: "view",
  });
  assert.ok(!("error" in shared));
  assert.equal(loadSharedObjects(collab.id, "user-b").length, 1);

  if (!("error" in shared)) {
    revokeSharedObject(shared.id, "user-a");
    assert.equal(loadSharedObjects(collab.id, "user-b").length, 0);
  }
});

test("GRAPH-T001 every edge maps to relationship record", () => {
  clearLivingRelationshipsForTests();
  clearCollaborationForTests();
  clearSavedKnowledgeSourcesForTests();
  const saved = saveKnowledgeSourceFromCanonical(fixtureSource());
  if (!saved.ok) return;
  const collab = createMissionCollaboration({
    missionId: "m-graph",
    createdBy: "user-a",
    title: "Graph test collab",
  });
  if ("error" in collab) return;
  createLivingRelationship({
    source: { objectType: "source", objectId: saved.source.id },
    target: { objectType: "collaboration", objectId: collab.id },
    relationshipType: "shared_with",
    createdBy: "user-a",
    missionId: "m-graph",
    collaborationId: collab.id,
  });
  const projection = buildLivingGraphProjection({
    missionId: "m-graph",
    collaborationId: collab.id,
    actorId: "user-a",
  });
  assert.equal(projection.edges.length, 1);
  assert.ok(projection.edges[0]!.relationshipId);
});

test("TRUST-T001 unified trust entry delegates without numeric score", () => {
  const saved = saveKnowledgeSourceFromCanonical(fixtureSource());
  if (!saved.ok) return;
  const trust = deriveKnowledgeTrustState({ kind: "saved_source", source: saved.source });
  assert.ok(typeof trust.state === "string");
  assert.ok(!JSON.stringify(trust).match(/\d+\.\d+%/));
});
