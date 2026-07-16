/**
 * Supreme Product Constitution — highest authority for all product decisions.
 *
 * These eight principles sit above engineering rules, UI conventions, and feature requests.
 * Every module, route, and interaction must be auditable against them.
 *
 * NOT a CV. NOT a diploma. NOT a job title. Capability is earned through demonstrated work.
 */

export type SupremePrincipleId =
  | "humanity-first"
  | "nature-first"
  | "evidence-first"
  | "truth-before-popularity"
  | "capability-before-status"
  | "knowledge-has-no-borders"
  | "intelligence-has-no-passport"
  | "technology-expands-human-potential";

export type SupremePrinciple = {
  readonly id: SupremePrincipleId;
  readonly title: string;
  readonly statement: string;
  readonly productImplication: string;
};

export const SUPREME_PRINCIPLES: readonly SupremePrinciple[] = [
  {
    id: "humanity-first",
    title: "Humanity First",
    statement: "Every scientific activity must ultimately improve humanity.",
    productImplication:
      "No feature optimizes engagement, virality, or revenue at the expense of human understanding or welfare.",
  },
  {
    id: "nature-first",
    title: "Nature First",
    statement: "Knowledge must protect nature and future generations.",
    productImplication:
      "Environmental and intergenerational impact is a required consideration in evidence presentation and decision support.",
  },
  {
    id: "evidence-first",
    title: "Evidence First",
    statement: "No conclusion without evidence.",
    productImplication:
      "Every claim shows source, status, and gaps — or is labeled honestly as unavailable.",
  },
  {
    id: "truth-before-popularity",
    title: "Truth Before Popularity",
    statement: "Popularity never overrides evidence.",
    productImplication:
      "No rankings, sentiment scores, viral metrics, or social proof as intelligence.",
  },
  {
    id: "capability-before-status",
    title: "Capability Before Status",
    statement:
      "Diploma is respected. Capability is measured. Opportunity follows demonstrated capability. Never social status.",
    productImplication:
      "The Capability Passport replaces title-based access. Roles are preferences, not gates.",
  },
  {
    id: "knowledge-has-no-borders",
    title: "Knowledge Has No Borders",
    statement: "Knowledge Has No Borders.",
    productImplication:
      "Discovery and opportunity surfacing ignore country, wealth, organization, and institutional gatekeeping.",
  },
  {
    id: "intelligence-has-no-passport",
    title: "Intelligence Has No Passport",
    statement: "Intelligence Has No Passport.",
    productImplication:
      "One Universal Intelligence Environment — no separate doctor, professor, or investor portals.",
  },
  {
    id: "technology-expands-human-potential",
    title: "Technology Expands Human Potential",
    statement: "Technology exists to expand human potential. Never replace it.",
    productImplication:
      "Human decision responsibility is always visible. The Operator assists; it never concludes.",
  },
] as const;

export function getSupremePrinciple(id: SupremePrincipleId): SupremePrinciple | undefined {
  return SUPREME_PRINCIPLES.find((p) => p.id === id);
}

export function getAllSupremePrincipleIds(): readonly SupremePrincipleId[] {
  return SUPREME_PRINCIPLES.map((p) => p.id);
}
