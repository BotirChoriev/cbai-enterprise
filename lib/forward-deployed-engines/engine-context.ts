/**
 * Engine context builder — assembles ontology + route context for engines.
 */

import type { EngineContext } from "@/lib/forward-deployed-engines/engine-types";
import type { OntologyLocale } from "@/lib/ontology/types";

export type EngineContextInput = {
  pathname: string;
  locale: OntologyLocale;
  entityId?: string;
  entityKind?: string;
  entityName?: string;
  projectId?: string;
  missionId?: string;
  countryCode?: string;
  topicId?: string;
};

export function buildEngineContext(input: EngineContextInput): EngineContext {
  return {
    pathname: input.pathname,
    locale: input.locale,
    entityId: input.entityId,
    entityKind: input.entityKind,
    entityName: input.entityName,
    projectId: input.projectId ?? undefined,
    missionId: input.missionId ?? undefined,
    countryCode: input.countryCode,
    topicId: input.topicId,
  };
}

export function inferEngineFromPathname(pathname: string): Partial<EngineContextInput> {
  if (pathname.startsWith("/research")) return { entityKind: "research_topic" };
  if (pathname.startsWith("/knowledge")) return { entityKind: "evidence" };
  if (pathname.startsWith("/countries")) return { entityKind: "country" };
  if (pathname.startsWith("/companies")) return { entityKind: "company" };
  if (pathname.startsWith("/universities")) return { entityKind: "university" };
  if (pathname.startsWith("/governance")) return { entityKind: "policy" };
  if (pathname.startsWith("/government")) return { entityKind: "organization" };
  if (pathname.startsWith("/reports")) return { entityKind: "report" };
  if (pathname.startsWith("/my-work")) return { entityKind: "project" };
  if (pathname.startsWith("/graph")) return { entityKind: "evidence" };
  return {};
}

export function resolveEngineContextFromRoute(
  pathname: string,
  locale: OntologyLocale,
  overrides: Partial<EngineContextInput> = {},
): EngineContext {
  const inferred = inferEngineFromPathname(pathname);
  return buildEngineContext({
    pathname,
    locale,
    ...inferred,
    ...overrides,
  });
}
