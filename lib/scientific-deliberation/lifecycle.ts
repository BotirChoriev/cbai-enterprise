import type { RoomLifecycleState } from "@/lib/scientific-deliberation/types";

const ALLOWED: Record<RoomLifecycleState, readonly RoomLifecycleState[]> = {
  draft: ["open", "archived"],
  open: ["methodology_review", "synthesis", "awaiting_human_decision", "closed", "archived"],
  methodology_review: ["open", "synthesis", "awaiting_human_decision", "closed"],
  synthesis: ["awaiting_human_decision", "open", "closed"],
  awaiting_human_decision: ["closed", "synthesis", "open"],
  closed: ["archived"],
  archived: [],
};

export function canTransitionRoom(from: RoomLifecycleState, to: RoomLifecycleState): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function transitionRoom(
  from: RoomLifecycleState,
  to: RoomLifecycleState,
  opts?: { readonly humanDecisionRecorded?: boolean },
): { readonly ok: true; readonly status: RoomLifecycleState } | { readonly ok: false; readonly reason: string } {
  if (!canTransitionRoom(from, to)) {
    return { ok: false, reason: `Invalid transition ${from} → ${to}` };
  }
  if (to === "closed" && from === "awaiting_human_decision" && !opts?.humanDecisionRecorded) {
    return { ok: false, reason: "Final closure requires human decision status" };
  }
  return { ok: true, status: to };
}

/** Claims are never auto-promoted to permanent truth. */
export function claimCannotAppearConfirmed(status: string): boolean {
  return status !== "human_confirmed";
}
