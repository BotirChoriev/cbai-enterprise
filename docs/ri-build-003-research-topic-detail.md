# RI-BUILD-003 — Research Topic Detail Page

## Summary

Adds a read-only detail page for each research topic in the static catalog from RI-BUILD-002.

## Route

- `/research/[topicId]` — e.g. `/research/microbiology`, `/research/antibiotic-resistance`
- Static export: `generateStaticParams()` pre-generates all 67 topic pages from `RESEARCH_TOPICS`.

## Page structure

1. **Hero** — topic name, domain, description, status badge
2. **Overview** — catalog profile context and human review note
3. **Methods** — related methods from catalog
4. **Evidence types** — evidence map from catalog (not connected yet)
5. **Workspace status** — available today vs future workspace description
6. **Limitations** — honestly lists what is not connected
7. **Next steps** — future workspace capabilities (not active)

## Data source

- `lib/research/research-topics.ts` only
- Helpers: `getResearchTopicById()`, `getResearchTopicPath()`
- Constants: `RESEARCH_TOPIC_AVAILABLE_TODAY`, `RESEARCH_TOPIC_NOT_AVAILABLE_YET`, `RESEARCH_TOPIC_FUTURE_SUPPORTS`

## Not included

- No fake researchers, experiments, publications, metrics, collaboration, or chat
- No live database connections

## 404

Unknown `topicId` triggers `notFound()` with `not-found.tsx` linking back to `/research`.

## Routing from catalog

`ResearchTopicCard` links to `/research/{topicId}` via `getResearchTopicPath()`.

## Copy rules

Plain language; avoid hype terms. Use: research topic, available catalog information, not connected yet, future workspace, human review.
