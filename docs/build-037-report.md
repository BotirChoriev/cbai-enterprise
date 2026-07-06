# BUILD-037 Report — Contradiction Detection Layer

**Build:** BUILD-037  
**Date:** July 2026  
**Scope:** Deterministic Contradiction Detection Layer for the CBAI Intelligence Engine  
**Status:** Complete — pipeline order updated; no AI inference

---

## Purpose

BUILD-037 introduces `lib/intelligence/contradictions/` — a deterministic layer that analyzes collected evidence for **objective conflicts** before confidence and trust assessment. The layer detects structural inconsistencies only; it does not infer meaning from natural language or use AI models.

---

## Architecture

```
Request
      ↓
Evidence Collection (+ quality assessment in collector)
      ↓
Contradiction Detection   ← BUILD-037
      ↓
Confidence Assessment
      ↓
Trust Assessment
      ↓
Graph → Memory → Trace → Result
```

Quality assessment remains inside the Evidence Collector (BUILD-034). Contradiction Detection is a **separate pipeline stage** inserted after collection and before confidence.

### New modules

| File | Responsibility |
|------|----------------|
| `contradictions/types.ts` | `EvidenceContradiction`, `ContradictionSummary`, detection result types |
| `contradictions/rules.ts` | Deterministic contradiction rules |
| `contradictions/detector.ts` | `ContradictionDetector` + `DefaultContradictionDetector` |
| `contradictions/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `evidence.types.ts` | `EvidenceConflictMetadata`; collection contradiction fields |
| `engine/stages.ts` | `stageContradictionDetection` |
| `engine/pipeline.ts` | Stage inserted after evidence collection |
| `pipeline-stage.types.ts` | `contradiction-detection` stage id |
| `trace.types.ts` | `CONTRADICTION_DETECTION_STAGE_ID` |
| `trace/timeline.ts` | Stage order updated |
| `trace/trace-builder.ts` | Contradiction stage output summary |
| `trace/verification.ts` | Contradiction warnings in audit |
| `index.ts` | Public exports |

---

## Detection Rules

All rules are **fully deterministic** and require **relevance ≥ 40** on both evidence items (Specification §7).

| Rule ID | Detects | Severity |
|---------|---------|----------|
| `explicit-conflict-flag` | `Evidence.conflict.flagged` with `relatedEvidenceIds` | critical |
| `impossible-state-combination` | Different `Entity status:` values in classification excerpts for same entity | critical |
| `property-value-conflict` | Same entity + property + different normalized excerpt values | major |
| `duplicate-id-payload-conflict` | Same canonical evidence key + different evidence ids + different payloads | major |
| `timestamp-order-conflict` | Later `retrievedAt` with better staleness than earlier retrieval | minor |

### What is NOT detected

- Semantic or natural-language meaning conflicts
- LLM-inferred contradictions
- Conflicts without objective structural signals
- Fabricated or mock contradictions

---

## Contradiction Record Shape

Each detected contradiction includes:

```typescript
{
  id: string;              // deterministic: contradiction:{ruleId}:{leftId}:{rightId}
  entityId: string;
  property: string;
  leftEvidenceId: string;  // lexicographically sorted pair
  rightEvidenceId: string;
  severity: "critical" | "major" | "minor";
  description: string;
  ruleId: string;
}
```

---

## Summary Shape

```typescript
{
  totalContradictions: number;
  critical: number;
  major: number;
  minor: number;
  hasBlockingConflict: boolean;  // true when critical > 0 or major > 0
}
```

---

## Evidence Collection Enrichment

After detection, the evidence collection passed downstream includes:

| Field | Description |
|-------|-------------|
| `contradictionState` | `none` or `detected` |
| `contradictions` | Array of detected contradictions |
| `contradictionSummary` | Aggregated counts |
| `contradictionDetection` | Detector id, version, timestamp |

Empty evidence yields `contradictionState: "none"` with zero contradictions.

---

## Downstream Effects

### Trust (BUILD-025 / BUILD-036)

Trust rules already read `evidence.contradictionState`. When state is `detected`, `TRUST_CAP_CONTRADICTION_OPEN` caps trust score at 25.

### Trace (BUILD-028)

The reasoning trace records the contradiction stage in the timeline and emits audit warnings when contradictions are detected.

### Confidence

Confidence formula unchanged in BUILD-037. Contradiction metadata is available for future integration.

---

## Empty Evidence Behavior

| Field | Value |
|-------|-------|
| `contradictionState` | `none` |
| `contradictions` | `[]` |
| `contradictionSummary.totalContradictions` | `0` |
| `hasBlockingConflict` | `false` |

---

## Backward Compatibility

- Existing `EvidenceCollection` fields unchanged.
- New fields are optional — consumers ignoring them continue to work.
- `Evidence.conflict` is optional — adapters may declare explicit flags in future builds.
- No UI, API, database, or external service changes.

---

## Future Work

| Phase | Enhancement |
|-------|-------------|
| Phase 2 | Adapter-declared `Evidence.conflict` flags from document ingestion |
| Phase 3 | Confidence integration with contradiction caps |
| Phase 4 | Human resolution workflow (`resolved-human`, `deferred`) |
| Phase 5 | Contradiction surfacing in Result Layer warnings |

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes and no TypeScript errors.

---

## Files

### Created

- `lib/intelligence/contradictions/detector.ts`
- `lib/intelligence/contradictions/rules.ts`
- `lib/intelligence/contradictions/types.ts`
- `lib/intelligence/contradictions/index.ts`
- `docs/build-037-report.md`

### Modified

- `lib/intelligence/evidence.types.ts`
- `lib/intelligence/engine/stages.ts`
- `lib/intelligence/engine/pipeline.ts`
- `lib/intelligence/engine/index.ts`
- `lib/intelligence/pipeline-stage.types.ts`
- `lib/intelligence/trace.types.ts`
- `lib/intelligence/trace/timeline.ts`
- `lib/intelligence/trace/trace-builder.ts`
- `lib/intelligence/trace/verification.ts`
- `lib/intelligence/index.ts`
