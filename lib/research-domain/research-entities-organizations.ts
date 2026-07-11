// Research Intelligence Domain — the "organizations" cluster. Types only, extending CBAI
// Platform RC-1. See research-entity-base.ts for the eight shared concerns every entity below
// carries — `organizationIds` lets an organization reference its own parent (e.g. a Laboratory's
// hosting University), and every person or artifact entity that belongs to one of these
// organizations references it back the same way, avoiding a circular embedding.
//
// Deliberately not the same type as lib/universities.ts's `University` — that is the existing,
// unrelated Entity-framework record behind the live `/universities` route; this is the
// Foundation-aligned representation a future adapter may build from it, not a replacement.

import type { ResearchEntityBase } from "@/lib/research-domain/research-entity-base";

export interface LaboratoryEntity extends ResearchEntityBase {
  entityKind: "laboratory";
}

export interface ResearchCenterEntity extends ResearchEntityBase {
  entityKind: "research_center";
}

export interface UniversityEntity extends ResearchEntityBase {
  entityKind: "university";
}
