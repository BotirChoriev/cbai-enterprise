# RI-BUILD-024B — Research Network Pan/Zoom + Focus URL

## Summary

Adds pan, zoom, and shareable focus URLs to the Global Research Network without new research data or external graph libraries.

## Pan and zoom

- **Zoom in** / **Zoom out** — adjusts SVG viewBox scale (0.6×–2.5×).
- **Reset view** — returns pan and zoom to the default full-network view.
- **Desktop pan** — drag the graph background to move the view.
- **Mobile** — horizontal and vertical scroll on the graph container as a fallback.

Stroke widths stay readable during zoom via `vectorEffect="non-scaling-stroke"` on nodes and edges.

## Focus URL

When a topic is focused:

```
/research?focus={topicId}
```

- On page load, a valid `focus` param auto-focuses that node and opens the focus panel.
- Invalid or unknown topic IDs are ignored and the param is removed.
- **Clear focus** removes the `focus` query param.

## Click flow

```
Click node → Update focus panel → Highlight network → Update URL (no page reload)
```

## Copy

Uses: Focused topic, Reset view, Catalog connection.

Avoids: state engine, router sync, graph algorithm, scientific proof.

## Notice

> This network represents catalog relationships. It does not represent scientific proof.

## Key files

**Created**

- `components/research/network/ResearchNetworkZoomControls.tsx`

**Modified**

- `components/research/network/ResearchNetwork.tsx`
- `components/research/network/ResearchNode.tsx`
- `components/research/network/ResearchConnection.tsx`

## Verification

```bash
npm run lint
npm run build
```

## Remaining issues

- Mini map does not reflect current pan/zoom viewport.
- No pinch-to-zoom on mobile (scroll fallback only).
- Reset view does not clear topic focus.
