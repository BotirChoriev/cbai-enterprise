/** BUILD-020 — EPIC-21 Zero Learning Curve / Invisible Operating System. */

export const ZERO_LEARNING_CURVE_EN = {
  gatewayEyebrow: "What do you want to do?",
  gatewayHint: "Search, pick a goal, or continue your project.",
  speak: "Speak",
  type: "Type",
  chooseGoal: "Choose goal",
  searchGoalHint: "Type above to search, or pick a goal below.",
  homeNoMissionLead: "State the problem you want to solve. CBAI links evidence, questions, and reports to that mission.",
  startMission: "Start a mission",
  continueMission: "Continue mission",
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
  reasoningPurpose: "Review how evidence supports a decision before you act.",
  evidenceMissionDescription: "Evidence linked to your mission — what is known, missing, or in conflict.",
  evidenceStatesExplainer: "Counts from your project and catalog sources.",
  reasoningNoMission: "Connect a mission to track reasoning against your evidence.",
  reasoningOpenNotes: "Open project notes",
  graphNoMission: "Start a mission to highlight related entities on the graph.",
  reportsEmptyAction: "Search a profile to generate a report",
  missionContinueBanner: "Your mission is in progress.",
  evidenceStatesEyebrow: "Evidence state",
  evidenceNoMission: "Start a mission to see how evidence supports your work.",
  evidenceNoMissionAction: "Choose a goal",
  evidenceEmpty: "No linked evidence yet for this mission.",
  evidenceEmptyAction: "Add evidence",
  simplicityAuditEyebrow: "Simplicity audit",
  simplicityAuditNote: "Heuristic scores only — no fabricated analytics.",
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
