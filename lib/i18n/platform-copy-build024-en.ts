/** BUILD-024 — Living Intelligence: research topic depth and command feedback. */

export const RESEARCH_TOPIC_DEPTH_EN = {
  cockpitEyebrow: "Research cockpit",
  currentStage: "Current stage",
  researchReadiness: "Research readiness",
  researchHealth: "Research health",
  currentWorkflow: "Current workflow",
  blockingFactors: "Blocking factors",
  noBlockingFactors: "No blocking factors detected.",
  recommendedNext: "Recommended next action",
  latestActivity: "Latest research activity",
  noWorkspaceActivity: "No workspace activity recorded yet.",
  resumeSession: "Continue where you left off — last visited stage: {stage}.",
  noPreviousSession: "No previous session recorded yet.",
  quickActionsEyebrow: "Next steps",
  quickActionsTitle: "Quick actions",
  openWorkspace: "Open workspace",
  openWorkspaceDetail: "Continue research review for this topic",
  exploreRelated: "Explore related topics",
  exploreRelatedDetail: "Catalog connections in overview",
  viewGraph: "View research graph",
  viewGraphDetail: "Knowledge connections",
  reviewNotebook: "Review notebook",
  reviewNotebookDetail: "Structured research notebook",
  topicLabel: "Topic: {name}",
  intelligenceEyebrow: "Research intelligence",
  missionLifecycle: "Mission lifecycle",
  workflowState: "Workflow state",
  evidenceConnected: "Evidence connected",
  openQuestions: "Open questions",
  analysisSteps: "Analysis steps run",
  unknown: "Unknown",
  noEvidenceConnected: "No evidence connected yet.",
  noFurtherAction: "No further action is recommended right now.",
  evidenceItems: "Evidence items",
  knownFacts: "Known facts",
  unknowns: "Unknowns",
  emptySections: "Not yet available: {sections}",
  evidenceStatus: "Evidence status",
  knownEvidenceGaps: "Known evidence gaps",
  noKnownEvidenceGaps: "No known evidence gaps recorded.",
  reasoningSummary: "Reasoning summary",
  noVerifiedFacts:
    "No facts have been independently verified yet — nothing connected has reached verified status.",
  recommendedNextStep: "Recommended next step",
  relatedEntitiesNetwork: "Related entities and network connections",
  noRelatedEntities: "No related organizations or datasets connected yet.",
  recentTimelineActivity: "Recent real timeline activity",
  noResearchActivity: "No research activity recorded yet.",
  quickActionsAriaLabel: "Quick actions",
} as const;

export const COMMAND_FEEDBACK_EN = {
  unrecognized: '"{input}" is not a recognized command yet — unmatched input is never guessed at.',
  openEntity: "Open {name}",
} as const;

export const PROJECT_HOME_EN = {
  saveQuestionObjectives: "Save",
  questionPlaceholder: "What does this project need to accomplish?",
  relatedEntities: "Related entities",
  entitiesEmpty: "No entities linked yet. Link a country, company, university, or research topic.",
  entitiesBookmarkNote:
    "Linked entities belong to this project. Bookmarking saves an entity to your workspace everywhere.",
  questionSaved: "Question and objectives saved.",
  methodologyUserCreated: "User-created, not AI-generated",
  methodologyUserCreatedDetail:
    "Projects, notes, tasks, and evidence references are created only by you — never auto-generated.",
  methodologyRealLinks: "Real entity links only",
  methodologyRealLinksDetail:
    "Related entities are only ever real catalog entries you explicitly linked.",
  methodologyNoScore: "No project score",
  methodologyNoScoreDetail:
    "CBAI does not compute a fabricated quality score — progress is a real count of completed milestones.",
  methodologyStorage: "Storage",
  methodologyStorageDetail:
    "Signed into a cloud account, projects sync across your devices; otherwise they stay in this browser only.",
} as const;
