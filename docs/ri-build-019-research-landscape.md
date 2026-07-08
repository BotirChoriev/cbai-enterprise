# RI-BUILD-019 — Research Landscape Explorer

## Summary

Provides an integrated visual research landscape for a topic — center topic surrounded by evidence areas, related research objects, research gaps, and future workspace modules — using catalog data only.

## Landscape model

Each `ResearchLandscape` includes:

- `landscapeId`, `topicId`, `centerTopic`
- `domains`, `methods`, `evidenceTypes`, `futureObjects`, `relatedTopics`, `knowledgeGaps`, `modules`
- `humanReviewRequired`, `status`, `version`

Visual rings:

| Ring | Content |
|------|---------|
| Center | Research topic |
| First | Domain, methods, evidence types |
| Second | Related topics, knowledge gaps |
| Third | Future research objects, notebook, timeline, workspace |

## UI integration

| Surface | Placement |
|---------|-----------|
| Topic detail | After hero — primary one-screen overview |
| Workspace Explorer | Top of main column — updates with selected topic |

## Honest notice

> This landscape is built from catalog connections only. It does not represent scientific proof.

## Non-goals

- No world ranking or importance scores
- No scientific proof or AI analysis claims
- No live database connections

## Verification

```bash
npm run lint
npm run build
```
