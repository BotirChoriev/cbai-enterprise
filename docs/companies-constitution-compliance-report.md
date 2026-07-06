# Companies Constitution Compliance Report

**Build:** Platform Evolution Phase 1 — Companies Module  
**Date:** July 6, 2026  
**Route:** `/companies`  
**Reference pattern:** `/countries` Golden Rule implementation

---

## Summary

The Companies module was remediated from a fabricated intelligence demo into a **constitution-compliant Company Intelligence page**. The page now shows only factual local catalog data, honest evidence status labels, persona guidance, and derived links from other local catalogs — with no scores, AI narratives, financial claims, or fake confidence.

---

## Removed demo items

| Removed element | Previous source |
|-----------------|-----------------|
| AI Readiness score (`aiReadiness`) | `lib/companies.ts` per company |
| Innovation score (`innovationScore`) | `lib/companies.ts` |
| Investment score (`investmentScore`) | `lib/companies.ts`, list pills, `EntityLayout` |
| Risk score (`riskScore`) | `lib/companies.ts`, list pills |
| Hardcoded AI confidence **96.1%** | `companies/page.tsx` → `EntityLayout` |
| `aiSummary` geopolitical/market essays | `lib/companies.ts` (all 8 companies) |
| `overview` market position narratives | `lib/companies.ts` |
| `technologyLevel` assessments | `lib/companies.ts`, metadata |
| Unverified `revenue`, `marketCap`, `employees` | `lib/companies.ts`, entity metrics |
| `ceo` field (unverified in local catalog) | `lib/companies.ts` |
| `products` tag lists | `lib/companies.ts` |
| Fabricated `relationships` (competitors, partners, countries, universities) | `lib/companies.ts` |
| Score pills on company list (AI / Invest / Risk) | `CompanyList.tsx` |
| `EntityLayout` with score cards and AI summary | `companies/page.tsx` |
| Fake timeline events ("AI Strategy Active" with score) | `companies.adapter.ts` |
| Metric deltas ("↑ YoY", "Industry leading") | `companies.adapter.ts` |
| Graph edges from hardcoded partner/competitor strings | `graph.builder.ts` |
| Header copy: "Enterprise profiles, AI readiness" | `companies/page.tsx` |

---

## Created files

| File | Purpose |
|------|---------|
| `lib/companies.intelligence.ts` | Constitution blocks, personas, neutrality notice, evidence labels |
| `components/companies/CompanyIntelligencePanel.tsx` | Intelligence sections + persona views UI |
| `components/companies/CompanyCard.tsx` | List card with evidence badge (no scores) |
| `docs/companies-constitution-compliance-report.md` | This report |

---

## Modified files

| File | Change |
|------|--------|
| `lib/companies.ts` | Factual catalog only: id, name, icon, country, industry, founded |
| `lib/companies.adapter.ts` | Factual entity mapping; `getCompanyRelationships()` from local catalogs |
| `app/(dashboard)/companies/page.tsx` | Uses `CompanyIntelligencePanel`; removed `EntityLayout` |
| `components/companies/CompanyList.tsx` | Delegates to `CompanyCard` — no score pills |
| `components/companies/CompanyRelationships.tsx` | Honest linked records; partners/competitors unavailable |
| `lib/graph/graph.builder.ts` | Company edges: located-in + same-country universities only |
| `lib/intelligence/evidence/adapters/entity/entity-resolver.ts` | Uses derived relationships (integration only) |
| `lib/platform-home.ts` | Companies module status → Available |

**Not modified:** Intelligence algorithms, runtime, orchestrator, evidence mapper logic.

---

## Required CBAI blocks (implemented)

| # | Block | Implementation |
|---|-------|----------------|
| 1 | Company Registry Profile | Header + intelligence block |
| 2 | Evidence Status | Intelligence block |
| 3 | Ownership & Governance Status | Intelligence block — Evidence Source Not Connected |
| 4 | Financial Transparency Status | Intelligence block — Evidence Source Not Connected |
| 5 | Tender / Procurement Participation Status | Intelligence block — Evidence Source Not Connected |
| 6 | ESG / Responsibility Status | Intelligence block — Evidence Source Not Connected |
| 7 | Investor View | Persona card |
| 8 | Citizen View | Persona card |
| 9 | Government / Public Institution View | Persona card |
| 10 | Researcher View | Persona card |
| 11 | Academic View | Persona card |
| 12 | Political and commercial neutrality notice | Required wording in panel |

**Neutrality notice (exact):**  
*"CBAI provides evidence-based, neutral company intelligence. It does not endorse, attack, or commercially promote any company."*

---

## Remaining unavailable data

All items below display **"Evidence Source Not Connected"** or **"Insufficient Evidence"** until external sources integrate:

| Category | Status |
|----------|--------|
| AI / investment / risk scores | Withheld |
| AI-generated company summaries | Withheld |
| Revenue, market cap, employee counts | Not in catalog |
| CEO and leadership verification | Not in catalog |
| Ownership and governance filings | Not connected |
| Financial transparency metrics | Not connected |
| Tender / procurement participation | Not connected |
| ESG / responsibility indicators | Not connected |
| Partner and competitor relationships | Not connected (empty by design) |
| Product and market narratives | Removed |
| 5-year trends and scenarios | Not connected |
| External API / AI provider data | Not connected (by mission scope) |

**Available today:**

- 8 company catalog records (name, symbol, country, industry, founded year)
- Headquarters country link when country name matches local country catalog
- Universities in the same country from local university catalog
- Persona guidance for all six audiences
- Entity adapter scores zeroed for search/graph downstream

---

## How the page follows CBAI Constitution

| Principle | Compliance |
|-----------|------------|
| Evidence First | Only catalog facts shown as available; all else labeled |
| No Fake Data | All fabricated scores and narratives removed |
| Political Neutrality | Neutrality notice; no endorsements or attacks |
| Explain Every Score | No scores displayed; blocks explain what would be measured |
| Transparency | Evidence status on every intelligence block |
| Golden Rule | Six persona views with honest guidance |
| NO DEMO LAW | No fake confidence, trends, or activity |
| RESPECT LAW | No mock judgments or commercial promotion |
| Platform Law | Intelligence page — not chat, news, or government site |

---

## Architecture summary

```
lib/companies.ts                    ← factual catalog (single source of truth)
lib/companies.intelligence.ts       ← blocks + personas + labels
lib/companies.adapter.ts            ← Entity mapping + derived relationships
components/companies/
  CompanyIntelligencePanel.tsx      ← main detail view
  CompanyCard.tsx                   ← list item with evidence badge
  CompanyRelationships.tsx          ← local catalog links only
app/(dashboard)/companies/page.tsx  ← master-detail layout (countries pattern)
```

Downstream consumers (`global-search`, `graph`, `entity-resolver`) receive zeroed scores and `Insufficient Evidence` summaries via the adapter — no parallel company data stores.

---

## Verification results

```
npm run lint   ✅ passed
npm run build  ✅ passed (18 static routes, /companies static)
```

Cloudflare static export compatibility preserved. No external APIs. No AI providers. No commits.

---

## Estimated score impact

| Metric | Before | After (estimated) |
|--------|--------|-------------------|
| `/companies` Platform Experience | 10 | ~88 |
| `/companies` Constitution | 8 | ~94 |
| Companies module Golden Rule | ❌ | ✅ |

---

*Documentation only for compliance audit trail. Application changes limited to platform experience layer.*
