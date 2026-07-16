/**
 * EPIC Registry — maps product modules and routes to EPIC ownership.
 * Used by governance tests; not a runtime feature gate.
 */

export type EpicId =
  | "EPIC-01"
  | "EPIC-02"
  | "EPIC-03"
  | "EPIC-04"
  | "EPIC-05"
  | "EPIC-06"
  | "EPIC-07"
  | "EPIC-08"
  | "EPIC-09"
  | "EPIC-10"
  | "EPIC-11"
  | "EPIC-12"
  | "EPIC-13"
  | "EPIC-14"
  | "EPIC-15";

export type EpicStatus =
  | "proposed"
  | "foundation"
  | "in-implementation"
  | "functional"
  | "verified"
  | "production-ready"
  | "restricted"
  | "blocked";

export type EpicDefinition = {
  readonly id: EpicId;
  readonly slug: string;
  readonly title: string;
  readonly status: EpicStatus;
  readonly docPath: string;
};

export const EPIC_DEFINITIONS: readonly EpicDefinition[] = [
  { id: "EPIC-01", slug: "universal-intelligence-foundation", title: "Universal Intelligence Foundation", status: "functional", docPath: "docs/epics/EPIC-01-universal-intelligence-foundation.md" },
  { id: "EPIC-02", slug: "mission-operating-system", title: "Mission Operating System", status: "in-implementation", docPath: "docs/epics/EPIC-02-mission-operating-system.md" },
  { id: "EPIC-03", slug: "intelligence-identity-capability-passport", title: "Intelligence Identity & Capability Passport", status: "foundation", docPath: "docs/epics/EPIC-03-intelligence-identity-capability-passport.md" },
  { id: "EPIC-04", slug: "discovery-opportunity-network", title: "Discovery & Opportunity Network", status: "foundation", docPath: "docs/epics/EPIC-04-discovery-opportunity-network.md" },
  { id: "EPIC-05", slug: "scientific-collaboration-os", title: "Scientific Collaboration Operating System", status: "proposed", docPath: "docs/epics/EPIC-05-scientific-collaboration-os.md" },
  { id: "EPIC-06", slug: "evidence-trust-engine", title: "Evidence & Trust Engine", status: "in-implementation", docPath: "docs/epics/EPIC-06-evidence-trust-engine.md" },
  { id: "EPIC-07", slug: "research-reasoning-os", title: "Research & Reasoning Operating System", status: "foundation", docPath: "docs/epics/EPIC-07-research-reasoning-os.md" },
  { id: "EPIC-08", slug: "universal-knowledge-entity-system", title: "Universal Knowledge & Entity System", status: "functional", docPath: "docs/epics/EPIC-08-universal-knowledge-entity-system.md" },
  { id: "EPIC-09", slug: "knowledge-universe", title: "Knowledge Universe", status: "in-implementation", docPath: "docs/epics/EPIC-09-knowledge-universe.md" },
  { id: "EPIC-10", slug: "humanity-impact-responsible-progress", title: "Humanity Impact & Responsible Progress", status: "functional", docPath: "docs/epics/EPIC-10-humanity-impact-responsible-progress.md" },
  { id: "EPIC-11", slug: "civilization-memory-legacy", title: "Civilization Memory & Legacy", status: "foundation", docPath: "docs/epics/EPIC-11-civilization-memory-legacy.md" },
  { id: "EPIC-12", slug: "operator-voice-os", title: "Operator & Voice OS", status: "in-implementation", docPath: "docs/epics/EPIC-12-operator-voice-os.md" },
  { id: "EPIC-13", slug: "adaptive-intelligence-interface", title: "Adaptive Intelligence Interface", status: "in-implementation", docPath: "docs/epics/EPIC-13-adaptive-intelligence-interface.md" },
  { id: "EPIC-14", slug: "global-mission-framework", title: "Global Mission Framework", status: "proposed", docPath: "docs/epics/EPIC-14-global-mission-framework.md" },
  { id: "EPIC-15", slug: "production-security-scale", title: "Production, Security & Scale", status: "foundation", docPath: "docs/epics/EPIC-15-production-security-scale.md" },
] as const;

/** Route → primary EPIC owner */
export const ROUTE_EPIC_MAP: Readonly<Record<string, EpicId>> = {
  "/": "EPIC-02",
  "/my-work": "EPIC-02",
  "/search": "EPIC-08",
  "/countries": "EPIC-08",
  "/companies": "EPIC-08",
  "/universities": "EPIC-08",
  "/research": "EPIC-07",
  "/knowledge": "EPIC-06",
  "/graph": "EPIC-09",
  "/reports": "EPIC-02",
  "/reasoning": "EPIC-07",
  "/trust": "EPIC-06",
  "/settings": "EPIC-12",
  "/account": "EPIC-15",
  "/about": "EPIC-01",
  "/ai-control": "EPIC-01",
  "/government": "EPIC-14",
  "/investor": "EPIC-14",
  "/citizen": "EPIC-14",
  "/core": "EPIC-15",
  "/agents": "EPIC-15",
  "/workflows": "EPIC-15",
};

export function getEpicForRoute(route: string): EpicId | undefined {
  const normalized = route.split("?")[0];
  if (normalized === "/dashboard" || normalized === "/analytics") return "EPIC-02";
  return ROUTE_EPIC_MAP[normalized];
}

export function getEpicDefinition(id: EpicId): EpicDefinition | undefined {
  return EPIC_DEFINITIONS.find((e) => e.id === id);
}

export function getAllEpicDocPaths(): readonly string[] {
  return EPIC_DEFINITIONS.map((e) => e.docPath);
}
