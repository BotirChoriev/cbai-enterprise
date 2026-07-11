import type {
  Evidence,
  Mission,
  Question,
  Relationship,
  Subject,
} from "@/lib/foundation/foundation-model";
import type { ReasoningInput, ReasoningResult } from "@/lib/foundation/reasoning-types";
import type { CreateWorkflowInput } from "@/lib/workflow/workflow-builder";
import type { Workflow } from "@/lib/foundation/workflow-types";

/** What starts a pipeline run — a real subject to investigate and the question driving it. */
export interface IntelligencePipelineInput {
  subjectId: string;
  question: Question;
}

/** The Foundation stage's resolved output — carried into every later stage. */
export interface IntelligencePipelineFoundation {
  subject: Subject;
  question: Question;
  mission?: Mission;
}

/**
 * The plugin contract every domain implements to run the orchestration pipeline over its own
 * data. `resolveFoundation`, `discoverEvidence`, and `resolveRelationships` are domain-specific
 * — the orchestrator has no default for them and never guesses. `reason` and `buildWorkflow`
 * are domain-agnostic and default to the real lib/reasoning/ and lib/workflow/ engines; a
 * domain overrides them only to substitute a different engine entirely, never to duplicate the
 * default's logic.
 */
export interface IntelligencePipelineProviders {
  resolveFoundation: (
    input: IntelligencePipelineInput,
  ) => { subject: Subject; mission?: Mission } | undefined;
  discoverEvidence: (foundation: IntelligencePipelineFoundation) => readonly Evidence[];
  resolveRelationships: (
    foundation: IntelligencePipelineFoundation,
    evidence: readonly Evidence[],
  ) => readonly Relationship[];
  reason?: (input: ReasoningInput) => ReasoningResult;
  buildWorkflow?: (input: CreateWorkflowInput) => Workflow;
}
