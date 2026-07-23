"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useActiveOrganization } from "@/components/enterprise-collaboration/ActiveOrganizationProvider";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import {
  loadActiveEnterpriseContext,
  saveActiveEnterpriseContext,
} from "@/lib/enterprise-collaboration";
import {
  fetchOrganizationComments,
  persistEnterpriseComment,
} from "@/lib/enterprise-collaboration/cloud-persistence";
import type { EnterpriseComment } from "@/lib/enterprise-collaboration/types";
import {
  createMissionCollaboration,
  loadCollaborationParticipants,
  loadMissionCollaborations,
} from "@/lib/collaboration/collaboration-store";
import { loadMembershipForUser, loadOrganizationMemberships } from "@/lib/organization-os/organization-membership-store";
import { hydrateOrganizationPersistence } from "@/lib/persistence/organization-persistence-service";

export default function MissionDashboard() {
  const { cloudUser, isCloudSignedIn } = useAuth();
  const { activeOrganizationId, sharedBackend } = useActiveOrganization();
  const userId = cloudUser?.id ?? resolveActorId() ?? "device-local";
  const [tick, setTick] = useState(0);
  const [commentBody, setCommentBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [comments, setComments] = useState<EnterpriseComment[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => setTick(1), []);

  const mission = useMemo(() => {
    void tick;
    return loadCurrentMission();
  }, [tick]);

  const orgId = activeOrganizationId ?? loadActiveEnterpriseContext().organizationId;
  const canComment = Boolean(orgId && loadMembershipForUser(userId, orgId));
  const members = orgId ? loadOrganizationMemberships(orgId) : [];

  const collabs = useMemo(() => {
    void tick;
    if (!mission) return [];
    return loadMissionCollaborations(mission.id).filter((c) => {
      if (!c.ownerOrganizationId) return c.createdBy === userId;
      return Boolean(loadMembershipForUser(userId, c.ownerOrganizationId));
    });
  }, [tick, mission, userId]);

  const reloadComments = useCallback(async () => {
    if (!mission || !orgId || !canComment) {
      setComments([]);
      return;
    }
    if (sharedBackend && isCloudSignedIn) {
      await hydrateOrganizationPersistence(userId);
    }
    const result = await fetchOrganizationComments(userId, orgId);
    if ("error" in result) {
      setFeedback(result.error);
      setComments([]);
      return;
    }
    setComments(result.filter((c) => c.targetType === "mission" && c.targetId === mission.id));
  }, [mission, orgId, canComment, userId, sharedBackend, isCloudSignedIn]);

  useEffect(() => {
    void reloadComments();
  }, [reloadComments]);

  function bindMission() {
    if (!mission) return;
    saveActiveEnterpriseContext({ missionId: mission.id });
    setTick((n) => n + 1);
    setFeedback("Mission bound to enterprise context.");
  }

  function startCollab() {
    if (!mission) return;
    const result = createMissionCollaboration({
      missionId: mission.id,
      createdBy: userId,
      title: `Collaboration — ${mission.problem.slice(0, 48)}`,
      ownerOrganizationId: orgId,
    });
    if ("error" in result) {
      setFeedback(result.error);
      return;
    }
    setFeedback(`Collaboration created: ${result.id}`);
    setTick((n) => n + 1);
  }

  async function postComment() {
    if (!mission || !orgId) {
      setFeedback("Select an organization and mission before commenting.");
      return;
    }
    setBusy(true);
    const result = await persistEnterpriseComment({
      organizationId: orgId,
      authorId: userId,
      targetType: "mission",
      targetId: mission.id,
      body: commentBody,
    });
    setBusy(false);
    if ("error" in result) {
      setFeedback(result.error);
      return;
    }
    setCommentBody("");
    setFeedback("Comment posted (organization-scoped).");
    await reloadComments();
  }

  return (
    <OperatingPageShell
      title="Mission Dashboard"
      description="Current mission collaborations, assignees, and organization-scoped comments."
      showMissionContext
      missionContextVariant="full"
    >
      <EnterpriseStatusBanner />

      <section className={`${cbaiGlassCard} space-y-3 p-4`}>
        <p className={cbaiSectionEyebrow}>Current mission</p>
        {!mission ? (
          <p className="text-sm text-zinc-500">
            No active mission.{" "}
            <Link href="/my-work" className="text-teal-400">
              Open My Work
            </Link>
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-200">{mission.problem}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={`${cbaiBtnSecondary} ${cbaiFocusRing}`} onClick={bindMission}>
                Bind to enterprise context
              </button>
              <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing}`} onClick={startCollab}>
                Create collaboration
              </button>
            </div>
          </>
        )}
        {feedback ? <p className="text-xs text-teal-300">{feedback}</p> : null}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Collaborations (visible)</p>
          {collabs.length === 0 ? (
            <p className="text-sm text-zinc-500">No collaborations for this mission yet.</p>
          ) : (
            <ul className="space-y-3">
              {collabs.map((c) => {
                const people = loadCollaborationParticipants(c.id);
                return (
                  <li key={c.id} className="text-sm text-zinc-300">
                    <p className="font-medium text-zinc-100">{c.title}</p>
                    <p className="text-xs text-zinc-500">
                      {c.status} · assignees: {people.map((p) => p.participantId).join(", ") || "none"}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={`${cbaiGlassCard} space-y-3 p-4`}>
          <p className={cbaiSectionEyebrow}>Mission comments</p>
          <CollaborationStatePanel
            state={!canComment ? "denied" : "ready"}
            message="Activate an organization you belong to before posting comments."
          >
            <>
              <div className="flex flex-wrap gap-1">
                {members
                  .filter((m) => m.userId !== userId)
                  .map((m) => (
                    <button
                      key={m.userId}
                      type="button"
                      className={`${cbaiBtnSecondary} ${cbaiFocusRing} text-xs`}
                      onClick={() =>
                        setCommentBody((prev) => `${prev.trim()} @${m.userId}`.trim())
                      }
                    >
                      @{m.userDisplayName || m.userId.slice(0, 8)}
                    </button>
                  ))}
              </div>
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
                placeholder="Comment — mention teammates with @userId"
                className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
              />
              <button
                type="button"
                disabled={busy}
                className={`${cbaiBtnPrimary} ${cbaiFocusRing}`}
                onClick={() => void postComment()}
              >
                Post comment
              </button>
            </>
          </CollaborationStatePanel>
          <ul className="space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="text-xs text-zinc-400">
                <span className="text-zinc-300">{c.authorId.slice(0, 8)}…</span>: {c.body}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </OperatingPageShell>
  );
}
