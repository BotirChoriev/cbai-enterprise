# 05 — Relationship Standard

**Document ID:** CBAI-Standard-05-Relationship  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define how relationships between CBAI entities are typed, evidenced, and displayed. The Knowledge Graph is the relationship authority — visualization, search, and reasoning consume the same edge model, not ad hoc string matching.

---

## Principles

- **Graph as relationship authority** — one builder, one edge schema
- **Evidence First** — every edge declares evidence status
- **Separation of Evidence and Judgment** — relationships are facts or declared absences, not recommendations
- **Transparency** — edge type, label, and evidence status are visible
- **No Fake Data** — edges exist only when catalog or verified source supports them

---

## Architecture

```
Domain relationship refs (CountryRelationships, CompanyRelationships, …)
        │
        ▼
Graph Builder → GraphEdge { source, target, type, label, evidenceStatus }
        │
        ├── Knowledge Graph UI
        ├── Search (future boosting)
        └── Reasoning / Evidence adapters (future)
```

Nodes: `country`, `company`, `university` (extensible to government, investor, person).

---

## Rules

1. Every edge must have a typed `GraphEdgeType` — no untyped "related to" strings in graph.
2. Every edge must declare `evidenceStatus`: `evidence_available` or `evidence_missing`.
3. New edge types require ontology update, builder support, and constitution review.
4. Relationship labels must be factual ("Research partner") not evaluative ("Best partner").
5. Graph must not suggest paths or rankings ("recommended connection").
6. Bidirectional semantics: some types are directional (located-in, investment); document in ontology.

---

## Allowed relationship types

| Type | Semantics | Typical source → target |
|------|-----------|------------------------|
| `located-in` | Geographic domicile or campus location | company → country, university → country |
| `partner` | Formal partnership or collaboration | company ↔ company, university ↔ company |
| `competitor` | Market competition (factual sector overlap) | company ↔ company |
| `research-partner` | Research collaboration | university ↔ university, university → company |
| `industry` | Sector classification link | company → industry cluster (future node) |
| `investment` | Investment or funding relationship | investor → company (future) |

**Future types (planned):** `subsidiary`, `regulates`, `employs`, `alumni`, `supplies`, `member-of`

Each new type requires evidence rules before activation.

---

## Relationship evidence rules

| Rule | Requirement |
|------|-------------|
| E1 | Edge with `evidence_available` must cite source slug or catalog reference |
| E2 | Edge with `evidence_missing` may display from catalog inference but must be labeled |
| E3 | No edge created solely from LLM inference without human-reviewed source |
| E4 | Temporal edges (start/end dates) require dated evidence when implemented |
| E5 | Deprecated relationships retain history with `deprecated` metadata |
| E6 | Cross-border relationships must not imply political alignment |

---

## Allowed

- Catalog-derived edges from domain relationship arrays with evidence_missing when no document
- Verified edges with source attribution and date
- Graph selection highlighting connected nodes without score overlay
- Edge counts in stats (factual counts, not quality scores)
- Empty graph states with honest "no verified relationships" messaging

---

## Forbidden

- Fabricated relationship webs to fill visual density
- Edge weights implying strength, trust, or investment priority
- "Suggested connections" or AI-predicted relationships without evidence tier
- Relationship types that encode political judgment (ally, adversary, free world)
- Average links per node as a quality metric
- Hidden edges used only for ranking or search manipulation

---

## Examples

**Compliant — verified edge**

```typescript
{
  type: "research-partner",
  label: "Joint AI lab",
  evidenceStatus: "evidence_available",
  // provenance: university-annual-report-2024
}
```

**Compliant — catalog edge with missing evidence**

```typescript
{
  type: "located-in",
  label: "Headquarters in United States",
  evidenceStatus: "evidence_missing" // from registry only
}
```

**Compliant — UI copy**

> 3 relationships · 1 verified · 2 registry reference

**Non-compliant**

> Strongest path: Stanford → NVIDIA (confidence 92%)

---

## Future expansion

- Temporal edge versioning (partnership start/end)
- Provenance metadata on every edge (document hash, URL, retrieval date)
- Relationship evidence explorer panel
- Government and investor node types
- Geospatial relationship layers (infrastructure, trade routes)
- Relationship API sub-resources

---

## Cross-references

- [02 — Evidence Standard](./02-evidence-standard.md)
- [04 — Entity Standard](./04-entity-standard.md)
- [01 — Constitution](./01-cbai-constitution.md)
- `lib/graph/graph.types.ts`
