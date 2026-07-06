import { getMissionCatalog } from "@/lib/missions";
import { buildDecisionContext } from "@/lib/decision-intelligence/decision-context";
import { buildDecisionSummary } from "@/lib/decision-intelligence/decision-summary";
import {
  validateDecisionContext,
  validateDecisionContextBatch,
} from "@/lib/decision-intelligence/decision-validation";
import { DECISION_INTELLIGENCE_VERSION } from "@/lib/decision-intelligence/decision-version";
import type {
  DecisionContextRecord,
  DecisionContextTemplate,
  DecisionRegistry,
  DecisionSummary,
} from "@/lib/decision-intelligence/decision-types";

/** Declarative decision context templates — one per active mission persona scope. */
export const DECISION_CONTEXT_TEMPLATES: readonly DecisionContextTemplate[] = [
  {
    slug: "citizen-public-services",
    title: "Citizen Public Services Evidence Scope",
    description:
      "Organize public service indicator evidence for human review — no satisfaction scores or political advice.",
    missionId: "mission-citizen-explore-public-services",
    supportedEntityTypes: ["country"],
  },
  {
    slug: "investor-country-scope",
    title: "Investor Country Evidence Scope",
    description:
      "Organize country-level macro and investment indicator evidence — no investment recommendations.",
    missionId: "mission-investor-evaluate-country",
    supportedEntityTypes: ["country"],
  },
  {
    slug: "government-governance-scope",
    title: "Government Governance Evidence Scope",
    description:
      "Organize governance indicator evidence for institutional review — no policy recommendations.",
    missionId: "mission-government-budget-transparency",
    supportedEntityTypes: ["country"],
  },
  {
    slug: "researcher-cross-entity",
    title: "Researcher Cross-Entity Evidence Scope",
    description:
      "Organize multi-entity indicator evidence for reproducible review — no inferred conclusions.",
    missionId: "mission-researcher-research-country",
    supportedEntityTypes: ["country", "company", "university"],
  },
];

let cachedRegistry: DecisionRegistry | null = null;

/** Build the decision intelligence registry manifest. */
export function buildDecisionRegistry(): DecisionRegistry {
  return {
    version: DECISION_INTELLIGENCE_VERSION,
    decisionRecordVersion: "1.0.0",
    builtAt: new Date().toISOString(),
    templates: DECISION_CONTEXT_TEMPLATES,
    templateCount: DECISION_CONTEXT_TEMPLATES.length,
  };
}

export function getDecisionRegistry(): DecisionRegistry {
  if (!cachedRegistry) {
    cachedRegistry = buildDecisionRegistry();
  }
  return cachedRegistry;
}

export function rebuildDecisionRegistry(): DecisionRegistry {
  cachedRegistry = buildDecisionRegistry();
  return cachedRegistry;
}

export type BuildDecisionFromMissionOptions = {
  missionId: string;
  countryId?: string | null;
  companyId?: string | null;
  universityId?: string | null;
};

/** Build a decision context scoped to a mission and optional entity selection. */
export function buildDecisionContextFromMission(
  options: BuildDecisionFromMissionOptions,
): DecisionContextRecord {
  const catalog = getMissionCatalog();
  const mission = catalog.missions.find((m) => m.missionId === options.missionId);
  const slug = mission
    ? `mission-${mission.persona}-${mission.missionId.split("-").slice(2).join("-")}`
    : `mission-${options.missionId.replace(/^mission-/, "")}`;

  return buildDecisionContext({
    slug,
    input: {
      missionIds: [options.missionId],
      countryId: options.countryId,
      companyId: options.companyId,
      universityId: options.universityId,
    },
  });
}

/** Build a decision context from a registered template. */
export function buildDecisionContextFromTemplate(
  templateSlug: string,
  entityInput: {
    countryId?: string | null;
    companyId?: string | null;
    universityId?: string | null;
  } = {},
): DecisionContextRecord | null {
  const template = DECISION_CONTEXT_TEMPLATES.find((t) => t.slug === templateSlug);
  if (!template) return null;

  return buildDecisionContext({
    slug: template.slug,
    input: {
      missionIds: [template.missionId],
      ...entityInput,
    },
  });
}

/** Build context and summary pair for a template — ready for human review presentation. */
export function buildDecisionPackageFromTemplate(
  templateSlug: string,
  entityInput: {
    countryId?: string | null;
    companyId?: string | null;
    universityId?: string | null;
  } = {},
): { context: DecisionContextRecord; summary: DecisionSummary } | null {
  const template = DECISION_CONTEXT_TEMPLATES.find((t) => t.slug === templateSlug);
  const context = buildDecisionContextFromTemplate(templateSlug, entityInput);
  if (!context || !template) return null;

  const summary = buildDecisionSummary(context, { title: template.title });
  return { context, summary };
}

/** Validate all built-in templates resolve to valid contexts (without entity binding). */
export function validateDecisionRegistryTemplates(): ReturnType<
  typeof validateDecisionContextBatch
> {
  const contexts = DECISION_CONTEXT_TEMPLATES.map((template) =>
    buildDecisionContext({
      slug: template.slug,
      input: { missionIds: [template.missionId] },
    }),
  );

  return validateDecisionContextBatch(contexts);
}

export { validateDecisionContext };
