// BUILD-034 through BUILD-038 integration and security tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { clearOrganizationsForTests } from "@/lib/organization-os/organization-store";
import {
  acceptOrganizationInvitationByToken,
  createOrganizationWithOwner,
  inviteOrganizationMember,
  clearOrganizationMembershipForTests,
  loadInvitationByToken,
} from "@/lib/organization-os/organization-membership-store";
import { clearOrganizationAuditForTests, loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { hashInvitationTokenSync } from "@/lib/organization-os/invitation-token";
import { detectPersistenceCapability, resolvePersistenceStatus } from "@/lib/persistence/persistence-capability";
import { DeviceLocalOrganizationRepository } from "@/lib/persistence/device-local-organization-adapter";
import {
  assignCollaborationReview,
  clearCollaborationForTests,
  completeCollaborationReview,
  createMissionCollaboration,
  inviteCollaborationParticipant,
  acceptCollaborationInvite,
  shareObjectInCollaboration,
  revokeSharedObject,
  loadSharedObjects,
  revokeCollaborationParticipant,
} from "@/lib/collaboration/collaboration-store";
import { clearCollaborationAuditForTests, loadCollaborationAudit } from "@/lib/collaboration/collaboration-audit-store";
import {
  clearNotificationsForTests,
  countUnreadNotifications,
  loadUserNotifications,
} from "@/lib/notifications/user-notification-store";
import { clearLivingRelationshipsForTests, createLivingRelationship } from "@/lib/living-object-network/living-relationship-store";
import { buildLivingGraphProjection } from "@/lib/living-graph/living-graph-projection";
import { authorizeOrganizationAction } from "@/lib/organization-os/authorization-policy";
import { clearSavedKnowledgeSourcesForTests, saveKnowledgeSourceFromCanonical } from "@/lib/knowledge-ingestion/saved-source-store";
import type { CanonicalKnowledgeSource } from "@/lib/knowledge-connectors/types";

function fixtureSource(): CanonicalKnowledgeSource {
  return {
    id: "cr-b038",
    canonicalId: "10.5555/build038.test",
    provider: "crossref",
    sourceType: "article",
    title: "Build038 test source",
    subtitle: null,
    authors: ["Author"],
    publicationDate: "2024-01-01",
    retrievedAt: new Date().toISOString(),
    landingPageUrl: "https://doi.org/10.5555/build038.test",
    openAccessUrl: null,
    identifiers: [{ scheme: "doi", value: "10.5555/build038.test" }],
    provenance: {
      provider: "crossref",
      providerRecordId: "cr-b038",
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

test("B034-T001 persistence capability is honest without env", () => {
  const capability = detectPersistenceCapability();
  assert.ok(
    capability === "shared_backend_not_configured" || capability === "shared_backend_misconfigured",
    `expected unconfigured dev, got ${capability}`,
  );
  const status = resolvePersistenceStatus();
  assert.equal(status.organizationCollaborationShared, false);
});

test("B034-T002 invitation stores hash not raw token", () => {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  clearOrganizationAuditForTests();
  const { organization } = createOrganizationWithOwner({
    name: "Hash Lab",
    kind: "other",
    ownerUserId: "user-a",
    ownerDisplayName: "User A",
  });
  const inv = inviteOrganizationMember({
    organizationId: organization.id,
    inviterId: "user-a",
    inviterDisplayName: "User A",
    inviteeEmail: "b@test.local",
    role: "member",
  });
  assert.ok(!("error" in inv));
  if ("error" in inv) return;
  assert.ok(inv.tokenHash.length >= 64);
  assert.equal(inv.token, undefined);
  assert.ok(inv.rawToken.startsWith("invtok-"));
  assert.equal(inv.tokenHash, hashInvitationTokenSync(inv.rawToken));
});

test("B034-T003 invitation token cannot be replayed", () => {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  clearOrganizationAuditForTests();
  const { organization } = createOrganizationWithOwner({
    name: "Replay Lab",
    kind: "other",
    ownerUserId: "user-a",
    ownerDisplayName: "User A",
  });
  const inv = inviteOrganizationMember({
    organizationId: organization.id,
    inviterId: "user-a",
    inviterDisplayName: "User A",
    inviteeEmail: "b@test.local",
    role: "member",
  });
  if ("error" in inv) return;
  const first = acceptOrganizationInvitationByToken(inv.rawToken, "user-b", "User B", "b@test.local");
  assert.ok(!("error" in first));
  const second = acceptOrganizationInvitationByToken(inv.rawToken, "user-c", "User C", "c@test.local");
  assert.ok("error" in second);
  const loaded = loadInvitationByToken(inv.rawToken);
  assert.equal(loaded?.status, "accepted");
});

test("B034-T004 device-local repository adapter labeled honestly", async () => {
  const repo = new DeviceLocalOrganizationRepository();
  assert.equal(repo.isShared, false);
  assert.equal(repo.adapterKind, "device_local");
  const orgs = await repo.listOrganizations("nobody");
  assert.equal(orgs.length, 0);
});

test("B035-T001 review assignment and notification lifecycle", () => {
  clearCollaborationForTests();
  clearCollaborationAuditForTests();
  clearNotificationsForTests();
  clearLivingRelationshipsForTests();
  clearSavedKnowledgeSourcesForTests();

  const collab = createMissionCollaboration({
    missionId: "m-review",
    createdBy: "user-a",
    title: "Review flow",
  });
  if ("error" in collab) return;

  inviteCollaborationParticipant({
    collaborationId: collab.id,
    invitedBy: "user-a",
    participantId: "user-b",
    role: "reviewer",
  });
  acceptCollaborationInvite(collab.id, "user-b", 1);

  const saved = saveKnowledgeSourceFromCanonical(fixtureSource());
  if (!saved.ok) return;

  shareObjectInCollaboration({
    collaborationId: collab.id,
    sharedBy: "user-a",
    object: { objectType: "source", objectId: saved.source.id },
    access: "view",
  });

  const assignment = assignCollaborationReview({
    collaborationId: collab.id,
    assignedBy: "user-a",
    assignedTo: "user-b",
    object: { objectType: "source", objectId: saved.source.id },
  });
  assert.ok(!("error" in assignment));
  if ("error" in assignment) return;

  assert.equal(countUnreadNotifications("user-b"), 3);
  const completed = completeCollaborationReview({
    assignmentId: assignment.id,
    actorId: "user-b",
    outcome: "accepted",
    expectedVersion: 1,
  });
  assert.ok(!("error" in completed));
  assert.ok(loadCollaborationAudit(collab.id).some((a) => a.event === "review_completed"));
});

test("B035-T002 revocation removes shared object access", () => {
  clearCollaborationForTests();
  clearNotificationsForTests();
  clearSavedKnowledgeSourcesForTests();

  const collab = createMissionCollaboration({
    missionId: "m-revoke",
    createdBy: "user-a",
    title: "Revoke flow",
  });
  if ("error" in collab) return;

  inviteCollaborationParticipant({
    collaborationId: collab.id,
    invitedBy: "user-a",
    participantId: "user-b",
    role: "reviewer",
  });
  acceptCollaborationInvite(collab.id, "user-b", 1);

  const saved = saveKnowledgeSourceFromCanonical(fixtureSource());
  if (!saved.ok) return;

  const shared = shareObjectInCollaboration({
    collaborationId: collab.id,
    sharedBy: "user-a",
    object: { objectType: "source", objectId: saved.source.id },
    access: "view",
  });
  if ("error" in shared) return;
  assert.equal(loadSharedObjects(collab.id, "user-b").length, 1);

  revokeSharedObject(shared.id, "user-a");
  assert.equal(loadSharedObjects(collab.id, "user-b").length, 0);

  revokeCollaborationParticipant({
    collaborationId: collab.id,
    actorId: "user-a",
    participantId: "user-b",
  });
  assert.ok(loadUserNotifications("user-b").some((n) => n.notificationType === "participant_revoked"));
});

test("B036-T001 graph filters unauthorized organization nodes", () => {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  clearLivingRelationshipsForTests();

  const { organization } = createOrganizationWithOwner({
    name: "Private Org",
    kind: "other",
    ownerUserId: "owner",
    ownerDisplayName: "Owner",
  });

  createLivingRelationship({
    source: { objectType: "organization", objectId: organization.id },
    target: { objectType: "mission", objectId: "m1" },
    relationshipType: "contains",
    createdBy: "owner",
    missionId: "m1",
    organizationId: organization.id,
  });

  const stranger = buildLivingGraphProjection({ missionId: "m1", actorId: "stranger" });
  assert.equal(stranger.nodes.some((n) => n.objectType === "organization"), false);
  assert.ok(stranger.filteredUnauthorizedCount >= 1);

  const member = buildLivingGraphProjection({ missionId: "m1", actorId: "owner" });
  assert.equal(member.nodes.some((n) => n.objectType === "organization"), true);
});

test("B037-T001 IDOR organization view blocked for non-member", () => {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  const { organization } = createOrganizationWithOwner({
    name: "Secure Org",
    kind: "other",
    ownerUserId: "owner",
    ownerDisplayName: "Owner",
  });
  const result = authorizeOrganizationAction({
    actorId: "intruder",
    organizationId: organization.id,
    action: "organization.view",
  });
  assert.equal(result.ok, false);
  assert.equal(result.ok ? null : result.code, "not_authorized");
});

test("B037-T002 audit trail records invitation acceptance", () => {
  clearOrganizationsForTests();
  clearOrganizationMembershipForTests();
  clearOrganizationAuditForTests();
  const { organization } = createOrganizationWithOwner({
    name: "Audit Org",
    kind: "other",
    ownerUserId: "user-a",
    ownerDisplayName: "User A",
  });
  const inv = inviteOrganizationMember({
    organizationId: organization.id,
    inviterId: "user-a",
    inviterDisplayName: "User A",
    inviteeEmail: "b@test.local",
    role: "member",
  });
  if ("error" in inv) return;
  acceptOrganizationInvitationByToken(inv.rawToken, "user-b", "User B", "b@test.local");
  const audit = loadOrganizationAudit(organization.id);
  assert.ok(audit.some((a) => a.event === "invitation_accepted"));
});
