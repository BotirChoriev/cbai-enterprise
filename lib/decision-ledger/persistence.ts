import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { HumanDecisionRecordRow } from "@/lib/supabase/database.types";

export type PersistedHumanDecision = {
  readonly id: string;
  readonly missionLocalId: string;
  readonly problemLocalId: string | null;
  readonly decisionSummary: string;
  readonly optionsConsidered: readonly string[];
  readonly chosenOption: string;
  readonly rationale: string;
  readonly evidenceRefs: readonly string[];
  readonly unknownsAtDecision: readonly string[];
  readonly confirmedBy: string;
  readonly confirmedAt: string;
};

function mapRow(row: HumanDecisionRecordRow): PersistedHumanDecision {
  return {
    id: row.id,
    missionLocalId: row.mission_local_id,
    problemLocalId: row.problem_local_id,
    decisionSummary: row.decision_summary,
    optionsConsidered: row.options_considered,
    chosenOption: row.chosen_option,
    rationale: row.rationale,
    evidenceRefs: row.evidence_refs,
    unknownsAtDecision: row.unknowns_at_decision,
    confirmedBy: row.confirmed_by,
    confirmedAt: row.confirmed_at,
  };
}

export async function loadMissionDecisions(
  missionLocalId: string,
): Promise<readonly PersistedHumanDecision[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];
  const { data, error } = await client
    .from("human_decision_records")
    .select("*")
    .eq("mission_local_id", missionLocalId)
    .order("confirmed_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function persistConfirmedHumanDecision(input: {
  readonly missionLocalId: string;
  readonly problemLocalId?: string | null;
  readonly decisionSummary: string;
  readonly optionsConsidered: readonly string[];
  readonly chosenOption: string;
  readonly rationale: string;
  readonly evidenceRefs: readonly string[];
  readonly unknownsAtDecision: readonly string[];
  readonly idempotencyKey: string;
  readonly humanConfirmed: boolean;
}): Promise<{ ok: true; value: PersistedHumanDecision } | { ok: false; message: string }> {
  if (!input.humanConfirmed) {
    return { ok: false, message: "Explicit human confirmation is required." };
  }
  if (input.optionsConsidered.length < 2) {
    return { ok: false, message: "At least two considered options are required." };
  }
  if (!input.optionsConsidered.includes(input.chosenOption)) {
    return { ok: false, message: "The chosen option must match a considered option." };
  }
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, message: "Shared backend is not configured." };
  const { data, error } = await client.rpc("confirm_human_decision", {
    p_mission_local_id: input.missionLocalId,
    p_problem_local_id: input.problemLocalId ?? "",
    p_decision_summary: input.decisionSummary,
    p_options_considered: [...input.optionsConsidered],
    p_chosen_option: input.chosenOption,
    p_rationale: input.rationale,
    p_evidence_refs: [...input.evidenceRefs],
    p_unknowns_at_decision: [...input.unknownsAtDecision],
    p_idempotency_key: input.idempotencyKey,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, value: mapRow(data) };
}
