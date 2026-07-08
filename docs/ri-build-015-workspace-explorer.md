# RI-BUILD-015 — Research Workspace Explorer

## Summary

Transforms `/research/workspace` from a vertical foundation shell into a three-column **evidence navigation** environment. Users select one research topic and explore catalog-backed notebook, timeline, graph, and future knowledge perspectives without live evidence or fake records.

## Layout

| Column | Content |
|--------|---------|
| **Left** | Research topics list, filter/search, current selection |
| **Center** | Knowledge summary, evidence overview, notebook/timeline/graph previews, future knowledge |
| **Right** | Workspace status, human review notice, available today, future workspace |

## Data sources (catalog only)

- `RESEARCH_TOPICS` — topic selector
- `getResearchNotebookForTopicObject` — notebook preview
- `getKnowledgeTimelineForTopicObject` — timeline preview (first 4 stages)
- `getResearchGraphForTopicObject` — compact graph preview
- Publication / experiment / laboratory / researcher readiness layers — evidence status only
- Open questions & negative results — future knowledge panels

## Key files

- `lib/research/workspace/workspace-explorer.ts` — aggregates explorer context per topic
- `components/research/workspace/WorkspaceExplorer.tsx` — client shell + topic state
- `components/research/workspace/WorkspaceSidebar.tsx` — topic navigation
- `components/research/workspace/WorkspaceContent.tsx` — center column orchestration
- `components/research/workspace/WorkspaceKnowledgeSummary.tsx`
- `components/research/workspace/WorkspaceEvidenceOverview.tsx`
- `components/research/workspace/WorkspaceTopicNavigator.tsx`

## Status labels

All surfaces use honest readiness copy:

- **Catalog available** — notebook, timeline, graph (derived from catalog)
- **Not connected yet** — live publications, experiments, laboratories, researchers
- **Future workspace** — modules and integrations not active today

## Non-goals

- No collaboration, chat, task tracking, or project management
- No fake researchers, publications, or experiments
- No live database connections

## Verification

```bash
npm run lint
npm run build
```
