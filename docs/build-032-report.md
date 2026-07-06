# BUILD-032 Report — Search Evidence Adapter

**Build:** BUILD-032  
**Date:** July 2026  
**Scope:** Connect Global Search utilities to the Intelligence Engine Evidence Layer  
**Status:** Complete — search adapter enabled alongside entity-profile and graph

---

## Summary

BUILD-032 enables the **`search`** evidence source adapter. Local search matches from `lib/global-search.ts` are converted into deterministic `Evidence` items with **`provenanceStrength: inferred`**.

No UI, search page, Entity Framework, API routes, external services, internet fetching, or fabricated matches were added.

---

## Search Evidence Philosophy

Search evidence answers: **"Which entities in the local CBAI index match this question or subject scope?"**

It is a **retrieval signal** — not proof of external fact. Search evidence records that an entity matched token scoring rules against the unified local index. It does not claim the match was verified outside the platform.

Search evidence complements:

- **Entity-profile evidence** — deep field excerpts for scoped entities
- **Graph evidence** — explicit relationship edges between entities

The collector merges all three adapters, deduplicates by evidence id, sorts deterministically, and recalculates sufficiency.

---

## Architecture

```
IntelligenceRequest
  question + subjectEntities
        ↓
SearchEvidenceAdapter
        ↓
SearchResolver
  searchEntities(question)     ← existing local utility
  getAllEntities()             ← subject entity lookup
        ↓
SearchEvidenceMapper
        ↓
Evidence[] (sourceClass: search)
        ↓
DefaultEvidenceCollector (merge with entity-profile + graph)
```

### Package: `lib/intelligence/evidence/adapters/search/`

| Component | Responsibility |
|-----------|----------------|
| `SearchResolver` | Question search + subject entity index lookup |
| `SearchEvidenceMapper` | Match → Evidence with dedupe by id |
| `SearchEvidenceAdapter` | `EvidenceSourceAdapter`; id `search`; enabled |

---

## Why Search Evidence Is Inferred

Local search operates on platform-curated entity profiles with token matching and AI score ranking. Matches are:

- Not externally verified
- Not semantic/vector retrieval (BUILD-032)
- Not web search results

Every item declares `provenanceStrength: "inferred"` and excerpts include `(local index, inferred)`.

---

## Search vs Entity Adapter

| | Search Adapter | Entity Adapter |
|---|----------------|----------------|
| **Input** | `question` and/or `subjectEntities` | `subjectEntities` only |
| **Source** | `searchEntities()` token matching | Direct domain record read |
| **Output** | One match item per entity | Up to 6 field items per entity |
| **Purpose** | Retrieval relevance signal | Profile field grounding |
| **Source class** | `search` | `entity-profile` |

Search discovers matches; entity-profile extracts structured profile fields for scoped entities.

---

## Search vs Graph Adapter

| | Search Adapter | Graph Adapter |
|---|----------------|---------------|
| **Input** | Question + subject scope | `subjectEntities` only |
| **Source** | Local entity index | Knowledge graph edges |
| **Evidence** | Match reasons + relevance | Relationship types + hop distance |
| **Two-entity refs** | Single entity binding | Relationship excerpts name A + B |
| **Source class** | `search` | `knowledge-graph` |

Search finds entities; graph proves existing edges between them.

---

## Behavior Summary

### Inputs

| Condition | Behavior |
|-----------|----------|
| Empty `question` AND no `subjectEntities` | Zero items; warning `search:no-query-or-subject-entities` |
| Non-empty `question` | `searchEntities(question)` — top 10 matches max |
| `subjectEntities` | Direct lookup in `getAllEntities()` — relevance 90 |
| Both question + subjects | Merge; dedupe by entity key |
| No search matches for query | Warning `search:no-matches-for-query:{query}` |
| Subject not in index | Warning `search:subject-not-in-index:{type}:{id}` |

### Evidence item shape

| Field | Value |
|-------|-------|
| `id` | `search:{type}:{id}:match` |
| `source.class` | `search` |
| `source.ref` | `search:query:{query}` or `search:subject:{type}:{id}` |
| `relevance` | Clamped 0–100 from search score |
| `excerpt` | Query, entity ref, match reasons, relevance |

### Enabled adapters (collector)

1. `entity-profile`
2. `graph`
3. `search`

---

## No External Search Yet

BUILD-032 uses **only** `lib/global-search.ts`:

- Static domain data via entity adapters
- Token-based scoring
- No HTTP, no LLM, no vector DB

Warnings and empty results preserve conservative behavior when nothing matches.

---

## Future Semantic / Vector Search Path

Extension points without changing adapter contract:

1. **Replace `SearchResolver` internals** — swap `searchEntities()` for vector similarity while keeping mapper/adapter interface
2. **Hybrid scoring** — combine token + embedding scores in resolver only
3. **Source metadata** — add `searchMode: "token" | "semantic"` to collection metadata
4. **Provenance tier** — semantic matches may remain `inferred` until citation grounding exists
5. **Dedup with entity-profile** — collector already dedupes by evidence id; semantic search should use distinct ids

---

## File Structure

### Created

```
lib/intelligence/evidence/adapters/search/
├── types.ts
├── search-resolver.ts
├── search-evidence-mapper.ts
├── search-evidence-adapter.ts
└── index.ts

docs/build-032-report.md
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/evidence/sources.ts` | Register enabled search adapter |
| `lib/intelligence/evidence/collector.ts` | v0.4.0; updated collection message |
| `lib/intelligence/evidence/index.ts` | Export search adapter |
| `lib/intelligence/index.ts` | Re-exports |

---

## Risks and Safeguards

| Risk | Safeguard |
|------|-----------|
| Fabricated search results | Only `searchEntities()` / `getAllEntities()` output |
| External web search | No network calls |
| Duplicate evidence with entity-profile | Distinct evidence ids; collector dedupe |
| Relevance > 100 breaks validation | Clamped to 0–100 in mapper |
| Unbounded result flooding | Max 10 query matches |
| Empty input fabrication | Explicit warning + zero items |

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes unchanged.

---

## References

- `lib/global-search.ts` — read-only search utilities
- `docs/build-030-report.md` — entity-profile adapter
- `docs/build-031-report.md` — graph adapter
- `docs/CBAI-Intelligence-Specification-v1.md` §3.3 — `search` source class
