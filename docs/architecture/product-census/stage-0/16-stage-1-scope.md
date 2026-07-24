# Stage 1 scope proposal (behavior-preserving)

**Stage 1 may contain only:** canonical types, ownership interfaces, import-direction rules, compatibility adapters, deprecation annotations, architecture tests, documentation.

**Stage 1 must not contain:** file deletion/movement, store consolidation, data migration, route/UI redesign, auth replacement, broker security implementation, publication enablement, or any user-visible behavior change.

**Data impact per slice:** NONE (additive types/tests/docs only).
**User-visible behavior impact:** NONE.
**Rollback:** revert the slice commit(s); no data repair required.

---

## Slice 1 — Architecture dependency rules

| Field | Content |
|-------|---------|
| **Purpose** | Encode allowed/forbidden import directions (voice→platform-actions→FDE; no app→`lib/intelligence` orchestrator) |
| **Intended files** | New: `docs/architecture/...` + optional `scripts/test-architecture-boundaries.ts` or eslint import restriction config **additive only** |
| **Compatibility** | No runtime import changes required in slice 1 if tests are warn-first; prefer failing tests on *new* violations |
| **Tests before** | Existing Stage 0 baseline green |
| **Tests after** | New boundary test script |
| **Rollback** | Delete new test/doc/config |
| **Data / UX** | NONE |

## Slice 2 — Canonical identity and locale contracts

| Field | Content |
|-------|---------|
| **Purpose** | Type-level Person/Account, locale provenance fields (`createdLocale`, `contentLocale`), non-rewrite rules |
| **Intended files** | New types under e.g. `lib/product-contracts/` or `lib/canonical-types/` (new folder only); docs |
| **Compatibility** | Types unused by stores until later slices opt-in |
| **Tests** | Compile-only + locale policy unit asserts |
| **Rollback** | Remove new folder |
| **Data / UX** | NONE |

## Slice 3 — Canonical action / navigation contracts

| Field | Content |
|-------|---------|
| **Purpose** | Formalize ActionLevel 0–3, allowlisted navigation, confirmation requirements |
| **Intended files** | Thin re-exports/annotations beside `lib/platform-actions/types.ts` / action-levels — **comments + types only**, no executor changes |
| **Compatibility** | Existing registry remains source of truth |
| **Tests** | Existing voice-platform-operator + new contract asserts |
| **Rollback** | Revert type/doc edits |
| **Data / UX** | NONE |

## Slice 4 — Mission / Project / OO relationship contracts

| Field | Content |
|-------|---------|
| **Purpose** | Document ID relationship rules without merging schemas |
| **Intended files** | New contract types + docs; optional type guards unused in write paths |
| **Compatibility** | Stores unchanged |
| **Tests** | Relationship invariant unit tests on fixtures (not live localStorage) |
| **Rollback** | Remove contracts |
| **Data / UX** | NONE |

## Slice 5 — Evidence / graph ownership contracts

| Field | Content |
|-------|---------|
| **Purpose** | EvidenceItem ≠ Source ≠ Claim; `/knowledge` canonical; graph+LON canonical; quarantine markers on intelligence duplicates |
| **Intended files** | Contract types; `@deprecated` / quarantine comments on `lib/intelligence/evidence` and `lib/intelligence/graph` entry files only |
| **Compatibility** | No deletions |
| **Tests** | Import-boundary tests |
| **Rollback** | Revert comments/types |
| **Data / UX** | NONE |

## Slice 6 — Auth / collaboration / publication trust interfaces

| Field | Content |
|-------|---------|
| **Purpose** | Enumerate trust layers; mark device-local ≠ team auth; publication rights interface stubs |
| **Intended files** | New interfaces only; docs linking SF-1…SF-5 |
| **Compatibility** | No gate behavior changes |
| **Tests** | Type tests / doc existence |
| **Rollback** | Remove interfaces |
| **Data / UX** | NONE |

## Slice 7 — Compatibility adapters and deprecation markers

| Field | Content |
|-------|---------|
| **Purpose** | Adapter *interfaces* (not wired) for research-evidence→platform evidence; collab→org-OS; genesis→project |
| **Intended files** | New adapter stubs returning “not wired”; deprecation JSDoc |
| **Compatibility** | Callers unchanged (stubs unused) |
| **Tests** | Stub existence tests |
| **Rollback** | Remove stubs |
| **Data / UX** | NONE |

---

## Explicitly deferred (not Stage 1)

Broker auth (SF-1 fix) · cloud-required collab · audit append-only · store merges · route IA changes · UI redesign · deleting `lib/intelligence` · enabling publications.
