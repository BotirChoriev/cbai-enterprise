// Research Intelligence Domain — the "artifacts" cluster: what research produces. Types only,
// extending CBAI Platform RC-1. See research-entity-base.ts for the eight shared concerns every
// entity below carries.

import type { ResearchEntityBase } from "@/lib/research-domain/research-entity-base";

/** A study or trial run to test a hypothesis using a methodology. */
export interface ExperimentEntity extends ResearchEntityBase {
  entityKind: "experiment";
  description: string;
  methodologyIds: readonly string[];
  hypothesisIds: readonly string[];
}

/** A structured collection of data produced or used by research. */
export interface DatasetEntity extends ResearchEntityBase {
  entityKind: "dataset";
  description: string;
  format?: string;
}

/** A peer-reviewed or official written research output. */
export interface PublicationEntity extends ResearchEntityBase {
  entityKind: "publication";
  title: string;
  publicationDate?: string;
  venue?: string;
}

/** An intellectual-property filing describing an invention arising from research. */
export interface PatentEntity extends ResearchEntityBase {
  entityKind: "patent";
  title: string;
  filingDate?: string;
  jurisdiction?: string;
}

/** A technology, platform, or tool area under study or produced by research. */
export interface TechnologyEntity extends ResearchEntityBase {
  entityKind: "technology";
  description: string;
}
