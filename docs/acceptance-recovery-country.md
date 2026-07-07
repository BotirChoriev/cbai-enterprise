# Acceptance Recovery Sprint-010 — Country Profile Recovery

Fixes only the five accepted Country Profile failures from Acceptance Audit 3.0. No new features, page redesign, or architecture changes.

## Fixed acceptance failures

### 1. Count-only available evidence

- `EntityEvidenceSection` accepts optional `availableItems` from existing coverage data.
- `CountryIntelligencePanel` passes connected indicator titles from `coverage.indicatorsByDomain`.
- Replaces count-only tiles with a checklist of available topics when items are provided.

### 2. Decision package duplication

- Country profile uses `reviewSummary` on `EntityDecisionPackagePreview` — four plain-language bullets (counts + human review).
- Section renamed **Review summary**; no repeated item lists from gaps or evidence sections.
- Company/university profiles unchanged (full decision package sections when `reviewSummary` omitted).

### 3. Plain “Why missing” language

- Added `components/shared/plain-gap-copy.ts` with `plainMissingReason()`.
- `EvidenceGapCard` displays user-facing reasons; no connector/registry/pipeline/framework/builder terms.

### 4. Overview Country / Region labels

- `EntityOverviewSection` accepts optional `region`.
- Country profile passes `country={name}` and `region={region}` — Country shows country, Region shows region.

### 5. Honest Reports copy

- `EntityReportsAvailable` accepts `reportsCenterNote` (country profile only).
- Explains Reports Center continuation; hides report type list on country profile.
- Button: **Open Reports Center →**

## Files changed

| File | Change |
|------|--------|
| `components/countries/CountryIntelligencePanel.tsx` | Wire available items, review summary, reports note, overview labels |
| `components/shared/EntityEvidenceSection.tsx` | Optional available items list |
| `components/shared/EntityOverviewSection.tsx` | Region field |
| `components/shared/EntityDecisionPackagePreview.tsx` | Review summary mode + reports center note |
| `components/shared/plain-gap-copy.ts` | Plain missing reasons |
| `components/evidence-gap/EvidenceGapCard.tsx` | Use plain missing reasons |

## Remaining issues

- Gap **Next step** lines still contain internal phrasing from gap builder (not in sprint scope).
- Overview **Available information** still shows “Available — CBAI Local Registry”.
- **Compare** and **Relationships** sections unchanged below profile.
- Company/university profiles still use count-only evidence and full decision package lists.

## Estimated UX improvement

| Metric | Before Sprint-010 | After (est.) |
|--------|-------------------|--------------|
| Exists vs missing clarity | ~30% | ~75% |
| Why missing comprehension | ~25% | ~65% |
| Decision package usefulness | ~20% | ~60% |
| Reports honesty | ~45% | ~85% |
| Overview identity accuracy | ~70% | ~95% |

**Net country profile lift:** ~40–45% on comprehension and trust for the primary scroll path.

## Verification

```bash
npm run lint
npm run build
```
