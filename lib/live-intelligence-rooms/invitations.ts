/**
 * Invitation drafts — never send without explicit human confirmation.
 * Email/SMS delivery is unavailable unless a real provider exists (none in Preview).
 */

import type { AccessMode, LiveInvitationDraft } from "@/lib/live-intelligence-rooms/types";

export type InvitationChannel = LiveInvitationDraft["channel"];

export function channelDeliveryAvailable(channel: InvitationChannel): {
  readonly available: boolean;
  readonly reason: string | null;
} {
  if (channel === "link" || channel === "access_code" || channel === "qr") {
    return { available: true, reason: null };
  }
  if (channel === "email") {
    return {
      available: false,
      reason: "Email invitation delivery is not connected in this Preview. Draft and confirm only.",
    };
  }
  return {
    available: false,
    reason: "SMS invitation requires a connected provider. Not available in this Preview.",
  };
}

export function createInvitationDraft(input: {
  readonly channel: InvitationChannel;
  readonly recipientDisplay: string;
  readonly recipientContactPrivate?: string | null;
  readonly accessLevel: AccessMode;
  readonly expiresAt?: string | null;
}): LiveInvitationDraft {
  const delivery = channelDeliveryAvailable(input.channel);
  return {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    channel: input.channel,
    recipientDisplay: input.recipientDisplay.trim() || "Guest",
    recipientContactPrivate: input.recipientContactPrivate?.trim() || null,
    accessLevel: input.accessLevel,
    expiresAt: input.expiresAt ?? null,
    status: "draft",
    deliveryAvailable: delivery.available,
    deliveryUnavailableReason: delivery.reason,
    confirmedAt: null,
  };
}

export function confirmInvitationDraft(
  draft: LiveInvitationDraft,
  confirmation: {
    readonly reviewedRecipient: boolean;
    readonly reviewedChannel: boolean;
    readonly reviewedRoom: boolean;
    readonly reviewedAccessLevel: boolean;
    readonly reviewedExpiry: boolean;
  },
): LiveInvitationDraft | { error: string } {
  if (
    !confirmation.reviewedRecipient ||
    !confirmation.reviewedChannel ||
    !confirmation.reviewedRoom ||
    !confirmation.reviewedAccessLevel ||
    !confirmation.reviewedExpiry
  ) {
    return { error: "invitation_review_incomplete" };
  }
  if (draft.status !== "draft") {
    return { error: "invitation_not_draft" };
  }
  const nextStatus = draft.deliveryAvailable ? "confirmed_pending_delivery" : "confirmed_pending_delivery";
  return {
    ...draft,
    status: nextStatus,
    confirmedAt: new Date().toISOString(),
    // Never auto-mark as sent — no provider may fabricate delivery.
  };
}

/** Public participant summary — strips email/phone. */
export function participantPublicView(p: {
  readonly displayName: string;
  readonly role: string;
  readonly identityProvenance: string;
  readonly emailPrivate?: string | null;
  readonly phonePrivate?: string | null;
}): {
  readonly displayName: string;
  readonly role: string;
  readonly identityProvenance: string;
  readonly emailExposed: false;
  readonly phoneExposed: false;
} {
  return {
    displayName: p.displayName,
    role: p.role,
    identityProvenance: p.identityProvenance,
    emailExposed: false,
    phoneExposed: false,
  };
}

export function phoneRequiredForGuest(): false {
  return false;
}
