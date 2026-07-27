import type { MyWorldConsentProfile, WimEntityNode } from "@/lib/world-and-me-intelligence/types";

export function emptyMyWorldConsent(locale: string): MyWorldConsentProfile {
  return {
    role: null,
    field: null,
    goals: [],
    watchedEntityIds: [],
    consentGiven: false,
    contentLocale: locale,
  };
}

export function filterMyWorldNodes(
  nodes: readonly WimEntityNode[],
  profile: MyWorldConsentProfile,
): readonly WimEntityNode[] {
  if (!profile.consentGiven) return nodes.filter((n) => n.kind === "user");
  const watched = new Set(profile.watchedEntityIds);
  return nodes.filter(
    (n) => n.kind === "user" || watched.has(n.id) || n.kind === "country" || n.kind === "university" || n.kind === "company",
  );
}

export function myWorldRequiresConsent(profile: MyWorldConsentProfile): boolean {
  return !profile.consentGiven;
}
