import type { ParticipantRole } from "@/lib/scientific-deliberation/types";

export type SdnAction =
  | "create_room"
  | "add_claim"
  | "add_evidence"
  | "add_counter_evidence"
  | "submit_method_review"
  | "add_replication"
  | "moderate"
  | "approve_final"
  | "create_operational_object"
  | "impersonate_institution"
  | "send_external_message"
  | "hide_counter_evidence";

const MATRIX: Record<ParticipantRole, readonly SdnAction[]> = {
  claim_author: ["create_room", "add_claim", "add_evidence", "create_operational_object"],
  counter_evidence_contributor: ["add_evidence", "add_counter_evidence"],
  methodology_reviewer: ["submit_method_review"],
  statistical_reviewer: ["submit_method_review"],
  replication_specialist: ["add_replication"],
  interdisciplinary_expert: ["add_evidence", "add_claim"],
  institution_representative: ["add_evidence"],
  student_observer: [],
  scientific_moderator: ["moderate", "add_evidence", "submit_method_review"],
  final_human_approver: ["approve_final", "create_operational_object"],
};

export function roleAllows(role: ParticipantRole, action: SdnAction): boolean {
  if (action === "impersonate_institution" || action === "send_external_message" || action === "hide_counter_evidence") {
    return false;
  }
  return MATRIX[role]?.includes(action) ?? false;
}

export function observerCannotApprove(role: ParticipantRole): boolean {
  return role === "student_observer" ? !roleAllows(role, "approve_final") : true;
}

export function moderatorIsNotAutomaticScientificAuthority(role: ParticipantRole): boolean {
  return role === "scientific_moderator" ? !roleAllows(role, "approve_final") : true;
}
