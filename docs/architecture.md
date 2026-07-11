# CBAI Architecture

## Layering

```
Foundation                  lib/foundation/
    ↓
Intelligence Engines         lib/research/{evidence,intelligence,readiness,health,workflow,review}
    ↓
Workspace                    lib/research/intelligence/review-workspace-*, workspace-shell-*
    ↓
Experience                   components/research/topic/*, components/platform/*
```

Rule: intelligence logic never lives in React. Components consume already-computed engine
output; they do not derive, score, or decide anything themselves. Every research UI component
built so far follows this — none contain `useState`/`useEffect` for business logic, and none
re-derive a signal an engine already produced.

## The Intelligence Foundation (`lib/foundation/`)

Introduced in EPIC-02. Ten domain-agnostic pillars every future ecosystem (Research, Governance,
Economic, Education, Engineering, Legal, ...) is expected to express its concepts through:

| Pillar | Shape | Research Intelligence's current instance |
|---|---|---|
| Subject | `{ subjectId, subjectLabel, subjectKind }` | `ResearchTopic` |
| Mission | `{ subjectId, statement }` | `buildMissionStatement` output |
| Question | `{ questionId, question }` | `ReviewOpenQuestion` (now a direct type alias) |
| Evidence | see "Universal Evidence Operating System" below | `TopicEvidenceCatalogItem` |
| Relationship | see "Universal Relationship Engine" below | `relatedMethods` / `relatedEvidenceTypes` |
| Analysis | `{ subjectId, summary, reasons }` | `EvidenceGapIntelligence` |
| Recommendation | `{ recommendationId, label, reason }` | `WorkflowResult.nextAction` / `.reason` |
| Execution | `{ label, href }` | `WorkflowResult.actionLink` |
| TimelineEvent | `{ eventId, occurredAt, description }` | `WorkspaceTimelineEvent` |
| Knowledge | `{ knowledgeId, body, createdAt }` | `ResearchNote` / `ResearchFinding` |

`lib/foundation/foundation-model.ts` defines the ten interfaces. `lib/foundation/foundation-view.ts`
defines `IntelligenceFoundationView`, the composed shape a full subject view resolves to.

Domain modules do **not** rewrite their internals to use these names directly — that would be a
large, high-risk change with no runtime verification available in this environment. Instead,
each domain owns an **adapter** (`lib/foundation/adapters/<domain>-foundation-adapter.ts`) of
pure functions that translate the domain's real engine output into the foundation shape. Today
there is exactly one: `research-foundation-adapter.ts`, whose `buildResearchFoundationView(topicId)`
composes `buildTopicEvidenceReview`, `deriveEvidenceGapIntelligence`, `deriveResearchWorkflow`,
`buildResearchReviewWorkspace`, and `getWorkspaceTimeline` — every existing Research Intelligence
engine, unmodified — into one `IntelligenceFoundationView`. No engine internals changed; the
adapter's correctness is verified entirely by TypeScript's structural type-checking at build
time (`npm run build`), which would fail if any research engine's real shape stopped matching
what the foundation expects.

One direct structural connection was made, not just an adapter: `ReviewOpenQuestion` (used by
the existing Review Workspace and Cockpit UI) is now `export type ReviewOpenQuestion = Question`
— its fields were already an exact match, so this is a zero-risk, zero-behavior-change alias
that makes the two concepts provably the same type, not merely convertible.

## Universal Relationship Engine (`lib/relationships/`)

Introduced in EPIC-03. Deepens the Foundation's Relationship pillar (`lib/foundation/
foundation-model.ts`) with a richer, still-optional envelope — `direction`, `strength`,
`evidence` (reusing the Foundation's own `Evidence` type), `confidence`, `time`, `status`,
`source`, and `limitations` — plus a required `explanation`. Sixteen relationship types are
defined in `lib/foundation/relationship-types.ts` (`supports`, `contradicts`, `depends_on`,
`collaborates_with`, `funded_by`, `regulated_by`, `creates`, `uses`, `improves`, `replaces`,
`extends`, `references`, `affects`, `measures`, `belongs_to`, `related_to`), extensible by
adding more values as real ecosystems need them.

`strength` is categorical (`weak | moderate | strong | unknown`), never a numeric magnitude.
`confidence` is categorical and **deterministically derived from evidence count**
(`deriveRelationshipConfidence`: 0 evidence → `unverified`, 1 → `single_source`, 2+ →
`corroborated`; `disputed` is available for a caller to set when a real, known contradiction
exists) — never a fabricated score.

`lib/relationships/relationship-builder.ts` (`buildRelationship`) constructs honest records;
`lib/relationships/relationship-query.ts` provides pure, in-memory graph-traversal primitives
(`findRelationshipsForSubject`, `findRelationshipsByType`, `resolveConnectedSubjectIds`,
`findRelationshipsAmongSubjects`) — this is the engine a future visual Knowledge Graph
consumes; no rendering or layout logic lives here, so a graph UI can be built without touching
this file. `research-foundation-adapter.ts`'s `toRelationships()` now calls `buildRelationship`
instead of constructing `Relationship` objects by hand.

### Known duplication this Epic did not resolve

Inspection for this Epic found **three separate, pre-existing graph/relationship systems**,
confirming the exact problem this Foundation exists to eventually solve:

- **`lib/graph/`** — real, active, wired to the live `/graph` route (`GraphCanvas`,
  `GraphPipeline`, etc.). `GraphEdgeType` is hardcoded to countries/companies/universities
  (`located-in | partner | competitor | research-partner | industry | investment`).
- **`lib/research/graph/`** — real, active, backs the Global Research Network on `/research`.
  Its own relationship vocabulary (`belongs_to_domain`, `uses_method`, `requires_evidence`,
  `related_topic`, `future_supports`) is research-specific and distinct from both `lib/graph/`
  and the new universal vocabulary.
- **`lib/intelligence/graph/`** — a large, sophisticated, but **entirely dormant** graph/
  confidence/contradiction backend (`traversal.ts`'s `traverseGraphSkeleton` always returns an
  empty result; its own comments say "skeleton — Knowledge Graph adapter not connected").
  Confirmed via repo-wide search that nothing outside `lib/intelligence/` consumes any of
  `lib/intelligence/graph/`, `lib/intelligence/confidence/`, or `lib/intelligence/contradictions/`.

None of these three were migrated or touched this Epic — the first two are real, live, working
features with no way to visually verify a migration in this environment, and the third is a
much larger (150+ file) subsystem than this Epic's scope supports auditing safely. The new
`lib/relationships/` engine is the one intended to eventually unify them, but that migration is
explicitly deferred — see `docs/current-progress.md`.

## Universal Evidence Operating System (`lib/evidence/`)

Introduced in EPIC-04. Evidence is now a first-class Foundation pillar, not a Research-only
concept: `lib/foundation/foundation-model.ts`'s `Evidence` interface carries all 21 fields the
mission named — identity, original source, source type, origin organization, authors,
publication date, version, language, original language, verification status, reliability,
confidence, known limitations, supporting/conflicting evidence links, related subjects/
missions/questions/relationships, timeline, and an append-only history log. Only `evidenceId`,
`label`, and `status` are required — every new field is optional and left `undefined` when the
real value is genuinely unknown, so every existing Evidence record (catalog items, Relationship
evidence arrays) remains valid without any migration.

Two vocabularies were **promoted, not duplicated**, from real pre-existing domain modules into
`lib/foundation/evidence-types.ts`:

- `EvidenceSourceType` (`publication | dataset | experiment | patent | laboratory | researcher |
  institution | company | government | other`) — promoted from
  `lib/research/evidence/evidence-types.ts`, which now re-exports the Foundation type as a
  zero-behavior-change alias.
- `VerificationStatus` (`not_started | verification_pending | verified | failed |
  not_applicable`) — promoted from `lib/evidence-infrastructure/types.ts` (a real, active,
  philosophically-aligned "no scores or rankings" system), which now re-exports the Foundation
  type the same way.

`EvidenceReliability` (`unknown | low | moderate | high`) is new — no existing module defined an
equivalent concept. `Confidence` (`unverified | single_source | corroborated | disputed`) was
extracted out of EPIC-03's `RelationshipConfidence` into a shared `lib/foundation/confidence.ts`
so Evidence and Relationship use one definition, not two; `RelationshipConfidence` is now
`export type RelationshipConfidence = Confidence` and `deriveRelationshipConfidence` delegates to
the shared `deriveConfidenceFromSourceCount`. All four vocabularies are categorical, never
numeric — no fabricated score is ever attached to a piece of evidence.

`lib/evidence/` is the reusable Evidence Engine:

- `evidence-builder.ts` — `buildEvidence`, constructs an honest record with every unsupplied
  field left undefined.
- `evidence-validation.ts` — `validateEvidenceRecord`, deterministic structural checks only
  (has an identity/label/status, does not claim to support or conflict with itself or claim both
  relations to the same record) — never a quality or truth score.
- `evidence-linking.ts` — `linkSupportingEvidence` / `linkConflictingEvidence`, additive and
  deduplicated.
- `evidence-history.ts` — `appendEvidenceHistory`, append-only (history is never rewritten in
  place).
- `evidence-query.ts` — `findEvidenceForSubject`, `groupEvidenceBySourceType`,
  `groupEvidenceByVerificationStatus`, `compareEvidence` (relation derived only from a record's
  own declared supporting/conflicting links, never inferred from content similarity), and
  `traceEvidence` (provenance/history summary).

`research-foundation-adapter.ts`'s `toEvidence()` now calls `buildEvidence` instead of
constructing `Evidence` objects by hand, and honestly maps the Research catalog's coarse
`TopicEvidenceCatalogStatus` to `VerificationStatus` (`catalog_available → not_started`,
`source_not_connected → not_applicable`, `human_review_required → verification_pending`) — it
never claims `verified`, since nothing in the catalog has actually been verified.

### Prepared for, not implemented, this Epic

Per the mission's explicit scope boundary, the following remain **architectural placeholders
only** — the Evidence shape and engine are ready to support them, but no UI or derivation logic
was added: AI reasoning over evidence, Executive Briefing generation, Voice Intelligence,
Evidence-backed Recommendations, a rendered Timeline, a Knowledge Graph view, and Mission
Execution. Each can consume `Evidence.relatedMissionIds` / `.relatedQuestionIds` /
`.relatedRelationshipIds` / `.timeline` / `.history` once built, without another shape change.

### Known non-integration: `lib/intelligence/evidence.types.ts`

Inspection for this Epic found a third, pre-existing "Evidence" concept in the large, mostly-
dormant `lib/intelligence/` subsystem: a numeric `relevance: number` (0–100) scoring model with
an `EvidenceQualityBand`/`EvidenceQualityDimensionScore` quality-assessment layer
(`lib/intelligence/evidence/quality/quality.types.ts`). This was deliberately **not** integrated
with the new universal Evidence pillar — it is philosophically incompatible with the categorical,
never-fabricated-score approach used everywhere else in the Foundation. It remains untouched,
internally consistent, and unused outside `lib/intelligence/`; unifying or retiring it is left as
known technical debt (see `docs/current-progress.md`).

## Intelligence Reasoning Framework (`lib/reasoning/`)

Introduced in EPIC-05. Sits one layer above the Evidence and Relationship engines: it consumes
their real output (never re-derives it) and produces `ReasoningResult` — structured,
explainable decision **support**, never a decision, an opinion, or a fabricated confidence
value. The shape lives in `lib/foundation/reasoning-types.ts` (Foundation tier, alongside
`relationship-types.ts` and `evidence-types.ts`); the derivation logic lives in
`lib/reasoning/reasoning-engine.ts` (Engine tier, alongside `lib/relationships/` and
`lib/evidence/`) — the same types/engine split already established for Relationship and
Evidence.

```
Foundation                  lib/foundation/  (Subject, Mission, Question, Evidence, Relationship, ReasoningResult, ...)
    ↓
Evidence Engine + Relationship Engine   lib/evidence/, lib/relationships/
    ↓
Reasoning Framework          lib/reasoning/  (buildReasoningResult, validateReasoningInput)
    ↓
Workspace / Experience       (not wired to any UI yet — see below)
```

`ReasoningInput` takes exactly the five inputs the mission named — `question`, an optional
`mission`, `evidence`, optional `relationships`, and an optional `timeline` — nothing else, and
nothing is fetched internally. `buildReasoningResult(input)` deterministically derives every one
of the eleven required output sections, each with an explicit, auditable rule:

| Output | Derivation | Honesty rule |
|---|---|---|
| Observed Facts | Evidence items with `verificationStatus === "verified"` | Never asserted from anything less than an explicit "verified" status |
| Known Unknowns | Evidence items with `verificationStatus` unresolved (`undefined`, `not_started`, `verification_pending`) | Named, not hidden — the reason states the real status |
| Supporting / Conflicting Evidence | `compareEvidence` (reused from `lib/evidence/evidence-query.ts`, not duplicated) applied pairwise | Only a record's own declared `supportingEvidenceIds`/`conflictingEvidenceIds` are consulted, never content similarity |
| Reasoning Path | One audit-trail `ReasoningStep` per stage actually executed, each naming which evidence it used | Describes what the engine did, not a hidden inference |
| Possible Options | One `ReasoningOption` per real `improves`/`replaces`/`extends`/`uses` relationship the caller supplied | Never invented — every option is a relationship the caller already declared, with `support` reusing the shared `Confidence` vocabulary |
| Trade-offs | One per option with a real declared conflict count | States a count, never a fabricated pro/con narrative |
| Risks | One per real `contradicts` relationship, `severity` reusing `RelationshipStrength` | No risk without a declared contradiction |
| Potential Consequences | One per real `affects` relationship, using the relationship's own `explanation` text | No consequence text is generated — only relayed |
| Open Questions | Known Unknowns rendered back as `Question` objects | 1:1 with Known Unknowns, no new claims |
| Human Decision Required | Always `true` — enforced at the type level (`humanDecisionRequired: true`) | This framework produces reasoning, never a decision; `humanDecisionReason` explains why, varying with what conflicts/risks/unknowns were actually found |

`lib/reasoning/reasoning-validation.ts` (`validateReasoningInput`) is deterministic structural
validation only (subjectId and question present) — an empty evidence array is not treated as
invalid, since honestly reasoning over "no evidence yet" is a real, expected case.

`research-foundation-adapter.ts`'s `toReasoningResult()` wires the framework to Research
Intelligence's real, already-shipped catalog evidence and relationships, and
`buildResearchFoundationView()` populates the new optional `IntelligenceFoundationView.reasoning`
field with it — proven for all 65 real catalog topics by a successful `npm run build`. The
question a topic reasons over is its first real open question when one exists, otherwise one
mechanically composed from the topic's own name (the same "real data reworded into a sentence"
pattern `toMission()` already used) — never an invented claim.

### Prepared for, not implemented, this Epic

No UI consumes `IntelligenceFoundationView.reasoning` yet — per the mission's explicit scope
("prepare reusable reasoning objects... React must consume the framework" once it does), the
framework is proven only at the type/build level, matching the same precedent set by the
Relationship and Evidence engines in EPIC-03/04.

### Known non-integration: `lib/intelligence/` reasoning subsystem

Inspection for this Epic found a fourth, large, entirely dormant subsystem in `lib/intelligence/`
implementing an earlier "governed inference pipeline" design (`result.types.ts`, `trace.types.ts`,
`trust.types.ts`, `engine/`, `orchestrator/` — referencing a separate, never-wired
`CBAI-Intelligence-Specification-v1.md`). It uses a `ConfidenceAssessment` model built on
`lib/intelligence/confidence.types.ts`'s numeric scoring, the same philosophical mismatch found
with `lib/intelligence/evidence.types.ts` in EPIC-04. Confirmed via repo-wide search that nothing
outside `lib/intelligence/` consumes `lib/intelligence/engine/` or `lib/intelligence/orchestrator/`.
Not integrated, for the same reason as before — recorded as known technical debt, not an
oversight (see `docs/current-progress.md`).

The existing, real, live `/reasoning` route (`lib/reasoning-explorer.ts`,
`components/reasoning/*`) is unrelated and untouched: it is architectural documentation of the
platform's reasoning *philosophy* (pipeline stages, methodology, trust limits), not an
executable reasoning engine, and does not construct or consume `ReasoningResult`. No naming
collision exists (`lib/reasoning-explorer.ts` vs. the new `lib/reasoning/` directory).

## Universal Intelligence Workflow Framework (`lib/workflow/`)

Introduced in EPIC-06. Not project management, not task management — no assignees, due dates,
or subtasks. A `Workflow` (`lib/foundation/workflow-types.ts`) is the process record that
connects every capability already built — `question`, `mission`, `evidence`, `relationships`,
`reasoning`, and `execution` — to one auditable state machine, the same types/engine split
already established for Relationship, Evidence, and Reasoning:

```
Foundation                  lib/foundation/  (..., Workflow, WorkflowState, WorkflowTransition)
    ↓
Evidence Engine + Relationship Engine   lib/evidence/, lib/relationships/
    ↓
Reasoning Framework          lib/reasoning/
    ↓
Workflow Framework           lib/workflow/  (createWorkflow, applyWorkflowTransition, ...)
```

`WORKFLOW_STATES` is the twelve reusable states the mission named, treated as a closed
vocabulary (the same discipline as `RELATIONSHIP_TYPES`): `not_started`, `collecting_evidence`,
`review_in_progress`, `waiting_for_information`, `ready_for_reasoning`, `reasoning_complete`,
`waiting_for_human_decision`, `approved`, `executing`, `monitoring`, `completed`, `archived`.
"Evolution" — one of the ten capabilities every workflow must support — is deliberately **not**
a thirteenth state; it is represented as the transition graph's own capability to loop from
`monitoring` (or `completed`) back to `collecting_evidence` once new information surfaces, so a
shipped workflow can honestly reopen evidence collection without inventing a new terminal state.
"Evidence Collection" and "Evidence Review" map to `collecting_evidence`/`review_in_progress`;
"Relationship Discovery" happens during collection/review (Relationships are carried directly on
`Workflow.relationships`, not given a separate state); "Reasoning" maps to
`ready_for_reasoning`/`reasoning_complete`; "Human Decision" maps to
`waiting_for_human_decision`/`approved`; "Execution" and "Monitoring" map to `executing`/
`monitoring` 1:1.

Every `WorkflowTransition` carries all six fields the mission required — `reason`, `timestamp`,
`actor`, `evidenceReference`, `previousState`, `nextState`. `evidenceReference` is a **required
key with an honest nullable value** (`string | null`): most early transitions (e.g. "start
collecting evidence") genuinely have no specific evidence record behind them yet, and forcing a
fabricated reference there would violate the platform's anti-fabrication rule — so the field is
always present, explicitly `null` when nothing real backs it, never silently omitted. `actor` is
`{ actorType: "human" | "system"; actorId?: string }` — deliberately minimal, since the platform
ships without authentication (constitution §15.1); no fabricated user identity is invented.

`lib/workflow/` is the reusable Workflow Engine:

- `workflow-builder.ts` — `createWorkflow`, starts a Workflow at `not_started` with empty
  history. Entering the initial state is not itself a recorded transition — there is no real
  prior state to transition from.
- `workflow-transition.ts` — `WORKFLOW_TRANSITIONS` (the declared graph),
  `canTransitionWorkflow`, `validateWorkflowTransition`, and `applyWorkflowTransition` (pure —
  returns a new `Workflow` with the transition appended, or an explicit rejection reason; never
  mutates, never allows a transition outside the declared graph).
- `workflow-validation.ts` — `validateWorkflowRecord`, deterministic structural checks: identity
  present, every recorded transition legal per the graph, transitions chain consistently, and
  `currentState` matches the last transition's `nextState`.
- `workflow-query.ts` — `isWorkflowStateTerminal` (only `archived` is terminal — `completed` can
  still evolve back into collection), `latestWorkflowTransition`,
  `findWorkflowTransitionsByActor`, `findWorkflowTransitionsToState`, `describeWorkflowProgress`.

`research-foundation-adapter.ts`'s `toWorkflow()` wires the framework to a topic's real
Question/Mission/Evidence/Relationships/Reasoning, and `buildResearchFoundationView()` populates
the new optional `IntelligenceFoundationView.workflow` field with it, proven for all 65 real
catalog topics by a successful `npm run build`. It deliberately does **not** synthesize a fake
transition history from the pre-existing Research Workflow Engine's point-in-time stage signal
(`WorkflowResult.currentStage`) — inventing an actor, timestamp, and reason for transitions that
were never actually recorded would fabricate provenance. Every demo `Workflow` honestly starts at
`not_started` with empty history; a real caller applies real transitions via
`applyWorkflowTransition` as work actually happens.

### Related, not duplicated: `lib/research/workflow/`

The pre-existing Research Workflow Engine (`WorkflowStage`: 5 values tied 1:1 to the current
3-value `ResearchTopicStatus` model; `WorkflowNextAction`: 6 values) is a different, narrower
tool solving a different problem — a single deterministic "what's the one next action" signal
for Research topics specifically, with no transition history at all. It is untouched and remains
the source `toRecommendation()` and `executionHref` already consume. No vocabulary overlaps: the
universal `WorkflowState`'s 12 values and the Research-specific `WorkflowStage`'s 5 values name
different concepts at different granularities, by design.

### Known non-integration: `lib/intelligence/agents/tasks/` and `lib/intelligence/runtime/`

Inspection for this Epic found a fifth dormant area in `lib/intelligence/`:
`agents/tasks/task-lifecycle.ts` defines a real, well-built agent **task** lifecycle
(`created → queued → ready → running → completed/failed/cancelled/timeout`) with its own
transition-graph validator (`validateTaskLifecycleTransition`), and `runtime/` layers a
scheduler/queue/worker/registry system on top. This solves a genuinely different problem — agent
task dispatch, not an intelligence process's Question→Mission→Evidence→...→Execution lifecycle —
and is unrelated in vocabulary and purpose to the new `lib/workflow/`. Confirmed via repo-wide
search that nothing outside `lib/intelligence/` consumes `lib/intelligence/agents/tasks/` or
`lib/intelligence/runtime/`. Not integrated; recorded as known technical debt, not an oversight
(see `docs/current-progress.md`).

## Intelligence Orchestration Layer (`lib/orchestration/`)

Introduced in EPIC-07. This Epic creates no new capability — it connects the five that already
exist (Foundation, Evidence, Relationship, Reasoning, Workflow) into one reusable pipeline:

```
Question → Foundation → Evidence Discovery → Relationship Resolution → Reasoning → Workflow → Intelligence Result
```

`IntelligenceResult` (`lib/foundation/orchestration-types.ts`, Foundation tier) is the output
shape: `subject`, `question`, `mission?`, `evidence`, `relationships`, `reasoning?`, `workflow?`,
plus `pipelineTrace` (one honest `IntelligencePipelineStageTrace` per stage — `ran` and a real
`outputCount`, never a fabricated completeness score) and `extensions` (see below). It is
deliberately **not nested inside `IntelligenceFoundationView`** — both shapes carry
evidence/relationships/reasoning/workflow, but for different purposes: `IntelligenceFoundationView`
is EPIC-02's broader "current state of a subject" view (it also carries Analysis, Recommendation,
Knowledge, Timeline); `IntelligenceResult` is the audit record of one orchestration pipeline
execution, with per-stage traceability. Nesting one inside the other would duplicate the same
evidence/relationships/reasoning/workflow data twice in one object for no real benefit.

`lib/orchestration/pipeline-engine.ts`'s `runIntelligencePipeline(providers, input)` is the
entire orchestration layer — and it contains **zero domain logic**. `providers`
(`IntelligencePipelineProviders`, `lib/orchestration/pipeline-types.ts`) is a plugin contract:

| Provider | Domain-specific? | Default |
|---|---|---|
| `resolveFoundation` | Yes — every domain must supply it | none |
| `discoverEvidence` | Yes — every domain must supply it | none |
| `resolveRelationships` | Yes — every domain must supply it | none |
| `reason` | No — already domain-agnostic | `buildReasoningResult` (`lib/reasoning/`) |
| `buildWorkflow` | No — already domain-agnostic | `createWorkflow` (`lib/workflow/`) |

The orchestrator never knows what a "research topic" or a "government policy" is — Foundation
resolution, Evidence Discovery, and Relationship Resolution are always supplied by the caller.
Reasoning and Workflow are consumed **directly** from the real EPIC-05/EPIC-06 engines (never
re-derived), with the option to override for a domain that needs a different engine entirely —
satisfying "every stage must be replaceable" without duplicating the defaults' logic. Every
provider function, and `runIntelligencePipeline` itself, is a plain pure function — independently
testable in isolation with no pipeline scaffolding required.
`lib/orchestration/pipeline-validation.ts`'s `validateIntelligencePipelineProviders` performs
deterministic structural validation (the three required providers are real functions) before a
domain's providers are used.

`IntelligenceExtensionPoints` reserves six named slots for future Epics — `executiveBriefing`,
`voiceIntelligence`, `knowledgeCollaboration`, `missionMonitoring`, `analytics`,
`agentInsights` — every one `unknown | undefined` and always empty today. Declaring the slots now
means a future Epic composes a real value into an existing field, not a shape change.

`research-foundation-adapter.ts`'s `researchIntelligencePipelineProviders` +
`runResearchIntelligencePipeline(topicId)` wire the layer to Research Intelligence's real data —
every provider function is a thin wrapper around the adapters EPIC-02/03/04 already defined
(`toSubject`, `toMission`, `toEvidence` via `buildTopicEvidenceReview`, `toRelationships`), so no
evidence/relationship logic is duplicated. Verified structurally by a successful `npm run build`
(the full-project TypeScript pass type-checks it against every real Research type); unlike
`toReasoningResult`/`toWorkflow`, this entry point is not called from
`buildResearchFoundationView`'s static-generation path (that would recompute the same
evidence/relationships/reasoning/workflow a second time per page, for the reason given above), so
it is not yet functionally exercised during the build for all 65 topics — see
`docs/current-progress.md`.

### React never performs orchestration

No component imports `lib/orchestration/`. `runIntelligencePipeline` and every provider are pure
`lib/` functions; if a future Epic renders `IntelligenceResult`, the component will receive an
already-computed result exactly as every other Foundation output is consumed today.

### Known non-integration: `lib/intelligence/orchestrator/` and `lib/intelligence/pipeline-stage.types.ts`

Inspection for this Epic found the closest analog yet in the dormant `lib/intelligence/`
subsystem: a full "BUILD-022" pipeline orchestrator (`orchestrator/orchestrator.ts`) sequencing
nine stages (`request → evidence-collection → contradiction-detection → confidence-assessment →
trust-assessment → graph-context → memory-context → reasoning-trace → intelligence-result`,
`pipeline-stage.types.ts`) with its own `IntelligenceResult` type (`result.types.ts`) — same name
as the new Foundation-tier type, different module, no import collision, but a direct conceptual
overlap. It is built on the same numeric `ConfidenceAssessment`/`TrustAssessment` scoring model
already found philosophically incompatible in EPIC-04/EPIC-05, and is wired to its own dormant
`runtime/`, `agents/`, and `registry/` subsystems (EPIC-06's fifth finding). Confirmed via
repo-wide search that nothing outside `lib/intelligence/` consumes
`lib/intelligence/orchestrator/`. Not integrated, for the same reason as every prior finding —
recorded as known technical debt (see `docs/current-progress.md`), not migrated, since doing so
would mean adopting its numeric scoring model or a high-risk rewrite with no way to visually
verify the result in this environment.

## Global Intelligence Network (`lib/network/`)

Introduced in EPIC-08. Not a social network — no followers, no messaging, no popularity signal
anywhere in this layer. A node is a real Intelligence Entity (researcher, laboratory,
university, company, investor, government agency, policy program, grant, mission, evidence,
patent, dataset, publication, technology, engineer, research center); an edge is the Foundation's
own `Relationship` type, unmodified — so every connection is evidence-aware and traceable by
construction (`Relationship.evidence`, `.limitations`), with no new edge primitive introduced.

`lib/foundation/network-types.ts` (Foundation tier) defines:

- `INTELLIGENCE_ENTITY_KINDS` — the sixteen entity kinds the mission named, a closed vocabulary
  (same discipline as `RELATIONSHIP_TYPES`/`WORKFLOW_STATES`). Deliberately **not** used to
  retype `Subject.subjectKind` (a plain string relied on by every existing Subject producer,
  including Research's own `"research_topic"`, which isn't one of the sixteen kinds) — instead,
  `IntelligenceNetworkNode = { subject: Subject; entityKind: IntelligenceEntityKind }` wraps a
  Subject with a real, honestly-chosen kind, so nothing existing is retyped or broken.
- `IntelligenceNetwork` — `{ nodes, edges, extensions }`, the whole network.
- `CollaborationCandidate` — `{ nodeAId, nodeBId, basis, sharedReferenceIds }`. `basis` is one of
  `shared_evidence | shared_relationship_target | shared_mission`; `sharedReferenceIds` always
  names the real Evidence or target-entity id the candidate is grounded in. There is no
  popularity, connection-count, or "mutual friends" concept anywhere in this type.
- `NetworkExtensionPoints` — ten always-empty, `unknown`-typed slots for the future capabilities
  the mission named (Research Collaboration, Funding Discovery, Innovation Partnerships,
  University Networks, Government Programs, Industrial R&D, International Collaboration,
  Mission Matching, Knowledge Exchange, Evidence Sharing) — same "declare the slot, populate
  nothing" pattern as EPIC-07's `IntelligenceExtensionPoints`.

`lib/network/` is the reusable engine:

- `network-builder.ts` — `buildIntelligenceNetwork`, pure assembly of caller-supplied nodes and
  edges.
- `network-validation.ts` — `validateIntelligenceNetwork`, deterministic structural checks:
  every node has a real identity and no duplicates; every edge is evidence-aware (declares real
  `evidence` or real `limitations` — never silent about an unconnected source). This directly
  enforces the mission's "every connection must be evidence-aware" and "must be traceable" rules
  at the data level, not just as a design intention.
- `network-query.ts` — `findNodesByEntityKind`, `findNodeById`, `findEdgesForNode`,
  `findConnectedNodes`, `traceEdgeEvidence`. `findEdgesForNode`/`findConnectedNodes` delegate
  directly to `lib/relationships/relationship-query.ts`'s `findRelationshipsForSubject`/
  `resolveConnectedSubjectIds` — graph traversal is not re-implemented.
- `network-collaboration.ts` — the one genuinely new derivation: `findSharedEvidenceCollaboration
  Candidates` (two nodes both named in the same Evidence's `relatedSubjectIds`),
  `findSharedRelationshipTargetCollaborationCandidates` (two nodes with a real edge to the same
  third entity, reported as `shared_mission` when that entity is mission-kind), and
  `findCollaborationCandidates` (both, combined). Every candidate traces to a real id; nothing is
  scored, ranked, or inferred from popularity.

### Real-data demonstration: `lib/research/entities/` → Global Intelligence Network

`lib/foundation/adapters/research-entity-network-adapter.ts` maps the pre-existing
`lib/research/entities/` catalog (`ResearchEntity`, flagged since EPIC-02/03 as "not yet
connected to the Foundation's Relationship pillar") onto the network — resolving that exact,
previously-documented technical debt. Only entity types with an honest, direct match are mapped:
`researcher`, `laboratory`, `university`, `technology`, `publication`, `dataset`, `patent` map
1:1; `research_topic` maps to `"mission"` (a ResearchTopic is exactly what a Mission is about —
the same relationship `toMission()` already expresses in the topic-based adapter). `organism`,
`disease`, `method`, `experiment`, `open_question`, and `negative_result` have no honest match in
the sixteen-kind vocabulary and are **excluded**, not forced — no entity is mislabeled to make a
demo look richer. Edges come only from the registry's own `relatedEntityIds` cross-references,
built through `buildRelationship` (never constructed by hand), and only connect two entities that
both mapped to a real network node. Verified structurally by a successful `npm run build`; like
`runResearchIntelligencePipeline` (EPIC-07), `buildResearchIntelligenceNetwork()` is not called
from any static-generation path, so it is type-checked but not functionally exercised during the
build — see `docs/current-progress.md`.

### Extension only — no UI, no React, no fake data

Per the mission's explicit scope, this Epic ships architecture only: no component imports
`lib/network/`, no new route, and no invented researcher/university/company/grant records were
added anywhere — every node in the one real demonstration above is a pre-existing catalog entry.

## Intelligence Workspace Platform (`lib/workspace/`)

Introduced in EPIC-09. Not a dashboard, not a page, not isolated UI — one reusable
`WorkspaceView` shape (`lib/foundation/workspace-types.ts`) that every future workspace
(Research, Government, University, Enterprise, Engineering, Investment, Legal, Education) will
render. It is built **entirely** from data the Orchestration Layer (EPIC-07) and the Global
Intelligence Network (EPIC-08) already produced — `buildWorkspaceView(result, network?)`
contains no new intelligence logic, only assembly and honest defaulting:

```
Orchestration Layer          lib/orchestration/  → IntelligenceResult
Global Intelligence Network  lib/network/        → IntelligenceNetwork (optional)
    ↓
Workspace Platform           lib/workspace/  → WorkspaceView (nine sections)
    ↓
Experience                   (not built this Epic — see below)
```

The nine required sections, and exactly what each one is (a pass-through or a trivial default,
never a re-derivation):

| Section | Source | Logic |
|---|---|---|
| Mission Center | `IntelligenceResult.subject` / `.mission` / `.question` | none — direct pass-through |
| Intelligence Brief | `ReasoningResult.observedFacts` / `.knownUnknowns` / `.reasoningPath` | none — present only when reasoning ran |
| Evidence Center | `IntelligenceResult.evidence` + `ReasoningResult.supportingEvidence` / `.conflictingEvidence` | none |
| Knowledge Network | `IntelligenceResult.relationships` + optional `IntelligenceNetwork` | calls `findCollaborationCandidates` (EPIC-08), never re-implemented |
| Recommendations | `ReasoningResult.possibleOptions` / `.tradeOffs` | none |
| Monitoring | `Workflow.currentState` | calls `isWorkflowStateTerminal`/`latestWorkflowTransition` (EPIC-06), never re-implemented |
| Timeline | `Workflow.history` | none — the Workflow's own transition log *is* the honest timeline |
| Open Questions | `ReasoningResult.openQuestions` | none |
| Activity | `IntelligenceResult.pipelineTrace` | none — the Orchestration Layer's own stage trace *is* the honest activity record |

`extensions` on `WorkspaceView` is `IntelligenceResult.extensions` itself, not a new type —
Voice, Executive Briefing, Collaboration, Analytics, and Mission Monitoring support (the "Support
future" list this Epic named) were already reserved by EPIC-07's `IntelligenceExtensionPoints`;
the Workspace adds no parallel extension vocabulary.

`lib/workspace/workspace-validation.ts`'s `validateWorkspaceView` checks only identity and
Mission Center completeness — every other section is optional by design (reasoning/workflow may
not have run yet for a given pipeline result), so their absence is never flagged.
`lib/workspace/workspace-query.ts` provides deterministic boolean readers
(`hasConflictingEvidence`, `hasOpenQuestions`, `hasCollaborationCandidates`,
`isWorkspaceMonitoring`, `isWorkspaceTerminal`) so a future React component asks these questions
instead of inspecting array lengths or field presence itself — the mechanism that keeps
intelligence logic out of components once a workspace UI is built.

`research-workspace-adapter.ts`'s `buildResearchWorkspaceView(topicId)` proves the platform
against real data by composing two already-real pipelines — `runResearchIntelligencePipeline`
(EPIC-07) and `buildResearchIntelligenceNetwork` (EPIC-08) — with zero new logic. Verified
structurally by a successful `npm run build`; like its two dependencies, it is not called from
any static-generation path, so it is type-checked but not functionally exercised during the
build — see `docs/current-progress.md`.

### No dashboards, no pages, no UI this Epic

Per the mission's explicit scope, `lib/workspace/` contains zero React, zero components, and
zero routes. No component anywhere imports it yet. When a future Epic renders a workspace, the
component will receive an already-computed `WorkspaceView` exactly as every other Foundation
output is consumed today — "every section must communicate only through the Orchestration
Layer" is enforced by construction, since `WorkspaceView` cannot be built from anything else.

### Related, not duplicated: `lib/workspaces/`

The pre-existing `lib/workspaces/` (plural) is a different, real, active system: persona-based
evidence-coverage explorers (`WorkspaceBaseModel`, `WorkspacePersona`, `WorkspaceCoverageItem`)
backing the live `/investor`, `/citizen`, and `/government` routes, built on the Indicator
Framework and Evidence Infrastructure — unrelated in shape and purpose to the new singular
`lib/workspace/`, and untouched. No naming collision exists (`WorkspaceView` vs.
`WorkspaceBaseModel`, `WorkspaceSummary`, etc. — all distinct identifiers).

## Platform Core Freeze — CBAI Platform RC-1

EPIC-10 performed a full audit of everything above (`lib/foundation/` through `lib/workspace/`,
plus `lib/foundation/adapters/` — 41 files, 2,761 lines) and declared it frozen as **CBAI
Platform RC-1**. Full audit trail, Constitution audit, health analysis, and freeze declaration:
`docs/CBAI-Platform-RC1.md`. Summary of what changed structurally:

- **One real duplicate found and fixed**: six independently-declared, byte-for-byte-identical
  `{ valid, issues }` validator-result interfaces were consolidated into
  `lib/foundation/validation-types.ts`'s `PlatformValidationResult`, with all six original names
  kept as zero-behavior-change aliases (`EvidenceValidationResult`,
  `ReasoningInputValidationResult`, `WorkflowValidationResult`, `NetworkValidationResult`,
  `PipelineProvidersValidationResult`, `WorkspaceValidationResult`).
- **Zero circular dependencies** confirmed by a full import-graph extraction — the Platform Core
  is a strict DAG (Foundation → single-input engines → composite engines → Orchestration/
  Workspace → adapters), exactly as every prior Epic's architecture notes claimed.
  `lib/foundation/`'s core files (excluding `adapters/`) have zero outbound imports, confirmed
  directly rather than by inspection alone.
- **One documentation imprecision fixed**: this file previously said `lib/workspace/` "sits
  above" `lib/orchestration/` in a way that implied a direct import; it consumes
  `IntelligenceResult` (a type declared in `lib/foundation/`) but never imports the
  `lib/orchestration/` engine module itself. Corrected above.
- **One naming inconsistency found, deliberately not fixed**: `createWorkflow`/
  `CreateWorkflowInput` break the `build*`/`Build*Input` convention every sibling engine follows.
  Not renamed — the blast radius (three code call sites plus four historical Epic doc records)
  exceeded this freeze's low-risk bar. Recorded as accepted technical debt.
- **Six dead exports identified, not removed**: `validateEvidenceRecord`,
  `validateReasoningInput`, `validateWorkflowRecord`, `validateIntelligenceNetwork`,
  `validateIntelligencePipelineProviders`, and `validateWorkspaceView` have no callers yet — each
  is a published, deterministic capability awaiting a real caller, not orphaned code.
- **Zero Constitution violations found** inside the Platform Core across all nine principles
  audited (Evidence First, Human Decision, No fabricated data, No fabricated confidence, No fake
  metrics, Explainable Intelligence, Traceable Intelligence, Universal Platform, Ecosystem
  Neutral). See `docs/standards/01-cbai-constitution.md` for the newly-ratified Platform Core
  Principles section this Epic added.

## Research Intelligence Domain Foundation (`lib/research-domain/`)

Introduced by the first Research Intelligence build after the CBAI Platform RC-1 freeze
(`docs/CBAI-Platform-RC1.md`). This is an **extension**, not a Platform Core change — no file
under `lib/foundation/`, `lib/relationships/`, `lib/evidence/`, `lib/reasoning/`,
`lib/workflow/`, `lib/orchestration/`, `lib/network/`, or `lib/workspace/` was modified to build
it, confirmed by `git diff --stat` at commit time (zero Platform Core files touched).

`lib/research-domain/` models the twenty-seven real Research Intelligence entities the mission
named (Research Mission through Research Impact — full list and vocabulary in
`research-entity-base.ts`'s `RESEARCH_ENTITY_KINDS`) as **types only** — no builder functions, no
validators, no seed data, mirroring EPIC-02's own Foundation, which was types-only until later
Epics added engines. Every entity extends `ResearchEntityBase`, which carries the eight concerns
the mission required, each a direct reuse of a Platform Core pillar:

| Concern | Field | Reused from |
|---|---|---|
| Identity | `entityId`, `entityKind`, `label` | — (new, domain-scoped identity) |
| Lifecycle | `lifecycleState` | New, small, closed vocabulary (`proposed \| active \| completed \| archived`) — deliberately not `WorkflowState` (EPIC-06), which describes a process's stages, not an entity's own existence lifecycle |
| Relationships | `relationships: readonly Relationship[]` | `lib/foundation/foundation-model.ts` (EPIC-03) |
| Evidence Links | `evidence: readonly Evidence[]` | `lib/foundation/foundation-model.ts` (EPIC-04) |
| Mission Links | `missions: readonly Mission[]` | `lib/foundation/foundation-model.ts` (EPIC-02) |
| Organization Links | `organizationIds: readonly string[]` | Plain id references to other entities — avoids circular embedding between organizations and the people/artifacts that belong to them |
| Timeline | `timeline: readonly TimelineEvent[]` | `lib/foundation/foundation-model.ts` (EPIC-02) |
| Traceability | `source?: string` | Same field name/shape as `Relationship.source` |

No field on any of the 27 entities is a score, a percentage, or a confidence value.
`GrantEntity.fundingAmount` is the one entity-specific field that looks numeric-adjacent — it is
an honest, optional **string**, never a derived or estimated amount.

Every concrete entity interface carries an `Entity` suffix (`ResearchTopicEntity`,
`UniversityEntity`, ...) specifically to avoid colliding with pre-existing, differently-shaped
types of the same short name already in this repo: `lib/research/research-topics.ts`'s
`ResearchTopic`, `lib/universities.ts`'s `University`, and
`lib/research/entities/research-entity-types.ts`'s `ResearchEntity`. None of those three files
were touched or imported by this module — `lib/research-domain/` is a parallel,
Foundation-aligned model, not a replacement for any of them, and not yet wired to any of them via
an adapter (that is future work, consistent with how `research-foundation-adapter.ts` already
separates "existing engine" from "Foundation shape").

`research-relationships.ts`'s `RESEARCH_RELATIONSHIP_PATTERNS` is documentation expressed as
typed data, not a validator: it records which of the Platform's existing 16 `RelationshipType`
values (`lib/foundation/relationship-types.ts`, EPIC-03) are the realistic fit for 30 common
Research entity-pair connections (researcher↔laboratory, project↔grant, finding↔hypothesis,
technology↔technology, ...). **No new `RelationshipType` value was needed** — 15 of the 16
existing values have a natural fit; `measures` has none demonstrated here and remains available,
unused, rather than being stretched to fit something it doesn't honestly describe. Nothing in
this table is constructed or consumed at runtime by any code in this module — real connections
between real entities are still built with `lib/relationships/`'s `buildRelationship`,
unmodified, exactly as before.

### Module map

```
lib/research-domain/
├── research-entity-base.ts             RESEARCH_ENTITY_KINDS (27), lifecycle vocabulary, ResearchEntityBase
├── research-entities-intent.ts         ResearchMissionEntity, ResearchProgramEntity, ResearchProjectEntity,
│                                        ResearchTopicEntity, ResearchQuestionEntity, HypothesisEntity, MethodologyEntity
├── research-entities-artifacts.ts      ExperimentEntity, DatasetEntity, PublicationEntity, PatentEntity, TechnologyEntity
├── research-entities-people.ts         ResearcherEntity, EngineerEntity, ScientistEntity, AcademicEntity, StudentResearcherEntity
├── research-entities-organizations.ts  LaboratoryEntity, ResearchCenterEntity, UniversityEntity
├── research-entities-funding.ts        FundingOpportunityEntity, GrantEntity, SponsorEntity
├── research-entities-outcomes.ts       PeerReviewEntity, FindingEntity, ResearchOutcomeEntity, ResearchImpactEntity
├── research-relationships.ts           RESEARCH_RELATIONSHIP_PATTERNS, ResearchDomainEntity (27-way union)
├── research-domain-builder.ts          buildResearchEntityBase                              (Phase 2)
├── research-domain-adapter.ts          toResearchTopicEntity, toResearchMissionEntity, ...   (Phase 2)
├── research-domain-query.ts            findResearchDomainEntityById, ...ByKind/Organization/Mission/Evidence (Phase 2)
├── research-domain-validation.ts       validateResearchDomainEntity(ies)                     (Phase 2)
└── research-domain-providers.ts        researchDomainPipelineProviders                       (Phase 2)
```

### Dependency direction (Phase 1)

The five Phase 1 type files (`research-entity-base.ts` through `research-relationships.ts`)
depend only on `lib/foundation/` (for `Evidence`, `Mission`, `Relationship`, `TimelineEvent`,
`Question`, `RelationshipType`) — zero engine or domain-module imports. Nothing in the Platform
Core imports them back. This remains true after Phase 2 — see below.

## Research Domain Integration, Phase 2 (`lib/research-domain/`)

Wires the Phase 1 Research Domain Foundation to real, already-shipped repository data. Platform
RC-1 remains untouched — confirmed by `git diff --stat` at commit time (zero files under
`lib/foundation/`, `lib/relationships/`, `lib/evidence/`, `lib/reasoning/`, `lib/workflow/`,
`lib/orchestration/`, `lib/network/`, or `lib/workspace/` changed) — and the Phase 1 type files
are also untouched; Phase 2 adds five new files to the same `lib/research-domain/` directory.

| File | Mission deliverable | What it does |
|---|---|---|
| `research-domain-builder.ts` | Research Domain Builder | `buildResearchEntityBase` — the one shared assembly function every concrete entity builder in the adapter calls; defaults every unsupplied collection to an honest empty array |
| `research-domain-adapter.ts` | Research Domain Adapter | Pure translation functions from real `lib/research/*` data (and `research-foundation-adapter.ts`'s existing `toSubject`/`toMission`/`toEvidence`/`toRelationships`) onto `ResearchDomainEntity` instances |
| `research-domain-query.ts` | Research Domain Query | `findResearchDomainEntityById`, `findResearchDomainEntitiesByKind`, `...ByOrganization`, `...ByMission`, `...ByEvidence` — pure filters over an already-built collection |
| `research-domain-validation.ts` | Research Domain Validation | `validateResearchDomainEntity`/`validateResearchDomainEntities` — reuses `PlatformValidationResult` (`lib/foundation/validation-types.ts`, EPIC-10) rather than declaring a seventh independent `{valid, issues}` interface |
| `research-domain-providers.ts` | Research Domain Providers | `researchDomainPipelineProviders: IntelligencePipelineProviders` — plugs the Research Domain into `lib/orchestration/`'s pipeline unmodified |

### What real data was mapped, and what honestly stayed empty

| Mission's named source | Real repository origin | Mapped to |
|---|---|---|
| Research Topics | `lib/research/research-topics.ts`'s `RESEARCH_TOPICS` (65 real topics) | `ResearchTopicEntity` — one per topic |
| Research Missions | `research-foundation-adapter.ts`'s `toMission()` (EPIC-02) | `ResearchMissionEntity` — one per topic, parallel to, not embedded in, the topic |
| Evidence | `lib/research/evidence/evidence-topic-builder.ts`'s `buildTopicEvidenceReview` + `research-foundation-adapter.ts`'s `toEvidence()` (EPIC-04) | `ResearchTopicEntity.evidence` |
| Reviews | `lib/research/intelligence/review-workspace-engine.ts`'s `buildResearchReviewWorkspace` | `.openQuestions` → `ResearchQuestionEntity`; `.findings` → `FindingEntity` (always empty today — no persistence layer exists anywhere in this platform; the mapping is real, ready to produce entities the moment one does) |
| Questions | Same Review Workspace, `ReviewOpenQuestion` (a direct alias of Foundation's `Question`) | `ResearchQuestionEntity.question` embeds the real `Question` object directly |
| Knowledge Graph | `lib/research/graph/`'s `getResearchGraphForTopicObject` (the real, live `/research` Global Research Network) | Only `related_topic` edges with status `catalog_available` become `Relationship` records — see below for why the other edge types are excluded |
| Relationships | `research-foundation-adapter.ts`'s `toRelationships()` (EPIC-02/03) | `ResearchTopicEntity.relationships`, combined with the Knowledge Graph edges above |
| Timeline | `lib/research/intelligence/workspace-shell-engine.ts`'s `getWorkspaceTimeline` | `ResearchTopicEntity.timeline` (always empty today — same "honest stub, no persistence" status documented since EPIC-02) |
| Organizations | `lib/research/entities/`'s `RESEARCH_ENTITY_REGISTRY` (1 real `laboratory` entry) | `LaboratoryEntity` |
| Researchers | *(none exist)* | `mapResearchers()` honestly returns `[]` — no real researcher record exists anywhere in this repository |

`toDatasetEntity` additionally maps the registry's 1 real `dataset` entry (not explicitly named
in the mission's list, but present in the same registry as the Organizations source, and a real
mapped `DatasetEntity` matches the mission's own 27-entity roster). `mapHypotheses()` mirrors
`mapResearchers()` — honestly empty, no real hypothesis record exists yet.

**Knowledge Graph mapping detail — why only `related_topic` edges convert.** The graph's
`uses_method`/`requires_evidence` edges describe the exact same `relatedMethods`/
`relatedEvidenceTypes` catalog fields `toRelationships()` already converts — re-converting them
here would duplicate that existing intelligence. `future_supports` edges name aspirational
product roadmap items (`RESEARCH_TOPIC_FUTURE_SUPPORTS`), not real research connections;
converting them into a `Relationship` record would overclaim that a connection exists today. Only
`related_topic` — topic-to-topic connections based on shared methods/evidence/domain, with
`status: "catalog_available"` — is genuinely new information the Knowledge Graph adds beyond what
`toRelationships()` already provides.

**`lib/research/entities/` mapping detail — why only `laboratory` and `dataset` convert.** The
registry's `research_topic` entries (5) are stub duplicates of the same 5 topics already
comprehensively covered by the canonical, 65-topic `research-topics.ts` catalog — re-mapping them
would duplicate, not add, information. `method`, `open_question`, and `negative_result` have no
honest match in the Domain's 27-kind vocabulary (the same exclusions EPIC-08's Global
Intelligence Network adapter already made, for the same reason) and are excluded, not forced.

### Traceability

Every `ResearchDomainEntity` this phase produces is traceable to Mission (via `.missions`),
Evidence (via `.evidence`), Relationship (via `.relationships`), Timeline (via `.timeline`), and
Organization (via `.organizationIds`) exactly as `ResearchEntityBase` (Phase 1) already requires
— Phase 2 populates these fields with real data where it exists and leaves them as honest empty
arrays where it does not, never fabricating a value to make an entity look more connected than it
is.

### Dependency direction (Phase 2)

`research-domain-adapter.ts` and `research-domain-providers.ts` import from `lib/relationships/`
(`buildRelationship`), `lib/orchestration/` (`IntelligencePipelineProviders`, the type only —
Phase 2 does not call `runIntelligencePipeline` itself), `lib/foundation/adapters/
research-foundation-adapter.ts`, and several real `lib/research/*` modules
(`research-topics.ts`, `evidence/evidence-topic-builder.ts`,
`intelligence/review-workspace-engine.ts`, `intelligence/workspace-shell-engine.ts`, `graph/`,
`entities/`) — this is the sanctioned adapter boundary, the same pattern every Platform Core
domain crossing already follows, not a new kind of dependency. `research-domain-builder.ts`,
`research-domain-query.ts`, and `research-domain-validation.ts` remain dependency-light,
importing only `lib/foundation/` types and Phase 1's own `lib/research-domain/` types. Nothing in
the Platform Core, and nothing in `lib/research/*`, imports `lib/research-domain/` back.

## Research Workspace Contract, Phase 3 (`lib/research-workspace/`)

A third, distinct layer on top of both Platform RC-1's Workspace Platform (`lib/workspace/`,
EPIC-09) and the Research Domain (`lib/research-domain/`, Phase 1/2) — a new top-level
directory, mirroring `lib/research-domain/`'s own separation from the Platform Core it sits on.
Neither is modified: confirmed by `git diff --stat` at commit time (zero files under
`lib/foundation/`, `lib/relationships/`, `lib/evidence/`, `lib/reasoning/`, `lib/workflow/`,
`lib/orchestration/`, `lib/network/`, `lib/workspace/`, or `lib/research-domain/` changed).

`research-workspace-contract.ts` defines `ResearchWorkspaceContract`'s nineteen sections. Ten are
new, thin `{ items: readonly XEntity[] }`-shaped compositions over Research Domain entities (no
Platform Core equivalent exists for these); the rest are direct reuse — a section is either the
exact type Platform Core already defines, or it isn't declared at all:

| # | Section | Source | Reuse |
|---|---|---|---|
| 1 | Mission Summary | `WorkspaceView.missionCenter` | Wraps Platform's `MissionCenterSection` unmodified |
| 2 | Mission Progress | `WorkspaceView.monitoring` | Wraps Platform's `MonitoringSection` unmodified |
| 3 | Evidence Summary | `WorkspaceView.evidenceCenter` | **Is** Platform's `EvidenceCenterSection`, no wrapper |
| 4 | Research Timeline | `ResearchDomainEntity.timeline` (mission-linked entities) | New — real research events, distinct from #18 |
| 5 | Research Questions | Research Domain `research_question`-kind entities | New |
| 6 | Open Hypotheses | Research Domain `hypothesis`-kind entities | New |
| 7 | Research Findings | Research Domain `finding`-kind entities | New |
| 8 | Related Publications | Research Domain `publication`-kind entities | New |
| 9 | Related Patents | Research Domain `patent`-kind entities | New |
| 10 | Related Datasets | Research Domain `dataset`-kind entities | New |
| 11 | Related Technologies | Research Domain `technology`-kind entities | New |
| 12 | Related Organizations | Research Domain `laboratory`/`research_center`/`university`-kind entities | New |
| 13 | Research Team | Research Domain `researcher`/`engineer`/`scientist`/`academic`/`student_researcher`-kind entities | New |
| 14 | Potential Collaborators | `findCollaborationCandidates(network)` | Calls EPIC-08's function directly, unmodified |
| 15 | Funding Opportunities | Research Domain `funding_opportunity`/`grant`/`sponsor`-kind entities | New |
| 16 | Open Risks | `IntelligenceResult.reasoning.risks` | **Is** the Reasoning Framework's own `ReasoningRisk[]` (EPIC-05), no wrapper |
| 17 | Recommendations | `WorkspaceView.recommendations` | **Is** Platform's `RecommendationsSection`, no wrapper |
| 18 | Activity Timeline | `WorkspaceView.activity` + `WorkspaceView.timeline` | Composes Platform's `ActivitySection.pipelineTrace` + `TimelineSection.transitions` — process/system audit trail, distinct from #4 |
| 19 | Knowledge Network | `WorkspaceView.knowledgeNetwork` | **Is** Platform's `KnowledgeNetworkSection`, no wrapper |

`research-workspace-builder.ts`'s `buildResearchWorkspaceContract(input)` is the entire
"logic" — assembly, nothing derived. It calls Platform's own `buildWorkspaceView` (EPIC-09) to
get sections 1, 2, 3, 17, 18, 19 for free, then narrows a `ResearchDomainEntity[]` collection
by `entityKind` (via a small generic `ofKind` type-guard helper — pure type narrowing, not new
business logic) to compose sections 4–13 and 15, and calls `findCollaborationCandidates`
directly for section 14. Returns `undefined`, honestly, when the Orchestration Layer cannot
resolve Foundation for the subject — no partial or fabricated contract is ever returned.

`research-workspace-providers.ts`'s `ResearchWorkspaceProviders` interface — `resolveIntelligenceResult`,
`resolveIntelligenceNetwork`, `resolveResearchDomainEntities` — is the injection contract the
Builder consumes, mirroring `lib/orchestration/pipeline-types.ts`'s `IntelligencePipelineProviders`
role but scoped to this Workspace layer. `researchWorkspaceProviders`, the real implementation,
calls three already-real functions unmodified: `runResearchIntelligencePipeline` (EPIC-07),
`buildResearchIntelligenceNetwork` (EPIC-08), and `buildAllResearchDomainEntities` (Phase 2) —
zero new evidence, relationship, reasoning, or catalog logic.

`research-workspace-query.ts` provides deterministic boolean/count readers
(`hasOpenHypotheses`, `hasResearchFindings`, `hasFundingOpportunities`,
`hasPotentialCollaborators`, `hasOpenRisks`, `hasResearchTeam`, `countRelatedArtifacts`) — the
same "component asks, never inspects" discipline `lib/workspace/workspace-query.ts` established.
`research-workspace-validation.ts`'s `validateResearchWorkspaceContract` reuses
`PlatformValidationResult` (EPIC-10) rather than declaring an eighth independent `{valid, issues}`
interface.

### No UI this phase

Per the mission's explicit scope, `lib/research-workspace/` contains zero React, zero
components, zero pages, and zero routes. No component anywhere imports it yet.

### Module map

```
lib/research-workspace/
├── research-workspace-contract.ts      ResearchWorkspaceContract, its 19 sections
├── research-workspace-providers.ts     ResearchWorkspaceProviders, researchWorkspaceProviders
├── research-workspace-builder.ts       buildResearchWorkspaceContract
├── research-workspace-query.ts         hasOpenHypotheses, hasResearchFindings, countRelatedArtifacts, ...
└── research-workspace-validation.ts    validateResearchWorkspaceContract
```

### Dependency direction (Phase 3)

`lib/research-workspace/` imports from `lib/workspace/` (`buildWorkspaceView`), `lib/network/`
(`findCollaborationCandidates`), `lib/research-domain/` (query functions + all entity types),
and `lib/foundation/adapters/` (`runResearchIntelligencePipeline`,
`buildResearchIntelligenceNetwork`, all Platform Core per RC-1) — every import is of an
already-real, unmodified function or type. Nothing in `lib/workspace/`, `lib/network/`,
`lib/research-domain/`, or `lib/foundation/adapters/` imports `lib/research-workspace/` back.

## Research Mission Engine, Phase 4 (`lib/research-mission/`)

A fourth layer, on top of Platform RC-1, the Research Domain (Phase 1/2), and the Research
Workspace Contract (Phase 3) — all three frozen, none modified (confirmed by `git diff --stat`
at commit time). `lib/research-mission/` gives a Research Mission a real project lifecycle: nine
states (`draft → planned → active → paused/blocked/review → completed/cancelled → archived`),
every transition recorded with reason/timestamp/actor/evidenceReference, exactly the discipline
`lib/workflow/` (EPIC-06) established for the Platform's own `Workflow` — applied here to a new,
mission-specific vocabulary, not a copy of Platform Core code (`MISSION_STATE_TRANSITIONS`,
`canTransitionMission`, `validateMissionTransition`, and `applyMissionTransition` mirror
`lib/workflow/workflow-transition.ts`'s shape exactly, but operate on the new
`MissionLifecycleState`, not `WorkflowState`, since a mission's own real-world project lifecycle
is a genuinely different concept from an intelligence process's stages). `MissionTransition`
reuses Platform's own `WorkflowActor` type directly rather than redeclaring it.

`MISSION_LIFECYCLE_STATES` is deliberately distinct from both `WorkflowState` (an intelligence
process's stages) and the Research Domain's own `ResearchEntityLifecycleState` (a generic
4-state entity lifecycle — `proposed | active | completed | archived`, too coarse for a
mission's real project lifecycle with pause/block/review states).

### Every "Support:" concern is a direct reference, never a re-derivation

`ResearchMission` exposes every concern the mission named. All but four fields
(`goal`, `scope`, `milestones`, `deliverables` — genuinely new, since no Platform/Domain/
Workspace concept already covers a dated project checkpoint or a concrete deliverable) are
direct references into Research Domain or Workspace Contract output, composed once by
`buildResearchMission` and never re-derived:

| Support | Field | Source |
|---|---|---|
| Mission Goal | `goal` | New — a plain, caller-supplied string |
| Mission Scope | `scope` | New — a plain, caller-supplied string |
| Research Questions | `researchQuestions` | `WorkspaceContract.researchQuestions.questions` |
| Hypotheses | `hypotheses` | `WorkspaceContract.openHypotheses.hypotheses` |
| Expected Outcomes | `expectedOutcomes` | Research Domain entities filtered to `entityKind === "research_outcome"` — the one field the Workspace Contract doesn't already carry a section for |
| Evidence Collection | `evidence` | `WorkspaceContract.evidenceSummary.evidence` |
| Timeline | `timeline` | `WorkspaceContract.researchTimeline.events` |
| Dependencies | `dependencies` | `WorkspaceContract.knowledgeNetwork.relationships`, filtered to `relationshipType === "depends_on"` — a real existing field on a real existing collection, not a new relationship concept |
| Participants | `participants` | `WorkspaceContract.researchTeam.team` |
| Organizations | `organizations` | `WorkspaceContract.relatedOrganizations.organizations` |
| Risks | `risks` | `WorkspaceContract.openRisks.risks` |
| Milestones | `milestones` | New — `MissionMilestone[]`, categorical status only (`pending \| achieved \| missed`), never a completion percentage |
| Deliverables | `deliverables` | New — `MissionDeliverable[]`, categorical status only (`planned \| in_progress \| delivered \| cancelled`), never a quality score |
| Related Publications | `relatedPublications` | `WorkspaceContract.relatedPublications.publications` |
| Related Patents | `relatedPatents` | `WorkspaceContract.relatedPatents.patents` |
| Related Datasets | `relatedDatasets` | `WorkspaceContract.relatedDatasets.datasets` |

Traceability to Research Domain and Workspace Contract themselves is explicit, not just implicit
in the fields above: `ResearchMission.researchMissionEntity` (the real `ResearchMissionEntity`,
Phase 2, when one exists) and `ResearchMission.workspaceContract` (the real
`ResearchWorkspaceContract`, Phase 3, when one could be resolved) are both carried directly on
every mission.

`research-mission-providers.ts`'s `MissionProviders` — `resolveWorkspaceContract`,
`resolveResearchDomainEntities`, `resolveResearchMissionEntity` — mirrors
`ResearchWorkspaceProviders`'s (Phase 3) and `IntelligencePipelineProviders`'s (EPIC-07)
injection-contract role at this new layer. `researchMissionProviders`, the real implementation,
calls `buildResearchWorkspaceContract` (Phase 3) and `buildAllResearchDomainEntities` (Phase 2)
unmodified.

`research-mission-validation.ts`'s `validateResearchMission` reuses `PlatformValidationResult`
(EPIC-10) and performs the same chain/legality checks
`lib/workflow/workflow-validation.ts`'s `validateWorkflowRecord` (EPIC-06) already performs for
Platform Workflows, applied to a mission's own history.

### Module map

```
lib/research-mission/
├── research-mission-engine.ts       MissionLifecycleState (9), MISSION_STATE_TRANSITIONS, canTransitionMission,
│                                     validateMissionTransition, applyMissionTransition, ResearchMission,
│                                     MissionTransition, MissionMilestone, MissionDeliverable
├── research-mission-providers.ts    MissionProviders, researchMissionProviders
├── research-mission-builder.ts      createResearchMission, buildResearchMission
├── research-mission-query.ts        isMissionTerminal/Blocked/Active, hasOpenMissionRisks, findAchievedMilestones, ...
└── research-mission-validation.ts   validateResearchMission
```

### Dependency direction (Phase 4)

`lib/research-mission/` imports from `lib/foundation/` (`WorkflowActor`, `Evidence`,
`Relationship`, `TimelineEvent`, `ReasoningRisk`, `RelationshipType`, `PlatformValidationResult`
— all Platform Core per RC-1), `lib/research-domain/` (entity types + query functions, Phase
1/2), and `lib/research-workspace/` (`ResearchWorkspaceContract`, `buildResearchWorkspaceContract`,
Phase 3) — every import is of an already-real, unmodified function or type. Nothing in the
Platform Core, `lib/research-domain/`, or `lib/research-workspace/` imports
`lib/research-mission/` back.

### No UI this phase

Per the mission's explicit scope, `lib/research-mission/` contains zero React, zero components,
zero pages, and zero routes. No component anywhere imports it yet.

## Research Intelligence — First Live Vertical Slice

The mission that produced this section reused the label "Phase 4" (its title was "CBAI RESEARCH
INTELLIGENCE PHASE 4 — FIRST LIVE VERTICAL SLICE"), colliding with the Research Mission Engine's
own "Phase 4" above. To avoid ambiguity this section is filed under its subtitle, not a phase
number; the two are unrelated (the Mission Engine adds a new capability, this section activates
existing ones).

Everything built through this point in the Research Intelligence series — Foundation,
Relationships, Evidence, Reasoning, Workflow, Orchestration, Network, Workspace (Platform Core,
EPIC-02–10), plus the Research Domain (Phase 1/2) and Research Workspace Contract (Phase 3) — was
real and structurally verified, but never exercised by an actual UI consumer, and never rendered
in a browser. This work closes that gap for one real subject.

### Chosen test topic: `microbiology`

The richest real topic in the 65-topic catalog: `status: "catalog_available"` (the most complete
of the three real statuses), 3 real `relatedMethods`, 3 real `relatedEvidenceTypes`, and the only
topic cross-referenced by *two* separate `lib/research/entities/` registry records (a real
laboratory and a real dataset). No topic was fabricated; this is the existing catalog entry with
the most real data already connected to it.

### End-to-end data path traced

```
lib/research/research-topics.ts (RESEARCH_TOPICS["microbiology"])
  → research-foundation-adapter.ts (toSubject, toMission, toEvidence, toRelationships)
  → lib/orchestration/ (runIntelligencePipeline via researchIntelligencePipelineProviders)
  → IntelligenceResult { evidence, relationships, reasoning, workflow, pipelineTrace }
  → lib/network/ + research-entity-network-adapter.ts (buildResearchIntelligenceNetwork)
  → lib/workspace/ (buildWorkspaceView)
  → lib/research-workspace/ (buildResearchWorkspaceContract)
  → components/research/topic/ResearchIntelligenceOverview.tsx (new server component)
  → app/(dashboard)/research/[topicId]/page.tsx (existing route, one new render call)
```

Traced by static inspection (Phase 1 of this mission), then confirmed by the 10 automated tests
and a real `npm run build` static-generation pass across all 65 topics (below).

### Disconnected handoffs found, and what was done about each

| # | Finding | Disposition |
|---|---|---|
| 1 | `ResearchWorkspaceContract` had no field carrying a real, actionable "recommended next step" — `RecommendationsSection` (Reasoning's possible options) and `MonitoringSection` (the new Workflow's state) are both real, but neither is the same thing as the existing, already-working single-next-action signal `lib/research/workflow/workflow-engine.ts`'s `deriveResearchWorkflow` has produced since BUILD-004x. Without a fix, the new UI would have had to call that engine directly, violating "React must not call separate lower-level engines independently." | **Fixed** — added `RecommendedNextStep` + `MissionProgressSection.recommendedNextStep?` to `lib/research-workspace/research-workspace-contract.ts`; added `resolveRecommendedNextStep` to `ResearchWorkspaceProviders`, implemented by calling `deriveResearchWorkflow` unmodified. |
| 2 | `ResearchWorkspaceContract` never surfaced Platform's `IntelligenceBriefSection` (observed facts, known unknowns, reasoning path — EPIC-09) at all — an oversight from Phase 3. "Known evidence gaps" and "a reasoning summary" (both explicitly required content for the new UI section) had no field to read from. | **Fixed** — added `MissionSummarySection.intelligenceBrief?: IntelligenceBriefSection`, reusing Platform's own type unmodified; wired from `workspaceView.intelligenceBrief` in the Builder. |
| 3 | `buildResearchWorkspaceContract`'s `researchTimeline.events` double-counted a topic entity's own timeline (once directly, once again via a mission-linked-entities flat-map that includes the topic entity itself, since it links to its own mission). | **Fixed** — the flat-map now excludes the topic entity by id. Currently latent (topic timelines are always empty — no persistence layer exists), but a real duplication, worth fixing while already editing this function. |
| 4 | `IntelligenceNetwork` (EPIC-08, `lib/network/`) node ids come from `lib/research/entities/`'s raw registry ids (e.g. `re-entity-research-topic-microbiology`); `IntelligenceResult`/`ResearchDomainEntity` ids come from the real topicId or Phase 2's own `research-topic:${topicId}` convention. These are two disconnected id spaces within the same `KnowledgeNetworkSection` — a UI naively cross-referencing `network.nodes` by topicId would find nothing. | **Not fixed** — reconciling two independent id schemes is an architectural decision beyond "fix only what is required for one vertical slice." The new UI section avoids the mismatch by sourcing "related entities" from the Contract's own correctly-scoped `relatedOrganizations`/`relatedDatasets` sections instead of trying to filter `knowledgeNetwork.network` by subject id. Documented here and in `docs/current-progress.md` as known debt. |
| 5 | In Next.js dev mode only, requesting an unknown `/research/[topicId]` path throws a 500 ("Page is missing param... required with output: export config") instead of a clean 404 — confirmed present on the clean `main` tree before any change in this mission (tested via `git stash`), so it predates this work. | **Not fixed** — a Next.js dev-server limitation specific to `output: "export"` + dynamic routes; does not affect the real static export (only 65 real paths are ever generated; any other path 404s at the hosting layer, never reaching React). Verified `buildResearchWorkspaceContract` itself returns `undefined` safely for an unknown id (test #2) — the application code path is correct. |

### New server component: `components/research/topic/ResearchIntelligenceOverview.tsx`

Server component (no `"use client"`, no hooks, no client state). Calls
`buildResearchWorkspaceContract({ subjectId: topicId })` exactly once and renders only from its
already-computed output — the component itself contains no evidence, relationship, reasoning, or
workflow logic. Rendered from `app/(dashboard)/research/[topicId]/page.tsx` as a sibling after
the existing `ResearchTopicDetail` (untouched) — zero changes to the existing client component
tree, zero risk to `?evidence=` selection or the Review Workspace anchor it already links to.

Shows, from real Contract output only: workflow state, evidence count, open-question count,
pipeline stage count, per-evidence verification status, known evidence gaps, a reasoning summary
(or an honest "nothing verified yet" sentence), the recommended next step (a real link when one
exists, non-interactive text otherwise, or an honest "no further action" sentence), related
organizations/datasets, and recent real timeline activity — with one consolidated honest-empty
sentence for whichever of Hypotheses/Findings/Publications/Patents/Technologies/Team/Funding/
Collaborators/Risks have no real data yet, rather than nine separate empty-state blocks. Does
not duplicate `ResearchCockpit` (current legacy stage, blocking factors, latest legacy workspace
activity) — it surfaces what the Platform Core layer specifically adds instead.

### Real action path

The "Recommended next step" link is real for `microbiology`: `deriveResearchWorkflow` resolves
to `open_evidence_review`, which `lib/research/workflow/workflow-derivation.ts`'s
`deriveActionLink` maps to `/research/microbiology#topic-review-workspace-heading` — the existing
Review Workspace section's real heading anchor, confirmed present in
`components/research/topic/TopicReviewWorkspace.tsx`. No dead button, no fabricated action verb.

### Functional test harness: `npm run test:research-slice`

Zero new dependencies — no Jest, Vitest, ts-node, or tsx. Uses Node's own built-in test runner
(`node:test`) and native TypeScript execution (stable since Node 23+), plus one ~15-line loader
(`scripts/register-alias-loader.mjs`) that resolves this repo's `@/...` path alias, which Node's
native TS execution does not know about on its own. All 10 required checks pass:

1. Valid topic ID produces a workspace contract.
2. Unknown topic ID fails safely (returns `undefined`, never throws).
3. No fabricated fields appear (no evidence ever claims `"verified"`; Researchers/Hypotheses stay empty).
4. Empty data remains empty (Findings, Research Timeline).
5. Pipeline evidence is traceable to source data (every `evidenceId` real, `relatedSubjectIds` includes the topic).
6. Relationship output is traceable (every `sourceId` matches the topic, every `explanation` real).
7. Reasoning cannot assert a final decision (`humanDecisionRequired === true`, asserted at runtime, not just by type).
8. Workflow state is valid (`currentState` is one of the declared `WORKFLOW_STATES`).
9. Workspace output reuses pipeline and network results (contract evidence/relationship ids exactly match the pipeline's own output — never re-derived).
10. The topic's data layer does not throw (real JSX rendering verified separately by `npm run build`'s successful static generation of `/research/microbiology`, alongside all other 64 real topics).

### Performance and recomputation

Within one page render, `buildResearchWorkspaceContract` is called exactly once (a single call
site inside `ResearchIntelligenceOverview`), and its result is read from a single local variable
— no repeated pipeline execution within a render, satisfying this mission's requirement. No
caching was introduced (no clear invalidation model would exist for one). The pre-existing,
already-documented debt remains unchanged: `researchWorkspaceProviders`'s four resolvers each
independently rebuild the full 65-topic Research Domain entity collection and the full global
Network on every call, so — because `output: "export"` pre-generates every topic page at build
time — this recomputation now runs up to 65× per `npm run build`, once per statically generated
page. Acceptable at today's catalog scale (10 registry entities, 65 topics; the build completed
in ~2–3 seconds including this). A future optimization (memoizing the two subject-independent
resolvers, `resolveResearchDomainEntities`/`resolveIntelligenceNetwork`, at the module level)
would remove the duplicate work cheaply — not attempted here to keep this change a pure
activation exercise, not a platform refactor.

## Research Intelligence — Workspace Activation (Research Mission wired in)

A follow-up mission ("CBAI RESEARCH INTELLIGENCE PHASE 5 — ACTIVATE EXISTING RESEARCH WORKSPACE")
closed the one gap the First Live Vertical Slice above left open: `lib/research-mission/` (Phase
4) was built, structurally verified, and never connected to the live UI. This section wires it
in — no new engine, domain, or contract, per that mission's explicit "Do NOT create" list.

### `ResearchIntelligenceOverview.tsx` now consumes `buildResearchMission`, not `buildResearchWorkspaceContract`, directly

The component's single call site changed from `buildResearchWorkspaceContract({ subjectId })` to
`buildResearchMission({ missionId: topicId })`. `ResearchMission` (Phase 4) already embeds a
`workspaceContract?: ResearchWorkspaceContract` field — the exact same Contract, computed once,
internally, by `buildResearchMission`'s own call into `researchMissionProviders`. The component
reads `mission.workspaceContract` for everything it already showed, plus one new stat: **Mission
lifecycle** (`mission.currentState`, via `MISSION_LIFECYCLE_STATE_LABELS`) — the Research Mission
Engine's own 9-state project lifecycle (draft/planned/active/.../archived/cancelled), honestly
`"draft"` for every real topic today (no mission has ever transitioned; `mission.history` is
always empty, the same "no fabricated provenance" rule `Workflow` (EPIC-06) already established).
This satisfies "the UI must consume ONE Workspace object" more completely than before: one call,
one object, which itself carries the full Research Domain → Research Mission → Workspace
Contract → Pipeline → Evidence/Reasoning/Workflow/Network chain the mission specified.

### One minimal correction to `lib/research-mission/research-mission-builder.ts`

`BuildResearchMissionInput.goal`/`.scope` were required fields — a UI caller would otherwise have
had to derive them itself (reaching into Research Domain data directly, which either duplicates
work `buildResearchMission` already does internally via its own providers, or means calling a
"lower-level" resolver from React). Made optional, defaulting to real data the function already
resolves via its own providers: `goal` defaults to the real `ResearchMissionEntity.statement`
(Phase 2); `scope` defaults to the real `ResearchTopicEntity.description` (Phase 2, looked up via
`findResearchDomainEntityById`, an existing Phase 2 query function — no new lookup logic). Never a
placeholder string — an honest empty string when neither real source resolves (e.g. an unknown
topic id). This is the same "minimal, documented correction to enable activation" pattern used
for the Workspace Contract fixes in the prior mission, applied here to `lib/research-mission/`.

### Verification

`npm run test:research-slice` gained one new test (11 of 11 passing): confirms `buildResearchMission`
and `buildResearchWorkspaceContract` produce the same evidence set for the same topic (never
re-derived), that `goal`/`scope` are real non-empty strings, and that `currentState` is one of
the declared `MISSION_LIFECYCLE_STATES`. `npm run build` regenerates all 89 routes, including all
65 real topic pages, now exercising the Mission layer on every one. A dev-server + curl pass
confirmed the new "Mission lifecycle: Draft" stat renders, and every previously-verified route
(`/research/antibiotic-resistance`, `/research?evidence=...`, `/research`) still returns 200 with
no new server-side errors.

## Research Intelligence module map (current)

```
lib/research/
├── research-topics.ts              canonical ResearchTopic catalog (single source of truth)
├── evidence/                       ResearchEvidence domain model, builder, engine, query
├── evidence/evidence-topic-builder.ts   topic → catalog evidence items (TopicEvidenceReview)
├── intelligence/
│   ├── intelligence-engine.ts      Gap Engine — deriveEvidenceGapIntelligence
│   ├── decision-engine.ts          Decision Engine — deriveResearchDecision
│   ├── review-workspace-engine.ts  buildResearchReviewWorkspace (notes/findings/questions/progress)
│   └── workspace-shell-engine.ts   getWorkspaceMemory / getWorkspaceTimeline (honest stubs)
├── readiness/                      Readiness Engine — deriveResearchReadiness (milestones)
├── health/                         Health Engine — deriveResearchHealth (Healthy/Stable/Weak/Critical)
├── workflow/                       Workflow Engine — deriveResearchWorkflow (stage, next action, links)
└── review/                         Standalone ResearchReview domain (not yet topic-connected)

lib/foundation/                     universal Foundation (EPIC-02)
├── relationship-types.ts           universal relationship vocabulary (EPIC-03)
├── evidence-types.ts               universal evidence vocabulary (EPIC-04)
├── confidence.ts                   shared Confidence type + deriveConfidenceFromSourceCount (EPIC-04)
├── reasoning-types.ts              universal reasoning shapes — ReasoningInput/ReasoningResult (EPIC-05)
├── workflow-types.ts                universal workflow shapes — Workflow/WorkflowState/WorkflowTransition (EPIC-06)
├── orchestration-types.ts           universal pipeline output — IntelligenceResult/pipelineTrace (EPIC-07)
├── network-types.ts                 universal network shapes — IntelligenceNetwork/CollaborationCandidate (EPIC-08)
├── workspace-types.ts                universal workspace shapes — WorkspaceView, nine sections (EPIC-09)
├── validation-types.ts               PlatformValidationResult — shared validator-result shape (EPIC-10)
├── adapters/research-foundation-adapter.ts
├── adapters/research-entity-network-adapter.ts
└── adapters/research-workspace-adapter.ts

lib/relationships/                  Universal Relationship Engine (EPIC-03)
├── relationship-builder.ts         buildRelationship, deriveRelationshipConfidence
└── relationship-query.ts           findRelationshipsForSubject, resolveConnectedSubjectIds, ...

lib/evidence/                       Universal Evidence Operating System (EPIC-04)
├── evidence-builder.ts             buildEvidence
├── evidence-validation.ts          validateEvidenceRecord
├── evidence-linking.ts             linkSupportingEvidence, linkConflictingEvidence
├── evidence-history.ts             appendEvidenceHistory
└── evidence-query.ts               findEvidenceForSubject, groupEvidenceBy*, compareEvidence, traceEvidence

lib/reasoning/                      Intelligence Reasoning Framework (EPIC-05)
├── reasoning-engine.ts             buildReasoningResult (consumes lib/evidence/, lib/relationships/)
└── reasoning-validation.ts         validateReasoningInput

lib/workflow/                       Universal Intelligence Workflow Framework (EPIC-06)
├── workflow-builder.ts             createWorkflow
├── workflow-transition.ts          WORKFLOW_TRANSITIONS, applyWorkflowTransition, validateWorkflowTransition
├── workflow-validation.ts          validateWorkflowRecord
└── workflow-query.ts               isWorkflowStateTerminal, findWorkflowTransitionsByActor, ...

lib/orchestration/                  Intelligence Orchestration Layer (EPIC-07)
├── pipeline-types.ts               IntelligencePipelineProviders (the plugin contract)
├── pipeline-engine.ts              runIntelligencePipeline (zero domain logic)
└── pipeline-validation.ts          validateIntelligencePipelineProviders

lib/network/                        Global Intelligence Network (EPIC-08)
├── network-builder.ts              buildIntelligenceNetwork
├── network-validation.ts           validateIntelligenceNetwork
├── network-query.ts                findNodesByEntityKind, findEdgesForNode, ... (delegates to lib/relationships/)
└── network-collaboration.ts        findCollaborationCandidates (shared-evidence / shared-target only, never popularity)

lib/workspace/                      Intelligence Workspace Platform (EPIC-09)
├── workspace-builder.ts            buildWorkspaceView (assembly only, zero new logic)
├── workspace-validation.ts         validateWorkspaceView
└── workspace-query.ts              hasConflictingEvidence, hasOpenQuestions, isWorkspaceMonitoring, ...

components/research/topic/
├── ResearchTopicDetail.tsx         page orchestrator ("/research/[topicId]")
├── ResearchCockpit.tsx             operational summary (workflow + health, replaces old Mission Control Panel)
├── TopicReviewWorkspace.tsx        full narrative flow (mission, evidence, notes, findings, questions, milestones)
├── WorkspaceContextBar.tsx         sticky "where am I" strip
└── ...
```

## Dependency direction

Every arrow above points one way. `lib/foundation/` has zero dependency on `components/`.
`lib/research/*` engines have zero dependency on `lib/foundation/` (the Foundation depends on
Research, not the reverse — Research predates the Foundation and remains independently
correct). `lib/relationships/` and `lib/evidence/` depend only on `lib/foundation/`.
`lib/reasoning/` depends on `lib/foundation/` plus its sibling engines (`lib/evidence/`,
`lib/relationships/`) — it is one layer above them, never the reverse: neither engine imports
from `lib/reasoning/`. `lib/workflow/` depends only on `lib/foundation/` — it does not import
`lib/reasoning/`, `lib/evidence/`, or `lib/relationships/` directly; a `Workflow` merely *carries*
their output as data (via `Workflow.evidence` / `.relationships` / `.reasoning`), so the Workflow
engine itself stays a thin, dependency-light state machine. `lib/orchestration/` sits above every
engine — it depends on `lib/foundation/`, `lib/reasoning/`, and `lib/workflow/` (to call the real
default engines), but no engine or Foundation module ever imports `lib/orchestration/` back, and
`lib/orchestration/` never imports a domain module (`lib/research/*`) directly — domain data only
enters through the caller-supplied `IntelligencePipelineProviders`. `lib/network/` depends only
on `lib/foundation/` plus `lib/relationships/` (for traversal reuse) — it never imports a domain
module either; `lib/research/entities/` data only enters the network through
`research-entity-network-adapter.ts`, the same adapter-boundary discipline as every other
domain↔Foundation crossing. `lib/workspace/` consumes `lib/orchestration/`'s *output type*
(`IntelligenceResult`, declared in `lib/foundation/orchestration-types.ts`) but does not import
the `lib/orchestration/` engine module itself — a caller runs the pipeline and hands the result
to `buildWorkspaceView`. `lib/workspace/` does directly import `lib/network/` (for
`findCollaborationCandidates`) and `lib/workflow/` (for its two query re-exports). It never
imports a domain module, and none of `lib/orchestration/`, `lib/network/`, or `lib/workflow/`
ever imports `lib/workspace/` back — confirmed by a full import-graph audit during EPIC-10
(RC-1): the Platform Core is a directed acyclic graph with zero cycles. Only the
research adapters and the type aliases in `review-workspace-model.ts`,
`lib/research/evidence/evidence-types.ts`, and `lib/evidence-infrastructure/types.ts` cross the
Research↔Foundation boundary, and all are additive, non-breaking changes.
