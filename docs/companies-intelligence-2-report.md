# Companies Intelligence 2.0 Report

**Document:** Companies Intelligence 2.0 Integration Report  
**Date:** July 6, 2026  
**Route:** `/companies`  
**Status:** Evidence Intelligence module — parity with Countries Intelligence 2.0

---

## Summary

Transformed `/companies` into a complete **Evidence Intelligence module** matching Countries Intelligence 2.0 architecture. Reuses existing foundations without new framework layers. All fabricated commercial intelligence removed.

---

## Foundations used

| Foundation | Integration |
|------------|-------------|
| CBAI Constitution / Standards | Methodology, trust pillars, persona honesty |
| Governance Framework | Six canonical personas |
| Indicator Framework | `getIndicatorsForEntity("company")`, domain grouping |
| Evidence Infrastructure | Source status via infrastructure slugs |
| Knowledge Graph | `buildKnowledgeGraph()` for verified local edges |
| Company registry | `lib/companies.ts` factual fields only |

---

## Architecture

```
lib/companies.ts                    → Registry facts (already clean)
lib/companies.coverage.ts           → Coverage aggregation (NEW)
lib/companies.intelligence.ts       → Profile builder (REWRITTEN)
lib/companies.adapter.ts            → Linked entities type export (UPDATED)

components/companies/
├── CompanyIntelligencePanel.tsx    → Orchestrates sections (REWRITTEN)
├── CompanyCoveragePanel.tsx        → Evidence coverage (NEW)
├── CompanyIndicatorCoverage.tsx    → Indicators by domain (NEW)
├── CompanySourceCoverage.tsx       → Official sources (NEW)
├── CompanyMethodology.tsx          → Methodology (NEW)
├── CompanyTrustSection.tsx         → Trust pillars (NEW)
├── CompanyRelationships.tsx        → Knowledge Graph (REWRITTEN)
├── CompanyCard.tsx                 → List card (UPDATED)
└── CompanyFilters.tsx / CompanyList.tsx → Unchanged

app/(dashboard)/companies/page.tsx  → Layout (UPDATED)
```

---

## Page sections

1. **Registry Profile** — name, symbol, industry, country, founded, source label
2. **Evidence Coverage** — connected / planned / not connected / verification pending
3. **Indicator Coverage** — 7 company-applicable indicators across 12 domains; industry classification shows connected evidence
4. **Official Source Coverage** — Company Registry (connected), Stock Exchange, Annual Reports, Government Registry, Procurement Registry, Open Data (planned)
5. **Methodology** — no scores without evidence, evidence before judgment, official sources required
6. **Persona Views** — Citizen, Investor, Government, Student, Researcher, Academic
7. **Trust** — Evidence, Transparency, Methodology, Political Neutrality, No Fake Data
8. **Knowledge Graph** — verified local catalog edges; partner/competitor claims explicitly withheld

---

## Removed fake data

| Removed | Replacement |
|---------|-------------|
| Intelligence blocks (ownership, financial, ESG) | Indicator coverage by domain |
| General Citizen / Public Institution personas | Citizen / Government (governance-aligned) |
| Partner / competitor relationship displays as facts | Explicit "not connected" — no inferred claims |
| Confidence / detail score rows | Source status labels |
| Revenue, market cap, employees (already absent from registry) | Confirmed absent; UI copy forbids |
| AI summaries, innovation/investment/ESG scores | Not present; methodology forbids |
| Sky accent (legacy) | Cyan accent matching Countries 2.0 |

---

## Coverage statistics (typical company)

| Metric | Value |
|--------|-------|
| Applicable indicators | 7 |
| Connected indicators | 1 (Industry Classification) |
| Not connected indicators | 6 |
| Connected sources | 1 (Company Registry / CBAI Local Registry) |
| Planned sources | 5 |

---

## Verification

| Check | Result |
|-------|--------|
| New framework layers | None |
| `lib/intelligence/` modified | No |
| External API / fetch | No |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `/companies` static export | ○ Static |
