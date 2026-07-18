/** Tool risk classification — fluid conversation for read-only, gates for external/consequential. */

import type { ToolRiskClass } from "@/lib/voice-operator/types";

export type VoiceToolName =
  | "get_active_context"
  | "get_next_action"
  | "list_existing_evidence"
  | "prepare_external_evidence_search"
  | "run_external_evidence_search"
  | "show_evidence_results"
  | "compare_sources_to_idea"
  | "explain_measurement_readiness"
  | "draft_mission"
  | "draft_task"
  | "prepare_decision_package"
  | "navigate_internal";

const TOOL_RISK: Record<VoiceToolName, ToolRiskClass> = {
  get_active_context: "read_only",
  get_next_action: "read_only",
  list_existing_evidence: "read_only",
  prepare_external_evidence_search: "external_read",
  run_external_evidence_search: "external_read",
  show_evidence_results: "read_only",
  compare_sources_to_idea: "read_only",
  explain_measurement_readiness: "read_only",
  draft_mission: "draft_write",
  draft_task: "draft_write",
  prepare_decision_package: "draft_write",
  navigate_internal: "read_only",
};

export function toolRiskClass(tool: VoiceToolName): ToolRiskClass {
  return TOOL_RISK[tool];
}

export function toolMayRunConversationally(tool: VoiceToolName): boolean {
  return toolRiskClass(tool) === "read_only";
}

export function toolRequiresExternalConsent(tool: VoiceToolName): boolean {
  return toolRiskClass(tool) === "external_read" && tool !== "prepare_external_evidence_search";
}

export function toolRequiresHumanConfirmation(tool: VoiceToolName): boolean {
  const risk = toolRiskClass(tool);
  return risk === "draft_write" || risk === "consequential";
}
