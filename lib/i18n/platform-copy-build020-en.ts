/** BUILD-020 — EPIC-21 Zero Learning Curve / Invisible Operating System. */

export const ZERO_LEARNING_CURVE_EN = {
  gatewayEyebrow: "Intelligence Gateway",
  gatewayHint: "Speak, type, or choose a goal — intent comes first.",
  speak: "Speak",
  type: "Type",
  chooseGoal: "Choose goal",
  goalResearch: "I want to research",
  goalVerify: "I want to verify",
  goalCompare: "I want to compare",
  goalContinue: "I want to continue",
  goalCreate: "I want to create",
  goalCollaborate: "I want to collaborate",
  goalPublish: "I want to publish",
  firstMinuteAction: "Your next step",
  universalCommandEyebrow: "Universal Command",
  commandHint: "Everything begins here — deterministic routing only.",
  whereAmI: "Where am I",
  whatAmIDoing: "What am I doing",
  whyItMatters: "Why it matters",
  nextAction: "Next action",
  evidenceKnown: "Known",
  evidenceUnknown: "Unknown",
  evidenceConflict: "Conflict",
  evidenceNeedsReview: "Needs review",
  reportsContinue: "Continue",
  reportsGenerate: "Generate",
  reportsReview: "Review",
  reportsShare: "Share",
  graphPeople: "People",
  graphEvidence: "Evidence",
  graphKnowledge: "Knowledge",
  graphQuestions: "Questions",
  graphImpact: "Impact",
  capabilityAssessmentOffer: "Optional capability review",
  capabilityAssessmentBody: "Available after real work — never mandatory.",
  advancedDetails: "Advanced details",
  noTutorial: "No tutorial — the interface teaches through action.",
} as const;

export type UserGoalI18nKey = keyof Pick<
  typeof ZERO_LEARNING_CURVE_EN,
  | "goalResearch"
  | "goalVerify"
  | "goalCompare"
  | "goalContinue"
  | "goalCreate"
  | "goalCollaborate"
  | "goalPublish"
>;
