/**
 * Search result card metadata (platform layer).
 * Factual labels only — no scores, confidence, or AI summaries.
 */

import type { Entity } from "@/lib/entity/entity.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import { buildPlatformEntityHref } from "@/lib/global-search";
import type { EvidenceDisplayStatus } from "@/lib/search-gateway";
import { EVIDENCE_NOT_CONNECTED_LABEL } from "@/lib/platform-home";

const PLAIN_NEXT_STEP = "Open to see available official information.";

export type SearchResultEntry = {
  name: string;
  type: string;
  countryLabel: string | null;
  distinguishingFact: string | null;
  evidenceStatus: EvidenceDisplayStatus;
  shortDescription: string;
  nextStep: string;
  route: string;
  href: string;
  linked: boolean;
  showCompare: boolean;
  showReports: boolean;
};

function resolveCountryLabel(entity: Entity): string | null {
  if (entity.type === "country") {
    const region = entity.metadata.region;
    return typeof region === "string" && region.length > 0 ? region : entity.category;
  }

  const country = entity.metadata.country;
  if (typeof country === "string" && country.length > 0) {
    return country;
  }

  return null;
}

function resolveDistinguishingFact(entity: Entity): string | null {
  if (entity.type === "country") {
    const region = entity.metadata.region;
    return typeof region === "string" && region.length > 0 ? region : null;
  }

  if (entity.type === "company") {
    const industry = entity.metadata.industry;
    return typeof industry === "string" && industry.length > 0 ? industry : null;
  }

  if (entity.type === "university") {
    const city = entity.metadata.city;
    if (typeof city === "string" && city.length > 0) {
      return city;
    }
    const country = entity.metadata.country;
    return typeof country === "string" && country.length > 0 ? country : null;
  }

  return null;
}

export function buildEntityResultEntry(
  entity: Entity,
  searchQuery?: string,
): SearchResultEntry {
  const typeLabel = getEntityTypeLabel(entity.type);
  const href = buildPlatformEntityHref(entity, { searchQuery });
  const countryLabel = resolveCountryLabel(entity);
  const distinguishingFact = resolveDistinguishingFact(entity);

  if (entity.type === "country") {
    return {
      name: entity.name,
      type: typeLabel,
      countryLabel,
      distinguishingFact,
      evidenceStatus: "Available now",
      shortDescription: "Official country profile with evidence and reports.",
      nextStep: PLAIN_NEXT_STEP,
      route: href,
      href,
      linked: true,
      showCompare: true,
      showReports: true,
    };
  }

  if (entity.type === "company") {
    return {
      name: entity.name,
      type: typeLabel,
      countryLabel,
      distinguishingFact,
      evidenceStatus: "Available now",
      shortDescription: "Company profile with evidence and reports.",
      nextStep: PLAIN_NEXT_STEP,
      route: href,
      href,
      linked: true,
      showCompare: true,
      showReports: true,
    };
  }

  if (entity.type === "university") {
    return {
      name: entity.name,
      type: typeLabel,
      countryLabel,
      distinguishingFact,
      evidenceStatus: "Available now",
      shortDescription: "University profile with evidence and reports.",
      nextStep: PLAIN_NEXT_STEP,
      route: href,
      href,
      linked: true,
      showCompare: true,
      showReports: true,
    };
  }

  if (entity.type === "research_topic") {
    return {
      name: entity.name,
      type: typeLabel,
      countryLabel,
      distinguishingFact,
      evidenceStatus: "Available now",
      shortDescription: "Research topic profile with evidence and related organizations.",
      nextStep: PLAIN_NEXT_STEP,
      route: href,
      href,
      linked: true,
      showCompare: false,
      showReports: true,
    };
  }

  return {
    name: entity.name,
    type: typeLabel,
    countryLabel: null,
    distinguishingFact: null,
    evidenceStatus: "Evidence unavailable",
    shortDescription: "Not available in search.",
    nextStep: "Try another name.",
    route: "/search",
    href: "/search",
    linked: false,
    showCompare: false,
    showReports: false,
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
    countryLabel: null,
    distinguishingFact: null,
    evidenceStatus: topic.evidenceStatus,
    shortDescription: topic.availableInformation,
    nextStep: "Open to continue.",
    route: topic.connected ? (topic.href ?? topic.route) : topic.route,
    href: topic.href ?? "/search",
    linked: topic.connected,
    showCompare: false,
    showReports: false,
  };
}

export function isUnavailableRoute(route: string): boolean {
  return (
    route === EVIDENCE_NOT_CONNECTED_LABEL ||
    route.toLowerCase().includes("not connected")
  );
}
