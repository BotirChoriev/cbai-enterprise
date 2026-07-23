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
      status: shared ? "implemented" : "partially_implemented",
      note: shared
        ? "Organization Workspace + centers read/write enterprise_comments via anon JWT + RLS."
        : "Device-local comment store; connect Preview Supabase for shared comments.",
    },
    {
      id: "mentions",
      label: "Mentions",
      status: shared ? "implemented" : "partially_implemented",
      note: shared
        ? "@userId mentions persist to enterprise_mentions under RLS; email delivery not configured."
        : "@userId mentions in device-local store only.",
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
      status: shared ? "implemented" : "partially_implemented",
      note: shared
        ? "Notification Center loads user_notifications + mentions via RLS; push/email delivery missing."
        : "In-app device-local notifications only.",
    },
    {
      id: "approvals",
      label: "Approval workflow",
      status: shared ? "implemented" : "partially_implemented",
      note: shared
        ? "Request/decide on enterprise_approvals with RLS role gates (owner/admin/reviewer)."
        : "Device-local approval store with RBAC gates.",
    },
    {
      id: "audit",
      label: "Audit log",
      status: shared ? "implemented" : "partially_implemented",
      note: shared
        ? "Activity Center + Organization Workspace timeline read activity_events (RLS) plus org audit."
        : "Device-local organization/collaboration audit only.",
    },
    {
      id: "realtime",
      label: "Realtime team updates",
      status: isOrganizationCollaborationShared() ? "partially_implemented" : "blocked",
      note: isOrganizationCollaborationShared()
        ? "Realtime module wired for org/user scopes — refresh-based UI is Implemented; live channel proof remains partial."
        : "Blocked — shared Supabase backend not configured in this environment.",
    },
    {
      id: "cloud-collab-repo",
      label: "Supabase collaboration repository",
      status: shared ? "implemented" : "partially_implemented",
      note: shared
        ? "Factory selects Supabase adapters; UI uses cloud-persistence with anon key only (no service role)."
        : "Device-local adapters until Preview Supabase public env is set.",
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
