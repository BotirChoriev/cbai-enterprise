# FINAL REPORT — CBAI Preview Completion Program

**Stopped for human approval. No commit. No push. No deploy. main untouched.**

---

## 1. Exact branch

`preview/spatial-world-intelligence`

## 2. Exact HEAD

`18a8c23b99ace725c43cfa384141ae7799643c28`
(Working tree has uncommitted Preview Completion changes on top of this HEAD.)

## 3. Starting and ending git counts

| Metric | Program start | End (this report) |
|--------|--------------:|------------------:|
| HEAD | `18a8c23` | `18a8c23` (unchanged — no commit) |
| Modified tracked files | 0 | ~16 |
| New untracked product/docs (PC) | 0 | docs/verification/preview-completion/**, lib contracts, migration 0008, tests |
| Pre-existing excluded untracked artifacts | 36+ | preserved (not deleted) |
| Commits created this program | 0 | 0 |
| Pushes | 0 | 0 |
| Deploys | 0 | 0 |

## 4. Changed-file list (grouped)

### Voice / SF-1
- `lib/voice-operator/session-broker/pages-voice-session-broker.ts` — Origin header required; soft rate limit; `resetVoiceBrokerRateLimitForTests`
- `lib/voice-operator/instructions.ts` — must tool-call for navigation; clarify vague open-page
- `components/voice-operator/VoiceOperatorProvider.tsx` — logout/`pagehide` teardown; clarify option routing
- `scripts/test-voice-session-broker.ts` — body-only Origin blocked

### Platform actions / navigation
- `lib/platform-actions/registry.ts` — aliases; reject `//` protocol-relative hrefs
- `lib/platform-actions/intent-matcher.ts` — vague open-page clarify

### Auth / trust (SF-2)
- `lib/canonical-contracts/trust-tiers.ts` — guest / device_local / cloud tiers
- `lib/canonical-contracts/trust.ts` — SF-1 title updated (still productionBlocker)
- `components/platform/context/AuthProvider.tsx` — `cbai:auth-session-ended` on sign-out
- `components/teams/TeamsWorkspaceClient.tsx` — cloud required for team collab
- `components/scientific-intake/ScientificDocumentIntakeClient.tsx` — personal cabinet via accountMode

### Object storage / intake / visibility
- `lib/object-storage/contracts.ts`
- `lib/scientific-intake/scientific-intake.ts` — lifecycle + objectId; no ready without scan; files vs PhD matcher fix
- `lib/visibility/policy.ts`
- `supabase/migrations/0008_object_storage_and_messages.sql`

### Stage 2 / observability
- `lib/canonical-contracts/stage2-store-inventory.ts`
- `lib/observability/contracts.ts`
- `lib/canonical-contracts/index.ts` exports

### i18n
- `lib/i18n/platform-copy-platform-actions.ts` — clarifyOpenPage, optionCountries
- `lib/i18n/platform-copy-auth-collab.ts` — cloudRequiredForTeams
- `lib/i18n/dictionary-types.ts`

### Tests / package
- `scripts/test-preview-completion.ts`
- `scripts/test-preview-completion-rls-static.ts`
- `package.json` — `test:preview-completion`, `test:preview-completion-rls-static`

### Verification docs
- `docs/verification/preview-completion/**` (00–12, legal draft, screenshots README + reference copies)

## 5. Architecture before / after

**Before:** Stage 1 contracts only; broker could mint on body Origin; device-local treated as team gate via `isSignedIn`; scientific “yukla” over-matched files; no 0008 storage/messages SQL.

**After:** Same canonical owners (platform-actions, voice-operator, FDE, org-os, OO). Trust tiers separate device-local from cloud team. Object-storage + visibility contracts. Stage 2 inventory map (no deletions). Observability console adapter. Migration 0008 in repo only.

## 6. Decisions and alternatives

See `04-design-decisions.md` (DD-PC-001…006). Chosen B for voice/SF-1 partial; A for trust, storage, teams, Stage 2, visibility.

## 7. Preview acceptance results

| Gate | Status |
|------|--------|
| Cloudflare Preview build / Access / live WebRTC | **EXTERNAL_BLOCKED** (no deploy this program) |
| Local `doctor:voice` | **PROVEN_LOCAL** PASS |
| Broker Origin + rate limit unit tests | **PROVEN_AUTOMATED** |
| Production build | **PROVEN_AUTOMATED** (`npm run build` success) |

## 8. Voice results

| Gate | Status |
|------|--------|
| Allowlisted navigation EN/UZ/RU/TR fixtures | **PROVEN_AUTOMATED** |
| Arbitrary URL / `//` rejection | **PROVEN_AUTOMATED** |
| Vague open page → clarify | **PROVEN_AUTOMATED** |
| Tool/transcript path via platform-actions | **PROVEN_AUTOMATED** (existing suites) |
| Route survival (no pathname teardown) | **PROVEN_AUTOMATED** |
| Stop/Close/unmount cleanup | **PROVEN_AUTOMATED** |
| Logout/pagehide release | **PROVEN_LOCAL** (wired; Safari indicator **MANUAL_REQUIRED**) |
| Live audible Realtime + Uzbek STT on Safari | **EXTERNAL_BLOCKED** / **MANUAL_REQUIRED** |
| SF-1 full end-user mint | **EXTERNAL_BLOCKED** (still productionBlocker) |

## 9. Authentication and authorization

| Gate | Status |
|------|--------|
| Trust tiers defined | **PROVEN_AUTOMATED** |
| Device-local ≠ team | **PROVEN_AUTOMATED** + Teams UI gate |
| Guest no cloud team mutation | **PROVEN_AUTOMATED** |
| Server actor from client body rejected as authority | **PROVEN_LOCAL** (migration messages use auth.uid(); live **EXTERNAL_BLOCKED**) |
| Supabase as sole auth provider | Unchanged — no second provider |

## 10. Personal cabinet / team roles

| Gate | Status |
|------|--------|
| Roles owner/admin/editor/reviewer/viewer documented in product copy | **PROVEN_LOCAL** (existing + teams surface) |
| Cloud required for team collaboration UI | **PROVEN_LOCAL** |
| Cross-device invitations / live membership | **EXTERNAL_BLOCKED** without live Supabase multi-user |
| Fake online presence / unread | Not introduced |

## 11. Object storage and scientific intake

| Gate | Status |
|------|--------|
| No localStorage file bytes | **PROVEN_AUTOMATED** |
| Lifecycle + objectId fields; never false ready | **PROVEN_AUTOMATED** |
| Virus scan when unavailable | **EXTERNAL_BLOCKED** (`scanStatus: external_blocked` / not_configured) |
| Live resumable multipart upload to bucket | **EXTERNAL_BLOCKED** (credentials / bucket apply) |
| Migration 0008 SQL in repo | **PROVEN_AUTOMATED** (static) |

## 12. Messages / activity / notifications

| Gate | Status |
|------|--------|
| SQL model + RLS stubs (messages, activity deny client insert) | **PROVEN_AUTOMATED** (static) |
| Live multi-user message delivery | **EXTERNAL_BLOCKED** |
| UI for full threaded messaging | Partial / placeholder routes — honesty preserved |

## 13. Visibility policy

| Gate | Status |
|------|--------|
| private \| team \| public; default private | **PROVEN_AUTOMATED** |
| Public requires confirmation + rights | **PROVEN_AUTOMATED** |
| Attachments cannot broaden | **PROVEN_AUTOMATED** |
| Server enforcement live | **EXTERNAL_BLOCKED** until 0008 applied |

## 14. SF-1…SF-5 status

| ID | Status |
|----|--------|
| SF-1 | Partial mitigation (Origin + soft RL) **PROVEN_AUTOMATED**; full auth mint **EXTERNAL_BLOCKED**; still `productionBlocker: true` |
| SF-2 | Device-local ≠ team **PROVEN_AUTOMATED**/UI; cloud authority live **EXTERNAL_BLOCKED** |
| SF-3 | activity_events client insert denied in SQL; live append RPC **EXTERNAL_BLOCKED**/PENDING |
| SF-4 | 0008 RLS policies in SQL + static tests; live IDOR multi-user **EXTERNAL_BLOCKED** |
| SF-5 | Visibility/rights gates in code; legal counsel approval **EXTERNAL_BLOCKED** (`legal-draft-requires-counsel.md`) |

## 15. Stage 2 slice results

| Slice | Status |
|-------|--------|
| 2.1 Store inventory | **PROVEN_AUTOMATED** (`STAGE2_STORE_INVENTORY`) |
| 2.2–2.5 Provider/evidence/graph deep rewires | Inventory + adapters only; no big-bang; no deletions |
| 2.6–2.7 Quarantine retained | **PROVEN_AUTOMATED** (architecture-boundaries) |
| 2.8 Compatibility | Intake unknown-field backfill **PROVEN_LOCAL** |

## 16. Migrations / RLS / IDOR

- Forward-only `0008_object_storage_and_messages.sql` added.
- Static presence tests pass.
- Live apply + multi-user IDOR: **EXTERNAL_BLOCKED**.
- Existing `test:rls` skips without credentials (unchanged honesty).

## 17. Monitoring

Provider-neutral `lib/observability/contracts.ts` + console adapter. Vendor wiring **EXTERNAL_BLOCKED**.

## 18. Privacy / legal / publication

`legal-draft-requires-counsel.md` — **Draft — requires legal review**. Public production release **EXTERNAL_BLOCKED** until counsel.

## 19. Accessibility

Keyboard/text equivalents for voice actions retained. Fresh WCAG/Safari VoiceOver matrix: **MANUAL_REQUIRED**. Automated a11y alone ≠ conformance.

## 20. Localization

New keys EN/UZ/RU/TR for clarifyOpenPage, optionCountries, cloudRequiredForTeams. `test:locale-completeness` pass. Longest-label mobile screenshots: **MANUAL_REQUIRED**.

## 21. Test results (this session)

| Suite | Result |
|-------|--------|
| `test:preview-completion` | PASS 12/12 |
| `test:preview-completion-rls-static` | PASS 2/2 |
| `test:voice-session-broker` | PASS 19/19 |
| `test:auth-collaboration-voice-os` | PASS 20/20 |
| `test:voice-command-orchestrator` | PASS 19/19 |
| `test:voice-operating-navigator` | PASS 18/18 |
| `test:voice-realtime-webrtc` | PASS 20/20 |
| `test:microphone-access` | PASS 7/7 |
| `test:canonical-contracts` | PASS 6/6 |
| `test:architecture-boundaries` | PASS 5/5 |
| `test:locale-completeness` | PASS 16/16 |
| `doctor:voice` | PASS (local) |

## 22. Build / lint / type-check

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS |
| `npm run lint` | 0 errors (pre-existing warnings only; fixed new unused eslint-disable) |
| `npm run build` | PASS |

## 23. Screenshots

`docs/verification/preview-completion/screenshots/reference-prior-matrix/` — 18 reference copies from prior matrix. Fresh PC required set: **MANUAL_REQUIRED**.

## 24. Manual Safari results

**MANUAL_REQUIRED** — not executed in this agent session (no claim of VoiceOver/mic indicator pass).

## 25. External blockers (explicit)

1. Live Cloudflare Preview deploy + Access session proof
2. End-user authenticated broker mint (SF-1 remainder)
3. Live Supabase apply of 0008 + multi-user RLS/IDOR
4. Virus/malware scanning vendor
5. Resumable production object upload against real buckets
6. Legal counsel approval of Privacy/Terms/DMCA
7. Safari VoiceOver + mic hardware checklist
8. Monitoring vendor authorization

## 26. Rollback instructions

1. Discard uncommitted PC changes only with explicit human approval (do not run destructive git clean in this program).
2. To reverse 0008 after a future apply: drop `activity_events`, `messages`, `message_threads`, `storage_objects` in reverse order (see migration comments) — **only with ops approval**.
3. Feature flags: trust-tier gates are code-level; reverting Teams/AuthProvider restores prior device-local team gate (not recommended).

## 27. Known limitations

- Soft rate limit is in-memory per isolate (not global).
- Teams cloud gate still uses local drafts after cloud sign-in until org-os cloud APIs wired.
- Messages UI not a full production messenger.
- SF-1…SF-5 remain production blockers.
- Reference screenshots ≠ fresh Preview Completion proof.

## 28. Exact git status (summary)

- Branch: `preview/spatial-world-intelligence` @ `18a8c23…`
- Dirty: modified voice/auth/actions/i18n/intake/teams + package.json + broker tests
- Untracked: preview-completion docs, new libs, 0008 migration, new tests
- Pre-existing excluded verification artifacts still untracked

## 29. Explicit confirmations

- **no commit**
- **no push**
- **no deploy**
- **main untouched**
- **secrets not exposed** (`.dev.vars` / `.env.local` gitignored; doctor PASS without printing key values)
- **user data preserved** (no resets/cleans; migrations additive; unknown intake fields preserved)

---

## Human approval required next

Approve commit/push of Preview Completion changes, Safari checklist execution, and/or Preview deploy — separately.
