# RI-BUILD-023 — Global Research Network Foundation

## Summary

First-generation Global Research Network visualizing all 64 catalog research topics as nodes with metadata-only connections. Pure React + SVG — no external graph libraries, no social features, no live data.

## Network model

Each node includes `nodeId`, `topicId`, `domain`, `relatedTopics`, `sharedMethods`, `sharedEvidence`, and `status`.

Connection types: `shared_domain`, `shared_method`, `shared_evidence`, `future_workspace`.

## UI

- Full-width interactive SVG network on `/research`
- Top panel: topic count, connection count, human review required
- Bottom panel: legend, node types, connection types, honest notice
- Hover highlights connected nodes; click opens topic page
- Mini map overlay for orientation

## Key files

- `lib/research/network/network-builder.ts`
- `components/research/network/ResearchNetwork.tsx`
- `components/research/network/ResearchNode.tsx`
- `components/research/network/ResearchConnection.tsx`

## Non-goals

- No researchers, publications, experiments, chat, or collaboration
- Not scientific proof — catalog relationships only

## Verification

```bash
npm run lint
npm run build
```
