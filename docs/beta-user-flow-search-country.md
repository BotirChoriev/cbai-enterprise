# CBAI Beta User Flow — Search to Country

**Version:** 1.0.0  
**Status:** First complete user journey — existing architecture only

---

## User Journey

```
Search (/search?q=…)
  ↓ single country match auto-opens, or user selects country
Country Intelligence (/countries?country=…&q=…)
  ↓ integrated scroll review
Registry Profile
  ↓
Evidence Coverage
  ↓
Evidence Gaps (per-indicator detail)
  ↓
Pipeline Readiness
  ↓
Indicator Explorer
  ↓
Evidence Comparison · Timeline · Personas
  ↓
Decision Package Preview
  ↓
Reports Available
```

When a search returns exactly one country and no company/university matches, the platform navigates directly to the integrated country experience. Selecting a country from multi-result search opens the same route in one click.

---

## Integrated Modules

| Step | Existing module | Builder / query |
|------|-----------------|-----------------|
| Search | Search Intelligence + Global Search | `executeGatewaySearch`, `buildPlatformEntityHref` |
| Platform Context | Platform Context | `country` + `q` URL params |
| Registry Profile | Countries Intelligence 2.0 | `buildCountryIntelligenceProfile` |
| Evidence Coverage | Country coverage | `buildCountryCoverageProfile` |
| Evidence Gaps | Evidence Gap Explorer | `getCountryEvidenceGaps` |
| Pipeline Readiness | Evidence Pipeline | `getCountryPipelineReadiness` |
| Indicator Explorer | Indicator Explorer | `getIndicatorExplorerCatalog` |
| Evidence Comparison | Evidence Comparison | `getCountryEvidenceComparison` |
| Timeline | Timeline Foundation | `CountryTimelineSection` |
| Decision Package | Decision Intelligence | `buildDecisionPackageFromTemplate` |
| Reports | Reports Center | `buildReportsCenterModel` |

Single composition entry point: `buildCountryUserJourney()` in `lib/country-user-journey.ts`.

---

## Removed Duplication

| Removed / merged | Reason |
|------------------|--------|
| Search navigation hub for countries | Replaced by direct `/countries?country=` navigation |
| `EvidenceGapSummary` on country page | Counts already in Evidence Coverage panel |
| `EvidenceGapSources` on country page | Shown in Decision Package Official Sources |
| `EvidenceGapMethodology` on country page | Shown in Decision Package Methodology References |
| `CountryMethodology` section | Merged into Decision Package |
| `CountryIndicatorCoverage` | Replaced by embedded Indicator Explorer |
| `CountrySourceCoverage` | Merged into Decision Package Official Sources |
| Duplicate `buildCountryIntelligenceProfile` in panel | Single `buildCountryUserJourney` call in page |
| Legacy `?id=` entity links | Replaced with Platform Context `?country=` params |

Company and university pages retain full Evidence Gap panels (all sub-sections enabled).

---

## Real User Value

Users can now:

1. Search for a country and land immediately in a structured intelligence review
2. Follow one continuous reading flow from registry facts to decision readiness
3. See evidence available vs missing in a Decision Package without recommendations
4. Know which reports exist for country scope before export is available
5. Explore indicators in context without leaving the country profile

No new registries, frameworks, scores, or AI summaries were added.

---

## Future Export Integration

| Capability | Status |
|------------|--------|
| Report PDF/CSV export | Reports Center declares export as Not available / Planned |
| Decision package download | Future — Decision Intelligence summary export |
| Saved decision sessions | Future — requires runtime persistence |
| Cross-module deep links with scroll anchors | Optional enhancement |

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Run in CI step |
| `npm run build` | 21 static routes |
| Platform Context params | `country`, `q` |
| No `lib/intelligence/` changes | Yes |

---

## Compliance

CBAI Constitution v1.0 · Evidence First · No recommendations · Human review required on Decision Package sections.
