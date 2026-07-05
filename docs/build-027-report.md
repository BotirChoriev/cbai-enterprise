# BUILD-027 Report — Memory Context Layer

**Build:** BUILD-027  
**Date:** July 2026  
**Scope:** Memory Context Layer for the CBAI Intelligence Engine  
**Status:** Complete — framework only, no persistence connected

---

## Summary

BUILD-027 introduces `lib/intelligence/memory/` — the Memory Context Layer that assembles organizational memory context for intelligence runs without connecting to any storage backend. `DefaultMemoryContextBuilder` replaces the hardcoded memory stage placeholder.

| `includeMemory` | Result |
|-----------------|--------|
| `false` or omitted | `enabled: false`, status `disabled` |
| `true` | Empty entries, status `memory-not-connected` |

No UI, dashboard, Entity Framework, API routes, databases, browser storage, localStorage, or AI models were added.

---

## Memory Philosophy

In CBAI, **memory is persistent organizational context** — not model weights, not evidence, and not the Knowledge document corpus.

Memory **shapes** future intelligence by biasing retrieval and routing. It does **not replace** the evidence requirement (Intelligence Specification §9.1). Memory reads inject context; memory content does not automatically become evidence unless re-validated and bound to entities at inference time (rule M2).

The Memory Context Layer is the **single read path** for organizational memory entering the intelligence pipeline — parallel to how the Graph Context Layer handles relational context.

```
IntelligenceRequest + EvidenceCollection
            │
            ▼
   DefaultMemoryContextBuilder
            │
     ┌──────┴──────┐
     │             │
  disabled    memory-not-connected
  (no flag)   (includeMemory: true)
     │             │
     └──────┬──────┘
            ▼
      MemoryContext (empty entries + metadata)
            │
            ▼
   IntelligenceResult.memoryContext
```

---

## Memory vs Knowledge

| | Memory (BUILD-027) | Knowledge Module (`/knowledge`) |
|---|---------------------|--------------------------------|
| **Nature** | Operational context — what the org is working on | Document corpus — indexed files and collections |
| **Examples** | Conversations, watchlists, saved commands, pinned refs | Country reports, legal docs, strategy PDFs |
| **Feeds** | Command pipeline, agent context | Search, RAG, document evidence |
| **Storage** | Future tenant-scoped memory store | Future document index |
| **Rule** | Must link to entity or document ID (M8) | Source health and indexing status |

Constitution §11.4: Knowledge provides **corpus**. Memory provides **context**.

The `knowledge` memory **category** holds pinned references *to* corpus items — not duplicate file storage.

---

## File Structure

```
lib/intelligence/
├── context.types.ts            Extended MemoryContext + metadata
└── memory/
    ├── index.ts                Public barrel exports
    ├── context-builder.ts      MemoryContextBuilder + DefaultMemoryContextBuilder
    ├── categories.ts             Memory category taxonomy
    └── memory-store.ts           Store interfaces only (no implementation)
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/context.types.ts` | `enabled`, `MemoryContextMetadata`, `MemoryContextStatus` |
| `lib/intelligence/engine/stages.ts` | `stageMemoryContext` delegates to builder |
| `lib/intelligence/engine/pipeline.ts` | Always runs memory stage with evidence |
| `lib/intelligence/index.ts` | Re-exports memory module |

---

## Builder Contract

### `MemoryContextBuilder` interface

```typescript
interface MemoryContextBuilder {
  build(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<MemoryContextBuildResult>;
}
```

### Disabled context (`includeMemory !== true`)

```typescript
{
  enabled: false,
  entries: [],
  tenantId: request.tenantId,
  metadata: { status: "disabled", message: "…includeMemory is not true." },
  registeredCategories: [8 category IDs],
}
```

### Not-connected context (`includeMemory === true`)

```typescript
{
  enabled: true,
  entries: [],
  tenantId: request.tenantId,
  metadata: { status: "memory-not-connected", message: "…store is not connected." },
  registeredCategories: [8 category IDs],
}
```

---

## Memory Categories

| Category | Purpose |
|----------|---------|
| `conversation` | Thread history linked to entities |
| `entity` | Watchlists, pinned entities, entity notes |
| `knowledge` | Pinned document/corpus references |
| `reasoning` | Saved intelligence and trace refs |
| `agent` | Agent task history and delegation context |
| `preference` | User/tenant routing preferences |
| `session` | Ephemeral active-run context |
| `future` | Reserved forward-compatible expansion |

`LEGACY_MEMORY_ENTRY_CATEGORY_MAP` bridges specification §9.2 `MemoryEntryCategory` values to the BUILD-027 taxonomy for future CBAI Core integration.

---

## Memory Store (Interfaces Only)

| Interface | Purpose |
|-----------|---------|
| `MemoryRecord` | Single persisted memory item shape |
| `MemoryQuery` | Tenant, category, entity, conversation filters |
| `MemoryQueryResult` | Query envelope with optional total count |
| `MemoryStore` | Read path: `query`, `get` |
| `MemoryStoreWriter` | Write path: `create`, `update`, `delete` |
| `MemoryStoreProvider` | Combined read/write contract |

**No implementation.** Future builds provide tenant-scoped backends without changing the builder interface.

---

## Pipeline

```
Request → Evidence → Confidence → Trust → Graph → Memory → Trace → Result
```

Memory stage always runs. Builder handles disabled vs not-connected internally.

```typescript
const memoryContext = await stageMemoryContext(validatedRequest, evidence);
```

---

## Future Persistence Model

| Phase | Capability |
|-------|------------|
| **BUILD-027** (this build) | Builder + store interfaces, no reads |
| **BUILD-028+** | In-memory or API-backed `MemoryStore` for development |
| **Phase 2** | Tenant-scoped database (Postgres/D1) with encryption at rest |
| **Phase 3** | Memory write policy engine (agent dispatch rules M7) |
| **Phase 4** | Cross-region replication and data residency options |
| **Phase 5** | Audit export and retention policies |

Reads flow: `MemoryStore.query()` → `mapRecordsToEntryRefs()` → `MemoryContext.entries`.

Writes remain on separate `MemoryStoreWriter` — pipeline stages use read-only `MemoryStore`.

---

## Agent Memory

Agent memory falls under the `agent` category:

- Task history linked to entity IDs
- Prior agent outputs referenced in new runs (not auto-trusted as evidence)
- Merge rules per Intelligence Specification §11 (MA1–MA6)

Agents **cannot write memory** without explicit user action or automation policy (M7). The split `MemoryStore` / `MemoryStoreWriter` interfaces enforce read-only pipeline access by default.

Future agent runtime receives memory context from `MemoryContext.entries` filtered by `agent` and `conversation` categories.

---

## Entity Memory

Entity memory falls under the `entity` category:

- Watchlists and monitored entities
- Entity-scoped notes with required `entityIds[]` (M8)
- Regeneration triggers when watched entities change (Specification §2.5)

`subjectEntityTypes` on `MemoryContext` scopes memory reads to request entity types. Future store queries filter by `MemoryQuery.entityIds` from request `subjectEntities`.

Entity Framework is **not modified** — memory references entity IDs only.

---

## Enterprise Memory Governance

| Rule | Source | BUILD-027 preparation |
|------|--------|----------------------|
| Memory must link to entities or documents | Constitution M8 | `MemoryRecord.entityIds`, `documentIds` |
| Tenant-scoped isolation | Constitution M5 | `MemoryQuery.tenantId`, `MemoryContext.tenantId` |
| Agents cannot silently write | Specification M7 | Separate `MemoryStoreWriter` |
| Users inspect/edit/delete | Specification M10 | Future settings UI + writer `delete` |
| Memory ≠ evidence | Specification M2 | Builder does not promote entries to evidence |
| Delete memory ≠ delete audit trace | Specification M11 | Store design separates trace persistence |

Enterprise approval workflows will gate `MemoryStoreWriter.create` for `reasoning` and `agent` categories.

---

## Why No Persistence Yet

Same incremental strategy as Evidence (BUILD-023), Confidence (BUILD-024), Trust (BUILD-025), and Graph (BUILD-026):

1. **Contract before storage** — builder and store interfaces define the read/write boundary
2. **No browser APIs** — Cloudflare static export has no server or localStorage dependency
3. **Explicit not-connected state** — auditable distinction from disabled
4. **Category taxonomy first** — governance rules apply before data exists

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 18 static routes |
| `includeMemory` omitted | `enabled: false`, status `disabled` |
| `includeMemory: true` | status `memory-not-connected`, empty entries |
| Entity Framework | Unmodified |
| UI / dashboard | Unmodified |

---

## Usage Example (not wired to UI)

```typescript
import { defaultMemoryContextBuilder } from "@/lib/intelligence";

const memory = await defaultMemoryContextBuilder.build(
  {
    id: "req-001",
    question: "Continue Uzbekistan analysis",
    requestedAt: new Date().toISOString(),
    includeMemory: true,
    conversationId: "conv-42",
    tenantId: "tenant-acme",
  },
  evidence,
);

// memory.metadata?.status === "memory-not-connected"
// memory.entries.length === 0
// memory.registeredCategories.length === 8
```

---

*BUILD-027 — Memory Context Layer. No commits created.*
