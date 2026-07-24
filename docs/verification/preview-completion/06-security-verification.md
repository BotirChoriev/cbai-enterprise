# Security verification — Preview Completion Program

**Branch:** `preview/spatial-world-intelligence`
**Recorded:** 2026-07-22
**Scope:** SF-1…SF-5, broker, RLS, client gates, static export model

## Status legend

| Status | Meaning |
|--------|---------|
| **PROVEN_AUTOMATED** | CI/script on branch |
| **PROVEN_LOCAL** | Local build/tests only |
| **MANUAL_REQUIRED** | Human review / Safari / ops |
| **EXTERNAL_BLOCKED** | Preview/production/Supabase without credentials |
| **PENDING_IMPLEMENTATION** | Accepted design; fix not complete |

---

## Security freeze matrix

| Check | SF | Status | Evidence |
|-------|-----|--------|----------|
| SF blockers encoded in contracts | SF-1…5 | **PROVEN_AUTOMATED** | `scripts/test-canonical-contracts.ts`; `lib/canonical-contracts/trust.ts` |
| Voice broker refuses body-only Origin spoof | SF-1 | **PROVEN_LOCAL** | Mid-program edit `pages-voice-session-broker.ts` (uncommitted); not deployed |
| End-user auth on credential mint | SF-1 | **PENDING_IMPLEMENTATION** | DD-PC-001 option B partial only |
| Broker rate limiting / quotas | SF-1 | **PENDING_IMPLEMENTATION** | Soft in-memory limit local only |
| Device-local ≠ team authorization documented | SF-2 | **PROVEN_AUTOMATED** | `trust.ts`; auth-collab tests |
| Cloud-required gates for shared features | SF-2 | **PENDING_IMPLEMENTATION** | Page gates still use `isSignedIn` |
| Client audit keys not integrity-protected | SF-3 | **PENDING_IMPLEMENTATION** | `cbai-*-audit` localStorage |
| RLS SQL exists for cloud tables | SF-4 | **PROVEN_LOCAL** | `0002`, `0006` migrations in repo |
| RLS applied + IDOR suite on live project | SF-4 | **EXTERNAL_BLOCKED** | No prod Supabase apply |
| Publication rights durable + server enforced | SF-5 | **PENDING_IMPLEMENTATION** | UI checklist only |
| Visibility enum canonical | SF-5 | **PROVEN_LOCAL** | DD-PC-006; migration comments |
| No middleware server guards (static export) | — | **PROVEN_LOCAL** | No `middleware.ts`; documented |
| Voice Level 3 publish forbidden single-shot | SF-5 | **PROVEN_AUTOMATED** | `auth-action-policy.ts`; voice tests |
| Secrets not in repo | — | **PROVEN_LOCAL** | `.dev.vars` / `.env.local` gitignored |
| Live Preview security pen test | — | **EXTERNAL_BLOCKED** | Not run in this program |

---

## Broker / API surface

| Check | Status | Notes |
|-------|--------|-------|
| Broker never returns `sk-*` to client | **PROVEN_LOCAL** | Session broker tests / code review |
| CORS allowlist aligned to Preview origin | **MANUAL_REQUIRED** | Verify deployed Preview host when available |
| Live broker abuse test | **EXTERNAL_BLOCKED** | Needs deployed edge + monitoring |

---

## Gaps

- SF-1 remains `productionBlocker: true` after partial Origin + rate-limit hardening
- No production Supabase verification in this program
- Safari live voice path not security-validated end-to-end

## Auth trust verification (companion)

# Auth verification — Preview Completion Program

**Branch:** `preview/spatial-world-intelligence`
**Recorded:** 2026-07-22

---

## Auth modes

| Check | Status | Evidence |
|-------|--------|----------|
| Dual mode: device-local + optional Supabase cloud | **PROVEN_LOCAL** | `lib/auth/auth-store.ts`; `/account` UI |
| Honest labeling of local vs cloud session | **PROVEN_LOCAL** | Account copy; auth-collab tests |
| Guest public journey routes without sign-in | **PROVEN_AUTOMATED** | `PUBLIC_JOURNEY_ROUTES`; platform-shell tests |
| Page gates: `/teams`, `/scientific-documents`, `/publications` | **PROVEN_LOCAL** | `isSignedIn` client gates |
| Voice mutation gates for protected actions | **PROVEN_AUTOMATED** | `requiresAuthForOsAction()` tests |
| Pending resume flow after protected voice action | **PROVEN_AUTOMATED** | auth-collab tests |
| Cloud sign-in with live Supabase project | **EXTERNAL_BLOCKED** | No prod credentials in program |
| Password reset flow (`/reset-password`) | **EXTERNAL_BLOCKED** | Cloud-only; needs live Auth |
| Server-verified identity for team features (SF-2) | **PENDING_IMPLEMENTATION** | DD-PC-002 |

---

## Organization / trust tiers

| Check | Status | Notes |
|-------|--------|-------|
| `/organization` org-OS UI (local actor accepted) | **PROVEN_LOCAL** | SF-2/SF-4 risk |
| Trust tier types in contracts | **PROVEN_AUTOMATED** | `lib/canonical-contracts/trust.ts` |
| `deviceLocalSatisfiesTeamAuth: false` encoded | **PROVEN_AUTOMATED** | Contract test |
| Org RPC + RLS on live DB | **EXTERNAL_BLOCKED** | Migrations not applied |

---

## Collaboration auth boundaries

| Route | Gate | Status |
|-------|------|--------|
| `/workspace` | Link hub; honest empty | **PROVEN_LOCAL** |
| `/teams` | `isSignedIn` + local drafts | **PARTIAL** → **PENDING_IMPLEMENTATION** for org-OS bind |
| `/files`, `/messages`, `/notifications` | Placeholder; voice gated | **PENDING_IMPLEMENTATION** |
| `/publications` | `isSignedIn`; in-memory only | **PARTIAL** (SF-5) |

---

## Gaps

- SF-2: device-local still satisfies page-level team gates
- No cross-device session proof without live Supabase
- Safari full sign-in resume: **MANUAL_REQUIRED** / **EXTERNAL_BLOCKED**
