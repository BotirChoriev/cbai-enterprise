import { executeOrchestratedRun } from "@/lib/intelligence/orchestrator";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";

/**
 * Execute the full Intelligence Engine pipeline via the Orchestrator (BUILD-040).
 *
 * Pipeline sequence (orchestrator stages):
 * Request → Evidence → Quality → Contradictions → Confidence → Trust →
 * Graph → Memory → Trace → Result → Diagnostics
 *
 * @param request - Intelligence request envelope
 * @returns Assembled {@link IntelligenceResult} with diagnostics and orchestration summary
 */
export async function executePipeline(
  request: IntelligenceRequest,
): Promise<IntelligenceResult> {
  return executeOrchestratedRun(request);
}
