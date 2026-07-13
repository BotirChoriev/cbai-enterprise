/**
 * Search result card metadata (platform layer).
 * Factual labels only — no scores, confidence, or AI summaries.
 */

import type { Entity } from "@/lib/entity/entity.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";
import { buildPlatformEntityHref } from "@/lib/global-search";
import type { EvidenceDisplayStatus } from "@/lib/search-gateway";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { EVIDENCE_NOT_CONNECTED_LABEL } from "@/lib/platform-home";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { buildCountryCoverageProfile } from "@/lib/countries.coverage";
import { buildCompanyCoverageProfile } from "@/lib/companies.coverage";
import { buildUniversityCoverageProfile } from "@/lib/universities.coverage";
import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";

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
  /** Real "Create Project from this entity" link — null when this result isn't a linkable entity. */
  createProjectHref: string | null;
  /** Real "X of Y sources connected" (or evidence-connected) count — so how much information
   * exists is visible before opening the profile. Null only for kinds with no coverage model. */
  coverageLabel: string | null;
  /** Real entity reference for the same "Save to workspace" action every entity profile page
   * already exposes — null when this result isn't a saveable/pinnable entity kind. */
  entityRef: ContextEntityRef | null;
};

/** Real, already-computed coverage counts — never a fabricated summary. */
function resolveCoverageLabel(entity: Entity): string | null {
  if (entity.type === "country") {
    const country = countries.find((c) => c.id === entity.id);
    if (!country) return null;
    const { connected, total } = buildCountryCoverageProfile(country).evidenceCoverage;
    return `${connected} of ${total} sources connected`;
  }

  if (entity.type === "company") {
    const company = companies.find((c) => c.id === entity.id);
    if (!company) return null;
    const { connected, total } = buildCompanyCoverageProfile(company).evidenceCoverage;
    return `${connected} of ${total} sources connected`;
  }

  if (entity.type === "university") {
    const university = universities.find((u) => u.id === entity.id);
    if (!university) return null;
    const { connected, total } = buildUniversityCoverageProfile(university).evidenceCoverage;
    return `${connected} of ${total} sources connected`;
  }

  if (entity.type === "research_topic") {
    const intelligence = deriveEvidenceGapIntelligence(entity.id);
    if (!intelligence) return null;
    const connected = intelligence.connectedEvidence.length;
    const total = connected + intelligence.disconnectedEvidence.length;
    return `${connected} of ${total} evidence items connected`;
  }

  return null;
}

function createProjectHref(entity: Entity): string {
  const params = new URLSearchParams({ entityKind: entity.type, entityId: entity.id, entityName: entity.name });
  return `/my-work?${params.toString()}`;
}

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
  const coverageLabel = resolveCoverageLabel(entity);

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
      createProjectHref: createProjectHref(entity),
      coverageLabel,
      entityRef: { kind: "country", id: entity.id, name: entity.name },
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
      createProjectHref: createProjectHref(entity),
      coverageLabel,
      entityRef: { kind: "company", id: entity.id, name: entity.name },
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
      createProjectHref: createProjectHref(entity),
      coverageLabel,
      entityRef: { kind: "university", id: entity.id, name: entity.name },
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
      createProjectHref: createProjectHref(entity),
      coverageLabel,
      entityRef: { kind: "research_topic", id: entity.id, name: entity.name },
    };
  }

  if (entity.type === "project") {
    return {
      name: entity.name,
      type: typeLabel,
      countryLabel: null,
      distinguishingFact,
      evidenceStatus: "Available now",
      shortDescription: "Project workspace with notes, evidence, and linked entities.",
      nextStep: "Open to continue this project.",
      route: href,
      href,
      linked: true,
      showCompare: false,
      showReports: true,
      createProjectHref: null,
      coverageLabel: null,
      entityRef: { kind: "project", id: entity.id, name: entity.name },
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
    createProjectHref: null,
    coverageLabel: null,
    entityRef: null,
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
    createProjectHref: null,
    coverageLabel: null,
    entityRef: null,
  };
}

export function isUnavailableRoute(route: string): boolean {
  return (
    route === EVIDENCE_NOT_CONNECTED_LABEL ||
    route.toLowerCase().includes("not connected")
  );
}
