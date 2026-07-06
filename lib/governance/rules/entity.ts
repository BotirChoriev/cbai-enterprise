import type { EntityRule } from "@/lib/governance/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

function defineEntityRule(
  input: Omit<EntityRule, "category" | "version">,
): EntityRule {
  return { ...input, category: "entity", version: GOVERNANCE_VERSION };
}

/** Entity module governance rules — active and future entity types. */
export const ENTITY_RULES: readonly EntityRule[] = [
  defineEntityRule({
    id: "entity-country-golden-rule",
    slug: "country-golden-rule",
    entityType: "country",
    title: "Country Golden Rule Compliance",
    description:
      "Country modules must follow the Golden Rule reference pattern: registry facts labeled, extended data requires connected indicators.",
    severity: "critical",
    allowed: [
      "Local registry fields with source label",
      "Indicator blocks with status per domain",
      "Six persona sections",
    ],
    forbidden: [
      "Fabricated GDP or macro scores",
      "Political advocacy framing",
      "Unlabeled unavailable fields",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
  defineEntityRule({
    id: "entity-company-honesty",
    slug: "company-honesty-pattern",
    entityType: "company",
    title: "Company Honesty Pattern",
    description:
      "Company modules must match countries honesty: catalog facts only until financial and innovation sources connect.",
    severity: "critical",
    allowed: [
      "Registry name, industry, domicile from catalog",
      "Patent and financial indicators as not_connected",
    ],
    forbidden: [
      "Investment scores and AI readiness percentages",
      "Buy/sell recommendations",
      "Fabricated revenue when source disconnected",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
  defineEntityRule({
    id: "entity-university-no-rankings",
    slug: "university-no-rankings",
    entityType: "university",
    title: "University No Rankings",
    description:
      "University modules must not display league tables, global rankings, or fabricated research scores.",
    severity: "critical",
    allowed: [
      "Institution registry facts",
      "Research indicators with not_connected status",
      "Accreditation references when sourced",
    ],
    forbidden: [
      "League tables and Top-N positioning",
      "Fabricated research strength scores",
      "Ranking badges without verified source",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
  defineEntityRule({
    id: "entity-government-planned",
    slug: "government-institution-standard",
    entityType: "government",
    title: "Government Institution Standard",
    description:
      "Future government institution modules must use official gazette and administrative registries as primary evidence.",
    severity: "major",
    allowed: [
      "Governance and procurement indicators",
      "Public services coverage indicators",
    ],
    forbidden: [
      "Partisan performance scores",
      "Unofficial organigrams as verified fact",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
  defineEntityRule({
    id: "entity-investor-planned",
    slug: "investor-entity-standard",
    entityType: "investor",
    title: "Investor Entity Standard",
    description:
      "Future investor entities require fund registry and balance-of-payments evidence — not marketing attractiveness scores.",
    severity: "major",
    allowed: [
      "Investment relationship edges with evidence status",
      "FDI indicators from official statistics",
    ],
    forbidden: [
      "Proprietary attractiveness indices without methodology",
      "Undisclosed portfolio performance claims",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
  defineEntityRule({
    id: "entity-person-privacy",
    slug: "person-entity-privacy",
    entityType: "person",
    title: "Person Entity Privacy Governance",
    description:
      "Future person entities require strict privacy tiering and public-record-only evidence.",
    severity: "critical",
    allowed: [
      "Public official records with attribution",
      "Researcher profiles from verified indexes",
    ],
    forbidden: [
      "Private individual data without consent",
      "Social profile scraping as evidence",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
  defineEntityRule({
    id: "entity-institution-standard",
    slug: "institution-entity-standard",
    entityType: "institution",
    title: "Institution Entity Standard",
    description:
      "Institution entities (NGO, multilateral, regulator) require registry facts and applicable governance indicators.",
    severity: "major",
    allowed: [
      "Institution type classification",
      "Public procurement and service indicators",
    ],
    forbidden: [
      "Endorsement or advocacy positioning",
      "Unverified operational metrics",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
  defineEntityRule({
    id: "entity-adapter-single-source",
    slug: "entity-adapter-single-source",
    entityType: "country",
    title: "Entity Adapter Single Source",
    description:
      "Domain modules own data; adapters normalize to Entity without parallel stores.",
    severity: "critical",
    allowed: [
      "lib/{module}.ts as authoritative source",
      "Adapter transformation without duplication",
    ],
    forbidden: [
      "Parallel entity stores in graph or search",
      "UI-only entity data not in domain module",
    ],
    standardReference: "docs/standards/04-entity-standard.md",
  }),
] as const;

export function getEntityRulesByType(
  entityType: EntityRule["entityType"],
): EntityRule[] {
  return ENTITY_RULES.filter((rule) => rule.entityType === entityType);
}
