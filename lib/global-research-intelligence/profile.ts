/**
 * Build Research Intelligence profiles from catalog topics — honest empties.
 */

import { RESEARCH_TOPICS, type ResearchTopic } from "@/lib/research/research-topics";
import {
  GRI_SCHEMA_VERSION,
  type ResearchIntelligenceProfile,
  type ResearchLifecycleState,
} from "@/lib/global-research-intelligence/types";

const MISSING = [
  "authors_and_institutions",
  "location_and_period",
  "methodology_details",
  "datasets",
  "main_results",
  "replication_status",
  "funding",
  "conflict_of_interest",
] as const;

export function buildResearchIntelligenceProfileFromTopic(
  topic: ResearchTopic,
): ResearchIntelligenceProfile {
  return {
    schemaVersion: GRI_SCHEMA_VERSION,
    id: `gri:topic:${topic.topicId}`,
    kind: "ResearchTopicCatalog",
    officialIdentity: {
      officialName: topic.topicName,
      alternateNames: [],
      catalogTopicId: topic.topicId,
      domainId: topic.domainId,
      domainName: topic.domain,
    },
    researchQuestion: null,
    hypothesis: null,
    authorsAndInstitutions: [],
    locationAndPeriod: { location: null, period: null },
    methodology: topic.relatedMethods.length
      ? `Catalog methods (not verified protocol): ${topic.relatedMethods.join("; ")}`
      : null,
    sampleParticipants: null,
    measurementsAndUnits: [],
    equipment: [],
    datasets: [],
    mainResults: null,
    statisticalUncertainty: null,
    limitations: [
      "Catalog metadata only — live publications, researchers, and experiments are not connected.",
    ],
    contradictoryEvidence: [],
    replicationStatus: "not_connected",
    practicalOutcomes: [],
    funding: null,
    conflictOfInterest: null,
    officialSources: [],
    lastVerificationDate: null,
    missingInformation: [...MISSING],
    openQuestions: [
      "Where is verified work happening for this topic?",
      "Which methods have independent replication?",
    ],
    relatedOperationalObjectIds: [],
    humanDecisionCheckpoints: [
      "Confirm research question before creating work",
      "Confirm evidence request recipients before any communication",
      "Human decides which path to pursue",
    ],
    lifecycleState: "idea",
    stoppedReason: null,
    layers: {
      officialSource: [],
      userEntered: [],
      cbaiSynthesis: [
        `Catalog domain: ${topic.domain}. Related evidence types listed in catalog only.`,
      ],
      assumptions: [],
      unknown: [...MISSING],
      recommendations: [
        "Create scientific work (confirmation required)",
        "Find a research opportunity (verified records only)",
        "Request evidence for missing methodology or datasets",
      ],
    },
    catalog: { ...topic },
  };
}

export function listResearchIntelligenceProfiles(): readonly ResearchIntelligenceProfile[] {
  return RESEARCH_TOPICS.map(buildResearchIntelligenceProfileFromTopic);
}

export function getResearchIntelligenceProfile(
  topicId: string,
): ResearchIntelligenceProfile | null {
  const topic = RESEARCH_TOPICS.find((t) => t.topicId === topicId);
  return topic ? buildResearchIntelligenceProfileFromTopic(topic) : null;
}

export function isTerminalLifecycle(state: ResearchLifecycleState): boolean {
  return (
    state === "completed" ||
    state === "stopped" ||
    state === "cancelled" ||
    state === "inconclusive" ||
    state === "not_replicated"
  );
}

export function requiresStoppedReason(state: ResearchLifecycleState): boolean {
  return state === "stopped" || state === "cancelled" || state === "inconclusive";
}
