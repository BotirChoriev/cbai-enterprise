/**
 * Intelligence Lenses — analytical framings inside one operating system.
 * Never separate portals. Same evidence core, different question framing.
 */

export type IntelligenceLensId =
  | "governance"
  | "economic"
  | "public"
  | "research"
  | "engineering"
  | "science"
  | "economics";

export type IntelligenceLens = {
  readonly id: IntelligenceLensId;
  readonly label: string;
  readonly route: string;
  readonly description: string;
  readonly maturity: "live" | "partial" | "preview";
  readonly notAPortal: true;
};

export const INTELLIGENCE_LENSES: readonly IntelligenceLens[] = [
  {
    id: "research",
    label: "Research Intelligence",
    route: "/research",
    description: "Browse real research topics and enter structured workspaces.",
    maturity: "partial",
    notAPortal: true,
  },
  {
    id: "science",
    label: "Scientific Evidence",
    route: "/knowledge",
    description: "Inspect source connection status and evidence readiness.",
    maturity: "partial",
    notAPortal: true,
  },
  {
    id: "governance",
    label: "Governance Lens",
    route: "/government",
    description: "Institutional evidence readiness — not a government portal.",
    maturity: "preview",
    notAPortal: true,
  },
  {
    id: "economic",
    label: "Economic Lens",
    route: "/investor",
    description: "Due-diligence evidence framing — not an investor portal.",
    maturity: "preview",
    notAPortal: true,
  },
  {
    id: "public",
    label: "Public Intelligence Lens",
    route: "/citizen",
    description: "Public information in plain language — not a citizen portal.",
    maturity: "preview",
    notAPortal: true,
  },
  {
    id: "engineering",
    label: "Entity Intelligence",
    route: "/companies",
    description: "Companies, countries, and universities from one evidence core.",
    maturity: "live",
    notAPortal: true,
  },
  {
    id: "economics",
    label: "Analysis & Reports",
    route: "/reports",
    description: "Report readiness from connected registry facts.",
    maturity: "partial",
    notAPortal: true,
  },
] as const;

export function getIntelligenceLens(id: IntelligenceLensId): IntelligenceLens | undefined {
  return INTELLIGENCE_LENSES.find((l) => l.id === id);
}
