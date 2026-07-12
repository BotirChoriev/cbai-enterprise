/**
 * Universal Entity Engine — relationship builder (Platform Core mission).
 *
 * No new relationship data is computed here. Every relationship this file exposes is read
 * straight from the already-real, already-tested per-module adapters
 * (getCountryRelationships/getCompanyRelationships/getUniversityRelationships,
 * getRelatedResearchTopics/getRelatedCompaniesForTopic) and mapped onto one shared vocabulary
 * (EntityRelationshipType). This is a normalization layer, not a new relationship engine — it
 * lets any caller ask "what is this entity connected to?" without knowing which per-module
 * function to call first.
 */

import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { getCompanyRelationships } from "@/lib/companies.adapter";
import { getUniversityRelationships } from "@/lib/universities.adapter";
import { getRelatedResearchTopics, getRelatedCompaniesForTopic } from "@/lib/company-research";
import { getResearchTopicById, getResearchTopicPath } from "@/lib/research/research-topics";
import { countryHrefByName, companyHrefByName, universityHrefByName } from "@/components/shared/resolve-entity-link";
import type { EntityRelationship, EntityType } from "@/lib/entity/entity.types";

function relatedFrom(
  type: EntityRelationship["type"],
  targetType: EntityType,
  names: readonly string[],
  hrefFn: (name: string) => string | null,
): EntityRelationship[] {
  return names.map((name) => ({
    type,
    targetType,
    targetId: name,
    targetName: name,
    targetHref: hrefFn(name),
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
      const rel = getCountryRelationships(country);
      return [
        ...relatedFrom("RELATED_TO", "company", rel.relatedCompanies, companyHrefByName),
        ...relatedFrom("RELATED_TO", "university", rel.universities, universityHrefByName),
      ];
    }
    case "company": {
      const company = companies.find((c) => c.id === id);
      if (!company) return [];
      const rel = getCompanyRelationships(company);
      const located: EntityRelationship[] = rel.headquartersCountry
        ? [
            {
              type: "LOCATED_IN",
              targetType: "country",
              targetId: rel.headquartersCountry,
              targetName: rel.headquartersCountry,
              targetHref: countryHrefByName(rel.headquartersCountry),
            },
          ]
        : [];
      const research = getRelatedResearchTopics(company).map(
        (match): EntityRelationship => ({
          type: "HAS_RESEARCH",
          targetType: "research_topic",
          targetId: match.topic.topicId,
          targetName: match.topic.topicName,
          targetHref: getResearchTopicPath(match.topic.topicId),
        }),
      );
      return [
        ...located,
        ...relatedFrom("RELATED_TO", "university", rel.universities, universityHrefByName),
        ...research,
      ];
    }
    case "university": {
      const university = universities.find((u) => u.id === id);
      if (!university) return [];
      const rel = getUniversityRelationships(university);
      const located: EntityRelationship[] = rel.country
        ? [
            {
              type: "LOCATED_IN",
              targetType: "country",
              targetId: rel.country,
              targetName: rel.country,
              targetHref: countryHrefByName(rel.country),
            },
          ]
        : [];
      return [...located, ...relatedFrom("RELATED_TO", "company", rel.companies, companyHrefByName)];
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
