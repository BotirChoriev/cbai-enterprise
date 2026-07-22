# Auth-Aware Collaborative Voice OS — FINAL REPORT

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690` (unchanged)
**Date:** 2026-07-21

## 1. Branch and HEAD

- Exact branch: `preview/spatial-world-intelligence`
- Exact HEAD: `2d1558995f355a899100a6ca15c7d924e913c690`
- `main` not checked out / not modified

## 2. Diagnosed navigation root cause

Three concrete causes (fixed in this P0):

1. **Realtime tool + `user_statement`** re-ran text orchestrator and **ignored** validated tool `action_id`/`href`.
2. **`applyPlatformActionResult`** returned early on `engineStart`/`mutation` and **skipped** companion `navigation.href`.
3. **Pathname `useEffect` teardown** disconnected Realtime immediately after every `router.push` (prior Operating Navigator policy).

No guest auth gate previously blocked public navigation.

## 3. Action Registry architecture

- Facade: `lib/platform-actions/action-registry.ts` maps OS actions
  (`navigate|search|open_object|prepare_upload|create_draft|create_team|invite_member|share_object|prepare_publication`) onto existing `platform-actions` IDs.
- Typed transcripts, browser STT finals, and Realtime tools share:
  - allowlisted registry
  - `resolvePlatformActionFromIntent`
  - `applyPlatformActionResult`
  - `isAllowedNavigationHref` / `validateNavigationHref`
- Arbitrary URLs and unknown actions rejected.

## 4. Voice lifecycle behavior

- Voice Operator remains mounted once in `app/(dashboard)/layout.tsx`.
- **Internal navigation no longer tears down** Realtime/mic.
- Release only on Stop / Close / End session / unmount / fatal failure / logout path via `releaseLiveAudioResources`.
- Duplicate-connect and stale-generation gates preserved.
- Tool calls now apply validated `action_id` through `applyPlatformActionResult` and announce outcomes.

## 5. Auth / guest rules

- Scopes: guest / personal / team (`lib/voice-operator/auth-action-policy.ts`).
- Guests may navigate/search/identity FAQ.
- Guests cannot upload, draft-save, create teams, invite, share private, or publish.
- Protected actions: explain → pending intent (no file bytes) → `/account?resume=pending` after consent path.
- No auto-register / auto-create account.

## 6. Scientific intake design

- Route: `/scientific-documents`
- Draft card + metadata; confirm → `queued_pending` only (never fake `ready`).
- Contract steps documented in `lib/scientific-intake/scientific-intake.ts`.
- Voice: “400-page PhD…” → `scientific_intake.compose` → guest gate or `?prepare=1` surface.

## 7. Team model

- Route: `/teams`
- Roles called out: owner, admin, researcher, reviewer, viewer.
- Create requires confirmation; local team records only; sharing ≠ public publish.

## 8. Publication model

- Route: `/publications`
- States: `private_draft → team_review → publication_ready → public`
- Requires authorship, privacy review, license, version, final human approve.
- CBAI never auto-publishes.

## 9. Accessibility

- Semantic shells, labeled forms, `aria-live` status regions, min 44px controls, keyboard-focusable links.
- Voice capabilities mirrored by typed/keyboard paths and page UIs.
- Full Safari a11y pass remains manual.

## 10. Localization

- EN/UZ/RU/TR: `authCollab.*`, new `platformAction.*` / `voiceCommand.*` keys.
- User document titles/messages not auto-translated; `contentLocale` stored on intake records.

## 11. Tests and screenshots

| Suite | Result |
|-------|--------|
| `test:auth-collaboration-voice-os` | **16/16** |
| `test:voice-command-orchestrator` | **19/19** |
| `test:voice-operating-navigator` | **18/18** |
| `test:voice-operator` | **55/55** |
| `test:voice-session-lifecycle` | **11/11** |
| `test:voice-platform-operator` | **31/31** |
| `test:voice-session-broker` | **18/18** |
| `test:operational-objects` | **9/9** |
| `test:command-pipeline` | **6/6** |
| `test:composer` | **4/4** |
| `test:locale-completeness` | **16/16** |
| `test:localization-closure` | **12/12** |
| `test:spatial-world-intelligence` | **15/15** |
| `test:final-product-completion` | **23/23** |
| `tsc --noEmit` | **pass** |
| `lint` | **0 errors** (pre-existing warnings) |
| `npm run build` | **pass** (new routes present) |

Screenshots: `docs/verification/auth-collaboration-voice-os/` (`01`–`12` + `capture-log.json`).
Live Safari Realtime + full sign-in resume: **EXTERNAL_BLOCKED** when broker/credentials unavailable (static capture).

## 12. Changed-file counts

| Moment | Porcelain |
|--------|-----------|
| Start | 209 |
| End | **225** |

HEAD unchanged. Dirty tree preserved (prior work retained).

### Primary new/updated surfaces

- `lib/platform-actions/action-registry.ts`, `apply-platform-action.ts`, `registry.ts`, `types.ts`, `resolve-platform-action.ts`
- `lib/voice-operator/auth-action-policy.ts`, provider/executor/resolver/policy/registry/instructions
- `lib/scientific-intake/scientific-intake.ts`
- Workspace routes: `/workspace`, `/scientific-documents`, `/files`, `/teams`, `/messages`, `/notifications`, `/publications`
- `lib/i18n/platform-copy-auth-collab.ts` + dictionary wiring
- `scripts/test-auth-collaboration-voice-os.ts`, `verify-auth-collaboration-voice-os-ui.mjs`
- `docs/architecture/auth-collaboration-voice-os-decisions.md`

## 13. Known / external limitations

1. Live Safari Realtime spoken verification needs working broker origin + credentials (**EXTERNAL_BLOCKED** in static capture).
2. Ingestion backend (OCR/malware/chunking) not connected — honest `queued_pending` only.
3. Teams/messages/notifications are device-local / empty-honest; full multi-user Supabase collab still capability-gated.
4. Pending-intent resume after sign-in stores safe metadata only; UI resume automation is minimal (`/account?resume=pending`).
5. Meeting transcripts/translation extension points are structural (roles/copy), not a full realtime meeting product.

## 14. Git status

- Branch: `preview/spatial-world-intelligence`
- HEAD: `2d1558995f355a899100a6ca15c7d924e913c690`
- Working tree dirty: **225** paths; **0 staged commits created**

## 15. Explicit confirmations

- **no commit**
- **no push**
- **no deploy**
- **main untouched**
- **secrets not exposed**
- **user data preserved**

---

**STOP FOR MANUAL SAFARI AND AUTHENTICATION APPROVAL.** Do not commit or push until approved.
