# CBAI Version History

This tracks major capability milestones, not individual commits — see `docs/build-ledger.md`
for the commit-level breakdown and `git log` for the full record.

## v0 — Catalog foundation

Static `ResearchTopic` catalog (65 topics across 10 domains), topic detail pages, global
research network graph, research workspace explorer. No decision support — display only.

## v1 — Deterministic Intelligence Engines

Gap Engine → Decision Engine → Readiness Engine → Health Engine → Workflow Engine, each strictly
consuming the one below it. Zero AI, zero invented scores or percentages, zero fabricated
evidence. Every state that can't currently be derived honestly renders as an explicit "Unknown"
or empty state rather than a guess.

## v1.1 — Research Cockpit

One operational surface per topic (Mission, Current Stage, Research Health, Research Readiness,
Current Workflow, Recommended Next Action with a real link, Blocking Factors, Latest Research
Activity) — replacing several smaller, overlapping cards.

## v2 — Universal product identity (EPIC-01)

Public entry experience rewritten to present CBAI as a universal Intelligence Operating System
with three named ecosystems (Research — flagship, Governance, Economic) sharing one Intelligence
Core, rather than a country/company/university search tool.

## v2.1 — Universal Intelligence Foundation (EPIC-02, this release)

`lib/foundation/` — ten domain-agnostic pillars (Subject, Mission, Question, Evidence,
Relationship, Analysis, Recommendation, Execution, Timeline, Knowledge) that every future
ecosystem is expected to express its concepts through. Research Intelligence is the first,
and so far only, real consumer, via `lib/foundation/adapters/research-foundation-adapter.ts`.
No existing engine was rewritten; the Foundation was proven compatible with Research
Intelligence's real, already-shipped output through pure translation functions, verified by
TypeScript's structural type-checking at build time.

## Planned (not started)

Governance Intelligence and Economic Intelligence ecosystems, each with their own foundation
adapter once real domain data exists to adapt. No target date is committed here — see
`docs/current-progress.md` for what's honestly available today.
