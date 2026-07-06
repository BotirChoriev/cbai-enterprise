# Knowledge Graph Platform Report

**Module:** CBAI Knowledge Graph — Intelligence Navigation Layer  
**Date:** July 6, 2026  
**Route:** `/graph`  
**Scope:** Platform experience only — `lib/intelligence/` algorithms, runtime, agents, and reasoning engine logic untouched. Cloudflare static export preserved.

---

## Summary

The Knowledge Graph module was transformed from a visualization demo with score-based inspection into the **core intelligence navigation layer** of CBAI. It explains how entities are connected using verified local catalog relationships — never why, unless evidence exists.

---

## Architecture

```
lib/graph/graph-platform.ts     ← content, entity/relationship types, personas, trust
lib/graph/graph.evidence.ts       ← entity/edge evidence summaries for panels
lib/graph/graph.types.ts          ← GraphNode, GraphEdge (+ evidenceStatus), KnowledgeGraph
lib/graph/graph.builder.ts        ← nodes/edges from local registries only
lib/graph/graph.mock.ts           ← layout, colors, active edge legend config

app/(dashboard)/graph/page.tsx
  ├── GraphEntityPanel            ← LEFT: entity details, search, filters
  ├── GraphCanvas                 ← CENTER: interactive graph, zoom, focus
  ├── GraphConnectionsPanel       ← RIGHT: connected entities, evidence summary
  ├── GraphLegend                 ← active types + verified relationships
  ├── GraphPersonas               ← role guidance
  ├── GraphPipeline               ← SVG pipeline diagram
  └── Trust pillars               ← evidence, methodology, neutrality, transparency
```

Downstream consumers (`reasoning.engine`, `graph-context-resolver`) continue to call `buildKnowledgeGraph()` — edges now include `evidenceStatus` without changing intelligence adapter APIs.

---

## Entity Model

### Active nodes (in graph today)

| Type | Source | Evidence |
|------|--------|----------|
| Country | `lib/countries.ts` | Local registry |
| Company | `lib/companies.ts` | Local catalog |
| University | `lib/universities.ts` | Local catalog |

### Planned entity types (declared, not rendered)

Government Institutions · Industries · Infrastructure · Natural Resources · Procurement · Research Centers · Future Entity Types

Nodes appear only when registries connect — no placeholder nodes.

---

## Relationship Model

### Verified edge types emitted by builder

| Edge type (internal) | Display label | Derivation |
|---------------------|---------------|------------|
| `located-in` | Located In | Company/university country field → country node |
| `industry` | Registered In | Country adapter lists companies/universities in country |
| `research-partner` | Belongs To | Same-country company ↔ university catalog link |

### Edge metadata

```ts
GraphEdge {
  source, target, type, label,
  evidenceStatus: "evidence_available" | "evidence_missing"
}
```

All current edges are `evidence_available` (catalog-derived). Future types (Collaborates With, etc.) are declared but not emitted.

### Removed relationship patterns

- Fake **Investment** edges (country → company)
- Fake **Research Partner** labels on catalog proximity
- Duplicate **Headquarters** / **Industry** edges
- Bidirectional duplicate company ↔ university edges
- Hardcoded `uni.relationships.industryPartners` graph wiring

---

## Evidence Model

### Entity panel (left)

- **Evidence Status:** Registry available / Evidence unavailable
- **Relationship Count:** Count of connected edges for selected node
- **Available Sources:** Local platform registry + entity adapter name

### Connections panel (right)

- **Evidence Summary:** Relationship status + entity evidence status
- **Evidence Relationships:** Per-edge label + Evidence Available / Evidence Missing
- **Available Information:** Factual overview from entity adapter
- **Future Evidence:** Honest note on partnership verification requirements

### No AI wording

Removed: AI score pills, AI Graph language, confidence displays, fabricated analytics (Avg Links).

Uses: Evidence Relationships · Connected Entities · Relationship Status · Available Information.

---

## Persona Support

| Persona | What can I learn? |
|---------|-------------------|
| Citizen | Country registry links without popularity scores |
| Investor | Catalog adjacency only — no investment claims |
| Government | Government form from country registry when linked |
| Student | Location and same-country listings — no rankings |
| Researcher | Exportable relationship list with evidence status per edge |
| Academic | Separation of catalog links vs verified collaboration |

---

## Future Expansion

Declared in `GRAPH_FUTURE_EXPANSION`:

- Government institution nodes from public registries
- Industry/sector nodes with NAICS/ISIC evidence
- Infrastructure and natural resource layers
- Procurement contract edges
- Research center nodes with verified affiliations
- Collaborates With edges after partnership evidence connects
- Multilingual relationship labels and filter API

Schema prepared — not implemented.

---

## Created Files

| File | Purpose |
|------|---------|
| `lib/graph/graph-platform.ts` | Platform content, entity/relationship registry, personas, trust |
| `lib/graph/graph.evidence.ts` | Evidence summary helpers for panels |
| `components/graph/GraphEntityPanel.tsx` | Left panel — entity details + search |
| `components/graph/GraphConnectionsPanel.tsx` | Right panel — connections + evidence |
| `components/graph/GraphPipeline.tsx` | SVG pipeline diagram |
| `components/graph/GraphPersonas.tsx` | Persona “What can I learn?” cards |
| `docs/knowledge-graph-platform-report.md` | This report |

---

## Modified Files

| File | Change |
|------|--------|
| `lib/graph/graph.types.ts` | `GraphEdge.evidenceStatus`; stats include `verifiedEdgeCount` |
| `lib/graph/graph.builder.ts` | Constitution-compliant edges only; deduplicated derivation |
| `lib/graph/graph.mock.ts` | Active edge legend; zoom constants; inactive types marked |
| `app/(dashboard)/graph/page.tsx` | Three-panel layout + personas + pipeline + trust |
| `components/graph/GraphCanvas.tsx` | Zoom controls; evidence-first labeling |
| `components/graph/GraphLegend.tsx` | Active vs planned types |
| `lib/platform-home.ts` | Graph module copy updated |
| `lib/navigation.ts` | Updated description |

---

## Deleted Files

| File | Reason |
|------|--------|
| `components/graph/GraphInspector.tsx` | Score pills + AI inspection — replaced by split panels |
| `components/graph/GraphFilters.tsx` | Merged into `GraphEntityPanel`; removed fake analytics |

---

## Constitution Compliance

| Principle | Compliance |
|-----------|------------|
| Evidence First | Every edge has evidence status; catalog-derived only |
| Political Neutrality | No recommendations, rankings, or path suggestions |
| Transparency | Unavailable relationship types declared, not faked |
| Zero Demo Policy | Removed scores, confidence, avg links, investment fiction |
| How not Why | Graph shows connection type — no causal AI narratives |

**Untouched:** `lib/intelligence/` algorithms, runtime, agents, reasoning engine.

---

## Verification

```bash
npm run lint   # ✓ passed
npm run build  # ✓ passed — /graph ○ Static (18 pages)
```

**No git commit** — per mission instructions.

---

## Summary

The Knowledge Graph is now CBAI’s relationship navigation layer: three-panel enterprise layout, zoom/focus interaction, verified catalog edges with evidence status, persona guidance, and pipeline visibility — with zero fabricated nodes, weights, or AI suggestions.
