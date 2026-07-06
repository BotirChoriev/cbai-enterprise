import type { OrchestratorPolicies } from "@/lib/intelligence/orchestrator/policies";
import { DEFAULT_ORCHESTRATOR_POLICIES } from "@/lib/intelligence/orchestrator/policies";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import { RuntimeSession } from "@/lib/intelligence/runtime/runtime-session";
import type { RuntimeState } from "@/lib/intelligence/runtime/runtime.types";
import { INTELLIGENCE_RUNTIME_VERSION } from "@/lib/intelligence/runtime/runtime.types";

export { INTELLIGENCE_RUNTIME_VERSION };

/** Stable identifier for audit metadata. */
export const DEFAULT_INTELLIGENCE_RUNTIME_ID = "default-intelligence-runtime";

/**
 * Contract for the CBAI Intelligence Runtime (BUILD-041).
 *
 * Manages HOW a single intelligence execution lives — not WHAT executes.
 */
export interface IntelligenceRuntime {
  /**
   * Create a new runtime session for an intelligence request.
   */
  createSession(
    request: IntelligenceRequest,
    policies?: OrchestratorPolicies,
  ): RuntimeSession;

  /**
   * Returns an immutable snapshot of an active or completed session.
   */
  snapshot(session: RuntimeSession): RuntimeState;
}

/**
 * Default intelligence runtime for the CBAI Intelligence Engine (BUILD-041).
 */
export class DefaultIntelligenceRuntime implements IntelligenceRuntime {
  createSession(
    request: IntelligenceRequest,
    policies: OrchestratorPolicies = DEFAULT_ORCHESTRATOR_POLICIES,
  ): RuntimeSession {
    return new RuntimeSession(request, policies);
  }

  snapshot(session: RuntimeSession): RuntimeState {
    return session.snapshot();
  }
}

/** Shared default runtime singleton used by the orchestrator. */
export const defaultIntelligenceRuntime = new DefaultIntelligenceRuntime();
