import type {
  Analysis,
  Evidence,
  Knowledge,
  Mission,
  Question,
  Recommendation,
  Relationship,
  Subject,
  TimelineEvent,
} from "@/lib/foundation/foundation-model";
import type { ReasoningResult } from "@/lib/foundation/reasoning-types";

/**
 * The full Intelligence Foundation view for one subject — every ecosystem assembles this same
 * shape from its own domain data. Execution is optional: present only when a real route exists
 * for the recommendation, never a placeholder action. `reasoning` is optional and additive
 * (EPIC-05) — a domain can populate the whole view before it has real relationships/evidence
 * rich enough to reason over.
 */
export interface IntelligenceFoundationView {
  subject: Subject;
  mission: Mission;
  questions: readonly Question[];
  evidence: readonly Evidence[];
  relationships: readonly Relationship[];
  analysis: Analysis;
  recommendation: Recommendation;
  executionHref: string | undefined;
  timeline: readonly TimelineEvent[];
  knowledge: readonly Knowledge[];
  reasoning?: ReasoningResult;
}
