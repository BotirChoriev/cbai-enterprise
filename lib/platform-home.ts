/**
 * Platform Home — Elite final architecture (Evidence Intelligence Platform entrance).
 * Static, honest copy only. No fabricated metrics or promises.
 */

export type PlatformCapabilityStatus =
  | "available"
  | "in_progress"
  | "evidence_not_connected";

export type PlatformPersonaId =
  | "citizen"
  | "investor"
  | "government"
  | "student"
  | "researcher"
  | "academic";

export type PlatformPersona = {
  id: PlatformPersonaId;
  title: string;
  sentence: string;
  href: string;
  primaryAction: string;
  supportedModules: string[];
  currentCapability: string;
  futureCapability: string;
};

export type HeroTopicCard = {
  id: string;
  label: string;
  href?: string;
  connected: boolean;
};

export type HomeModuleIconId =
  | "countries"
  | "companies"
  | "universities"
  | "search"
  | "graph"
  | "reasoning"
  | "governance"
  | "agents"
  | "runtime";

export type HomeModule = {
  id: string;
  label: string;
  href: string;
  icon: HomeModuleIconId;
  status: PlatformCapabilityStatus;
  purpose: string;
  evidenceStatus: string;
  currentCapability: string;
  futureCapability: string;
  dependencies: string;
};

export type TrustPillar = {
  id: string;
  title: string;
  description: string;
};

export type GlobalImpactItem = {
  id: string;
  title: string;
  currentValue: string;
  futureRoadmap: string;
  href: string;
};

export type PlatformCapability = {
  id: string;
  label: string;
  status: PlatformCapabilityStatus;
  detail: string;
};

export type RoadmapTimelineItem = {
  id: string;
  title: string;
  status: "complete" | "in_progress" | "planned";
  note: string;
};

export type PlatformLanguage = {
  code: string;
  label: string;
  nativeLabel: string;
  available: boolean;
};

export const EVIDENCE_NOT_CONNECTED_LABEL = "Evidence Source Not Connected";
export const PLATFORM_VERSION = "0.1.0";
export const PLATFORM_BUILD = "elite-home-final";
export const PLATFORM_EVOLUTION_PHASE = "Final Home Architecture";

export const HOME_SEARCH = {
  placeholder:
    "Search countries, companies, universities, procurement, governance…",
  action: "/search",
  param: "q",
} as const;

export const HOME_HERO = {
  eyebrow: "Evidence Intelligence Platform",
  headline: "The operating system for evidence-based global intelligence",
  subHeadline:
    "Neutral infrastructure for verified public intelligence — built for decisions, not headlines.",
  explanation:
    "CBAI exists to help people make better decisions using evidence. Every conclusion requires a connected source or an honest label when evidence is missing.",
  principles: [
    {
      id: "evidence-first",
      title: "Evidence First",
      description: "Facts require connected sources.",
    },
    {
      id: "political-neutrality",
      title: "Political Neutrality",
      description: "No endorsements or partisan framing.",
    },
    {
      id: "transparency",
      title: "Transparency",
      description: "Missing data is labeled honestly.",
    },
  ],
  primaryCta: {
    label: "Explore Global Intelligence",
    href: "/countries",
  },
  secondaryCta: {
    label: "Browse Platform Modules",
    href: "#platform-modules",
  },
  understandPrompt: "What would you like to understand today?",
} as const;

export const HERO_TOPIC_CARDS: HeroTopicCard[] = [
  { id: "country", label: "Country", href: "/countries", connected: true },
  { id: "company", label: "Company", href: "/companies", connected: true },
  {
    id: "university",
    label: "University",
    href: "/universities",
    connected: true,
  },
  { id: "investment", label: "Investment", connected: false },
  { id: "procurement", label: "Public Procurement", connected: false },
  { id: "human-rights", label: "Human Rights", connected: false },
  { id: "governance", label: "Governance", href: "/countries", connected: true },
  { id: "search", label: "Global Search", href: "/search", connected: true },
];

export const PLATFORM_PERSONAS: PlatformPersona[] = [
  {
    id: "citizen",
    title: "General Citizen",
    sentence: "Follow public changes using verified facts — not popularity scores.",
    href: "/countries",
    primaryAction: "Open country intelligence",
    supportedModules: ["Countries", "Global Search"],
    currentCapability: "Registry facts and evidence-status blocks.",
    futureCapability: "Tender transparency and civic sentiment (non-official).",
  },
  {
    id: "investor",
    title: "Investor",
    sentence: "Scope opportunities when fiscal and procurement sources connect.",
    href: "/countries",
    primaryAction: "Review evidence scope",
    supportedModules: ["Countries", "Companies", "Global Search"],
    currentCapability: "Entity catalogs with withheld investment scores.",
    futureCapability: "Investor intelligence and sector comparison modules.",
  },
  {
    id: "government",
    title: "Government Leader",
    sentence: "Review governance indicators without platform political recommendations.",
    href: "/countries",
    primaryAction: "Open governance blocks",
    supportedModules: ["Countries", "Knowledge Graph"],
    currentCapability: "Governance blocks with honest source status.",
    futureCapability: "Government intelligence and early-warning indicators.",
  },
  {
    id: "student",
    title: "Student",
    sentence: "Study factual records and timelines as educational routes expand.",
    href: "/countries",
    primaryAction: "Browse factual registries",
    supportedModules: ["Countries", "Companies", "Universities"],
    currentCapability: "Local catalog browsing with evidence labels.",
    futureCapability: "Case studies and educational explanations.",
  },
  {
    id: "researcher",
    title: "Researcher",
    sentence: "Trace relationships and evidence status reproducibly across modules.",
    href: "/graph",
    primaryAction: "Open knowledge graph",
    supportedModules: ["Knowledge Graph", "Evidence Reasoning", "Global Search"],
    currentCapability: "Catalog-derived graph and pipeline structure demo.",
    futureCapability: "Dataset exports and cross-domain correlation tools.",
  },
  {
    id: "academic",
    title: "Academic",
    sentence: "Cite methodology labels and source connectivity in scholarly work.",
    href: "/countries",
    primaryAction: "View methodology blocks",
    supportedModules: ["Countries", "Companies", "Evidence Reasoning"],
    currentCapability: "Evidence-status and neutrality disclosures.",
    futureCapability: "Complete methodology documentation and collaboration tools.",
  },
];

export const HOME_MODULES: HomeModule[] = [
  {
    id: "countries",
    label: "Countries",
    href: "/countries",
    icon: "countries",
    status: "available",
    purpose: "Country intelligence from factual registries and evidence blocks.",
    evidenceStatus: "Local catalog connected",
    currentCapability: "Registry profiles, persona guidance, withheld scores.",
    futureCapability: "External governance, tender, and fiscal sources.",
    dependencies: "Local country catalog; entity profile resolution.",
  },
  {
    id: "companies",
    label: "Companies",
    href: "/companies",
    icon: "companies",
    status: "available",
    purpose: "Company intelligence from local catalog records.",
    evidenceStatus: "Local catalog connected",
    currentCapability: "Constitution-compliant profiles; financial blocks withheld.",
    futureCapability: "Corporate registry and procurement evidence.",
    dependencies: "Local company catalog; country link derivation.",
  },
  {
    id: "universities",
    label: "Universities",
    href: "/universities",
    icon: "universities",
    status: "in_progress",
    purpose: "University intelligence from local institution catalog.",
    evidenceStatus: "Catalog connected — remediation in progress",
    currentCapability: "Registry browsing; fabricated rankings being removed.",
    futureCapability: "Academic evidence sources and aligned blocks.",
    dependencies: "Local university catalog; country link derivation.",
  },
  {
    id: "search",
    label: "Global Search",
    href: "/search",
    icon: "search",
    status: "in_progress",
    purpose: "Unified discovery across entity catalogs.",
    evidenceStatus: "Partial — score ranking under revision",
    currentCapability: "Text search across local entity records.",
    futureCapability: "Evidence-status-aware ranking and filters.",
    dependencies: "Entity adapters for countries, companies, universities.",
  },
  {
    id: "graph",
    label: "Knowledge Graph",
    href: "/graph",
    icon: "graph",
    status: "available",
    purpose: "Visualize relationships between platform entities.",
    evidenceStatus: "Local link derivation only",
    currentCapability: "Graph from catalog-derived located-in links.",
    futureCapability: "Provenance metadata and external relationships.",
    dependencies: "Entity catalogs and adapter-derived edges.",
  },
  {
    id: "reasoning",
    label: "Evidence Reasoning",
    href: "/reasoning",
    icon: "reasoning",
    status: "available",
    purpose: "Demonstrate evidence-to-decision pipeline structure.",
    evidenceStatus: "Simulation disclosed",
    currentCapability: "Interactive pipeline demo — no live inference.",
    futureCapability: "Governed reasoning with full audit trace.",
    dependencies: "Evidence engine (backend); UI simulation only today.",
  },
  {
    id: "governance",
    label: "Governance Console",
    href: "/ai-control",
    icon: "governance",
    status: "in_progress",
    purpose: "System governance and command routing surface.",
    evidenceStatus: "Evidence Source Not Connected",
    currentCapability: "Interface shell only.",
    futureCapability: "Policy-bound execution with human oversight.",
    dependencies: "Runtime policy layer; not connected to UI actions.",
  },
  {
    id: "agents",
    label: "Agent Operations",
    href: "/agents",
    icon: "agents",
    status: "in_progress",
    purpose: "Agent capability catalog and operational visibility.",
    evidenceStatus: "Metrics not bound to live runtime",
    currentCapability: "Capability definitions on display.",
    futureCapability: "Observability-bound operations view.",
    dependencies: "Agent runtime; UI not wired to live metrics.",
  },
  {
    id: "runtime",
    label: "Runtime Monitor",
    href: "/dashboard",
    icon: "runtime",
    status: "available",
    purpose: "In-process runtime health and queue state.",
    evidenceStatus: "Local session observability",
    currentCapability: "Development runtime metrics for current session.",
    futureCapability: "Production telemetry with tenant isolation.",
    dependencies: "In-process observability singletons.",
  },
];

export const TRUST_PILLARS: TrustPillar[] = [
  {
    id: "evidence-first",
    title: "Evidence First",
    description:
      "Nothing is presented as fact without a traceable source path or an explicit insufficient-evidence label.",
  },
  {
    id: "transparent-methodology",
    title: "Transparent Methodology",
    description:
      "Methods are documented before scores ship. Users see how conclusions would be formed.",
  },
  {
    id: "political-neutrality",
    title: "Political Neutrality",
    description:
      "No national, partisan, or ideological endorsements appear in intelligence output.",
  },
  {
    id: "human-oversight",
    title: "Human Oversight",
    description:
      "Platform intelligence supports human decisions — it does not replace accountability.",
  },
  {
    id: "source-attribution",
    title: "Source Attribution",
    description:
      "Connected sources are identified. Disconnected sources are never implied.",
  },
  {
    id: "explainability",
    title: "Explainability",
    description:
      "Every future score shows inputs, method steps, and evidence status.",
  },
  {
    id: "confidence-calculation",
    title: "Confidence Calculation",
    description:
      "Confidence derives from evidence quality — zero when inputs are insufficient.",
  },
  {
    id: "no-fabricated-data",
    title: "No Fabricated Data",
    description:
      "Insufficient evidence and disconnected sources are stated explicitly — never hidden.",
  },
];

export const GLOBAL_IMPACT: GlobalImpactItem[] = [
  {
    id: "citizen",
    title: "Citizen",
    currentValue: "Registry facts and evidence-status on country intelligence.",
    futureRoadmap: "Tender transparency, civic modules, plain-language layer.",
    href: "/countries",
  },
  {
    id: "investor",
    title: "Investor",
    currentValue: "Entity catalogs with honest withholding of investment scores.",
    futureRoadmap: "Investor intelligence, sector comparison, procurement feeds.",
    href: "/countries",
  },
  {
    id: "government",
    title: "Government",
    currentValue: "Governance blocks without political recommendations.",
    futureRoadmap: "Government intelligence dashboard and regional indicators.",
    href: "/countries",
  },
  {
    id: "student",
    title: "Student",
    currentValue: "Factual registries across countries, companies, universities.",
    futureRoadmap: "Case studies, timelines, and educational explanations.",
    href: "/countries",
  },
  {
    id: "researcher",
    title: "Researcher",
    currentValue: "Knowledge graph and evidence-status for reproducible scoping.",
    futureRoadmap: "Dataset exports, correlation tools, scenario analysis.",
    href: "/graph",
  },
  {
    id: "academic",
    title: "Academic",
    currentValue: "Methodology labels and neutrality notices for citation.",
    futureRoadmap: "Full methodology docs, indicator definitions, collaboration.",
    href: "/countries",
  },
];

export const PLATFORM_CAPABILITIES: PlatformCapability[] = [
  {
    id: "web",
    label: "Web application",
    status: "available",
    detail: "Static export with responsive platform shell.",
  },
  {
    id: "countries",
    label: "Countries intelligence",
    status: "available",
    detail: "Constitution-compliant registry and evidence blocks.",
  },
  {
    id: "companies",
    label: "Companies intelligence",
    status: "available",
    detail: "Constitution-compliant catalog and evidence blocks.",
  },
  {
    id: "graph-reasoning",
    label: "Knowledge graph and evidence reasoning",
    status: "available",
    detail: "Visualization and pipeline demo with stated limits.",
  },
  {
    id: "universities",
    label: "Universities alignment",
    status: "in_progress",
    detail: "Removing fabricated rankings and scores.",
  },
  {
    id: "search-discovery",
    label: "Global search discovery",
    status: "in_progress",
    detail: "Score ranking revision in progress.",
  },
  {
    id: "external-evidence",
    label: "External evidence sources",
    status: "evidence_not_connected",
    detail: "Tender, procurement, fiscal, and sector datasets not integrated.",
  },
  {
    id: "multilingual",
    label: "Multilingual content",
    status: "in_progress",
    detail: "English available; locale keys prepared.",
  },
  {
    id: "mobile-api",
    label: "Mobile clients and public API",
    status: "in_progress",
    detail: "Responsive web today; native clients and API planned.",
  },
];

export const ROADMAP_TIMELINE: RoadmapTimelineItem[] = [
  {
    id: "foundation",
    title: "Foundation",
    status: "complete",
    note: "Intelligence engine, constitution audit, platform scoring baseline.",
  },
  {
    id: "entity-intelligence",
    title: "Entity Intelligence",
    status: "in_progress",
    note: "Countries and companies compliant; universities in progress.",
  },
  {
    id: "search",
    title: "Search",
    status: "in_progress",
    note: "Entity discovery live; evidence-aware ranking planned.",
  },
  {
    id: "knowledge-graph",
    title: "Knowledge Graph",
    status: "in_progress",
    note: "Catalog-derived visualization available; provenance planned.",
  },
  {
    id: "investor-intelligence",
    title: "Investor Intelligence",
    status: "planned",
    note: "Requires connected fiscal and tender evidence sources.",
  },
  {
    id: "government-intelligence",
    title: "Government Intelligence",
    status: "planned",
    note: "Regional indicators and early-warning modules.",
  },
  {
    id: "citizen-intelligence",
    title: "Citizen Intelligence",
    status: "planned",
    note: "Plain-language layer and public sentiment schema.",
  },
  {
    id: "mobile",
    title: "Mobile",
    status: "planned",
    note: "iOS, Android, tablet clients after schema extraction.",
  },
  {
    id: "api",
    title: "API",
    status: "planned",
    note: "Public API contract and evidence bundles.",
  },
];

export const PLATFORM_LANGUAGES: PlatformLanguage[] = [
  { code: "en", label: "English", nativeLabel: "English", available: true },
  { code: "uz", label: "Uzbek", nativeLabel: "Oʻzbek", available: false },
  { code: "es", label: "Spanish", nativeLabel: "Español", available: false },
  { code: "fr", label: "French", nativeLabel: "Français", available: false },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", available: false },
  { code: "zh", label: "Chinese", nativeLabel: "中文", available: false },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", available: false },
  { code: "ko", label: "Korean", nativeLabel: "한국어", available: false },
  { code: "ru", label: "Russian", nativeLabel: "Русский", available: false },
];

export const HOME_FOOTER = {
  mission:
    "Help people make better decisions using evidence. Never manipulate. Never fabricate. Never become political. Always explain. Always remain transparent.",
  constitution: "CBAI Constitution v1",
  evidencePolicy: "Evidence First — no fact without source or explicit label.",
  transparency: "Unavailable data is disclosed — never hidden behind fake numbers.",
  methodology: "Methods documented before scores; confidence from evidence quality.",
  documentation: "Platform Transformation Master Plan · Brand Foundation",
} as const;

export function getStatusLabel(status: PlatformCapabilityStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "in_progress":
      return "In Progress";
    case "evidence_not_connected":
      return "Evidence Not Connected";
  }
}

export function getTimelineStatusLabel(
  status: RoadmapTimelineItem["status"],
): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "in_progress":
      return "In Progress";
    case "planned":
      return "Planned";
  }
}

export function mapTimelineToBadgeStatus(
  status: RoadmapTimelineItem["status"],
): PlatformCapabilityStatus {
  switch (status) {
    case "complete":
      return "available";
    case "in_progress":
      return "in_progress";
    case "planned":
      return "evidence_not_connected";
  }
}
