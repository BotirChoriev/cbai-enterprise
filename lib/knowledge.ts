export type DocumentStatus = "indexed" | "indexing" | "pending" | "error";

export type DocumentType =
  | "reports"
  | "strategy"
  | "legal"
  | "research"
  | "education"
  | "investor";

export type KnowledgeCollection = {
  id: string;
  name: string;
  type: DocumentType;
  typeLabel: string;
  description: string;
  status: DocumentStatus;
  documentsCount: number;
  lastIndexed: string;
  confidenceScore: number;
};

export type KnowledgeActivityItem = {
  id: string;
  action: string;
  collection: string;
  detail: string;
  time: string;
  status: "success" | "running" | "failed";
};

export type SourceHealthItem = {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "degraded" | "offline";
  latency: string;
  lastSync: string;
};

export const knowledgeCollections: KnowledgeCollection[] = [
  {
    id: "country-reports",
    name: "Country Reports",
    type: "reports",
    typeLabel: "Geopolitical Reports",
    description:
      "Country profiles, economic indicators, and political risk assessments.",
    status: "indexed",
    documentsCount: 2847,
    lastIndexed: "12 minutes ago",
    confidenceScore: 97.4,
  },
  {
    id: "business-strategy",
    name: "Business Strategy Docs",
    type: "strategy",
    typeLabel: "Strategic Planning",
    description:
      "Business plans, roadmaps, OKRs, and executive strategy documents.",
    status: "indexed",
    documentsCount: 1523,
    lastIndexed: "34 minutes ago",
    confidenceScore: 95.8,
  },
  {
    id: "legal-compliance",
    name: "Legal & Compliance",
    type: "legal",
    typeLabel: "Regulatory & Legal",
    description:
      "Contracts, compliance policies, regulatory filings, and audit records.",
    status: "indexed",
    documentsCount: 3891,
    lastIndexed: "1 hour ago",
    confidenceScore: 99.1,
  },
  {
    id: "market-research",
    name: "Market Research",
    type: "research",
    typeLabel: "Market Intelligence",
    description:
      "Industry reports, competitor analyses, and market sizing studies.",
    status: "indexing",
    documentsCount: 2104,
    lastIndexed: "Indexing now",
    confidenceScore: 94.2,
  },
  {
    id: "education-data",
    name: "Education Data",
    type: "education",
    typeLabel: "Education & Training",
    description:
      "Curriculum materials, training modules, and educational research datasets.",
    status: "indexed",
    documentsCount: 967,
    lastIndexed: "3 hours ago",
    confidenceScore: 92.6,
  },
  {
    id: "investor-profiles",
    name: "Investor Profiles",
    type: "investor",
    typeLabel: "Investor Relations",
    description:
      "Investor decks, cap tables, due diligence reports, and portfolio data.",
    status: "pending",
    documentsCount: 412,
    lastIndexed: "Pending sync",
    confidenceScore: 88.3,
  },
];

export const knowledgeActivity: KnowledgeActivityItem[] = [
  {
    id: "1",
    action: "Batch indexed",
    collection: "Country Reports",
    detail: "47 new country profiles added to vector store",
    time: "12 min ago",
    status: "success",
  },
  {
    id: "2",
    action: "Re-indexing",
    collection: "Market Research",
    detail: "Q1 2026 industry reports — 128 documents",
    time: "18 min ago",
    status: "running",
  },
  {
    id: "3",
    action: "Document uploaded",
    collection: "Legal & Compliance",
    detail: "SOC 2 Type II audit report 2026.pdf",
    time: "45 min ago",
    status: "success",
  },
  {
    id: "4",
    action: "RAG query served",
    collection: "Business Strategy Docs",
    detail: "Strategy Agent retrieved 12 relevant chunks",
    time: "1 hour ago",
    status: "success",
  },
  {
    id: "5",
    action: "Sync failed",
    collection: "Investor Profiles",
    detail: "CRM connector timeout — retry scheduled",
    time: "2 hours ago",
    status: "failed",
  },
  {
    id: "6",
    action: "Embeddings updated",
    collection: "Education Data",
    detail: "Model upgrade — 967 documents re-embedded",
    time: "3 hours ago",
    status: "success",
  },
];

export const sourceHealth: SourceHealthItem[] = [
  {
    id: "vector-db",
    name: "Vector Database",
    type: "Pinecone · us-east-1",
    status: "healthy",
    latency: "23ms",
    lastSync: "Live",
  },
  {
    id: "object-storage",
    name: "Object Storage",
    type: "S3 · documents-prod",
    status: "healthy",
    latency: "41ms",
    lastSync: "2 min ago",
  },
  {
    id: "crm-connector",
    name: "CRM Connector",
    type: "Salesforce · sync",
    status: "degraded",
    latency: "890ms",
    lastSync: "2 hours ago",
  },
  {
    id: "analytics-feed",
    name: "Analytics Feed",
    type: "Internal · BI pipeline",
    status: "healthy",
    latency: "67ms",
    lastSync: "15 min ago",
  },
  {
    id: "external-api",
    name: "External Data API",
    type: "Market data provider",
    status: "healthy",
    latency: "112ms",
    lastSync: "5 min ago",
  },
];

export function getKnowledgeStats(collections: KnowledgeCollection[]) {
  const totalDocuments = collections.reduce(
    (sum, c) => sum + c.documentsCount,
    0,
  );
  const indexedSources = collections.filter(
    (c) => c.status === "indexed",
  ).length;
  const avgConfidence =
    collections.reduce((sum, c) => sum + c.confidenceScore, 0) /
    collections.length;

  return {
    totalDocuments,
    indexedSources,
    storageUsed: "24.7 GB",
    searchAccuracy: avgConfidence.toFixed(1),
  };
}
