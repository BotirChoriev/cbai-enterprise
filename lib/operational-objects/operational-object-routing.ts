/**
 * Deterministic routing for confirmed operational objects.
 */

import type { OperationalObject, OperationalObjectDomain, OperationalObjectType } from "@/lib/operational-objects/operational-object.types";

export type OperationalObjectRoute = {
  readonly href: string;
  readonly labelKey: string;
  readonly reasonKey: string;
};

const DOMAIN_ROUTES: Record<OperationalObjectDomain, OperationalObjectRoute> = {
  research: {
    href: "/research",
    labelKey: "operationalObject.routeResearch",
    reasonKey: "operationalObject.routeResearchReason",
  },
  evidence: {
    href: "/knowledge",
    labelKey: "operationalObject.routeEvidence",
    reasonKey: "operationalObject.routeEvidenceReason",
  },
  countries: {
    href: "/countries",
    labelKey: "operationalObject.routeCountries",
    reasonKey: "operationalObject.routeCountriesReason",
  },
  companies: {
    href: "/companies",
    labelKey: "operationalObject.routeCompanies",
    reasonKey: "operationalObject.routeCompaniesReason",
  },
  universities: {
    href: "/universities",
    labelKey: "operationalObject.routeUniversities",
    reasonKey: "operationalObject.routeUniversitiesReason",
  },
  governance: {
    href: "/governance",
    labelKey: "operationalObject.routeGovernance",
    reasonKey: "operationalObject.routeGovernanceReason",
  },
  investor: {
    href: "/investor",
    labelKey: "operationalObject.routeInvestor",
    reasonKey: "operationalObject.routeInvestorReason",
  },
  reports: {
    href: "/reports",
    labelKey: "operationalObject.routeReports",
    reasonKey: "operationalObject.routeReportsReason",
  },
  knowledge: {
    href: "/graph",
    labelKey: "operationalObject.routeKnowledge",
    reasonKey: "operationalObject.routeKnowledgeReason",
  },
  general: {
    href: "/my-work",
    labelKey: "operationalObject.routeMyWork",
    reasonKey: "operationalObject.routeMyWorkReason",
  },
};

const TYPE_OVERRIDES: Partial<Record<OperationalObjectType, OperationalObjectRoute>> = {
  evidence_request: DOMAIN_ROUTES.evidence,
  research_question: DOMAIN_ROUTES.research,
  decision_brief: DOMAIN_ROUTES.governance,
  work_plan: DOMAIN_ROUTES.general,
  task: DOMAIN_ROUTES.general,
  project: DOMAIN_ROUTES.general,
  mission: DOMAIN_ROUTES.general,
};

export function routeOperationalObject(object: Pick<OperationalObject, "type" | "domain" | "projectId">): OperationalObjectRoute {
  if (object.projectId) {
    return {
      href: `/my-work?project=${encodeURIComponent(object.projectId)}`,
      labelKey: "operationalObject.routeProject",
      reasonKey: "operationalObject.routeProjectReason",
    };
  }
  return TYPE_OVERRIDES[object.type] ?? DOMAIN_ROUTES[object.domain] ?? DOMAIN_ROUTES.general;
}

export function myWorkHrefForObject(objectId: string): string {
  return `/my-work?object=${encodeURIComponent(objectId)}`;
}
