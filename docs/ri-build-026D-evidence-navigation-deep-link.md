# RI-BUILD-026D — Evidence Navigation Deep Link

## Summary

Adds a shareable URL for the selected node in the Evidence Navigation Explorer, mirroring the `?focus=` pattern from `ResearchNetwork.tsx` (RI-BUILD-024B).

## URL param

```
/research/workspace?topic={topicId}&node={nodeId}
```

- On page load, a valid `node` param auto-selects that node in the explorer.
- Invalid or unknown node IDs are ignored and the param is removed.
- Selecting a node (path panel or next-navigation panel) updates `node` without a full page reload.
- Switching the workspace topic resets selection to the new topic's root node and updates `node` to match.

## Click flow

```
Click node → Update selected node → Update node card + next navigation → Update URL (no page reload)
```

## Data

No changes to the Evidence Navigation model, query, or builder. Uses the existing `findNavigationNode` lookup to validate the `node` param against the current topic's path.

## Key files

**Modified**

- `components/research/evidence-navigation/EvidenceNavigationExplorer.tsx`

## Verification

```bash
npm run lint
npm run build
```

## Remaining issues

- Navigation graph is still star-shaped from the topic; sequential flow for non-root nodes still relies on suggested next steps (unchanged from RI-BUILD-026C).
- `node` is not cleared when the user navigates away from the workspace and back without the param — same load-once/write-through behavior as the `topic` param.
