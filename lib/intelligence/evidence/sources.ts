import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { Evidence, EvidenceSourceClass } from "@/lib/intelligence/evidence.types";
import { createEntityProfileEvidenceAdapter } from "@/lib/intelligence/evidence/adapters/entity";
import { createGraphEvidenceAdapter } from "@/lib/intelligence/evidence/adapters/graph";
import { createSearchEvidenceAdapter } from "@/lib/intelligence/evidence/adapters/search";
import { createDocumentEvidenceAdapter } from "@/lib/intelligence/evidence/adapters/document";

/**
 * Result returned by an evidence source adapter collection run.
 */
export interface EvidenceSourceAdapterCollectResult {
  items: Evidence[];
  warnings?: string[];
}

/**
 * Contract for a pluggable evidence source adapter.
 *
 * Each adapter corresponds to one {@link EvidenceSourceClass} and is
 * responsible for retrieving evidence items from a specific CBAI subsystem
 * (Global Search, Knowledge Graph, entity profiles, documents, etc.).
 *
 * Adapters must return structurally valid {@link Evidence} items;
 * the collector validates shape before merging.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §3.3
 */
export interface EvidenceSourceAdapter {
  /** Stable adapter identifier (e.g. `search`, `entity-profile`). */
  readonly id: string;
  /** Evidence source class this adapter produces. */
  readonly sourceClass: EvidenceSourceClass;
  /** Human-readable adapter label for traces and metadata. */
  readonly label: string;
  /** Description of the subsystem this adapter will connect to. */
  readonly description: string;
  /** Whether the adapter is active for collection runs. */
  readonly enabled: boolean;
  /**
   * Collect evidence items for the given request.
   *
   * Returns items and optional warnings. Skeleton adapters return empty items.
   */
  collect(request: IntelligenceRequest): EvidenceSourceAdapterCollectResult;
}

/**
 * Skeleton adapter definition used to seed the registry without fetching data.
 */
interface EvidenceSourceDefinition {
  id: string;
  sourceClass: EvidenceSourceClass;
  label: string;
  description: string;
}

/**
 * Registered future source adapters — all disabled in BUILD-023.
 *
 * These entries document which CBAI subsystems will supply evidence
 * without connecting to them yet.
 */
const EVIDENCE_SOURCE_DEFINITIONS: readonly EvidenceSourceDefinition[] = [
  {
    id: "entity-profile",
    sourceClass: "entity-profile",
    label: "Entity Profile",
    description: "Entity overview, aiSummary, metadata, and metrics from domain adapters.",
  },
  {
    id: "search",
    sourceClass: "search",
    label: "Global Search",
    description: "Unified entity index search matches with relevance scoring.",
  },
  {
    id: "knowledge-graph",
    sourceClass: "knowledge-graph",
    label: "Knowledge Graph",
    description: "Traversed graph edge paths between matched entities.",
  },
  {
    id: "document",
    sourceClass: "document",
    label: "Knowledge Documents",
    description: "Indexed document chunks from the Knowledge module.",
  },
  {
    id: "agent-output",
    sourceClass: "agent-output",
    label: "Agent Output",
    description: "Prior agent task results linked to entities.",
  },
  {
    id: "human-input",
    sourceClass: "human-input",
    label: "Human Input",
    description: "Explicit user assertions linked to entities.",
  },
  {
    id: "external-feed",
    sourceClass: "external-feed",
    label: "External Feed",
    description: "Ingested third-party data with declared provenance.",
  },
];

/**
 * Creates a disabled skeleton adapter from a source definition.
 */
function createSkeletonAdapter(definition: EvidenceSourceDefinition): EvidenceSourceAdapter {
  return {
    id: definition.id,
    sourceClass: definition.sourceClass,
    label: definition.label,
    description: definition.description,
    enabled: false,
    collect(request: IntelligenceRequest): EvidenceSourceAdapterCollectResult {
      void request;
      return { items: [] };
    },
  };
}

/**
 * Registry of evidence source adapters for the Evidence Layer.
 *
 * Manages adapter registration and exposes enabled adapters to the collector.
 * Extension point: enable adapters and swap `collect` implementations per build.
 */
export class EvidenceSourceRegistry {
  private readonly adapters = new Map<string, EvidenceSourceAdapter>();

  /**
   * Register or replace an evidence source adapter.
   */
  register(adapter: EvidenceSourceAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  /**
   * Remove an adapter from the registry.
   */
  unregister(id: string): void {
    this.adapters.delete(id);
  }

  /**
   * Retrieve a registered adapter by ID.
   */
  get(id: string): EvidenceSourceAdapter | undefined {
    return this.adapters.get(id);
  }

  /**
   * All registered adapters in registration order.
   */
  getAll(): EvidenceSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Adapters currently enabled for collection runs.
   */
  getEnabled(): EvidenceSourceAdapter[] {
    return this.getAll().filter((adapter) => adapter.enabled);
  }

  /**
   * Stable IDs of all registered adapters.
   */
  getRegisteredIds(): string[] {
    return this.getAll().map((adapter) => adapter.id);
  }
}

/**
 * Default registry pre-loaded with skeleton adapters for future source classes,
 * enabled entity-profile, graph, and search adapters, and the disabled
 * document adapter foundation (BUILD-033).
 */
export function createDefaultEvidenceSourceRegistry(): EvidenceSourceRegistry {
  const registry = new EvidenceSourceRegistry();

  for (const definition of EVIDENCE_SOURCE_DEFINITIONS) {
    if (definition.id === "entity-profile") {
      registry.register(createEntityProfileEvidenceAdapter());
      continue;
    }

    if (definition.id === "search") {
      registry.register(createSearchEvidenceAdapter());
      continue;
    }

    if (definition.id === "knowledge-graph") {
      registry.register(createGraphEvidenceAdapter());
      continue;
    }

    if (definition.id === "document") {
      registry.register(createDocumentEvidenceAdapter());
      continue;
    }

    registry.register(createSkeletonAdapter(definition));
  }

  return registry;
}

/** Shared default registry singleton for the intelligence engine. */
export const defaultEvidenceSourceRegistry = createDefaultEvidenceSourceRegistry();
