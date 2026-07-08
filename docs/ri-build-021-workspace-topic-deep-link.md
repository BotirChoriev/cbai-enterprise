# RI-BUILD-021 — Workspace Topic Deep Link

## Summary

Fixes journey continuity from a research topic page to the Research Workspace with the same topic selected.

## Flow

```
/research/microbiology
  → Open workspace
/research/workspace?topic=microbiology
  → Workspace Explorer loads Microbiology
```

## Implementation

| Location | Change |
|----------|--------|
| `TopicQuickActions` | Open workspace links to `/research/workspace?topic={topicId}` |
| `ResearchWorkspaceHome` | Reads `topic` query param via `useSearchParams` |
| `WorkspaceExplorer` | Accepts `initialTopicId` and `showTopicNotFoundNotice` |
| `workspace/page.tsx` | Wraps home in `Suspense` for search param resolution |

## Invalid topic

If `?topic=` does not match the catalog, the workspace falls back to the default topic and shows:

> Selected topic was not found.

## Notes

- Static export requires client-side `useSearchParams` (no server `searchParams` at runtime).
- Topic switching inside the workspace does not update the URL (initial deep link only).

## Verification

```bash
npm run lint
npm run build
```
