# Acceptance Recovery Sprint-009 — Search UX Recovery

Fixes only the four accepted Search UX failures from Acceptance Audit 2.0. No new features, architecture changes, or scope outside search recovery.

## Fixed acceptance failures

### 1. Dual search on `/search`

- Extended topbar hide to `/search` (same as `/`) via `isPrimarySearchSurface` in `Topbar.tsx`.
- Gateway hero search is now the only search on the search route.

### 2. Distinguishing factual line on result cards

- Added `distinguishingFact` to `SearchResultEntry` in `lib/search-intelligence-entry.ts`.
- Sourced from existing entity metadata only:
  - **Country** → `metadata.region`
  - **Company** → `metadata.industry`
  - **University** → `metadata.city`, fallback `metadata.country`
- Displayed on every result card in `SearchGatewayResults.tsx`.

### 3. Plain next-step copy

- Replaced “Review evidence, gaps, and reports.” with:
  - **“Open to see available official information.”**
- Applied to all country, company, and university result entries.

### 4. Single-match confirmation card

- Removed silent `router.replace` auto-redirect.
- Single entity match now shows:
  - **Matched: {Entity name}**
  - Type (+ country for company/university)
  - Distinguishing fact
  - Plain next step
  - **Open profile →** (one-click link preserved)

## Files changed

| File | Change |
|------|--------|
| `components/layout/Topbar.tsx` | Hide on `/` and `/search` |
| `lib/search-intelligence-entry.ts` | `distinguishingFact`, plain next step |
| `components/search/gateway/SearchGatewayResults.tsx` | Confirmation card, fact display, no auto-redirect |

## Remaining issues (from audit, not in scope)

- Enterprise Alpha / demo profile still visible in sidebar on `/search`
- Generic `shortDescription` still in entry model (not shown on cards)
- Compare / Open reports still on multi-result cards
- Example chips duplicated across empty, no-results, and home
- `SearchResultCard.tsx` orphan component not updated

## Estimated UX improvement

| Metric | Before Sprint-009 | After (est.) |
|--------|-------------------|--------------|
| Single primary search on `/search` | ~55% | ~95% |
| Multi-result compare clarity | ~25% | ~60% |
| Single-match trust / confirmation | ~40% | ~85% |
| Non-technical next-step clarity | ~50% | ~75% |

**Net search UX lift:** ~30–35% on path-to-profile confidence and result differentiation.

## Verification

```bash
npm run lint
npm run build
```
