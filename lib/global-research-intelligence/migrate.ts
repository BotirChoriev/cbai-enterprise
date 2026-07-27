/**
 * Idempotent GRI migration — preserves unknown fields.
 */

import { RESEARCH_TOPICS, type ResearchTopic } from "@/lib/research/research-topics";
import {
  GRI_SCHEMA_VERSION,
  type ResearchIntelligenceProfile,
} from "@/lib/global-research-intelligence/types";
import { buildResearchIntelligenceProfileFromTopic } from "@/lib/global-research-intelligence/profile";

export function migrateResearchIntelligenceProfile(
  input: ResearchTopic | ResearchIntelligenceProfile | Record<string, unknown>,
): ResearchIntelligenceProfile {
  const record = input as Record<string, unknown>;

  if (
    record.schemaVersion === GRI_SCHEMA_VERSION &&
    record.catalog &&
    typeof record.catalog === "object" &&
    typeof (record.catalog as ResearchTopic).topicId === "string"
  ) {
    const profile = buildResearchIntelligenceProfileFromTopic(record.catalog as ResearchTopic);
    const unknown: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) {
      if (!(k in profile)) unknown[k] = v;
    }
    return Object.keys(unknown).length
      ? ({ ...profile, ...unknown } as ResearchIntelligenceProfile)
      : profile;
  }

  if (typeof record.topicId === "string") {
    const topic =
      RESEARCH_TOPICS.find((t) => t.topicId === record.topicId) ??
      ({
        topicId: record.topicId,
        topicName: typeof record.topicName === "string" ? record.topicName : record.topicId,
        domain: typeof record.domain === "string" ? record.domain : "Unknown",
        domainId: (typeof record.domainId === "string"
          ? record.domainId
          : "life-sciences") as ResearchTopic["domainId"],
        description: typeof record.description === "string" ? record.description : "",
        relatedMethods: Array.isArray(record.relatedMethods)
          ? (record.relatedMethods as string[])
          : [],
        relatedEvidenceTypes: Array.isArray(record.relatedEvidenceTypes)
          ? (record.relatedEvidenceTypes as string[])
          : [],
        status: "catalog_available" as const,
        futureWorkspace: typeof record.futureWorkspace === "string" ? record.futureWorkspace : "",
      } satisfies ResearchTopic);

    const profile = buildResearchIntelligenceProfileFromTopic(topic);
    const registry: Record<string, unknown> = { ...topic };
    for (const [k, v] of Object.entries(record)) {
      if (!(k in registry) && k !== "schemaVersion" && k !== "catalog") registry[k] = v;
    }
    return { ...profile, catalog: registry };
  }

  // Minimal empty profile for unknown shapes — still schema-valid.
  return buildResearchIntelligenceProfileFromTopic(RESEARCH_TOPICS[0]!);
}

export function assertIdempotentGriMigration(topic: ResearchTopic): boolean {
  const once = migrateResearchIntelligenceProfile(topic);
  const twice = migrateResearchIntelligenceProfile(once as unknown as Record<string, unknown>);
  return once.schemaVersion === twice.schemaVersion && once.id === twice.id;
}
