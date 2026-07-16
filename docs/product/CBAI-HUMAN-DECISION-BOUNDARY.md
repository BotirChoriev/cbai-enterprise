# CBAI Human Decision Boundary

**EPIC:** EPIC-01, EPIC-02, EPIC-12  
**Code:** `components/intelligence-os/HumanDecisionBoundary.tsx`, `lib/design/cbai-interface-principles.ts`

**Constitution:** [`docs/standards/01-cbai-constitution.md`](../standards/01-cbai-constitution.md) — Platform Core `humanDecisionRequired: true`

---

## Purpose

The platform assists, connects, explains, validates, and accelerates. **Humans retain responsibility** for scientific claims, reports, and decisions.

---

## Four quadrants (full variant)

| Quadrant | Meaning |
|----------|---------|
| System knows | Local projects, evidence refs, catalog entities user linked |
| System infers | Suggested routes from demonstrated capability — never conclusions |
| System unknown | Live APIs, external researchers, unlinked evidence gaps |
| Human judgment | All scientific claims, reports, and decisions remain yours |

---

## Where it appears

| Surface | Variant |
|---------|---------|
| Intelligence Canvas (mobile) | compact |
| Context Layer (suggested next action) | compact |
| Reports Center | full (via `missionContextVariant="full"`) |
| Reasoning Explorer | full |
| Other operating routes | compact strip in `MissionOperatingContextBar` |

---

## When it is required

Wherever the system presents:

- Conclusions or recommendations
- Report readiness claims
- Adaptive next-action suggestions
- Operator interventions

---

## What it must never imply

- AI made the decision
- Automated verdict on scientific questions
- Confidence scores replacing human review

---

## Interface principle

`human-decision-boundary` in `lib/design/cbai-interface-principles.ts` — auditable in `test-mission-center.ts` and `test-epic-governance.ts`.
