# Countries Intelligence 2.0 Report

**Document:** Countries Intelligence 2.0 Integration Report  
**Date:** July 6, 2026  
**Route:** `/countries`  
**Status:** First real domain integration of CBAI platform foundation

---

## Summary

Upgraded `/countries` from a registry-only profile into a **Country Intelligence 2.0** module integrating existing foundations without new framework layers, external APIs, or fabricated intelligence.

---

## Foundations used

| Foundation | Integration |
|------------|-------------|
| CBAI Constitution / Standards | Methodology, trust pillars, persona honesty |
| Governance Framework | Persona IDs, evidence-first rules |
| Indicator Framework | `getIndicatorsForEntity("country")`, domain grouping |
| Evidence Infrastructure | `OFFICIAL_EVIDENCE_SOURCES`, connection status |
| Knowledge Graph | `buildKnowledgeGraph()` for verified local catalog edges |
| Country registry | `lib/countries.ts` factual fields |
| Search Gateway style | Hero gradient, card grid, uppercase section labels |

---

## Architecture

```
lib/countries.ts                    → Registry facts
lib/countries.coverage.ts           → Coverage aggregation (NEW)
lib/countries.intelligence.ts       → Profile builder (REWRITTEN)
lib/countries.adapter.ts            → Relationships (unchanged logic)

components/countries/
├── CountryIntelligencePanel.tsx    → Orchestrates all sections (REWRITTEN)
├── CountryCoveragePanel.tsx        → Evidence coverage summary (NEW)
├── CountryIndicatorCoverage.tsx    → Indicators by domain (NEW)
├── CountrySourceCoverage.tsx       → Official sources (NEW)
├── CountryMethodology.tsx          → Methodology points (NEW)
├── CountryTrustSection.tsx         → Trust pillars (NEW)
├── CountryRelationships.tsx        → Knowledge Graph edges (REWRITTEN)
├── CountryCard.tsx                 → List card (UPDATED)
└── CountryFilters.tsx              → Unchanged

app/(dashboard)/countries/page.tsx  → Layout (UPDATED)
```

---

## Page sections

1. **Country registry facts** — name, code, capital, region, government, source label
2. **Evidence Coverage** — connected / planned / not connected / verification pending counts
3. **Indicator Coverage** — 22 domains, applicable country indicators from Global Indicator Framework
4. **Source Coverage** — 13 official sources; only CBAI Local Registry connected
5. **Methodology** — no scores without evidence, indicators require sources, no sentiment
6. **Relationships** — Knowledge Graph verified local catalog edges
7. **Persona Views** — Citizen, Investor, Government, Student, Researcher, Academic (available today + after sources connect)
8. **Trust** — Evidence First, Political Neutrality, Source Attribution, Methodology Before Metrics, No Fake Data, Reproducibility

---

## Removed / avoided fake data

| Removed | Replacement |
|---------|-------------|
| AI Score block | Indicator coverage by domain |
| Investment Score block | Source coverage + investor persona honesty |
| Risk Score block | Not connected status on indicators |
| 5-Year Trend block | Not connected — no time series |
| Future Scenarios block | Persona future capability text |
| Confidence status rows | Source status labels |
| Intelligence blocks with fake confidence | Coverage panels |
| "General User" persona | Citizen (governance-aligned) |
| "Public Institution" persona | Government |
| Backend terms (adapter, registry fields) | Available information, Evidence source, Coverage |

---

## Coverage statistics (typical country)

| Metric | Value |
|--------|-------|
| Applicable indicators | 22 |
| Connected indicators | 1 (Industry Classification via local registry) |
| Not connected indicators | 21 |
| Connected sources | 1 (CBAI Local Registry) |
| Planned sources | 12 |

---

## Verification

| Check | Result |
|-------|--------|
| `lib/intelligence/` modified | No |
| External API / fetch | No |
| Fake scores / AI / confidence | Removed |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `/countries` static export | ○ Static |

---

## Future integration (not implemented)

- Wire evidence infrastructure connectors when API policy allows
- Promote indicators from not connected → connected → verified
- Entity API evidence wrappers per standards 11
