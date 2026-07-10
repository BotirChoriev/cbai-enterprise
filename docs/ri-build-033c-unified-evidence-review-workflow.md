# RI-BUILD-033C — Unified Research Evidence Review Workflow

## Summary

Connects the existing Research Topic, Evidence, and Review foundations into one compact,
readable workflow embedded in the topic detail page:

```
Research Topic → Available Evidence → Selected Evidence → Review Status → Next Research Action
```

No new domain module, no new route, no database, no API, and no fabricated researchers,
publications, experiments, institutions, or scientific conclusions.

## Data

`buildTopicEvidenceReview(topicId)` is a pure function that:

- Resolves the topic from the single canonical catalog (`lib/research/research-topics.ts`).
- Turns `topic.relatedEvidenceTypes` into a small list of catalog evidence items — labels
  only, never live evidence records.
- Derives each item's status (`catalog_available` / `source_not_connected` /
  `human_review_required`) directly from the topic's own real `status` field — no invented
  variety, no fabricated per-item data.
- Always reports `reviewOpened: false` and `humanReviewRequired: true`, since no review object
  exists for any catalog topic today.
- Returns real catalog text (`topic.futureWorkspace`) as one of the next actions, alongside
  generic honest guidance.

## UI

`TopicEvidenceReviewWorkflow` is a server-rendered, read-only component (no `"use client"`, no
interactivity) with three columns: available evidence (left), selected evidence detail (main),
review readiness and next research action (right). The first evidence item is always the
selected one — there is no client-side selection state, keeping the component server-first.

## Copy

Uses: Catalog evidence, Source not connected, Human scientific review required, Available topic
information, Future evidence connection, Next research action.

Avoids: Proven, Confirmed discovery, Best method, AI conclusion, Verified publication, Live
researcher, Real-time evidence.

## Key files

**Created**

- `lib/research/evidence/evidence-topic-builder.ts`
- `components/research/topic/TopicEvidenceReviewWorkflow.tsx`
- `docs/ri-build-033c-unified-evidence-review-workflow.md`

**Modified**

- `lib/research/evidence/index.ts` — re-exports the new builder.
- `components/research/topic/ResearchTopicDetail.tsx` — renders the unified workflow between
  the at-a-glance insights panel and the research landscape graph.
- `components/research/topic/TopicSectionTabs.tsx` — removed `ResearchTopicEvidenceMap` from the
  Overview tab; its job (listing `relatedEvidenceTypes` as "not connected yet" cards) is now
  superseded by the unified workflow's evidence list. `ResearchTopicEvidenceMap.tsx` itself was
  left in place, unused, rather than deleted — it's a self-contained component that may be
  reused later. `ResearchEvidenceReadiness` (Publications/Experiments/Laboratories layer
  readiness) was left untouched — different scope, not a duplicate.

## Verification

```bash
npm run lint
npm run build
```

## Remaining issues

- `evidenceItems[0]` is always the selected evidence — there's no way to select a different
  category without client-side state, which was intentionally left out to keep this a
  server-first component. A future build could add `?evidence=` URL-param selection, mirroring
  the pattern already used for `?node=` in the Evidence Navigation Explorer.
- The per-item status is a topic-wide derivation (one status shared by all evidence categories
  under a topic), not an independently tracked status per category — there's no real data to
  vary it further without fabricating something.
