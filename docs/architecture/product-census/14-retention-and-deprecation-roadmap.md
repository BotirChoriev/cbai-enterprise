# Retention and deprecation roadmap

**No deletions in this census.** DELETE_CANDIDATE means nomination only.

## Retention classes

| Class | Examples | Policy |
|-------|----------|--------|
| User work product | projects, missions, OO, research notes, reports, intake metadata | Retain until user deletion/export; legal hold overrides |
| Org/collaboration | memberships, invitations, audits | Retain for accountability; soft-delete with audit |
| Device-local auth | `cbai-auth-users` | User-controlled; migrate to cloud before deprecating local |
| Ephemeral voice | Realtime session | Do not retain audio by default; transcript retention opt-in only |
| Verification artifacts | `docs/verification/**` screenshots | Keep as baselines; mark drift |
| Historic build docs | `docs/build-*.md` | ARCHIVE — readable, not authoritative |
| Orphan code | `lib/intelligence/**` | QUARANTINE → later ARCHIVE after extract-useful review |
| Orphan UI | GraphPersonas etc. | DELETE_CANDIDATE after approval |
| Placeholder routes | files/messages/notifications | KEEP routes; replace guts Stages 3–5 |

## Deprecation sequence (after human approval)

1. **Document freeze** (this census) — done as docs only.
2. **Mark quarantine** in code owners / AGENTS notes (future) — do not delete.
3. **Stop new imports** into quarantined trees (lint/boundary rule — Stage 2).
4. **Dual-read migrations** for MERGE families (evidence, search, genesis→project).
5. **Redirect legacy routes** (`/analytics`→`/reports`, `/ai-control`→`/governance`) after UX approval.
6. **Archive build reports** under `docs/archive/builds/` (move, don’t destroy).
7. **DELETE_CANDIDATE sweep** only with explicit approval + backup proof.

## Data preservation guarantees

- Never rewrite user text for “cleanup.”
- Never drop unknown fields.
- Collaboration/genesis keys remain readable even if UI quarantined.
- Supabase migrations remain idempotent additive.
