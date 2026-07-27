/**
 * Propose Operational Objects from a live room — suggestion first, confirmation via composer.
 * Meeting-to-work catalog is confirmation-gated; nothing becomes final without a human.
 */

import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";
import type { LiveIntelligenceRoom } from "@/lib/live-intelligence-rooms/types";

export type LiveRoomObjectProposal = {
  readonly draft: OperationalObjectDraft;
  readonly reason: string;
  readonly catalogKey: string;
};

function baseDraft(
  room: LiveIntelligenceRoom,
  partial: Omit<OperationalObjectDraft, "locale" | "provenance" | "status" | "relatedObjectIds" | "projectId" | "missionId"> &
    Partial<Pick<OperationalObjectDraft, "projectId" | "missionId">>,
): OperationalObjectDraft {
  const locale = room.contentLocale || room.createdLocale || "en";
  return {
    ...partial,
    status: "draft",
    projectId: partial.projectId ?? room.projectId ?? undefined,
    missionId: partial.missionId ?? room.missionId ?? undefined,
    relatedObjectIds: [...room.operationalObjectIds],
    locale,
    provenance: {
      source: "manual",
      routePath: `/rooms/session?id=${room.roomId}`,
      locale,
      relatedEntityKind: "live_room",
      relatedEntityId: room.roomId,
      relatedEntityName: room.title,
    },
  };
}

export function proposeOperationalObjectsFromRoom(
  room: LiveIntelligenceRoom,
): readonly LiveRoomObjectProposal[] {
  const proposals: LiveRoomObjectProposal[] = [];
  const evidenceLabels = room.evidenceRefs.map((e) => e.label);
  const decisions = room.decisions.map((d) => d.text);
  const actions = room.actionItems.map((a) => a.text);
  const openQs = room.questions.filter((q) => !q.resolved).map((q) => q.text);

  const catalog: Array<{
    key: string;
    reason: string;
    draft: ReturnType<typeof baseDraft>;
  }> = [
    {
      key: "meeting_report",
      reason: "Session summary for human review — not a final report until confirmed.",
      draft: baseDraft(room, {
        type: "report_draft",
        title: `Meeting Report: ${room.title}`,
        summary: room.purpose || room.objective || room.title,
        objective: "Capture decisions, open questions, and evidence referenced in the room.",
        rationale: `Source room ${room.roomId}. Decisions: ${decisions.join("; ") || "none yet"}.`,
        expectedOutcome: "Human-approved meeting report.",
        domain: "general",
        priority: "normal",
        requiredInputs: ["Approver", "Final wording"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Review and confirm in composer.",
        humanDecision: "Approve whether this report becomes tracked work.",
      }),
    },
    {
      key: "evidence_request",
      reason: "Request evidence for claims discussed in the room.",
      draft: baseDraft(room, {
        type: "evidence_request",
        title: `Evidence Request: ${room.title}`,
        summary: openQs[0] || room.purpose || room.title,
        objective: "Collect verified sources before any decision brief.",
        rationale: "Suggested from Live Collaboration Room — requires human confirmation.",
        expectedOutcome: "Evidence request ready for review.",
        domain: "evidence",
        priority: "high",
        requiredInputs: ["Source", "Scope"],
        evidenceRequirements: [],
        nextAction: "Confirm evidence request.",
        humanDecision: "Confirm scope of evidence collection.",
      }),
    },
    {
      key: "research_question",
      reason: "Turn unresolved questions into a research question draft.",
      draft: baseDraft(room, {
        type: "research_question",
        title: openQs[0]?.slice(0, 120) || `Research question from ${room.title}`,
        summary: "Open questions captured during the live session.",
        objective: "Clarify open questions with evidence.",
        rationale: "Suggested from live room clarification queue.",
        expectedOutcome: "Tracked research question.",
        domain: "research",
        priority: "normal",
        requiredInputs: ["Scope"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm research question.",
        humanDecision: "Confirm whether this becomes tracked research work.",
      }),
    },
    {
      key: "comparative_study",
      reason: "Draft a comparative study work plan from the session.",
      draft: baseDraft(room, {
        type: "work_plan",
        title: `Comparative Study: ${room.title}`,
        summary: room.expectedOutcome || room.purpose || room.title,
        objective: "Structure a comparative study from room discussion.",
        rationale: "Meeting-to-work suggestion — confirmation required.",
        expectedOutcome: "Human-reviewed comparative study plan.",
        domain: "research",
        priority: "normal",
        requiredInputs: ["Comparators", "Criteria"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm comparative study plan.",
        humanDecision: "Approve plan before activation.",
      }),
    },
    {
      key: "replication_plan",
      reason: "Draft a replication plan — never invent results.",
      draft: baseDraft(room, {
        type: "work_plan",
        title: `Replication Plan: ${room.title}`,
        summary: room.laboratory?.method || room.purpose || room.title,
        objective: "Document replication steps with review gates.",
        rationale: "CBAI does not claim replication was performed.",
        expectedOutcome: "Human-reviewed replication plan.",
        domain: "research",
        priority: "normal",
        requiredInputs: ["Protocol", "Safety review"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm replication plan.",
        humanDecision: "Approve whether replication work begins.",
      }),
    },
    {
      key: "experiment_plan",
      reason: "Laboratory / experiment plan draft — no fabricated physical results.",
      draft: baseDraft(room, {
        type: "work_plan",
        title: `Experiment Plan: ${room.title}`,
        summary: room.laboratory?.hypothesis || room.objective || room.title,
        objective: "Document hypothesis, method, and review gates.",
        rationale: "Suggested from Live Laboratory — CBAI did not perform physical experiments.",
        expectedOutcome: "Human-reviewed experiment plan.",
        domain: "research",
        priority: "normal",
        requiredInputs: ["Method", "Safety review"],
        evidenceRequirements: ["Linked evidence sources"],
        nextAction: "Confirm plan in composer before creation.",
        humanDecision: "Approve whether this plan becomes active work.",
      }),
    },
    {
      key: "collaboration_request",
      reason: "Propose a collaboration request from the session.",
      draft: baseDraft(room, {
        type: "meeting_action",
        title: `Collaboration Request: ${room.title}`,
        summary: room.purpose || room.title,
        objective: "Invite partners to collaborate on confirmed next steps.",
        rationale: "Draft only — invitations still require separate confirmation.",
        expectedOutcome: "Confirmed collaboration request.",
        domain: "general",
        priority: "normal",
        requiredInputs: ["Partners", "Scope"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm collaboration request.",
        humanDecision: "Approve outreach before any invitation is sent.",
      }),
    },
    {
      key: "joint_work_card",
      reason: "Joint work card linking room outcomes to My Work.",
      draft: baseDraft(room, {
        type: "task",
        title: `Joint Work: ${room.title}`,
        summary: actions[0] || room.expectedOutcome || room.purpose || room.title,
        objective: "Track joint follow-up with owners and deadlines.",
        rationale: `Action items: ${actions.join("; ") || "none yet"}.`,
        expectedOutcome: "Confirmed joint work card.",
        domain: "general",
        priority: "normal",
        requiredInputs: ["Owner", "Deadline"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm joint work card.",
        humanDecision: "Confirm owners before activation.",
      }),
    },
    {
      key: "project_presentation",
      reason: "Project presentation follow-up for Reports / My Work.",
      draft: baseDraft(room, {
        type: "report_draft",
        title: `Project Presentation: ${room.title}`,
        summary: room.purpose || room.title,
        objective: "Prepare presentation materials with provenance.",
        rationale: "Materials remain unpublished until human confirmation.",
        expectedOutcome: "Presentation draft ready for approver.",
        domain: "general",
        priority: "normal",
        requiredInputs: ["Audience", "Materials"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm presentation draft.",
        humanDecision: "Approve public vs internal boundaries.",
      }),
    },
    {
      key: "monitoring_plan",
      reason: "Monitoring plan for unresolved risks or unknowns.",
      draft: baseDraft(room, {
        type: "work_plan",
        title: `Monitoring Plan: ${room.title}`,
        summary: openQs.join("; ") || room.purpose || room.title,
        objective: "Watch open questions and evidence gaps over time.",
        rationale: "Suggested from room unknowns — not automatic monitoring.",
        expectedOutcome: "Human-reviewed monitoring plan.",
        domain: "governance",
        priority: "normal",
        requiredInputs: ["Indicators", "Cadence"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm monitoring plan.",
        humanDecision: "Approve monitoring scope.",
      }),
    },
    {
      key: "decision_brief",
      reason: "Decision brief awaiting human approver.",
      draft: baseDraft(room, {
        type: "decision_brief",
        title: `Decision Brief: ${room.title}`,
        summary: decisions[0] || room.expectedOutcome || room.purpose || room.title,
        objective: "Structure a decision for an authorized human approver.",
        rationale: "CBAI structures options; the human decides.",
        expectedOutcome: "Decision brief pending approval.",
        domain: "governance",
        priority: "high",
        requiredInputs: ["Approver", "Options"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm decision brief draft.",
        humanDecision: room.approverIds.length
          ? "Authorized approver must confirm before final."
          : "Assign an authorized human approver before final.",
      }),
    },
    {
      key: "consensus_disagreement",
      reason: "Consensus / disagreement report — preserve unresolved conflict honestly.",
      draft: baseDraft(room, {
        type: "review",
        title: `Consensus/Disagreement: ${room.title}`,
        summary: "Record agreements and unresolved disagreements without declaring a winner.",
        objective: "Document where participants agree and where evidence is insufficient.",
        rationale: "CBAI does not decide who is correct.",
        expectedOutcome: "Human-confirmed consensus/disagreement record.",
        domain: "evidence",
        priority: "normal",
        requiredInputs: ["Agreements", "Disagreements"],
        evidenceRequirements: evidenceLabels,
        nextAction: "Confirm consensus report.",
        humanDecision: "Confirm the record is accurate before filing.",
      }),
    },
  ];

  // Always include meeting follow-up for classic types + full catalog for ended sessions.
  const includeAll = room.lifecycle === "ended" || room.lifecycle === "live";
  for (const item of catalog) {
    if (!includeAll) {
      if (
        item.key === "meeting_report" ||
        item.key === "evidence_request" ||
        (item.key === "experiment_plan" &&
          (room.roomType === "laboratory" || room.roomType === "live_laboratory")) ||
        (item.key === "research_question" && openQs.length > 0)
      ) {
        proposals.push({ catalogKey: item.key, reason: item.reason, draft: item.draft });
      }
      continue;
    }
    proposals.push({ catalogKey: item.key, reason: item.reason, draft: item.draft });
  }

  if (room.glossary.some((g) => g.doNotTranslate && !g.approvedByParticipantId)) {
    proposals.push({
      catalogKey: "glossary_review",
      reason: "Unapproved do-not-translate terms need a glossary update review.",
      draft: baseDraft(room, {
        type: "review",
        title: `Glossary review: ${room.title}`,
        summary: "Approve or translate preserved technical terms.",
        objective: "Resolve glossary uncertainty before synthetic translated audio.",
        rationale: "Translation router flagged terms requiring human approval.",
        expectedOutcome: "Approved glossary terms.",
        domain: "general",
        priority: "high",
        requiredInputs: ["Approved translations"],
        evidenceRequirements: [],
        nextAction: "Confirm glossary review.",
        humanDecision: "Approve preferred translations or keep original terms.",
      }),
    });
  }

  const seen = new Set<string>();
  return proposals.filter((p) => {
    const key = `${p.draft.type}:${p.draft.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
