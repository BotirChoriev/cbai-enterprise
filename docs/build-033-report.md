# BUILD-033 Report — Document Evidence Adapter Foundation

**Build:** BUILD-033  
**Date:** July 2026  
**Scope:** Document Evidence Adapter foundation for the CBAI Intelligence Engine  
**Status:** Complete — registered, disabled, zero items

---

## Summary

BUILD-033 introduces `lib/intelligence/evidence/adapters/document/` — the Document Evidence Adapter **foundation**. The adapter is registered in the evidence source registry with id **`document`** but remains **`enabled: false`**.

Collection returns **zero evidence items** with an explicit not-connected warning. No fake documents, mock content, file reads, cloud fetches, or browser storage access occur.

---

## Document Evidence Purpose

Document evidence will ground intelligence claims in **indexed knowledge document chunks** — verbatim excerpts from ingested PDF, CSV, TXT, and other files linked to entities and tenants.

Per Intelligence Specification §3.3, the `document` source class carries **high epistemic weight** when citations are exact. Document evidence answers:

> "What do our ingested knowledge documents say that supports this claim?"

BUILD-033 prepares the adapter contract only. Ingestion and chunk retrieval are deferred.

---

## Why the Adapter Is Disabled

| Reason | Detail |
|--------|--------|
| No ingestion pipeline | Knowledge module document index not connected |
| No file I/O | Cloudflare static export — no server-side file reads in BUILD-033 |
| No fabrication rule | Empty evidence is correct until real chunks exist |
| Conservative trust | Trust layer treats `document` class specially when present |

Enabling a zero-yield skeleton would add noise to collection runs without value. The adapter registers its presence but `getEnabled()` excludes it until ingestion connects.

When `collect()` is invoked directly (tests or future enablement), it returns:

```typescript
{
  items: [],
  warnings: ["document:ingestion-not-connected"]
}
```

With message: *"Knowledge document ingestion is not connected — no file reads, cloud fetches, or browser storage access occur in BUILD-033."*

---

## Architecture

```
IntelligenceRequest
        ↓
DocumentEvidenceAdapter [disabled]
        ↓
DocumentResolver.resolve()     → status: "not-connected", chunks: []
        ↓
DocumentEvidenceMapper.mapChunks() → []
        ↓
(not invoked by collector while disabled)
```

### Package: `lib/intelligence/evidence/adapters/document/`

| Component | BUILD-033 behavior |
|-----------|-------------------|
| `DocumentResolver` | Returns empty resolution + not-connected status |
| `DocumentEvidenceMapper` | Returns `[]` unless status is `ready` with chunks |
| `DocumentEvidenceAdapter` | `enabled: false`; id `document`; sourceClass `document` |

### Enabled adapters (unchanged)

| ID | Status |
|----|--------|
| `entity-profile` | Enabled |
| `graph` | Enabled |
| `search` | Enabled |
| `document` | **Disabled** (BUILD-033) |

Collector behavior is unchanged — disabled adapters are not invoked.

---

## Future Document Ingestion Path

```
Knowledge Module UI (/knowledge)
        ↓
Document upload + indexing (future API/worker)
        ↓
Chunk store (documentId, chunkId, excerpt, entity bindings)
        ↓
DocumentResolver.query(request) — scope by question + subjectEntities + tenantId
        ↓
DocumentEvidenceMapper — verbatim excerpts, provenance from ingestion record
        ↓
DocumentEvidenceAdapter [enabled]
        ↓
DefaultEvidenceCollector merge
```

**Extension steps (future builds):**

1. Connect Knowledge module index read API (static-safe or edge worker)
2. Implement `DocumentResolver.resolve()` against real chunk store
3. Set `resolution.status = "ready"` when chunks found
4. Map chunks with `provenanceStrength` from ingestion metadata (`verified` when citation exact)
5. Enable adapter: `enabled = true`
6. Wire `sourceTrustLevel` in Trust Layer from document provenance

---

## Relationship to Knowledge Module

The `/knowledge` dashboard page is the intended surface for document management. BUILD-033 does **not** modify that UI.

The document adapter will read from the same indexed corpus the Knowledge module displays — intelligence layer consumes chunks; Knowledge module owns ingestion and indexing.

| Layer | Responsibility |
|-------|----------------|
| Knowledge module | Upload, index, display, governance |
| Document adapter | Read indexed chunks → `Evidence` items |
| Evidence collector | Merge with entity, graph, search evidence |
| Trust layer | Elevated scrutiny for `document` source class |

---

## Future PDF / CSV / TXT Support

Declared in `FUTURE_SUPPORTED_DOCUMENT_FORMATS`:

| Format | Future use |
|--------|------------|
| `pdf` | Report and brief ingestion |
| `csv` | Structured data tables |
| `txt` | Plain-text knowledge files |

Format-specific parsers live in the ingestion pipeline — not in the intelligence adapter. The mapper receives normalized `ResolvedDocumentChunk` objects with verbatim excerpts regardless of source format.

---

## Safeguards Against Fabricated Documents

| Safeguard | Enforcement |
|-----------|-------------|
| No mock documents | Resolver returns empty chunks only |
| No file reads | No `fs`, fetch, or storage APIs in BUILD-033 |
| Verbatim excerpts only | Mapper uses `chunk.excerpt` directly (future) |
| Disabled by default | Collector skips adapter |
| Explicit warnings | `document:ingestion-not-connected` |
| Stable evidence ids | `document:{documentId}:{chunkId}` (future) |
| Provenance required | Every item requires `source.ref` to ingestion record |

---

## File Structure

### Created

```
lib/intelligence/evidence/adapters/document/
├── types.ts
├── document-resolver.ts
├── document-evidence-mapper.ts
├── document-evidence-adapter.ts
└── index.ts

docs/build-033-report.md
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/evidence/sources.ts` | Register disabled document adapter |
| `lib/intelligence/evidence/index.ts` | Export document adapter |
| `lib/intelligence/index.ts` | Re-exports |

### Unchanged

- `lib/intelligence/evidence/collector.ts` — disabled adapter not invoked
- UI, dashboard, Entity Framework, API routes

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes unchanged.

---

## References

- `docs/build-032-report.md` — search adapter
- `docs/CBAI-Intelligence-Specification-v1.md` §3.3 — `document` source class
- `lib/intelligence/trust/rules.ts` — `resolveSourceTrustLevel` document handling
