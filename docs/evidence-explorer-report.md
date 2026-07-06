# CBAI Evidence Explorer — Implementation Report

**Version:** 1.0.0  
**Route:** `/knowledge`  
**Date:** July 2026

## Summary

The `/knowledge` route was transformed from a mock document-management UI into the **CBAI Evidence Explorer** — a core platform module that exposes real evidence architecture and current source status. No fake documents, sources, verification states, or AI summaries are displayed.

## Architecture

```
lib/evidence-explorer.ts
  └── buildEvidenceExplorerModel()
        ├── Evidence Infrastructure (OFFICIAL_EVIDENCE_SOURCES, getInfrastructureSummary)
        ├── Global Indicator Framework (ALL_DOMAIN_INDICATORS, INDICATOR_DOMAIN_CATALOG)
        ├── Entity registries (countries, companies, universities)
        ├── Knowledge Graph (buildKnowledgeGraph, computeGraphStats)
        └── Coverage helpers (resolveSourceDisplayName, mapIndicatorStatusToLabel)

components/evidence/EvidenceExplorer.tsx
  ├── EvidenceSourceCoverage
  ├── EvidenceIndicatorMap
  ├── EntityEvidenceCoverage
  ├── EvidenceLifecycle
  ├── EvidenceMethodology
  ├── EvidencePersonas
  └── EvidenceTrust

app/(dashboard)/knowledge/page.tsx → EvidenceExplorer
lib/navigation.ts → "Evidence Explorer" label
```

## Data Sources (Real Only)

| Section | Source |
|---------|--------|
| Source Coverage | `lib/evidence-infrastructure/sources/catalog.ts` |
| Indicator Evidence Map | `lib/indicator-framework/` |
| Entity Evidence Coverage | Entity registries + `getIndicatorsForEntity()` |
| Lifecycle counts | Derived from source connection/verification + indicator status |
| Methodology / Trust / Personas | Declarative copy aligned with Constitution and Standards |

## Removed Mock Data

The following were **removed from the `/knowledge` route** (no longer imported):

- `lib/knowledge.ts` — fake collections (2,847 docs, 97.4% confidence)
- `knowledgeActivity` — fabricated activity feed
- `sourceHealth` — fake Pinecone/Salesforce health metrics
- `KnowledgeStats`, `DocumentCard`, `SourceHealth`, `KnowledgeActivity` components

Legacy files under `components/knowledge/` and `lib/knowledge.ts` remain in the repo but are **orphaned** from navigation and the page.

## Current Platform State (Honest Labels)

- **Connected sources:** 1 (`cbai-local-registry`)
- **Planned sources:** 12 official sources registered, not wired
- **Connected indicators:** 3 (one per entity type where applicable)
- **Not connected indicators:** majority of framework indicators

Status labels used:

- `Connected`
- `Evidence source planned`
- `Evidence source not connected`
- `Verification pending` / `Verified` / `Not started`

## Page Sections

1. **Hero** — mission statement and summary metrics
2. **Source Coverage** — full source registry table
3. **Indicator Evidence Map** — indicators grouped by domain
4. **Entity Evidence Coverage** — Countries, Companies, Universities modules
5. **Evidence Lifecycle** — Planned → Connected → Verification Pending → Verified → Deprecated
6. **Methodology** — no evidence → no score; evidence/judgment separation
7. **Personas** — six audiences with "What can I verify here?"
8. **Trust Principles** — six constitutional pillars

## Constraints Honored

- Did **not** modify: `lib/intelligence/`, `runtime/`, `agents/`, `reasoning/`, `orchestrator/`
- No fake data, charts, confidence scores, or AI summaries
- Reused Constitution-aligned patterns from Countries/Companies/Universities 2.0

## Verification

Run:

```bash
npm run lint
npm run build
```

Both must pass before merge.
