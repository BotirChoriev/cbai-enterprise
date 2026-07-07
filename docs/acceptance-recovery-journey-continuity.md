# Acceptance Recovery Sprint 012 — Journey Continuity

**Goal:** Preserve existing user context across the profile → Reports Center journey. Display-level changes only.

**Constraints:** No new features, framework layers, or architecture. Platform Context + URL params only.

---

## Changes

### 1. Entity context carried into Reports Center

- `EntityReportsAvailable` now builds its link with `buildContextualHref("/analytics", context)` from Platform Context.
- Country, company, and university URL params (`?country=`, `?company=`, `?university=`, `?q=`) are preserved when opening Reports Center from a profile.

### 2. Reports Center continuation header

- When `getPrimaryEntity(context)` returns an entity, Reports Center displays:
  - **Continuing review for**
  - **{Entity name}** (H1)
  - Subtitle: “Your profile review continues here — choose a report type below.”
  - **← Back to profile** link to the entity module with context preserved.
- When no entity is in context, Reports Center header is unchanged from before.

### 3. Removed duplicated Review Summary

- Removed `EntityDecisionPackagePreview` from country, company, and university intelligence panels.
- Missing information section now links directly to **Reports →** (`#reports`).
- Available/missing/source counts are shown once on the profile; Reports continues the journey instead of restarting with a summary.

### 4. Compare and Relationships as optional exploration

- Added `EntityOptionalExploration` — collapsed `<details>` block labeled “Optional exploration”.
- **Compare** moved inside optional exploration on all entity panels (after Reports).
- **Relationships** moved inside optional exploration on countries, companies, and universities pages.
- Journey end is visually **Reports**; Compare and Relationships do not appear until expanded.

---

## Files touched

| File | Change |
|------|--------|
| `components/reports/ReportsCenter.tsx` | Entity continuation header + back link |
| `components/shared/EntityDecisionPackagePreview.tsx` | Context-aware Reports link only |
| `components/shared/EntityOptionalExploration.tsx` | New collapsed optional section |
| `components/evidence-gap/EvidenceGapPanel.tsx` | Default next step → Reports |
| `components/countries/CountryIntelligencePanel.tsx` | Remove review summary; optional Compare |
| `components/companies/CompanyIntelligencePanel.tsx` | Same |
| `components/universities/UniversityIntelligencePanel.tsx` | Same |
| `app/(dashboard)/countries/page.tsx` | Optional Relationships |
| `app/(dashboard)/companies/page.tsx` | Optional Relationships |
| `app/(dashboard)/universities/page.tsx` | Optional Relationships |

**Not touched:** `runtime/`, `agents/`, `reasoning/`, `lib/intelligence/`

---

## Journey after sprint

```
Home → Search → Profile (Overview → Available → Missing → Reports)
                                              ↓
                              Reports Center (Continuing review for: Japan)
                                              ↓
                              Optional exploration (Compare, Relationships)
```

---

## Verification

- `npm run lint` — pass
- `npm run build` — pass
