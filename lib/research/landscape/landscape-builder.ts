import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  RESEARCH_TOPIC_FUTURE_SUPPORTS,
  getResearchTopicById,
  getResearchTopicPath,
} from "@/lib/research/research-topics";
import { getCrossTopicDiscoveriesForTopic } from "@/lib/research/discovery/discovery-query";
import { getWorkspaceResearchGaps } from "@/lib/research/gaps/research-gap-query";
import { RESEARCH_GAP_TYPE_LABELS } from "@/lib/research/gaps/research-gap-types";
import type { ResearchGapStatus } from "@/lib/research/gaps/research-gap-types";
import { getKnowledgeTimelineForTopicObject } from "@/lib/research/timeline/timeline-query";
import { WORKSPACE_PATH } from "@/lib/research/workspace/workspace-types";
import type {
  LandscapeCenterTopic,
  LandscapeObject,
  LandscapeObjectStatus,
  ResearchLandscape,
} from "@/lib/research/landscape/landscape-types";
import {
  LANDSCAPE_FUTURE_OBJECT_LIMIT,
  LANDSCAPE_KNOWLEDGE_GAP_LIMIT,
  LANDSCAPE_MODEL_VERSION,
  LANDSCAPE_RELATED_TOPIC_LIMIT,
} from "@/lib/research/landscape/landscape-types";

function landscapeIdFor(topicId: string): string {
  return `landscape:${topicId}`;
}

function mapGapStatusToLandscape(status: ResearchGapStatus): LandscapeObjectStatus {
  switch (status) {
    case "available_catalog_only":
      return "catalog_available";
    case "future_workspace":
      return "future_workspace";
    case "not_connected_yet":
      return "not_connected_yet";
  }
}

function mapTopicStatus(topic: ResearchTopic): LandscapeObjectStatus {
  switch (topic.status) {
    case "catalog_available":
      return "catalog_available";
    case "workspace_not_available":
      return "future_workspace";
    case "evidence_not_connected":
      return "not_connected_yet";
  }
}

function buildCenterTopic(topic: ResearchTopic): LandscapeCenterTopic {
  return {
    topicId: topic.topicId,
    topicName: topic.topicName,
    domain: topic.domain,
    description: topic.description,
    status: mapTopicStatus(topic),
  };
}

function buildDomainObjects(topic: ResearchTopic): readonly LandscapeObject[] {
  return [
    {
      objectId: `landscape-domain:${topic.topicId}`,
      label: topic.domain,
      ring: "first",
      status: "catalog_available",
      description: "Domain classification from catalog metadata.",
    },
  ];
}

function buildMethodObjects(topic: ResearchTopic): readonly LandscapeObject[] {
  return topic.relatedMethods.map((method) => ({
    objectId: `landscape-method:${topic.topicId}:${method}`,
    label: method,
    ring: "first" as const,
    status: "catalog_available" as const,
    description: "Method listed in topic catalog — live records not connected.",
  }));
}

function buildEvidenceTypeObjects(topic: ResearchTopic): readonly LandscapeObject[] {
  return topic.relatedEvidenceTypes.map((evidenceType) => ({
    objectId: `landscape-evidence:${topic.topicId}:${evidenceType}`,
    label: evidenceType,
    ring: "first" as const,
    status: "catalog_available" as const,
    description: "Evidence type from catalog — live evidence not connected yet.",
  }));
}

function buildRelatedTopicObjects(topic: ResearchTopic): readonly LandscapeObject[] {
  return getCrossTopicDiscoveriesForTopic(topic, LANDSCAPE_RELATED_TOPIC_LIMIT).flatMap(
    (discovery) => {
      const related = getResearchTopicById(discovery.relatedTopicId);
      if (!related) {
        return [];
      }

      return [
        {
          objectId: `landscape-related:${discovery.discoveryId}`,
          label: related.topicName,
          ring: "second" as const,
          status: "catalog_available" as const,
          description: `Related topic — ${discovery.relationshipReasons.join(", ").replaceAll("_", " ")}.`,
          href: getResearchTopicPath(related.topicId),
          topicId: related.topicId,
        },
      ];
    },
  );
}

function buildKnowledgeGapObjects(topic: ResearchTopic): readonly LandscapeObject[] {
  return getWorkspaceResearchGaps(topic)
    .slice(0, LANDSCAPE_KNOWLEDGE_GAP_LIMIT)
    .map((gap) => ({
      objectId: `landscape-gap:${gap.gapId}`,
      label: RESEARCH_GAP_TYPE_LABELS[gap.gapType],
      ring: "second" as const,
      status: mapGapStatusToLandscape(gap.currentStatus),
      description: gap.missingReason,
    }));
}

function buildFutureObjectEntries(topic: ResearchTopic): readonly LandscapeObject[] {
  return RESEARCH_TOPIC_FUTURE_SUPPORTS.slice(0, LANDSCAPE_FUTURE_OBJECT_LIMIT).map(
    (futureObject) => ({
      objectId: `landscape-future:${topic.topicId}:${futureObject}`,
      label: futureObject,
      ring: "third" as const,
      status: "future_workspace" as const,
      description: "Future research object — not active today.",
    }),
  );
}

function buildModuleObjects(topic: ResearchTopic): readonly LandscapeObject[] {
  const timeline = getKnowledgeTimelineForTopicObject(topic);

  return [
    {
      objectId: `landscape-module:notebook:${topic.topicId}`,
      label: "Notebook",
      ring: "third",
      status: "catalog_available",
      description: "Catalog notebook available for this topic.",
      href: getResearchTopicPath(topic.topicId),
    },
    {
      objectId: `landscape-module:timeline:${topic.topicId}`,
      label: "Timeline",
      ring: "third",
      status:
        timeline.status === "future_workspace"
          ? "future_workspace"
          : timeline.status === "catalog_available"
            ? "catalog_available"
            : "not_connected_yet",
      description: "Knowledge evolution timeline from catalog stages.",
      href: getResearchTopicPath(topic.topicId),
    },
    {
      objectId: `landscape-module:workspace:${topic.topicId}`,
      label: "Workspace",
      ring: "third",
      status: "future_workspace",
      description: "Research workspace shell — live collaboration not connected.",
      href: WORKSPACE_PATH,
    },
  ];
}

/** Build an integrated research landscape for a topic. */
export function buildResearchLandscapeForTopic(topic: ResearchTopic): ResearchLandscape {
  return {
    landscapeId: landscapeIdFor(topic.topicId),
    topicId: topic.topicId,
    centerTopic: buildCenterTopic(topic),
    domains: buildDomainObjects(topic),
    methods: buildMethodObjects(topic),
    evidenceTypes: buildEvidenceTypeObjects(topic),
    futureObjects: buildFutureObjectEntries(topic),
    relatedTopics: buildRelatedTopicObjects(topic),
    knowledgeGaps: buildKnowledgeGapObjects(topic),
    modules: buildModuleObjects(topic),
    humanReviewRequired: true,
    status: mapTopicStatus(topic),
    version: LANDSCAPE_MODEL_VERSION,
  };
}

/** First ring objects: domains, methods, evidence types. */
export function getLandscapeFirstRing(landscape: ResearchLandscape): readonly LandscapeObject[] {
  return [...landscape.domains, ...landscape.methods, ...landscape.evidenceTypes];
}

/** Second ring objects: related topics and knowledge gaps. */
export function getLandscapeSecondRing(landscape: ResearchLandscape): readonly LandscapeObject[] {
  return [...landscape.relatedTopics, ...landscape.knowledgeGaps];
}

/** Third ring objects: future objects and platform modules. */
export function getLandscapeThirdRing(landscape: ResearchLandscape): readonly LandscapeObject[] {
  return [...landscape.futureObjects, ...landscape.modules];
}
