# Countries Constitution Compliance Report

**Date:** July 2026  
**Scope:** `/countries` page and country domain data  
**Status:** Complete — CBAI Golden Rule enforced

---

## Purpose

Remove fabricated country intelligence (scores, narratives, recommendations) and replace with constitution-compliant evidence blocks that disclose source connectivity and withhold unverified assessments.

---

## Removed Demo Items

| Item | Former behavior |
|------|-----------------|
| AI Score (0–100) | Displayed per country with color bars |
| Investment Score | Displayed per country |
| Risk Score | Displayed per country |
| AI Readiness metrics | Entity metrics and timeline |
| Fake confidence (`94.2`) | Passed to `EntityLayout` |
| `aiSummary` narratives | Long fabricated geopolitical analysis per country |
| `economy` essays | Presented as factual overview |
| GDP / population strings | Unverified static values |
| `technologyLevel` labels | Unverified assessments |
| `businessOpportunities` lists | Fabricated recommendations |
| `topIndustries` tags | Unverified industry tags |
| Hardcoded university lists | Per-country fabricated lists |
| Hardcoded related companies map | Fake cross-entity links |
| Fake AI timeline events | "AI Readiness Assessment" timeline |
| Entity score cards on page | AI / Investment / Risk cards |
| Entity AI Summary panel | Fabricated narrative block |
| "Real-time geopolitical..." header | Misleading marketing copy |

---

## Modified Files

| File | Change |
|------|--------|
| `lib/countries.ts` | Factual registry only (id, name, code, region, capital, government) |
| `lib/countries.intelligence.ts` | **Created** — constitution blocks, personas, neutrality notice |
| `lib/countries.adapter.ts` | Factual entity mapping; registry-derived relationships |
| `app/(dashboard)/countries/page.tsx` | Constitution-compliant intelligence panel |
| `components/countries/CountryCard.tsx` | Registry + evidence status (no scores) |
| `components/countries/CountryIntelligencePanel.tsx` | **Created** — required CBAI blocks |
| `components/countries/CountryRelationships.tsx` | Local registry links only; unavailable labels |
| `lib/intelligence/evidence/adapters/entity/entity-evidence-mapper.ts` | Country evidence excludes fake scores/narratives |
| `lib/intelligence/evidence/adapters/entity/entity-profile-adapter.ts` | Updated description |
| `lib/graph/graph.builder.ts` | Removed `topIndustries` dependency |

---

## CBAI Required Blocks (Implemented)

| Block | Status |
|-------|--------|
| Evidence Status | Connected when entity-profile resolves registry |
| Human Rights & Governance | Not Available — source not connected |
| Tender Transparency | Not Available — source not connected |
| Procurement Openness | Not Available — source not connected |
| Budget Transparency | Not Available — source not connected |
| 5-Year Trend | Not Available — source not connected |
| Future Scenarios | Not Available — source not connected |
| Persona Intelligence | Guidance available (6 personas) |
| Political Neutrality Notice | Displayed |
| AI / Investment / Risk Score blocks | Shown with meaning + Insufficient Evidence |

Each block explains: **what it means**, **evidence status**, **confidence status**, **source connected**.

---

## Persona Sections

| Persona | Value without fake claims |
|---------|---------------------------|
| General User | How to read registry facts and evidence status |
| Investor | Explains withheld investment scores; points to linked registries |
| Public Institution / State Leader | Explains missing governance/procurement sources |
| Student | Linked universities from local catalog only |
| Researcher | Reproducible scoping guidance |
| Academic | Neutrality and citation guidance |

---

## Remaining Unavailable Data

| Data category | Reason |
|---------------|--------|
| AI / Investment / Risk scores | No connected assessment evidence adapter |
| GDP / population time series | No connected macro evidence source |
| Human rights indicators | No governance evidence adapter |
| Tender / procurement / budget transparency | No public-sector evidence adapters |
| 5-year trends | No time-series evidence source |
| Future scenarios | No forecasting evidence source |
| Industry taxonomy | No connected industry registry |
| Business opportunity recommendations | Removed — constituted fabricated guidance |
| External API country data | Out of scope (no external APIs) |

---

## How Page Follows CBAI Constitution

1. **Golden Rule:** No invented scores, confidence, or analysis. Unavailable data uses standard labels.
2. **Evidence-first:** Entity-profile adapter emits factual registry evidence only for countries.
3. **Political neutrality:** Explicit notice; no endorsements or political recommendations.
4. **Explainability:** Every intelligence block documents meaning, evidence, confidence, and connectivity.
5. **Local evidence only:** Relationships derived from company/university registries — not hardcoded lists.

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |

---

## Summary

The `/countries` module now presents factual local registry profiles with constitution-compliant intelligence blocks. All former demo scores, narratives, and recommendations are removed or replaced with explicit unavailable states until real evidence sources connect.
