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

## v2.1 — Universal Intelligence Foundation (EPIC-02)

`lib/foundation/` — ten domain-agnostic pillars (Subject, Mission, Question, Evidence,
Relationship, Analysis, Recommendation, Execution, Timeline, Knowledge) that every future
ecosystem is expected to express its concepts through. Research Intelligence is the first,
and so far only, real consumer, via `lib/foundation/adapters/research-foundation-adapter.ts`.
No existing engine was rewritten; the Foundation was proven compatible with Research
Intelligence's real, already-shipped output through pure translation functions, verified by
TypeScript's structural type-checking at build time.

## v2.2 — Universal Relationship Engine (EPIC-03)

`lib/relationships/` — a builder (`buildRelationship`, with deterministic, evidence-count-based
confidence — never a fabricated score) and a query engine (subject lookup, type filtering,
connected-ID resolution, bounded one-hop traversal) over the Foundation's `Relationship` type,
now enriched with direction, strength, evidence, confidence, time, status, source, explanation,
and known limitations. Sixteen domain-agnostic relationship types defined and extensible.
Research Intelligence's catalog-derived relationships (method/evidence-type connections) now
flow through this builder instead of being constructed by hand.

This release also produced a significant audit finding: three separate, real graph/relationship
systems already exist in this repository (`lib/graph/`, `lib/research/graph/`, and a large,
entirely dormant `lib/intelligence/graph/`), none unified. This is the exact duplication problem
the Foundation and Relationship Engine exist to eventually solve — but migrating two live,
working routes (`/graph`, the research network) without a way to visually verify the result was
judged too risky for this Epic. Recorded as a deliberate scope decision, not an oversight — see
`docs/current-progress.md`.

## v2.3 — Universal Evidence Operating System (EPIC-04)

`lib/evidence/` — a reusable Evidence Engine (`buildEvidence`, `validateEvidenceRecord`,
`linkSupportingEvidence`/`linkConflictingEvidence`, `appendEvidenceHistory`,
`findEvidenceForSubject`, `groupEvidenceBySourceType`, `groupEvidenceByVerificationStatus`,
`compareEvidence`, `traceEvidence`) over the Foundation's `Evidence` type, now enriched from 4
fields to 21: identity, original source, source type, origin organization, authors, publication
date, version, language, original language, verification status, reliability, confidence, known
limitations, supporting/conflicting evidence links, related subjects/missions/questions/
relationships, timeline, and an append-only history log. Every new field is optional, so every
existing Evidence record remains valid unmodified.

`EvidenceSourceType` and `VerificationStatus` were **promoted, not duplicated**, from two real,
pre-existing modules (`lib/research/evidence/evidence-types.ts` and
`lib/evidence-infrastructure/types.ts`), which now re-export the Foundation definitions as
zero-behavior-change aliases. `Confidence` was extracted out of EPIC-03's
`RelationshipConfidence` into a shared `lib/foundation/confidence.ts` so Evidence and
Relationship use one categorical vocabulary, not two independent ones. Research Intelligence's
catalog evidence now flows through `buildEvidence` instead of being constructed by hand, with an
honest (never-"verified") mapping from the catalog's coarse connection status to
`VerificationStatus`.

This release also produced an audit finding, following the same pattern as EPIC-03's graph
audit: a third, pre-existing "Evidence" concept exists in the large, mostly-dormant
`lib/intelligence/` subsystem, built on a numeric 0–100 `relevance` score. It was deliberately
**not** integrated — numeric scoring is philosophically incompatible with the categorical,
never-fabricated approach used everywhere else in the Foundation. Recorded as known technical
debt, not an oversight — see `docs/current-progress.md`.

## v2.4 — Intelligence Reasoning Framework (EPIC-05)

`lib/foundation/reasoning-types.ts` + `lib/reasoning/` — a domain-agnostic reasoning framework
that transforms Evidence, Relationships, and Timeline into structured, explainable decision
**support**: Observed Facts, Known Unknowns, Supporting Evidence, Conflicting Evidence,
Reasoning Path, Possible Options, Trade-offs, Risks, Potential Consequences, and Open Questions.
`buildReasoningResult` is a pure, deterministic function — zero model calls, zero fabricated
confidence or certainty. Every output section has an explicit derivation rule traced to real
input data (see `docs/architecture.md` for the full table); nothing is generated from nothing.

`humanDecisionRequired` is `true` at the TypeScript type level, not just at runtime — this
framework cannot produce a result that claims to have made a decision. `ReasoningOption.support`
reuses the shared `Confidence` vocabulary (EPIC-04) and `ReasoningRisk.severity` reuses
`RelationshipStrength` (EPIC-03), so reasoning output describes certainty using the exact same
categorical language as the rest of the platform — no new, parallel scale was introduced.

Wired into `research-foundation-adapter.ts`: `IntelligenceFoundationView` gained a new optional
`reasoning` field, populated by composing the topic's own real evidence and relationships
through the framework, proven for all 65 real catalog topics via a successful `npm run build`.
Not yet wired into any UI — the framework is available for a future Epic to render, following
the same precedent set by the Relationship and Evidence engines.

This release also produced an audit finding, following the same pattern as EPIC-03's graph audit
and EPIC-04's evidence audit: a fourth, large, entirely dormant subsystem exists in
`lib/intelligence/` (`engine/`, `orchestrator/`, `result.types.ts`, `trust.types.ts`) implementing
an earlier "governed inference pipeline" design on top of a numeric `ConfidenceAssessment`
model — the same philosophical mismatch as the numeric Evidence model found in EPIC-04. Not
integrated; recorded as known technical debt — see `docs/current-progress.md`.

## v2.5 — Universal Intelligence Workflow Framework (EPIC-06, this release)

`lib/foundation/workflow-types.ts` + `lib/workflow/` — a domain-agnostic Workflow: not project
management, not task management, but the process record that connects every capability already
built (Question, Mission, Evidence, Relationships, Reasoning, Execution) to one auditable,
12-state state machine (`not_started` → `collecting_evidence` → `review_in_progress` →
`ready_for_reasoning` → `reasoning_complete` → `waiting_for_human_decision` → `approved` →
`executing` → `monitoring` → `completed` → `archived`, plus `waiting_for_information` reachable
from every active phase). "Evolution" is represented as the graph's own capability to loop from
`monitoring`/`completed` back to `collecting_evidence`, not a thirteenth state.

Every `WorkflowTransition` carries all six mission-required fields — `reason`, `timestamp`,
`actor`, `evidenceReference`, `previousState`, `nextState`. `evidenceReference` is a required
key with an honest nullable value (`string | null`) rather than a fabricated placeholder, since
many real transitions (starting evidence collection, for example) genuinely have no specific
evidence record behind them yet. `applyWorkflowTransition` is pure and rejects any transition
outside the declared graph rather than silently allowing drift; `validateWorkflowRecord`
independently re-checks that a Workflow's own history is internally consistent.

Wired into `research-foundation-adapter.ts`: `IntelligenceFoundationView` gained a new optional
`workflow` field, populated by composing a topic's real Question/Mission/Evidence/Relationships/
Reasoning through `createWorkflow`, proven for all 65 real catalog topics via a successful
`npm run build`. Deliberately does not fabricate a transition history for these demo workflows —
see `docs/current-progress.md` for why. Not yet wired into any UI, following the same precedent
as the Relationship, Evidence, and Reasoning engines.

This release also produced an audit finding, following the same pattern as the prior three
Epics: a fifth dormant area exists in `lib/intelligence/` — `agents/tasks/task-lifecycle.ts` (a
real, well-built agent **task** dispatch lifecycle) and `runtime/` (scheduler/queue/worker). It
solves a genuinely different problem (agent task dispatch, not an intelligence process
lifecycle) and was not integrated. Also documented: the pre-existing, narrower
`lib/research/workflow/` (`WorkflowStage`, 5 values tied to `ResearchTopicStatus`) remains
untouched and is not a duplicate — it answers a different, Research-specific question ("what's
the one next action") at a different granularity than the new universal 12-state vocabulary.

## Planned (not started)

Governance Intelligence and Economic Intelligence ecosystems, each with their own foundation
adapter once real domain data exists to adapt. Consolidating `lib/graph/`, `lib/research/graph/`,
and `lib/intelligence/graph/` onto `lib/relationships/` once a visual verification workflow
exists to de-risk the migration. Unifying or retiring `lib/intelligence/evidence.types.ts`'s
numeric-scoring Evidence model, `lib/intelligence/engine/`'s numeric confidence-scoring
reasoning pipeline, and `lib/intelligence/agents/tasks/` / `runtime/`'s dormant task-dispatch
system. Wiring `IntelligenceFoundationView.reasoning` and `.workflow` into UI, and giving a real
caller a way to record real `WorkflowTransition`s as work actually happens (currently every demo
Workflow honestly starts and stays at `not_started` with empty history). AI reasoning
(model-backed, as opposed to the deterministic structural reasoning built in EPIC-05), Executive
Briefing, Voice Intelligence, Evidence-backed Recommendations, a rendered Timeline, a Knowledge
Graph view, and Mission Execution — the Evidence, Relationship, Reasoning, and Workflow shapes
are architecturally ready for these, but no UI or derivation logic exists yet. No target date is
committed here — see `docs/current-progress.md` for what's honestly available today.
