# 07 — Persona Standard

**Document ID:** CBAI-Standard-07-Persona  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define the six CBAI audience personas and how every platform surface delivers honest, role-specific value. Personas guide presentation — they do not justify fabricated intelligence or biased recommendations.

---

## Principles

- **Human Benefit** — serve real decision-makers, not engagement metrics
- **Golden Rule** — persona value must reflect actual platform capabilities
- **Political Neutrality** — no persona receives partisan framing
- **Platform Consistency** — all entity routes address the same six personas
- **Explain Before Evaluate** — persona copy explains what is available, not what to believe

---

## Architecture

```
Six Personas (canonical)
        │
        ├── Home / Search gateway copy
        ├── Entity intelligence blocks (per route)
        ├── Indicator persona mapping (registry)
        └── Future: API persona filters
```

Persona is a **lens**, not a permission tier. Authorization (future) is separate.

---

## Rules

1. Every entity route (`/countries`, `/companies`, `/universities`) must include all six persona sections or equivalent consolidated block.
2. Persona copy must not promise scores, rankings, or AI recommendations when unavailable.
3. Persona guidance cites evidence status and indicator applicability where relevant.
4. No persona receives preferential national or corporate framing.
5. New routes with intelligence claims require persona checklist before ship.
6. Persona IDs are stable: `citizen`, `investor`, `government`, `student`, `researcher`, `academic`.

---

## Canonical personas

| ID | Title | Value proposition |
|----|-------|-------------------|
| `citizen` | Citizen | Understand public evidence categories and connection status for your country |
| `investor` | Investor | Identify which fiscal, procurement, and investment indicators require connection before due diligence |
| `government` | Government | Prioritize official data publication using methodology and evidence gaps |
| `student` | Student | Learn which education and research indicators apply to institutions |
| `researcher` | Researcher | Export definitions, sources, and status for reproducible research scoping |
| `academic` | Academic | Cite methodology and evidence requirements in scholarly work |

---

## Allowed

- Honest "what you can do today" vs "what requires connected sources"
- Persona-specific entry points on home and search (routing, not ranking)
- Indicator registry persona mapping (`lib/indicator-framework/personas/mapping.ts`)
- Persona icons and labels in UI consistent with design standard
- Future persona-filtered API views (same data, different emphasis)

---

## Forbidden

- Investor persona receiving "Strong buy" or investment recommendations without evidence
- Government persona receiving political advocacy or policy endorsements
- Student persona seeing fake university rankings or league tables
- Citizen persona receiving fear-based or nationalist messaging
- Different evidence standards per persona (all personas see same facts)
- Persona copy that invents capabilities to appear helpful

---

## Examples

**Compliant — investor persona (companies)**

> **Investor:** Registry facts available for sector and domicile. Financial indicators require World Bank and national registry connections — currently not connected. Do not rely on this page for valuation or risk scoring.

**Compliant — student persona (universities)**

> **Student:** Institution name, location, and type are from local registry. Program quality and employment outcomes require connected education indicators — not available today.

**Non-compliant**

> **Investor:** Excellent opportunity — 96% confidence, top-tier investment destination.

---

## Future expansion

- Localized persona copy (i18n bundles)
- Persona onboarding flows on first visit
- Accessibility-optimized persona summaries ([09 — Accessibility](./09-accessibility-standard.md))
- Enterprise persona extensions (analyst, compliance officer) as views, not new evidence rules
- Persona analytics (privacy-preserving usage only, no sentiment tracking)

---

## Cross-references

- [01 — Constitution](./01-cbai-constitution.md)
- [04 — Entity Standard](./04-entity-standard.md)
- [06 — Methodology Standard](./06-methodology-standard.md)
- [08 — Design Standard](./08-design-standard.md)
