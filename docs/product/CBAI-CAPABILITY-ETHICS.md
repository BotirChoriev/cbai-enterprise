# CBAI Capability Ethics

**EPIC:** EPIC-03  
**Code:** `lib/epics/capability-safety-rules.ts`, `lib/capability/capability-passport-builder.ts`

**Constitution:** [`docs/standards/01-cbai-constitution.md`](../standards/01-cbai-constitution.md)

---

## Purpose

The Capability Passport surfaces **demonstrated capability** from real project work — never inferred human worth, protected traits, or universal intelligence scores.

---

## Rules (architecture-enforced)

| Rule | Implementation |
|------|----------------|
| Never infer human worth | No worth-related fields in passport types |
| Never infer protected traits | Builder reads projects/notes/evidence only |
| No universal intelligence score | No numeric IQ or intelligence score |
| No global human ranking | Forbidden patterns in governance tests |
| No silent capability lockout | Roles are preferences in adaptive intelligence |
| No prestige proxy | No diploma, wealth, country, institution prestige inputs |
| Explainable signals only | Each signal has label + provenance from artifacts |
| Provenance required | Derived from `project-store` artifacts |
| Uncertainty visible | Empty passport when no projects |
| User controls visibility | EPIC-03 future: challenge/correct UI |
| Regulated credential boundaries | Documented for future — not universal gate |
| Consent for opportunity matching | EPIC-04 prerequisite |

---

## What the passport derives today

- Domains: research, evidence, analysis, governance, synthesis, collaboration
- Sources: project count, notes, evidence refs, questions
- Readiness: `empty` | `emerging` | `established` (qualitative, from counts)

---

## What it must never do

- Rank people globally
- Restrict route access by inferred capability
- Display CV, diploma, or title as capability measure
- Create popularity or social scores

---

## Before expanding EPIC-03

Implement user visibility controls, signal challenge/correct flow, and regulated-context credential verification as documented architecture — not hidden gates.
