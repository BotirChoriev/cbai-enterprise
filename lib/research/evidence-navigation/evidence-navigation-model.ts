import type {
  EvidenceNavigationObjectKind,
  EvidenceNavigationRelationshipType,
  EvidenceNavigationStatus,
} from "@/lib/research/evidence-navigation/evidence-navigation-types";

export interface EvidenceNavigationNode {
  nodeId: string;
  objectKind: EvidenceNavigationObjectKind;
  objectId: string;
  label: string;
  status: EvidenceNavigationStatus;
}

export interface EvidenceNavigationEdge {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: EvidenceNavigationRelationshipType;
  status: EvidenceNavigationStatus;
}

export interface EvidenceNavigationPath {
  pathId: string;
  nodes: readonly EvidenceNavigationNode[];
  edges: readonly EvidenceNavigationEdge[];
  status: EvidenceNavigationStatus;
  humanReviewRequired: boolean;
}

export type { EvidenceNavigationStatus };
