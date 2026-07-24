# Auth-Aware Collaborative Voice OS — Architecture Decisions (P0)

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Working tree (start):** 209 paths (137 modified, 72 untracked, 0 staged)

## Diagnosed navigation root cause

Ranked causes of “recognized but does not execute”:

1. **Realtime tool + `user_statement`** re-runs text orchestrator and **never applies** the validated tool `href` (`VoiceOperatorProvider` tool handler).
2. **`applyPlatformActionResult`** returns early on `engineStart` / `mutation` and **skips** companion `navigation.href`.
3. **Pathname `useEffect` teardown** disconnects Realtime immediately after `router.push` (prior Voice Operating Navigator policy) — session dies on every successful nav.

No guest auth gate currently blocks navigation.

## Design decisions (3 options → select one)

### D1 — Action Registry

| Option | Clarity | Consistency | Safety | Maintain | Compat | Total |
|--------|---------|-------------|--------|----------|--------|-------|
| **A. Facade over existing `platform-actions` + voice orchestrator** | 10 | 10 | 10 | 10 | 10 | **50** |
| B. New parallel registry | 6 | 2 | 5 | 3 | 4 | 20 |
| C. Hardcode in Dock | 3 | 1 | 2 | 2 | 5 | 13 |

**Selected: A** — map `navigate|search|open_object|prepare_upload|create_draft|create_team|invite_member|share_object|prepare_publication` onto allowlisted platform action IDs; never invent a second pipeline.

### D2 — Voice session across internal navigation

| Option | Clarity | Safety | UX | Compat | Total |
|--------|---------|--------|-----|--------|-------|
| **A. Survive client-side `router.push`; teardown only Stop/Close/End/logout/unload/unmount/fatal** | 10 | 9 | 10 | 9 | **38** |
| B. Teardown on every pathname change | 7 | 10 | 3 | 6 | 26 |
| C. Remount provider per route | 2 | 4 | 2 | 3 | 11 |

**Selected: A** — overrides prior Operating Navigator D4 for this P0; Provider already mounts once in dashboard layout.

### D3 — Guest protected actions

| Option | Clarity | Safety | Auth UX | Total |
|--------|---------|--------|---------|-------|
| **A. Explain → consent → open `/account` with pending intent (no file retention)** | 10 | 10 | 10 | **30** |
| B. Silent redirect to account | 4 | 6 | 5 | 15 |
| C. Auto-register | 2 | 1 | 1 | 4 |

**Selected: A**

### D4 — Scientific intake persistence

| Option | Honesty | Safety | Compat | Total |
|--------|---------|--------|--------|-------|
| **A. Draft card + queued ingestion contract; never fake ready** | 10 | 10 | 9 | **29** |
| B. Fake instantaneous OCR complete | 1 | 2 | 5 | 8 |
| C. Only link to Research Canvas upload | 5 | 7 | 6 | 18 |

**Selected: A**

### D5 — Team / publication

| Option | Consistency | Scope control | Total |
|--------|-------------|---------------|-------|
| **A. Extend organization-os + research publication types; confirmation-gated UI** | 10 | 9 | **19** |
| B. New Slack-like stack | 3 | 2 | 5 |
| C. Skip and document only | 4 | 8 | 12 |

**Selected: A** — honest empty/queued states where backend unavailable.
