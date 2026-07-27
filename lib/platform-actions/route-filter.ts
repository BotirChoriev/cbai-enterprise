/**
 * Apply allowlisted route filter query params — used by UI + Voice.
 */

export type RouteFilterPatch = {
  readonly href: string;
  readonly announcedFilter: string;
  readonly resultHint: string | null;
};

const ALLOWED_KEYS = new Set([
  "q",
  "region",
  "status",
  "industry",
  "country",
  "company",
  "university",
  "type",
  "domain",
  "opFilter",
  "filter",
  "object",
  "topic",
  "evidence",
]);

export function applyRouteFilterParams(
  pathname: string,
  currentSearch: string,
  patch: Record<string, string | null | undefined>,
): RouteFilterPatch {
  const path = pathname.split("?")[0] || "/";
  const params = new URLSearchParams(currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch);
  const announced: string[] = [];

  for (const [key, value] of Object.entries(patch)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (value == null || value === "" || value === "all") {
      params.delete(key);
      announced.push(`${key}=cleared`);
    } else {
      params.set(key, value);
      announced.push(`${key}=${value}`);
    }
  }

  const query = params.toString();
  const href = query ? `${path}?${query}` : path;
  return {
    href,
    announcedFilter: announced.join(", ") || "no filter change",
    resultHint: null,
  };
}

export function myWorkObjectHref(objectId: string, preserveSearch = ""): string {
  const params = new URLSearchParams(
    preserveSearch.startsWith("?") ? preserveSearch.slice(1) : preserveSearch,
  );
  params.set("object", objectId);
  return `/my-work?${params.toString()}`;
}
