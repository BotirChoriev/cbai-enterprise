# 01 — CBAI Constitution Standard

**Document ID:** CBAI-Standard-01-Constitution  
**Version:** 1.1.0  
**Status:** Official
**Amendment (v1.1.0):** Ratifies the Platform Core Principles below, effective with the CBAI
Platform RC-1 freeze (EPIC-10). No prior principle is superseded or weakened — the amendment adds
principles verified against the Platform Core built in EPICs 02–09; see
`docs/CBAI-Platform-RC1.md` for the audit that grounds them.

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

## Platform Core Principles (ratified with CBAI Platform RC-1, EPIC-10)

The Platform Core (`lib/foundation/`, `lib/relationships/`, `lib/evidence/`, `lib/reasoning/`,
`lib/workflow/`, `lib/orchestration/`, `lib/network/`, `lib/workspace/`, and
`lib/foundation/adapters/`) is a domain-agnostic layer built across EPICs 02–09 and audited for
Constitution compliance at freeze time (EPIC-10, `docs/CBAI-Platform-RC1.md`). It governs its own
nine principles, consistent with and additive to the principles above:

| Principle | Definition | Verified by |
|-----------|------------|-------------|
| **Evidence First** | No Relationship, ReasoningResult field, or WorkflowTransition without a traceable Evidence id or an explicit, honest absence — never a silent omission | `evidenceReference: string \| null` (required key, honest nullable value) |
| **Human Decision** | The platform never claims to have made a decision on a human's behalf | `ReasoningResult.humanDecisionRequired: true` — a TypeScript literal type, not just a runtime default |
| **No fabricated data** | Every Platform Core output is a real transformation of real input; nothing is invented to fill a gap | Zero mock/fake/placeholder literals confirmed by audit across all Platform Core files |
| **No fabricated confidence** | Confidence, reliability, and strength are always categorical, never a numeric score | `Confidence`, `RelationshipStrength`, `EvidenceReliability` are closed string unions; every numeric field is a real, derivable count |
| **No fake metrics** | Every number the platform reports is a real, countable fact | Confirmed by audit: `outputCount`, `evidenceCount`, `historyLength`, `sourceCount` — no scores, no percentages |
| **Explainable Intelligence** | Every output shows how it was reached, not just what it concluded | `ReasoningResult.reasoningPath`, `IntelligenceResult.pipelineTrace`, `Workflow.history` |
| **Traceable Intelligence** | Traceability survives composition — a Workspace-level view is exactly as auditable as the engine outputs it composes | `WorkspaceView`'s nine sections are pass-throughs, never re-derivations |
| **Universal Platform** | No Platform Core module is written for one ecosystem | Confirmed by import-graph audit: zero domain-specific logic outside `lib/foundation/adapters/` |
| **Ecosystem Neutral** | Platform Core vocabularies use domain-neutral terms, usable by Research, Governance, Economic, Engineering, Education, Legal, Healthcare, Technology, and Climate ecosystems alike | No ecosystem name appears in any Platform Core file outside the adapter boundary |

These nine principles apply specifically to `lib/foundation/` and its sibling engines; the
platform-wide principles in the table above (Evidence First, Zero Demo Policy, Golden Rule, etc.)
continue to apply everywhere, including outside the Platform Core.

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
- `docs/CBAI-Platform-RC1.md` (Platform Core audit and freeze — grounds the Platform Core
  Principles section above)
- `docs/architecture.md`, `docs/build-ledger.md`, `docs/version-history.md`,
  `docs/current-progress.md` (the living Platform Core record, EPICs 02–10)
