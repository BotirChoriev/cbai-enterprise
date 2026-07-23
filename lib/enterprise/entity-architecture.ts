/**
 * Entity profile architecture fields — structure only.
 * Values are never invented; status reflects Missing / Planned / Awaiting official source.
 */

export type ArchitectureFieldStatus =
  | "Missing"
  | "Planned"
  | "Awaiting official source"
  | "Registry available";

export type ArchitectureField = {
  id: string;
  label: string;
  status: ArchitectureFieldStatus;
  expectedSource: string;
  whyMissing: string;
  integrationStatus: "Not connected" | "Planned" | "Connected (registry only)";
};

export const COMPANY_ARCHITECTURE_FIELDS: readonly ArchitectureField[] = [
  {
    id: "revenue",
    label: "Revenue",
    status: "Awaiting official source",
    expectedSource: "Official financial disclosures / national business registry",
    whyMissing: "No connected official financial feed for this profile.",
    integrationStatus: "Planned",
  },
  {
    id: "market-cap",
    label: "Market Cap",
    status: "Awaiting official source",
    expectedSource: "Regulated market data provider",
    whyMissing: "Market capitalization requires a verified exchange feed.",
    integrationStatus: "Planned",
  },
  {
    id: "employees",
    label: "Employees",
    status: "Awaiting official source",
    expectedSource: "Official labour / company filings",
    whyMissing: "Headcount is not published from a connected official source.",
    integrationStatus: "Planned",
  },
  {
    id: "headquarters",
    label: "Headquarters",
    status: "Planned",
    expectedSource: "Company registry / official website disclosure",
    whyMissing: "Structured HQ location awaits registry enrichment.",
    integrationStatus: "Planned",
  },
  {
    id: "industry",
    label: "Industry",
    status: "Registry available",
    expectedSource: "CBAI Local Platform Registry",
    whyMissing: "Industry classification is registry-backed when present on the entity record.",
    integrationStatus: "Connected (registry only)",
  },
  {
    id: "supply-chain",
    label: "Supply Chain",
    status: "Missing",
    expectedSource: "Official procurement / supply disclosure",
    whyMissing: "Supply-chain graph requires connected procurement evidence.",
    integrationStatus: "Not connected",
  },
  {
    id: "esg",
    label: "ESG",
    status: "Awaiting official source",
    expectedSource: "Official ESG / sustainability disclosures",
    whyMissing: "ESG metrics are not scored without verified source connectors.",
    integrationStatus: "Planned",
  },
  {
    id: "innovation",
    label: "Innovation",
    status: "Planned",
    expectedSource: "Official R&D and innovation indicators",
    whyMissing: "Innovation indicators remain planned in the framework.",
    integrationStatus: "Planned",
  },
  {
    id: "patents",
    label: "Patents",
    status: "Awaiting official source",
    expectedSource: "National / regional patent offices",
    whyMissing: "Patent counts require an official IP office connector.",
    integrationStatus: "Planned",
  },
  {
    id: "ai-activity",
    label: "AI Activity",
    status: "Missing",
    expectedSource: "Official AI disclosure / research filings",
    whyMissing: "AI activity is not inferred; official disclosure is required.",
    integrationStatus: "Not connected",
  },
  {
    id: "risk-overview",
    label: "Risk Overview",
    status: "Missing",
    expectedSource: "Evidence-backed risk methodology + official sources",
    whyMissing: "Risk overviews are withheld until verified evidence is connected.",
    integrationStatus: "Not connected",
  },
  {
    id: "evidence-coverage",
    label: "Evidence Coverage",
    status: "Registry available",
    expectedSource: "Indicator Framework + Evidence Infrastructure",
    whyMissing: "Coverage is computed from registered indicators and sources only.",
    integrationStatus: "Connected (registry only)",
  },
] as const;

export const UNIVERSITY_ARCHITECTURE_FIELDS: readonly ArchitectureField[] = [
  {
    id: "publications",
    label: "Publications",
    status: "Awaiting official source",
    expectedSource: "UNESCO / institutional research repositories",
    whyMissing: "Publication counts require a connected official research feed.",
    integrationStatus: "Planned",
  },
  {
    id: "citations",
    label: "Citations",
    status: "Awaiting official source",
    expectedSource: "Official bibliometric authority",
    whyMissing: "Citations are not estimated without verified bibliometric sources.",
    integrationStatus: "Planned",
  },
  {
    id: "research-funding",
    label: "Research Funding",
    status: "Missing",
    expectedSource: "National research funders / institutional disclosures",
    whyMissing: "Funding totals await official funder connectors.",
    integrationStatus: "Not connected",
  },
  {
    id: "patents",
    label: "Patents",
    status: "Awaiting official source",
    expectedSource: "National / regional patent offices",
    whyMissing: "University patent portfolios require IP office integration.",
    integrationStatus: "Planned",
  },
  {
    id: "research-labs",
    label: "Research Labs",
    status: "Planned",
    expectedSource: "Institutional research directories",
    whyMissing: "Lab catalogs are planned architecture, not yet connected.",
    integrationStatus: "Planned",
  },
  {
    id: "nobel-winners",
    label: "Nobel Winners",
    status: "Awaiting official source",
    expectedSource: "Nobel Foundation official records",
    whyMissing: "Laureate affiliations require the official Nobel source connector.",
    integrationStatus: "Planned",
  },
  {
    id: "global-ranking",
    label: "Global Ranking",
    status: "Missing",
    expectedSource: "Not applicable as a CBAI score",
    whyMissing: "CBAI does not invent league-table rankings; rankings await explicit official methodology if ever shown.",
    integrationStatus: "Not connected",
  },
  {
    id: "international-partnerships",
    label: "International Partnerships",
    status: "Planned",
    expectedSource: "Institutional partnership disclosures",
    whyMissing: "Partnership graphs require verified institutional disclosure.",
    integrationStatus: "Planned",
  },
  {
    id: "open-datasets",
    label: "Open Datasets",
    status: "Planned",
    expectedSource: "Institutional open-data portals",
    whyMissing: "Open dataset indexes are planned for Open Science workflow.",
    integrationStatus: "Planned",
  },
  {
    id: "evidence-coverage",
    label: "Evidence Coverage",
    status: "Registry available",
    expectedSource: "Indicator Framework + Evidence Infrastructure",
    whyMissing: "Coverage is computed from registered education/research indicators only.",
    integrationStatus: "Connected (registry only)",
  },
] as const;

export function architectureStatusClass(status: ArchitectureFieldStatus): string {
  switch (status) {
    case "Registry available":
      return "border-teal-500/25 bg-teal-500/10 text-teal-300";
    case "Planned":
      return "border-amber-500/25 bg-amber-500/10 text-amber-300";
    case "Awaiting official source":
      return "border-zinc-600/80 bg-zinc-800/60 text-zinc-400";
    case "Missing":
      return "border-zinc-700/80 bg-zinc-900/80 text-zinc-500";
  }
}
