/**
 * EPIC-13 — Intelligence Spaces (not pages).
 * Every route maps to a named operating space with mission gravity.
 */

export type IntelligenceSpaceId =
  | "mission"
  | "evidence"
  | "knowledge"
  | "knowledge-universe"
  | "research"
  | "reasoning"
  | "impact"
  | "trust"
  | "capability"
  | "report"
  | "entity"
  | "search"
  | "settings"
  | "account"
  | "governance";

export type IntelligenceSpace = {
  readonly id: IntelligenceSpaceId;
  readonly route: string;
  readonly i18nKey: keyof typeof import("@/lib/i18n/platform-copy-build015-en").INTELLIGENCE_SPACES_EN;
};

const ROUTE_SPACE: Readonly<Record<string, IntelligenceSpaceId>> = {
  "/": "mission",
  "/my-work": "capability",
  "/knowledge": "evidence",
  "/graph": "knowledge-universe",
  "/research": "research",
  "/research/workspace": "research",
  "/reasoning": "reasoning",
  "/reports": "report",
  "/trust": "trust",
  "/search": "search",
  "/settings": "settings",
  "/account": "account",
  "/ai-control": "governance",
  "/countries": "entity",
  "/companies": "entity",
  "/universities": "entity",
  "/about": "trust",
};

export function resolveIntelligenceSpace(pathname: string): IntelligenceSpaceId {
  const base = pathname.split("?")[0];
  if (ROUTE_SPACE[base]) return ROUTE_SPACE[base];
  if (base.startsWith("/research/")) return "research";
  return "entity";
}

export function intelligenceSpaceI18nKey(id: IntelligenceSpaceId): IntelligenceSpace["i18nKey"] {
  const map: Record<IntelligenceSpaceId, IntelligenceSpace["i18nKey"]> = {
    mission: "missionSpace",
    evidence: "evidenceSpace",
    knowledge: "knowledgeSpace",
    "knowledge-universe": "knowledgeUniverseSpace",
    research: "researchSpace",
    reasoning: "reasoningSpace",
    impact: "impactSpace",
    trust: "trustSpace",
    capability: "capabilitySpace",
    report: "reportSpace",
    entity: "entitySpace",
    search: "searchSpace",
    settings: "settingsSpace",
    account: "accountSpace",
    governance: "governanceSpace",
  };
  return map[id];
}
