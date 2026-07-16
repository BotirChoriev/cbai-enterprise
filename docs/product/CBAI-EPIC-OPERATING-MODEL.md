# CBAI EPIC Operating Model

**Constitution (authoritative):** [`docs/standards/01-cbai-constitution.md`](../standards/01-cbai-constitution.md)

---

## Definition

An **EPIC** is a product-scale unit of work. It is complete only when philosophy, product, interface, implementation, tests, accessibility, and trust align.

---

## Required EPIC contents

Every EPIC document must include:

- Purpose and constitution alignment
- Real user problem and product outcome
- Architecture boundary
- Implementation phases and dependencies
- Data, privacy, and fairness considerations
- Safety limitations (honest)
- Measurable acceptance criteria
- Browser and test requirements
- Rollout conditions
- Genuine remaining limitations

---

## Status model

| Status | Meaning |
|--------|---------|
| Proposed | Documented intent only |
| Foundation | Types, rules, partial wiring |
| In implementation | Active development |
| Functional | Real user workflows work locally |
| Verified | Tests and browser regression pass |
| Production-ready | EPIC-15 gates met |
| Restricted | Preview with honest limits |
| Blocked | Dependency or safety blocker |

---

## Supreme product principles (all EPICs)

1. Humanity First  
2. Nature First  
3. Evidence First  
4. Truth Before Popularity  
5. Capability Before Status  
6. Knowledge Has No Borders  
7. Intelligence Has No Passport  
8. Technology Expands Human Potential  
9. Collaboration Before Competition  
10. Explainability Before Automation  
11. Responsible Progress  
12. Knowledge Must Return to Humanity  
13. Every Human Has Untapped Intelligence  

Code mirror: `lib/constitution/supreme-principles.ts` (8 ratified) + interface principles in `lib/design/cbai-interface-principles.ts`.

---

## Module accountability

Every visible module declares purpose, inputs, outputs, limitations, EPIC ownership, and maturity. Registry: `lib/intelligence-os/module-accountability.ts`. UI: `/trust`.

Primary navigation must not expose a module without accountability registration.

---

## Interface and philosophy together

For every new interface element, document:

- Which constitutional principle it expresses
- What real user decision it supports
- What evidence it uses
- What uncertainty it discloses
- What human control remains

---

## Verification gate

```bash
npm run lint && npx tsc --noEmit && npm run build
npm run test:epic-governance
npm run test:browser-regression
```

Do not push until explicitly requested. Do not mark EPICs complete from stubs alone.
