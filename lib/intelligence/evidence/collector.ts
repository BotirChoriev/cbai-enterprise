import type { EvidenceClaimType } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { Evidence, EvidenceCollection } from "@/lib/intelligence/evidence.types";
import {
  defaultEvidenceSourceRegistry,
  type EvidenceSourceAdapter,
  type EvidenceSourceRegistry,
} from "@/lib/intelligence/evidence/sources";
import { evaluateEvidenceSufficiency } from "@/lib/intelligence/evidence/sufficiency";
import {
  defaultEvidenceQualityAssessor,
  type EvidenceQualityAssessor,
} from "@/lib/intelligence/evidence/quality";
import {
  summarizeEvidenceItems,
  validateEvidenceCollectionShape,
  validateEvidenceShape,
} from "@/lib/intelligence/evidence/validation";

/** Semantic version of the default evidence collector. */
export const EVIDENCE_COLLECTOR_VERSION = "0.5.0-quality-assessment";

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
 * Deduplicate evidence items by stable evidence id — first occurrence wins.
 */
export function deduplicateEvidenceItems(items: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  const deduped: Evidence[] = [];

  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    deduped.push(item);
  }

  return deduped;
}

/**
 * Sort evidence deterministically: relevance descending, then id ascending.
 */
export function sortEvidenceByRelevance(items: Evidence[]): Evidence[] {
  return [...items].sort((a, b) => {
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }

    return a.id.localeCompare(b.id);
  });
}

/**
 * Default evidence collector for the CBAI Intelligence Engine.
 *
 * Orchestrates registered source adapters, validates merged evidence shape,
 * evaluates conservative sufficiency, and records adapter warnings.
 */
export class DefaultEvidenceCollector implements EvidenceCollector {
  private readonly registry: EvidenceSourceRegistry;
  private readonly qualityAssessor: EvidenceQualityAssessor;

  constructor(
    registry: EvidenceSourceRegistry = defaultEvidenceSourceRegistry,
    qualityAssessor: EvidenceQualityAssessor = defaultEvidenceQualityAssessor,
  ) {
    this.registry = registry;
    this.qualityAssessor = qualityAssessor;
  }

  /**
   * Collect evidence by querying enabled adapters in the registry.
   */
  async collect(request: IntelligenceRequest): Promise<EvidenceCollection> {
    const registeredSourceIds = this.registry.getRegisteredIds();
    const enabledAdapters = this.registry.getEnabled();
    const collectedAt = new Date().toISOString();

    const { items: rawItems, warnings } = this.mergeAdapterResults(
      request,
      enabledAdapters,
    );
    const items = sortEvidenceByRelevance(deduplicateEvidenceItems(rawItems));
    const qualityResult = this.qualityAssessor.assessCollection(items);
    const assessedItems = qualityResult.items;
    const { meanRelevance, sourceClassCount } = summarizeEvidenceItems(assessedItems);
    const claimType = inferClaimType(request);
    const sufficiencyStatus = evaluateEvidenceSufficiency(
      assessedItems,
      claimType,
      request.subjectEntities,
    );

    const mergedWarnings = [...warnings, ...qualityResult.summary.warnings];

    const hasSubjectEntities =
      request.subjectEntities !== undefined && request.subjectEntities.length > 0;
    const collectionStatus =
      enabledAdapters.length === 0
        ? "no-sources-connected"
        : assessedItems.length === 0 && hasSubjectEntities
          ? "partial"
          : assessedItems.length === 0
            ? "collected"
            : mergedWarnings.length > 0
              ? "partial"
              : "collected";

    const collection: EvidenceCollection = {
      items: assessedItems,
      claimType,
      sufficiencyStatus,
      contradictionState: "none",
      meanRelevance,
      sourceClassCount,
      quality: qualityResult.summary,
      metadata: {
        collectorId: DEFAULT_EVIDENCE_COLLECTOR_ID,
        collectorVersion: EVIDENCE_COLLECTOR_VERSION,
        status: collectionStatus,
        message: buildCollectionMessage(
          enabledAdapters.length,
          assessedItems.length,
          hasSubjectEntities,
        ),
        registeredSourceIds,
        attemptedSourceIds: enabledAdapters.map((adapter) => adapter.id),
        collectedAt,
        warnings: mergedWarnings.length > 0 ? mergedWarnings : undefined,
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
  ): { items: Evidence[]; warnings: string[] } {
    const merged: Evidence[] = [];
    const warnings: string[] = [];

    for (const adapter of adapters) {
      const result = adapter.collect(request);

      if (result.warnings) {
        warnings.push(...result.warnings);
      }

      for (const item of result.items) {
        validateEvidenceShape(item);
        merged.push(item);
      }
    }

    return { items: merged, warnings };
  }
}

function buildCollectionMessage(
  enabledCount: number,
  itemCount: number,
  hasSubjectEntities: boolean,
): string {
  if (enabledCount === 0) {
    return "Evidence Layer foundation — no source adapters are enabled. Registered adapters exist as skeletons awaiting subsystem connection in future builds.";
  }

  if (itemCount === 0 && !hasSubjectEntities) {
    return "Evidence collection completed — no subjectEntities provided; enabled adapters returned zero items.";
  }

  if (itemCount === 0) {
    return "Evidence collection completed — enabled adapters returned zero items. See metadata warnings for resolution details.";
  }

  return `Evidence collected from ${enabledCount} enabled source adapter(s) — ${itemCount} item(s) assessed for quality from entity-profile, graph, and search sources.`;
}

/** Shared default collector singleton used by the intelligence engine pipeline. */
export const defaultEvidenceCollector = new DefaultEvidenceCollector();
