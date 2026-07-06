# 01 — CBAI Constitution Standard

**Document ID:** CBAI-Standard-01-Constitution  
**Version:** 1.0.0  
**Status:** Official

---

## Purpose

Define the supreme engineering and product principles for CBAI Enterprise. Every module, route, library, design decision, and future API must align with this constitution. When code and constitution conflict, fix the code or amend the standard — silent drift is forbidden.

---

## Principles

The following principles were agreed during platform transformation and ratified as non-negotiable:

| Principle | Definition |
|-----------|------------|
| **Evidence First** | No intelligence claim without traceable evidence or an explicit unavailable label |
| **Political Neutrality** | No partisan framing, national favoritism, or ideological scoring |
| **Transparency** | Status, sources, methodology, and gaps are visible — not hidden behind UI polish |
| **Golden Rule** | If data is unavailable, say so honestly; never invent to fill empty space |
| **Methodology Before Metrics** | Define how something would be measured before displaying any number |
| **Separation of Evidence and Judgment** | Facts (registry, documents) are distinct from evaluations (scores, recommendations) |
| **No Social Sentiment Scoring** | No Twitter-style sentiment, popularity, or viral metrics as intelligence |
| **Zero Demo Policy** | No fabricated scores, percentages, rankings, confidence bars, or AI summaries on user-facing routes |
| **Human Benefit** | Platform serves citizens, investors, governments, students, researchers, and academics — not engagement metrics |
| **Platform Consistency** | Entity routes, search, graph, and home follow the same honesty and layout patterns |
| **Explain Before Evaluate** | Users see why an indicator exists and what evidence it needs before any evaluation |
| **No Fake Data** | Mock data for layout development must not ship as intelligence; unavailable fields use honest labels |

Supporting engineering principles (from architecture baseline):

- **Entity-first** — intelligence flows through the Universal Entity Framework
- **Single source of truth** — domain modules own data; adapters normalize; no parallel stores
- **Graph as relationship authority** — typed edges with provenance, not ad hoc string matching
- **Explainable by default** — pipeline stages and evidence paths are auditable
- **Stability over novelty** — lint and build must pass; dead code removed

---

## Architecture

Constitution compliance is layered:

```
┌─────────────────────────────────────────┐
│  01 Constitution (this document)        │
├─────────────────────────────────────────┤
│  02 Evidence · 03 Indicator · 04 Entity │
│  05 Relationship · 06 Methodology       │
│  07 Persona                             │
├─────────────────────────────────────────┤
│  08 Design · 09 Accessibility         │
│  10 Mobile · 11 API · 12 Versioning     │
├─────────────────────────────────────────┤
│  Application implementation             │
└─────────────────────────────────────────┘
```

**Engine ≠ Platform ≠ Constitution.** Intelligence engine maturity and UI compliance are scored independently. A strong engine does not excuse fabricated UI data.

---

## Rules

1. Every user-facing route must declare its evidence scope (local registry, connected source, or unavailable).
2. No route ships without Golden Rule persona checklist sign-off (see [07 — Persona](./07-persona-standard.md)).
3. Indicators are never invented at render time — they come from the indicator registry ([03 — Indicator](./03-indicator-standard.md)).
4. Relationships require evidence status on every edge ([05 — Relationship](./05-relationship-standard.md)).
5. Decorative controls that imply functionality must be wired or removed.
6. Constitution amendments require version bump and documented effective date.

---

## Allowed

- Honest placeholders: "Not connected", "Evidence pending", "Coming soon"
- Local registry facts with explicit catalog scope (e.g. country name, ISO code from on-platform registry)
- Methodology text describing how future evaluation *could* work without implementing scores
- Simulation in development environments when clearly marked and not shipped to production UI
- Progressive disclosure: list → detail → relationships → graph → reasoning

---

## Forbidden

- Fabricated scores, rankings, league tables, or confidence percentages
- AI-generated summaries presented as verified intelligence without evidence chain
- Political endorsements, attacks, or comparative national propaganda
- Social sentiment indices, popularity scores, or engagement-derived metrics
- "Neural link active", fake success rates, mock corpus health, or sci-fi demo copy on production routes
- Silent substitution of unavailable data with plausible-sounding invented values
- Black-box conclusions with no methodology or source attribution

---

## Examples

**Compliant — Countries route (Golden Rule reference)**

> "GDP: Not connected — World Bank source planned. Population: Available from local registry."

**Non-compliant — fabricated intelligence**

> "Investment Score: 96.1% · AI Confidence: High · Recommended for immediate expansion"

**Compliant — methodology without score**

> "This indicator requires ILO labour force survey data. Source status: not connected. Future evaluation could derive employment gap metrics when connected."

**Compliant — persona honesty**

> "Investor: Due diligence requires connected fiscal and procurement indicators — currently unavailable for this entity."

---

## Future expansion

- Formal constitution review gate in CI (route manifest + compliance checklist)
- Per-tenant policy overlays that never weaken core principles
- Multilingual constitution summaries for operator onboarding
- Automated drift detection comparing UI copy against forbidden pattern list
- Constitution v2 when entity taxonomy expands (government, investor, person modules)

---

## Cross-references

- [02 — Evidence Standard](./02-evidence-standard.md)
- [03 — Indicator Standard](./03-indicator-standard.md)
- [06 — Methodology Standard](./06-methodology-standard.md)
- [07 — Persona Standard](./07-persona-standard.md)
- `docs/CBAI-Constitution-v1.md` (historical architecture baseline)
