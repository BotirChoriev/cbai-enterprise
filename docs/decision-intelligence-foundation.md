# CBAI Decision Intelligence Foundation

**Version:** 1.0.0  
**Status:** Foundation layer — no UI, runtime, or AI integration in this release

---

## Purpose

The Decision Intelligence Foundation organizes evidence for **human decision-makers**. It is constitutional infrastructure — not an AI recommendation engine, prediction system, or policy advisor.

CBAI Decision Intelligence:

- Maps entities, indicators, evidence anchors, sources, and missions into a **decision context**
- Reports **evidence coverage** and **limitations** honestly
- References **methodology** before any evaluative use
- Requires **human review** for every context — always

CBAI Decision Intelligence never:

- Generates recommendations
- Suggests best choices or investments
- Advises governments, investors, or citizens on actions
- Produces predictions or policy conclusions
- Substitutes for human oversight

---

## Architecture

```
lib/decision-intelligence/
├── decision-types.ts       # Core type system and decision model
├── decision-version.ts     # Version manifest and review lifecycle
├── decision-context.ts     # Context builder from registry + missions
├── decision-evidence.ts    # Evidence coverage analysis
├── decision-readiness.ts   # Readiness state assessment
├── decision-summary.ts     # Factual summary builder
├── decision-validation.ts  # Constitutional validation
├── decision-registry.ts    # Template registry and package builders
└── index.ts                # Public API
```

### Integration layers

| Layer | Usage |
|-------|-------|
| Global Registry | Resolves `entityIds`, indicator scope, registry links |
| Mission Catalog | Scopes decision contexts to mission requirements |
| Indicator Framework | Methodology references and evidence anchors |
| Evidence Infrastructure | Official source registry and connection status |
| Evidence Pipeline | Future — pipeline stage compatibility (not wired in v1) |
| Platform Context | Future — entity selection from URL context params |

---

## Decision Model

Each `DecisionContextRecord` contains:

| Field | Description |
|-------|-------------|
| `decisionContextId` | Permanent ID — format `decision-{slug}` |
| `entityIds` | Global Registry entity references |
| `indicatorIds` | Global Indicator Framework IDs |
| `evidenceIds` | Evidence anchor IDs (`evidence-{indicator-slug}`) |
| `sourceIds` | Official evidence source IDs |
| `missionIds` | Mission Catalog IDs |
| `readinessStatus` | Evidence posture state (see below) |
| `limitations` | Honest constraints and gaps |
| `evidenceCoverage` | Available, missing, and planned evidence slots |
| `methodologyReferences` | Per-indicator methodology disclosure |
| `humanReviewRequired` | Always `true` |
| `version` | Record schema version |

---

## Decision Readiness

Readiness states describe **evidence posture**, not conclusions:

| State | Meaning |
|-------|---------|
| `insufficient_evidence` | Required evidence largely unavailable — review cannot proceed meaningfully |
| `partial_evidence` | Some evidence mapped — gaps must be disclosed |
| `ready_for_review` | Evidence mapping complete for declared indicators — human review required |
| `verified_evidence` | All slots available and official sources connected and verified |

Assessment is computed from factual coverage ratios and source connection status — never from scores or inference.

---

## Evidence Coverage

`buildEvidenceCoverage(indicatorIds)` produces:

- **Available** — indicators with `connected` status
- **Missing** — indicators with `not_connected` status
- **Planned** — indicators marked `planned`
- **Official sources** — referenced sources with connection and verification status
- **Coverage ratio** — `availableCount / totalRequired` (descriptive, not a quality score)

---

## Limitations

Every decision context includes standard limitations:

1. Foundation organizes evidence only — no recommendations
2. Human review with methodology verification is mandatory
3. Static export — no live evidence ingestion
4. State-specific disclosure (insufficient, partial, ready, verified)

Additional limitations may be appended per context scope.

---

## Human Review

`humanReviewRequired` is **always `true`** and validated as a constitutional requirement.

Decision summaries include a dedicated **Human Review Required** section stating:

- Human oversight is mandatory before decision use
- Summaries organize evidence posture only
- Reviewers must verify methodology, sources, and entity scope independently

---

## Summary Output

`buildDecisionSummary(context, { title })` produces factual sections only:

1. Evidence Currently Available
2. Evidence Currently Missing
3. Evidence Coverage
4. Evidence Limitations
5. Methodology References
6. Official Sources
7. Human Review Required

Prohibited language is blocked by validation (recommendations, directives, predictions).

---

## Validation

`validateDecisionContext(context)` checks:

- Missing evidence anchors
- Missing methodology references
- Unknown indicators, entities, sources, missions
- Broken registry relationship links
- Invalid decision context ID format
- `humanReviewRequired` must be true

`validateDecisionSummary(summary)` additionally scans for prohibited language patterns.

---

## Registry Templates

Built-in templates in `DECISION_CONTEXT_TEMPLATES`:

| Slug | Mission | Scope |
|------|---------|-------|
| `citizen-public-services` | `mission-citizen-explore-public-services` | Country |
| `investor-country-scope` | `mission-investor-evaluate-country` | Country |
| `government-governance-scope` | `mission-government-budget-transparency` | Country |
| `researcher-cross-entity` | `mission-researcher-research-country` | Country |

Use `buildDecisionPackageFromTemplate(slug, { countryId })` to produce context + summary pairs.

---

## Future Integration

Reserved for future releases (not in v1):

- UI decision review panels in workspaces
- Platform Context auto-binding from URL params
- Evidence Pipeline stage compatibility gates
- Runtime evidence binding when connectors connect
- Human review workflow and audit trail
- Export to Reports Center decision briefs

Migration manifest: `DECISION_MIGRATION_MANIFEST` in `decision-version.ts`.

---

## Constitutional Alignment

| Principle | Implementation |
|-----------|----------------|
| Political Neutrality | No policy or investment directives in output |
| Evidence First | Coverage derived from indicator and source registries |
| Transparency | Limitations and missing evidence always disclosed |
| Methodology Before Conclusions | Methodology references required per indicator |
| Human Oversight Required | `humanReviewRequired: true` enforced by validation |
| Zero Demo Policy | No fake conclusions, scores, or recommendations |

---

## Public API

```typescript
import {
  buildDecisionContext,
  buildDecisionSummary,
  buildDecisionPackageFromTemplate,
  validateDecisionContext,
  assessDecisionReadiness,
  getDecisionRegistry,
} from "@/lib/decision-intelligence";
```

No runtime, HTTP, AI, or UI bindings in this foundation release.
