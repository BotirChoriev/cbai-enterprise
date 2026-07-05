import type { EntityType } from "@/lib/entity/entity.types";

/**
 * Intelligence product classification per Intelligence Specification §1.3.
 */
export type IntelligenceType =
  | "entity"
  | "relational"
  | "comparative"
  | "predictive"
  | "operational"
  | "document";

/**
 * Query intent classification per Domain Model §6.6.
 * Drives signal prioritization during inference.
 */
export type QueryIntent =
  | "investment"
  | "partnership"
  | "comparative"
  | "competitive"
  | "academic"
  | "general";

/**
 * Lightweight entity reference for request scoping without full Entity payloads.
 */
export interface EntityRef {
  /** Ontology class. */
  type: EntityType;
  /** Domain-scoped entity identifier. */
  id: string;
  /** Optional display name supplied by the caller. */
  name?: string;
}

/**
 * Input envelope for an intelligence pipeline run.
 *
 * Captures the user's question, optional scope constraints, and metadata
 * required to execute the Sense → Reason portion of the intelligence lifecycle.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §2, §6
 */
export interface IntelligenceRequest {
  /** Unique identifier for this request (client- or server-generated). */
  id: string;
  /** Natural-language intelligence question or command. */
  question: string;
  /** Expected intelligence product type; inferred when omitted. */
  type?: IntelligenceType;
  /** Query intent for signal prioritization; classified when omitted. */
  intent?: QueryIntent;
  /** Optional entity scope — limits search, graph seeds, and evidence binding. */
  subjectEntities?: EntityRef[];
  /** Optional tenant scope for production multi-tenancy. */
  tenantId?: string;
  /** ISO-8601 timestamp when the request was created. */
  requestedAt: string;
  /** Optional identifier linking to a saved command or conversation thread. */
  conversationId?: string;
  /** Whether to include organizational memory in the inference context. */
  includeMemory?: boolean;
  /** Whether to traverse the knowledge graph beyond search matches. */
  includeGraph?: boolean;
}
