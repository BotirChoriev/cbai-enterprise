import type { EntityType } from "@/lib/entity/entity.types";
import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceType } from "@/lib/intelligence/request.types";
import type { ReasoningTrace } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";

/**
 * Intelligence lifecycle state per Intelligence Specification §2.3.
 */
export type IntelligenceLifecycleState =
  | "draft"
  | "active"
  | "flagged"
  | "superseded"
  | "rejected"
  | "expired"
  | "archived";

/**
 * Human override status per Intelligence Specification §1.4 and §13.
 */
export type OverrideStatus =
  | "none"
  | "flagged"
  | "superseded"
  | "human-authored";

/**
 * Subject entity reference embedded in an intelligence result.
 */
export interface IntelligenceSubjectEntity {
  /** Ontology class. */
  type: EntityType;
  /** Domain-scoped entity identifier. */
  id: string;
  /** Canonical display name at production time. */
  name: string;
}

/**
 * Structured summary block for executive-facing intelligence delivery.
 */
export interface IntelligenceSummary {
  /** One-sentence headline conclusion. */
  headline: string;
  /** Key findings supporting the claim. */
  keyFindings: string[];
  /** Explicit limitations and uncertainty disclosures. */
  caveats: string[];
  /** Optional recommended next steps or actions. */
  recommendedActions: string[];
}

/**
 * Complete intelligence product — the governed output of the Reason and Deliver stages.
 *
 * Satisfies the six intelligence criteria from Intelligence Specification §1.1:
 * grounded, supported, scored, explainable, governed, and actionable or informational.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §1.4
 * @see docs/build-029-report.md
 */
export interface IntelligenceResult {
  /** Unique identifier for this intelligence product. */
  id: string;
  /** Identifier of the {@link IntelligenceRequest} that produced this result. */
  requestId: string;
  /** Intelligence product classification. */
  type: IntelligenceType;
  /** Primary conclusion or claim (human-readable). */
  claim: string;
  /** Full synthesized answer text for delivery surfaces. */
  finalAnswer: string;
  /** Executive-facing summary — factual, never fabricated (BUILD-029). */
  executiveSummary: string;
  /** Entities the intelligence is about — grounding requirement. */
  subjectEntities: IntelligenceSubjectEntity[];
  /** Related entities from request scope (BUILD-029 enterprise contract). */
  relatedEntities: IntelligenceSubjectEntity[];
  /** Aggregated supporting evidence with sufficiency and contradiction state. */
  evidence: EvidenceCollection;
  /** Evidence-quality confidence assessment. */
  confidence: ConfidenceAssessment;
  /** Organizational trust assessment. */
  trust: TrustAssessment;
  /** Complete pipeline audit trace for explainability and verification. */
  reasoningTrace: ReasoningTrace;
  /** Graph context used during inference. */
  graphContext?: GraphContext;
  /** Memory context injected during inference. */
  memoryContext?: MemoryContext;
  /** Structured summary for delivery and executive surfaces. */
  summary: IntelligenceSummary;
  /** Recommended actions — empty when evidence is insufficient (BUILD-029). */
  recommendations: string[];
  /** Pipeline warnings propagated from the reasoning trace. */
  warnings: string[];
  /** ISO-8601 timestamp when the intelligence was produced. */
  producedAt: string;
  /** Optional ISO-8601 freshness horizon after which intelligence should be regenerated. */
  validUntil?: string;
  /** Lifecycle state governing retention and retrieval. */
  lifecycleState: IntelligenceLifecycleState;
  /** Human override status. */
  overrideStatus: OverrideStatus;
  /** Whether the product is past its validity horizon. */
  isStale?: boolean;
}
