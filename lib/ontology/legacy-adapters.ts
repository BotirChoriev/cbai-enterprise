/**
 * Legacy adapters — backward-compatible bridges to canonical ontology.
 * Lazy hydration: existing records are never moved or deleted.
 */

import type { OperationalObject } from "@/lib/operational-objects/operational-object.types";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import type { Project } from "@/lib/project/project-types";
import type { RegistryEntityRecord } from "@/lib/registry/types";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { OPERATIONAL_OBJECT_KIND_MAP, ENTITY_KIND_MAP } from "@/lib/ontology/object-kinds";
import { draftToRecord, normalizeLocale } from "@/lib/ontology/normalization";
import type { OntologyObjectDraft, OntologyObjectRecord } from "@/lib/ontology/types";

export function operationalObjectToOntologyDraft(obj: OperationalObject): OntologyObjectDraft {
  const kind = OPERATIONAL_OBJECT_KIND_MAP[obj.type] ?? "task";
  return {
    kind,
    title: obj.title,
    description: obj.summary || obj.objective,
    status: obj.status === "ready" ? "awaiting_confirmation" : obj.status === "draft" ? "draft" : "active",
    contentLocale: normalizeLocale(obj.locale),
    createdLocale: normalizeLocale(obj.locale),
    provenance: {
      source: "legacy_adapter",
      originalText: obj.sourceCommand,
      legacyStoreKey: "cbai-operational-objects",
      legacyRecordId: obj.id,
      inferredFields: obj.provenance.inferredFields,
      userProvidedFields: ["title", "objective"],
    },
    metadata: {
      operationalObjectType: obj.type,
      domain: obj.domain,
      projectId: obj.projectId,
      missionId: obj.missionId,
    },
  };
}

export function missionToOntologyDraft(mission: Mission, locale = "en"): OntologyObjectDraft {
  return {
    kind: "mission",
    title: mission.problem.slice(0, 120) || "Mission",
    description: mission.whyExists,
    status: mission.status === "draft" ? "draft" : "active",
    contentLocale: normalizeLocale(locale),
    createdLocale: normalizeLocale(locale),
    provenance: {
      source: "legacy_adapter",
      legacyStoreKey: "cbai-missions",
      legacyRecordId: mission.id,
      userProvidedFields: ["problem", "whyExists"],
    },
    metadata: {
      projectId: mission.projectId,
      missionStatus: mission.status,
      evidenceHave: mission.evidenceHave,
      evidenceMissing: mission.evidenceMissing,
    },
  };
}

export function projectToOntologyDraft(project: Project, locale = "en"): OntologyObjectDraft {
  return {
    kind: "project",
    title: project.title,
    description: project.description,
    status: project.status === "archived" ? "archived" : "active",
    contentLocale: normalizeLocale(locale),
    createdLocale: normalizeLocale(locale),
    provenance: {
      source: "legacy_adapter",
      legacyStoreKey: "cbai-projects",
      legacyRecordId: project.id,
      userProvidedFields: ["title", "description"],
    },
    metadata: {
      projectType: project.type,
      visibility: project.visibility,
      tags: project.tags,
    },
  };
}

export function registryEntityToOntologyRecord(entity: RegistryEntityRecord): OntologyObjectRecord {
  const kind = ENTITY_KIND_MAP[entity.entityType] ?? "organization";
  return draftToRecord({
    kind,
    title: entity.displayName,
    description: `${entity.entityType} registry record`,
    status: "active",
    contentLocale: "en",
    createdLocale: "en",
    provenance: {
      source: "registry_projection",
      legacyRecordId: entity.entityId,
      userProvidedFields: [],
    },
    metadata: {
      countryCode: entity.countryCode,
      slug: entity.slug,
      indicatorIds: entity.indicatorIds,
      evidenceIds: entity.evidenceIds,
      sourceIds: entity.sourceIds,
    },
  }, entity.entityId as unknown as OntologyObjectRecord["id"]);
}

export function researchTopicToOntologyRecord(topic: ResearchTopic): OntologyObjectRecord {
  return draftToRecord({
    kind: "research_topic",
    title: topic.topicName,
    description: topic.description,
    status: "active",
    contentLocale: "en",
    createdLocale: "en",
    provenance: {
      source: "registry_projection",
      legacyRecordId: topic.topicId,
      userProvidedFields: [],
    },
    metadata: {
      domain: topic.domain,
      domainId: topic.domainId,
      topicStatus: topic.status,
    },
  }, `research_topic-${topic.topicId}` as OntologyObjectRecord["id"]);
}

/** Preserve unknown fields from legacy record when hydrating. */
export function preserveUnknownFields<T extends Record<string, unknown>>(
  ontologyRecord: OntologyObjectRecord,
  legacyRecord: T,
  knownKeys: readonly string[],
): OntologyObjectRecord {
  const known = new Set(knownKeys);
  const extras: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(legacyRecord)) {
    if (!known.has(key)) extras[key] = value;
  }
  return { ...ontologyRecord, ...extras };
}
