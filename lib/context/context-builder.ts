import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import type {
  ContextEntityRef,
  EntityKind,
  PlatformContextParams,
  PlatformContextSnapshot,
  WorkspaceId,
} from "@/lib/context/context-types";
import {
  ENTITY_TIMELINE_UNAVAILABLE_MESSAGE,
  PLATFORM_CONTEXT_VERSION,
} from "@/lib/context/context-types";
import { loadRecentEntities, loadPinnedEntities } from "@/lib/context/context-history";

const WORKSPACE_IDS: readonly WorkspaceId[] = ["government", "investor", "citizen"];

function isWorkspaceId(value: string | null | undefined): value is WorkspaceId {
  return WORKSPACE_IDS.includes(value as WorkspaceId);
}

function resolveCountryRef(id: string): ContextEntityRef | null {
  const country = countries.find((c) => c.id === id);
  if (!country) return null;
  return {
    kind: "country",
    id: country.id,
    name: country.name,
    code: country.code,
  };
}

function resolveCompanyRef(id: string): ContextEntityRef | null {
  const company = companies.find((c) => c.id === id);
  if (!company) return null;
  return {
    kind: "company",
    id: company.id,
    name: company.name,
    code: company.icon,
    countryName: company.country,
  };
}

function resolveUniversityRef(id: string): ContextEntityRef | null {
  const university = universities.find((u) => u.id === id);
  if (!university) return null;
  return {
    kind: "university",
    id: university.id,
    name: university.name,
    code: university.icon,
    countryName: university.country,
  };
}

export function resolveEntityRef(
  kind: EntityKind,
  id: string,
): ContextEntityRef | null {
  switch (kind) {
    case "country":
      return resolveCountryRef(id);
    case "company":
      return resolveCompanyRef(id);
    case "university":
      return resolveUniversityRef(id);
    case "research_topic":
    case "project":
    case "evidence":
      // Research topics, Projects, and Evidence are never resolved through the URL-param focus
      // system — see EntityKind.
      return null;
  }
}

export function parseContextParams(
  searchParams: URLSearchParams | PlatformContextParams,
): PlatformContextParams {
  if (searchParams instanceof URLSearchParams) {
    return {
      country: searchParams.get("country"),
      company: searchParams.get("company"),
      university: searchParams.get("university"),
      workspace: searchParams.get("workspace"),
      q: searchParams.get("q"),
    };
  }
  return searchParams;
}

/** Build a platform context snapshot from URL params and route path. */
export function buildPlatformContext(
  params: PlatformContextParams,
  activeModulePath: string,
): PlatformContextSnapshot {
  const country = params.country ? resolveCountryRef(params.country) : null;
  const company = params.company ? resolveCompanyRef(params.company) : null;
  const university = params.university ? resolveUniversityRef(params.university) : null;
  const workspace: WorkspaceId | null = isWorkspaceId(params.workspace ?? undefined)
    ? (params.workspace as WorkspaceId)
    : null;

  return {
    version: PLATFORM_CONTEXT_VERSION,
    country,
    company,
    university,
    workspace,
    searchQuery: params.q?.trim() ?? "",
    activeModulePath,
    recentEntities: loadRecentEntities(),
    pinnedEntities: loadPinnedEntities(),
    timelineStatus: "unavailable",
    timelineMessage: ENTITY_TIMELINE_UNAVAILABLE_MESSAGE,
  };
}

/** The real kinds `snapshot.country`/`company`/`university` are ever populated with —
 * resolveCountryRef/resolveCompanyRef/resolveUniversityRef above are the only place those three
 * PlatformContextSnapshot fields are ever set, and each always sets its own literal `kind`. */
export type PrimaryEntityRef = ContextEntityRef & { kind: "country" | "company" | "university" };

export function getPrimaryEntity(
  snapshot: PlatformContextSnapshot,
): PrimaryEntityRef | null {
  return (snapshot.country ?? snapshot.company ?? snapshot.university) as PrimaryEntityRef | null;
}

export function serializeContextToParams(
  snapshot: Pick<
    PlatformContextSnapshot,
    "country" | "company" | "university" | "workspace" | "searchQuery"
  >,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (snapshot.country) {
    params.country = snapshot.country.id;
  }
  if (snapshot.company) {
    params.company = snapshot.company.id;
  }
  if (snapshot.university) {
    params.university = snapshot.university.id;
  }
  if (snapshot.workspace) {
    params.workspace = snapshot.workspace;
  }
  if (snapshot.searchQuery.trim()) {
    params.q = snapshot.searchQuery.trim();
  }

  return params;
}
