// Universal Global Intelligence Network shapes. Not a social network — no followers, no
// messaging, no popularity. A node is an Intelligence Entity (a real researcher, laboratory,
// university, company, grant, mission, patent, dataset, publication, ...); an edge is the
// Foundation's own Relationship type, so every connection is already evidence-aware and
// traceable by construction (Relationship.evidence, Relationship.limitations). This file adds
// no new edge primitive — it only names the vocabulary of entity kinds the network recognizes
// and the shapes lib/network/ operates on. lib/network/ is the only engine that constructs an
// IntelligenceNetwork or a CollaborationCandidate.

import type { Relationship, Subject } from "@/lib/foundation/foundation-model";

/**
 * The sixteen Intelligence Entity kinds the mission named, treated as a closed vocabulary (the
 * same discipline as RELATIONSHIP_TYPES and WORKFLOW_STATES). Deliberately separate from
 * Subject.subjectKind (a plain string used by every non-network ecosystem, e.g. Research's own
 * "research_topic") rather than narrowing it — retyping Subject.subjectKind to this closed union
 * would break every existing Subject producer that predates the network. A Subject participates
 * in the network by being wrapped in an IntelligenceNetworkNode with a real, honestly-chosen kind.
 */
export const INTELLIGENCE_ENTITY_KINDS = [
  "researcher",
  "engineer",
  "laboratory",
  "university",
  "research_center",
  "company",
  "investor",
  "government_agency",
  "policy_program",
  "grant",
  "mission",
  "evidence",
  "patent",
  "dataset",
  "publication",
  "technology",
] as const;

export type IntelligenceEntityKind = (typeof INTELLIGENCE_ENTITY_KINDS)[number];

export const INTELLIGENCE_ENTITY_KIND_LABELS: Record<IntelligenceEntityKind, string> = {
  researcher: "Researcher",
  engineer: "Engineer",
  laboratory: "Laboratory",
  university: "University",
  research_center: "Research Center",
  company: "Company",
  investor: "Investor",
  government_agency: "Government Agency",
  policy_program: "Policy Program",
  grant: "Grant",
  mission: "Mission",
  evidence: "Evidence",
  patent: "Patent",
  dataset: "Dataset",
  publication: "Publication",
  technology: "Technology",
};

/** A node in the network — a real Subject, tagged with a real, honestly-chosen entity kind. */
export interface IntelligenceNetworkNode {
  subject: Subject;
  entityKind: IntelligenceEntityKind;
}

/** How traceable one edge's evidence backing is — a real count, never a fabricated score. */
export interface IntelligenceNetworkEdgeTrace {
  relationshipId: string;
  evidenceCount: number;
  hasTraceableEvidence: boolean;
}

/**
 * What shared, real intelligence two nodes have in common — never a popularity or connection
 * count. "shared_evidence": both nodes are named in the same Evidence.relatedSubjectIds.
 * "shared_relationship_target": both nodes have a real edge pointing at the same third entity.
 * "shared_mission": the shared target is itself a "mission"-kind node.
 */
export type SharedIntelligenceKind =
  | "shared_evidence"
  | "shared_relationship_target"
  | "shared_mission";

/**
 * One real reason two nodes are collaboration candidates. `sharedReferenceIds` always names the
 * real Evidence or target-entity id the basis is grounded in — collaboration never originates
 * from popularity, and is never asserted without a concrete reference.
 */
export interface CollaborationCandidate {
  nodeAId: string;
  nodeBId: string;
  basis: SharedIntelligenceKind;
  sharedReferenceIds: readonly string[];
}

/**
 * Extension points named by the mission for future capabilities. Every field is
 * `unknown | undefined` — declaring the slot lets a future Epic compose a real value in without
 * another shape change; nothing here is ever populated with a placeholder or fake object.
 */
export interface NetworkExtensionPoints {
  researchCollaboration?: unknown;
  fundingDiscovery?: unknown;
  innovationPartnerships?: unknown;
  universityNetworks?: unknown;
  governmentPrograms?: unknown;
  industrialResearchAndDevelopment?: unknown;
  internationalCollaboration?: unknown;
  missionMatching?: unknown;
  knowledgeExchange?: unknown;
  evidenceSharing?: unknown;
}

/**
 * The Global Intelligence Network — a set of real Intelligence Entity nodes and the real
 * Relationship edges between them. Universal and reusable: every future ecosystem builds one of
 * these from its own real data via lib/network/network-builder.ts; nothing about this shape is
 * Research-, Governance-, or Economic-specific.
 */
export interface IntelligenceNetwork {
  nodes: readonly IntelligenceNetworkNode[];
  edges: readonly Relationship[];
  extensions: NetworkExtensionPoints;
}
