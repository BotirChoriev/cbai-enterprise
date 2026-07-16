# CBAI Humanity Impact Standard

**EPIC:** EPIC-10  
**Code:** `lib/intelligence-os/human-impact-store.ts`, `lib/intelligence-os/report-readiness.ts`

**Constitution:** [`docs/standards/01-cbai-constitution.md`](../standards/01-cbai-constitution.md)

---

## Purpose

Every mission must examine benefits, harms, environmental effects, ethics, affected communities, long-term consequences, and unknown risks before report readiness is claimed.

---

## Required fields (completeness)

- Intended human benefit
- Possible harm
- Environmental effect
- Ethical concerns
- Affected communities
- Long-term consequences
- Unknown risks
- Mitigation
- Missing evidence
- Responsible human owner

Validation: `isHumanImpactComplete()` in `lib/intelligence-os/human-impact.types.ts`.

---

## Report readiness rules

Report readiness states are **qualitative** — never fake scores:

| State | Meaning |
|-------|---------|
| `draft` | No evidence or questions yet |
| `impact_required` | Impact review not started |
| `incomplete` | Impact draft incomplete |
| `reviewed` | Impact complete — readiness may be claimed |
| `decision_required` | Human decision pending |

Export formats (PDF, CSV, API) remain honestly unavailable until connected.

---

## Interface

- `HumanImpactPanel` on My Work and Intelligence Canvas (mobile)
- Impact status in Context Layer and Mission lifecycle
- Operator intervention when impact incomplete before report

---

## Principles expressed

- Humanity First
- Nature First (environmental effect field)
- Responsible Progress
- Human Decision Boundary — impact review is human-owned
