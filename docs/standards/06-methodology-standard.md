# 06 — Methodology Standard

**Document ID:** CBAI-Standard-06-Methodology  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define how CBAI documents analytical methodology before any metric, evaluation, or recommendation appears. Methodology is the bridge between raw evidence and future judgment — it must be explicit, auditable, and separate from scores.

---

## Principles

- **Methodology Before Metrics** — define measurement approach before numbers
- **Explain Before Evaluate** — users understand why before seeing what
- **Separation of Evidence and Judgment** — methodology describes process; evidence describes facts
- **Transparency** — gaps and missing inputs are part of methodology disclosure
- **Human Benefit** — methodology serves informed decisions, not engagement

---

## Architecture

Methodology exists at three levels:

```
Platform Methodology (constitution, standards)
        │
        ▼
Indicator Methodology (per-indicator blocks in registry)
        │
        ▼
Evaluation Methodology (future — derived metrics, explicitly versioned)
        │
        ▼
Presentation (UI methodology footers, persona guidance)
```

Each level inherits constraints from the level above.

---

## Rules

1. Every indicator must include a methodology block with four fields: `whyItExists`, `requiredEvidence`, `missingEvidence`, `futureScoringDerivation`.
2. UI must not display evaluation results without link or summary of underlying methodology.
3. `futureScoringDerivation` describes possibility — it does not authorize shipping scores.
4. Methodology changes require version bump ([12 — Versioning](./12-versioning-standard.md)).
5. Confidence and trust calculations (engine layer) must document inputs and caps in methodology appendix.
6. Persona sections explain methodology relevance, not conclusions.

---

## Methodology block schema

| Field | Content |
|-------|---------|
| Why it exists | Business and constitutional rationale for the measure |
| Required evidence | Specific documents, datasets, or registry fields needed |
| Missing evidence | Honest current gaps |
| Future scoring derivation | How a numeric evaluation *could* be computed later — not implemented |

---

## Allowed

- Plain-language methodology paragraphs on entity and indicator pages
- "Not implemented" and "planned" labels on future evaluation paths
- Methodology PDF exports for audit (future)
- Links to source registries and indicator IDs
- Engine-layer methodology docs separate from user-facing copy

---

## Forbidden

- Methodology that hides missing evidence behind technical jargon
- Scoring formulas presented as live without verified inputs
- Methodology copied from third-party indices without attribution and scope note
- Changing methodology without version increment
- AI rewriting methodology without human review
- Methodology that uses social sentiment or undisclosed proprietary blends

---

## Examples

**Compliant — indicator methodology**

> **Why:** Fiscal transparency begins with document availability.  
> **Required:** Budget proposal, mid-year review, audit report from open budget portal.  
> **Missing:** National open budget portal not connected.  
> **Future derivation:** Open Budget Index-style checklist mapping — not implemented.

**Compliant — UI footer**

> Methodology v1.0.0 · Indicator: budget-document-publication · Sources not connected

**Non-compliant**

> Our proprietary AI analyzes 500 signals to produce this score.

---

## Future expansion

- Methodology registry with semver independent of indicator registry
- Interactive methodology builder for tenant-specific overlays (cannot weaken constitution)
- A/B methodology versioning in sandbox only
- Regulatory audit packs (methodology + evidence trail)
- Multilingual methodology bundles
- Methodology sign-off workflow (researcher review gate)

---

## Cross-references

- [01 — Constitution](./01-cbai-constitution.md)
- [03 — Indicator Standard](./03-indicator-standard.md)
- [07 — Persona Standard](./07-persona-standard.md)
- [12 — Versioning Standard](./12-versioning-standard.md)
