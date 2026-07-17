# CBAI Real Data Truth Ledger

Living document — verified lifecycle and evidence truth issues.

## Summary

| Status | Critical | Major |
|--------|----------|-------|
| Verified | 0 | 6 |
| Fixed | 0 | 0 (in progress BUILD-027) |
| Deferred | 0 | 0 |

---

## GEN-T001 — Catalog items counted as connected evidence

- **Build:** pre-027
- **Severity:** Major | **Confidence:** High
- **Route:** `/research/[topicId]`
- **Component:** `lib/research/intelligence/intelligence-engine.ts`
- **Observed:** `connectedEvidence` includes items with `catalog_available` status; milestone `evidence_connected` completes.
- **Expected:** Only user-linked lifecycle (`linked`+) or retrieved external sources count as connected.
- **Evidence:** `intelligence-engine.ts` L29-31 filters `status === "catalog_available"` into `connectedEvidence`; note says "No live source is connected yet."
- **Root cause:** Misnamed field — catalog documentation treated as connection.
- **Proposed correction:** Split `catalogDocumentedEvidence`; derive `connectedEvidence` from lifecycle/external store only.
- **Test:** `scripts/test-genesis-truth.ts`
- **Status:** fixed

## GEN-T002 — Decision reached without human decision

- **Build:** pre-027
- **Severity:** Major | **Confidence:** High
- **Route:** `/research/[topicId]` review tab
- **Component:** `lib/research/readiness/readiness-derivation.ts`
- **Observed:** `decision_reached` milestone completes when `decision !== "unknown"` — includes `open_evidence_review`, `connect_missing_evidence_source`.
- **Expected:** Complete only when human-recorded finding exists and no blocking action remains.
- **Root cause:** Confused recommended action with human decision.
- **Proposed correction:** `decision_reached` = findings.length > 0 && decision === `no_action_required`.
- **Status:** fixed

## GEN-T003 — No blocking factors while sources disconnected

- **Build:** pre-027
- **Severity:** Major | **Confidence:** High
- **Route:** `/research/[topicId]` cockpit
- **Component:** `lib/research/readiness/readiness-engine.ts`, `ResearchCockpit.tsx`
- **Observed:** `catalog_available` topics have empty `blockingIssues`; UI shows "No blocking factors detected."
- **Expected:** Catalog-only evidence is a blocking limitation until live source connected.
- **Root cause:** `blockingIssues` excludes `catalog_available` items.
- **Status:** fixed

## GEN-T004 — Stable health without live evidence

- **Build:** pre-027
- **Severity:** Major | **Confidence:** High
- **Component:** `lib/research/health/health-derivation.ts`
- **Observed:** `partially_ready` → `stable` even when zero live-connected evidence.
- **Expected:** Catalog-only readiness maps to `weak` or explicit catalog-only state.
- **Status:** fixed

## GEN-T005 — Evidence Ready For Review without reviewable evidence

- **Build:** pre-027
- **Severity:** Major | **Confidence:** High
- **Component:** `lib/research/workflow/workflow-stages.ts`
- **Observed:** `partially_ready` → workflow stage `evidence_ready_for_review` for catalog-only topics.
- **Expected:** Stage `evidence_connection_required` until live evidence linked.
- **Status:** fixed

## GEN-T006 — Pipeline/catalog conflated with connected counts

- **Build:** pre-027
- **Severity:** Major | **Confidence:** Medium
- **Component:** `ResearchWorkspaceDashboard.tsx`, search intelligence entry
- **Observed:** UI displays `connectedEvidence.length` as connected count.
- **Expected:** Separate catalog documented vs live connected counts.
- **Status:** fixed
