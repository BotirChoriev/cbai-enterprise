"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import CollaborationStatePanel from "@/components/enterprise-collaboration/CollaborationStatePanel";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondary,
  cbaiFocusRing,
  cbaiGlassCard,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";
import { useActiveOrganization } from "@/components/enterprise-collaboration/ActiveOrganizationProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { hydrateOrganizationPersistence } from "@/lib/persistence/organization-persistence-service";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";
import {
  inviteOrganizationMemberPersisted,
} from "@/lib/persistence/organization-persistence-service";
import {
  fetchApprovalsForUser,
  fetchOrganizationActivityEvents,
  fetchOrganizationComments,
  persistApprovalDecision,
  persistApprovalRequest,
  persistEnterpriseComment,
  type OrganizationActivityEvent,
} from "@/lib/enterprise-collaboration/cloud-persistence";
import type { EnterpriseApproval, EnterpriseComment } from "@/lib/enterprise-collaboration/types";
import {
  loadMembershipForUser,
  loadOrganizationMemberships,
  type OrganizationMembership,
  type OrganizationRole,
} from "@/lib/organization-os/organization-membership-store";
import {
  INVITEABLE_WORKSPACE_ROLES,
  displayLabelForStorageRole,
  storageRoleFromWorkspaceId,
  type WorkspaceMemberRoleId,
} from "@/lib/organization-os/workspace-roles";
import { setActiveOrganizationForUser } from "@/lib/enterprise-collaboration";
import { evaluateOrganizationPermission } from "@/lib/organization-os/permissions-service";

function shortId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export default function OrganizationWorkspace() {
  const searchParams = useSearchParams();
  const orgParam = searchParams.get("org");
  const { cloudUser, isCloudSignedIn } = useAuth();
  const {
    organizations,
    activeOrganizationId,
    activeOrganization,
    sharedBackend,
    loading: orgLoading,
    error: orgError,
    refresh,
    setActiveOrganization,
  } = useActiveOrganization();

  const userId = cloudUser?.id ?? resolveActorId();
  const [hydrated, setHydrated] = useState(false);
  const [comments, setComments] = useState<EnterpriseComment[]>([]);
  const [approvals, setApprovals] = useState<EnterpriseApproval[]>([]);
  const [activity, setActivity] = useState<OrganizationActivityEvent[]>([]);
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [commentBody, setCommentBody] = useState("");
  const [approvalTitle, setApprovalTitle] = useState("Workspace publish approval");
  const [assignee, setAssignee] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceMemberRoleId>("reviewer");

  const orgId = useMemo(() => {
    if (orgParam && organizations.some((o) => o.id === orgParam)) return orgParam;
    return activeOrganizationId ?? organizations[0]?.id ?? null;
  }, [orgParam, organizations, activeOrganizationId]);

  const membership = orgId && userId ? loadMembershipForUser(userId, orgId) : null;
  const canInvite =
    Boolean(orgId && userId) &&
    evaluateOrganizationPermission(userId, orgId!, "invite_members");

  const loadWorkspace = useCallback(async () => {
    if (!userId || !orgId) {
      setComments([]);
      setApprovals([]);
      setActivity([]);
      setMembers([]);
      return;
    }
    setLoadError(null);
    setBusy(true);
    try {
      if (isOrganizationCollaborationShared() && isCloudSignedIn) {
        await hydrateOrganizationPersistence(userId);
      }
      setMembers([...loadOrganizationMemberships(orgId)]);

      const [cRes, aRes, actRes] = await Promise.all([
        fetchOrganizationComments(userId, orgId),
        fetchApprovalsForUser(userId, orgId),
        fetchOrganizationActivityEvents(orgId),
      ]);
      if ("error" in cRes) {
        setLoadError(cRes.error);
        setComments([]);
      } else {
        setComments(cRes);
      }
      setApprovals(aRes);
      if ("error" in actRes) {
        // Device-local: activity_events unavailable — not a hard fail when comments worked.
        if (sharedBackend) setLoadError((prev) => prev ?? actRes.error);
        setActivity([]);
      } else {
        setActivity(actRes);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Workspace load failed.");
    } finally {
      setBusy(false);
      setHydrated(true);
    }
  }, [userId, orgId, isCloudSignedIn, sharedBackend]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (orgParam && orgParam !== activeOrganizationId) {
      void setActiveOrganization(orgParam);
    }
  }, [orgParam, activeOrganizationId, setActiveOrganization]);

  async function activateOrg(id: string) {
    if (sharedBackend) {
      await setActiveOrganization(id);
    } else if (userId) {
      const result = setActiveOrganizationForUser(userId, id);
      if ("error" in result) {
        setFeedback(result.error);
        return;
      }
    }
    await refresh();
    setFeedback(`Active organization set.`);
  }

  function insertMention(memberUserId: string) {
    const token = `@${memberUserId}`;
    setCommentBody((prev) => (prev.includes(token) ? prev : `${prev.trim()} ${token}`.trim()));
  }

  async function postComment() {
    if (!userId || !orgId) return;
    setFeedback(null);
    setBusy(true);
    const result = await persistEnterpriseComment({
      organizationId: orgId,
      authorId: userId,
      targetType: "mission",
      targetId: "organization-workspace",
      body: commentBody,
    });
    setBusy(false);
    if ("error" in result) {
      setFeedback(result.error);
      return;
    }
    setCommentBody("");
    setFeedback("Comment posted (RLS-scoped).");
    await loadWorkspace();
  }

  async function requestApproval() {
    if (!userId || !orgId || !assignee) {
      setFeedback("Select an assignee in this organization.");
      return;
    }
    setBusy(true);
    const result = await persistApprovalRequest({
      organizationId: orgId,
      requestedBy: userId,
      assignedTo: assignee,
      targetType: "mission",
      targetId: "organization-workspace",
      title: approvalTitle,
    });
    setBusy(false);
    if ("error" in result) {
      setFeedback(result.error);
      return;
    }
    setFeedback(`Approval requested: ${shortId(result.id)}`);
    await loadWorkspace();
  }

  async function decide(approvalId: string, decision: "approved" | "rejected") {
    if (!userId) return;
    setBusy(true);
    const result = await persistApprovalDecision({
      approvalId,
      actorId: userId,
      decision,
    });
    setBusy(false);
    if ("error" in result) {
      setFeedback(result.error);
      return;
    }
    setFeedback(`Decision recorded: ${decision}`);
    await loadWorkspace();
  }

  async function sendInvite() {
    if (!orgId || !canInvite || !inviteEmail.trim()) return;
    setBusy(true);
    const role = storageRoleFromWorkspaceId(inviteRole) as OrganizationRole;
    if (sharedBackend) {
      const result = await inviteOrganizationMemberPersisted({
        organizationId: orgId,
        inviterDisplayName: cloudUser?.email?.split("@")[0] ?? "Operator",
        inviteeEmail: inviteEmail.trim(),
        role,
      });
      setBusy(false);
      if ("error" in result) {
        setFeedback(typeof result.error === "string" ? result.error : "Invite failed.");
        return;
      }
      const link = result.acceptUrl ?? `/organization?invite=${result.rawToken}`;
      setFeedback(
        result.emailStatus === "delivered"
          ? `Invitation emailed to ${inviteEmail}.`
          : `Email delivery not configured — copy invite link: ${link}`,
      );
    } else {
      const { inviteOrganizationMember } = await import(
        "@/lib/organization-os/organization-membership-store"
      );
      const result = inviteOrganizationMember({
        organizationId: orgId,
        inviterId: userId!,
        inviterDisplayName: "Operator",
        inviteeEmail: inviteEmail.trim(),
        role,
      });
      setBusy(false);
      if ("error" in result) {
        setFeedback(result.error);
        return;
      }
      setFeedback(`Invite created (device-local): /organization?invite=${result.rawToken}`);
    }
    setInviteEmail("");
    await loadWorkspace();
  }

  const panelState =
    orgLoading || (busy && !hydrated)
      ? "loading"
      : !userId
        ? "signed_out"
        : orgError
          ? "error"
          : organizations.length === 0
            ? "empty"
            : !orgId || !membership
              ? "denied"
              : loadError
                ? "error"
                : "ready";

  return (
    <OperatingPageShell
      title="Organization Workspace"
      description="Members, comments, @mentions, approvals, and organization activity — Preview Supabase via anon JWT + RLS (no service role)."
      showMissionContext
      missionContextVariant="compact"
    >
      <EnterpriseStatusBanner />

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Organization</p>
        <CollaborationStatePanel
          state={
            orgLoading
              ? "loading"
              : !userId
                ? "signed_out"
                : orgError
                  ? "error"
                  : organizations.length === 0
                    ? "empty"
                    : "ready"
          }
          message={
            orgError ??
            (organizations.length === 0
              ? "No organizations yet. Create one to start collaborating."
              : null)
          }
        >
          <div className="flex flex-wrap gap-2">
            {organizations.map((org) => (
              <button
                key={org.id}
                type="button"
                className={`${cbaiBtnSecondary} ${cbaiFocusRing} ${orgId === org.id ? "border-teal-400/50 text-teal-200" : ""}`}
                onClick={() => void activateOrg(org.id)}
              >
                {org.name}
              </button>
            ))}
            <Link href="/organization" className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}>
              Create / invite
            </Link>
          </div>
        </CollaborationStatePanel>
        {membership ? (
          <p className="text-xs text-zinc-500">
            Active: <span className="text-zinc-300">{activeOrganization?.name ?? orgId}</span> · Your role:{" "}
            <span className="text-zinc-300">{displayLabelForStorageRole(membership.role)}</span>
            {sharedBackend ? " · Shared Preview backend" : " · Device-local fallback"}
          </p>
        ) : null}
        {feedback ? (
          <p className="text-xs text-teal-300" role="status">
            {feedback}
          </p>
        ) : null}
      </section>

      <CollaborationStatePanel state={panelState} message={loadError}>
        <div className="grid gap-3 lg:grid-cols-2">
          <section className={`${cbaiGlassCard} space-y-3 p-4`}>
            <p className={cbaiSectionEyebrow}>Members</p>
            {members.length === 0 ? (
              <p className="text-sm text-zinc-500">No members visible for this organization.</p>
            ) : (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 text-sm text-zinc-300">
                    <span>
                      {m.userDisplayName || shortId(m.userId)}{" "}
                      <span className="text-zinc-500">({shortId(m.userId)})</span>
                    </span>
                    <span className="text-xs text-teal-300/90">{displayLabelForStorageRole(m.role)}</span>
                  </li>
                ))}
              </ul>
            )}
            {canInvite ? (
              <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                <p className="text-xs text-zinc-500">Invite member</p>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceMemberRoleId)}
                  className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
                >
                  {INVITEABLE_WORKSPACE_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} — {r.description}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy}
                  className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
                  onClick={() => void sendInvite()}
                >
                  Send invite
                </button>
              </div>
            ) : null}
          </section>

          <section className={`${cbaiGlassCard} space-y-3 p-4`}>
            <p className={cbaiSectionEyebrow}>Comments & @mentions</p>
            <div className="flex flex-wrap gap-1">
              {members
                .filter((m) => m.userId !== userId)
                .map((m) => (
                  <button
                    key={m.userId}
                    type="button"
                    className={`${cbaiBtnSecondary} ${cbaiFocusRing} text-xs`}
                    onClick={() => insertMention(m.userId)}
                  >
                    @{m.userDisplayName || shortId(m.userId)}
                  </button>
                ))}
            </div>
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={3}
              placeholder="Comment — use mention buttons to insert @userId"
              className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
            />
            <button
              type="button"
              disabled={busy || !commentBody.trim()}
              className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
              onClick={() => void postComment()}
            >
              Post comment
            </button>
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-500">No comments in this organization yet.</p>
            ) : (
              <ul className="max-h-56 space-y-2 overflow-y-auto">
                {comments.map((c) => (
                  <li key={c.id} className="text-sm text-zinc-300">
                    <span className="text-zinc-500">{shortId(c.authorId)}</span> — {c.body}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`${cbaiGlassCard} space-y-3 p-4`}>
            <p className={cbaiSectionEyebrow}>Approvals</p>
            <input
              value={approvalTitle}
              onChange={(e) => setApprovalTitle(e.target.value)}
              className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
              placeholder="Approval title"
            />
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
            >
              <option value="">Select assignee</option>
              {members
                .filter((m) => m.userId !== userId)
                .map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userDisplayName || shortId(m.userId)} · {displayLabelForStorageRole(m.role)}
                  </option>
                ))}
            </select>
            <button
              type="button"
              disabled={busy}
              className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
              onClick={() => void requestApproval()}
            >
              Request approval
            </button>
            {approvals.length === 0 ? (
              <p className="text-sm text-zinc-500">No approvals for this organization yet.</p>
            ) : (
              <ul className="space-y-3">
                {approvals.map((a) => (
                  <li key={a.id} className="space-y-2 border-b border-zinc-800/80 pb-3 last:border-0">
                    <p className="text-sm text-zinc-200">{a.title}</p>
                    <p className="text-xs text-zinc-500">
                      {a.status} · to {shortId(a.assignedTo)}
                    </p>
                    {userId && a.status === "pending" && a.assignedTo === userId ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
                          onClick={() => void decide(a.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                          onClick={() => void decide(a.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/approvals" className="text-xs text-teal-400 hover:text-teal-300">
              Open Approval Center →
            </Link>
          </section>

          <section className={`${cbaiGlassCard} space-y-3 p-4`}>
            <p className={cbaiSectionEyebrow}>Organization activity</p>
            {activity.length === 0 ? (
              <p className="text-sm text-zinc-500">
                {sharedBackend
                  ? "No activity_events for this organization yet."
                  : "Activity timeline requires shared Preview Supabase."}
              </p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {activity.map((e) => (
                  <li key={e.id} className="text-xs text-zinc-400">
                    {e.createdAt.slice(0, 19)} · {e.action}
                    {e.targetType ? ` · ${e.targetType}` : ""}
                    {e.actorUserId ? ` · ${shortId(e.actorUserId)}` : ""}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/activity" className="text-xs text-teal-400 hover:text-teal-300">
              Open Activity Center →
            </Link>
            <Link href="/notifications" className="ml-3 text-xs text-teal-400 hover:text-teal-300">
              Notifications →
            </Link>
          </section>
        </div>
      </CollaborationStatePanel>
    </OperatingPageShell>
  );
}
