"use client";

import { useEffect, useMemo, useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import {
  completeCollaborationReview,
  loadCollaboration,
  loadCollaborationReviewAssignments,
  loadMissionCollaborations,
} from "@/lib/collaboration/collaboration-store";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";

export default function ReviewCenter() {
  const [tick, setTick] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const userId = resolveActorId();

  useEffect(() => setTick(1), []);

  const assignments = useMemo(() => {
    void tick;
    if (!userId) return [];
    const out = [];
    for (const collab of loadMissionCollaborations()) {
      if (collab.ownerOrganizationId && !loadMembershipForUser(userId, collab.ownerOrganizationId)) {
        continue;
      }
      for (const a of loadCollaborationReviewAssignments(collab.id)) {
        if (a.assignedTo === userId) out.push({ collab, assignment: a });
      }
    }
    return out.sort((a, b) => b.assignment.createdAt.localeCompare(a.assignment.createdAt));
  }, [tick, userId]);

  return (
    <OperatingPageShell
      title="Review Center"
      description="Review assignments from collaborations you can see. Cross-organization reviews are excluded."
      showMissionContext={false}
    >
      <EnterpriseStatusBanner />
      {feedback ? <p className="text-xs text-teal-300">{feedback}</p> : null}

      {!userId ? (
        <p className="text-sm text-zinc-500">Sign in to see assigned reviews.</p>
      ) : assignments.length === 0 ? (
        <section className={`${cbaiGlassCard} p-4`}>
          <p className="text-sm text-zinc-500">No review assignments for you yet.</p>
        </section>
      ) : (
        <ul className="space-y-3">
          {assignments.map(({ collab, assignment }) => (
            <li key={assignment.id} className={`${cbaiGlassCard} space-y-2 p-4`}>
              <p className={cbaiSectionEyebrow}>{assignment.status}</p>
              <p className="text-sm text-zinc-200">{collab.title}</p>
              <p className="text-xs text-zinc-500">
                {assignment.object.objectType}/{assignment.object.objectId} · due{" "}
                {assignment.dueAt ?? "none"}
              </p>
              {assignment.status === "assigned" || assignment.status === "in_review" ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
                    onClick={() => {
                      const result = completeCollaborationReview({
                        assignmentId: assignment.id,
                        actorId: userId,
                        outcome: "accepted",
                        expectedVersion: assignment.version,
                      });
                      setFeedback("error" in result ? result.error : "Review accepted.");
                      setTick((n) => n + 1);
                    }}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                    onClick={() => {
                      const result = completeCollaborationReview({
                        assignmentId: assignment.id,
                        actorId: userId,
                        outcome: "changes_requested",
                        expectedVersion: assignment.version,
                      });
                      setFeedback("error" in result ? result.error : "Changes requested.");
                      setTick((n) => n + 1);
                    }}
                  >
                    Request changes
                  </button>
                </div>
              ) : null}
              {!loadCollaboration(collab.id) ? null : null}
            </li>
          ))}
        </ul>
      )}
    </OperatingPageShell>
  );
}
