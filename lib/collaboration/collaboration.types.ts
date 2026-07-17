/** BUILD-030B — Mission-centered collaboration contracts. */

import type { LivingObjectReference } from "@/lib/living-object-network/living-object.types";

export type CollaborationStatus =
  | "draft"
  | "inviting"
  | "active"
  | "paused"
  | "completed"
  | "revoked"
  | "archived";

export type CollaborationVisibility =
  | "private"
  | "invited_participants"
  | "organization"
  | "explicitly_public";

export type MissionCollaboration = {
  readonly id: string;
  readonly missionId: string;
  readonly ownerOrganizationId?: string | null;
  readonly createdBy: string;
  readonly title: string;
  readonly description?: string | null;
  readonly status: CollaborationStatus;
  readonly visibility: CollaborationVisibility;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CollaborationParticipantRole =
  | "owner"
  | "lead"
  | "contributor"
  | "reviewer"
  | "observer";

export type CollaborationParticipantStatus =
  | "invited"
  | "active"
  | "declined"
  | "expired"
  | "revoked"
  | "left";

export type CollaborationParticipant = {
  readonly id: string;
  readonly collaborationId: string;
  readonly participantType: "user" | "organization";
  readonly participantId: string;
  readonly role: CollaborationParticipantRole;
  readonly status: CollaborationParticipantStatus;
  readonly invitedBy: string;
  readonly invitedAt: string;
  readonly acceptedAt?: string | null;
  readonly revokedAt?: string | null;
  readonly version: number;
};

export type CollaborationShareScope = "none" | "selected" | "all";

export type CollaborationSharePolicy = {
  readonly missionSummary: boolean;
  readonly researchQuestions: CollaborationShareScope;
  readonly sources: CollaborationShareScope;
  readonly evidence: CollaborationShareScope;
  readonly claims: CollaborationShareScope;
  readonly notes: CollaborationShareScope;
  readonly findings: CollaborationShareScope;
  readonly reports: CollaborationShareScope;
  readonly impactReviews: CollaborationShareScope;
};

export type SharedLivingObject = {
  readonly id: string;
  readonly collaborationId: string;
  readonly object: LivingObjectReference;
  readonly sharedBy: string;
  readonly sharedAt: string;
  readonly access: "view" | "comment" | "contribute" | "review" | "edit";
  readonly status: "active" | "revoked" | "archived";
  readonly version: number;
};

export type CollaborationReviewAssignmentStatus =
  | "assigned"
  | "in_review"
  | "changes_requested"
  | "accepted"
  | "rejected"
  | "cancelled";

export type CollaborationReviewAssignment = {
  readonly id: string;
  readonly collaborationId: string;
  readonly object: LivingObjectReference;
  readonly assignedBy: string;
  readonly assignedTo: string;
  readonly status: CollaborationReviewAssignmentStatus;
  readonly dueAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
};

export const DEFAULT_SHARE_POLICY: CollaborationSharePolicy = {
  missionSummary: true,
  researchQuestions: "none",
  sources: "selected",
  evidence: "selected",
  claims: "none",
  notes: "none",
  findings: "none",
  reports: "none",
  impactReviews: "none",
};
