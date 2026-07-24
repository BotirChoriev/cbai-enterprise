/** BUILD-007 — final production-polish copy (English). */

export const ACCOUNT_PAGE_EN = {
  pageDescription:
    "A real local account — your Projects, Bookmarks, and Recent Activity stay separate from anyone else using this browser.",
  cloudAccount: "Cloud Account",
  deviceLocalAccount: "Device-Local Account",
  cloudSignedInActive: "●",
  localSignedInActive: "●",
  modeCloud: "Cloud Account — synced across devices",
  modeLocal: "Device-Local Account — this browser only",
  modeSignedOut: "Signed Out",
  cloudNotice:
    "Cloud account — verified by a real server (Supabase). Your Projects, Bookmarks, and Reports sync across every browser and device you sign into with this email.",
  localNotice:
    "Device-Local account — credentials are hashed and salted in this browser only. Nothing is sent to a server. Clearing site data removes this account.",
  emailNotConfirmed:
    "Your email is not confirmed yet. Check your inbox for a confirmation link — some cloud features may be limited until you confirm.",
  continueWorking: "Continue Working",
  signOutCloud: "Sign Out of Cloud",
  signOut: "Sign Out",
  signIn: "Sign in",
  createCloudAccount: "Create a cloud account",
  resetPassword: "Reset password",
  cloudSubtitle: "A real, server-verified account — sync your Projects, Bookmarks, and Reports across every device.",
  cloudNotConfigured:
    "Cloud accounts are not configured in this deployment yet (no Supabase project connected). You can still use a Device-Local Account below, or try submitting — the app will tell you plainly if it can't reach the cloud.",
  signInTab: "Sign In",
  createAccountTab: "Create Account",
  email: "Email",
  emailPlaceholder: "you@example.com",
  password: "Password",
  passwordSignUpPlaceholder: "At least 8 characters",
  passwordSignInPlaceholder: "Your password",
  forgotPassword: "Forgot password?",
  backToSignIn: "← Back to sign in",
  pleaseWait: "Please wait…",
  sendResetLink: "Send Reset Link",
  resetLinkSent: "If an account exists for that email, a password reset link has been sent.",
  accountCreatedConfirmEmail:
    "Account created. Check your email to confirm before all cloud features are available.",
  name: "Name",
  namePlaceholder: "Your name",
  organizationOptional: "Organization (optional)",
  organizationPlaceholder: "e.g. a university, company, or agency",
  localSignInTitle: "Sign in",
  localCreateTitle: "Create a local account",
  localSubtitle:
    "Sign in to keep your own Projects, Bookmarks, and Recent Activity separate from anyone else using this browser. Stays on this device only — for cross-device sync, use a Cloud Account instead.",
  projects: "Projects",
  bookmarks: "Bookmarks",
  memberSince: "Member since",
} as const;

export const REPORTS_CENTER_EN = {
  continuingFor: "Continuing review for",
  continuingBody: "Your profile review continues here — choose a report type below.",
  backToProfile: "← Back to profile",
  pageDescription: "What you can open today — official information required for each report type.",
  emptyIntro:
    "Reports are generated from real profile work — connected evidence, completed reasoning, and human-confirmed project output. Nothing is fabricated here.",
  emptyStepsHeading: "What produces a report",
  emptyStepEvidence: "Review evidence status on a country, company, or university profile",
  emptyStepWork: "Complete linked work in My Work with human confirmation",
  emptyStepOpen: "Return here when a draft or saved report exists",
  emptyActionSearch: "Search profiles",
  emptyActionEvidence: "Open Evidence",
  emptyActionMyWork: "Open My Work",
  whatCanIOpen: "What can I open today?",
  evidenceRequired: "Evidence required",
  openRelatedProfile: "Open related profile →",
  savedCount: "Your Saved Reports ({count})",
  savedAt: "Saved {date}",
  delete: "Delete",
} as const;

export const RESEARCH_WORKSPACE_EN = {
  title: "Research Workspace",
  backToResearch: "← Back to Research Intelligence",
  shellNotice: "This is a read-only workspace shell. Live evidence, collaboration, and analysis are not connected yet.",
  humanReviewNotice: "Human review is required before any future workspace output supports a decision.",
  topicNotFoundPrefix: '"{topicId}" is not a topic in the research catalog — check the link, or',
  browseAllTopics: "browse all research topics",
  selectedTopic: "Selected research topic:",
  continueReview: "— continue research review.",
  filterTopics: "Filter topics...",
  filterTopicsAria: "Research topics",
  statusShellAvailable: "Workspace shell available",
  statusFuture: "Future workspace",
  statusNotConnected: "Not connected yet",
  lifecycleDiscover: "Discover",
  lifecycleDiscoverDesc: "Browse the research catalog and topic profiles.",
  lifecycleUnderstand: "Understand",
  lifecycleUnderstandDesc: "Review methods, evidence types, and knowledge organization.",
  lifecycleReviewEvidence: "Review Evidence",
  lifecycleReviewEvidenceDesc: "Structure evidence review when sources connect — human review required.",
  lifecycleIdentifyGaps: "Identify Gaps",
  lifecycleIdentifyGapsDesc: "Track open questions and negative results as structured objects.",
  lifecycleFutureCollaboration: "Future Collaboration",
  lifecycleFutureCollaborationDesc: "Future collaboration space — not active today.",
} as const;

export const RESEARCH_HOME_EN = {
  title: "Research Intelligence",
  subheadline:
    "Connect research topics, experiments, publications, laboratories, universities, and evidence.",
  searchPlaceholder: "Search research topics, methods, organisms, diseases, technologies...",
  coreMessage:
    "Research Intelligence is not a social feed. It is a structured evidence workspace for scientific review.",
  searchButton: "Search research",
  statusHeading: "Research Intelligence status",
  availableToday: "Available today",
  notAvailableYet: "Not available yet",
  openWorkspace: "Open Research Workspace",
  pageDescription:
    "Explore catalog research topics and metadata connections in the Global Research Network.",
  statusLabel: "Research Intelligence: In development",
  workspaceEyebrow: "Research workspace",
  workspaceTitle: "Structured research workspace",
  workspaceBody:
    "Explore one topic from catalog, notebook, timeline, and graph perspectives — read-only shell until live evidence connects.",
  availableTodayItems: [
    "Ecosystem vision and product direction",
    "Research topics catalog (read-only)",
    "Topic exploration entry (this page)",
    "Public research intelligence positioning",
    "Link to university profiles in Public Intelligence",
  ],
  notAvailableYetItems: [
    "Live scientific databases",
    "Publication search and full-text access",
    "Researcher profiles and collaboration",
    "Live experiments and lab data",
    "AI-generated research summaries",
  ],
} as const;

export const GRAPH_PLATFORM_EN = {
  eyebrow: "Knowledge Graph",
  headline: "Core intelligence navigation layer",
  explanation:
    "The Knowledge Graph explains how entities are connected using verified local catalog relationships. It never states why a connection exists unless evidence supports it.",
  relationshipUnavailable: "Relationship data not connected.",
  noSelectionPrompt:
    "Select an entity on the graph to view evidence status, relationship count, and connected records.",
  searchPlaceholder: "Search by name or country…",
  registryNodes: "Registry nodes",
  verifiedEdges: "Verified edges",
  registryAvailable: "Registry available",
  evidenceConnected: "Evidence connected",
  evidenceUnavailable: "Evidence unavailable",
  insufficientEvidence: "Insufficient Evidence",
  notConnected: "Evidence Source Not Connected",
} as const;

export const TRUST_DATA_SOURCES_EN = {
  un: "Country-level institutional and treaty reporting.",
  worldBank: "Country and economic indicators.",
  imf: "Financial and macroeconomic reporting.",
  who: "Health system coverage.",
  unesco: "Education and research statistics.",
  ilo: "Labour market statistics.",
  itu: "Digital connectivity statistics.",
  oecd: "Economic co-operation and development data.",
  ocp: "Public procurement transparency.",
  nationalStats: "Per-country official statistics.",
  procurement: "Per-country procurement disclosure.",
  financeAudit: "Per-country budget transparency.",
} as const;

export const PREVIEW_PAGES_EN = {
  inDevelopmentEyebrow: "In development",
  agentsTitle: "AI Agents",
  agentsDescription: "Planned agent capabilities for this platform — not available yet.",
  agentsCapabilities: "Agent Capabilities",
  workflowsTitle: "Workflows",
  workflowsDescription: "Workflow builder coming soon — not available yet.",
  workflowsHeading: "Workflow builder coming soon",
  workflowsBody:
    "Design, deploy, and monitor automated workflows with human-in-the-loop approval gates.",
  coreTitle: "CBAI Core",
  coreDescription:
    "Core inference and agent orchestration are not active in this deployment. Use the modules below for live registry intelligence.",
  governancePreview: "Governance workspace — early preview. Depth is limited until evidence modules connect.",
  investorPreview: "Investor workspace — early preview. No investment recommendations are produced.",
  citizenPreview: "Citizen workspace — early preview. Public information only — not professional advice.",
} as const;

export const VALIDATION_EN = {
  passwordsDoNotMatch: "Passwords do not match.",
  requiredField: "This field is required.",
} as const;

export const ASSISTANT_VOICE_EN = {
  savedToWorkspace: 'Saved "{name}" to your workspace.',
  nothingToSaveYet: "Nothing to save yet — open a country, company, or university profile first.",
  uploadNotAvailable: "File upload requires a connected ingestion pipeline — not available yet.",
  speechDetected: "Speech detected — review the transcript below.",
  commandCenterAria: "CBAI Personal Operator command center",
  contextPrefix: "Context:",
  operatorContextTitle: "Operator context: {name}",
} as const;

export const MY_WORK_EXT_EN = {
  continueWorking: "Continue Working",
  recentlyViewed: "Recently Viewed",
  reportsSection: "Reports",
  reportsCenterLink: "Reports Center",
  reportsCenterDetail: "{count} report types defined for profile and comparison review.",
  evidenceReviews: "Evidence Reviews",
  evidenceReviewsEmpty:
    "No personal review history is connected yet. Platform-wide, {connected} of {total} evidence sources are connected — open",
  evidenceLink: "Evidence",
  evidenceReviewsSuffix: "to review current status.",
  savedWork: "Saved Work",
  signInBrowserHint: "to keep your work separate from others using this browser.",
  signInAccountHint: "to keep your own Projects and Bookmarks separate from anyone else using this browser.",
  continueResearchWorkspace: "Continue research",
  continueResearchWorkspaceDetail: "Pick up evidence review and notes where you left off.",
  continueResearchCatalog: "Research Catalog",
  continueResearchCatalogDetail: "Browse research topics, missions, and evidence status.",
  continueEvidence: "Evidence",
  continueEvidenceDetail: "Review official source status across profiles.",
  onboardingExploreResearch: "Explore Research",
  onboardingExploreCountries: "Explore Countries",
  onboardingSearchEvidence: "Search Evidence",
  onboardingConfigureOperator: "Set preferences",
  onboardingOpenTrust: "Open Trust Center",
  loading: "Loading…",
  advancedEngineSummary: "Mission engine (advanced)",
  advancedEngineHint: "Optional structured engine entry — not the primary next step.",
  createProjectSummary: "Create a project",
  secondaryExplore: "Also explore",
} as const;

export const RESEARCH_CATALOG_EN = {
  catalogEyebrow: "Research topics catalog",
  catalogTitle: "Browse research domains and topics",
  catalogDescription:
    "Structured read-only catalog with detail pages for each research topic. No live databases, publications, or researcher profiles are connected.",
  filterLabel: "Filter research topics",
  filterPlaceholder: "Filter by topic, method, domain, or evidence type...",
  showingCount: "Showing {filtered} of {total} research topics",
  noMatch: "No research topics match your filter.",
  tryDifferent: "Try a different domain or search term.",
  clearFilters: "Clear filters",
  methods: "Methods",
  sharedMethods: "Shared methods",
  sharedEvidenceTypes: "Shared evidence types",
  selectedTopicEyebrow: "Selected topic",
  evidenceTypes: "Evidence types",
  futureWorkspace: "Future workspace",
  openTopic: "Open topic",
  topicStatus: {
    catalog_available: "Catalog available",
    workspace_not_available: "Workspace not available",
    evidence_not_connected: "Evidence not connected",
  },
} as const;

export const RESEARCH_NETWORK_LEGEND_EN = {
  nodeTypesHeading: "Node types",
  researchTopicNode: "Research topic — catalog node",
  catalogAvailable: "Catalog available",
  connectionTypesHeading: "Connection types",
  interactionHeading: "Interaction",
  interactionBody:
    "Click a node to enter focus mode and review catalog metadata. Connected topics stay bright; unrelated nodes fade. Use Open topic to visit the research topic page.",
} as const;

export const RESEARCH_REVIEW_TIMELINE_EN = {
  ariaLabel: "Review timeline",
  heading: "Timeline",
  created: "Created",
  submitted: "Submitted",
  assigned: "Assigned",
  decision: "Decision",
  archived: "Archived",
  futureEventsNote:
    "Submitted, assigned, decision, and archived events appear when review workflow records are connected.",
} as const;

export const GRAPH_EXTENDED_EN = {
  whatCanILearn: "What can I learn?",
  personaGuidanceAria: "Knowledge graph persona guidance",
  pipelineAria: "How the knowledge graph connects Entity through Decision Intelligence",
  pipelineStages: [
    "Entity",
    "Relationship",
    "Evidence",
    "Reasoning",
    "Decision Intelligence",
  ] as const,
  personas: {
    citizen: {
      title: "Citizen",
      whatCanILearn:
        "Which public institutions and companies share a country registry link with universities — without popularity scores.",
    },
    investor: {
      title: "Investor",
      whatCanILearn:
        "Catalog-level entity adjacency only. Investment or partnership claims require connected financial evidence.",
    },
    government: {
      title: "Government",
      whatCanILearn:
        "Government form labels from country registry when linked. No political recommendations from graph traversal.",
    },
    student: {
      title: "Student",
      whatCanILearn:
        "University location and same-country company listings from local registries — not rankings or employability scores.",
    },
    researcher: {
      title: "Researcher",
      whatCanILearn: "Exportable relationship list with evidence status per edge for reproducible scoping.",
    },
    academic: {
      title: "Academic",
      whatCanILearn: "How CBAI separates catalog-derived links from verified collaboration evidence.",
    },
  },
  trustPillars: {
    evidence: {
      title: "Evidence",
      description:
        "Edges exist only when local registries provide verifiable linkage. No inferred or weighted relationships.",
    },
    methodology: {
      title: "Methodology",
      description:
        "Graph builder derives nodes from entity adapters and edges from catalog rules — not AI clustering.",
    },
    neutrality: {
      title: "Neutrality",
      description: "The graph does not recommend paths, rank entities, or endorse partnerships.",
    },
    transparency: {
      title: "Transparency",
      description:
        "Each relationship shows status: evidence available from catalog or evidence missing for future types.",
    },
  },
} as const;

export const ENTITY_UI_EN = {
  notAssessed: "Not assessed",
  notAvailable: "Not available",
  notConnected: "Not connected",
  officialWebsite: "Official website",
  publicationDate: "Publication date",
  openSourceLink: "Open source link",
  connected: "Connected",
  planned: "Planned",
  noVerifiedData: "No verified data available.",
  noVerifiedInfo: "No verified information available.",
  benchmarkCountry: "Benchmark this country against others in the registry before reading the full profile.",
  benchmarkCompany: "Benchmark this company against others in the registry before reading the full profile.",
  noRelationshipsCountry:
    "No verified relationships yet — connections appear once a company, university, or research topic in the catalog references this country.",
  noRelationshipsCompany:
    "No verified relationships yet — connections appear once a country, university, or research topic in the catalog references this company.",
  searchCountries: "Search countries…",
  dataStatusLegend: "Data status legend",
  searchResults: "Search results",
  capitalLabel: "Capital",
  indicatorConnectedOne: "1 indicator connected",
  indicatorConnectedMany: "{count} indicators connected",
  officialInformationAvailable: "Official information available.",
  officialInformationNotAvailableYet: "Official information is not available yet.",
  foundedLabel: "Founded",
} as const;

export const INDICATOR_EXPLORER_EN = {
  coverageHeading: "Coverage Status",
  coverageLead: "Connection posture from Evidence Infrastructure — not evaluative metrics.",
  coverageStatus: "Coverage status",
  connectedSources: "Connected sources",
  plannedConnectors: "Planned connectors",
  humanReviewRequired: "Human review required",
  sourcesHeading: "Official Sources & Connectors",
  sourcesLead: "Evidence Infrastructure sources and planned connectors for this indicator.",
  officialSources: "Official sources",
  noOfficialSources: "No official sources mapped.",
  requiredSource: "Required source",
  noConnectors: "No connectors mapped.",
  connectionConnected: "Connected",
  connectionPlanned: "Planned",
  connectionNotConnected: "Not connected",
} as const;

export const PROJECT_UI_EN = {
  researchQuestion: "Research Question",
  objectives: "Objectives",
  notes: "Notes",
  tasks: "Tasks",
  openQuestions: "Open Questions",
  timeline: "Timeline",
  entities: "Entities",
  noResearchQuestion: "No research question recorded yet.",
  noObjectives: "No objectives recorded yet.",
  noEntitiesLinked: "No entities linked to this project yet.",
  noRelatedCountry: "No related country in the current catalog.",
  noEvidence: "No evidence added yet.",
  noNotes: "No notes recorded yet.",
  noTasks: "No tasks added yet.",
  noOpenQuestions: "No open questions right now.",
  noTimeline: "No timeline activity recorded yet.",
} as const;

export const GOVERNANCE_PAGE_EN = {
  title: "Governance",
  description: "Platform rules, standards, and review process for evidence-based decisions.",
  previewNotice: "Governance control center — early preview. Rules and review workflows are not fully connected yet.",
} as const;
