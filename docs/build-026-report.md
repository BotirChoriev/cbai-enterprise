# BUILD-026 Report — Graph Context Layer

**Build:** BUILD-026  
**Date:** July 2026  
**Scope:** Graph Context Layer for the CBAI Intelligence Engine  
**Status:** Complete — framework only, no graph adapter connected

---

## Summary

BUILD-026 introduces `lib/intelligence/graph/` — the Graph Context Layer that assembles relational context for intelligence runs without connecting to the Knowledge Graph builder yet. `DefaultGraphContextBuilder` replaces the hardcoded graph stage placeholder.

| `includeGraph` | Result |
|----------------|--------|
| `false` or omitted | Disabled context (`enabled: false`, status `disabled`) |
| `true` | Empty context (status `graph-context-not-connected`) |

No UI, Entity Framework, API routes, external services, graph traversal, scoring, or mock business intelligence was added.

---

## Graph Context Purpose

The Knowledge Graph is the **relational evidence layer** in CBAI (Intelligence Specification §10). Graph Context captures:

- Which entities were used as traversal seeds
- Which paths were discovered between entities
- Connectivity signals for confidence assessment (future)
- Stalemate detection when query-central entities are disconnected
- Subgraph scope (node/edge counts)

The Graph Context Layer sits between the Evidence Layer and future confidence graph-factor wiring. It reads request scope and evidence metadata but does **not** mutate the graph or fetch external data.

```
IntelligenceRequest + EvidenceCollection
            │
            ▼
   DefaultGraphContextBuilder
            │
     ┌──────┴──────┐
     │             │
  disabled    not-connected
  (no flag)   (includeGraph: true)
     │             │
     └──────┬──────┘
            ▼
      GraphContext + signals skeleton
            │
            ▼
   IntelligenceResult.graphContext
```

---

## Connection to the Domain Model

| Domain Model concept | Graph Context field |
|---------------------|---------------------|
| Graph node ID `{type}:{entityId}` | `seedNodeIds`, path `fromNodeId` / `toNodeId` |
| Edge types (`located-in`, `partner`, …) | `IntelligenceGraphPath.edgeTypes` |
| Traversal rules (max depth 2) | `GraphTraversalOptions.maxDepth` |
| Graph stalemate (§10.4) | `stalemate` |
| Connectivity confidence factor (§4.2) | `connectivityScore` (0 until connected) |
| Entity refs from request | `resolveSeedNodeIdsFromRequest(subjectEntities)` |

The intelligence layer mirrors Domain Model edge types via `IntelligenceGraphEdgeType` without importing `lib/graph/` — adapter connection is a future wiring step.

---

## File Structure

```
lib/intelligence/
├── context.types.ts            Extended GraphContext + metadata
└── graph/
    ├── index.ts                Public barrel exports
    ├── context-builder.ts      GraphContextBuilder + DefaultGraphContextBuilder
    ├── traversal.ts            Traversal options, result type, skeleton function
    └── signals.ts              Future signal names and skeleton placeholders
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/context.types.ts` | `enabled`, `GraphContextMetadata`, `GraphContextStatus` |
| `lib/intelligence/engine/stages.ts` | `stageGraphContext` delegates to builder |
| `lib/intelligence/engine/pipeline.ts` | Always runs graph stage with evidence |
| `lib/intelligence/index.ts` | Re-exports graph module |

---

## Builder Contract

### `GraphContextBuilder` interface

```typescript
interface GraphContextBuilder {
  build(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<GraphContextBuildResult>;
}
```

### `GraphContextBuildResult`

Extends `GraphContext` with `signals: GraphSignal[]` — skeleton signal placeholders for future confidence/trust integration.

### Disabled context (`includeGraph !== true`)

```typescript
{
  enabled: false,
  seedNodeIds: [],
  traversedPaths: [],
  connectivityScore: 0,
  stalemate: false,
  nodeCount: 0,
  edgeCount: 0,
  metadata: {
    status: "disabled",
    message: "Graph context disabled — request.includeGraph is not true.",
  },
  signals: [/* all null scores — "Graph context disabled" */]
}
```

### Not-connected context (`includeGraph === true`)

```typescript
{
  enabled: true,
  seedNodeIds: [/* from subjectEntities */],
  traversedPaths: [],
  connectivityScore: 0,
  metadata: {
    status: "graph-context-not-connected",
    message: "Graph context requested but Knowledge Graph adapter is not connected…",
  },
  signals: [/* all null scores — deferred */]
}
```

---

## Traversal Skeleton

### Types

| Type | Purpose |
|------|---------|
| `GraphTraversalOptions` | Seed nodes, max depth, edge type filter |
| `GraphTraversalResult` | Paths, visited nodes/edges, stalemate, status |
| `GraphTraversalStatus` | `disabled` · `not-connected` · `empty-seeds` · `complete` |

### `traverseGraphSkeleton()`

Returns empty paths and `status: "not-connected"` (or `empty-seeds` when no seeds). No calls to `buildKnowledgeGraph()` or graph mutation.

---

## Graph Signal Skeleton

Future signals defined but not computed:

| Signal | Future purpose |
|--------|----------------|
| `connectivity` | Path count and edge diversity |
| `centrality` | Entity position in subgraph |
| `relationship-strength` | Weighted edge type support |
| `entity-proximity` | Hop distance between subjects |
| `contradiction-risk` | Conflicting paths between entity pairs |

All signals return `score: null` with deferred detail strings in BUILD-026.

---

## Why Traversal Is Disabled for Now

### 1. Adapter boundary before coupling

Connecting directly to `lib/graph/graph.builder.ts` inside the pipeline stage would bypass the Evidence Layer and create a second graph access path. The Graph Context Layer establishes the contract first; adapter wiring is BUILD-027+.

### 2. No scoring without paths

Confidence factor `graph-connectivity` (BUILD-024) explicitly defers until graph context is real. Running traversal now would produce misleading empty-or-fake paths.

### 3. Explicit not-connected state

Status `graph-context-not-connected` distinguishes "graph requested but unavailable" from "graph disabled" — both auditable in metadata.

### 4. Static export safety

Graph builder reads entity adapters at build time. The intelligence graph layer remains pure TypeScript with no new runtime dependencies — Cloudflare Pages compatible.

---

## How It Prepares Knowledge Graph Reasoning

| Future capability | Graph Context Layer hook |
|-------------------|-------------------------|
| Search → graph seeds | `resolveSeedNodeIdsFromRequest` + search evidence adapter |
| Bounded BFS traversal | Replace `traverseGraphSkeleton` body |
| Relational evidence items | Map `traversedPaths` → Evidence Layer `knowledge-graph` source |
| Confidence graph factor | Read `connectivityScore` + `signals.connectivity` |
| Trust contradiction caps | Read `signals.contradiction-risk` |
| Reasoning UI graph paths | `IntelligenceResult.graphContext.traversedPaths` |

The existing `/graph` visualization module is unchanged. Intelligence engine consumes graph context through this layer only.

---

## Future Integration Path

```
BUILD-026  Graph Context Layer (this build — skeleton)
    ↓
BUILD-027  Knowledge Graph adapter in traverseGraphSkeleton()
    ↓
BUILD-028  Map traversed paths → Evidence Layer knowledge-graph items
    ↓
BUILD-029  Wire graph connectivity confidence factor
    ↓
BUILD-030  Compute graph signals from real traversal results
    ↓
Phase 2    Temporal edges, edge provenance, snapshot timestamps
```

### Adapter integration sketch (BUILD-027)

```typescript
// traversal.ts — future replacement body
import { buildKnowledgeGraph } from "@/lib/graph/graph.builder";

export function traverseGraph(options: GraphTraversalOptions): GraphTraversalResult {
  const graph = buildKnowledgeGraph();
  // BFS from seedNodeIds, respect maxDepth and edgeTypes
  // return real paths — no mutation
}
```

Evidence and Entity Framework remain unchanged — graph builder is read-only input.

---

## Pipeline

```
Request → Evidence → Confidence → Trust → Graph → Memory → Trace → Result
```

Graph stage always runs. Builder handles disabled vs not-connected internally.

```typescript
const graphContext = await stageGraphContext(validatedRequest, evidence);
// Always present on IntelligenceResult — never undefined
```

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 18 static routes |
| `includeGraph` omitted | `enabled: false`, status `disabled` |
| `includeGraph: true` | status `graph-context-not-connected`, empty paths |
| Entity Framework | Unmodified |
| UI / dashboard | Unmodified |

---

## Usage Example (not wired to UI)

```typescript
import { defaultGraphContextBuilder } from "@/lib/intelligence";

const withGraph = await defaultGraphContextBuilder.build(
  {
    id: "req-001",
    question: "How are Apple and NVIDIA connected?",
    requestedAt: new Date().toISOString(),
    includeGraph: true,
    subjectEntities: [
      { type: "company", id: "apple" },
      { type: "company", id: "nvidia" },
    ],
  },
  evidence,
);

// withGraph.metadata?.status === "graph-context-not-connected"
// withGraph.seedNodeIds === ["company:apple", "company:nvidia"]
```

---

*BUILD-026 — Graph Context Layer. No commits created.*
