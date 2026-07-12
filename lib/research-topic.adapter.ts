/**
 * Adapter: maps ResearchTopic catalog record → universal Entity interface (Platform Core
 * mission). Mirrors toCountryEntity/toCompanyEntity/toUniversityEntity exactly — factual fields
 * only, zeroed scores (this platform does not fabricate AI/investment/risk scores for any entity
 * type), real relationships via the shared builder.
 */

import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import type { Entity } from "@/lib/entity/entity.types";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";

const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export function toResearchTopicEntity(topic: ResearchTopic): Entity {
  const relationships = buildEntityRelationships("research_topic", topic.topicId);

  // relatedMethods/relatedEvidenceTypes become real tags so they stay searchable through the
  // universal Entity index — the same haystack filterResearchTopics already searches (topicName,
  // domain, description, relatedMethods, relatedEvidenceTypes), now carried on the Entity itself
  // rather than requiring a second, research-specific search path.
  const tags = [...topic.relatedMethods, ...topic.relatedEvidenceTypes].map((label) => ({
    id: label,
    label,
  }));

  return {
    id: topic.topicId,
    type: "research_topic",
    name: topic.topicName,
    category: topic.domain,
    overview: topic.description,
    summary: topic.description,
    status: "active",
    scores: { aiScore: 0, investmentScore: 0, riskScore: 0 },
    tags,
    timeline: [],
    aiSummary: INSUFFICIENT_EVIDENCE_LABEL,
    metadata: {
      domain: topic.domain,
      domainId: topic.domainId,
    },
    metrics: [
      {
        id: "related-companies",
        label: "Related Companies (subject-matter match)",
        value: relationships.length,
        unit: "records",
      },
    ],
    subtitle: topic.domain,
    relationships,
    reportsAvailable: true,
  };
}

export function toResearchTopicEntities(topics: readonly ResearchTopic[]): Entity[] {
  return topics.map(toResearchTopicEntity);
}

/** Real, navigable link for a research topic entity — mirrors the other adapters' href pattern. */
export function researchTopicEntityHref(topic: ResearchTopic): string {
  return getResearchTopicPath(topic.topicId);
}
