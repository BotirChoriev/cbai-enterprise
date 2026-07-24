/**
 * Propose Operational Objects from a live room — suggestion first, confirmation via composer.
 */

import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";
import type { LiveIntelligenceRoom } from "@/lib/live-intelligence-rooms/types";

export type LiveRoomObjectProposal = {
  readonly draft: OperationalObjectDraft;
  readonly reason: string;
};

export function proposeOperationalObjectsFromRoom(
  room: LiveIntelligenceRoom,
): readonly LiveRoomObjectProposal[] {
  const proposals: LiveRoomObjectProposal[] = [];
  const locale = room.contentLocale || room.createdLocale || "en";
  const baseProvenance = {
    source: "manual" as const,
    routePath: `/rooms/session?id=${room.roomId}`,
    locale,
    relatedEntityKind: "live_room",
    relatedEntityId: room.roomId,
    relatedEntityName: room.title,
  };

  if (room.roomType === "meeting_hall" || room.roomType === "collaboration") {
    proposals.push({
      reason: "Post-session follow-up from agenda and unresolved questions.",
      draft: {
        type: "meeting_action",
        title: `Follow-up: ${room.title}`,
        summary: room.objective || room.description || room.title,
        objective: room.objective || "Capture confirmed follow-up actions from the live room.",
        rationale: "Derived from Live Intelligence Room transcript and agenda — requires human confirmation.",
        expectedOutcome: "Confirmed action items with owners.",
        domain: "general",
        status: "draft",
        priority: "normal",
        requiredInputs: ["Owner", "Due date"],
        evidenceRequirements: room.evidenceRefs.map((e) => e.label),
        nextAction: "Review action items and confirm owners.",
        humanDecision: "Confirm which follow-ups become tracked work.",
        projectId: room.projectId ?? undefined,
        missionId: room.missionId ?? undefined,
        relatedObjectIds: [...room.operationalObjectIds],
        locale,
        provenance: baseProvenance,
      },
    });
  }

  if (room.roomType === "laboratory") {
    proposals.push({
      reason: "Laboratory rooms may draft an experiment plan — never claim physical results.",
      draft: {
        type: "work_plan",
        title: `Experiment plan: ${room.title}`,
        summary: room.laboratory?.hypothesis || room.objective || room.title,
        objective: "Document hypothesis, method, and review gates.",
        rationale: "Suggested from Live Laboratory — CBAI did not perform physical experiments.",
        expectedOutcome: "Human-reviewed experiment plan.",
        domain: "research",
        status: "draft",
        priority: "normal",
        requiredInputs: ["Method", "Safety review"],
        evidenceRequirements: ["Linked evidence sources"],
        nextAction: "Confirm plan in composer before creation.",
        humanDecision: "Approve whether this plan becomes active work.",
        projectId: room.projectId ?? undefined,
        missionId: room.missionId ?? undefined,
        relatedObjectIds: [...room.operationalObjectIds],
        locale,
        provenance: baseProvenance,
      },
    });
    proposals.push({
      reason: "Request evidence before treating laboratory notes as findings.",
      draft: {
        type: "evidence_request",
        title: `Evidence for: ${room.title}`,
        summary: "Collect official or laboratory evidence referenced in the room.",
        objective: "Attach verified evidence before any decision brief.",
        rationale: "Live Laboratory observations require evidence linkage.",
        expectedOutcome: "Evidence request ready for review.",
        domain: "evidence",
        status: "draft",
        priority: "high",
        requiredInputs: ["Source", "Scope"],
        evidenceRequirements: [],
        nextAction: "Confirm evidence request.",
        humanDecision: "Confirm scope of evidence collection.",
        projectId: room.projectId ?? undefined,
        missionId: room.missionId ?? undefined,
        relatedObjectIds: [...room.operationalObjectIds],
        locale,
        provenance: baseProvenance,
      },
    });
  }

  if (room.questions.some((q) => !q.resolved)) {
    proposals.push({
      reason: "Unresolved questions can become a research question draft.",
      draft: {
        type: "research_question",
        title: room.questions.find((q) => !q.resolved)?.text.slice(0, 120) || `Questions from ${room.title}`,
        summary: "Open questions captured during the live session.",
        objective: "Clarify open questions with evidence.",
        rationale: "Suggested from live room clarification queue.",
        expectedOutcome: "Tracked research question.",
        domain: "research",
        status: "draft",
        priority: "normal",
        requiredInputs: ["Scope"],
        evidenceRequirements: [],
        nextAction: "Confirm research question.",
        humanDecision: "Confirm whether this becomes tracked research work.",
        projectId: room.projectId ?? undefined,
        missionId: room.missionId ?? undefined,
        relatedObjectIds: [...room.operationalObjectIds],
        locale,
        provenance: baseProvenance,
      },
    });
  }

  if (room.glossary.some((g) => g.doNotTranslate && !g.approvedByParticipantId)) {
    proposals.push({
      reason: "Unapproved do-not-translate terms need a glossary update review.",
      draft: {
        type: "review",
        title: `Glossary review: ${room.title}`,
        summary: "Approve or translate preserved technical terms.",
        objective: "Resolve glossary uncertainty before synthetic translated audio.",
        rationale: "Translation router flagged terms requiring human approval.",
        expectedOutcome: "Approved glossary terms.",
        domain: "general",
        status: "draft",
        priority: "high",
        requiredInputs: ["Approved translations"],
        evidenceRequirements: [],
        nextAction: "Confirm glossary review.",
        humanDecision: "Approve preferred translations or keep original terms.",
        projectId: room.projectId ?? undefined,
        missionId: room.missionId ?? undefined,
        relatedObjectIds: [...room.operationalObjectIds],
        locale,
        provenance: baseProvenance,
      },
    });
  }

  // Deduplicate by type+title
  const seen = new Set<string>();
  return proposals.filter((p) => {
    const key = `${p.draft.type}:${p.draft.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
