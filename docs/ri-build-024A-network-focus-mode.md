# RI-BUILD-024A — Research Network Focus Mode

## Summary

Focus mode turns the Global Research Network into an exploration tool. Clicking a topic node updates the focus panel and highlights the graph without a page reload.

## Focus behavior

- Selected node becomes larger with a cyan glow.
- Directly connected nodes remain bright.
- Other nodes fade to ~30% opacity.
- Connected edges remain visible; other edges fade.
- 250ms transitions throughout.

## Focus panel

Displays:

- Topic name
- Domain
- Methods (catalog metadata)
- Evidence types (catalog metadata)
- Related topics (max 6, clickable to shift focus)
- **Open topic →** — navigates to topic detail
- **Clear focus** — resets the graph

## Click flow

```
Click node → Update focus panel → Highlight network (no page reload)
```

## Notice

Single notice on the network section:

> This network represents catalog relationships. It does not represent scientific proof.

## Key files

**Created**

- `components/research/network/ResearchNetworkFocusPanel.tsx`

**Modified**

- `components/research/network/ResearchNetwork.tsx`
- `components/research/network/ResearchNode.tsx`
- `components/research/network/ResearchConnection.tsx`

## Data

Uses only the existing Global Research Network catalog — no fake entities, live databases, or new research features.

## Verification

```bash
npm run lint
npm run build
```

## Remaining issues

- No pan/zoom on the graph.
- Focus mode does not update the URL.
- Node labels only appear for the selected topic and its direct connections.
