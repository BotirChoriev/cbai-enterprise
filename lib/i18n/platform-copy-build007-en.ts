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
  statusHeading: "Research Intelligence status",
  availableToday: "Available today",
  notAvailableYet: "Not available yet",
  openWorkspace: "Open Research Workspace",
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
} as const;
