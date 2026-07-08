# RI-BUILD-020 — Research Topic Experience 2.0

## Summary

UX-only refactor of the research topic detail page. No new features, data models, or readiness layers.

## New page flow

1. Hero
2. Single platform notice
3. Quick overview + quick actions
4. Insights panel (4 cards)
5. Knowledge landscape (embedded, no duplicate notices)
6. Tabbed workspace (Overview · Notebook · Graph · Timeline · Evidence)
7. Research gaps
8. Future workspace

## New components

- `TopicQuickOverview` — topic, domain, methods, evidence, related topics, status, human review
- `TopicQuickActions` — open workspace, explore related, view graph, review notebook
- `TopicInsightsPanel` — available today, future evidence, gaps, open questions
- `TopicSectionTabs` — single visible section at a time, default Overview

## Embedded mode

Notebook, timeline, graph, and landscape panels support `embedded` to hide duplicate headers and notices when shown inside tabs or the consolidated page.

## Removed from main scroll

- Stacked notebook → timeline → graph sequence
- Duplicate workspace status, method comparison, entity model, limitations, and repeated discovery sections
- Multiple catalog and human review notices (one notice near top)

## Verification

```bash
npm run lint
npm run build
```
