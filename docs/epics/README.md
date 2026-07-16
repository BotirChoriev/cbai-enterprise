# CBAI EPIC Program

CBAI development follows a structured **EPIC operating model**. BUILD-number sprints are retired. Each EPIC is complete only when philosophy, product, interface, implementation, tests, accessibility, and trust align.

**Authoritative constitution:** [`docs/standards/01-cbai-constitution.md`](../standards/01-cbai-constitution.md)  
**Supreme principles (code):** `lib/constitution/supreme-principles.ts`  
**EPIC registry (code):** `lib/epics/epic-registry.ts`

---

## EPIC roadmap

| EPIC | Title | Status |
|------|-------|--------|
| [EPIC-01](EPIC-01-universal-intelligence-foundation.md) | Universal Intelligence Foundation | Functional |
| [EPIC-02](EPIC-02-mission-operating-system.md) | Mission Operating System | In implementation |
| [EPIC-03](EPIC-03-intelligence-identity-capability-passport.md) | Intelligence Identity & Capability Passport | Foundation |
| [EPIC-04](EPIC-04-discovery-opportunity-network.md) | Discovery & Opportunity Network | Foundation |
| [EPIC-05](EPIC-05-scientific-collaboration-os.md) | Scientific Collaboration Operating System | Proposed |
| [EPIC-06](EPIC-06-evidence-trust-engine.md) | Evidence & Trust Engine | Foundation |
| [EPIC-07](EPIC-07-research-reasoning-os.md) | Research & Reasoning Operating System | Foundation |
| [EPIC-08](EPIC-08-universal-knowledge-entity-system.md) | Universal Knowledge & Entity System | Functional |
| [EPIC-09](EPIC-09-knowledge-universe.md) | Knowledge Universe | In implementation |
| [EPIC-10](EPIC-10-humanity-impact-responsible-progress.md) | Humanity Impact & Responsible Progress | Functional |
| [EPIC-11](EPIC-11-civilization-memory-legacy.md) | Civilization Memory & Legacy | Foundation |
| [EPIC-12](EPIC-12-operator-voice-os.md) | Operator & Voice OS | In implementation |
| [EPIC-13](EPIC-13-adaptive-intelligence-interface.md) | Adaptive Intelligence Interface | In implementation |
| [EPIC-14](EPIC-14-global-mission-framework.md) | Global Mission Framework | Proposed |
| [EPIC-15](EPIC-15-production-security-scale.md) | Production, Security & Scale | Foundation |

---

## Product standards (extensions — not a duplicate constitution)

| Document | Purpose |
|----------|---------|
| [CBAI Universal Intelligence OS](../product/CBAI-UNIVERSAL-INTELLIGENCE-OS.md) | Product identity and operating environment |
| [EPIC Operating Model](../product/CBAI-EPIC-OPERATING-MODEL.md) | How EPICs are defined, verified, and completed |
| [Capability Ethics](../product/CBAI-CAPABILITY-ETHICS.md) | Capability Passport safety rules |
| [Discovery Fairness](../product/CBAI-DISCOVERY-FAIRNESS.md) | Fair matching without prestige proxies |
| [Humanity Impact Standard](../product/CBAI-HUMANITY-IMPACT-STANDARD.md) | Responsible progress requirements |
| [Human Decision Boundary](../product/CBAI-HUMAN-DECISION-BOUNDARY.md) | Where humans retain responsibility |
| [Knowledge Legacy Standard](../product/CBAI-KNOWLEDGE-LEGACY-STANDARD.md) | Reusable knowledge left for future people |

---

## Repository mapping

- [REPOSITORY-EPIC-MAP.md](REPOSITORY-EPIC-MAP.md) — files, routes, engines mapped to EPICs
- [EPIC-MATURITY-MATRIX.md](EPIC-MATURITY-MATRIX.md) — honest maturity by dimension

---

## EPIC status model

Honest states only:

`Proposed` → `Foundation` → `In implementation` → `Functional` → `Verified` → `Production-ready` | `Restricted` | `Blocked`

Never mark an EPIC complete because types, stubs, or decorative UI exist.

---

## Verification

```bash
npm run test:epic-governance
npm run test:epic-02-mission-os
npm run test:browser-regression
```

---

## Current focus

**EPIC-02 — Mission Operating System** — complete real mission lifecycle on device-local data.

**Recommended next after EPIC-02:** EPIC-06 (Evidence & Trust Engine) or EPIC-03 (Capability Passport user controls).
