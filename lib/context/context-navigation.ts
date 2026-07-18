import type {
  ContextBreadcrumbSegment,
  ContextEntityRef,
  PlatformContextHeaderModel,
  PlatformContextSnapshot,
  RelatedModuleLink,
  WorkspaceId,
} from "@/lib/context/context-types";
import { CONTEXT_PARAM_KEYS } from "@/lib/context/context-types";
import { serializeContextToParams, getPrimaryEntity } from "@/lib/context/context-builder";

export type PlatformModuleId =
  | "home"
  | "search"
  | "evidence"
  | "reports"
  | "reasoning"
  | "countries"
  | "companies"
  | "universities"
  | "government"
  | "investor"
  | "citizen"
  | "governance"
  | "dashboard"
  | "graph";

export type PlatformModuleDefinition = {
  id: PlatformModuleId;
  label: string;
  path: string;
  description: string;
};

export const PLATFORM_MODULES: Record<PlatformModuleId, PlatformModuleDefinition> = {
  home: {
    id: "home",
    label: "Home",
    path: "/",
    description: "Platform entry point.",
  },
  search: {
    id: "search",
    label: "Search",
    path: "/search",
    description: "Global entity search.",
  },
  evidence: {
    id: "evidence",
    label: "Evidence",
    path: "/knowledge",
    description: "Evidence architecture and source status.",
  },
  reports: {
    id: "reports",
    label: "Reports",
    path: "/reports",
    description: "Report readiness center.",
  },
  reasoning: {
    id: "reasoning",
    label: "Reasoning",
    path: "/reasoning",
    description: "Evidence-to-judgment pipeline.",
  },
  countries: {
    id: "countries",
    label: "Countries",
    path: "/countries",
    description: "Country intelligence profiles.",
  },
  companies: {
    id: "companies",
    label: "Companies",
    path: "/companies",
    description: "Company intelligence profiles.",
  },
  universities: {
    id: "universities",
    label: "Universities",
    path: "/universities",
    description: "University intelligence profiles.",
  },
  government: {
    id: "government",
    label: "Government",
    path: "/government",
    description: "Government evidence workspace.",
  },
  investor: {
    id: "investor",
    label: "Investor",
    path: "/investor",
    description: "Investor evidence workspace.",
  },
  citizen: {
    id: "citizen",
    label: "Citizen",
    path: "/citizen",
    description: "Citizen public information workspace.",
  },
  governance: {
    id: "governance",
    label: "Governance",
    path: "/governance",
    description: "Constitutional governance control.",
  },
  dashboard: {
    id: "dashboard",
    label: "System Monitor",
    path: "/dashboard",
    description: "Runtime system monitor.",
  },
  graph: {
    id: "graph",
    label: "Knowledge Graph",
    path: "/graph",
    description: "Entity relationship graph.",
  },
};

/** Routes that display the Platform Context Header. */
export const CONTEXT_HEADER_ROUTES = new Set<string>([
  "/countries",
  "/companies",
  "/universities",
  "/knowledge",
  "/government",
  "/investor",
  "/citizen",
  "/analytics",
  "/reports",
  "/governance",
  "/reasoning",
  "/search",
  "/graph",
]);

export function shouldShowContextHeader(pathname: string): boolean {
  return CONTEXT_HEADER_ROUTES.has(pathname);
}

export function workspaceIdFromPath(pathname: string): WorkspaceId | null {
  if (pathname === "/government") return "government";
  if (pathname === "/investor") return "investor";
  if (pathname === "/citizen") return "citizen";
  return null;
}

export function moduleIdFromPath(pathname: string): PlatformModuleId | null {
  const entry = Object.values(PLATFORM_MODULES).find((mod) => mod.path === pathname);
  return entry?.id ?? null;
}

function buildHref(
  path: string,
  snapshot: Pick<
    PlatformContextSnapshot,
    "country" | "company" | "university" | "workspace" | "searchQuery"
  >,
  overrides?: Partial<{
    workspace: WorkspaceId | null;
    preserveSearch: boolean;
    missionId: string | null;
    projectId: string | null;
  }>,
): string {
  const params = serializeContextToParams({
    country: snapshot.country,
    company: snapshot.company,
    university: snapshot.university,
    workspace: overrides?.workspace ?? snapshot.workspace,
    searchQuery: overrides?.preserveSearch === false ? "" : snapshot.searchQuery,
    missionId: overrides?.missionId ?? null,
    projectId: overrides?.projectId ?? null,
  });

  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
}

export function buildContextualHref(
  path: string,
  snapshot: PlatformContextSnapshot,
  operating?: { missionId?: string | null; projectId?: string | null },
): string {
  return buildHref(path, snapshot, {
    missionId: operating?.missionId ?? null,
    projectId: operating?.projectId ?? null,
  });
}

function entityPrimaryModules(kind: "country" | "company" | "university"): PlatformModuleId[] {
  switch (kind) {
    case "country":
      return [
        "countries",
        "evidence",
        "reports",
        "investor",
        "government",
        "reasoning",
        "graph",
      ];
    case "company":
      return ["companies", "countries", "investor", "evidence", "reports", "reasoning"];
    case "university":
      return ["universities", "countries", "evidence", "reports", "reasoning", "graph"];
  }
}

export function buildRelatedModules(
  snapshot: PlatformContextSnapshot,
  operating?: { missionId?: string | null; projectId?: string | null },
): RelatedModuleLink[] {
  const primary = getPrimaryEntity(snapshot);

  if (!primary) {
    return [
      PLATFORM_MODULES.search,
      PLATFORM_MODULES.evidence,
      PLATFORM_MODULES.reports,
      PLATFORM_MODULES.reasoning,
    ].map((mod) => ({
      id: mod.id,
      label: mod.label,
      href: buildHref(mod.path, snapshot, operating),
      description: mod.description,
    }));
  }

  return entityPrimaryModules(primary.kind).map((moduleId) => {
    const mod = PLATFORM_MODULES[moduleId];
    return {
      id: mod.id,
      label: mod.label,
      href: buildHref(mod.path, snapshot, operating),
      description: mod.description,
    };
  });
}

export function buildQuickActions(
  snapshot: PlatformContextSnapshot,
  operating?: { missionId?: string | null; projectId?: string | null },
): RelatedModuleLink[] {
  const links: RelatedModuleLink[] = [];

  if (snapshot.country) {
    links.push({
      id: "open-country",
      label: "Open Country",
      href: buildHref(PLATFORM_MODULES.countries.path, snapshot, operating),
      description: "View country intelligence profile.",
    });
  }
  if (snapshot.company) {
    links.push({
      id: "open-company",
      label: "Open Company",
      href: buildHref(PLATFORM_MODULES.companies.path, snapshot, operating),
      description: "View company intelligence profile.",
    });
  }
  if (snapshot.university) {
    links.push({
      id: "open-university",
      label: "Open University",
      href: buildHref(PLATFORM_MODULES.universities.path, snapshot, operating),
      description: "View university intelligence profile.",
    });
  }

  links.push({
    id: "open-evidence",
    label: "Open Evidence",
    href: buildHref(PLATFORM_MODULES.evidence.path, snapshot, operating),
    description: "Review evidence architecture for current context.",
  });

  if (snapshot.searchQuery) {
    links.push({
      id: "open-search",
      label: "Continue Search",
      href: buildHref(PLATFORM_MODULES.search.path, snapshot, { preserveSearch: true, ...operating }),
      description: "Return to search with current query and entity context.",
    });
  }

  return links;
}

export function buildContextBreadcrumbs(
  snapshot: PlatformContextSnapshot,
  currentModuleLabel: string,
  operating?: { missionId?: string | null; projectId?: string | null },
): ContextBreadcrumbSegment[] {
  const crumbs: ContextBreadcrumbSegment[] = [];
  const primary = getPrimaryEntity(snapshot);

  if (primary) {
    const entityModule =
      primary.kind === "country"
        ? PLATFORM_MODULES.countries
        : primary.kind === "company"
          ? PLATFORM_MODULES.companies
          : PLATFORM_MODULES.universities;

    crumbs.push({
      label: primary.name,
      href: buildHref(entityModule.path, snapshot, operating),
    });
    crumbs.push({
      label: entityModule.label,
      href: buildHref(entityModule.path, snapshot, operating),
    });
  }

  crumbs.push({ label: currentModuleLabel });
  return crumbs;
}

export function snapshotWithEntityFocus(
  snapshot: PlatformContextSnapshot,
  entity: ContextEntityRef,
): PlatformContextSnapshot {
  return {
    ...snapshot,
    country: entity.kind === "country" ? entity : snapshot.country,
    company: entity.kind === "company" ? entity : snapshot.company,
    university: entity.kind === "university" ? entity : snapshot.university,
  };
}

export function buildContextHeaderModel(
  snapshot: PlatformContextSnapshot,
  currentModuleLabel: string,
  operating?: { missionId?: string | null; projectId?: string | null },
): PlatformContextHeaderModel {
  const primary = getPrimaryEntity(snapshot);

  return {
    primaryEntity: primary,
    primaryEntityLabel: primary?.name ?? "No entity selected",
    breadcrumbs: buildContextBreadcrumbs(snapshot, currentModuleLabel, operating),
    relatedModules: buildRelatedModules(snapshot, operating),
    quickActions: buildQuickActions(snapshot, operating),
    timelineStatus: snapshot.timelineStatus,
    timelineMessage: snapshot.timelineMessage,
    recentEntities: snapshot.recentEntities,
    pinnedEntities: snapshot.pinnedEntities,
    workspace: snapshot.workspace,
    searchQuery: snapshot.searchQuery,
  };
}

export { CONTEXT_PARAM_KEYS };
