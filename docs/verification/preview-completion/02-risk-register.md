# Risk register — Preview Completion Program

**Branch:** `preview/spatial-world-intelligence`
**Recorded:** 2026-07-22
**Policy:** No item marked production-safe until evidence exists. Live Preview / Safari / Supabase production gates → `EXTERNAL_BLOCKED` unless independently proven.

## Status legend

| Status | Meaning |
|--------|---------|
| **PROVEN_AUTOMATED** | CI/script evidence on this branch |
| **PROVEN_LOCAL** | Local static build + unit tests; not live Preview |
| **MANUAL_REQUIRED** | Needs human Safari/ops pass |
| **EXTERNAL_BLOCKED** | Blocked by credentials deploy access or third-party ops |
| **PENDING_IMPLEMENTATION** | Design accepted; code/schema incomplete |

---

## Security freeze (SF-1 … SF-5)

| ID | Risk | Affected surfaces | Mitigation (planned / partial) | Status |
|----|------|-------------------|--------------------------------|--------|
| **SF-1** | Voice broker mints Realtime credentials on origin allowlist only — no end-user auth | All voice routes; `functions/api/voice/session.ts`; `lib/voice-operator/session-broker/` | DD-PC-001: require `Origin` header + soft in-memory rate limit (mid-program uncommitted); end-user mint auth TBD | **PENDING_IMPLEMENTATION** — partial mitigation in tree; `productionBlocker: true` in `lib/canonical-contracts/trust.ts` |
| **SF-2** | Device-local sign-in treated as collaboration trust | `/teams`, `/organization`, `/account`, voice guest gates | DD-PC-002: unify gates on `accountMode` / cloud for shared features | **PENDING_IMPLEMENTATION** — honest dual-mode labels only |
| **SF-3** | Client-writable audit keys (`cbai-*-audit`) | `/organization` audit UI; genesis/ontology audits | Append-only server audit + integrity hashing (Stage 2+) | **PENDING_IMPLEMENTATION** |
| **SF-4** | Incomplete IDOR / RLS for multi-user cloud | Cloud sync; `/organization`; Supabase tables | RLS SQL exists (`0002`, `0006`); IDOR suite in prod config not run | **EXTERNAL_BLOCKED** — no production Supabase apply in this program |
| **SF-5** | No durable publication rights / consent workflow | `/publications`, `/scientific-documents`, voice Level 3 publish | DD-PC-003/006: metadata + visibility enum; server enforcement when cloud | **PENDING_IMPLEMENTATION** — UI checklist only |

**Canonical encoding:** `lib/canonical-contracts/trust.ts`, `docs/architecture/product-census/stage-0/15-security-gate-matrix.md`.

---

## Stage 2 consolidation risks

| ID | Risk | Trigger | Mitigation | Status |
|----|------|---------|------------|--------|
| **S2-R1** | Big-bang delete of `lib/intelligence` or `lib/collaboration` breaks hidden imports | Premature Stage 2 start | DD-PC-005: reversible adapter slices; import lint; no deletions without approval | **PROVEN_AUTOMATED** — `test:architecture-boundaries` PASS at Stage 1 |
| **S2-R2** | Dual team models (`/teams` drafts vs org-OS) confuse authorization | User expects cross-device teams | Migrate `cbai-team-drafts` → org-OS; deprecate collaboration store growth | **PENDING_IMPLEMENTATION** |
| **S2-R3** | Evidence type drift between research adapter and `/knowledge` | Stage 2 wiring of adapters | `researchEvidenceToPlatformEvidenceAdapter` remains `wired: false` until Stage 2 | **PENDING_IMPLEMENTATION** |
| **S2-R4** | Stage 2 started without human approval | Scope creep | Stage 1 report: **Stage 2 not started; awaiting human approval** | **MANUAL_REQUIRED** — go/no-go gate |

---

## Collaboration / storage risks

| ID | Risk | Affected routes | Mitigation | Status |
|----|------|-----------------|------------|--------|
| **CS-R1** | No Supabase Storage bucket for scientific intake blobs | `/scientific-documents`, `/files` | Proposed migration `0008` (object refs + messages); DD-PC-003 | **EXTERNAL_BLOCKED** — bucket apply needs credentials |
| **CS-R2** | Placeholder collab shells imply backend that does not exist | `/files`, `/messages`, `/notifications` | Honest empty shells + voice policy gates | **PROVEN_LOCAL** — static UI; **PENDING_IMPLEMENTATION** for cloud |
| **CS-R3** | Cross-device messaging without durable store | `/messages`, `/teams` | org-OS ownership; mission-anchored discussion (DD-PC-004) | **EXTERNAL_BLOCKED** — live Supabase not applied |
| **CS-R4** | localStorage quota / loss on device clear | Personal routes with `cbai-*` keys | Cloud migration path in `lib/supabase/migration.ts`; optional sync | **PROVEN_LOCAL** — local mode works; cloud **EXTERNAL_BLOCKED** |

---

## Voice / Preview deployment risks

| ID | Risk | Mitigation | Status |
|----|------|------------|--------|
| **V-R1** | Live Realtime audio E2E unverified (invalid/missing API key in CI) | Manual Safari checklist when credentials supplied | **EXTERNAL_BLOCKED** |
| **V-R2** | Static export CORS to local broker port in capture | Document broker origin alignment for Preview host | **MANUAL_REQUIRED** for deployed Preview URL |
| **V-R3** | Voice navigation alias gaps (“open evidence” vs `/knowledge`) | Registry + command fixtures in `test:voice-*` | **PROVEN_AUTOMATED** — fixture suites PASS locally |

---

## Summary

| Category | Open blockers | Next honest gate |
|----------|---------------|------------------|
| SF-1…5 | 5 production blockers | End-user broker auth; cloud RLS apply; durable rights |
| Stage 2 | Not started | Human approval + adapter wiring plan |
| Collab/storage | 0008 not present | Draft migration + EXTERNAL_BLOCKED prod apply |
| Live Preview | Not claimed in this program | Safari + deployed Preview with valid secrets |
