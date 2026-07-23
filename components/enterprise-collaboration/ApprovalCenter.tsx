"use client";

import { useEffect, useMemo, useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondary,
  cbaiFocusRing,
  cbaiGlassCard,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import {
  decideEnterpriseApproval,
  loadActiveEnterpriseContext,
  loadApprovalsForUser,
  requestEnterpriseApproval,
} from "@/lib/enterprise-collaboration";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";
import { loadOrganizationMemberships } from "@/lib/organization-os/organization-membership-store";

export default function ApprovalCenter() {
  const [tick, setTick] = useState(0);
  const [title, setTitle] = useState("Mission publish approval");
  const [assignee, setAssignee] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const userId = resolveActorId();

  useEffect(() => setTick(1), []);

  const orgId = useMemo(() => {
    void tick;
    return loadActiveEnterpriseContext().organizationId;
  }, [tick]);

  const peers = useMemo(() => {
    void tick;
    if (!orgId) return [];
    return loadOrganizationMemberships()
      .filter((m) => m.organizationId === orgId)
      .map((m) => m.userId);
  }, [tick, orgId]);

  const approvals = useMemo(() => {
    void tick;
    if (!userId) return [];
    return loadApprovalsForUser(userId, orgId);
  }, [tick, userId, orgId]);

  return (
    <OperatingPageShell
      title="Approval Center"
      description="Request and decide organization approvals. Approvers need approve_internal_review permission."
      showMissionContext={false}
    >
      <EnterpriseStatusBanner />

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Request approval</p>
        {!userId || !orgId || !loadMembershipForUser(userId, orgId) ? (
          <p className="text-sm text-zinc-500">Activate an organization you belong to first.</p>
        ) : (
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
              {peers
                .filter((id) => id !== userId)
                .map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
            </select>
            <button
              type="button"
              className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
              onClick={() => {
                if (!assignee) {
                  setFeedback("Select an assignee in the same organization.");
                  return;
                }
                const result = requestEnterpriseApproval({
                  organizationId: orgId,
                  requestedBy: userId,
                  assignedTo: assignee,
                  targetType: "mission",
                  targetId: "active-mission",
                  title,
                });
                setFeedback("error" in result ? result.error : `Approval requested: ${result.id}`);
                setTick((n) => n + 1);
              }}
            >
              Request approval
            </button>
          </>
        )}
        {feedback ? <p className="text-xs text-teal-300">{feedback}</p> : null}
      </section>

      <section className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Your approvals</p>
        {approvals.length === 0 ? (
          <p className="text-sm text-zinc-500">No approval records in the active organization scope.</p>
        ) : (
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
                        const result = decideEnterpriseApproval({
                          approvalId: a.id,
                          actorId: userId,
                          decision: "approved",
                        });
                        setFeedback("error" in result ? result.error : "Approved.");
                        setTick((n) => n + 1);
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                      onClick={() => {
                        const result = decideEnterpriseApproval({
                          approvalId: a.id,
                          actorId: userId,
                          decision: "rejected",
                        });
                        setFeedback("error" in result ? result.error : "Rejected.");
                        setTick((n) => n + 1);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </OperatingPageShell>
  );
}
