import type { EvidenceClaimType } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import {
  defaultEvidenceSourceRegistry,
  type EvidenceSourceAdapter,
  type EvidenceSourceRegistry,
} from "@/lib/intelligence/evidence/sources";
import {
  summarizeEvidenceItems,
  validateEvidenceCollectionShape,
  validateEvidenceShape,
} from "@/lib/intelligence/evidence/validation";

/** Semantic version of the default evidence collector. */
export const EVIDENCE_COLLECTOR_VERSION = "0.1.0-foundation";

/** Stable identifier recorded in collection metadata. */
export const DEFAULT_EVIDENCE_COLLECTOR_ID = "default-evidence-collector";

/**
 * Contract for the CBAI Evidence Layer collector.
 *
 * Accepts an {@link IntelligenceRequest} and returns a governed
 * {@link EvidenceCollection} suitable for downstream confidence and trust stages.
 */
export interface EvidenceCollector {
  /**
   * Collect evidence for the given intelligence request.
   *
   * @param request - Validated intelligence request
   * @returns Assembled evidence collection with metadata
   */
  collect(request: IntelligenceRequest): Promise<EvidenceCollection>;
}

/**
 * Infers claim type from request metadata for sufficiency threshold selection.
 *
 * Structural classification only — not content analysis.
 */
function inferClaimType(request: IntelligenceRequest): EvidenceClaimType {
  if (request.intent === "comparative") {
    return "comparative";
  }

  if (request.type === "relational") {
    return "relational";
  }

  if (request.type === "comparative") {
    return "comparative";
  }

  if (request.type === "predictive") {
    return "strategic";
  }

  return "descriptive";
}

/**
 * Default evidence collector for the CBAI Intelligence Engine (BUILD-023).
 *
 * Orchestrates registered source adapters, validates merged evidence shape,
 * and returns an empty collection with explicit metadata when no sources
 * are connected.
 *
 * Behavior is equivalent to BUILD-022 hardcoded empty evidence — items remain
 * empty — but collection now flows through the Evidence Layer framework.
 */
export class DefaultEvidenceCollector implements EvidenceCollector {
  private readonly registry: EvidenceSourceRegistry;

  constructor(registry: EvidenceSourceRegistry = defaultEvidenceSourceRegistry) {
    this.registry = registry;
  }

  /**
   * Collect evidence by querying enabled adapters in the registry.
   *
   * BUILD-023: all skeleton adapters are disabled — returns empty items with
   * `no-sources-connected` metadata. Future builds enable adapters individually.
   */
  async collect(request: IntelligenceRequest): Promise<EvidenceCollection> {
    const registeredSourceIds = this.registry.getRegisteredIds();
    const enabledAdapters = this.registry.getEnabled();
    const collectedAt = new Date().toISOString();

    const items = this.mergeAdapterResults(request, enabledAdapters);
    const { meanRelevance, sourceClassCount } = summarizeEvidenceItems(items);

    const collection: EvidenceCollection = {
      items,
      claimType: inferClaimType(request),
      sufficiencyStatus: items.length === 0 ? "insufficient" : "minimum",
      contradictionState: "none",
      meanRelevance,
      sourceClassCount,
      metadata: {
        collectorId: DEFAULT_EVIDENCE_COLLECTOR_ID,
        collectorVersion: EVIDENCE_COLLECTOR_VERSION,
        status: enabledAdapters.length === 0 ? "no-sources-connected" : "collected",
        message:
          enabledAdapters.length === 0
            ? "Evidence Layer foundation — no source adapters are enabled. Registered adapters exist as skeletons awaiting subsystem connection in future builds."
            : "Evidence collected from enabled source adapters.",
        registeredSourceIds,
        attemptedSourceIds: enabledAdapters.map((adapter) => adapter.id),
        collectedAt,
      },
    };

    validateEvidenceCollectionShape(collection);

    return collection;
  }

  /**
   * Invoke each enabled adapter and merge results with shape validation.
   */
  private mergeAdapterResults(
    request: IntelligenceRequest,
    adapters: EvidenceSourceAdapter[],
  ) {
    const merged = [];

    for (const adapter of adapters) {
      const adapterItems = adapter.collect(request);

      for (const item of adapterItems) {
        validateEvidenceShape(item);
        merged.push(item);
      }
    }

    return merged;
  }
}

/** Shared default collector singleton used by the intelligence engine pipeline. */
export const defaultEvidenceCollector = new DefaultEvidenceCollector();
