# Design decisions — Preview Completion Program

Scoring 1–10: architectural consistency, security, privacy, accessibility, maintainability, migration risk (higher=safer), user clarity, performance.

## DD-PC-001 Voice navigation reliability + SF-1 partial

**Root cause:** Realtime `tool_choice: auto` allows speech without `execute_platform_action`; vague “open page” fails aliases; broker allows body-only Origin spoof.

| Option | Total | Notes |
|--------|------:|-------|
| A Client nav harden only | 61 | Leaves SF-1 hole |
| **B Nav harden + require Origin + soft rate limit** | **63** | Chosen |
| C Full user-auth mint + forced tools | 51 | Exceeds freeze / couples unfinished cloud auth |

**Chosen: B.** Keep SF-1 `productionBlocker: true` until end-user mint auth exists. No second action system.

## DD-PC-002 Trust tiers for collaboration

**Root cause:** `isSignedIn` is device-local-only; cloud-only sessions treated as guests for teams/intake; device-local used as team authority (SF-2).

| Option | Notes |
|--------|-------|
| **A Unify gates on accountMode / cloud for shared features; device-local = personal only** | Chosen |
| B Keep device-local as team authority | Reject — SF-2 |
| C New auth product | Reject — second auth |

## DD-PC-003 Object storage for scientific intake

| Option | Notes |
|--------|-------|
| **A Metadata + object reference; blobs via Supabase Storage when cloud; never localStorage bytes** | Chosen |
| B Store PDF in localStorage/IndexedDB | Reject |
| C Separate S3 + custom auth | Reject |

Live bucket apply without credentials → **EXTERNAL_BLOCKED**.

## DD-PC-004 Teams / messages

| Option | Notes |
|--------|-------|
| **A organization-os ownership; mission-anchored discussion; migrate team drafts** | Chosen |
| B Grow lib/collaboration | Reject — quarantine |
| C Chat microservice | Reject |

Full multi-user messaging without live Supabase → partial local + **EXTERNAL_BLOCKED** for cross-device.

## DD-PC-005 Stage 2 consolidation style

| Option | Notes |
|--------|-------|
| **A Reversible adapter slices; no deletions** | Chosen |
| B Big-bang rewrite | Reject |
| C Delete lib/intelligence now | Reject — needs separate approval |

## DD-PC-006 Visibility

Canonical enum: `private` | `team` | `public`. Default private. Public requires confirmation + rights (SF-5). Server enforcement when cloud configured; local Mode honest labels.
