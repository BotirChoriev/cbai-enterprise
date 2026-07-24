/**
 * Forward-deployed engine registry — 7 initial engines.
 */

import type { ForwardDeployedEngineId } from "@/lib/forward-deployed-engines/engine-types";

export type EngineDefinition = {
  readonly id: ForwardDeployedEngineId;
  readonly version: string;
  readonly labelKey: string;
  readonly descriptionKey: string;
  readonly requiredInputs: readonly string[];
  readonly optionalInputs: readonly string[];
  readonly allowlistedActions: readonly string[];
  readonly readOnlyDefault: boolean;
};

export const ENGINE_REGISTRY: Readonly<Record<ForwardDeployedEngineId, EngineDefinition>> = {
  research: {
    id: "research",
    version: "1.0.0",
    labelKey: "forwardDeployed.engines.research",
    descriptionKey: "forwardDeployed.engines.researchDesc",
    requiredInputs: ["researchQuestionOrTopic"],
    optionalInputs: ["domain", "countryCode", "projectId"],
    allowlistedActions: ["engine.research.confirm", "operational_object.compose", "research.open_topic"],
    readOnlyDefault: false,
  },
  evidence: {
    id: "evidence",
    version: "1.0.0",
    labelKey: "forwardDeployed.engines.evidence",
    descriptionKey: "forwardDeployed.engines.evidenceDesc",
    requiredInputs: ["claimOrQuestion"],
    optionalInputs: ["entityId", "projectId"],
    allowlistedActions: ["engine.evidence.confirm", "navigate.evidence", "evidence_request.compose"],
    readOnlyDefault: true,
  },
  country_intelligence: {
    id: "country_intelligence",
    version: "1.0.0",
    labelKey: "forwardDeployed.engines.country",
    descriptionKey: "forwardDeployed.engines.countryDesc",
    requiredInputs: ["countryCode", "objective"],
    optionalInputs: ["comparisonCountries"],
    allowlistedActions: ["engine.country.confirm", "navigate.countries", "entity.open_country"],
    readOnlyDefault: true,
  },
  organization_intelligence: {
    id: "organization_intelligence",
    version: "1.0.0",
    labelKey: "forwardDeployed.engines.organization",
    descriptionKey: "forwardDeployed.engines.organizationDesc",
    requiredInputs: ["organizationId"],
    optionalInputs: ["objective"],
    allowlistedActions: ["engine.organization.confirm", "navigate.companies", "navigate.universities"],
    readOnlyDefault: true,
  },
  mission: {
    id: "mission",
    version: "1.0.0",
    labelKey: "forwardDeployed.engines.mission",
    descriptionKey: "forwardDeployed.engines.missionDesc",
    requiredInputs: ["userGoal"],
    optionalInputs: ["projectId"],
    allowlistedActions: ["engine.mission.confirm", "mission.compose", "navigate.my_work"],
    readOnlyDefault: false,
  },
  governance_review: {
    id: "governance_review",
    version: "1.0.0",
    labelKey: "forwardDeployed.engines.governance",
    descriptionKey: "forwardDeployed.engines.governanceDesc",
    requiredInputs: ["subjectType", "subjectSummary"],
    optionalInputs: ["reportId", "decisionId"],
    allowlistedActions: ["engine.governance.confirm", "navigate.governance", "report.compose"],
    readOnlyDefault: false,
  },
  multilingual_meeting: {
    id: "multilingual_meeting",
    version: "0.1.0-foundation",
    labelKey: "forwardDeployed.engines.meeting",
    descriptionKey: "forwardDeployed.engines.meetingDesc",
    requiredInputs: ["meetingLanguages"],
    optionalInputs: ["participants", "terminologyContext"],
    allowlistedActions: ["engine.meeting.confirm"],
    readOnlyDefault: false,
  },
};

export function getEngineDefinition(id: ForwardDeployedEngineId): EngineDefinition {
  return ENGINE_REGISTRY[id];
}

export function listEngineDefinitions(): EngineDefinition[] {
  return Object.values(ENGINE_REGISTRY);
}

export function isForwardDeployedEngineId(value: unknown): value is ForwardDeployedEngineId {
  return typeof value === "string" && value in ENGINE_REGISTRY;
}
