// Research Intelligence Domain — the "people" cluster. Types only, extending CBAI Platform RC-1.
// See research-entity-base.ts for the eight shared concerns every entity below carries — most
// people entities need no fields beyond the base: `label` is the person's name,
// `organizationIds` is their affiliation, `relationships` carries collaborations, `evidence`
// carries linked credentials/publications, `missions` carries the research missions they
// contribute to, and `timeline` carries career events. Nothing here is a score or a ranking.

import type { ResearchEntityBase } from "@/lib/research-domain/research-entity-base";

export interface ResearcherEntity extends ResearchEntityBase {
  entityKind: "researcher";
}

export interface EngineerEntity extends ResearchEntityBase {
  entityKind: "engineer";
}

export interface ScientistEntity extends ResearchEntityBase {
  entityKind: "scientist";
}

export interface AcademicEntity extends ResearchEntityBase {
  entityKind: "academic";
}

/** The one people-entity with a genuinely distinct real-world concept: a supervising advisor. */
export interface StudentResearcherEntity extends ResearchEntityBase {
  entityKind: "student_researcher";
  supervisorId?: string;
}
