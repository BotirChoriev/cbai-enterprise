# BUILD-031 Report — Graph Evidence Adapter

**Build:** BUILD-031  
**Date:** July 2026  
**Scope:** First graph evidence source connecting the Knowledge Graph to the Intelligence Engine  
**Status:** Complete — graph adapter enabled alongside entity-profile

---

## Summary

BUILD-031 enables the **`graph`** evidence source adapter (`sourceClass: knowledge-graph`). Subject entities are resolved against the existing knowledge graph built by `buildKnowledgeGraph()`. Connected nodes, edges, relationship types, and hop distances are mapped to deterministic `Evidence` items with **`provenanceStrength: inferred`**.

No UI, Entity Framework, graph builder algorithms, API routes, external services, or fabricated graph links were added.

---

## Graph Evidence Philosophy

Graph evidence answers: **"What relationships does the platform knowledge graph already contain for these entities?"**

It does not:

- Infer new relationships
- Traverse beyond existing graph edges
- Mutate or extend the graph builder
- Replace entity-profile evidence

Graph evidence **complements** entity-profile evidence by grounding relational claims in explicit graph edges. The collector merges both adapters, deduplicates by evidence id, sorts deterministically, and recalculates sufficiency.

---

## Architecture

```
IntelligenceRequest.subjectEntities
        ↓
EntityProfileEvidenceAdapter ──┐
GraphEvidenceAdapter           ├──► DefaultEvidenceCollector
        ↓                      │         (dedupe, sort, sufficiency)
GraphContextResolver           │
  buildKnowledgeGraph()        │
  computeGraphSelection()      │
  BFS hop distance (local)     │
        ↓                      │
GraphEvidenceMapper ───────────┘
        ↓
Evidence[] (knowledge-graph class)
```

### Package: `lib/intelligence/evidence/adapters/graph/`

| Component | Responsibility |
|-----------|----------------|
| `GraphContextResolver` | Seed nodes from subjectEntities; connected edges/neighbors; warnings |
| `GraphEvidenceMapper` | Edge → categorized Evidence; two-entity excerpts |
| `GraphEvidenceAdapter` | `EvidenceSourceAdapter`; id `graph`; enabled |

---

## Relationship Evidence

Every graph edge produces one evidence item with:

| Field | Value |
|-------|-------|
| `source.class` | `knowledge-graph` |
| `source.ref` | Graph edge id |
| `source.provenanceStrength` | `inferred` |
| `relationshipLabel` | Edge label from graph builder |
| `excerpt` | Entity A + Entity B + relationship type + hop distance |

**Rule:** Relationship-category evidence (partner, competitor) always references **two entities** in the excerpt. Primary binding uses the subject seed entity; the connected entity appears in excerpt text.

### Evidence categories

| Category | Graph edge types |
|----------|------------------|
| Relationship | `partner`, `competitor` |
| Location | `located-in` |
| Research | `research-partner` |
| Industry | `industry` |
| Investment | `investment` |
| Neighbor | Fallback when adjacent node has no categorized edge item |

---

## Connected Entities

Resolution uses existing APIs only:

- `buildKnowledgeGraph()` — full graph snapshot
- `computeGraphSelection(graph, nodeId)` — 1-hop connected nodes/edges
- `graphNodeId(type, id)` — seed node identification
- `computeGraphDistance()` — BFS hop distance (intelligence-side, no builder changes)

**Disconnected subject entities** emit warning `graph:disconnected:{type}:{id}` — never fabricated links.

**Missing graph nodes** emit `graph:node-not-found:{type}:{id}`.

**Unsupported ontology types** emit `graph:entity-type-not-in-graph:{type}:{id}`.

**No subjectEntities** emit `graph:no-subject-entities` with zero items.

---

## Provenance

Knowledge graph data is derived from the same static domain dataset as entity profiles. Evidence declares:

```typescript
provenanceStrength: "inferred"
```

Excerpts are prefixed with category context and `(knowledge graph, inferred)` — not external verification.

---

## Collector Integration

Enabled adapters:

| ID | Source class | Status |
|----|--------------|--------|
| `entity-profile` | `entity-profile` | Enabled (BUILD-030) |
| `graph` | `knowledge-graph` | Enabled (BUILD-031) |

Merge pipeline:

1. Collect from all enabled adapters
2. Merge warnings into `EvidenceCollectionMetadata.warnings`
3. Deduplicate by stable evidence `id`
4. Sort by relevance desc, then id asc (deterministic)
5. Recalculate sufficiency via `evaluateEvidenceSufficiency`

---

## Future Temporal Graph Support

BUILD-031 reads a point-in-time graph snapshot with no temporal metadata. Extension points:

1. **`snapshotAt` on graph context** — bind evidence to graph version
2. **Edge validity windows** — filter edges by `validFrom` / `validUntil` when graph schema evolves
3. **Staleness propagation** — map graph age to `Evidence.staleness`
4. **Historical traversal** — time-bounded BFS without changing builder algorithms (adapter-side filtering)

---

## File Structure

### Created

```
lib/intelligence/evidence/adapters/graph/
├── types.ts
├── graph-context-resolver.ts
├── graph-evidence-mapper.ts
├── graph-evidence-adapter.ts
└── index.ts

docs/build-031-report.md
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/evidence/sources.ts` | Register enabled graph adapter |
| `lib/intelligence/evidence/collector.ts` | Deterministic sort; updated version/message |
| `lib/intelligence/evidence/index.ts` | Export graph adapter |
| `lib/intelligence/index.ts` | Re-exports |

---

## Risks and Safeguards

| Risk | Safeguard |
|------|-----------|
| Fabricated graph links | Only existing edges from `buildKnowledgeGraph()` |
| Graph builder modification | Read-only API usage; BFS distance in adapter layer |
| Duplicate entity + graph evidence | Dedup by evidence id; distinct source classes |
| Disconnected entity silent failure | Explicit `graph:disconnected` warnings |
| Relationship claims without two entities | Excerpt always names Entity A and Entity B |
| Over-stated provenance | `inferred` on all graph evidence |

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes unchanged.

---

## References

- `docs/build-030a-entity-intelligence-adapter-design.md`
- `docs/build-030-report.md`
- `lib/graph/graph.builder.ts` — read-only graph APIs
- `docs/CBAI-Intelligence-Specification-v1.md` §3.3 — `knowledge-graph` source class
