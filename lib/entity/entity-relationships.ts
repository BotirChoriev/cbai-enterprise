/**
 * Universal Entity Engine — relationship builder (Platform Core mission, upgraded in the Platform
 * Core Completion mission).
 *
 * No new relationship data is computed here. Country/Company/University relationships are read
 * straight from each module's already-real, already-computed Knowledge Graph edges
 * (`buildCountryCoverageProfile`/`buildCompanyCoverageProfile`/`buildUniversityCoverageProfile`'s
 * `graphRelationships` — the same data `CountryRelationships.tsx`/`CompanyRelationships.tsx`/
 * `UniversityRelationships.tsx` already render) rather than the narrower name lists, so a caller
 * gets the real relationship label ("Located In", "Registered In", "Belongs To") and evidence
 * status too, not just a bare name. The Knowledge Graph itself is built directly from
 * `getCountryRelationships`/`getCompanyRelationships` (see lib/graph/graph.builder.ts), so this
 * is a strict superset of the earlier name-list-only version — nothing that resolved before stops
 * resolving. Company<->Research edges (`getRelatedResearchTopics`/`getRelatedCompaniesForTopic`)
 * are layered on top, since the Knowledge Graph has no notion of research topics at all. This is
 * a normalization layer, not a new relationship engine — it lets any caller ask "what is this
 * entity connected to?" without knowing which per-module function to call first.
 */

import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { buildCountryCoverageProfile } from "@/lib/countries.coverage";
import { buildCompanyCoverageProfile } from "@/lib/companies.coverage";
import { buildUniversityCoverageProfile } from "@/lib/universities.coverage";
import { getRelatedResearchTopics, getRelatedCompaniesForTopic } from "@/lib/company-research";
import { getResearchTopicById, getResearchTopicPath } from "@/lib/research/research-topics";
import { companyHrefByName, hrefForEntity, type LinkableEntityType } from "@/components/shared/resolve-entity-link";
import type { EntityRelationship } from "@/lib/entity/entity.types";

const VERIFIED_LABEL = "Verified local catalog";

function fromGraphRelationships(
  graphRelationships: readonly { entityName: string; entityType: LinkableEntityType; relationshipLabel: string; evidenceLabel: string }[],
): EntityRelationship[] {
  return graphRelationships.map((rel) => ({
    type: rel.entityType === "country" ? "LOCATED_IN" : "RELATED_TO",
    targetType: rel.entityType,
    targetId: rel.entityName,
    targetName: rel.entityName,
    targetHref: hrefForEntity(rel.entityType, rel.entityName),
    label: rel.relationshipLabel,
    verified: rel.evidenceLabel === VERIFIED_LABEL,
  }));
}

/** Real cross-entity relationships for any supported entity kind, in the shared vocabulary. */
export function buildEntityRelationships(
  kind: "country" | "company" | "university" | "research_topic",
  id: string,
): EntityRelationship[] {
  switch (kind) {
    case "country": {
      const country = countries.find((c) => c.id === id);
      if (!country) return [];
      return fromGraphRelationships(buildCountryCoverageProfile(country).graphRelationships);
    }
    case "company": {
      const company = companies.find((c) => c.id === id);
      if (!company) return [];
      const graph = fromGraphRelationships(buildCompanyCoverageProfile(company).graphRelationships);
      const research = getRelatedResearchTopics(company).map(
        (match): EntityRelationship => ({
          type: "HAS_RESEARCH",
          targetType: "research_topic",
          targetId: match.topic.topicId,
          targetName: match.topic.topicName,
          targetHref: getResearchTopicPath(match.topic.topicId),
        }),
      );
      return [...graph, ...research];
    }
    case "university": {
      const university = universities.find((u) => u.id === id);
      if (!university) return [];
      return fromGraphRelationships(buildUniversityCoverageProfile(university).graphRelationships);
    }
    case "research_topic": {
      const topic = getResearchTopicById(id);
      if (!topic) return [];
      return getRelatedCompaniesForTopic(topic).map(
        (match): EntityRelationship => ({
          type: "RELATED_TO",
          targetType: "company",
          targetId: match.company.id,
          targetName: match.company.name,
          targetHref: companyHrefByName(match.company.name),
        }),
      );
    }
  }
}
