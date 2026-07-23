"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import {
  createEnterpriseComment,
  loadActiveEnterpriseContext,
  loadEnterpriseCommentsForTarget,
  saveActiveEnterpriseContext,
} from "@/lib/enterprise-collaboration";
import {
  createMissionCollaboration,
  loadCollaborationParticipants,
  loadMissionCollaborations,
} from "@/lib/collaboration/collaboration-store";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";

export default function MissionDashboard() {
  const [tick, setTick] = useState(0);
  const [commentBody, setCommentBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const userId = resolveActorId() ?? "device-local";

  useEffect(() => setTick(1), []);

  const mission = useMemo(() => {
    void tick;
    return loadCurrentMission();
  }, [tick]);

  const active = useMemo(() => {
    void tick;
    return loadActiveEnterpriseContext();
  }, [tick]);

  const orgId = active.organizationId;
  const canComment = Boolean(orgId && loadMembershipForUser(userId, orgId));

  const collabs = useMemo(() => {
    void tick;
    if (!mission) return [];
    return loadMissionCollaborations(mission.id).filter((c) => {
      if (!c.ownerOrganizationId) return c.createdBy === userId;
      return Boolean(loadMembershipForUser(userId, c.ownerOrganizationId));
    });
  }, [tick, mission, userId]);

  const comments = useMemo(() => {
    void tick;
    if (!mission || !orgId || !canComment) return [];
    const result = loadEnterpriseCommentsForTarget(userId, orgId, "mission", mission.id);
    return "error" in result ? [] : result;
  }, [tick, mission, orgId, canComment, userId]);

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

  function postComment() {
    if (!mission || !orgId) {
      setFeedback("Select an organization and mission before commenting.");
      return;
    }
    const result = createEnterpriseComment({
      organizationId: orgId,
      authorId: userId,
      targetType: "mission",
      targetId: mission.id,
      body: commentBody,
    });
    if ("error" in result) {
      setFeedback(result.error);
      return;
    }
    setCommentBody("");
    setFeedback("Comment posted (organization-scoped).");
    setTick((n) => n + 1);
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
          {!canComment ? (
            <p className="text-sm text-zinc-500">
              Activate an organization you belong to before posting comments.
            </p>
          ) : (
            <>
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
                placeholder="Comment — mention teammates with @userId"
                className={`w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 ${cbaiFocusRing}`}
              />
              <button type="button" className={`${cbaiBtnPrimary} ${cbaiFocusRing}`} onClick={postComment}>
                Post comment
              </button>
            </>
          )}
          <ul className="space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="text-xs text-zinc-400">
                <span className="text-zinc-300">{c.authorId}</span>: {c.body}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </OperatingPageShell>
  );
}
