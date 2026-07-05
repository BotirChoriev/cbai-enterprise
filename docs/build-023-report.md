# BUILD-023 Report — Evidence Layer Foundation

**Build:** BUILD-023  
**Date:** July 2026  
**Scope:** First Evidence Layer foundation for the CBAI Intelligence Engine  
**Status:** Complete — framework only, no connected sources

---

## Summary

BUILD-023 introduces `lib/intelligence/evidence/` — the Evidence Layer that sits between the intelligence pipeline and future CBAI subsystems (Global Search, Knowledge Graph, entity adapters, documents). The layer defines a collector contract, a source adapter registry, shape-only validation helpers, and wires `DefaultEvidenceCollector` into the engine pipeline.

Behavior remains equivalent to BUILD-022: evidence items are empty and sufficiency is `insufficient`. The difference is that collection now flows through a governed, extensible framework with explicit metadata explaining that no sources are connected yet.

No UI, dashboard, Entity Framework, API routes, LLM integration, internet fetching, or mock business data was added.

---

## Evidence Layer Purpose

In CBAI, **evidence is the atomic unit of justification** (Intelligence Specification §3.1). Every intelligence claim must decompose to evidence items with declared provenance. The Evidence Layer is responsible for:

1. **Collecting** evidence from registered source adapters
2. **Validating** structural shape before merge (not truth)
3. **Aggregating** items into an `EvidenceCollection` with sufficiency metadata
4. **Recording** how the collection was produced for explainability and audit

The Evidence Layer does not score confidence, assess trust, synthesize claims, or render UI. It feeds downstream pipeline stages.

```
IntelligenceRequest
        │
        ▼
DefaultEvidenceCollector
        │
        ├──► EvidenceSourceRegistry (enabled adapters)
        │         ├── entity-profile  [disabled]
        │         ├── search          [disabled]
        │         ├── knowledge-graph [disabled]
        │         ├── document        [disabled]
        │         └── …               [disabled]
        │
        ├──► validateEvidenceShape (per item)
        ├──► summarizeEvidenceItems (counts only)
        └──► EvidenceCollection + metadata
                │
                ▼
        Confidence / Trust stages (unchanged placeholders)
```

---

## File Structure

```
lib/intelligence/
├── evidence.types.ts           Extended with EvidenceCollectionMetadata
└── evidence/
    ├── index.ts                Public barrel exports
    ├── collector.ts            EvidenceCollector + DefaultEvidenceCollector
    ├── sources.ts              EvidenceSourceAdapter + EvidenceSourceRegistry
    └── validation.ts           Shape-only validation helpers
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/evidence.types.ts` | Added `EvidenceCollectionMetadata`, `EvidenceCollectionStatus` |
| `lib/intelligence/engine/stages.ts` | `stageEvidenceCollection` delegates to collector |
| `lib/intelligence/engine/pipeline.ts` | Async `runStage` for evidence collection |
| `lib/intelligence/index.ts` | Re-exports evidence module |

---

## Collector Contract

### `EvidenceCollector` interface

```typescript
interface EvidenceCollector {
  collect(request: IntelligenceRequest): Promise<EvidenceCollection>;
}
```

Any collector implementation must accept a validated `IntelligenceRequest` and return a structurally valid `EvidenceCollection`. The default implementation is `DefaultEvidenceCollector`.

### `DefaultEvidenceCollector`

| Property | Value |
|----------|-------|
| ID | `default-evidence-collector` |
| Version | `0.1.0-foundation` |
| Registry | `defaultEvidenceSourceRegistry` (injectable via constructor) |

**Collection flow:**

1. Read all registered adapter IDs
2. Filter to enabled adapters (zero in BUILD-023)
3. Invoke each enabled adapter's `collect(request)`
4. Validate each returned item with `validateEvidenceShape`
5. Compute `meanRelevance` and `sourceClassCount` via `summarizeEvidenceItems`
6. Infer `claimType` from request `intent` / `type` (structural only)
7. Attach `metadata` with `status: "no-sources-connected"`
8. Validate full collection shape with `validateEvidenceCollectionShape`
9. Return collection

### Metadata on empty collections

Every BUILD-023 collection includes:

```typescript
metadata: {
  collectorId: "default-evidence-collector",
  collectorVersion: "0.1.0-foundation",
  status: "no-sources-connected",
  message: "Evidence Layer foundation — no source adapters are enabled…",
  registeredSourceIds: [7 skeleton adapter IDs],
  attemptedSourceIds: [],
  collectedAt: ISO timestamp,
}
```

This distinguishes an intentionally empty framework result from a future collection with real evidence.

---

## Source Registry

### `EvidenceSourceAdapter` interface

Each adapter maps one CBAI subsystem to one `EvidenceSourceClass`:

| Field | Purpose |
|-------|---------|
| `id` | Stable adapter identifier |
| `sourceClass` | Specification §3.3 source class |
| `label` | Human-readable name for traces |
| `description` | Subsystem the adapter will connect to |
| `enabled` | Whether collector invokes this adapter |
| `collect(request)` | Returns `Evidence[]` — empty in skeleton |

### `EvidenceSourceRegistry`

| Method | Purpose |
|--------|---------|
| `register(adapter)` | Add or replace an adapter |
| `unregister(id)` | Remove an adapter |
| `get(id)` | Lookup by ID |
| `getAll()` | All registered adapters |
| `getEnabled()` | Adapters with `enabled: true` |
| `getRegisteredIds()` | ID list for metadata |

### Pre-registered skeleton adapters (all disabled)

| ID | Source class | Future subsystem |
|----|--------------|------------------|
| `entity-profile` | `entity-profile` | Domain adapters / Entity Framework |
| `search` | `search` | Global Search |
| `knowledge-graph` | `knowledge-graph` | Graph builder |
| `document` | `document` | Knowledge module |
| `agent-output` | `agent-output` | Agent runtime |
| `human-input` | `human-input` | Human override / input |
| `external-feed` | `external-feed` | Ingestion pipeline |

Enabling an adapter in a future build requires setting `enabled: true` and implementing `collect()` with real subsystem reads — no registry changes needed.

---

## Validation Scope

Validation in BUILD-023 is **shape-only** — it verifies that objects conform to TypeScript interface requirements, not that claims are true.

### What validation checks

| Helper | Validates |
|--------|-----------|
| `validateEvidenceSourceShape` | Valid `class`, optional string fields |
| `validateEvidenceShape` | Non-empty IDs, valid `entityType`, relevance 0–100, nested source |
| `validateEvidenceCollectionShape` | Items array, finite `meanRelevance`, non-negative integer `sourceClassCount` |
| `isValidRelevanceScore` | Numeric range 0–100 |
| `isEvidenceSourceClass` | Known source class enum |
| `isEvidenceShape` | Type guard wrapping `validateEvidenceShape` |

### What validation does NOT check

- Entity existence in domain modules
- Excerpt truth or accuracy
- Provenance authenticity
- Sufficiency thresholds per Specification §3.6
- Contradiction detection
- Search match quality

Sufficiency and contradiction remain downstream concerns for future confidence and trust builds.

### `EvidenceValidationError`

Separate from engine pipeline errors — thrown only on structural violations when adapters begin returning real items.

---

## Pipeline Wiring

### Before (BUILD-022)

`stageEvidenceCollection` returned a hardcoded empty object inline.

### After (BUILD-023)

```typescript
export async function stageEvidenceCollection(request) {
  return defaultEvidenceCollector.collect(request);
}
```

`executePipeline` now uses async `runStage` to await evidence collection. All other stages remain synchronous placeholders. Final `IntelligenceResult.evidence` includes metadata; items remain `[]`.

---

## Why No Real Sources Exist Yet

BUILD-023 establishes **plumbing before pipes** — the same incremental strategy as BUILD-021 (types) and BUILD-022 (pipeline):

### 1. Adapter boundary before subsystem coupling

Connecting Global Search or the graph builder directly inside `stageEvidenceCollection` would create ad hoc dependencies and violate the Domain Model rule of single derivation paths. The registry forces each subsystem to expose evidence through one adapter interface.

### 2. Shape validation before data

When adapters begin returning real items, invalid shapes must fail at the collector — not propagate into confidence scoring or UI. Validation helpers exist before any adapter can produce malformed evidence.

### 3. Explicit empty state

Hardcoded `{}` empty evidence was ambiguous — indistinguishable from a failed collection. `metadata.status: "no-sources-connected"` makes the empty state auditable and explainable per Specification §12.

### 4. Incremental enablement

Each source can be enabled independently in future builds:

- BUILD-024+ → enable `search` adapter
- BUILD-025+ → enable `knowledge-graph` adapter
- etc.

No pipeline or collector contract changes required.

---

## How This Prepares Future CBAI Intelligence

| Future build | Evidence Layer action |
|--------------|----------------------|
| Search integration | Enable `search` adapter; implement `collect()` calling `searchEntities()` |
| Graph integration | Enable `knowledge-graph` adapter; map traversed paths to evidence items |
| Entity profiles | Enable `entity-profile` adapter; read via existing adapters without UI changes |
| Document RAG | Enable `document` adapter; connect to Knowledge module index |
| Agent outputs | Enable `agent-output` adapter; bind agent run results to entities |
| Contradiction detection | Extend collector post-merge; validation scope unchanged |
| Reasoning UI bridge | `IntelligenceResult.evidence.metadata` surfaces collection status in explainability |

The Evidence Layer is the **single entry point** for all justification data entering the intelligence pipeline.

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 18 static routes |
| Entity Framework | Unmodified |
| Dashboard / UI | Unmodified |
| Evidence items | Empty (equivalent to BUILD-022) |
| Collection metadata | Present with `no-sources-connected` |

---

## Usage Example (not wired to UI)

```typescript
import { defaultEvidenceCollector } from "@/lib/intelligence";

const collection = await defaultEvidenceCollector.collect({
  id: "req-001",
  question: "Compare investment climates",
  intent: "comparative",
  requestedAt: new Date().toISOString(),
});

// collection.items.length === 0
// collection.metadata?.status === "no-sources-connected"
// collection.claimType === "comparative"
```

---

## Next Steps (not in BUILD-023 scope)

1. **BUILD-024** — Implement and enable `search` evidence adapter
2. **BUILD-025** — Implement and enable `knowledge-graph` evidence adapter
3. **BUILD-026** — Confidence assessment from real evidence volume and relevance
4. **BUILD-027** — Bridge `/reasoning` UI to `IntelligenceResult` evidence metadata

---

*BUILD-023 — Evidence Layer foundation. No commits created.*
