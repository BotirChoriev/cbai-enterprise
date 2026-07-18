/**
 * Research discovery — wraps existing connectors with normalization and honest limits.
 */

import { searchKnowledgeProvider, PRIORITY_OPEN_SCIENCE_PROVIDERS } from "@/lib/knowledge-connectors/connector-registry";
import type { CanonicalKnowledgeSource, KnowledgeProviderId } from "@/lib/knowledge-connectors/types";
import { assertNoPrivateArtifactInQuery } from "@/lib/research-canvas/privacy-boundary";
import type { DiscoveryResultRecord, ProjectEvidenceStatus, SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import { genesisId, readGenesisList, writeGenesisList, notifyGenesisChanged } from "@/lib/genesis/genesis-storage";
import { buildExternalSearchQuery } from "@/lib/research-canvas/smart-idea-store";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";

const DISCOVERY_KEY = "cbai-research-canvas-discovery";
const memoryDiscovery: DiscoveryResultRecord[] = [];

function isDiscovery(v: unknown): v is DiscoveryResultRecord {
  const d = v as DiscoveryResultRecord;
  return typeof d?.id === "string" && typeof d?.title === "string";
}

export function loadDiscoveryResults(smartIdeaId?: string): DiscoveryResultRecord[] {
  const all = readGenesisList(DISCOVERY_KEY, isDiscovery, memoryDiscovery);
  return smartIdeaId ? all.filter((r) => r.smartIdeaId === smartIdeaId) : all;
}

function normalizeRecord(source: CanonicalKnowledgeSource, smartIdeaId: string): DiscoveryResultRecord {
  const doi = source.identifiers.find((i) => i.scheme === "doi")?.value ?? null;
  return {
    id: genesisId("disc"),
    smartIdeaId,
    provider: source.provider,
    title: source.title,
    authors: source.authors,
    date: source.publicationDate,
    doi,
    sourceUrl: source.landingPageUrl,
    openAccessStatus: source.openAccessUrl ? "open_access_link_present" : "unknown",
    abstract: source.abstract,
    publicationType: source.sourceType,
    license: source.provenance.license,
    retrievedAt: source.retrievedAt,
    projectStatus: classifyFromMetadata(source),
    statusEvidence: "Bibliographic metadata only — status not inferred from title alone.",
    statusLimitation: "Publication existence does not prove project success.",
  };
}

function classifyFromMetadata(source: CanonicalKnowledgeSource): ProjectEvidenceStatus {
  if (source.sourceType?.includes("posted-content")) return "Concept";
  return "Status Unknown";
}

export function deduplicateByDoi(records: DiscoveryResultRecord[]): DiscoveryResultRecord[] {
  const seen = new Set<string>();
  const out: DiscoveryResultRecord[] = [];
  for (const r of records) {
    const key = r.doi ?? r.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export async function searchOpenScienceForIdea(input: {
  idea: SmartIdea;
  keyword?: string;
  provider?: KnowledgeProviderId;
  limit?: number;
  externalSearchConfirmed: boolean;
}): Promise<{
  records: DiscoveryResultRecord[];
  limitations: string[];
  connectionState: string;
  sanitizedQuery: string;
}> {
  if (!input.externalSearchConfirmed || input.idea.externalSearchRevoked) {
    return {
      records: [],
      limitations: ["External search requires user confirmation — private artifact content is not transmitted."],
      connectionState: "blocked",
      sanitizedQuery: "",
    };
  }

  const sanitizedQuery = buildExternalSearchQuery(input.idea, input.keyword);
  const queryCheck = assertNoPrivateArtifactInQuery(sanitizedQuery, input.idea);
  if (!queryCheck.ok) {
    return {
      records: [],
      limitations: [queryCheck.reason ?? "Invalid search query."],
      connectionState: "blocked",
      sanitizedQuery: "",
    };
  }

  const provider = input.provider ?? "crossref";
  const result = await searchKnowledgeProvider(provider, sanitizedQuery, input.limit ?? 8);

  recordGenesisAudit({
    domain: "research_canvas",
    action: "research_search",
    recordType: "smart_idea",
    recordId: input.idea.id,
    actorId: input.idea.owner,
    newState: `${provider}:${sanitizedQuery}`,
  });

  const normalized = result.records.map((r) => normalizeRecord(r, input.idea.id));
  const merged = deduplicateByDoi([...loadDiscoveryResults(input.idea.id), ...normalized]);
  writeGenesisList(DISCOVERY_KEY, merged, memoryDiscovery);
  notifyGenesisChanged();

  return {
    records: normalized,
    limitations: [
      ...result.limitations,
      "Found in currently connected CBAI sources.",
      "Abstract/summary only when legally returned by provider.",
      "No paywall bypass.",
    ],
    connectionState: result.connectionState,
    sanitizedQuery,
  };
}

export async function searchAllOpenScienceForIdea(input: {
  idea: SmartIdea;
  keyword?: string;
  limit?: number;
  externalSearchConfirmed: boolean;
}): Promise<{
  records: DiscoveryResultRecord[];
  limitations: string[];
  providerStates: ReadonlyArray<{ provider: KnowledgeProviderId; connectionState: string; count: number }>;
  sanitizedQuery: string;
}> {
  const limitations: string[] = [];
  const providerStates: Array<{ provider: KnowledgeProviderId; connectionState: string; count: number }> = [];
  let allRecords: DiscoveryResultRecord[] = [];

  for (const provider of PRIORITY_OPEN_SCIENCE_PROVIDERS) {
    const result = await searchOpenScienceForIdea({
      ...input,
      provider,
      limit: input.limit ?? 5,
    });
    limitations.push(...result.limitations);
    providerStates.push({
      provider,
      connectionState: result.connectionState,
      count: result.records.length,
    });
    allRecords = deduplicateByDoi([...allRecords, ...result.records]);
  }

  return {
    records: allRecords,
    limitations: [...new Set(limitations)],
    providerStates,
    sanitizedQuery: buildExternalSearchQuery(input.idea, input.keyword),
  };
}

export type TimelineEntry = {
  readonly id: string;
  readonly date: string;
  readonly eventType: string;
  readonly title: string;
  readonly source: string;
  readonly evidenceStatus: string;
  readonly relation: string;
  readonly limitation: string;
};

export function buildHistoricalTimeline(smartIdeaId: string): TimelineEntry[] {
  return loadDiscoveryResults(smartIdeaId)
    .filter((r) => r.date)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .map((r) => ({
      id: r.id,
      date: r.date!,
      eventType: "publication",
      title: r.title,
      source: r.provider,
      evidenceStatus: r.projectStatus,
      relation: "Connected via open-science search",
      limitation: r.statusLimitation,
    }));
}

export type LandscapeItem = {
  readonly kind: "publication" | "author" | "institution" | "gap";
  readonly label: string;
  readonly source: string;
  readonly reason: string;
  readonly limitation: string;
};

export function buildCurrentLandscape(smartIdeaId: string): LandscapeItem[] {
  const results = loadDiscoveryResults(smartIdeaId);
  const items: LandscapeItem[] = results.slice(0, 6).map((r) => ({
    kind: "publication" as const,
    label: r.title,
    source: r.provider,
    reason: "Matched sanitized search concepts",
    limitation: "Found in currently connected CBAI sources.",
  }));

  for (const author of results.flatMap((r) => r.authors).slice(0, 4)) {
    items.push({
      kind: "author",
      label: author,
      source: "publication metadata",
      reason: "Author on connected record",
      limitation: "Employment and affiliation may be outdated.",
    });
  }

  if (results.length === 0) {
    items.push({
      kind: "gap",
      label: "No connected records yet",
      source: "local",
      reason: "Run a confirmed open-science search or import DOI metadata",
      limitation: "CBAI does not claim global completeness.",
    });
  }

  return items;
}

export type ComparisonResult = {
  readonly similarities: readonly string[];
  readonly differences: readonly string[];
  readonly unsupportedAssumptions: readonly string[];
  readonly knowledgeGaps: readonly string[];
  readonly validationNeeded: readonly string[];
  readonly patentNote: string;
};

export function compareIdeaToRecord(idea: SmartIdea, record: DiscoveryResultRecord): ComparisonResult {
  const ideaText = [idea.problem, idea.purpose, idea.expectedResult, ...(idea.ideaModel?.materials ?? [])]
    .join(" ")
    .toLowerCase();
  const recordText = [record.title, record.abstract ?? ""].join(" ").toLowerCase();
  const tokens = ideaText.split(/\W+/).filter((w) => w.length > 4);
  const overlap = tokens.filter((t) => recordText.includes(t));

  return {
    similarities: overlap.length > 0 ? [`Shared concepts: ${overlap.slice(0, 5).join(", ")}`] : ["No strong token overlap detected."],
    differences: [`Record focuses on: ${record.title.slice(0, 80)}`],
    unsupportedAssumptions: idea.ideaModel?.assumptions ?? [],
    knowledgeGaps: ["Replication status unknown unless source states it."],
    validationNeeded: idea.ideaModel?.requiredValidation ?? ["Independent measurement required."],
    patentNote: "Patentability requires professional legal review — CBAI does not provide legal opinions.",
  };
}

export type FailureReason = {
  readonly category: string;
  readonly evidence: "source-confirmed" | "user-confirmed" | "cbai-inference" | "unknown";
  readonly text: string;
};

export function explainFailureReason(record: DiscoveryResultRecord): FailureReason {
  if (record.projectStatus === "Negative Result") {
    return { category: "hypothesis unsupported", evidence: "source-confirmed", text: record.statusEvidence };
  }
  if (record.projectStatus === "Status Unknown") {
    return { category: "reason not publicly available", evidence: "unknown", text: "Insufficient public evidence to explain outcome." };
  }
  return { category: "unknown", evidence: "unknown", text: "Do not infer failure from metadata alone." };
}
