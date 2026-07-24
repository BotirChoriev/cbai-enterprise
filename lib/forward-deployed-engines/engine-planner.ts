/**
 * Engine planners — one planner per forward-deployed engine.
 * Produces transparent proposed plans; never mutates records directly.
 */

import type {
  EngineContext,
  EngineInputField,
  EngineObjective,
  EnginePlan,
  EngineProposedTask,
  ForwardDeployedEngineId,
} from "@/lib/forward-deployed-engines/engine-types";

function task(id: string, title: string, description: string, kind: EngineProposedTask["kind"] = "task"): EngineProposedTask {
  return { id, title, description, kind };
}

function field(key: string, labelKey: string, required: boolean, provided: boolean, inferred = false, value?: string): EngineInputField {
  return { key, labelKey, required, provided, inferred, value };
}

export type EnginePlannerInput = {
  engineId: ForwardDeployedEngineId;
  objective: EngineObjective;
  context: EngineContext;
};

export function planResearchEngine(input: EnginePlannerInput): EnginePlan {
  const topic = input.objective.statement;
  const domain = input.context.topicId ? "research_topic" : input.objective.domain ?? "general";
  return {
    clarifiedObjective: topic,
    hypotheses: [`Initial hypothesis for: ${topic.slice(0, 80)}`],
    proposedTasks: [
      task("r1", "Define research question", "Narrow the topic into a testable research question", "research_question"),
      task("r2", "Identify evidence requirements", "List sources and data needed before conclusions", "evidence_request"),
      task("r3", "Draft work plan", "Sequence tasks with dependencies", "task"),
    ],
    evidenceRequirements: [
      "Peer-reviewed sources for the topic",
      "Primary data or official statistics where applicable",
    ],
    missingInputs: [
      field("researchQuestionOrTopic", "forwardDeployed.inputs.researchTopic", true, Boolean(topic), false, topic),
      field("domain", "forwardDeployed.inputs.domain", false, Boolean(domain), Boolean(domain), domain),
    ],
    inferredFields: domain !== "general" ? ["domain"] : [],
    userProvidedFields: ["researchQuestionOrTopic"],
    risks: [{ id: "r1", severity: "medium", description: "Topic may be too broad without scoping" }],
    limitations: [{ id: "l1", description: "Plan is a proposal — no evidence verified until review" }],
    reportOutline: ["Introduction", "Methods", "Findings", "Limitations", "Next steps"],
    nextSafeAction: "Review proposed plan and confirm to create draft work",
    mutationRequired: true,
  };
}

export function planEvidenceEngine(input: EnginePlannerInput): EnginePlan {
  const subject = input.objective.statement;
  return {
    clarifiedObjective: `Evidence map for: ${subject}`,
    proposedTasks: [
      task("e1", "Catalog known evidence", "List verified sources linked to the subject", "evidence_request"),
      task("e2", "Identify unknowns", "Mark gaps where evidence is missing", "task"),
      task("e3", "Flag contradictions", "Note conflicting sources for human review", "review"),
    ],
    evidenceRequirements: ["Primary sources", "Cross-referenced secondary sources"],
    missingInputs: [
      field("claimOrQuestion", "forwardDeployed.inputs.claimOrQuestion", true, Boolean(subject), false, subject),
    ],
    inferredFields: [],
    userProvidedFields: ["claimOrQuestion"],
    risks: [],
    limitations: [{ id: "l1", description: "Evidence states reflect available catalog — not live verification" }],
    nextSafeAction: "Review evidence map — no records will be created without confirmation",
    mutationRequired: false,
  };
}

export function planCountryIntelligenceEngine(input: EnginePlannerInput): EnginePlan {
  const country = input.context.countryCode ?? input.context.entityName ?? "selected country";
  return {
    clarifiedObjective: input.objective.statement || `Country intelligence for ${country}`,
    proposedTasks: [
      task("c1", "Review indicator coverage", "Check applicable indicators for the country", "task"),
      task("c2", "Identify knowledge gaps", "List missing evidence slots", "evidence_request"),
      task("c3", "Propose comparison candidates", "Suggest peer countries for comparison", "research_question"),
    ],
    evidenceRequirements: ["Official country statistics", "Indicator-linked source material"],
    missingInputs: [
      field("countryCode", "forwardDeployed.inputs.country", true, Boolean(input.context.countryCode), false, input.context.countryCode),
      field("objective", "forwardDeployed.inputs.objective", true, Boolean(input.objective.statement), false, input.objective.statement),
    ],
    inferredFields: input.context.countryCode ? ["countryCode"] : [],
    userProvidedFields: ["objective"],
    risks: [{ id: "r1", severity: "low", description: "Coverage may be incomplete for smaller datasets" }],
    limitations: [{ id: "l1", description: "Country registry contains curated subset — not all nations" }],
    nextSafeAction: "Review country intelligence proposal",
    mutationRequired: false,
  };
}

export function planOrganizationIntelligenceEngine(input: EnginePlannerInput): EnginePlan {
  const org = input.context.entityName ?? input.context.entityId ?? "organization";
  return {
    clarifiedObjective: input.objective.statement || `Organization intelligence for ${org}`,
    proposedTasks: [
      task("o1", "Build evidence profile", "Summarize known and missing evidence for the organization", "task"),
      task("o2", "Map linked countries and topics", "Identify geographic and research connections", "task"),
      task("o3", "Propose research tasks", "Draft tasks for missing information", "research_question"),
    ],
    evidenceRequirements: ["Organization filings", "Linked country indicators", "Research publications"],
    missingInputs: [
      field("organizationId", "forwardDeployed.inputs.organization", true, Boolean(input.context.entityId), false, input.context.entityId),
    ],
    inferredFields: input.context.entityKind ? ["organizationKind"] : [],
    userProvidedFields: ["organizationId"],
    risks: [],
    limitations: [{ id: "l1", description: "Organization data from static catalog — verify before decisions" }],
    nextSafeAction: "Review organization evidence-gap analysis",
    mutationRequired: false,
  };
}

export function planMissionEngine(input: EnginePlannerInput): EnginePlan {
  const goal = input.objective.statement;
  return {
    clarifiedObjective: goal,
    proposedTasks: [
      task("m1", "Structure mission", "Define problem, beneficiaries, and success criteria", "task"),
      task("m2", "Identify milestones", "Break goal into verifiable milestones", "task"),
      task("m3", "Map dependencies", "List blocking tasks and evidence needs", "task"),
    ],
    evidenceRequirements: ["Evidence inventory for the problem domain"],
    missingInputs: [
      field("userGoal", "forwardDeployed.inputs.userGoal", true, Boolean(goal), false, goal),
    ],
    inferredFields: [],
    userProvidedFields: ["userGoal"],
    risks: [{ id: "r1", severity: "medium", description: "Mission scope may need refinement" }],
    limitations: [{ id: "l1", description: "Mission draft requires confirmation before saving" }],
    nextSafeAction: "Confirm mission structure before creation",
    mutationRequired: true,
  };
}

export function planGovernanceReviewEngine(input: EnginePlannerInput): EnginePlan {
  const subject = input.objective.statement;
  return {
    clarifiedObjective: `Governance review: ${subject}`,
    proposedTasks: [
      task("g1", "Check applicable policies", "Match subject against governance rule registry", "review"),
      task("g2", "Evidence-readiness review", "Verify evidence sufficiency for conclusions", "review"),
      task("g3", "Human-review checklist", "Generate checklist for approver", "review"),
    ],
    evidenceRequirements: ["Supporting evidence for all claims in subject"],
    missingInputs: [
      field("subjectType", "forwardDeployed.inputs.subjectType", true, true, true, "report"),
      field("subjectSummary", "forwardDeployed.inputs.subjectSummary", true, Boolean(subject), false, subject),
    ],
    inferredFields: ["subjectType"],
    userProvidedFields: ["subjectSummary"],
    risks: [{ id: "r1", severity: "high", description: "Governance rules are declarative — human review required" }],
    limitations: [
      { id: "l1", description: "Rules not runtime-enforced — review engine produces checklist only" },
      { id: "l2", description: "No automated approval — human must confirm" },
    ],
    nextSafeAction: "Review governance checklist before saving review record",
    mutationRequired: true,
  };
}

export function planMultilingualMeetingEngine(input: EnginePlannerInput): EnginePlan {
  const langs = input.objective.statement;
  return {
    clarifiedObjective: `Multilingual meeting foundation: ${langs}`,
    proposedTasks: [
      task("mt1", "Define language channels", "Specify source and target languages", "task"),
      task("mt2", "Create terminology glossary", "Load domain terms from terminology registry", "task"),
      task("mt3", "Prepare transcript object structure", "Draft transcript turn schema — no live interpretation", "task"),
    ],
    evidenceRequirements: [],
    missingInputs: [
      field("meetingLanguages", "forwardDeployed.inputs.meetingLanguages", true, Boolean(langs), false, langs),
    ],
    inferredFields: [],
    userProvidedFields: ["meetingLanguages"],
    risks: [],
    limitations: [
      { id: "l1", description: "Foundation only — simultaneous interpretation not implemented" },
      { id: "l2", description: "Requires real audio testing before claiming live interpretation" },
    ],
    nextSafeAction: "Review meeting foundation plan",
    mutationRequired: true,
  };
}

const PLANNERS: Record<ForwardDeployedEngineId, (input: EnginePlannerInput) => EnginePlan> = {
  research: planResearchEngine,
  evidence: planEvidenceEngine,
  country_intelligence: planCountryIntelligenceEngine,
  organization_intelligence: planOrganizationIntelligenceEngine,
  mission: planMissionEngine,
  governance_review: planGovernanceReviewEngine,
  multilingual_meeting: planMultilingualMeetingEngine,
};

export function runEnginePlanner(input: EnginePlannerInput): EnginePlan {
  const planner = PLANNERS[input.engineId];
  return planner(input);
}
