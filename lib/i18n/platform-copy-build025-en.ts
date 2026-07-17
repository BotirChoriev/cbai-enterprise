/** BUILD-025 — Living Intelligence completion: research panels, project home, canvas lead. */

export const CANVAS_COMPLETION_EN = {
  homeIntelligenceLead: "Tell CBAI what you want to understand or change.",
} as const;

export const RESEARCH_TOPIC_PANELS_EN = {
  insightsAtGlance: "At a glance",
  insightsAriaLabel: "Topic insights",
  insightsAvailableToday: "Available today",
  insightsFutureEvidence: "Future evidence",
  insightsKnowledgeGaps: "Knowledge gaps",
  insightsOpenQuestions: "Open questions",
  supportingCounterEyebrow: "Supporting & counter evidence",
  supportingCounterDetail:
    "Real evidence only — counter evidence is never inferred, only shown when a verified contradicting relationship exists. Neither column implies a conclusion.",
  supportingEvidence: "Supporting evidence",
  counterEvidence: "Counter evidence",
  noSupportingEvidence: "No supporting evidence connected yet.",
  noCounterEvidence:
    "No counter evidence connected yet — this does not mean none exists, only that none is verified in this catalog.",
  evidenceStatusLabel: "Status: {status}",
  methodsEyebrow: "Methods",
  methodsTitle: "Related methods",
  methodsDetail: "Methods associated with this research topic in the catalog — not live study records.",
  relatedCompaniesTitle: "Related companies",
  relatedCompaniesEmpty: "No companies related to this topic yet.",
  relatedCompaniesNote:
    "Companies related by subject matter to this topic's domain — not a sponsorship or funding claim.",
  missionWorkspaceEyebrow: "Research mission workspace",
  missionWorkspaceHeading: "{topic}: what we know, what we don't",
  missionWorkspaceDetail:
    "Derived only from the existing catalog and evidence workspace — no invented findings.",
  missionSection: "Research mission",
  knownInformation: "Known information",
  unknowns: "Unknowns",
  evidenceGaps: "Evidence gaps",
  recommendedNextAction: "Recommended next action",
  notEnoughEvidence: "Not enough evidence available.",
  missionStatement: "Investigate {topic} within {domain}, using available catalog evidence.",
  knownClassified: "Classified under {domain}.",
  knownMethods: "Documented research methods: {methods}.",
  knownEvidenceTypes: "Recognized evidence categories: {types}.",
  knownCatalogStatus: "Catalog status: {status}.",
  unknownLiveFindings:
    "Live findings for the evidence categories above are not yet known — no official source has been connected for {topic}.",
  unknownReviewRequired:
    "{count} evidence {categoryWord} require human scientific review before anything can be assessed.",
  categoryWordSingular: "category",
  categoryWordPlural: "categories",
  gapSourceNotConnected: "{label} — source not connected.",
  reviewNotStarted: "Review not started.",
  futureWorkspaceEyebrow: "Future workspace",
  futureWorkspaceTitle: "Future research workspace",
  futureWorkspaceDetail:
    "This topic will support the following when sources are connected — none are active today.",
  futureLiterature: "Research literature",
  futureExperiments: "Experiments and replication",
  futureLaboratory: "Laboratories and equipment",
  futureResearchers: "Verified researchers and contributors",
  futureOpenQuestions: "Open questions",
  futureEvidenceDiscussions: "Evidence discussions",
  futureAiNotebook: "AI Notebook",
  futureOpenQuestionsItem: "Track unresolved research questions and evidence gaps for this topic",
  futureEvidenceDiscussionsItem: "Structured evidence discussions linked to topic catalog profile",
  futureAiNotebookItem: "Research notebook for catalog notes and human-reviewed observations",
  futureReplicationStatus: "Document replication status when study records connect",
  futureNegativeResults: "Track negative results without overstating conclusions",
  futureEquipmentInventories: "Equipment inventories and project metadata per lab profile",
  futureAffiliations: "Institutional affiliations when official sources connect",
  researcherReadiness: "Researcher readiness",
  researcherReadinessDetail:
    "Verified researchers and academic contributors will be supported in the future workspace — affiliations, research areas, and verification sources are not connected yet.",
  futureHumanReview: "Future workspace capabilities require human review before supporting any decision.",
  evidenceReviewEyebrow: "Evidence & review workflow",
  evidenceReviewDetail:
    "Available topic information — from catalog evidence categories through review readiness and the next research action.",
  availableEvidence: "Available evidence",
  availableEvidenceNav: "Available catalog evidence",
  selectedEvidence: "Selected evidence",
  selectedEvidenceDetail: "Selected evidence detail",
  noCatalogEvidence: "No catalog evidence categories listed.",
  noEvidenceToSelect: "No evidence category is available to select.",
  futureEvidenceConnection: "Future evidence connection",
  reviewReadiness: "Review readiness",
  nextResearchAction: "Next research action",
  reviewReadinessNav: "Review readiness and next actions",
  statusCatalogEvidence: "Catalog evidence",
  statusSourceNotConnected: "Source not connected",
  statusHumanReviewRequired: "Human scientific review required",
} as const;

export const PROJECT_HOME_COMPLETION_EN = {
  backToMyWork: "← My Work",
  questionObjectivesEyebrow: "Research question & objectives",
  researchQuestionLabel: "Research question",
  objectivesLabel: "Objectives",
  questionFieldPlaceholder: "What question is this project answering?",
  entityKindCountry: "Country",
  entityKindCompany: "Company",
  entityKindUniversity: "University",
  entityKindResearchTopic: "Research topic",
  entitySelectPlaceholder: "Select…",
  linkEntity: "Link entity",
  bookmarksEyebrow: "Bookmarks",
  bookmarksEmpty:
    "None of this project's linked entities are bookmarked yet — use the ☆ next to a linked entity above to bookmark it.",
  trustMethodologyEyebrow: "Trust & methodology",
  trustMethodologyIntro:
    "CBAI provides evidence-based project intelligence. Every entity link, note, and evidence reference in this project was added by the user — never inferred or fabricated.",
  removeBookmark: "Remove {name} bookmark",
  addBookmark: "Bookmark {name}",
  unlinkEntity: "Unlink {name}",
} as const;

export const COMMAND_FEEDBACK_COMPLETION_EN = {
  searchUnrecognized: 'Search for "{input}" →',
  uploadLabel: "Upload",
} as const;
