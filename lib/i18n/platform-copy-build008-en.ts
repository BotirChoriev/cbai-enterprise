/** BUILD-008 — entity intelligence, research topic, governance, reports, graph UI, about, reset password. */

export const ENTITY_INTELLIGENCE_EN = {
  fromSearch: 'From search: "{query}"',
  comparables: "Comparables",
  timelineDetail: "Timeline detail",
  intelligenceContext: "Intelligence Context",
  relatedEntities: "Related entities",
  reports: "Reports",
  openQuestions: "Open questions",
  availableInformation: "Available information",
  missingInformation: "Missing information →",
  noOfficialInformation: "No official information is connected for this profile yet.",
  availableNow: "Available now",
  sourceStatus: "Source status",
  sourcesConnected: "sources connected",
  sourcesConnectedSummary: "{connected} of {total} official source{plural} connected",
  topicsListedAbove: " · {count} topic{topicPlural} listed above",
  topicsAvailableNow: " · {count} topic{topicPlural} available now",
  compareDefaultHeading: "Compare",
  compareDefaultDescription: "Side-by-side official information for this profile.",
  generateReport: "Generate report",
  hideReport: "Hide report",
  openReportsCenter: "Open Reports Center",
  entityTypeCountry: "Country",
  entityTypeCompany: "Company",
  entityTypeUniversity: "University",
  factGovernment: "Government",
  factFounded: "Founded",
  factOfficialWebsite: "Official website",
  governanceLensTitle: "Governance Intelligence — institutional record first",
  governanceLensBody:
    "Entered from the Government workspace — the evidence timeline and institutional coverage below come before the narrative profile.",
  investorLensTitle: "Economic Intelligence — comparables first",
  investorLensBody:
    "Entered from the Investor workspace — comparables and indicator coverage below come before the narrative profile.",
} as const;

export const SOURCE_COVERAGE_EN = {
  countryHeading: "Source Coverage",
  countryDescription:
    "Official evidence sources from CBAI Evidence Infrastructure — connection status only, no live API integration.",
  companyHeading: "Official Source Coverage",
  companyDescription:
    "Per-source connection status for this company profile — no live API integration.",
  universityHeading: "Official Source Coverage",
  universityDescription:
    "Per-source connection status for this university profile — no live API integration.",
  publisher: "Publisher",
  confidence: "Confidence",
  citation: "Citation",
  supportedIndicators: "{count} supported indicator{plural}",
} as const;

export const ENTITY_RELATIONSHIPS_EN = {
  countryHeading: "Relationships",
  countryDescription:
    "Verified catalog links to companies and universities in the same country registry.",
  countryEmpty: "No verified relationships yet — connections appear once a company, university, or research topic in the catalog references this country.",
  exploreCompanies: "Explore Companies",
  exploreUniversities: "Explore Universities",
  companyHeading: "Knowledge Graph",
  companyDescription:
    "Catalog-derived adjacency from local registries — not partnership or competitor claims.",
  companyEmpty:
    "No verified relationships yet — connections appear once a country, university, or research topic in the catalog references this company.",
  partnerClaims: "Partner / competitor claims",
  partnerClaimsNotShown: "Not shown — requires connected partnership evidence.",
  universityHeading: "Knowledge Graph",
  universityDescription:
    "Catalog-derived links from local registries — not rankings or employability scores.",
  universityEmpty:
    "No verified relationships yet — connections appear once a country, company, or research topic in the catalog references this university.",
  researchPartnerships: "Research centers / partnerships / scholarships",
  researchPartnershipsNotShown: "Not shown — requires connected affiliation evidence.",
  relatedEntities: "Related Entities",
  verifiedCatalog: "Verified local catalog",
  evidenceMissing: "Evidence missing",
} as const;

export const RESEARCH_TOPIC_EN = {
  backToTopics: "← Back to Research topics",
  humanReviewNotice:
    "Human review is required before any scientific claim on this topic supports a decision.",
  experienceNotice:
    "Research Intelligence currently uses catalog information and verified platform models. Live scientific databases are not connected yet.",
  overviewEyebrow: "Research overview",
  quickOverview: "Quick overview",
  topicLabel: "Topic",
  domainLabel: "Domain",
  currentStatus: "Current status",
  methods: "Methods",
  evidenceTypes: "Evidence types",
  relatedTopics: "Related topics",
  noRelatedTopics: "No related topics from catalog metadata.",
  humanReview: "Human review",
  humanReviewDetail: "Required before any catalog connection supports a research decision.",
  topicsHeading: "Research topics",
  topicCount: "{count} topics",
} as const;

export const GOVERNANCE_CENTER_EN = {
  totalRules: "Total rules",
  criticalRules: "Critical rules",
  ruleCategories: "Rule categories",
  validationStepsLabel: "Validation steps",
  reviewStandards: "Review standards",
  reviewStandardsBody: "Platform rules grouped by topic — definitions for manual review.",
  ruleCount: "{count} rule{plural}",
  constitutionalPrinciples: "Constitutional Principles",
  constitutionalPrinciplesBody: "Supreme principles all platform modules inherit from the CBAI Constitution.",
  reviewProcess: "Review process",
  reviewProcessBody: "Steps for validating releases before they reach users.",
  stepLabel: "Step {order}",
  relatedTopics: "Related topics:",
  pillarsAria:
    "Governance rule registry: {categories} categories, {rules} rules, height proportional to each category's rule count",
  pillarsCaption:
    "Bar height shows registered rule count per governance category in the CBAI rule registry — not operational performance.",
  complianceReportModel: "Compliance Report Model",
  complianceReportBody:
    "Structural template for manual audits and future CI output — no checks executed here.",
  passedRules: "Passed rules",
  passedRulesDetail: "{count} — populated by future validators",
  failedRules: "Failed rules",
  failedRulesDetail: "{count} — populated by future validators",
  warnings: "Warnings",
  warningsDetail: "{count} — non-blocking findings",
  recommendations: "Recommendations",
  recommendationsDetail: "{count} — remediation guidance",
  moduleStatus: "Module ID: {moduleId} · Status: {status}",
  statusRegistered: "Registered",
  statusDeclared: "Declared — not automated",
  categories: {
    constitution: { label: "Constitution", purpose: "Supreme platform principles — evidence, neutrality, zero demo policy." },
    evidence: { label: "Evidence", purpose: "Source, status, and methodology requirements for all intelligence." },
    entity: { label: "Entity", purpose: "Golden Rule patterns for Countries, Companies, and Universities routes." },
    indicator: { label: "Indicator", purpose: "Registry lifecycle, methodology blocks, and future scoring rules." },
    ui: { label: "UI", purpose: "Surface compliance — no fake KPIs, charts, confidence, or AI wording." },
    persona: { label: "Persona", purpose: "Honest value for Citizen, Investor, Government, Student, Researcher, Academic." },
  },
  validationStepContent: {
    "module-proposal": {
      title: "Module Proposal",
      description: "New route or library registers intent, scope, and target personas before implementation.",
    },
    "standards-check": {
      title: "Standards Check",
      description: "Verify against CBAI Constitutional Standard and entity/UI standards suite.",
    },
    "evidence-check": {
      title: "Evidence Check",
      description: "Confirm source attribution, connection status labels, and methodology blocks.",
    },
    "persona-check": {
      title: "Persona Check",
      description: "All six personas receive honest current-value and future-capability copy.",
    },
    "accessibility-check": {
      title: "Accessibility Check",
      description: "Future WCAG validation for mobile-ready, accessible enterprise readability.",
    },
    "release-review": {
      title: "Release Review",
      description: "Manual constitution audit and compliance report sign-off before production release.",
    },
  },
  personas: {
    citizen: { title: "Citizen", protection: "UI rules block fake confidence and political framing — citizens see honest evidence status only." },
    investor: { title: "Investor", protection: "Evidence rules require source attribution before any due-diligence metrics appear." },
    government: { title: "Government", protection: "Persona rules ensure gap analysis replaces political ratings on government-facing modules." },
    student: { title: "Student", protection: "Zero demo policy prevents fake league tables and rankings on education routes." },
    researcher: { title: "Researcher", protection: "Constitution mandates reproducible indicator IDs and source slugs for research scoping." },
    academic: { title: "Academic", protection: "Methodology-before-metrics rules require citable methodology before evaluations ship." },
  },
  limits: {
    "no-automated-enforcement": {
      title: "No automated enforcement yet",
      description: "Rules are registered declaratively — runtime validation and CI gates are future work.",
    },
    "no-runtime-policy-changes": {
      title: "No runtime policy changes",
      description: "This center displays governance architecture — it does not toggle rules or policies live.",
    },
    "no-hidden-ai": {
      title: "No hidden AI",
      description: "Governance Control is not an AI model panel — no provider health, token metrics, or agent toggles.",
    },
  },
} as const;

export const REPORTS_MODEL_EN = {
  statuses: {
    notAvailable: "Not available",
    registryFactsOnly: "Registry facts only",
    methodologyDefinitionsOnly: "Methodology definitions only",
    insufficientEvidence: "Insufficient Evidence",
    evidenceSourceNotConnected: "Evidence Source Not Connected",
    partialLocalRegistry: "Partial — local registry",
    definedInFramework: "Defined in framework",
    notApplicable: "Not applicable",
    planned: "Planned",
  },
  evidenceRequired: {
    country: "{count} registered country indicators with connected official sources",
    company: "{count} registered company indicators with connected official sources",
    university: "{count} registered university indicators with connected official sources",
    investor:
      "Connected fiscal, procurement, and company indicators across official sources",
    government: "Domain-level indicator coverage with methodology gaps documented",
    research: "Exportable indicator registry with source attribution and status labels",
    academic: "Complete four-field methodology per indicator with version reference",
  },
  reportTypes: {
    "country-intelligence": {
      title: "Country Intelligence Report",
      description: "Evidence-based country profile compiled from connected sources and indicator methodology.",
      audience: "Analysts, government, researchers",
    },
    "company-intelligence": {
      title: "Company Intelligence Report",
      description: "Company registry facts and indicator coverage — no market scores until evidence connects.",
      audience: "Investors, analysts, procurement",
    },
    "university-intelligence": {
      title: "University Intelligence Report",
      description: "University registry and education indicator readiness — not league tables.",
      audience: "Students, academics, government",
    },
    "investor-brief": {
      title: "Investor Brief",
      description: "Cross-entity evidence summary for due diligence scoping — requires connected fiscal and market sources.",
      audience: "Investors",
    },
    "government-brief": {
      title: "Government Brief",
      description: "Evidence gap analysis by domain for publication prioritization — not political ratings.",
      audience: "Government officials",
    },
    "research-brief": {
      title: "Research Brief",
      description: "Indicator definitions, source slugs, and connection status for reproducible scoping.",
      audience: "Researchers",
    },
    "academic-methodology": {
      title: "Academic Methodology Report",
      description: "Citable indicator methodology blocks and evidence requirements from the Global Indicator Framework.",
      audience: "Academics",
    },
  },
  exportFuture: {
    pdf: { format: "PDF", description: "Static export of verified evidence and methodology — not generated until readiness criteria met." },
    csv: { format: "CSV", description: "Structured indicator and source status export for research reproducibility." },
    api: { format: "API", description: "Programmatic access to report-ready data — requires governance release review." },
    mobile: { format: "Mobile", description: "Mobile-readable report views after accessibility validation in release pipeline." },
  },
  reportPersonas: {
    citizen: { title: "Citizen", usefulReports: ["Country Intelligence Report", "Government Brief"] as const },
    investor: { title: "Investor", usefulReports: ["Company Intelligence Report", "Investor Brief"] as const },
    government: { title: "Government", usefulReports: ["Government Brief", "Country Intelligence Report"] as const },
    student: { title: "Student", usefulReports: ["University Intelligence Report"] as const },
    researcher: { title: "Researcher", usefulReports: ["Research Brief", "Country Intelligence Report"] as const },
    academic: { title: "Academic", usefulReports: ["Academic Methodology Report", "Research Brief"] as const },
  },
  trustPillars: {
    "evidence-first": { title: "Evidence First", description: "Reports compile only from connected sources — no fabricated documents or metrics." },
    "source-attribution": { title: "Source Attribution", description: "Every report section will trace to registered source slugs and verification status." },
    "methodology-version": { title: "Methodology Version", description: "Report headers will include framework and methodology version references." },
    reproducibility: { title: "Reproducibility", description: "Export formats designed for audit — indicator IDs, sources, and status preserved." },
    "no-fabricated-metrics": { title: "No Fabricated Metrics", description: "No charts, KPIs, usage stats, or growth curves until evidence and methodology exist." },
  },
  exportFutureHeading: "Export Future",
  noFakeAnalyticsNotice: "No Fake Analytics Notice",
  personasHeading: "Personas",
  trustHeading: "Trust",
} as const;

export const GRAPH_UI_EN = {
  entityDetails: "Entity Details",
  clear: "Clear",
  searchEntities: "Search Entities",
  entityType: "Entity Type",
  allTypes: "All Types",
  evidenceStatus: "Evidence Status",
  relationshipCount: "Relationship Count",
  availableSources: "Available Sources",
  openModule: "Open {type} Module",
  connectedEntities: "Connected Entities",
  evidenceSummary: "Evidence Summary",
  relationshipStatus: "Relationship status",
  evidenceAvailable: "Evidence Available",
  evidenceMissing: "Evidence Missing",
  entityEvidenceStatus: "Entity evidence status",
  neighborCount: "{count} neighbor{plural}",
  evidenceRelationships: "Evidence Relationships",
  availableInformation: "Available Information",
  futureEvidence: "Future Evidence",
  legend: "Legend",
  activeEntityTypes: "Active Entity Types",
  verifiedRelationships: "Verified Relationships",
  plannedTypes: "Planned Types",
  futureTypeCount: "{count} future entity type{plural} prepared — not in graph index",
  entityTypes: {
    country: { label: "Countries", note: "Local country registry nodes." },
    company: { label: "Companies", note: "Local company catalog nodes." },
    university: { label: "Universities", note: "Local university registry nodes." },
    government: { label: "Government Institutions", note: "Future entity type — evidence source not connected." },
    industry: { label: "Industries", note: "Future entity type — sector nodes not connected." },
    infrastructure: { label: "Infrastructure", note: "Future entity type — not in graph index." },
    "natural-resources": { label: "Natural Resources", note: "Future entity type — not in graph index." },
    procurement: { label: "Procurement", note: "Future entity type — not in graph index." },
    "research-center": { label: "Research Centers", note: "Future entity type — relationship data not connected." },
    future: { label: "Future Entity Types", note: "Schema prepared — nodes appear only when registries connect." },
  },
  relationshipTypes: {
    "located-in": { label: "Located In", description: "Entity headquarters or campus country from local catalog fields." },
    "registered-in": { label: "Registered In", description: "Entity listed under a country registry profile." },
    "belongs-to": { label: "Belongs To", description: "Same-country catalog association between companies and universities." },
    "collaborates-with": { label: "Collaborates With", description: "Requires verified partnership evidence — not inferred by CBAI." },
    "evidence-available": { label: "Evidence Available", description: "Relationship derived from connected local registry data." },
    "evidence-missing": { label: "Evidence Missing", description: "Relationship type declared but source not connected." },
  },
  evidenceLabels: {
    localPlatformRegistry: "Local platform registry",
    partnershipVerification: "Partnership verification — not inferred",
  },
} as const;

export const ABOUT_PAGE_EN = {
  title: "About",
  pageDescription: "What CBAI is, why it exists, and the principles it holds itself to.",
  whoWeAreEyebrow: "Who we are",
  purposeHeadline: "Access to information has stopped being the hard part.",
  purposeBody:
    "Understanding it hasn't. Anyone can find a thousand documents about a country's economy, a company's exposure, or a field of research in seconds. Almost no one can tell, from that pile, what is actually known, what is missing, and what a decision built on it would really be standing on. That gap — between having information and understanding it — is the problem CBAI exists to close.",
  whatIsEyebrow: "What is CBAI",
  whatIsHeadline:
    "CBAI is an Intelligence Operating System — it connects evidence, tracks what is known and what is missing, and helps people reach clearer, better-supported decisions across research, economics, and governance.",
  whatIsBody:
    "Not a search engine that returns pages. Not a chat window that generates an answer. CBAI is a working environment: real country, company, university, and research profiles; a real evidence system that separates what is verified from what isn't; real projects that hold a question and its findings together; and real reports that show the reasoning, not just the conclusion.",
  whyEyebrow: "Why CBAI exists",
  whyHeadline: "The problem was never too little information. It was too much of it, disconnected.",
  whyClosing:
    "None of these are new problems. What's new is treating them as one problem — building a single place where evidence is connected once and reused everywhere it's relevant.",
  philosophyEyebrow: "Our philosophy",
  philosophyHeadline: "Twelve principles CBAI holds itself to — not slogans, working rules.",
  differentEyebrow: "What makes CBAI different",
  differentHeadline: "Not a better version of what exists. A different category of tool.",
  audiencesEyebrow: "Who CBAI is for",
  audiencesHeadline: "Built for people who need to understand before they decide.",
  workflowEyebrow: "How it works",
  workflowHeadline: "From question to clearer understanding — not from question to automated answer.",
  ecosystemsEyebrow: "Three intelligence ecosystems",
  ecosystemsHeadline: "One evidence core, three ways to work with it.",
  manifestoEyebrow: "What we believe",
  manifestoHeadline: "Twenty working beliefs — not marketing copy.",
  enterCBAI: "Enter CBAI →",
  trySearch: "Try Search →",
  openTrust: "Open Trust Center →",
  exploreResearch: "Explore Research →",
} as const;

export const RESET_PASSWORD_PAGE_EN = {
  pageDescription: "Complete a cloud account password reset.",
  passwordUpdated: "Password updated",
  passwordUpdatedBody: "Your cloud account password has been changed. You can sign in with it now.",
  chooseNewPassword: "Choose a new password",
  chooseNewPasswordBody:
    "This only works if you followed a real password-reset link sent to your email. If you opened this page directly, the request below will fail.",
  newPassword: "New password",
  confirmNewPassword: "Confirm new password",
  setNewPassword: "Set New Password",
  minPasswordLength: "Password must be at least {length} characters.",
} as const;
