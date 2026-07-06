import { evaluateRuntimePolicy } from "@/lib/intelligence/runtime/policy/policy-evaluation";
import type {
  PolicyDecision,
  RuntimePolicyEvaluationInput,
} from "@/lib/intelligence/runtime/policy/types";

/** Stable identifier for the default runtime policy engine. */
export const DEFAULT_RUNTIME_POLICY_ENGINE_ID = "default-runtime-policy-engine";

/**
 * Contract for the CBAI Runtime Policy Engine (BUILD-044).
 *
 * Evaluates deterministic runtime policies against session state and
 * orchestration inputs. Does not execute intelligence.
 */
export interface PolicyEngine {
  /** Evaluate whether a runtime session may continue, pause, reject, or terminate. */
  evaluate(input: RuntimePolicyEvaluationInput): PolicyDecision;
}

/**
 * Default deterministic runtime policy engine (BUILD-044).
 */
export class DefaultPolicyEngine implements PolicyEngine {
  evaluate(input: RuntimePolicyEvaluationInput): PolicyDecision {
    return evaluateRuntimePolicy(input);
  }
}

/** Shared default policy engine singleton. */
export const defaultPolicyEngine = new DefaultPolicyEngine();
