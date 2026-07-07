# Acceptance Recovery Sprint-011 — Shared Entity Component Recovery

Applies accepted Country profile fixes to all entity profiles through shared components. No new features, architecture, or duplicated panel logic.

## Shared components updated

| Component | Change |
|-----------|--------|
| `entity-profile-copy.ts` | **New** — `plainAvailableInformation`, `getConnectedAvailableItems`, `countConnectedSources`, `buildEntityReviewSummary` |
| `plain-gap-copy.ts` | Added `plainGapNextStep()` |
| `EntityOverviewSection` | Plain available-information label; **Available evidence →** next step |
| `EntityEvidenceSection` | Title **Available information**; list mode when `availableItems` passed |
| `EntityDecisionPackagePreview` | Review summary only (removed duplicated evidence lists); requires `reviewSummary` |
| `EntityReportsAvailable` | Reports Center honesty for all entity types via `entityLabel` |
| `EvidenceGapCard` | Plain **Why missing** and **Next step** |
| `EvidenceGapPanel` | **Review summary →** next-step label |
| `EntityCompareSection` | Plain compare description |

## Country

- Uses shared `entity-profile-copy` helpers (no local duplication).
- Overview, available information list, review summary, gap copy, Reports Center note unchanged in behavior.

## Company

- Connected topic list from `coverage.indicatorsByDomain`.
- Review summary via `buildEntityReviewSummary`.
- Overview shows **Official information available.**
- Reports Center honesty (`entityLabel="company"`).

## University

- Same shared pattern as Company.
- Reports Center honesty (`entityLabel="university"`).

## Remaining issues

- Gap card **topic titles** still use framework indicator names from data layer.
- **Compare** and **Relationships** sections unchanged on list pages.
- Intelligence `sourceLabel` strings unchanged in lib (mapped at display only).
- `EvidenceGapSummary` / methodology blocks still contain internal copy if enabled elsewhere.

## Verification

```bash
npm run lint
npm run build
```
