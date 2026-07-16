/** BUILD-017 — EPIC-13.3 Experience Engineering. */

export const EXPERIENCE_ENGINEERING_EN = {
  mentalModelEyebrow: "Your orientation",
  whereAmI: "Where",
  whyAmIHere: "Why",
  whatIsHappening: "Happening",
  whatUnfinished: "Unfinished",
  whatNext: "Next",
  whatChanged: "Changed",
  beginMission: "Begin a mission to orient yourself",
  flowComplete: "All flow stages addressed for current mission",
  noMission: "No active mission",
  ambientEyebrow: "Ambient intelligence",
  ambientReason: "Because",
  trustEyebrow: "Trust state",
  confidence: "Confidence",
  limitations: "Limitations",
  reviewState: "Review",
  universeViews: "Views into one universe",
  viewEvidence: "Evidence view",
  viewRelationships: "Relationship view",
  viewMission: "Mission view",
  viewCapability: "Capability view",
  mobileIntelligenceMode: "Mobile intelligence mode",
  clearLivingMemory: "Clear session memory",
  clearLivingMemoryBody: "Removes flow snapshots from this browser session only. Your projects and mission are not deleted.",
  livingMemoryCleared: "Session memory cleared",
  flowStageCompletedQuestion: "Question stage completed since your last visit",
  flowStageCompletedHypothesis: "Hypothesis articulated since your last visit",
  flowStageCompletedEvidence: "Evidence linked since your last visit",
  flowStageCompletedReasoning: "Reasoning captured since your last visit",
  flowStageCompletedReview: "Review advanced since your last visit",
  flowStageCompletedImpact: "Impact review progressed since your last visit",
  flowStageCompletedPublication: "Publication readiness improved since your last visit",
  flowStageCompletedLegacy: "Legacy artifacts grew since your last visit",
  ambientConflictingEvidence: "Contradictory evidence detected",
  ambientConflictingEvidenceReason: "Multiple references disagree — human review required before conclusions",
  ambientOutdatedEvidence: "Evidence may be outdated",
  ambientOutdatedEvidenceReason: "References are older than one year — verify they remain current",
  ambientImpactNotReviewed: "Impact not yet reviewed",
  ambientImpactNotReviewedReason: "Human impact assessment is incomplete for this mission",
  ambientMissingExpertise: "Mission may need expertise",
  ambientMissingExpertiseReason: "Capabilities needed and evidence gaps are both documented on the mission",
  ambientDisciplineMayHelp: "Another discipline may help",
  ambientDisciplineMayHelpReason: "Your demonstrated capability suggests a complementary angle for this mission",
  ambientNoMission: "No mission gravity yet",
  ambientNoMissionReason: "Intelligence spaces work best when centered on a defined mission",
  layerValidation: "Validation",
} as const;

export type AmbientInsightMessageKey = keyof Pick<
  typeof EXPERIENCE_ENGINEERING_EN,
  | "ambientConflictingEvidence"
  | "ambientOutdatedEvidence"
  | "ambientImpactNotReviewed"
  | "ambientMissingExpertise"
  | "ambientDisciplineMayHelp"
  | "ambientNoMission"
>;
