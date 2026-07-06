import type { FutureIntegrationTarget } from "@/lib/indicator-framework/types";

/**
 * Future integration map — architecture prepared, not implemented.
 * Indicators will bind to these surfaces when evidence adapters connect.
 */
export const FUTURE_INTEGRATION_MAP: readonly FutureIntegrationTarget[] = [
  {
    id: "countries",
    label: "Countries",
    description:
      "Country intelligence blocks will reference applicable indicators by domain with evidence status.",
    status: "planned",
  },
  {
    id: "companies",
    label: "Companies",
    description:
      "Company profiles will surface industry, trade, and innovation indicators when sources connect.",
    status: "planned",
  },
  {
    id: "universities",
    label: "Universities",
    description:
      "University intelligence will bind education and research indicators to accreditation and output sources.",
    status: "planned",
  },
  {
    id: "knowledge-graph",
    label: "Knowledge Graph",
    description:
      "Graph edges may reference indicator-derived relationships when provenance metadata exists.",
    status: "planned",
  },
  {
    id: "evidence-explorer",
    label: "Evidence Explorer",
    description:
      "Dedicated UI for browsing indicators, sources, and connection status per entity.",
    status: "planned",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    description:
      "Reasoning pipeline will consume indicator evidence items — not fabricated scores.",
    status: "planned",
  },
  {
    id: "decision-intelligence",
    label: "Decision Intelligence",
    description:
      "Decision outputs will cite indicator IDs and source provenance when evaluations exist.",
    status: "planned",
  },
  {
    id: "mobile",
    label: "Mobile",
    description: "Indicator status and registry browsing on mobile clients.",
    status: "planned",
  },
  {
    id: "api",
    label: "API",
    description:
      "Programmatic indicator registry access with versioned schema and locale bundles.",
    status: "planned",
  },
];
