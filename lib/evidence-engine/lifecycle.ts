/**
 * Honest evidence lifecycle transitions.
 * Never promote unverified (or missing_source) to verified in one step.
 */

import type {
  EvidenceLifecycleStatus,
  EvidenceRecord,
  EvidenceStatusTransitionResult,
} from "@/lib/evidence-engine/types";

const ALLOWED_TRANSITIONS: Readonly<Record<EvidenceLifecycleStatus, readonly EvidenceLifecycleStatus[]>> = {
  unverified: ["under_review", "missing_source", "rejected", "expired"],
  under_review: ["verified", "disputed", "rejected", "unverified", "missing_source", "expired"],
  verified: ["disputed", "expired", "under_review"],
  disputed: ["under_review", "verified", "rejected", "expired"],
  rejected: ["under_review", "unverified"],
  expired: ["under_review", "unverified", "missing_source"],
  missing_source: ["unverified", "under_review", "rejected"],
};

export function isEvidenceLifecycleStatus(value: unknown): value is EvidenceLifecycleStatus {
  return (
    typeof value === "string" &&
    value in ALLOWED_TRANSITIONS
  );
}

export function canTransitionEvidenceStatus(
  from: EvidenceLifecycleStatus,
  to: EvidenceLifecycleStatus,
): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Display label for UI — never presents non-verified statuses as "Verified".
 */
export function evidenceStatusDisplayLabel(status: EvidenceLifecycleStatus): string {
  switch (status) {
    case "unverified":
      return "Unverified";
    case "under_review":
      return "Under review";
    case "verified":
      return "Verified";
    case "disputed":
      return "Disputed";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    case "missing_source":
      return "Missing source";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/** True only when status is explicitly verified — never for unverified/missing/etc. */
export function isEvidencePresentedAsVerified(status: EvidenceLifecycleStatus): boolean {
  return status === "verified";
}

export function transitionEvidenceStatus(
  record: EvidenceRecord,
  to: EvidenceLifecycleStatus,
  options?: { readonly reviewer?: string | null; readonly reviewNotes?: string | null },
): EvidenceStatusTransitionResult {
  if (!canTransitionEvidenceStatus(record.status, to)) {
    return {
      ok: false,
      reason: `Cannot transition evidence from ${record.status} to ${to}.`,
    };
  }

  // Hard honesty gate: unverified and missing_source must never become verified directly.
  if (
    (record.status === "unverified" || record.status === "missing_source") &&
    to === "verified"
  ) {
    return {
      ok: false,
      reason: "Unverified or missing-source evidence cannot be marked verified without review.",
    };
  }

  if (to === "verified" && record.status !== "under_review" && record.status !== "disputed") {
    return {
      ok: false,
      reason: "Verification requires an under_review or disputed prior status.",
    };
  }

  const now = new Date().toISOString();
  return {
    ok: true,
    record: {
      ...record,
      status: to,
      updatedAt: now,
      provenance: {
        ...record.provenance,
        reviewer: options?.reviewer !== undefined ? options.reviewer : record.provenance.reviewer,
        reviewNotes:
          options?.reviewNotes !== undefined ? options.reviewNotes : record.provenance.reviewNotes,
      },
    },
  };
}

export function listAllowedEvidenceTransitions(
  from: EvidenceLifecycleStatus,
): readonly EvidenceLifecycleStatus[] {
  return ALLOWED_TRANSITIONS[from];
}
