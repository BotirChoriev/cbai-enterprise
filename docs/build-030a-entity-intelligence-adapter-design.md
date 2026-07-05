# BUILD-030A — Entity Intelligence Adapter Design

**Build:** BUILD-030A (design only)  
**Date:** July 2026  
**Scope:** Safest architecture to connect the Entity Framework to the Intelligence Engine as the first real evidence source  
**Status:** Design complete — no implementation in this build

---

## Executive Summary

BUILD-030 will enable the existing **`entity-profile`** skeleton adapter in the Intelligence Engine Evidence Layer. The adapter will read **Country**, **Company**, and **University** records through the **existing domain adapters** (`toCountryEntity`, `toCompanyEntity`, `toUniversityEntity`) and emit structurally valid `Evidence` items — without modifying the Entity Framework, domain modules, UI, or intelligence pipeline stages beyond evidence collection registration.

The bridge lives entirely in a **new intelligence-side adapter package** that treats the Entity Framework as a read-only upstream subsystem. Entity records become evidence through deterministic field mapping, conservative provenance declaration, and explicit not-found handling. No LLM synthesis, no fabricated excerpts, no score inflation.

---

## Part 1 — Existing System Analysis

### 1.1 Entity Framework

**Location:** `lib/entity/` (types + helpers only — no runtime store)

| Component | Path | Role |
|-----------|------|------|
| Universal types | `lib/entity/entity.types.ts` | `EntityType`, `Entity`, `EntityScores`, metadata/metrics/timeline shapes |
| Helpers | `lib/entity/entity.helpers.ts` | Score clamping, display formatting, `isValidEntity` guard |
| Icons | `lib/entity/entity.icons.ts` | Presentation (out of scope for evidence) |

**Entity types (ontology):**

| Type | Adapter | Domain data | Graph support | Search index |
|------|---------|-------------|---------------|--------------|
| `country` | `lib/countries.adapter.ts` → `toCountryEntity` | `lib/countries.ts` | Yes | Yes |
| `company` | `lib/companies.adapter.ts` → `toCompanyEntity` | `lib/companies.ts` | Yes | Yes |
| `university` | `lib/universities.adapter.ts` → `toUniversityEntity` | `lib/universities.ts` | Yes | Yes |
| `government` | — | — | No | No |
| `investor` | — | — | No | No |
| `person` | — | — | No | No |

**Universal `Entity` shape (evidence-relevant fields):**

```typescript
Entity {
  id, type, name, category, overview, status,
  scores: { aiScore, riskScore, investmentScore },
  tags[], timeline[], aiSummary, metadata{}, metrics[]
}
```

**Scoring fields:** All three entity modules map domain scores into `EntityScores`. These are **platform-assessed signals**, not externally verified facts. They are suitable for the Confidence Layer's deferred **`entity-signal-quality`** factor (BUILD-030B or later), not as standalone evidence excerpts.

**Domain adapters (presentation layer, also the canonical normalization path):**

- `toCountryEntity(country)` — maps GDP, population, aiReadiness, industries, `getCountryRelationships()`
- `toCompanyEntity(company)` — maps revenue, CEO, industry, relationships
- `toUniversityEntity(university)` — maps ranking, research strength, programs

**Important:** Adapters are **pure functions**. They do not expose a registry or lookup API. BUILD-030 must introduce a **read-only resolver** on the intelligence side that imports domain arrays and calls existing adapter functions — not modify adapter files.

### 1.2 Graph Builder

**Location:** `lib/graph/graph.builder.ts`

- Builds `KnowledgeGraph` from `countries`, `companies`, `universities` via the same three adapters.
- Node ID convention: `{type}:{entityId}` via `graphNodeId()` in `lib/graph/graph.types.ts`.
- Edge types: `located-in`, `partner`, `competitor`, `research-partner`, `industry`, `investment`.
- Graph node types are currently `Extract<EntityType, "country" | "company" | "university">`.

**Intelligence Graph Context Layer** (`lib/intelligence/graph/`) already uses `resolveSeedNodeIdsFromRequest()` which expects the same `{type}:{id}` convention from `request.subjectEntities`. Entity evidence adapter must use **identical ID semantics** so graph seeds and evidence entity refs align in BUILD-031+.

### 1.3 Search Utilities

**Location:** `lib/global-search.ts`

- `getAllEntities()` — unified index via batch adapters.
- `searchEntities(query, filters)` — token scoring, relevance 0–100+.
- Searchable types: `country | company | university` only.
- `SearchResult` carries `entity`, `relevanceScore`, `matchReasons[]`.

**Relationship to evidence:** The registry already defines a separate **`search`** adapter (`sourceClass: "search"`). BUILD-030 should **only enable `entity-profile`**. Search adapter activation is a distinct future build to avoid duplicate evidence for the same entity (spec rule **EV4**).

**Parallel path (do not conflate):** `lib/reasoning/reasoning.engine.ts` builds mock evidence for the `/reasoning` UI page. That path is **not** the Intelligence Engine pipeline. BUILD-030 must not modify it.

### 1.4 Intelligence Engine — Request Envelope

**Location:** `lib/intelligence/request.types.ts`

```typescript
IntelligenceRequest {
  id, question, type?, intent?,
  subjectEntities?: EntityRef[],   // { type, id, name? }
  tenantId?, requestedAt,
  conversationId?, includeMemory?, includeGraph?
}
```

**`subjectEntities`** is the primary scope input for entity evidence collection. When absent, BUILD-030 behavior must be explicitly defined (see §2.6).

### 1.5 Intelligence Engine — Evidence Model

**Location:** `lib/intelligence/evidence.types.ts`

| Type | Purpose |
|------|---------|
| `EvidenceSourceClass` | Origin category — **`entity-profile`** is the target |
| `EvidenceSource` | `{ class, ref?, label?, provenanceStrength?, retrievedAt? }` |
| `Evidence` | `{ id, entityId, entityType, entityName, source, relevance, excerpt, relationshipLabel?, staleness? }` |
| `EvidenceCollection` | Aggregated items + `claimType`, `sufficiencyStatus`, `contradictionState`, aggregates, `metadata` |

**Key design constraint from types:** Evidence uses **entity references**, not full `Entity` objects — keeping intelligence decoupled from adapter payloads.

### 1.6 Evidence Layer — Source Registry

**Location:** `lib/intelligence/evidence/sources.ts`

| Adapter ID | Source class | Current state |
|------------|--------------|---------------|
| `entity-profile` | `entity-profile` | Disabled skeleton — **BUILD-030 target** |
| `search` | `search` | Disabled skeleton |
| `knowledge-graph` | `knowledge-graph` | Disabled skeleton |
| `document`, `agent-output`, `human-input`, `external-feed` | respective classes | Disabled skeletons |

**`EvidenceSourceAdapter` contract:**

```typescript
interface EvidenceSourceAdapter {
  readonly id: string;
  readonly sourceClass: EvidenceSourceClass;
  readonly label: string;
  readonly description: string;
  readonly enabled: boolean;
  collect(request: IntelligenceRequest): Evidence[];
}
```

**Collector** (`lib/intelligence/evidence/collector.ts`):

- Merges enabled adapter output.
- Validates shape via `validateEvidenceShape`.
- Computes `meanRelevance`, `sourceClassCount`.
- Sets `sufficiencyStatus`: `insufficient` when `items.length === 0`, else **`minimum`** (threshold logic not yet implemented).
- Sets `metadata.status`: `no-sources-connected` when zero enabled adapters.

### 1.7 Downstream Layer Expectations

| Layer | Expectation when entity evidence connects |
|-------|------------------------------------------|
| **Confidence** | Non-zero score only when `items.length > 0` and `sufficiencyStatus !== "insufficient"`. Uses `meanRelevance` for source-relevance factor. Graph/entity signal factors still score 0 until wired. |
| **Trust** | Non-zero trust when evidence sufficient. `entity-profile` is not `document`/`external-feed` — `sourceTrustLevel` remains `undefined`. Caps removed when evidence present. |
| **Graph Context** | Seeds from `subjectEntities` as `{type}:{id}`. Evidence enriches future traversal but BUILD-026 skeleton unchanged in BUILD-030. |
| **Memory Context** | Unchanged — no entity reads. |
| **Reasoning Trace** | Records evidence item count, sufficiency, adapter IDs in factual summaries. |
| **Result** | Exits skeleton executive summary when evidence non-empty; still no fabricated conclusions in BUILD-030. |

**Spec sufficiency thresholds** (not yet enforced by collector):

| Claim type | Min items | Min avg relevance |
|------------|-----------|-------------------|
| Descriptive | 1 | 40 |
| Relational | 2 | 50 |
| Comparative | 2 | 45 |
| Strategic | 3 | 55 |
| High-stakes | 4 | 65 |

BUILD-030 should implement threshold evaluation in the collector (or a dedicated sufficiency helper) when enabling real evidence — otherwise confidence/trust may activate on a single low-relevance item incorrectly marked `minimum`.

---

## Part 2 — Entity Evidence Adapter Architecture

### 2.1 Design Principles

1. **Read-only bridge** — Intelligence reads entity data; never writes domain state.
2. **No Entity Framework changes** — Resolver imports existing domain modules and adapters as-is.
3. **Deterministic mapping** — Same input always produces same evidence items.
4. **Conservative provenance** — Platform entity profiles are `inferred`, not `verified`.
5. **Factual excerpts only** — Quote `overview`, `aiSummary`, metadata, metrics; never generate new prose.
6. **Fail visible** — Missing entities produce warnings, not silent omission or fabrication.
7. **Single adapter activation** — Enable `entity-profile` only; defer `search` and `knowledge-graph`.

### 2.2 Proposed Package Structure (BUILD-030)

```
lib/intelligence/evidence/adapters/entity/
├── index.ts                      Public exports
├── entity-resolver.ts            EntityRef → Entity | not-found result
├── entity-evidence-mapper.ts     Entity → Evidence[] (field mapping rules)
├── entity-profile-adapter.ts     EvidenceSourceAdapter implementation
├── entity-evidence.types.ts      Resolver/mapper result types, warning codes
└── sufficiency.ts                (optional) Claim-type threshold evaluation
```

**Registration point:** Replace skeleton `entity-profile` adapter in registry bootstrap — either by registering `EntityProfileEvidenceAdapter` over the skeleton in `createDefaultEvidenceSourceRegistry()` or via a dedicated `registerEntityEvidenceAdapters(registry)` function called from engine initialization. Prefer **registry replacement at bootstrap** to avoid modifying the skeleton definition inline.

### 2.3 Component Responsibilities

```
IntelligenceRequest
        │
        ▼
EntityProfileEvidenceAdapter.collect()
        │
        ├──► resolveSubjectEntities(request.subjectEntities)
        │         │
        │         ├──► EntityResolver.lookup(type, id)
        │         │         └──► domain array + toXEntity()  [read-only]
        │         │
        │         └──► ResolutionResult { entity?, warnings[] }
        │
        ├──► EntityEvidenceMapper.map(entity, context)
        │         └──► Evidence[] (1–N items per entity)
        │
        └──► merge + dedupe + sort (relevance desc)
                │
                ▼
        DefaultEvidenceCollector (unchanged merge/validate)
```

| Component | Responsibility |
|-----------|----------------|
| `EntityResolver` | Composite key lookup `(EntityType, id)` against domain stores |
| `EntityEvidenceMapper` | Deterministic Entity → Evidence[] transformation |
| `EntityProfileEvidenceAdapter` | Orchestrates resolve → map → return; implements `EvidenceSourceAdapter` |
| `EntityEvidenceSufficiencyEvaluator` | (Recommended) Evaluates spec §3.6 thresholds post-merge |

### 2.4 Dependency Direction (Safest Boundary)

```
lib/intelligence/evidence/adapters/entity/
        │
        │ imports (read-only)
        ▼
lib/countries.ts          lib/countries.adapter.ts
lib/companies.ts          lib/companies.adapter.ts
lib/universities.ts       lib/universities.adapter.ts
lib/entity/entity.types.ts
lib/entity/entity.helpers.ts   (isValidEntity only)
```

**Must NOT import:** React components, dashboard pages, `lib/reasoning/`, graph layout mocks, UI hooks.

**Must NOT modify:** Any file under `lib/entity/`, `lib/*.adapter.ts`, domain data files.

---

## Part 3 — Entity Record → Evidence Mapping

### 3.1 Resolution Key

Use **`(entityType, entityId)`** as the canonical lookup key — matching `Entity.id` and `Entity.type` after adapter normalization.

| Entity type | Domain store | Lookup |
|-------------|--------------|--------|
| `country` | `countries.find(c => c.id === id)` | `toCountryEntity(country)` |
| `company` | `companies.find(c => c.id === id)` | `toCompanyEntity(company)` |
| `university` | `universities.find(u => u.id === id)` | `toUniversityEntity(university)` |

Do **not** resolve by name alone in BUILD-030 — names are ambiguous (`"Google"` could match multiple contexts). Name-based fallback is a future enhancement with explicit disambiguation warnings.

### 3.2 Evidence Items Per Entity

Emit **multiple atomic evidence items** per resolved entity — one per factual datum — rather than one blob. This supports explainability and relevance scoring.

**Recommended item set (BUILD-030 minimum):**

| Item ID pattern | Excerpt source | Relevance (subject entity) | Notes |
|-----------------|----------------|---------------------------|-------|
| `{type}:{id}:overview` | `entity.overview` | 75 | Factual profile text |
| `{type}:{id}:ai-summary` | `entity.aiSummary` | 70 | Platform narrative — label as platform-assessed in source metadata |
| `{type}:{id}:scores` | Formatted scores string | 65 | `"AI Score: 94/100, Investment: 91/100, Risk: 22/100"` |
| `{type}:{id}:status` | `entity.status` | 50 | Lifecycle signal |

**Optional BUILD-030 items (if excerpt length ≤ spec display limits):**

| Item | Source | Relevance |
|------|--------|-----------|
| `{type}:{id}:metric:{metricId}` | Each highlighted metric | 55 |
| `{type}:{id}:metadata:{key}` | Key metadata fields per module config | 50 |

**Cap:** Maximum **6 items per entity** in BUILD-030 to prevent evidence flooding. Prioritize overview, aiSummary, scores.

### 3.3 Evidence Source Metadata (Per Item)

```typescript
source: {
  class: "entity-profile",
  ref: `${entity.type}:${entity.id}`,           // stable entity URI
  label: "CBAI Entity Profile",                 // or module-specific label
  provenanceStrength: "inferred",               // curated platform data, not third-party verified
  retrievedAt: ISO-8601 now,
}
```

**Rationale for `inferred`:** Domain records are static mock/seed data with platform-generated `aiSummary` text. Spec §3.4 ranks provenance strength independently from relevance. Using `verified` would overstate epistemic weight and inflate trust incorrectly.

**Staleness:** Set `staleness: "fresh"` for static dataset with documented assumption that domain data refresh is a future operational concern. When data versioning exists, compare `retrievedAt` against domain `updatedAt`.

### 3.4 Evidence Quality Rules

| Rule ID | Rule | BUILD-030 enforcement |
|---------|------|----------------------|
| **EQ1** | Every evidence item must bind to a resolved entity | `entityId`, `entityType`, `entityName` from resolved `Entity` |
| **EQ2** | Excerpts must be verbatim or templated from entity fields | Mapper uses string interpolation templates only — no LLM |
| **EQ3** | `aiSummary` items must not be labeled as externally verified | `provenanceStrength: "inferred"` + optional excerpt prefix `"Platform assessment:"` |
| **EQ4** | Archived/inactive entities may produce evidence with caveat | Include `entity.status` in excerpt or staleness; do not block collection |
| **EQ5** | Relevance floor for subject-scoped entities: ≥ 50 | Subject entities from `request.subjectEntities` get elevated relevance |
| **EQ6** | Deduplicate identical `(entityId, excerpt)` pairs | Collector merge or adapter pre-merge |
| **EQ7** | Unsupported entity types produce zero items + warning | government/investor/person in BUILD-030 |
| **EQ8** | Empty `subjectEntities` → zero items (no speculative search) | Prevents unscoped evidence fabrication |

**Relevance scoring formula (deterministic):**

```
baseRelevance(itemType)  // from table above, e.g. overview=75
× subjectBoost           // 1.0 if entity in subjectEntities, 0.85 if ancillary (future)
= clamp(0, 100)
```

### 3.5 Ordering

Per spec **EV6**: sort by relevance descending, then provenance strength (`verified` > `inferred` > `unverified`), then `retrievedAt` descending.

---

## Part 4 — subjectEntities Mapping

### 4.1 Request → Domain Record

```
EntityRef { type: "company", id: "apple", name?: "Apple" }
        │
        ▼
EntityResolver.lookup("company", "apple")
        │
        ├── found → Entity { id: "apple", type: "company", name: "Apple Inc.", ... }
        │           entityName = Entity.name (canonical, not EntityRef.name)
        │
        └── not found → warning, zero items for this ref
```

**Name field on `EntityRef`:** Display hint only. If provided name differs from resolved `Entity.name`, emit informational warning — do not fail resolution when id matches.

### 4.2 relatedEntities / Result Layer Alignment

BUILD-029 maps `relatedEntities` from `request.subjectEntities`. Evidence collection should use the **same ref list** as the scope boundary. Resolved entities that produce evidence should be a **subset** of `subjectEntities` — not a superset discovered by search.

### 4.3 Graph Seed Alignment

`resolveSeedNodeIdsFromRequest()` produces `["company:apple", "country:usa", ...]`. Evidence `source.ref` and `entityId` must use the same `entityId` portion so future graph evidence (`knowledge-graph` adapter) can correlate paths to profile evidence.

---

## Part 5 — Edge Case Behavior

### 5.1 Entity Not Found

| Condition | Behavior |
|-----------|----------|
| Invalid `EntityType` on ref | Warning: `unsupported-entity-type`; zero items |
| Valid type, unknown `id` | Warning: `entity-not-found:{type}:{id}`; zero items |
| Valid type not yet implemented (government/investor/person) | Warning: `entity-type-not-connected:{type}`; zero items |
| All refs not found | Empty collection; `metadata.status = "partial"` if adapter ran but zero items, or `"collected"` with zero items and warnings in trace |

**Never:** Synthesize a placeholder entity, use `EntityRef.name` alone to fabricate evidence, or return evidence with empty `entityId`.

**Warning propagation path:**

```
EntityProfileEvidenceAdapter warnings[]
        → attach to EvidenceCollection.metadata (new optional field)
        → ReasoningTraceBuilder includes in reasoningTrace.warnings
        → IntelligenceResult.warnings
```

Recommend extending `EvidenceCollectionMetadata` with `warnings?: string[]` in BUILD-030 — additive, non-breaking.

### 5.2 Multiple Entities Referenced

| Scenario | Behavior |
|----------|----------|
| Single descriptive request, N subject entities | Up to 6 items × N entities; evaluate sufficiency against claim type |
| Comparative request (`type: "comparative"` or `intent: "comparative"`) | Require ≥ 1 evidence item per entity in comparison set (spec **EV3**) |
| Mixed found/not-found | Partial evidence from found entities; warnings for missing; `sufficiencyStatus: "insufficient"` if comparative minimum not met |
| Duplicate refs in `subjectEntities` | Dedupe by `(type, id)` before resolution |

**Example:** `subjectEntities: [{ type: "country", id: "usa" }, { type: "company", id: "apple" }]`

- Resolves both → up to 12 evidence items (6 each).
- `claimType: "descriptive"` → sufficiency likely `adequate` if avg relevance ≥ 40.
- `claimType: "comparative"` → sufficiency `minimum` or `adequate` (2 entities covered).

### 5.3 Empty subjectEntities

**Recommended BUILD-030 behavior:** Return **zero evidence items**.

Rationale: Without explicit scope, auto-collecting from search would duplicate a future search adapter and violate the "never fabricate" principle. Callers (future API/UI integration) must supply `subjectEntities`.

Optional future enhancement: When `subjectEntities` is empty but `question` is non-empty, delegate to search adapter (separate build, separate adapter).

### 5.4 includeGraph / includeMemory Flags

Entity profile adapter **ignores** these flags — it only resolves scoped entities. Graph and memory layers remain independent.

---

## Part 6 — Future Entity Types

| Type | BUILD-030 | Future path |
|------|-----------|-------------|
| `government` | Not connected — warning | Add `lib/governments.ts` + adapter → extend `EntityResolver` switch |
| `investor` | Not connected — warning | Add `lib/investors.ts` + adapter → extend resolver |
| `person` | Not connected — warning | Add `lib/people.ts` + adapter → extend resolver |

**Extension pattern (no intelligence core changes):**

1. Domain module + `toXEntity()` adapter (Entity Framework pattern).
2. Add case to `EntityResolver` domain store map.
3. Optionally add graph node type in `lib/graph/graph.types.ts` (separate build).
4. Register remains `entity-profile` — same adapter, expanded resolver.

The `EvidenceSourceAdapter` interface and `entity-profile` source class **do not change** — only the resolver's supported type list grows.

---

## Part 7 — BUILD-030 Implementation Plan

### 7.1 Files to Create

| File | Purpose |
|------|---------|
| `lib/intelligence/evidence/adapters/entity/entity-evidence.types.ts` | `EntityResolutionResult`, warning codes, mapper options |
| `lib/intelligence/evidence/adapters/entity/entity-resolver.ts` | Read-only `(type, id)` → `Entity` lookup |
| `lib/intelligence/evidence/adapters/entity/entity-evidence-mapper.ts` | `Entity` → `Evidence[]` with quality rules |
| `lib/intelligence/evidence/adapters/entity/entity-profile-adapter.ts` | `EntityProfileEvidenceAdapter implements EvidenceSourceAdapter` |
| `lib/intelligence/evidence/adapters/entity/index.ts` | Barrel exports |
| `lib/intelligence/evidence/sufficiency.ts` | Claim-type threshold evaluation (recommended) |
| `docs/build-030-report.md` | Implementation report |

### 7.2 Files to Modify

| File | Change | Risk |
|------|--------|------|
| `lib/intelligence/evidence/sources.ts` | Register enabled `EntityProfileEvidenceAdapter` instead of skeleton | Low — registry extension point |
| `lib/intelligence/evidence/collector.ts` | Wire sufficiency evaluator; propagate adapter warnings to metadata | Medium — test threshold edge cases |
| `lib/intelligence/evidence.types.ts` | Add optional `warnings?: string[]` to `EvidenceCollectionMetadata` | Low — additive |
| `lib/intelligence/evidence/index.ts` | Export entity adapter module | Low |
| `lib/intelligence/index.ts` | Re-export public adapter surface | Low |

### 7.3 Files That Must NOT Change

| Area | Files |
|------|-------|
| Entity Framework | `lib/entity/**` |
| Domain adapters | `lib/countries.adapter.ts`, `lib/companies.adapter.ts`, `lib/universities.adapter.ts` |
| Domain data | `lib/countries.ts`, `lib/companies.ts`, `lib/universities.ts` |
| UI / dashboard | `app/**`, `components/**` |
| Reasoning UI engine | `lib/reasoning/**` |
| Graph builder | `lib/graph/**` (graph evidence is BUILD-031+) |
| Intelligence pipeline stages | `lib/intelligence/engine/**` (except if collector import path changes) |
| Confidence/Trust/Result layers | No logic changes in BUILD-030 — they consume evidence automatically |

### 7.4 Suggested BUILD-030 Sub-Phases

| Phase | Scope |
|-------|-------|
| **030** | Entity resolver + mapper + adapter + registry enable + sufficiency helper |
| **030B** | Wire `entity-signal-quality` confidence factor from subject entity scores |
| **031** | Knowledge graph adapter (`knowledge-graph` source class) |
| **032** | Search adapter with deduplication against entity-profile |
| **033** | Result layer: factual executive summary from evidence (still no LLM) |

---

## Part 8 — Risks and Safeguards

### 8.1 Risk Matrix

| Risk | Severity | Safeguard |
|------|----------|-----------|
| **aiSummary treated as verified fact** | High | `provenanceStrength: "inferred"`; prefix excerpts; Result layer still no conclusions |
| **Over-stated confidence from 1 item** | High | Implement spec §3.6 sufficiency thresholds before enabling adapter |
| **Duplicate evidence when search adapter later enabled** | Medium | Dedupe on `(entityId, excerpt)`; coordinate adapter activation order |
| **ID mismatch with graph seeds** | Medium | Use `{type}:{id}` consistently; test against `graphNodeId()` |
| **Import cycle intelligence ↔ domain** | Medium | Adapter imports domain modules only; domain never imports intelligence |
| **Static mock data presented as live intelligence** | Medium | Collection metadata message: "Evidence from platform entity profiles (static dataset)" |
| **Unsupported types silently ignored** | Low | Explicit warning codes per type |
| **Evidence flooding (too many items)** | Low | Cap 6 items/entity in BUILD-030 |
| **Cloudflare static export breakage** | Low | No new API routes; no server-only APIs; sync reads only |
| **Reasoning UI divergence** | Low | Do not modify `lib/reasoning/`; document two parallel paths |

### 8.2 Safeguard Checklist for BUILD-030 Implementation

- [ ] Adapter is disabled by default in tests that expect empty evidence; enabled in production registry only
- [ ] Unit tests: found entity, not-found entity, unsupported type, multiple entities, duplicate refs
- [ ] `validateEvidenceShape` passes on all mapper output
- [ ] No new business intelligence text generated — only field quoting
- [ ] `npm run lint` and `npm run build` pass; 18 static routes unchanged
- [ ] Confidence/trust scores remain conservative when graph/memory factors still zero
- [ ] Trace records adapter ID `entity-profile` in `attemptedSourceIds`

### 8.3 Testing Strategy (BUILD-030)

| Test case | Expected outcome |
|-----------|------------------|
| Request with valid `subjectEntities: [{ type: "country", id: "usa" }]` | ≥ 1 evidence item; `metadata.status: "collected"` |
| Request with invalid id | 0 items; warning `entity-not-found` |
| Request with `type: "person"` | 0 items; warning `entity-type-not-connected` |
| Comparative request, 2 valid entities | ≥ 2 items spanning both entities; sufficiency not `insufficient` |
| Comparative request, 1 found + 1 missing | `insufficient`; warnings present |
| Empty `subjectEntities` | 0 items; adapter not invoked or returns empty |
| Full pipeline run | Result `lifecycleState` may remain `draft` until Result layer updated (BUILD-033) |

---

## Part 9 — End-to-End Flow (Post BUILD-030)

```
User / Caller
    │
    ▼
IntelligenceRequest
  question: "What is the AI readiness of Apple?"
  subjectEntities: [{ type: "company", id: "apple" }]
    │
    ▼
DefaultEvidenceCollector
    │
    ▼
EntityProfileEvidenceAdapter [enabled]
    │
    ├── EntityResolver → toCompanyEntity(companies.find apple)
    ├── EntityEvidenceMapper → 4–6 Evidence items
    └── return Evidence[]
    │
    ▼
EvidenceCollection
  items: [...]
  sufficiencyStatus: "minimum" | "adequate"
  metadata.status: "collected"
  metadata.attemptedSourceIds: ["entity-profile"]
    │
    ├──► ConfidenceAssessor → non-zero score (degraded: graph/entity factors pending)
    ├──► TrustAssessor → non-zero trust (capped if confidence degraded)
    ├──► GraphContextBuilder → unchanged skeleton
    ├──► MemoryContextBuilder → unchanged
    ├──► ReasoningTraceBuilder → records item count, adapter ID
    └──► ResultAssembler → factual metrics update; executive summary still conservative
```

---

## Part 10 — Design Decisions Log

| Decision | Choice | Alternatives rejected |
|----------|--------|----------------------|
| Adapter location | `lib/intelligence/evidence/adapters/entity/` | Modifying domain adapters (violates rules) |
| Source class | `entity-profile` | New custom class (breaks spec alignment) |
| Provenance | `inferred` | `verified` (overstates mock data weight) |
| Scope input | `subjectEntities` required | Auto-search on question (fabrication risk) |
| Items per entity | Multiple atomic items | Single combined excerpt (poor explainability) |
| Search adapter | Defer to BUILD-032 | Enable alongside entity-profile (duplicate evidence) |
| Sufficiency | Implement in BUILD-030 | Leave as `minimum` (unsafe confidence activation) |
| Entity signal factor | Defer to BUILD-030B | Wire in same build (scope creep) |

---

## References

| Document / module | Relevance |
|-------------------|-----------|
| `docs/CBAI-Intelligence-Specification-v1.md` §3 | Evidence model, sufficiency, quality |
| `docs/CBAI-Domain-Model-v1.md` | Entity ontology, query intent |
| `docs/build-023-report.md` | Evidence Layer foundation |
| `docs/build-029-report.md` | Result layer empty-evidence behavior |
| `lib/intelligence/evidence/sources.ts` | Adapter registry |
| `lib/global-search.ts` | Future search adapter reference |
| `lib/graph/graph.builder.ts` | Future knowledge-graph adapter reference |

---

**BUILD-030A complete.** No code changes. Ready for BUILD-030 implementation review.
