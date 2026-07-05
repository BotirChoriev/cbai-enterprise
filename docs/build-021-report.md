# BUILD-021 Report — Intelligence Engine Foundation

**Build:** BUILD-021  
**Date:** July 2026  
**Scope:** TypeScript interface foundation for the CBAI Intelligence Engine  
**Status:** Complete — types only, no implementation

---

## Summary

BUILD-021 creates `lib/intelligence/` — the first implementation layer for the CBAI Intelligence Engine. The module defines framework-agnostic TypeScript interfaces and supporting type aliases derived from:

- `docs/CBAI-Intelligence-Specification-v1.md` (epistemology)
- `docs/CBAI-Domain-Model-v1.md` (ontology and reasoning pipelines)
- `docs/CBAI-Constitution-v1.md` (memory, explainability, governance)

No runtime logic, mock data, UI, API routes, or AI model integration was added. Existing modules, Entity Framework, dashboard pages, and Cloudflare static export compatibility are unchanged.

---

## File Structure

```
lib/intelligence/
├── index.ts              Public barrel exports
├── request.types.ts      IntelligenceRequest and input scoping
├── evidence.types.ts     Evidence, EvidenceSource, EvidenceCollection
├── confidence.types.ts     ConfidenceAssessment
├── trust.types.ts        TrustAssessment
├── context.types.ts      GraphContext, MemoryContext
├── trace.types.ts        ReasoningTrace, AgentDecision
├── result.types.ts       IntelligenceResult
└── engine.types.ts       IntelligenceEngine contract
```

---

## Interface Reference

### IntelligenceRequest

**File:** `request.types.ts`

**Why it exists:** Every intelligence run begins with a structured input envelope. The Intelligence Specification defines intelligence as a product of inference over typed world objects — not free-form chat. `IntelligenceRequest` captures the question, optional entity scope, intent classification hints, and flags for memory/graph inclusion.

**Specification alignment:** §2 (lifecycle entry at Reason stage), §6 (signal prioritization by intent), §9 (memory read rules), §10 (graph traversal scope).

**Key fields:**
- `question` — natural-language intelligence query
- `type` / `intent` — optional pre-classification; engine may infer
- `subjectEntities` — scopes search seeds and evidence binding
- `includeMemory` / `includeGraph` — controls context injection without coupling to UI

**Supporting types:** `IntelligenceType`, `QueryIntent`, `EntityRef`

---

### EvidenceSource

**File:** `evidence.types.ts`

**Why it exists:** Evidence without provenance is anecdote, not evidence (Specification §3.1). Every evidence item must declare where it came from and how trustworthy that origin is.

**Specification alignment:** §3.2–§3.4 (source classes, provenance strength, recency).

**Key fields:**
- `class` — one of seven evidence source classes (`entity-profile`, `search`, `knowledge-graph`, `document`, `agent-output`, `human-input`, `external-feed`)
- `ref` — optional document ID, URL, or ingestion record
- `provenanceStrength` — `verified` | `inferred` | `unverified`
- `retrievedAt` — collection timestamp for freshness evaluation

---

### Evidence

**File:** `evidence.types.ts`

**Why it exists:** Evidence is the atomic unit of justification. Every intelligence claim must decompose to evidence items. Uses entity references (`entityId`, `entityType`, `entityName`) rather than full `Entity` objects to keep the intelligence layer decoupled from adapter payloads and framework-specific rendering shapes.

**Specification alignment:** §3.1–§3.2 (evidence item structure), §3.4 (quality dimensions).

**Key fields:**
- `relevance` — 0–100 support strength for the active claim
- `excerpt` — human-readable text for explainability surfaces
- `relationshipLabel` — graph edge label for relational evidence
- `staleness` — freshness indicator (`fresh` | `aging` | `stale`)

---

### EvidenceCollection

**File:** `evidence.types.ts`

**Why it exists:** Individual evidence items are insufficient for governance decisions. The collection aggregates items with sufficiency evaluation and contradiction state so confidence and trust assessments can apply specification caps (e.g. insufficient evidence → confidence band floor).

**Specification alignment:** §3.5–§3.6 (aggregation rules, sufficiency thresholds), §7 (contradiction state).

**Key fields:**
- `claimType` — determines minimum evidence thresholds (`descriptive`, `relational`, `comparative`, `strategic`, `high-stakes`)
- `sufficiencyStatus` — `insufficient` | `minimum` | `adequate` | `strong`
- `contradictionState` — `none` through `unresolvable`
- `sourceClassCount` — feeds trust tier corroboration requirements

---

### ConfidenceAssessment

**File:** `confidence.types.ts`

**Why it exists:** Confidence answers "How justified is this conclusion given what we know right now?" — not "Will this prediction come true?" (Specification §4.1). Separating confidence from trust prevents UI and automation from conflating evidence quality with organizational permission to act.

**Specification alignment:** §4 (confidence model), §4.4 (bands), §12 (factor breakdown on explainability request).

**Key fields:**
- `score` — composite 0–100
- `band` — `insufficient` | `moderate` | `strong` | `very-strong` | `near-complete`
- `factors` — weighted breakdown (`evidence-volume`, `source-relevance`, `graph-connectivity`, `entity-signal-quality`)
- `degraded` / `degradationReason` — staleness, contradiction, or cap reductions

**Supporting types:** `ConfidenceFactor`, `ConfidenceBand`, `ConfidenceFactorId`

---

### TrustAssessment

**File:** `trust.types.ts`

**Why it exists:** Trust is organizational, not statistical (Specification §5.1). It governs whether intelligence may drive agent dispatch, automation triggers, or executive decisions. A high-confidence product with weak provenance must not receive operational trust.

**Specification alignment:** §5 (trust model), §5.2 (tiers T0–T4), §5.5 (source trust).

**Key fields:**
- `tier` — `unverified` | `exploratory` | `operational` | `authoritative` | `human-authored`
- `producer` — who produced the intelligence (engine, agent, human, ingestion)
- `sourceTrustLevel` — highest document/feed trust among cited evidence
- `capsApplied` — audit trail of trust reductions (contradiction, staleness, etc.)
- `humanVerified` — whether human review elevated trust

**Supporting types:** `TrustTier`, `IntelligenceProducer`, `IntelligenceProducerType`, `SourceTrustLevel`

---

### GraphContext

**File:** `context.types.ts`

**Why it exists:** The Knowledge Graph is the relational evidence layer (Specification §10). Graph traversal produces evidence items, feeds the graph connectivity confidence factor, and detects stalemates when no paths exist between query-central entities.

**Specification alignment:** §10.1–§10.4 (graph role, traversal rules, connectivity contribution, stalemate).

**Key fields:**
- `seedNodeIds` — graph nodes from search matches
- `traversedPaths` — validated edge paths used as relational evidence
- `connectivityScore` — normalized 0–100 input to confidence factor
- `stalemate` — true when relational claims cannot be graph-validated

**Supporting types:** `IntelligenceGraphPath`, `IntelligenceGraphEdgeType`

**Design note:** Edge types are declared locally in the intelligence module rather than imported from `lib/graph/` to keep the engine layer portable. Values mirror the Domain Model edge catalog exactly.

---

### MemoryContext

**File:** `context.types.ts`

**Why it exists:** Memory shapes future intelligence without replacing evidence (Specification §9.1). Organizational context — pinned knowledge, conversations, saved commands, watchlists — is injected into inference pipelines but does not automatically become evidence.

**Specification alignment:** §9.2–§9.5 (memory categories, read/write rules, Knowledge module boundary).

**Key fields:**
- `entries` — references to memory items with required entity links (Constitution §11.3 M8)
- `tenantId` — production multi-tenancy scope
- `subjectEntityTypes` — optional scope filter

**Supporting types:** `MemoryEntryRef`, `MemoryEntryCategory`

---

### AgentDecision

**File:** `trace.types.ts`

**Why it exists:** Intelligence often emerges from multi-agent collaboration (Specification §11). Each agent contribution must be individually attributed in the audit trace for explainability and merge-rule enforcement (conflicting outputs trigger contradiction flow; merged trust = min of contributors).

**Specification alignment:** §11.1–§11.3 (collaboration model, merge rules).

**Key fields:**
- `agentId` / `agentName` — producer identity
- `contribution` — summary of what the agent contributed
- `trustTier` — trust assigned to this agent's output at merge time
- `success` / `error` — failure must appear in trace, not be hidden in merge

---

### ReasoningTrace

**File:** `trace.types.ts`

**Why it exists:** Explainability is a requirement for intelligence legitimacy (Specification §12). Every verified reasoning run must produce an audit trace containing stage sequence, durations, verification results, and agent contributions (§8.5).

**Specification alignment:** §8 (reasoning verification), §12 (explainability), Domain Model §6.1–§6.2 (pipeline stages).

**Key fields:**
- `stages` — ordered `ReasoningStageTrace` records for Core and Reasoning Engine stages
- `agentDecisions` — per-agent attribution
- `verificationResult` — overall `pass` | `fail` | `degraded`
- `producerVersion` / `modelId` — reproducibility metadata for Phase 2+ model backends

**Supporting types:** `ReasoningStageTrace`, `PipelineStageId`, `ReasoningStageId`, `CorePipelineStageId`, `StageVerificationResult`, `TraceVerificationResult`

---

### IntelligenceResult

**File:** `result.types.ts`

**Why it exists:** The complete intelligence product — the governed output satisfying all six criteria from Specification §1.1: grounded, supported, scored, explainable, governed, and actionable. This is the primary artifact the engine produces and what future UI, agents, and memory persistence will consume.

**Specification alignment:** §1.4 (intelligence artifact schema), §2.3 (lifecycle states), §13 (override status).

**Key fields:**
- `claim` / `finalAnswer` — conclusion text
- `subjectEntities` — grounding requirement
- `evidence`, `confidence`, `trust` — epistemic envelope
- `reasoningTrace` — full audit trail
- `graphContext` / `memoryContext` — optional context snapshots
- `summary` — headline, findings, caveats, recommended actions
- `lifecycleState` / `overrideStatus` / `isStale` — governance and freshness

**Supporting types:** `IntelligenceSummary`, `IntelligenceSubjectEntity`, `IntelligenceLifecycleState`, `OverrideStatus`

---

### IntelligenceEngine

**File:** `engine.types.ts`

**Why it exists:** Defines the contract that future implementations must satisfy — mock engine (BUILD-022+), adapter bridge to existing Reasoning Engine, or model-backed production engine. Framework-agnostic: no React, Next.js, or AI SDK dependencies.

**Specification alignment:** Entire Intelligence Specification as normative behavior target.

**Methods:**
- `run(request)` — execute full pipeline; must satisfy §1.1 or fail governed (§15.2 F1)
- `verify?(result)` — optional structural re-verification per §8 without re-inference

**Supporting types:** `IntelligenceRun`, `IntelligenceRunStatus` — in-progress envelope for staged/streaming consumption without requiring a complete result.

---

## Relationship to Existing Code

| Existing module | Relationship to `lib/intelligence/` |
|-----------------|-------------------------------------|
| `lib/reasoning/reasoning.types.ts` | Parallel, narrower types for current Reasoning UI. Future build will bridge `ReasoningResult` → `IntelligenceResult`. Not modified in BUILD-021. |
| `lib/entity/entity.types.ts` | `EntityType` imported for references. Entity Framework unchanged. |
| `lib/graph/graph.types.ts` | Edge types mirrored locally. Graph builder unchanged. |
| `lib/core.ts` | Core pipeline stages reflected in `CorePipelineStageId`. Unchanged. |
| `lib/agents.ts` | Agent IDs will map to `AgentDecision.agentId`. Unchanged. |

---

## Design Decisions

### 1. Entity references, not full Entity objects

Evidence and results use `{ type, id, name }` refs instead of embedding `Entity`. This keeps the intelligence layer independent of adapter shape changes and supports future backend serialization without UI-specific fields (`icon`, `metrics`, etc.).

### 2. Local graph edge type union

`IntelligenceGraphEdgeType` duplicates `GraphEdgeType` values intentionally. The intelligence engine should not depend on graph layout types (`GraphNode.x`, `GraphNode.y`). A future adapter will map between layers.

### 3. Separate confidence and trust types

Specification explicitly separates evidence quality (confidence) from organizational permission to act (trust). Combined into one type would violate §4 vs §5 semantics and encourage UI anti-patterns.

### 4. Optional `verify` on IntelligenceEngine

Structural verification (§8) may run post-hoc on saved intelligence without re-running inference. Optional method keeps the contract minimal for mock implementations that verify inline.

### 5. No implementation in BUILD-021

Per build rules: interfaces only. The existing `/reasoning` page continues using `lib/reasoning/`. Wiring happens in a future build.

---

## Verification

| Check | Expected |
|-------|----------|
| `npm run lint` | Pass |
| `npm run build` | Pass — static export unchanged |
| Entity Framework | Unmodified |
| Dashboard pages | Unmodified |
| New routes | None |
| Mock data | None added |

---

## Next Steps (not in BUILD-021 scope)

1. **BUILD-022** — Mock intelligence engine implementing `IntelligenceEngine`
2. **BUILD-023** — Bridge adapter: `ReasoningResult` ↔ `IntelligenceResult`
3. **BUILD-024** — Wire Reasoning UI to intelligence engine types (no redesign)
4. **Future** — Persisted intelligence store, human override API, model backends

---

*BUILD-021 — Intelligence Engine type foundation. No commits created.*
