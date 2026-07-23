/**
 * Honest capability matrix for enterprise collaboration surfaces.
 */

import type { EnterpriseCapabilityStatus } from "@/lib/enterprise-collaboration/types";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";

export type EnterpriseCapabilityRow = {
  readonly id: string;
  readonly label: string;
  readonly status: EnterpriseCapabilityStatus;
  readonly note: string;
};

export function getEnterpriseCapabilityMatrix(): readonly EnterpriseCapabilityRow[] {
  const shared = isOrganizationCollaborationShared();
  return [
    {
      id: "auth",
      label: "Authentication",
      status: "implemented",
      note: "Local device auth and optional Supabase Auth when configured.",
    },
    {
      id: "rbac",
      label: "RBAC",
      status: "partially_implemented",
      note: "Role matrix enforced in organization-os and approval/comment gates; not all product surfaces call it yet.",
    },
    {
      id: "org-isolation",
      label: "Organization isolation",
      status: "partially_implemented",
      note: shared
        ? "Shared org session active — RLS designed; verify with live multi-user env."
        : "Device-local membership checks enforced in enterprise stores; cloud cross-device isolation requires shared backend.",
    },
    {
      id: "comments",
      label: "Comments",
      status: "partially_implemented",
      note: "Organization-scoped comment store + UI centers; cloud persistence planned in migration 0009.",
    },
    {
      id: "mentions",
      label: "Mentions",
      status: "partially_implemented",
      note: "@userId mentions within the same organization; no email delivery.",
    },
    {
      id: "assignments",
      label: "Assignments",
      status: "partially_implemented",
      note: "Collaboration review assignments + approval assignees exist; team task board incomplete.",
    },
    {
      id: "notifications",
      label: "Notifications",
      status: "partially_implemented",
      note: "In-app notification store + Notification Center; push/email delivery missing.",
    },
    {
      id: "approvals",
      label: "Approval workflow",
      status: "partially_implemented",
      note: "Request/decide flow with RBAC on approve_internal_review; not wired to every mission object.",
    },
    {
      id: "audit",
      label: "Audit log",
      status: "partially_implemented",
      note: "Organization + collaboration audit stores; Activity Center aggregates membership-scoped events.",
    },
    {
      id: "realtime",
      label: "Realtime team updates",
      status: isOrganizationCollaborationShared() ? "partially_implemented" : "blocked",
      note: isOrganizationCollaborationShared()
        ? "Realtime module wired for org/user scopes — requires live RLS proof before claiming Implemented."
        : "Blocked — shared Supabase backend not configured in this environment.",
    },
    {
      id: "cloud-collab-repo",
      label: "Supabase collaboration repository",
      status: "partially_implemented",
      note: "Factory selects SupabaseCollaborationRepository when shared backend is ready; live apply still required.",
    },
    {
      id: "billing",
      label: "Billing / usage limits",
      status: "missing",
      note: "No plans, seats, meters, or Stripe integration.",
    },
  ];
}

export function realtimeCollaborationStatus(): {
  readonly status: EnterpriseCapabilityStatus;
  readonly message: string;
} {
  if (!isOrganizationCollaborationShared()) {
    return {
      status: "blocked",
      message: "Realtime blocked — shared Supabase backend is not configured.",
    };
  }
  return {
    status: "partially_implemented",
    message: "Realtime channels are wired but not verified with live multi-user RLS proof.",
  };
}
