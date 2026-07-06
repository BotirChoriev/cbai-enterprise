# Universities Intelligence 2.0 Report

**Document:** Universities Intelligence 2.0 Integration Report  
**Date:** July 6, 2026  
**Route:** `/universities`  
**Status:** Evidence Intelligence module — parity with Countries and Companies 2.0

---

## Summary

Transformed `/universities` into a complete **Evidence Intelligence module** matching Countries and Companies Intelligence 2.0. Reuses existing foundations without new framework layers. All ranking and score-oriented intelligence blocks removed.

---

## Foundations used

| Foundation | Integration |
|------------|-------------|
| CBAI Constitution / Standards | Methodology, trust pillars, persona honesty |
| Governance Framework | Six canonical personas |
| Indicator Framework | `getIndicatorsForEntity("university")`, domain grouping |
| Evidence Infrastructure | Source status via infrastructure slugs |
| Knowledge Graph | `buildKnowledgeGraph()` for verified local edges |
| University registry | `lib/universities.ts` factual fields only |

---

## Architecture

```
lib/universities.ts                    → Registry facts (already clean)
lib/universities.coverage.ts           → Coverage aggregation (NEW)
lib/universities.intelligence.ts       → Profile builder (REWRITTEN)
lib/universities.adapter.ts            → Linked entities type export (UPDATED)

components/universities/
├── UniversityIntelligencePanel.tsx    → Orchestrates sections (REWRITTEN)
├── UniversityCoveragePanel.tsx        → Evidence coverage (NEW)
├── UniversityIndicatorCoverage.tsx    → Indicators by domain (NEW)
├── UniversitySourceCoverage.tsx       → Official sources (NEW)
├── UniversityMethodology.tsx          → Methodology (NEW)
├── UniversityTrustSection.tsx         → Trust pillars (NEW)
├── UniversityRelationships.tsx          → Knowledge Graph (REWRITTEN)
├── UniversityCard.tsx                   → List card (UPDATED)
└── UniversityFilters.tsx / UniversityList.tsx → Unchanged

app/(dashboard)/universities/page.tsx  → Layout (UPDATED)
```

---

## Page sections

1. **Registry Profile** — name, symbol, type, city, country, founded, website, source label
2. **Evidence Coverage** — connected / planned / not connected / verification pending
3. **Indicator Coverage** — 3 applicable indicators (education, research, innovation) — all not connected today
4. **Official Source Coverage** — University Registry (connected), Accreditation, Ministry, UNESCO, Research Databases, Scholarship Portals, Open Data (planned)
5. **Methodology** — no rankings without evidence, evidence before judgment, official sources required
6. **Persona Views** — Citizen, Investor, Government, Student, Researcher, Academic
7. **Trust** — Evidence, Transparency, Methodology, Political Neutrality, No Fake Data
8. **Knowledge Graph** — verified local catalog edges; partnerships/scholarships explicitly withheld

---

## Removed fake data

| Removed | Replacement |
|---------|-------------|
| Intelligence blocks (accreditation, research capability, ESG-style sections) | Indicator coverage by domain |
| Block-level evidence status grid | Coverage panels |
| Research centers as relationship facts | Explicit not connected message |
| Violet accent (legacy) | Cyan accent matching Countries/Companies 2.0 |
| Rankings, global rank, student/faculty counts | Confirmed absent from registry; UI forbids |
| Research/innovation/education scores | Not present; methodology forbids |
| AI summaries, fake partnerships, scholarships, employment outcomes | Not shown; explicit withholding copy |
| Confidence metrics | Source status labels only |

---

## Coverage statistics (typical university)

| Metric | Value |
|--------|-------|
| Applicable indicators | 3 |
| Connected indicators | 0 |
| Not connected indicators | 3 |
| Connected sources | 1 (University Registry / CBAI Local Registry) |
| Planned sources | 6 |

---

## Verification

| Check | Result |
|-------|--------|
| New framework layers | None |
| `lib/intelligence/` modified | No |
| External API / fetch | No |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `/universities` static export | ○ Static |
