/**
 * Platform Home content — Phase 1 Platform Experience Transformation.
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
  value: string;
  href: string;
  entryLabel: string;
};

export type HomeModule = {
  id: string;
  label: string;
  href: string;
  icon:
    | "countries"
    | "companies"
    | "universities"
    | "search"
    | "graph"
    | "reasoning"
    | "ai-control"
    | "agents"
    | "dashboard";
  status: PlatformCapabilityStatus;
  todayDescription: string;
};

export type PlatformCapability = {
  id: string;
  label: string;
  status: PlatformCapabilityStatus;
  detail: string;
};

export type PlatformPrinciple = {
  id: string;
  title: string;
  description: string;
};

export type PlatformRoadmapPhase = {
  id: string;
  title: string;
  status: "complete" | "in_progress" | "planned";
  scope: string;
};

export type PlatformLanguage = {
  code: string;
  label: string;
  nativeLabel: string;
  available: boolean;
};

export const PLATFORM_VERSION = "0.1.0";
export const PLATFORM_EVOLUTION_PHASE = "Phase 1 — Platform Experience";

export const HOME_HERO = {
  headline: "Global Evidence Intelligence Platform",
  explanation:
    "CBAI helps people make better decisions using evidence. The platform organizes countries, institutions, and relationships; shows what is verified; and withholds conclusions when sources are not connected.",
  difference:
    "CBAI is not a chatbot, news site, or government portal. It measures and explains evidence — it does not fabricate scores, manipulate opinion, or make political recommendations.",
  cta: {
    label: "Begin with Countries",
    href: "/countries",
  },
} as const;

export const PLATFORM_PERSONAS: PlatformPersona[] = [
  {
    id: "citizen",
    title: "General Citizen",
    value:
      "Understand reforms, public services, and local changes through verified registry facts and clear evidence status — not opinion polls presented as official ratings.",
    href: "/countries",
    entryLabel: "Country registry",
  },
  {
    id: "investor",
    title: "Investor",
    value:
      "Scope investment context through entity registries and transparency modules. Investment scores appear only when tender, budget, and sector evidence sources are connected.",
    href: "/countries",
    entryLabel: "Country evidence scope",
  },
  {
    id: "government",
    title: "Government Leader",
    value:
      "Review governance and procurement evidence blocks with early-warning indicators when sources connect. CBAI provides evidence — not political recommendations.",
    href: "/countries",
    entryLabel: "Governance blocks",
  },
  {
    id: "student",
    title: "Student",
    value:
      "Learn from factual registry data, timelines, and case-study routes as they are added. Educational explanations will cite connected evidence only.",
    href: "/countries",
    entryLabel: "Factual registries",
  },
  {
    id: "researcher",
    title: "Researcher",
    value:
      "Explore entity relationships, reasoning pipeline structure, and runtime traces. Outputs remain reproducible — fabricated scores are being removed platform-wide.",
    href: "/graph",
    entryLabel: "Knowledge graph",
  },
  {
    id: "academic",
    title: "Academic",
    value:
      "Access methodology-oriented intelligence blocks, indicator definitions, and evidence-quality labels suitable for citation when sources are connected.",
    href: "/countries",
    entryLabel: "Methodology blocks",
  },
];

export const HOME_MODULES: HomeModule[] = [
  {
    id: "countries",
    label: "Countries",
    href: "/countries",
    icon: "countries",
    status: "available",
    todayDescription:
      "Factual country registry with constitution-compliant intelligence blocks. Scores and trends are withheld until evidence sources connect.",
  },
  {
    id: "companies",
    label: "Companies",
    href: "/companies",
    icon: "companies",
    status: "in_progress",
    todayDescription:
      "Local company registry browser. Constitution remediation is in progress — fabricated scores and AI summaries are being replaced with evidence-status labels.",
  },
  {
    id: "universities",
    label: "Universities",
    href: "/universities",
    icon: "universities",
    status: "in_progress",
    todayDescription:
      "Local university registry browser. Ranking and research scores require connected academic evidence sources; remediation follows the countries pattern.",
  },
  {
    id: "search",
    label: "Search",
    href: "/search",
    icon: "search",
    status: "in_progress",
    todayDescription:
      "Unified search across local entity registries. Score-based ranking and insight panels are being revised to respect evidence connection status.",
  },
  {
    id: "graph",
    label: "Knowledge Graph",
    href: "/graph",
    icon: "graph",
    status: "available",
    todayDescription:
      "Relationship visualization built from local registry links. Edge provenance and external source metadata are not yet connected.",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    href: "/reasoning",
    icon: "reasoning",
    status: "available",
    todayDescription:
      "Interactive pipeline demonstration showing evidence → confidence → answer stages. Simulated only — no live model inference.",
  },
  {
    id: "ai-control",
    label: "AI Control",
    href: "/ai-control",
    icon: "ai-control",
    status: "in_progress",
    todayDescription:
      "Governance surface for command routing and system context. Command execution backend is not connected.",
  },
  {
    id: "agents",
    label: "Agents",
    href: "/agents",
    icon: "agents",
    status: "in_progress",
    todayDescription:
      "Agent catalog and capability definitions. Operational metrics on this page are not yet bound to live runtime observability.",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    status: "available",
    todayDescription:
      "Runtime health, queue, scheduler, and worker state from in-process observability. Reflects local development runtime — not production telemetry.",
  },
];

export const EVIDENCE_FLOW_STEPS = [
  {
    id: "evidence",
    label: "Evidence",
    description: "Collect and label inputs from connected sources",
  },
  {
    id: "analysis",
    label: "Analysis",
    description: "Structure findings without asserting unavailable facts",
  },
  {
    id: "confidence",
    label: "Confidence",
    description: "Score certainty from evidence quality — zero when insufficient",
  },
  {
    id: "trust",
    label: "Trust",
    description: "Assess reliability independent of confidence magnitude",
  },
  {
    id: "decision",
    label: "Decision Intelligence",
    description: "Support decisions with explained, auditable outputs",
  },
] as const;

export const PLATFORM_PRINCIPLES: PlatformPrinciple[] = [
  {
    id: "evidence-first",
    title: "Evidence First",
    description: "Nothing is presented as fact without a connected source path.",
  },
  {
    id: "political-neutrality",
    title: "Political Neutrality",
    description: "No endorsements, flags, or partisan framing in platform intelligence.",
  },
  {
    id: "transparency",
    title: "Transparency",
    description: "Unavailable data is labeled — never hidden behind fabricated numbers.",
  },
  {
    id: "explain-scores",
    title: "Explain Every Score",
    description: "Any future score must show methodology, inputs, and evidence status.",
  },
  {
    id: "no-fake-data",
    title: "No Fake Data",
    description: "Insufficient evidence and disconnected sources are stated explicitly.",
  },
  {
    id: "human-benefit",
    title: "Human Benefit",
    description: "Every module must serve citizens, investors, institutions, students, researchers, and academics.",
  },
];

export const PLATFORM_CAPABILITIES: PlatformCapability[] = [
  {
    id: "web",
    label: "Web application",
    status: "available",
    detail: "Static Next.js export with dashboard shell and entity routes.",
  },
  {
    id: "countries-module",
    label: "Countries intelligence (constitution-compliant)",
    status: "available",
    detail: "Factual registry, persona guidance, and evidence-status blocks.",
  },
  {
    id: "runtime-dashboard",
    label: "Runtime observability dashboard",
    status: "available",
    detail: "Live in-process metrics from intelligence runtime singletons.",
  },
  {
    id: "graph-reasoning",
    label: "Graph and reasoning surfaces",
    status: "available",
    detail: "Visualization and pipeline demo with stated simulation limits.",
  },
  {
    id: "external-evidence",
    label: "External evidence sources",
    status: "evidence_not_connected",
    detail: "Tender, budget, procurement, and sector datasets are not yet integrated.",
  },
  {
    id: "entity-remediation",
    label: "Companies and universities constitution alignment",
    status: "in_progress",
    detail: "Removing fabricated scores and narratives per Platform Evolution Phase 1.",
  },
  {
    id: "multilingual",
    label: "Multilingual content",
    status: "in_progress",
    detail: "English UI today. Locale architecture prepared; additional languages unavailable.",
  },
  {
    id: "mobile-native",
    label: "iOS and Android clients",
    status: "in_progress",
    detail: "Not started. Shared schema extraction planned before native development.",
  },
  {
    id: "pdf-api",
    label: "PDF reports and public API",
    status: "in_progress",
    detail: "Documented in brand and transformation plans; not yet implemented.",
  },
];

export const PLATFORM_ROADMAP: PlatformRoadmapPhase[] = [
  {
    id: "phase-0",
    title: "Constitution audit and scoring baseline",
    status: "complete",
    scope: "Repository audit, independent engine vs platform scores documented.",
  },
  {
    id: "phase-1",
    title: "Platform Experience Transformation",
    status: "in_progress",
    scope: "Home page, honest module status, remove fabricated UI data (P0).",
  },
  {
    id: "phase-2",
    title: "Entity module alignment",
    status: "planned",
    scope: "Companies and universities follow countries evidence-first pattern.",
  },
  {
    id: "phase-3",
    title: "Discovery and operations honesty",
    status: "planned",
    scope: "Search, knowledge, and agents surfaces show connection status only.",
  },
  {
    id: "phase-4",
    title: "Persona intelligence modules",
    status: "planned",
    scope: "Investor, government, and citizen transparency modules as first-class routes.",
  },
  {
    id: "phase-5",
    title: "Cross-platform delivery",
    status: "planned",
    scope: "Schema extraction, responsive shell, i18n pilot, PDF prototype, API contract.",
  },
];

export const PLATFORM_LANGUAGES: PlatformLanguage[] = [
  { code: "en", label: "English", nativeLabel: "English", available: true },
  { code: "uz", label: "Uzbek", nativeLabel: "Oʻzbek", available: false },
  { code: "ru", label: "Russian", nativeLabel: "Русский", available: false },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe", available: false },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", available: false },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", available: false },
  { code: "zh", label: "Chinese", nativeLabel: "中文", available: false },
  { code: "fr", label: "French", nativeLabel: "Français", available: false },
  { code: "es", label: "Spanish", nativeLabel: "Español", available: false },
];

export const HOME_FOOTER = {
  mission:
    "Help people make better decisions using evidence. Never manipulate. Never fabricate. Never become political. Always explain. Always remain transparent.",
  constitutionReference: "CBAI Constitution v1",
  principles: ["Evidence First", "Political Neutrality"] as const,
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

export function getRoadmapStatusLabel(
  status: PlatformRoadmapPhase["status"],
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
