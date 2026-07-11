// Universal Intelligence Workspace shapes. A WorkspaceView is not a dashboard and not a page —
// it is the composed data a workspace UI renders, built entirely from the Orchestration Layer's
// own output (IntelligenceResult, EPIC-07) plus an optional Global Intelligence Network
// (IntelligenceNetwork, EPIC-08). lib/workspace/workspace-builder.ts is the only place that
// constructs one; every section below is a pass-through or a trivial default over data another
// Epic's engine already computed — no new intelligence logic lives here. Distinct from the
// pre-existing lib/workspaces/ (persona-based evidence-coverage explorers behind /investor,
// /citizen, /government) — unrelated, undisturbed, see docs/architecture.md.

import type {
  Evidence,
  Mission,
  Question,
  Relationship,
  Subject,
} from "@/lib/foundation/foundation-model";
import type {
  KnownUnknown,
  ObservedFact,
  ReasoningOption,
  ReasoningStep,
  ReasoningTradeOff,
} from "@/lib/foundation/reasoning-types";
import type { WorkflowState, WorkflowTransition } from "@/lib/foundation/workflow-types";
import type {
  IntelligenceExtensionPoints,
  IntelligencePipelineStageTrace,
} from "@/lib/foundation/orchestration-types";
import type { CollaborationCandidate, IntelligenceNetwork } from "@/lib/foundation/network-types";

/** What the workspace is about and why — the Foundation stage's own output, unmodified. */
export interface MissionCenterSection {
  subject: Subject;
  mission?: Mission;
  question: Question;
}

/** The Reasoning Framework's own facts/unknowns/path — present only when reasoning ran. */
export interface IntelligenceBriefSection {
  observedFacts: readonly ObservedFact[];
  knownUnknowns: readonly KnownUnknown[];
  reasoningPath: readonly ReasoningStep[];
}

/** Every piece of evidence the pipeline discovered, plus the Reasoning Framework's own split. */
export interface EvidenceCenterSection {
  evidence: readonly Evidence[];
  supportingEvidence: readonly Evidence[];
  conflictingEvidence: readonly Evidence[];
}

/**
 * Relationships from this subject's own IntelligenceResult, plus the wider Global Intelligence
 * Network when the caller supplies one — `network` and `collaborationCandidates` are honestly
 * absent/empty when no network was built for this run, never fabricated.
 */
export interface KnowledgeNetworkSection {
  relationships: readonly Relationship[];
  network?: IntelligenceNetwork;
  collaborationCandidates: readonly CollaborationCandidate[];
}

/** The Reasoning Framework's own possible options and trade-offs — present only when reasoning ran. */
export interface RecommendationsSection {
  possibleOptions: readonly ReasoningOption[];
  tradeOffs: readonly ReasoningTradeOff[];
}

/** The Workflow's current state — present only when a workflow was built for this run. */
export interface MonitoringSection {
  currentState?: WorkflowState;
  isTerminal: boolean;
  latestTransition?: WorkflowTransition;
}

/** The Workflow's own transition history — the honest, evidence-referenced audit trail. */
export interface TimelineSection {
  transitions: readonly WorkflowTransition[];
}

/** The Reasoning Framework's own open questions — never a new, separately-derived list. */
export interface OpenQuestionsSection {
  questions: readonly Question[];
}

/** The Orchestration Layer's own stage-by-stage execution trace — the honest activity record. */
export interface ActivitySection {
  pipelineTrace: readonly IntelligencePipelineStageTrace[];
}

/**
 * The full Intelligence Workspace view for one subject — every future workspace (Research,
 * Government, University, Enterprise, Engineering, Investment, Legal, Education) renders this
 * same shape. `extensions` is IntelligenceResult's own reserved slots (EPIC-07) — Voice,
 * Executive Briefing, Collaboration, Analytics, and Mission Monitoring support is already
 * declared there; the Workspace adds no new extension vocabulary.
 */
export interface WorkspaceView {
  subjectId: string;
  missionCenter: MissionCenterSection;
  intelligenceBrief?: IntelligenceBriefSection;
  evidenceCenter: EvidenceCenterSection;
  knowledgeNetwork: KnowledgeNetworkSection;
  recommendations?: RecommendationsSection;
  monitoring: MonitoringSection;
  timeline: TimelineSection;
  openQuestions: OpenQuestionsSection;
  activity: ActivitySection;
  extensions: IntelligenceExtensionPoints;
}
