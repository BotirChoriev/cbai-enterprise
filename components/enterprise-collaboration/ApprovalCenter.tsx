"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { useActiveOrganization } from "@/components/enterprise-collaboration/ActiveOrganizationProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import {
  fetchApprovalsForUser,
  persistApprovalDecision,
  persistApprovalRequest,
} from "@/lib/enterprise-collaboration/cloud-persistence";
import type { EnterpriseApproval } from "@/lib/enterprise-collaboration/types";
import { hydrateOrganizationPersistence } from "@/lib/persistence/organization-persistence-service";
import { loadMembershipForUser, loadOrganizationMemberships } from "@/lib/organization-os/organization-membership-store";
import { displayLabelForStorageRole } from "@/lib/organization-os/workspace-roles";

export default function ApprovalCenter() {
  const { isCloudSignedIn, cloudUser } = useAuth();
  const { activeOrganizationId, sharedBackend, loading: orgLoading } = useActiveOrganization();
  const userId = cloudUser?.id ?? resolveActorId();
  const [approvals, setApprovals] = useState<EnterpriseApproval[]>([]);
  const [title, setTitle] = useState("Mission publish approval");
  const [assignee, setAssignee] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const orgId = activeOrganizationId;
  const membership = orgId && userId ? loadMembershipForUser(userId, orgId) : null;

  const peers = useMemo(() => {
    if (!orgId) return [];
    return loadOrganizationMemberships(orgId).filter((m) => m.userId !== userId);
  }, [orgId, userId, loaded, busy]);

  const reload = useCallback(async () => {
    if (!userId) {
      setApprovals([]);
      setLoaded(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (sharedBackend && isCloudSignedIn) {
        await hydrateOrganizationPersistence(userId);
      }
      setApprovals(await fetchApprovalsForUser(userId, orgId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load approvals.");
    } finally {
      setBusy(false);
      setLoaded(true);
    }
  }, [userId, orgId, sharedBackend, isCloudSignedIn]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const state =
    orgLoading || (busy && !loaded)
      ? "loading"
      : !userId
        ? "signed_out"
        : error
          ? "error"
          : !orgId || !membership
            ? "denied"
            : "ready";

  return (
    <OperatingPageShell
      title="Approval Center"
      description="Request and decide organization approvals via Preview Supabase RLS (owner / admin / reviewer can decide)."
      showMissionContext={false}
    >
      <EnterpriseStatusBanner />

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Request approval</p>
        <CollaborationStatePanel state={state} message={error}>
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
              placeholder="Approval title"
            />
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
            >
              <option value="">Select assignee</option>
              {peers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userDisplayName || m.userId} · {displayLabelForStorageRole(m.role)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy}
              className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
              onClick={() => {
                void (async () => {
                  if (!assignee || !orgId || !userId) {
                    setFeedback("Select an assignee in the same organization.");
                    return;
                  }
                  setBusy(true);
                  const result = await persistApprovalRequest({
                    organizationId: orgId,
                    requestedBy: userId,
                    assignedTo: assignee,
                    targetType: "mission",
                    targetId: "active-mission",
                    title,
                  });
                  setBusy(false);
                  setFeedback("error" in result ? result.error : `Approval requested: ${result.id}`);
                  await reload();
                })();
              }}
            >
              Request approval
            </button>
          </>
        </CollaborationStatePanel>
        {feedback ? <p className="text-xs text-teal-300">{feedback}</p> : null}
      </section>

      <section className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Your approvals</p>
        <CollaborationStatePanel
          state={!loaded ? "loading" : !userId ? "signed_out" : approvals.length === 0 ? "empty" : "ready"}
          message={approvals.length === 0 ? "No approval records in the active organization scope." : null}
        >
          <ul className="space-y-3">
            {approvals.map((a) => (
              <li key={a.id} className="space-y-2 border-b border-zinc-800/80 pb-3 last:border-0">
                <p className="text-sm text-zinc-200">{a.title}</p>
                <p className="text-xs text-zinc-500">
                  {a.status} · to {a.assignedTo} · from {a.requestedBy}
                </p>
                {userId && a.status === "pending" && a.assignedTo === userId ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
                      onClick={() => {
                        void (async () => {
                          const result = await persistApprovalDecision({
                            approvalId: a.id,
                            actorId: userId,
                            decision: "approved",
                          });
                          setFeedback("error" in result ? result.error : "Approved.");
                          await reload();
                        })();
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                      onClick={() => {
                        void (async () => {
                          const result = await persistApprovalDecision({
                            approvalId: a.id,
                            actorId: userId,
                            decision: "rejected",
                          });
                          setFeedback("error" in result ? result.error : "Rejected.");
                          await reload();
                        })();
                      }}
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </CollaborationStatePanel>
      </section>
    </OperatingPageShell>
  );
}
