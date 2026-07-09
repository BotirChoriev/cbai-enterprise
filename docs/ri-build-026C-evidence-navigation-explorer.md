# RI-BUILD-026C — Evidence Navigation Explorer

## Summary

First visual evidence navigation experience inside the Research Workspace. Users follow a catalog-defined research path from topic through methods, evidence types, gaps, questions, negative results, and workspace.

## Layout

| Left | Center | Right |
|------|--------|-------|
| Navigation path | Selected node card | Next navigation |

## Node card

- Title
- Type
- Status (Catalog Available, Not Connected Yet, Future Workspace, Human Review Required)
- Human review
- Next connections

## Flow

```
Research Topic
↓ Methods
↓ Evidence Types
↓ Knowledge Gaps
↓ Open Questions
↓ Negative Results
↓ Research Workspace
```

## Data

Uses only the existing Evidence Navigation model (`buildEvidenceNavigationForTopic`). No fake publications, researchers, experiments, chat, or live databases.

## Key files

**Created**

- `components/research/evidence-navigation/EvidenceNavigationExplorer.tsx`
- `components/research/evidence-navigation/EvidenceNavigationNode.tsx`
- `components/research/evidence-navigation/EvidenceNavigationPath.tsx`
- `components/research/evidence-navigation/EvidenceNavigationSidebar.tsx`

**Modified**

- `components/research/workspace/WorkspaceExplorer.tsx`
- `lib/research/evidence-navigation/index.ts`

## Verification

```bash
npm run lint
npm run build
```

## Remaining issues

- Navigation graph is star-shaped from topic; sequential flow uses suggested next steps for non-root nodes.
- No URL deep link for selected navigation node.
