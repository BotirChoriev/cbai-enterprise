/**
 * Orchestrator execution policies (BUILD-040).
 *
 * Policy flags only — no runtime configuration UI.
 */

/** Policy set governing orchestrator execution behavior. */
export interface OrchestratorPolicies {
  /** Continue pipeline execution when non-blocking warnings are observed. */
  continueOnWarning: boolean;
  /** Stop after contradiction detection when a blocking conflict is present. */
  stopOnBlockingConflict: boolean;
  /** Stop when a required stage fails. */
  stopOnCriticalFailure: boolean;
  /** Always run the diagnostics stage at end of orchestration. */
  runDiagnosticsAlways: boolean;
}

/** Default orchestrator policies — matches pre-BUILD-040 pipeline behavior. */
export const DEFAULT_ORCHESTRATOR_POLICIES: OrchestratorPolicies = {
  continueOnWarning: true,
  stopOnBlockingConflict: false,
  stopOnCriticalFailure: true,
  runDiagnosticsAlways: true,
};

/** Policy flag: continue on warning. */
export const POLICY_CONTINUE_ON_WARNING = "ContinueOnWarning" as const;

/** Policy flag: stop on blocking contradiction conflict. */
export const POLICY_STOP_ON_BLOCKING_CONFLICT = "StopOnBlockingConflict" as const;

/** Policy flag: stop on critical stage failure. */
export const POLICY_STOP_ON_CRITICAL_FAILURE = "StopOnCriticalFailure" as const;

/** Policy flag: always run diagnostics. */
export const POLICY_RUN_DIAGNOSTICS_ALWAYS = "RunDiagnosticsAlways" as const;

/** Human-readable labels for orchestrator policies. */
export const ORCHESTRATOR_POLICY_LABELS: Record<keyof OrchestratorPolicies, string> = {
  continueOnWarning: POLICY_CONTINUE_ON_WARNING,
  stopOnBlockingConflict: POLICY_STOP_ON_BLOCKING_CONFLICT,
  stopOnCriticalFailure: POLICY_STOP_ON_CRITICAL_FAILURE,
  runDiagnosticsAlways: POLICY_RUN_DIAGNOSTICS_ALWAYS,
};

/**
 * Resolve whether a warning should halt execution under current policies.
 */
export function shouldStopOnWarning(
  policies: OrchestratorPolicies,
  hasWarnings: boolean,
): boolean {
  if (!hasWarnings) {
    return false;
  }

  return !policies.continueOnWarning;
}

/**
 * Resolve whether a blocking contradiction should halt execution.
 */
export function shouldStopOnBlockingConflict(
  policies: OrchestratorPolicies,
  hasBlockingConflict: boolean,
): boolean {
  return policies.stopOnBlockingConflict && hasBlockingConflict;
}

/**
 * Resolve whether a required stage failure should halt execution.
 */
export function shouldStopOnCriticalFailure(
  policies: OrchestratorPolicies,
  stageRequired: boolean,
): boolean {
  return policies.stopOnCriticalFailure && stageRequired;
}
