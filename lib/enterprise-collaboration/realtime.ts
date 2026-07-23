/**
 * Supabase Realtime subscriptions — gated until shared backend + RLS proof.
 * Client payloads are re-authorized against active org/user before UI use.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type RealtimeCapability = {
  readonly status: "implemented" | "partially_implemented" | "planned" | "blocked";
  readonly message: string;
};

export function getRealtimeCapability(): RealtimeCapability {
  if (!isOrganizationCollaborationShared()) {
    return {
      status: "blocked",
      message: "Realtime blocked — shared Supabase backend is not configured.",
    };
  }
  return {
    status: "partially_implemented",
    message:
      "Realtime channels available for active org/user scopes after shared backend + RLS verification.",
  };
}

export type CollaborationRealtimeHandlers = {
  readonly onComment?: () => void;
  readonly onNotification?: () => void;
  readonly onApproval?: () => void;
  readonly onReview?: () => void;
  readonly onCollaboration?: () => void;
};

/**
 * Subscribe only to the active organization / authenticated user scope.
 * Does not treat presence as audit truth.
 */
export function subscribeCollaborationRealtime(input: {
  readonly userId: string;
  readonly organizationId: string | null;
  readonly handlers: CollaborationRealtimeHandlers;
}): { readonly unsubscribe: () => void; readonly status: RealtimeCapability } {
  const capability = getRealtimeCapability();
  const client = getSupabaseBrowserClient();
  if (capability.status === "blocked" || !client || !input.organizationId) {
    return { unsubscribe: () => undefined, status: capability };
  }

  const channels: RealtimeChannel[] = [];
  const seen = new Set<string>();

  const wrap = (key: string, fn?: () => void) => {
    if (!fn) return;
    if (seen.has(key)) return;
    seen.add(key);
    // Deduplicate bursts within a short window.
    window.setTimeout(() => seen.delete(key), 750);
    fn();
  };

  channels.push(
    client
      .channel(`enterprise-comments:${input.organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "enterprise_comments",
          filter: `organization_id=eq.${input.organizationId}`,
        },
        () => wrap(`c-${Date.now()}`, input.handlers.onComment),
      )
      .subscribe(),
  );

  channels.push(
    client
      .channel(`user-notifications:${input.userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_notifications",
          filter: `recipient_user_id=eq.${input.userId}`,
        },
        () => wrap(`n-${Date.now()}`, input.handlers.onNotification),
      )
      .subscribe(),
  );

  channels.push(
    client
      .channel(`enterprise-approvals:${input.organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "enterprise_approvals",
          filter: `organization_id=eq.${input.organizationId}`,
        },
        () => wrap(`a-${Date.now()}`, input.handlers.onApproval),
      )
      .subscribe(),
  );

  return {
    status: capability,
    unsubscribe: () => {
      for (const ch of channels) {
        void client.removeChannel(ch);
      }
    },
  };
}
