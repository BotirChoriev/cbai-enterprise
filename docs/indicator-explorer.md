# CBAI Indicator Explorer

**Version:** 1.0.0  
**Status:** Official indicator exploration layer — transparency and explainability only

---

## Purpose

The Indicator Explorer is the official layer for **indicator self-explanation**. Users can understand what each indicator is, why it exists, which methodology defines it, which evidence sources support it, which connectors will provide it, and which entities, missions, and reports depend on it.

CBAI Indicator Explorer:

- Derives every record from existing registries (Indicator Framework, Evidence Infrastructure, Connector Architecture, Mission Catalog, Reports Center, Decision Intelligence)
- Explains structure, methodology, and dependencies — not outcomes
- Discloses coverage posture honestly from connection and verification status
- Requires human review for all indicator information

CBAI Indicator Explorer never:

- Computes scores, rankings, or predictions
- Generates recommendations or evaluative conclusions
- Displays fake percentages or invented coverage metrics
- Invent indicators, sources, or connectors not present in registries

---

## Architecture

```
lib/indicator-explorer/
├── indicator-explorer.types.ts      # Core type system and record model
├── indicator-explorer.version.ts    # Version manifest
├── indicator-explorer.builder.ts    # Record builder from registries
├── indicator-explorer.query.ts      # Query API and status helpers
├── indicator-explorer.summary.ts    # Factual summary sections
├── indicator-explorer.validation.ts # Constitutional validation
└── index.ts                         # Public API

components/indicator-explorer/
├── IndicatorExplorerPanel.tsx              # Main selector + detail view
├── IndicatorDefinitionCard.tsx             # What the indicator is
├── IndicatorMethodology.tsx                # Why it exists + methodology refs
├── IndicatorSources.tsx                    # Official sources + connectors
├── IndicatorDependencies.tsx               # Entities, missions, reports
├── IndicatorCoverage.tsx                   # Coverage status disclosure
├── DecisionIntelligenceIndicatorSection.tsx # Decision Intelligence entry point
└── ReportsIndicatorExplorerSection.tsx     # Reports Center entry point
```

### Integration layers

| Layer | Usage |
|-------|-------|
| Global Indicator Framework | Indicator definitions and methodology |
| Evidence Infrastructure | Official source connection and verification status |
| Connector Architecture | Planned connectors per evidence source |
| Mission Catalog | Missions that require each indicator |
| Reports Center | Report types that consume indicator scope |
| Decision Intelligence | Template-referenced indicators |
| Evidence Explorer | Indicator map explore links + embedded panel |

---

## Coverage Model

Each indicator receives a `coverageStatus` derived from framework status and official source connection posture:

| Status | Meaning |
|--------|---------|
| `connected` | Indicator marked connected and all mapped official sources are connected |
| `partial` | Some but not all mapped sources are connected |
| `planned` | Indicator or sources are planned but not fully connected |
| `not_available` | No connected sources and no planned posture sufficient for partial coverage |

Coverage status reflects **registry connection posture** — not evaluative conclusions or data completeness percentages.

---

## Methodology Model

Each `IndicatorExplorerRecord` includes `methodologyReferences`:

| Field | Source |
|-------|--------|
| `whyItExists` | Indicator Framework methodology |
| `requiredEvidence` | Required evidence disclosure |
| `missingEvidence` | Missing evidence disclosure |
| `futureScoringDerivation` | Future derivation text (disclosed, not implemented) |
| `standardReference` | Framework path reference |

Methodology text is copied verbatim from the Indicator Framework. The explorer does not interpret or evaluate methodology content.

---

## Dependency Model

Dependencies are resolved statically from registries:

| Dependency | Resolution |
|------------|------------|
| `supportedEntities` | `applicableEntities` from indicator definition |
| `supportedMissions` | Missions listing indicator in `requiredIndicators` |
| `supportedReports` | Report types whose entity scope matches indicator entities |
| `officialSources` | Required/optional evidence sources + infrastructure supported indicators |
| `plannedConnectors` | Connectors mapped to official sources via Connector Architecture |

Counts are factual (e.g., "3 report type(s)") — never percentages or rankings.

---

## Future Integration

| Surface | Status |
|---------|--------|
| Evidence Pipeline | Future — pipeline stage gates per indicator |
| Entity panels (Countries, Companies, Universities) | Future — per-entity indicator explore links |
| Evidence Gap Explorer | Future — cross-link gap records to explorer records |
| Evidence Comparison | Future — shared indicator dependency context |
| Runtime / agents / reasoning | Out of scope — not modified by this layer |

---

## Verification

Constitutional validation (`indicator-explorer.validation.ts`) enforces:

- Valid explorer ID format (`indicator-explorer-ind-{slug}`)
- `humanReviewRequired` always `true`
- Indicator exists in Global Indicator Framework
- Prohibited language scan (scores, rankings, recommendations, predictions, fake percentages, speculative language)

Run validation via builder on catalog build; records failing validation throw at build time.

### Manual verification checklist

- [ ] Evidence Explorer — "Explore indicator" links select indicator in panel below map
- [ ] Reports Center — Report Indicator Dependencies section lists report-linked indicators
- [ ] Reasoning Explorer — Decision Intelligence Indicators section lists template indicators
- [ ] No scores, rankings, predictions, or recommendations in UI or summaries
- [ ] All indicator data traceable to registries

---

## Compliance

Aligned with:

- CBAI Constitution v1.0 — Evidence First, Transparency, Explainability, No Fake Data
- CBAI Standards v1.0 — Indicator Framework as source of truth
- Governance Framework v1.0 — Human review required

**Does not modify:** `runtime/`, `agents/`, `reasoning/`, `lib/intelligence/`
