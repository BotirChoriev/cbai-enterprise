# 03 — Indicator Standard

**Document ID:** CBAI-Standard-03-Indicator  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define how indicators are registered, lifecycle-managed, and consumed across CBAI. Indicators are **measurable evidence categories** — not scores, rankings, or AI outputs. They are never invented at render time; they exist only in the global indicator registry.

---

## Principles

- **Methodology Before Metrics** — indicator definition precedes any numeric evaluation
- **Explain Before Evaluate** — every indicator documents why it exists and what evidence it needs
- **Evidence First** — required and optional sources are explicit
- **No Fake Data** — indicator status reflects real connection state
- **Political Neutrality** — indicators measure evidence categories, not ideological positions

---

## Architecture

```
lib/indicator-framework/
├── types.ts              # IndicatorDefinition schema
├── domains/catalog.ts    # 22 domains
├── indicators/catalog.ts # Indicator definitions
├── sources/registry.ts   # Required source slugs
├── registry.ts           # GLOBAL_INDICATOR_REGISTRY
└── index.ts              # Public API
```

**Data flow (future):**

Sources → Evidence items → Indicator binding → Entity intelligence blocks → Graph / Reasoning

The indicator registry is a **catalog**, not a scoring engine.

---

## Rules

1. Every evaluation dimension must map to a registered indicator ID.
2. New indicators require domain assignment, methodology block, and source slugs.
3. Indicator status must reflect actual integration state — never `connected` without evidence path.
4. Indicators declare `applicableEntities`: country, company, university, government, institution.
5. Version field on each indicator matches framework semver ([12 — Versioning](./12-versioning-standard.md)).
6. UI may list indicators and status; UI may not compute scores from indicators until evaluation layer exists.

---

## Indicator lifecycle

| Status | Meaning | When to use |
|--------|---------|-------------|
| `planned` | Indicator defined; no implementation or source wiring | Registry seed, future domain |
| `connected` | At least one required source delivers evidence for this indicator | Live adapter + validation |
| `verified` | Evidence validated; suitable for entity display and future evaluation | Post verification gate |
| `deprecated` | Superseded by new indicator or retired methodology | Migration period only |

**Transition rules:**

- `planned` → `connected`: source adapter live, evidence items flowing
- `connected` → `verified`: validation checklist passed (schema, freshness, attribution)
- any → `deprecated`: successor indicator documented; old ID retained for audit

**Framework note:** Current registry uses `not_connected` alongside `connected` and `planned` for source-level honesty. Entity-level indicator status should migrate toward the four-state lifecycle above as verification gates ship.

---

## Indicator schema (required fields)

| Field | Requirement |
|-------|-------------|
| `id` | Stable, never reused |
| `slug` | URL-safe unique key |
| `title` | Human-readable name |
| `description` | What the indicator measures |
| `category` | Domain ID from domain catalog |
| `methodology` | whyItExists, requiredEvidence, missingEvidence, futureScoringDerivation |
| `requiredEvidenceSources` | Source slugs |
| `optionalEvidenceSources` | Source slugs |
| `status` | Lifecycle state |
| `applicableEntities` | Entity types |
| `version` | Semver string |

---

## Allowed

- One seed indicator per domain in registry v1
- Methodology text describing future scoring derivation without implementing scores
- Grouping indicators by domain in modular catalog files
- Query helpers: by domain, by entity, by status
- Persona mapping explaining indicator value without recommendations

---

## Forbidden

- Ad hoc indicators in components or page copy
- Percentage scores, star ratings, or league tables in indicator definitions
- AI-generated indicator descriptions without human review
- `connected` status without working evidence adapter
- Indicators based on social sentiment or opinion polls as primary evidence
- Rankings derived from indicator counts or connection percentages

---

## Examples

**Compliant — indicator definition**

```typescript
{
  id: "ind-econ-national-accounts",
  slug: "national-accounts",
  category: "economy",
  status: "not_connected",
  methodology: {
    whyItExists: "Macroeconomic evaluation requires NSO-published accounts.",
    requiredEvidence: "GDP, GNI, sectoral accounts.",
    missingEvidence: "World Bank and IMF API connections.",
    futureScoringDerivation: "Growth metrics from verified time series — not implemented."
  }
}
```

**Compliant — UI display**

> **National Accounts** · Economy · Not connected  
> Required: National Statistics Offices, World Bank

**Non-compliant**

> Innovation Score: 87/100 (computed in component, no indicator ID)

---

## Future expansion

- Indicator ↔ entity binding tables per country/company/university
- Sub-indicators and composite indicators (still no scores in registry)
- Locale bundles for indicator titles and methodology
- Indicator deprecation migration tooling
- Evidence Explorer browse by indicator
- API exposure per [11 — API Standard](./11-api-standard.md)

---

## Cross-references

- [02 — Evidence Standard](./02-evidence-standard.md)
- [06 — Methodology Standard](./06-methodology-standard.md)
- [04 — Entity Standard](./04-entity-standard.md)
- `docs/global-indicator-framework.md`
