# BUILD-030 Report — Entity Profile Evidence Adapter

**Build:** BUILD-030  
**Date:** July 2026  
**Scope:** First real evidence source connecting Entity Framework to the Intelligence Engine  
**Status:** Complete — entity-profile adapter enabled

---

## Summary

BUILD-030 enables the **`entity-profile`** evidence source adapter. Country, Company, and University records are resolved through existing domain data and adapters, then converted into deterministic `Evidence` items with **`provenanceStrength: inferred`**.

No UI, Entity Framework source files, graph builder, API routes, LLM integration, or external fetching was added.

---

## Entity Profile Evidence Adapter

The adapter lives at `lib/intelligence/evidence/adapters/entity/`:

| Component | Responsibility |
|-----------|----------------|
| `EntityResolver` | Maps `request.subjectEntities` → domain records via `toCountryEntity`, `toCompanyEntity`, `toUniversityEntity` |
| `EntityEvidenceMapper` | Converts resolved `Entity` records → up to 6 `Evidence` items each |
| `EntityProfileEvidenceAdapter` | Implements `EvidenceSourceAdapter`; id `entity-profile`; **enabled by default** |

**Pipeline integration:**

```
IntelligenceRequest.subjectEntities
        ↓
EntityProfileEvidenceAdapter.collect()
        ↓
DefaultEvidenceCollector (dedupe, sort, sufficiency, warnings)
        ↓
Confidence → Trust → Graph → Memory → Trace → Result
```

---

## Why Evidence Is Inferred

Entity profile data is **platform-curated static dataset** content:

- `overview`, `aiSummary`, scores, and relationships originate from CBAI domain modules
- `aiSummary` is platform-assessed narrative — not third-party verified fact
- No external verification chain exists in BUILD-030

Every evidence item declares:

```typescript
source.provenanceStrength = "inferred"
```

Excerpts from `aiSummary` are prefixed with `"Platform assessment:"` to avoid implying external verification. The Result Layer still does not synthesize business conclusions — it reports factual collection metrics only.

---

## Supported Entity Types

| Type | Domain store | Adapter | Status |
|------|--------------|---------|--------|
| `country` | `lib/countries.ts` | `toCountryEntity` | Connected |
| `company` | `lib/companies.ts` | `toCompanyEntity` | Connected |
| `university` | `lib/universities.ts` | `toUniversityEntity` | Connected |

---

## Unsupported Entity Handling

Types in the ontology but without domain data (`government`, `investor`, `person`) produce:

- Warning: `entity-type-not-connected:{type}:{id}`
- Zero evidence items for that ref
- No thrown errors — collection continues for other refs

**Missing entity id:**

- Warning: `entity-not-found:{type}:{id}`
- Zero items for that ref

**No subjectEntities:**

- Warning: `entity-profile:no-subject-entities`
- Zero items — preserves empty behavior when scope is absent

**Duplicate refs:**

- Warning: `duplicate-subject-entity:{type}:{id}`
- Resolved once

---

## Evidence Items Per Entity (Max 6)

| ID suffix | Content | Relevance |
|-----------|---------|-----------|
| `:overview` | `entity.overview` | 75 |
| `:ai-summary` | Platform-prefixed `aiSummary` | 70 |
| `:scores` | AI / Investment / Risk scores | 65 |
| `:classification` | Category, subtitle, status | 55 |
| `:relationships` | Domain relationship summary | 50 |
| `:signals` | Platform-assessed risk/investment/AI signals | 50 |

---

## Sufficiency Rules

Conservative volume-based evaluation in `lib/intelligence/evidence/sufficiency.ts`:

| Item count | `sufficiencyStatus` | Notes |
|------------|---------------------|-------|
| 0 | `insufficient` | Zero confidence/trust grounding |
| 1 | `minimum` | Minimal support |
| 2–3 | `partial` | New BUILD-030 tier |
| 4+ | `adequate` | Sufficient tier (spec "adequate") |

**Comparative requests** with multiple `subjectEntities` require **≥ 1 evidence item per subject entity** to reach `partial` or above. If any subject lacks coverage, status is capped at `minimum`.

Confidence and trust layers were updated to score the new `partial` tier conservatively (52 / 32 base respectively).

---

## Collector Changes

| Change | Detail |
|--------|--------|
| Registry | `entity-profile` adapter enabled; other adapters remain disabled skeletons |
| Dedup | By stable evidence `id` |
| Sort | Relevance descending (EV6) |
| Warnings | Propagated to `EvidenceCollectionMetadata.warnings` |
| Status | `partial` when warnings or zero items with subject scope |

---

## Future Government / Investor / Person Support

1. Add domain module + `toXEntity()` adapter (Entity Framework pattern — outside intelligence layer)
2. Extend `EntityResolver.lookupSupportedEntity()` with new case
3. No change to `EntityProfileEvidenceAdapter` interface or source class

Unsupported types already emit `entity-type-not-connected` warnings — the extension path is resolver-only.

---

## File Structure

### Created

```
lib/intelligence/evidence/adapters/entity/
├── types.ts
├── entity-resolver.ts
├── entity-evidence-mapper.ts
├── entity-profile-adapter.ts
└── index.ts

lib/intelligence/evidence/sufficiency.ts
docs/build-030-report.md
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/evidence.types.ts` | Added `partial` sufficiency; `metadata.warnings` |
| `lib/intelligence/evidence/sources.ts` | Adapter collect result type; register enabled entity-profile |
| `lib/intelligence/evidence/collector.ts` | Dedupe, sort, sufficiency, warnings |
| `lib/intelligence/evidence/index.ts` | Export entity adapter + sufficiency |
| `lib/intelligence/confidence/factors.ts` | `partial` volume score |
| `lib/intelligence/trust/rules.ts` | `partial` trust base |
| `lib/intelligence/index.ts` | Re-exports |

---

## Risks and Safeguards

| Risk | Safeguard |
|------|-----------|
| aiSummary treated as verified | `provenanceStrength: inferred`; platform prefix |
| Unscoped evidence fabrication | Requires `subjectEntities`; zero items otherwise |
| Confidence inflation | Conservative sufficiency tiers; graph/entity factors still deferred |
| Duplicate evidence | Dedup by evidence id |
| Unsupported type silent failure | Explicit warning codes |
| Entity Framework coupling | Read-only imports; no EF file changes |

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes unchanged.

---

## References

- `docs/build-030a-entity-intelligence-adapter-design.md` — design predecessor
- `docs/build-023-report.md` — Evidence Layer foundation
- `docs/CBAI-Intelligence-Specification-v1.md` §3 — Evidence model
