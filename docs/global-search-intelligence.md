# CBAI Global Search Intelligence

**Version:** 1.0.0  
**Status:** Foundation layer — platform navigation hub

---

## Purpose

Global Search Intelligence transforms Search into the **primary entry point** for the entire CBAI platform. Users search local registries and receive a navigation hub that exposes every declared module, evidence dependency, indicator scope, and decision context — without semantic AI, LLM answers, recommendations, or fabricated relevance.

CBAI Global Search Intelligence:

- Derives every record from existing registries (Global Registry, Indicator Explorer, Evidence Gap, Reports Center, Decision Intelligence, Timeline, Connector Architecture, Evidence Pipeline)
- Exposes factual navigation links to all platform explorers
- Presents counts and registry posture — not evaluative metrics
- Requires human review for all search-derived navigation

CBAI Global Search Intelligence never:

- Ranks results by relevance score or confidence
- Generates AI answers or recommendations
- Invent entities, sources, or navigation targets
- Display fake percentages or fabricated match quality

---

## Architecture

```
lib/search-intelligence/
├── search-intelligence.types.ts      # Core type system and record model
├── search-intelligence.version.ts    # Version manifest
├── search-intelligence.builder.ts    # Record builder from registries
├── search-intelligence.query.ts      # Query API and token search
├── search-intelligence.summary.ts    # Factual summary sections
├── search-intelligence.validation.ts # Constitutional validation
└── index.ts                          # Public API

components/search/intelligence/
├── SearchIntelligenceDetail.tsx      # Full detail panel wrapper
├── SearchResultOverview.tsx          # Entity overview
├── SearchAvailableModules.tsx        # Navigation hub links
├── SearchOfficialSources.tsx         # Official source list
├── SearchRelatedEvidence.tsx         # Evidence gaps, indicators, reports
└── SearchLimitations.tsx             # Decision readiness and limits
```

### Integration layers

| Layer | Usage |
|-------|-------|
| Global Registry | Entity ID resolution and validation |
| Global Search (`lib/global-search.ts`) | Token matching against local catalogs |
| Evidence Gap Explorer | Per-indicator gap records per entity |
| Indicator Explorer | Framework indicator coverage status |
| Reports Center | Report types by entity scope |
| Evidence Comparison | Same-type comparison targets |
| Timeline Foundation | Country timeline readiness |
| Decision Intelligence | Template readiness per entity type |
| Evidence Infrastructure | Official source connection status |
| Evidence Pipeline | Declared lifecycle stage count |
| Platform Context | Contextual navigation patterns |

---

## Search Model

Each `SearchIntelligenceRecord` contains:

| Field | Description |
|-------|-------------|
| `searchIntelligenceId` | Permanent ID — format `search-intelligence-{entityType}-{slug}` |
| `entityId` | Global Registry entity reference |
| `entityType` | `country`, `company`, or `university` |
| `displayName` | Registry display name |
| `availableModules` | Platform modules and navigation hub links |
| `availableEvidence` | Evidence gap entries from gap explorer |
| `availableIndicators` | Applicable framework indicators with explorer status |
| `availableReports` | Report types matching entity scope |
| `availableComparisons` | Same-type registry entities for comparison |
| `availableTimeline` | Timeline readiness (countries only) |
| `availableDecisionContexts` | Decision Intelligence template readiness |
| `officialSources` | Evidence Infrastructure sources for applicable indicators |
| `limitations` | Constitutional disclosure |
| `humanReviewRequired` | Always `true` |

---

## Navigation Strategy

Each search result exposes a **navigation hub** with links to:

| Module | Route pattern |
|--------|---------------|
| Country | `/countries?id={legacyId}` |
| Company | `/companies?id={legacyId}` |
| University | `/universities?id={legacyId}` |
| Evidence Explorer | `/knowledge` |
| Indicator Explorer | `/knowledge` |
| Evidence Gap | Entity profile (gap panel) |
| Comparison | Entity profile (comparison panel) |
| Decision Intelligence | `/reasoning` |
| Reports | `/analytics` |
| Knowledge Graph | `/graph?{entityType}={legacyId}` |

Entity-type modules (Country, Company, University) are marked available only for matching entity types. Cross-type modules remain visible with honest not-applicable labeling.

Search results display in **alphabetical order** — token matching uses `searchEntities()` internally but no relevance ranking is shown to users.

---

## Registry Integration

Record building flow:

1. Resolve entity from Global Registry via `buildSearchIntelligenceRecordFromEntity()`
2. Build evidence gaps via Evidence Gap Explorer builders
3. Resolve indicators via Indicator Framework + Indicator Explorer catalog
4. Filter reports via Reports Center entity scope
5. List comparison candidates via Evidence Comparison builder
6. Assess timeline via Timeline query (countries)
7. Build decision contexts via Decision Intelligence templates
8. Map official sources via Evidence Infrastructure catalog

All counts are factual registry totals — never percentages.

---

## Future Semantic Search

| Capability | Status |
|------------|--------|
| Vector / semantic retrieval | Declared — not implemented |
| LLM query interpretation | Forbidden on this layer |
| Cross-language search | Locale registry prepared in search gateway |
| Runtime agent search | Out of scope — `runtime/`, `agents/`, `reasoning/`, `lib/intelligence/` not modified |

Future semantic search must remain constitution-compliant: evidence-first, no fabricated confidence, human review required.

---

## Verification

Constitutional validation (`search-intelligence.validation.ts`) enforces:

- Valid search intelligence ID format
- `humanReviewRequired` always `true`
- Entity exists in Global Registry
- Navigation hrefs are internal paths only
- Prohibited language scan (rankings, recommendations, predictions, confidence, speculative language)

### Manual verification checklist

- [ ] Search page — query returns grouped results unchanged
- [ ] "Open navigation hub" reveals overview, modules, evidence, indicators, sources, decision readiness, limitations
- [ ] Navigation hub links route to correct platform modules
- [ ] No relevance scores, rankings, or AI summaries displayed
- [ ] All data traceable to registries

---

## Compliance

Aligned with:

- CBAI Constitution v1.0 — Evidence First, Transparency, Explainability, No Fake Data
- CBAI Standards v1.0 — Registry as source of truth
- Governance Framework v1.0 — Human review required

**Does not modify:** `runtime/`, `agents/`, `reasoning/`, `lib/intelligence/`
