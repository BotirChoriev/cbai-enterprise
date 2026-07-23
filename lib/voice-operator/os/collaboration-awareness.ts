/**
 * Digital Assistant collaboration awareness — org-isolated summaries and intents.
 * Does not add a second voice backend; extends OS intent routing only.
 */

import { buildCollaborationAssistantSnapshot } from "@/lib/enterprise-collaboration/assistant-context";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";

export type CollaborationAwarenessResult = {
  readonly assistantText: string;
  readonly href: string;
};

function normalize(raw: string): string {
  return raw.trim().toLowerCase();
}

export function detectCollaborationAwarenessIntent(raw: string): CollaborationAwarenessResult | null {
  const text = normalize(raw);
  const wantsCollab =
    /\b(collaboration|collaborat|organization context|org context|my (approvals?|reviews?|mentions?|notifications?)|pending approvals?|unread notifications?|assigned reviews?|who is assigned|current organization|current workspace|current mission)\b/i.test(
      text,
    );
  if (!wantsCollab) return null;

  const userId = resolveActorId();
  const snap = buildCollaborationAssistantSnapshot(userId);

  if (/\bapprovals?\b/.test(text)) {
    return {
      assistantText: `${snap.summary}\n\nPending approvals assigned to you: ${snap.pendingApprovals}.\n${snap.isolationNote}`,
      href: "/approvals",
    };
  }
  if (/\breviews?\b/.test(text)) {
    return {
      assistantText: `${snap.summary}\n\nAssigned reviews: ${snap.assignedReviews}.\n${snap.isolationNote}`,
      href: "/reviews",
    };
  }
  if (/\bmentions?\b/.test(text)) {
    return {
      assistantText: `${snap.summary}\n\nUnread mentions: ${snap.unreadMentions}.\n${snap.isolationNote}`,
      href: "/notifications",
    };
  }
  if (/\bnotifications?\b/.test(text)) {
    return {
      assistantText: `${snap.summary}\n\nUnread notifications: ${snap.unreadNotifications}.\n${snap.isolationNote}`,
      href: "/notifications",
    };
  }

  return {
    assistantText: [
      "Collaboration context (your organizations only):",
      snap.summary,
      snap.isolationNote,
      snap.assignees.length > 0
        ? `Known assignees in visible collaborations: ${snap.assignees.slice(0, 8).join(", ")}`
        : "No collaboration assignees in the current mission scope.",
    ].join("\n"),
    href: "/enterprise",
  };
}
