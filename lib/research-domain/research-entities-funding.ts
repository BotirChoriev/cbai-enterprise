// Research Intelligence Domain — the "funding" cluster. Types only, extending CBAI Platform
// RC-1. See research-entity-base.ts for the eight shared concerns every entity below carries.

import type { ResearchEntityBase } from "@/lib/research-domain/research-entity-base";

/** An announced, not-yet-awarded call for funding proposals. */
export interface FundingOpportunityEntity extends ResearchEntityBase {
  entityKind: "funding_opportunity";
  description: string;
}

/**
 * An awarded funding instrument. `fundingAmount` is kept as an honest, optional string (not a
 * derived or estimated number) — present only when a real, known amount exists.
 */
export interface GrantEntity extends ResearchEntityBase {
  entityKind: "grant";
  fundingAmount?: string;
}

/** The organization or individual providing funding — a company, government agency, investor, or foundation. */
export interface SponsorEntity extends ResearchEntityBase {
  entityKind: "sponsor";
}
