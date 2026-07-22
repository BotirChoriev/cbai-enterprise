# Remaining imports / consumers outside canonical boundaries

Stage 1 documents these; it does **not** migrate or delete them.

## Quarantined (no live `app/` / `components/` imports found)

| Path | Status | Notes |
|------|--------|-------|
| `lib/intelligence/**` | QUARANTINE | Orphan engine; JSDoc markers on entry indexes |
| `lib/intelligence/evidence/**` | QUARANTINE | Duplicate of `/knowledge` evidence workspace |
| `lib/intelligence/graph/**` | QUARANTINE | Duplicate of `lib/graph` + LON |
| `lib/collaboration/**` | QUARANTINE growth | Zero component imports; provisional owner `lib/organization-os` |

## Live consumers that are **allowed** but not the long-term merge target

| Consumer | Imports | Boundary note |
|----------|---------|---------------|
| `components/genesis/**` | `lib/genesis/*` | MERGE later via `genesisToProjectAdapter` (stub not wired) |
| `components/my-work/MyWork.tsx` | genesis panels via progressive disclosure | Expert density only; Project remains `lib/project` |
| Research evidence stores | `lib/research/**` | Domain adapter; platform Evidence remains `/knowledge` |
| `/teams` drafts | `cbai-team-drafts` | Must bind to org-OS later (SF-2) |
| Messages / Files / Publications shells | PLACEHOLDER UI | No durable store owner yet |
| `lib/voice/*` (legacy helpers) | speech prefs / transcripts | Must not own navigation (platform-actions does) |

## Canonical consumers (in-boundary)

| Capability | Modules |
|------------|---------|
| Voice I/O | `lib/voice-operator`, `components/voice-operator` |
| Actions | `lib/platform-actions` |
| FDE confirmation | `lib/forward-deployed-engines`, `components/forward-deployed` |
| Missions | `lib/intelligence-os` (not `lib/intelligence`) |
| Projects | `lib/project` |
| Operational Objects | `lib/operational-objects` |
| Graph | `lib/graph`, LON, `components/graph` |
| Evidence UI | `components/evidence`, `lib/evidence-explorer.ts` → `/knowledge` |

## Dependency violations found in Stage 1 scan

**None** for orphan `@/lib/intelligence` imports from `app/`, `components/`, `lib/platform-actions`, `lib/voice-operator`, or FDE trees.

## Security blockers (unchanged — not bypassed)

SF-1 … SF-5 remain production blockers. See `../stage-0/15-security-gate-matrix.md` and `lib/canonical-contracts/trust.ts`.
