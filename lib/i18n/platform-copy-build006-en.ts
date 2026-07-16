/** BUILD-006 — extended platform copy (English). Imported into en.ts dictionary. */

export const ERRORS_PAGES_EN = {
  notFoundEyebrow: "404",
  notFoundTitle: "Page not found",
  notFoundMessage:
    "This page doesn't exist — it may have moved, or the link may be out of date. Everything else on CBAI is still one click away.",
  errorEyebrow: "Unexpected Error",
  errorTitle: "Something went wrong",
  errorMessage:
    "An unexpected error interrupted this page. Nothing you've saved was lost — Projects, notes, and evidence stay in this browser regardless. Try again, or head back to something that works.",
  researchNotFoundEyebrow: "Not Found",
  researchNotFoundTitle: "Research topic not found",
  researchNotFoundMessage:
    "This topic is not in the Research catalog — it may have been renamed or the link may be out of date. Browse available topics to find what you're looking for.",
} as const;

export const SEARCH_EN = {
  hint: "Search country, company, or university.",
  ariaLabel: "Search country, company, or university",
  placeholder: "Japan, Apple, Harvard University",
  submit: "Search",
  publicIntelligence: "Public Intelligence",
  partOf: "Part of",
  availableToday: "available today.",
  noResults: 'No matching country, company, university, or research topic was found for "{query}".',
  noOpenableResults: 'No open-able profile or connected topic was found for "{query}".',
  noResultsHint:
    "Search only matches names already in the local registry — try a shorter term, check the spelling, or start from one of these:",
  tryExample: "Try an example",
  exampleCountry: "Country",
  exampleCompany: "Company",
  exampleUniversity: "University",
  exampleResearch: "Research Topic",
  openProfile: "Open profile",
  openProfileArrow: "Open profile →",
  compareArrow: "Compare →",
  openReportsArrow: "Open reports →",
  createProjectArrow: "Create Project →",
  matched: "Matched: {name}",
  profilesPickOne: "{count} profile · pick one to open",
  profilesPickMany: "{count} profiles · pick one to open",
  resultsFor: "Results for",
  groupCountries: "Countries",
  groupCompanies: "Companies",
  groupUniversities: "Universities",
  groupResearch: "Research topics",
  groupProjects: "Projects",
  opensTo: "Opens to",
  exampleSearchesAria: "Example searches",
  voiceSummary: "Read aloud",
  voiceSummaryStop: "Stop reading",
} as const;

export const EVIDENCE_EN = {
  description:
    "Official source status and available information across country, company, and university profiles.",
  sourcesConnected: "Sources connected",
  informationConnected: "Information connected",
  profilesAvailable: "Profiles available",
} as const;

export const FILTERS_EN = {
  searchCountries: "Search countries…",
  searchCompanies: "Search companies…",
  searchUniversities: "Search universities…",
  allRegions: "All Regions",
  allIndustries: "All Industries",
  allCountries: "All Countries",
  allTypes: "All Types",
  all: "All",
  industry: "Industry",
  countryLabel: "Country",
  resultCountry: "{count} country",
  resultCountries: "{count} countries",
  resultCompany: "{count} company",
  resultCompanies: "{count} companies",
  resultUniversity: "{count} university",
  resultUniversities: "{count} universities",
  selected: "Selected",
} as const;

export const SETTINGS_EN = {
  description: "Your CBAI Personal Operator — saved to this browser.",
  operatorReady: 'Your CBAI Personal Operator is ready — saved to this browser as "{name}."',
  operatorNotReady: "Your CBAI Personal Operator is not set up yet — add your name below to activate it.",
  identityHeading: "Personal Operator Identity",
  yourName: "Your Name",
  yourNamePlaceholder: "e.g. Botir",
  operatorName: "Operator Name",
  workspaceRole: "Workspace role",
  avatar: "Avatar",
  voiceLanguageHeading: "Voice & Language",
  showVoiceInput: "Show voice input in the Command Center",
  preferredLanguage: "Preferred Language",
  futureTranslationLanguage: "Future Translation Language",
  speechLanguage: "Speech Language (voice recognition)",
  speechEnUs: "English (United States)",
  speechEnGb: "English (United Kingdom)",
  languageNotAvailable: " (not available yet)",
  languageHonestyNote:
    "English, Oʻzbek, Русский, and Türkçe are fully implemented in this platform's interface today. The other language options above are saved preferences, honestly marked unavailable rather than silently doing nothing. Voice recognition (speech-to-text) currently supports English only, regardless of your interface language.",
  contextHeading: "Context",
  country: "Country",
  countryNotSet: "Not set",
  organization: "Organization",
  organizationPlaceholder: "Optional",
  timezone: "Timezone",
  notificationsHeading: "Notification Preferences",
  notificationsHonesty:
    "Preferences are saved, but no notification delivery is connected to this platform yet — nothing will be sent until it is.",
  notifyEvidenceUpdates: "Evidence updates",
  notifyMissionActivity: "Mission activity",
  notifyWeeklySummary: "Weekly summary",
  themeHeading: "Interface Theme",
  themeNote:
    "System follows your device's real light/dark preference. Light and Deep are an explicit override, saved to this profile.",
  accessibilityHeading: "Accessibility Settings",
  reduceMotion: "Reduce motion",
  increaseContrast: "Increase contrast",
  largerText: "Larger text",
  interfaceLanguage: "Interface language",
  voiceLanguage: "Voice-recognition language",
  accessibility: "Accessibility",
  saveProfile: "Save profile",
  resetProfile: "Reset Personal Operator on this browser",
} as const;

export const DASHBOARD_EN = {
  description: "Public Intelligence — what is available today on CBAI.",
} as const;

export const REPORTS_COMMON_EN = {
  countryReportEyebrow: "Country Intelligence Report",
  companyReportEyebrow: "Company Intelligence Report",
  universityReportEyebrow: "University Intelligence Report",
  projectReportEyebrow: "Project Intelligence Report",
  researchReportEyebrow: "Research Intelligence Report",
  generated: "Generated {date}",
  overview: "Overview",
  region: "Region",
  capital: "Capital",
  government: "Government",
  officialWebsite: "Official website",
  noVerifiedInfo: "No verified information available.",
  evidence: "Evidence",
  evidenceSummary:
    "{connected} of {total} official sources connected · {indicators} indicators connected · {questions} open questions.",
  connectedEvidence: "Connected Evidence",
  missingEvidence: "Missing Evidence",
  noSourcesConnected: "No official sources connected yet.",
  noMissingSources: "No missing sources — every tracked source is connected.",
  research: "Research",
  organizations: "Organizations",
  relatedCompanies: "Related companies",
  relatedUniversities: "Related universities",
  projects: "Projects",
  noRelatedCompanies: "No related companies in the current catalog.",
  noRelatedUniversities: "No related universities in the current catalog.",
  noProjectsLinked: "No projects link to this entity yet.",
  createProjectFor: "+ Create a project for {name} →",
  methodology: "Methodology",
  trustStatement: "Trust Statement",
  limitations: "Limitations",
} as const;

export const TRUST_PAGE_EN = {
  pageDescription:
    "How CBAI earns trust — one place for the constitution, methodology, and policies that govern the platform.",
  homeLink: "Home",
  homeLinkHint: "page's trust summary.",
  sectionsNav: "Trust sections",
  verificationIntro:
    "Every profile and topic on this platform carries one of four honest labels, always shown as a full sentence, never a bare word or color alone:",
  constitution: {
    title: "Constitution",
    body: [
      "Help people make better decisions using evidence. Never manipulate. Never fabricate. Never become political. Always explain. Always remain transparent.",
      "Governing document: CBAI Constitution v1.",
    ],
  },
  methodology: {
    title: "Methodology",
    body: ["Evidence is connected and reviewed before any conclusion is presented — never the reverse."],
  },
  verificationModel: {
    title: "Verification Model",
    body: [
      "Every profile and topic on this platform carries one of four honest labels, always shown as a full sentence, never a bare word or color alone:",
    ],
  },
  evidencePolicy: {
    title: "Evidence Policy",
    body: [
      "Every claim on this platform must trace to a connected, named source — or be labeled as missing.",
      "Sources come before conclusions. No claim is presented as verified until a real source is connected.",
      "Uncertainty is visible. When evidence is partial or missing, the platform says so — never hides gaps behind confident language.",
    ],
  },
  dataSources: {
    title: "Data Sources",
    body: [
      "Official sources this platform is built to connect to, by category:",
      "A source only counts as connected once real, verifiable data from it is linked to a profile — never assumed from the category alone.",
    ],
  },
  humanDecision: {
    title: "Human Decision",
    body: [
      "Humans decide. CBAI connects evidence and explains options — it never replaces human judgment.",
      "Every reasoning result this platform produces carries a human-decision-required flag that is always true — verified by automated test, never left to chance.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "Two account types exist: a Device-Local Account (email, password, display name, organization — hashed and salted with your browser's own cryptography, stored only in this browser, never sent anywhere) and, where this deployment is configured for it, a real Cloud Account backed by Supabase.",
      "Row Level Security is enforced on every cloud table: only your own signed-in session can read, write, or delete your records.",
      "There is no analytics, no tracking script, and no third party ever receives this data.",
      "A complete privacy policy will be published ahead of any commercial or public launch, once legal review is complete.",
    ],
  },
  termsOfUse: {
    title: "Terms of Use",
    body: [
      "This is a minimum, honest statement of real current behavior — not a substitute for a lawyer-drafted Terms of Service.",
      "CBAI is provided as-is, with no warranty of accuracy, completeness, or fitness for a particular purpose.",
      "You are responsible for verifying any information before relying on it for a real decision.",
      "Device-Local accounts and locally stored data may be lost if this browser's storage is cleared.",
      "Cloud Account deletion may require contacting the operator of this deployment until a real self-service flow is built.",
    ],
  },
  copyright: {
    title: "Copyright",
    body: [
      "CBAI does not claim ownership of third-party data, flags, logos, publications, datasets, or government materials referenced in this platform.",
      "Original CBAI platform content and design are the property of CBAI.",
    ],
  },
  knownLimitations: {
    title: "Known Limitations",
    body: [
      "Coverage today is intentionally shown as it really is: most profiles have only a small number of official sources connected so far.",
      "Device-Local accounts (email/password, hashed and salted on-device) have no server to verify them and no cross-device sync — Projects, notes, and saved work stay on the device that created them.",
      "Governance, Investor, and Citizen workspaces, and Knowledge Graph and Reasoning views, are still early — treat their current depth as a preview.",
    ],
  },
  transparency: {
    title: "Transparency Statement",
    body: [
      "CBAI shows what is connected, what is missing, and what is still in development — never more than the evidence supports.",
      "There is no support or contact channel connected yet.",
    ],
  },
} as const;

export const GRAPH_EN = {
  description: "Navigate verified relationships between platform entities.",
  graphByRole: "Graph by Role",
  howItWorks: "How It Works",
  trust: "Trust",
} as const;

export const REASONING_EN = {
  description: "How official information supports review before decisions.",
  extendedDescription:
    "How evidence is reviewed before decisions — clear steps and related information by topic.",
  reviewSteps: "Review steps",
  topicAreas: "Topic areas",
  informationConnected: "Information connected",
  sourcesConnected: "Sources connected",
} as const;
