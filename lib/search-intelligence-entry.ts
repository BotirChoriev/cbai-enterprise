/**
 * Search result card metadata (platform layer).
 * Factual labels only — no scores, confidence, or AI summaries.
 */

import type { Entity } from "@/lib/entity/entity.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import { getEntityDetailHref, getEntityHref } from "@/lib/global-search";
import type { EvidenceDisplayStatus } from "@/lib/search-gateway";
import { EVIDENCE_NOT_CONNECTED_LABEL } from "@/lib/platform-home";

export type SearchResultEntry = {
  name: string;
  type: string;
  evidenceStatus: EvidenceDisplayStatus;
  availableInformation: string;
  route: string;
  href: string;
  linked: boolean;
};

export function buildEntityResultEntry(entity: Entity): SearchResultEntry {
  const typeLabel = getEntityTypeLabel(entity.type);
  const href = getEntityDetailHref(entity);
  const moduleRoute = getEntityHref(entity);

  if (entity.type === "country" || entity.type === "company") {
    return {
      name: entity.name,
      type: typeLabel,
      evidenceStatus: "Registry available",
      availableInformation:
        entity.type === "country"
          ? "Reference profile, regional metadata, linked local catalog records."
          : `Catalog profile: ${entity.category}, headquarters, founding year.`,
      route: href,
      href,
      linked: true,
    };
  }

  if (entity.type === "university") {
    const hasRegistry = entity.metrics.length > 0;

    return {
      name: entity.name,
      type: typeLabel,
      evidenceStatus: hasRegistry ? "Registry available" : "Evidence unavailable",
      availableInformation: hasRegistry
        ? "University catalog profile and registry metadata."
        : "No local registry profile available.",
      route: hasRegistry ? href : moduleRoute,
      href: hasRegistry ? href : moduleRoute,
      linked: hasRegistry,
    };
  }

  return {
    name: entity.name,
    type: typeLabel,
    evidenceStatus: "Evidence unavailable",
    availableInformation: "Entity type not registered in search index.",
    route: "/search",
    href: "/search",
    linked: false,
  };
}

export function buildTopicResultEntry(topic: {
  label: string;
  platformArea: string;
  connected: boolean;
  evidenceStatus: EvidenceDisplayStatus;
  availableInformation: string;
  route: string;
  href?: string;
}): SearchResultEntry {
  return {
    name: topic.label,
    type: topic.platformArea,
    evidenceStatus: topic.evidenceStatus,
    availableInformation: topic.availableInformation,
    route: topic.connected ? (topic.href ?? topic.route) : topic.route,
    href: topic.href ?? "/search",
    linked: topic.connected,
  };
}

export function isUnavailableRoute(route: string): boolean {
  return (
    route === EVIDENCE_NOT_CONNECTED_LABEL ||
    route.toLowerCase().includes("not connected")
  );
}
