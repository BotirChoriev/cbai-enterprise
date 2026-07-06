/**
 * CBAI Knowledge Graph — platform content and relationship model.
 * Static honest copy. i18n-ready. Zero demo policy.
 */

export type GraphEntityTypeEntry = {
  id: string;
  label: string;
  active: boolean;
  note: string;
};

export type GraphRelationshipTypeEntry = {
  id: string;
  label: string;
  description: string;
  active: boolean;
};

export type GraphPersonaEntry = {
  id: string;
  title: string;
  whatCanILearn: string;
};

export type GraphTrustPillar = {
  id: string;
  title: string;
  description: string;
};

export const GRAPH_PLATFORM = {
  eyebrow: "Knowledge Graph",
  headline: "Core intelligence navigation layer",
  explanation:
    "The Knowledge Graph explains how entities are connected using verified local catalog relationships. It never states why a connection exists unless evidence supports it.",
  relationshipUnavailable: "Relationship data not connected.",
  noSelectionPrompt:
    "Select an entity on the graph to view evidence status, relationship count, and connected records.",
} as const;

export const GRAPH_ENTITY_TYPES: GraphEntityTypeEntry[] = [
  {
    id: "country",
    label: "Countries",
    active: true,
    note: "Local country registry nodes.",
  },
  {
    id: "company",
    label: "Companies",
    active: true,
    note: "Local company catalog nodes.",
  },
  {
    id: "university",
    label: "Universities",
    active: true,
    note: "Local university registry nodes.",
  },
  {
    id: "government",
    label: "Government Institutions",
    active: false,
    note: "Future entity type — evidence source not connected.",
  },
  {
    id: "industry",
    label: "Industries",
    active: false,
    note: "Future entity type — sector nodes not connected.",
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    active: false,
    note: "Future entity type — not in graph index.",
  },
  {
    id: "natural-resources",
    label: "Natural Resources",
    active: false,
    note: "Future entity type — not in graph index.",
  },
  {
    id: "procurement",
    label: "Procurement",
    active: false,
    note: "Future entity type — not in graph index.",
  },
  {
    id: "research-center",
    label: "Research Centers",
    active: false,
    note: "Future entity type — relationship data not connected.",
  },
  {
    id: "future",
    label: "Future Entity Types",
    active: false,
    note: "Schema prepared — nodes appear only when registries connect.",
  },
];

export const GRAPH_RELATIONSHIP_TYPES: GraphRelationshipTypeEntry[] = [
  {
    id: "located-in",
    label: "Located In",
    description: "Entity headquarters or campus country from local catalog fields.",
    active: true,
  },
  {
    id: "registered-in",
    label: "Registered In",
    description: "Entity listed under a country registry profile.",
    active: true,
  },
  {
    id: "belongs-to",
    label: "Belongs To",
    description: "Same-country catalog association between companies and universities.",
    active: true,
  },
  {
    id: "collaborates-with",
    label: "Collaborates With",
    description: "Requires verified partnership evidence — not inferred by CBAI.",
    active: false,
  },
  {
    id: "evidence-available",
    label: "Evidence Available",
    description: "Relationship derived from connected local registry data.",
    active: true,
  },
  {
    id: "evidence-missing",
    label: "Evidence Missing",
    description: "Relationship type declared but source not connected.",
    active: true,
  },
];

export const GRAPH_PERSONAS: GraphPersonaEntry[] = [
  {
    id: "citizen",
    title: "Citizen",
    whatCanILearn:
      "Which public institutions and companies share a country registry link with universities — without popularity scores.",
  },
  {
    id: "investor",
    title: "Investor",
    whatCanILearn:
      "Catalog-level entity adjacency only. Investment or partnership claims require connected financial evidence.",
  },
  {
    id: "government",
    title: "Government",
    whatCanILearn:
      "Government form labels from country registry when linked. No political recommendations from graph traversal.",
  },
  {
    id: "student",
    title: "Student",
    whatCanILearn:
      "University location and same-country company listings from local registries — not rankings or employability scores.",
  },
  {
    id: "researcher",
    title: "Researcher",
    whatCanILearn:
      "Exportable relationship list with evidence status per edge for reproducible scoping.",
  },
  {
    id: "academic",
    title: "Academic",
    whatCanILearn:
      "How CBAI separates catalog-derived links from verified collaboration evidence.",
  },
];

export const GRAPH_PIPELINE_STAGES = [
  "Entity",
  "Relationship",
  "Evidence",
  "Reasoning",
  "Decision Intelligence",
] as const;

export const GRAPH_TRUST_PILLARS: GraphTrustPillar[] = [
  {
    id: "evidence",
    title: "Evidence",
    description:
      "Edges exist only when local registries provide verifiable linkage. No inferred or weighted relationships.",
  },
  {
    id: "methodology",
    title: "Methodology",
    description:
      "Graph builder derives nodes from entity adapters and edges from catalog rules — not AI clustering.",
  },
  {
    id: "neutrality",
    title: "Neutrality",
    description:
      "The graph does not recommend paths, rank entities, or endorse partnerships.",
  },
  {
    id: "transparency",
    title: "Transparency",
    description:
      "Each relationship shows status: evidence available from catalog or evidence missing for future types.",
  },
];

export const GRAPH_FUTURE_EXPANSION = [
  "Government institution nodes from public registry adapters",
  "Industry and sector nodes with NAICS/ISIC evidence sources",
  "Infrastructure and natural resource entity layers",
  "Procurement contract relationship edges",
  "Research center nodes with verified affiliation data",
  "Collaborates With edges after partnership evidence connects",
  "Multilingual relationship labels and filter API",
] as const;

export const GRAPH_EVIDENCE_LABELS = {
  registryAvailable: "Registry available",
  evidenceConnected: "Evidence connected",
  evidenceUnavailable: "Evidence unavailable",
  insufficientEvidence: "Insufficient Evidence",
  notConnected: "Evidence Source Not Connected",
} as const;
