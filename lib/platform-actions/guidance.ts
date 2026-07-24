/** Post-navigation guidance for Voice Operator — localized, dismissible hints. */

import type { PlatformActionId, PlatformGuidance } from "@/lib/platform-actions/types";

export function guidanceForAction(actionId: PlatformActionId, locale: string): PlatformGuidance | null {
  void locale;
  const table: Partial<Record<PlatformActionId, PlatformGuidance>> = {
    "navigate.research": {
      sectionKey: "platformGuidance.researchSection",
      purposeKey: "platformGuidance.researchPurpose",
      nextActions: [
        { id: "pick_topic", labelKey: "platformGuidance.pickTopic" },
        { id: "draft_question", labelKey: "platformGuidance.draftQuestion" },
        { id: "open_evidence", labelKey: "platformGuidance.openEvidence" },
      ],
    },
    "research.open_topic": {
      sectionKey: "platformGuidance.topicSection",
      purposeKey: "platformGuidance.topicPurpose",
      nextActions: [
        { id: "pick_topic", labelKey: "platformGuidance.pickTopic" },
        { id: "draft_question", labelKey: "platformGuidance.draftQuestion" },
        { id: "evidence_request", labelKey: "platformGuidance.evidenceRequest" },
      ],
    },
    "navigate.evidence": {
      sectionKey: "platformGuidance.evidenceSection",
      purposeKey: "platformGuidance.evidencePurpose",
      nextActions: [
        { id: "review_gaps", labelKey: "platformGuidance.reviewGaps" },
        { id: "open_research", labelKey: "platformGuidance.openResearch" },
      ],
    },
    "navigate.my_work": {
      sectionKey: "platformGuidance.myWorkSection",
      purposeKey: "platformGuidance.myWorkPurpose",
      nextActions: [
        { id: "continue_mission", labelKey: "platformGuidance.continueMission" },
        { id: "draft_plan", labelKey: "platformGuidance.draftPlan" },
      ],
    },
    "entity.open_country": {
      sectionKey: "platformGuidance.countrySection",
      purposeKey: "platformGuidance.countryPurpose",
      nextActions: [
        { id: "review_evidence", labelKey: "platformGuidance.reviewEvidence" },
        { id: "compare", labelKey: "platformGuidance.compareEntities" },
      ],
    },
    "report.compose": {
      sectionKey: "platformGuidance.reportDraftSection",
      purposeKey: "platformGuidance.reportDraftPurpose",
      nextActions: [
        { id: "confirm_draft", labelKey: "platformGuidance.confirmDraft" },
        { id: "cancel_draft", labelKey: "platformGuidance.cancelDraft" },
      ],
    },
  };

  return table[actionId] ?? null;
}
