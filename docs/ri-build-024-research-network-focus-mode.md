# RI-BUILD-024 — Research Network Focus Mode

## Summary

Focus mode turns the Global Research Network into a usable research navigation tool. Clicking a topic node selects it, dims unrelated nodes and edges, and opens a glass focus panel with catalog metadata.

## Focus behavior

1. Click a node to select it (focus mode).
2. Selected node becomes visually dominant (larger radius, cyan glow).
3. Connected nodes stay bright.
4. Unrelated nodes fade.
5. Connected edges stay bright; focused edges use solid lines.
6. Unrelated edges fade.
7. Focus panel opens on the right (desktop) or below the graph (mobile layout stacks).

## Focus panel

Shows for the selected topic:

- Topic name and domain
- Shared methods (from catalog metadata)
- Shared evidence types (from catalog metadata)
- Related topics (catalog connections with connection type labels)
- Knowledge gaps (from existing gap query)
- Open topic → link

## Controls

- **Clear focus** — exit focus mode
- **Open topic** — navigate to topic detail page
- **Show all** — reset graph to full view

## Data sources

All data comes from existing catalog modules:

- Network builder and discovery metadata
- `getTopicDetailResearchGaps` for knowledge gaps
- No fake researchers, publications, experiments, or live databases

## Honest notice

Kept on the network section and focus panel:

> This network is built from catalog relationships only. It does not represent scientific proof.

Language avoids claims like scientific proof, AI discovered, strong connection, ranked, or score.

## Key files

**Created**

- `components/research/network/ResearchNetworkFocusPanel.tsx`
- `components/research/network/ResearchNetworkControls.tsx`

**Modified**

- `components/research/network/ResearchNetwork.tsx`
- `components/research/network/ResearchNode.tsx`
- `components/research/network/ResearchConnection.tsx`
- `components/research/network/ResearchMiniMap.tsx`
- `components/research/network/ResearchNetworkLegend.tsx`
- `lib/research/network/network-builder.ts`
- `lib/research/network/network-query.ts`

## Verification

```bash
npm run lint
npm run build
```

## Remaining issues

- No pan/zoom on the network graph
- Node labels only visible for active or connected nodes
- Focus panel does not update the URL (no deep link to focused topic)
