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

## v2.5 — Universal Intelligence Workflow Framework (EPIC-06)

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

## v2.6 — Intelligence Orchestration Layer (EPIC-07)

`lib/foundation/orchestration-types.ts` + `lib/orchestration/` — this release adds no new
capability. It connects the five that already exist (Foundation, Evidence, Relationship,
Reasoning, Workflow) into one reusable pipeline: `Question → Foundation → Evidence Discovery →
Relationship Resolution → Reasoning → Workflow → Intelligence Result`. `runIntelligencePipeline`
contains zero domain logic — Foundation resolution, Evidence Discovery, and Relationship
Resolution are always supplied by the caller through an `IntelligencePipelineProviders` plugin
contract; Reasoning and Workflow are consumed directly from the real EPIC-05/EPIC-06 engines,
with optional overrides for full stage replaceability. Every provider and the orchestrator
itself is a plain pure function, independently testable without any pipeline scaffolding.

`IntelligenceResult` preserves Evidence, Relationship, Reasoning, and Workflow traceability by
carrying the real records each stage produced plus a `pipelineTrace` (one honest
`ran`/`outputCount` entry per stage). It is deliberately not nested inside
`IntelligenceFoundationView` — nesting would duplicate the same evidence/relationships/reasoning/
workflow data twice in one object. `IntelligenceExtensionPoints` reserves six named, always-empty
slots for future Epics (Executive Briefing, Voice Intelligence, Knowledge Collaboration, Mission
Monitoring, Analytics, Future AI agents) so those Epics compose a real value into an existing
field rather than requiring another shape change.

Wired into `research-foundation-adapter.ts`: `researchIntelligencePipelineProviders` and
`runResearchIntelligencePipeline(topicId)` are thin wrappers around the adapters EPIC-02/03/04
already defined — no evidence or relationship logic is duplicated — verified structurally by a
successful `npm run build`. Unlike `toReasoningResult`/`toWorkflow`, this entry point is not
called from the static-generation path (that would recompute the same composition a second time
per page), so it is type-checked but not functionally exercised for all 65 topics during the
build — see `docs/current-progress.md`.

This release also produced its own audit finding: the closest analog yet to this Epic's own
mission already exists, dormant, in `lib/intelligence/orchestrator/` — a full nine-stage
pipeline orchestrator (`request → evidence-collection → contradiction-detection →
confidence-assessment → trust-assessment → graph-context → memory-context → reasoning-trace →
intelligence-result`) with its own, differently-scoped `IntelligenceResult` type, built on the
same numeric `ConfidenceAssessment`/`TrustAssessment` scoring model found incompatible in
EPIC-04/EPIC-05. Not integrated, for the same reason as every prior finding.

## v2.7 — Global Intelligence Network (EPIC-08)

`lib/foundation/network-types.ts` + `lib/network/` — not a social network: no followers, no
messaging, no popularity signal anywhere in this layer. `INTELLIGENCE_ENTITY_KINDS` names the
sixteen real Intelligence Entity kinds the mission specified (Researcher, Engineer, Laboratory,
University, Research Center, Company, Investor, Government Agency, Policy Program, Grant,
Mission, Evidence, Patent, Dataset, Publication, Technology) as a closed vocabulary. A node
(`IntelligenceNetworkNode`) wraps the Foundation's own `Subject` with a real entity kind — it
does not retype `Subject.subjectKind` itself, since that field is a plain string relied on by
every existing Subject producer. An edge is the Foundation's own `Relationship` type, entirely
unmodified — every connection is evidence-aware and traceable by construction, with no new edge
primitive introduced.

`lib/network/network-collaboration.ts` is the one genuinely new derivation: collaboration
candidates are found only from real shared references — two nodes named on the same Evidence
record (`shared_evidence`), or two nodes with a real edge to the same third entity
(`shared_relationship_target`, or `shared_mission` when that entity is mission-kind). Every
`CollaborationCandidate` carries `sharedReferenceIds` pointing at the real id it's grounded in;
nothing is scored, ranked, or inferred from a connection count. `network-validation.ts` enforces
the mission's two hard rules at the data level — every node has a real identity, and every edge
declares real evidence or real, honest limitations, never silence.

`NetworkExtensionPoints` reserves ten always-empty, `unknown`-typed slots for the future
capabilities the mission named — Research Collaboration, Funding Discovery, Innovation
Partnerships, University Networks, Government Programs, Industrial R&D, International
Collaboration, Mission Matching, Knowledge Exchange, Evidence Sharing — the same "declare the
slot, populate nothing" pattern EPIC-07 established for `IntelligenceExtensionPoints`.

A new `research-entity-network-adapter.ts` maps the pre-existing `lib/research/entities/`
catalog onto the network, resolving technical debt flagged since EPIC-02/03 ("not yet connected
to the Foundation's Relationship pillar"). Only entity types with an honest, direct match are
mapped (`researcher`, `laboratory`, `university`, `technology`, `publication`, `dataset`,
`patent` 1:1; `research_topic` → `"mission"`, the same relationship `toMission()` already
expresses elsewhere); six entity types with no honest match (`organism`, `disease`, `method`,
`experiment`, `open_question`, `negative_result`) are excluded, not forced. Edges come only from
the registry's own real cross-references. Verified structurally by a successful `npm run build`;
not called from any static-generation path, so — like EPIC-07's
`runResearchIntelligencePipeline` — it is type-checked but not functionally exercised for real
data during the build.

## v2.8 — Intelligence Workspace Platform (EPIC-09)

`lib/foundation/workspace-types.ts` + `lib/workspace/` — not a dashboard, not a page, not
isolated UI. One reusable `WorkspaceView` shape with the nine sections the mission required
(Mission Center, Intelligence Brief, Evidence Center, Knowledge Network, Recommendations,
Monitoring, Timeline, Open Questions, Activity), built entirely from data the Orchestration
Layer (EPIC-07) and the Global Intelligence Network (EPIC-08) already produced.
`buildWorkspaceView(result, network?)` contains no new intelligence logic — every section is a
direct pass-through or a trivial default: Mission Center from `IntelligenceResult.subject`/
`.mission`/`.question`; Intelligence Brief and Recommendations from `ReasoningResult`; Evidence
Center from `IntelligenceResult.evidence` plus the Reasoning Framework's own supporting/
conflicting split; Knowledge Network from `IntelligenceResult.relationships` plus
`findCollaborationCandidates` (EPIC-08, not re-implemented); Monitoring and Timeline from
`Workflow.currentState`/`.history` (EPIC-06); Open Questions from `ReasoningResult.openQuestions`;
Activity from `IntelligenceResult.pipelineTrace` (EPIC-07's own stage trace, reused as the
honest activity record).

`extensions` on `WorkspaceView` is `IntelligenceResult.extensions` itself — Voice, Executive
Briefing, Collaboration, Analytics, and Mission Monitoring support (the "Support future" list
this Epic named) were already reserved by EPIC-07; no parallel extension vocabulary was
declared. `workspace-query.ts` provides deterministic boolean readers
(`hasConflictingEvidence`, `hasOpenQuestions`, `hasCollaborationCandidates`,
`isWorkspaceMonitoring`, `isWorkspaceTerminal`) so a future component asks these questions
instead of inspecting the view's internals itself — the mechanism, established now, that keeps
intelligence logic out of components once a workspace UI is built. This release ships **zero
React, zero components, zero routes** — the mission's explicit scope.

`research-workspace-adapter.ts`'s `buildResearchWorkspaceView(topicId)` proves the platform
against real data by composing two already-real pipelines
(`runResearchIntelligencePipeline`, `buildResearchIntelligenceNetwork`) with no new logic,
verified structurally by a successful `npm run build`; like both of its dependencies, it is
type-checked but not functionally exercised for real data during the build.

Also documented: the pre-existing `lib/workspaces/` (plural) — persona-based evidence-coverage
explorers behind `/investor`, `/citizen`, `/government` — is a different, real, active system
built on the Indicator Framework, unrelated in shape and purpose to the new singular
`lib/workspace/`, and untouched.

## v3.0 — CBAI Platform RC-1 (EPIC-10)

No new capability, no new domain, no new ecosystem — this release is an audit and a freeze. A
full Phase 1–4 platform audit of the Platform Core (`lib/foundation/` through `lib/workspace/`
plus `lib/foundation/adapters/`, 41 files, 2,761 lines) found and fixed one real duplicate: six
independently-declared, byte-for-byte-identical `{ valid, issues }` validator-result interfaces,
consolidated into `lib/foundation/validation-types.ts`'s `PlatformValidationResult` with all six
original names kept as zero-behavior-change aliases — the same promotion discipline used for
`Confidence`, `EvidenceSourceType`, and `VerificationStatus` in EPIC-04.

A full import-graph extraction confirmed zero circular dependencies — the Platform Core is a
strict DAG exactly as every prior Epic's architecture notes claimed, verified directly rather
than by inspection alone. One documentation imprecision was corrected. Two further findings were
deliberately **not** acted on, to keep this freeze itself low-risk: a `createWorkflow` vs.
`build*` naming inconsistency (fixing it would mean rewriting four historical Epic doc records,
a blast radius judged not worth a cosmetic gain), and six validator functions with zero callers
(published capability awaiting a real caller, not orphaned code).

A full Constitution audit against nine principles (Evidence First, Human Decision, No fabricated
data, No fabricated confidence, No fake metrics, Explainable Intelligence, Traceable
Intelligence, Universal Platform, Ecosystem Neutral) found **zero violations** inside the
Platform Core. Pre-existing, already-documented violations outside the Platform Core
(`/companies`/`/universities` fabricated scores; six dormant `lib/intelligence/` subsystems;
three unmigrated graph systems) remain unchanged and out of this Epic's scope.

The full audit trail, health analysis, and Core Freeze declaration live in
`docs/CBAI-Platform-RC1.md`. `docs/standards/01-cbai-constitution.md` was amended with a
ratified "Platform Core Principles" section codifying the nine principles above as the governing
rules for `lib/foundation/` onward. The Platform Core is now frozen: future Epics extend it
through the four Extension Points named in `docs/CBAI-Platform-RC1.md` (the
`IntelligencePipelineProviders` plugin contract, the two `ExtensionPoints` interfaces, the
per-domain adapter pattern, and closed-but-extensible vocabularies) rather than modifying it,
except to fix a genuine defect.

## v3.1 — Research Intelligence Domain Foundation, Phase 1

The first build after the RC-1 freeze, and the first to exercise the Extension Points
`docs/CBAI-Platform-RC1.md` declared: a new `lib/research-domain/` module, built entirely as an
extension with zero Platform Core files modified (confirmed by `git diff --stat` at commit
time).

Types only — no builder functions, no validators, no seed data, mirroring how EPIC-02's own
Foundation was types-only before later Epics added engines. Twenty-seven Research entities
(Research Mission, Research Program, Research Project, Research Topic, Research Question,
Hypothesis, Methodology, Experiment, Dataset, Publication, Patent, Technology, Researcher,
Engineer, Scientist, Academic, Student Researcher, Laboratory, Research Center, University,
Funding Opportunity, Grant, Sponsor, Peer Review, Finding, Research Outcome, Research Impact),
each extending a shared `ResearchEntityBase` that carries the eight required concerns — every one
a direct reuse of a Platform Core pillar (`Relationship`, `Evidence`, `Mission`, `TimelineEvent`,
`Question`), never a redeclaration. A new, small, closed lifecycle vocabulary
(`proposed | active | completed | archived`) was added deliberately distinct from `WorkflowState`
— an entity's own existence lifecycle is a different concept from an intelligence process's
stages, and forcing the latter onto the former would have been a dishonest fit.

`RESEARCH_RELATIONSHIP_PATTERNS` documents 30 realistic Research entity-pair connections using
15 of the Platform's existing 16 `RelationshipType` values — no new relationship vocabulary was
needed. Every concrete entity interface carries an `Entity` suffix specifically to avoid
colliding with three pre-existing, differently-shaped types of the same short name already in
this repo (`ResearchTopic`, `University`, `ResearchEntity`) — none of which this module touches,
imports, or replaces.

## v3.2 — Research Intelligence Domain Integration, Phase 2

Wires Phase 1's types to real, already-shipped repository data. Five new files, all in the same
`lib/research-domain/` directory Phase 1 created: a Builder (`buildResearchEntityBase`), an
Adapter (real-data mapping functions), a Query module, a Validation module (reusing EPIC-10's
`PlatformValidationResult` rather than declaring a seventh independent result type), and a
Providers module (`researchDomainPipelineProviders`, implementing EPIC-07's
`IntelligencePipelineProviders` contract unmodified).

All ten data sources the mission named were mapped, honestly: 65 real topics become
`ResearchTopicEntity` + `ResearchMissionEntity` pairs, carrying real Evidence (via the existing
`buildTopicEvidenceReview`/`toEvidence`), real Relationships (via the existing `toRelationships`,
plus newly-added Knowledge Graph `related_topic` edges), and real open Questions. The registry's
one real `laboratory` and one real `dataset` entry become `LaboratoryEntity`/`DatasetEntity`.
Reviews/Timeline map through real functions that are honestly always-empty today (no persistence
layer exists anywhere in this platform) — the mapping is correct and will start producing real
entities the moment one does, with no code change needed. Researchers and Hypotheses map to `[]`
— zero real records of either kind exist anywhere in this repository, and none were fabricated to
fill the roster.

Two deliberate exclusions, both documented rather than silently applied: the Knowledge Graph's
`uses_method`/`requires_evidence` edges are not re-converted (they'd duplicate what
`toRelationships()` already produces from the same catalog fields), and `future_supports` edges
are not converted at all (they name aspirational roadmap items, not real connections). The
entities registry's `research_topic` stub entries are not re-mapped (duplicate of the canonical
65-topic catalog); `method`, `open_question`, and `negative_result` have no honest match in the
Domain's 27-kind vocabulary and are excluded, the same discipline EPIC-08 already established for
the Global Intelligence Network adapter.

Every produced entity is traceable to Mission, Evidence, Relationship, Timeline, and Organization
exactly as Phase 1's `ResearchEntityBase` requires — populated with real data where it exists,
left as honest empty arrays where it does not. Zero Platform RC-1 files touched, zero Phase 1
files modified, zero legacy `lib/research/*` files modified — confirmed by `git diff --stat` at
commit time. No UI, no React, no components, no dashboard, per the mission's explicit scope.

## v3.3 — Research Workspace Contract, Phase 3

A third, distinct layer — `lib/research-workspace/`, new, sitting on top of both Platform RC-1's
Workspace Platform (`lib/workspace/`, EPIC-09) and the Research Domain (`lib/research-domain/`,
Phase 1/2) without modifying either. `ResearchWorkspaceContract` defines the nineteen sections
the mission named. Eight are direct reuse — Mission Summary and Mission Progress wrap Platform's
`MissionCenterSection`/`MonitoringSection`; Evidence Summary, Recommendations, and Knowledge
Network *are* Platform's own `EvidenceCenterSection`/`RecommendationsSection`/
`KnowledgeNetworkSection` with no wrapper at all; Open Risks *is* the Reasoning Framework's own
`ReasoningRisk[]` (EPIC-05); Potential Collaborators calls `findCollaborationCandidates` (EPIC-08)
directly; Activity Timeline composes Platform's `ActivitySection`/`TimelineSection` fields. The
remaining eleven (Research Timeline, Research Questions, Open Hypotheses, Research Findings,
Related Publications/Patents/Datasets/Technologies/Organizations, Research Team, Funding
Opportunities) are new, thin `{ items: ... }` compositions over Research Domain entities — no
Platform Core equivalent exists for these, since they need the Research Domain's richer,
kind-specific entity types.

`buildResearchWorkspaceContract` is the entire "logic": call Platform's `buildWorkspaceView` for
the reused sections, narrow a `ResearchDomainEntity[]` collection by `entityKind` (a small
generic type-guard helper, pure narrowing, not new business logic) for the new ones. Returns
`undefined` honestly when Foundation cannot resolve for the subject — never a partial or
fabricated contract. `ResearchWorkspaceProviders` mirrors `IntelligencePipelineProviders`'s
injection-contract role, scoped to this Workspace layer; its real implementation calls three
already-real functions unmodified (`runResearchIntelligencePipeline`, EPIC-07;
`buildResearchIntelligenceNetwork`, EPIC-08; `buildAllResearchDomainEntities`, Phase 2).

Zero Platform Core files touched, zero Research Domain files modified, zero legacy
`lib/research/*` files modified — confirmed by `git diff --stat` at commit time. No UI, no React,
no components, no pages, per the mission's explicit scope.

## v3.4 — Research Mission Engine, Phase 4

A fourth layer — `lib/research-mission/`, new, on top of Platform RC-1, the Research Domain
(Phase 1/2), and the Workspace Contract (Phase 3), all three frozen and unmodified. Gives a
Research Mission a real nine-state project lifecycle (`draft → planned → active →
paused/blocked/review → completed/cancelled → archived`), every transition recorded with
reason/timestamp/actor/evidenceReference — the exact discipline `lib/workflow/` (EPIC-06)
established for Platform Workflows, applied here to a new, mission-specific vocabulary
(`MissionLifecycleState`) rather than reusing `WorkflowState` (a different concept — an
intelligence process's stages, not a mission's own real-world project lifecycle) or the Research
Domain's generic 4-state `ResearchEntityLifecycleState` (too coarse for pause/block/review).
`MissionTransition` reuses Platform's own `WorkflowActor` type directly.

`ResearchMission` exposes every "Support:" concern the mission named. Eleven of sixteen are
direct references into Workspace Contract or Research Domain output composed once by
`buildResearchMission` and never re-derived (Research Questions, Hypotheses, Evidence, Timeline,
Participants, Organizations, Risks, Related Publications/Patents/Datasets, plus Dependencies —
filtered from the mission's own real Relationships by `relationshipType === "depends_on"`, not a
new relationship concept). Expected Outcomes is the one field the Workspace Contract doesn't
already carry a section for, filtered fresh from Research Domain entities by
`entityKind === "research_outcome"`. Only Goal, Scope, Milestones, and Deliverables are
genuinely new — Milestones and Deliverables use categorical status only
(`pending | achieved | missed`; `planned | in_progress | delivered | cancelled`), never a
completion percentage or quality score, honoring "Never create fake progress. Never fabricate
completion." literally.

`MissionProviders` mirrors `ResearchWorkspaceProviders`'s (Phase 3) and
`IntelligencePipelineProviders`'s (EPIC-07) injection-contract role; its real implementation
calls `buildResearchWorkspaceContract` (Phase 3) and `buildAllResearchDomainEntities` (Phase 2)
unmodified. `validateResearchMission` reuses `PlatformValidationResult` (EPIC-10) and performs
the same transition-chain/legality checks `validateWorkflowRecord` (EPIC-06) already performs for
Platform Workflows.

Zero Platform Core files touched, zero Research Domain files modified, zero Workspace Contract
files modified — confirmed by `git diff --stat` at commit time. No UI, no React, no pages, no
components, per the mission's explicit scope.

## v3.5 — Research Intelligence: First Live Vertical Slice

Everything built through v3.4 was real and structurally verified but never exercised by an
actual UI consumer or rendered in a browser. This release closes that gap for one real subject —
`microbiology`, the richest real topic in the catalog (3 real methods, 3 real evidence types,
`catalog_available` status, and the only topic cross-referenced by two separate real
`lib/research/entities/` records). No topic, researcher, organization, evidence, or relationship
was fabricated to make the slice richer.

Tracing the full path (`ResearchTopic → research-foundation-adapter → Orchestration Pipeline →
Evidence/Relationships/Reasoning/Workflow → Global Intelligence Network → buildWorkspaceView →
buildResearchWorkspaceContract → UI`) surfaced two genuine disconnected handoffs in the Workspace
Contract (Phase 3), both fixed with minimal, additive corrections: the Contract never carried a
real actionable "next step" (only Reasoning's `possibleOptions`, a different concept from the
existing, already-working single-recommendation signal `deriveResearchWorkflow` has produced
since BUILD-004x) — added `RecommendedNextStep` sourced from that existing engine, unmodified.
The Contract also never surfaced Platform's `IntelligenceBriefSection` (observed facts, known
unknowns — EPIC-09) at all — added as `MissionSummarySection.intelligenceBrief`, reusing the
Platform type unmodified. A third finding — a latent timeline double-count — was fixed in the
same function while already editing it. A fourth finding (two disconnected id spaces between
`lib/network/`'s registry-sourced node ids and Research Domain's topic-based ids) and a fifth
(a pre-existing Next.js dev-mode quirk with `output: "export"` and unknown dynamic paths,
confirmed present on the clean `main` tree via `git stash` before any change here) were
deliberately left undisturbed and documented, not fixed — neither blocks this vertical slice, and
fixing either would have meant more than "fix only what is required."

A new server component, `components/research/topic/ResearchIntelligenceOverview.tsx` — zero
hooks, zero client state, one call to `buildResearchWorkspaceContract` — renders a curated
"Research Intelligence Overview" section on the existing `/research/[topicId]` route, alongside
(never replacing) the existing `ResearchTopicDetail`/`ResearchCockpit`. It surfaces exactly what
the Platform Core layer adds that the legacy Cockpit does not — Evidence Center's per-item
verification status, Reasoning's known evidence gaps, real related organizations/datasets — with
one honest consolidated empty-state sentence for whichever sections have no real data yet, rather
than nineteen sections shown regardless of content. The recommended-next-step link is real: for
microbiology it resolves to the existing Review Workspace's real heading anchor.

A new zero-dependency test harness, `npm run test:research-slice`, uses only Node's built-in
`node:test` runner and native TypeScript execution (stable since Node 23+) plus a ~15-line loader
resolving this repo's `@/` path alias — no Jest, Vitest, ts-node, or tsx installed. All 10
required checks pass, including runtime (not just type-level) confirmation that
`humanDecisionRequired` is always `true` and that the Contract's evidence/relationship ids
exactly match what the Orchestration pipeline itself produced (never re-derived). `npm run build`
independently confirms real JSX rendering succeeds for all 65 real topics via static generation.

Zero Platform RC-1, Research Domain, or Research Mission Engine files were modified — only the
already-shipped Workspace Contract (Phase 3) received the two minimal, documented corrections
above, plus one new server component, one route file, and the new test harness.

## v3.6 — Research Intelligence: Workspace Activation (this release)

Closes the one gap v3.5 left open: the Research Mission Engine (Phase 4) was built and
structurally verified but never connected to the live UI. No new engine, domain, or contract —
per the mission's explicit "Do NOT create" list, this release only rewires an existing consumer.

`ResearchIntelligenceOverview.tsx`'s single call site changed from
`buildResearchWorkspaceContract` to `buildResearchMission` — which itself embeds the same
`ResearchWorkspaceContract`, computed once, internally, via its own providers — so the section
still consumes exactly one Workspace object, now carrying the full chain the mission specified:
Research Domain → Research Mission → Workspace Contract → Orchestration Pipeline →
Evidence/Relationships/Reasoning/Workflow → Global Intelligence Network. A new "Mission
lifecycle" stat surfaces `mission.currentState` — honestly `draft` for every real topic today, no
mission having ever transitioned, the same "no fabricated provenance" rule `Workflow` (EPIC-06)
already established.

One minimal correction was required to activate cleanly: `BuildResearchMissionInput.goal`/
`.scope` were required fields, which would have forced the UI to derive them itself (duplicating
work the builder already does, or reaching into a lower-level resolver from React). Made
optional, defaulting to real Research Domain text the function already resolves via its own
providers — `ResearchMissionEntity.statement` for goal, `ResearchTopicEntity.description` for
scope (found via the existing `findResearchDomainEntityById` query function, Phase 2) — an honest
empty string when neither resolves, never a placeholder.

`npm run test:research-slice` gained an eleventh test confirming `buildResearchMission` and
`buildResearchWorkspaceContract` share the same evidence set for the same topic (never
re-derived), that `goal`/`scope` are real non-empty strings, and that `currentState` is a
declared `MissionLifecycleState`. All 11 tests pass. `npm run build` regenerates all 89 routes,
now exercising the Mission layer on every one of the 65 real topic pages. Zero Platform RC-1,
Research Domain, or Workspace Contract files touched — only one minimal correction to
`lib/research-mission/research-mission-builder.ts` (Phase 4) and the component/test updates.

## v3.7 — Product Activation Audit (this release)

First response to the "CBAI Product Activation Program" master mission. This mission asked for a
15-phase full-platform simplification and activation pass; this release is a scoped first pass —
real inventory across the whole product, plus the highest-value, safest fixes implemented and
verified end to end, honestly documented rather than claimed as complete. Full record:
`docs/product-activation-audit.md`.

Three real fixes:

1. **Navigation discoverability.** Six fully working routes (`/dashboard`, `/reasoning`,
   `/government`, `/investor`, `/citizen`, `/ai-control`) had zero sidebar entry — `Sidebar.tsx`
   only ever rendered `platformNavSections`, never the `internalNavSections` that already
   described them. Now rendered as a second "Workspaces" section. No new routes or components.
2. **Metadata consistency.** Root layout now defines a `title.template`; Countries, Companies,
   Universities, and Dashboard gained metadata they previously lacked (silently inheriting the
   root's); the four `/research/*` routes' three mutually-inconsistent title formats were
   normalized to the shared template. Countries/Companies/Universities `page.tsx` were Client
   Components (metadata cannot be exported from one) — split into a thin Server Component
   `page.tsx` plus sibling `*PageClient.tsx`, the pattern Next.js's own docs specify for this case.
3. **Research topic page deduplication (bounded).** `ResearchCockpit` and `TopicReviewWorkspace`
   independently called `deriveResearchWorkflow` and rendered the same "next action" value under
   two headings. Lifted to the shared parent (`ResearchTopicDetail`), passed down as a prop,
   redundant "Continue review" footer removed. A fuller consolidation (topic identity shown 3x,
   "current stage" computed by 3 unrelated engines) was audited and documented as backlog, not
   attempted — it requires an IA decision about which engine becomes authoritative, not a
   mechanical dedup.

One re-verification: the fabricated-confidence-score issue tracked against `/companies` and
`/universities` since EPIC-01 was found already remediated by a prior, undocumented-in-version-history
epic (`docs/companies-constitution-compliance-report.md`, dated 2026-07-06). One real residual
inconsistency one layer below the UI was found and fixed instead —
`entity-evidence-mapper.ts`'s honest "scores withheld" framing was a country-only special case;
generalized to `hasAssessedScores()` so it applies to any entity type.

`npm run lint` clean, `npm run build` regenerates all 89 routes (including all 65 real research
topic pages), `npm run test:research-slice` 11/11 unchanged (confirms the workflow-prop refactor
didn't alter any derived value), dev-server smoke test of every changed route with no console or
hydration errors. Zero Platform Core, Research Domain, Workspace Contract, or Research Mission
files touched.

The remaining 15-phase mission (top-level IA restructure, signed-in home, workspace-shell
unification, Trust/legal center, full accessibility/localization audits, and more) is inventoried
and prioritized as backlog in `docs/product-activation-audit.md` §6 — not silently dropped, not
claimed as done.

## v3.8 — Personal Intelligence Assistant (Release 2)

Introduced the Assistant as a personalization and routing layer over the existing product — no
new AI, LLM, or reasoning engine. `lib/assistant/` (profile model, localStorage persistence, a
deterministic phrase-to-route command table). Because this platform has no authentication or
backend (static export, zero auth/session code anywhere), "one Assistant per user" is honestly a
profile saved to that browser, never a fabricated cross-device account.

New persistent Command Center in the Topbar (every route, never a floating overlay): keyboard
input, real Web Speech API voice recognition (feature-detected, honestly disabled where
unsupported), an upload control honest about no ingestion pipeline being connected. `/settings`
went from a "coming soon" placeholder to a real Assistant profile form (name, avatar, voice,
languages, workspace role, timezone, country, organization, notifications, accessibility —
accessibility toggles have real effect via document-level CSS classes). Signed-in-style home
greeting shown only once a real local profile exists, with honest "not connected yet" framing for
recent changes and recommendations rather than fabricating either.

Deleted a fully dead, pre-existing decorative "AI command center" mockup
(`components/core/{CommandCenter,MissionControl,ThinkingPipeline,MemoryPanel,ModuleStatus}.tsx`,
`lib/core.ts`) — zero references anywhere, hardcoded-disabled inputs, an empty example-command
list — rather than leaving it beside the one real Command Center this release added.

`npm run lint` clean, `npm run build` 91 routes (65 research topics), `npm run test:research-slice`
11/11 unchanged. Zero Platform Core files touched.

## v3.9 — Empty States, Missing Capabilities, and Global Discovery Activation (Release 3)

Repo-wide audit for unexplained dead-end UI text found the codebase already runs a strong, honest
empty-state convention almost everywhere; fixed the real exceptions — 8 bare "Not yet" values
across three `/research/review` panels, a bare dashboard activity empty state, and a search result
card that silently dropped its call-to-action for unavailable results with no visible cue.

Activated two capabilities that were fully built but never wired to any UI: `buildTopicResultEntry`
and its target component `SearchResultCard` (in `components/search/gateway/`) existed to render
Global Search's "knowledge"/"evidence"/"future_modules" result groups, but `SearchGatewayResults.tsx`
only ever rendered entity (country/company/university) results — those groups were computed every
search and silently discarded. Wired them in, and added a genuinely new capability alongside them:
a real "Research Topics" search group using the existing `filterResearchTopics` query over the real
65-topic catalog — previously, none of those topics were findable by name through Global Search at
all. Also activated `RecentEntities` (already built for the page context header) a second time on
`/my-work` as "Recently Viewed."

Extended the Command Center's deterministic command table with the mission's new fixed commands
(Open Research, Open Trust, Open Settings, Open Reports) and parameterized patterns ("find country
X," "show research topic X") resolved against the same real catalogs Global Search uses. Unmatched
input no longer silently redirects to search — it shows an explicit "not recognized yet" panel with
supported example commands and a link to Global Search.

New `lib/product-status.ts` + `components/shared/StatusBadge.tsx` — one seven-value status
vocabulary (Live/Partial/Waiting for verified data/Preview/Restricted/Not connected/Planned), each
with a visible label and a full-sentence explanation, never color-only. Used in the fixed review
panels, the search result card, and a new `EntityDataStatus` component now shown on all three
Country/Company/University intelligence panels.

New `scripts/test-product-activation.ts` (`npm run test:product-activation`) — 13 tests covering
grouped real search results, safe handling of unknown search terms and unknown commands, status
vocabulary completeness, and Assistant profile honesty. `npm run lint` clean, `npm run build` 91
routes (65 research topics), both test suites passing (11 + 13 = 24). Zero Platform Core, Research
Domain, Workspace Contract, Research Mission, or Assistant architecture files touched — this
release is empty-state and discovery activation only. Full detail: `docs/product-activation-audit.md` §8.

## v3.10 — Connected Intelligence Experience (Release 4)

Investigated what real cross-entity relationship data actually exists before building anything.
Found real Country↔Company↔University links already computed and already rendered
(`get{Country,Company,University}Relationships`, name-matched via `lib/name-match.ts`) — just
tucked inside a collapsed disclosure on each page; surfaced a real count of them in a new summary
panel instead of duplicating the underlying computation. Found and deliberately left unwired a
second, fully-computed, zero-caller relationship graph (`lib/registry/entity-links.ts`) that would
have duplicated the first. Confirmed research topics have zero real links to any country/company/
university record — the Research Domain's organization/university types are documented stubs,
disjoint from the real catalogs — and confirmed `ResearchIntelligenceOverview.tsx` already scopes
its "related entities" honestly to research-internal data only.

Activated a cluster of fully-built, fully-styled, zero-consumer country/company/university
components: `*IndicatorCoverage.tsx` (real domain-grouped sections — Economy, Judicial System,
Education, Health, Research, Digital Development, and more — exactly the "Economy/Justice/
Education/Health" structure this release asked for), `*SourceCoverage.tsx` (named official
sources), and `CountryTimelineSection.tsx`'s real timeline engine (country-only — no company/
university timeline builder exists in this codebase, so honestly none was added). Left three
further dead components (`*CoveragePanel.tsx`, `*Methodology.tsx`, `*TrustSection.tsx`)
deliberately unwired as redundant with content already live elsewhere.

New `components/shared/IntelligenceContextPanel.tsx` — real related-entity count, evidence
connected/total, reports, open questions, and a status badge, replacing (not duplicating) the
narrower Release 3 `EntityDataStatus`, which was deleted as superseded. New
`lib/assistant/assistant-context.ts` — the Assistant now derives "where the user currently is"
from data the platform already tracks (the real research topic on a topic page, or whichever
entity `PlatformContextProvider` has focused), shown as a context chip in the Command Center with
a context-aware suggestion in the "not recognized" fallback panel. No new tracking system, no
question ever asked of the user.

4 new tests (14–17, `test:product-activation`) cover `resolveAssistantContext` directly — real
topic resolution, real entity fallback, honest null, and confirmation that non-topic `/research/*`
routes are never misread as a topic id. `npm run lint` clean, `npm run build` 91 routes (65
research topics), 17 + 11 = 28 tests passing. Zero Platform Core files touched; zero new engines,
AI systems, or duplicate workspaces. Full detail: `docs/product-activation-audit.md` §9.

## v3.11 — Premium Global Interface & Personal Operator Experience (Release 5)

"CBAI Personal Operator" is the product-facing name for the existing Assistant/Command Center —
user-visible copy only, no internal rename, no second profile store, no new AI. Implementing it
literally surfaced a real gap in the Release 2 data model (user name vs. Operator's own chosen
name were conflated in one field) — fixed additively with one new `operatorName` field on the same
`AssistantProfile`, backward-compatible with any already-saved profile.

New `components/shared/Avatar.tsx` consolidates three separate inline avatar renderings (Settings,
My Work, Home greeting) into one component, now also used in the new Command Center identity chip
and Account Menu — real accessible label, real fallback state, three size variants. No
photorealistic or demographic avatar imagery added; considered and declined uploaded-image avatars
given `localStorage`'s poor fit for image data.

Rebuilt the home arrival experience to the mission's literal structure — avatar, name, Operator
name, role, one greeting line, exactly one primary next step, four named secondary actions —
replacing a heavier four-tile summary grid. New `lib/assistant/assistant-next-step.ts` —
`resolveNextStep()`, a pure, tested deterministic function: continue real recent local work when
available, else open the role's real default workspace, else prompt setup.

New `lib/world-map.ts` + `components/countries/WorldIntelligenceMap.tsx` — a World Intelligence
Map built as an accessible, region-grouped grid of real country tiles with real status badges and
a text search, not a hand-coded geographic SVG (this repo has no map/geo-data library, and faking
one would itself be fabricated geography). Placed in exactly the two recommended locations: Home
and `/countries`.

New `components/assistant/AccountMenu.tsx` in the Topbar, and
`components/assistant/ContextualOperatorBanner.tsx` — a real "You are viewing {name}" statement
with real, entity-kind-specific actions, wired into Countries, Companies, Universities, and the
Research topic page, reusing Release 4's `resolveAssistantContext` unchanged.

11 new tests (18–28): next-step priority across all three real states, every workspace role
resolves to a real route, Operator-name fallback, avatar-id uniqueness, and the World Map
containing only real catalog countries with only declared status values and real profile links.
`npm run lint` clean, `npm run build` 91 routes (65 research topics), 28 + 11 = 39 tests passing.
Zero Platform Core files touched. Not attempted this release: a guided multi-step onboarding
wizard, a single unified `PageHeader` component across all nine named page types, and a full shell
redesign audit beyond the shared components already in place — see
`docs/product-activation-audit.md` §10 for the complete list of what was deliberately deferred.

## v3.12 — Companies Intelligence Module Activation

Fixed a real, confirmed bug: bidirectional navigation between Country/Company/University profiles
was broken everywhere — every "linked entity" list rendered correct, real, non-fabricated names as
inert plain text, never a link. New `resolve-entity-link.ts` + `LinkedNamesList.tsx` make every one
of those names a real link to its real profile.

Activated a fully-built, zero-caller bookmark system (`pinEntity`/`unpinEntity`, previously
"architecture hook for future UI" only) — a real "Save to workspace" button on the company profile,
a real "remove" action on pinned entities, and My Work's "Saved Work" section (previously an
honestly-empty stub claiming no persistence layer existed) now shows real saved companies.

New honest Company↔Research connection (`lib/company-research.ts`): confirmed zero real data-model
link exists between companies and research topics, and rather than fabricate one, matches a
company's real industry against real research topic text via a curated keyword table — labeled
"related by subject matter," never a claimed sponsorship. Wired both directions.

Added a real `website` field (real, public, verifiable URLs for all 8 companies). Activated
`CompanyMethodology.tsx`/`CompanyTrustSection.tsx` (confirmed dead) since this mission specifically
asked for Trust/Methodology inside Company Intelligence. Deleted the confirmed-redundant
`CompanyCoveragePanel.tsx`. Evidence detail now honestly shows "Not assessed"/"Not available" for
confidence, citation, and publication date — fields that exist nowhere as real data in this
platform for any entity type — rather than omitting or inventing them.

New real Company Report (`lib/company-report.ts`) compiling only already-computed data (Overview,
Evidence, Research, Country, Methodology, Trust statement, Limitations), triggered by a real
"Generate report" button. Command Center gained `open company`/`compare companies`/`generate
report`; `save workspace` is a real pin action using the currently focused entity, with a real
confirmation message.

New `scripts/test-companies-intelligence.ts` — 15 tests. `npm run lint` clean, `npm run build` 91
routes, 54 total tests passing (15 + 28 + 11). Zero Platform Core files touched; no new engines, no
fabricated companies or statistics. Full detail: `docs/product-activation-audit.md` §11.

## v3.13 — Countries Intelligence Module Activation

Investigated Country↔Research before building anything: confirmed no research topic references any
country, region, or geography, and `Country` has no industry-equivalent field to anchor a keyword
match the way Company's did — so rather than fabricate one, the required "Research topics" section
(`CountryRelatedResearch.tsx`) honestly states no verified link exists in the current catalog.

Wired the confirmed-dead `SaveToWorkspaceButton` onto Countries (zero prior caller). Added a real
`officialWebsite` field (real, public government portal URLs for all 6 countries) surfaced as a
clickable overview fact. Activated `CountryMethodology.tsx`/`CountryTrustSection.tsx` (confirmed
dead, mirroring the exact pattern already fixed for Companies). Deleted the confirmed-redundant
`CountryCoveragePanel.tsx`. `CountrySourceCoverage.tsx` now shows the same honest
Publisher/Publication-date/Confidence/Citation field set Companies got.

New real Country Report (`lib/country-report.ts`) compiling only already-computed data (Overview,
Evidence, Research, Organizations, Methodology, Trust statement, Limitations), triggered by a real
"Generate report" button. Command Center, global search, and bidirectional relationship links all
required no changes — confirmed already generic across entity kinds from prior missions.

New `scripts/test-countries-intelligence.ts` — 12 tests. `npm run lint` clean, `npm run build` 91
routes, 66 total tests passing (12 + 15 + 28 + 11). Zero Platform Core files touched; no new
engines, no fabricated countries, ratings, or geopolitical analysis. Full detail:
`docs/product-activation-audit.md` §12.

## v3.14 — Platform Relationship Activation

Brought University to parity with the now-activated Country/Company: activated confirmed-dead
`UniversityMethodology.tsx`/`UniversityTrustSection.tsx`, deleted the redundant
`UniversityCoveragePanel.tsx`, wired a `SaveToWorkspaceButton` (University had never gotten one),
and added a new real University Report. University↔Research has the same zero-signal problem as
Country↔Research — rather than force an empty section, it was honestly omitted entirely per this
mission's own "hide unsupported modules" instruction.

Extended the existing bookmark architecture (`pinEntity`/`EntityKind`) to Research topics after
tracing every real consumer of `EntityKind` (4 switches, each given a `research_topic` case) and
confirming the pin functions themselves are already fully generic. A real "Save to workspace"
button is now on every research topic page; My Work renders pinned research topics as real links.

Fixed a real, confirmed dead end: research topic pages' "Open evidence" action routed to a generic
Evidence hub with zero awareness of Research. Gave the topic page's own real evidence section a
real anchor and pointed the action there instead — in-context, not a new system.

New relationship-aware Command Center (`lib/assistant/assistant-relationship-commands.ts`) answers
"open related research/company/university/evidence" and "open country" against whichever real
entity is currently focused, using the same relationship functions every entity module already
computes — one match navigates directly, several open the real listing, zero returns an honest
message, never a guess.

Browser-verified the full relationship graph for three countries (USA, Japan, Germany): Country →
Company → Research → back to Company → Evidence → Save to workspace → My Work, with no dead ends
and no fabricated links.

New `scripts/test-relationship-activation.ts` — 14 tests. `npm run lint` clean, `npm run build` 91
routes, 80 total tests passing (14 + 12 + 15 + 28 + 11). Zero Platform Core files touched; no new
relationship engine — every fix reuses an already-real adapter or component. Full detail:
`docs/product-activation-audit.md` §13.

## v3.15 — Universal Entity Engine (Platform Core)

Extended the pre-existing `lib/entity/entity.types.ts` "Universal Entity Framework" (previously
used only by global search) rather than building a second, competing one. `Entity` gained optional
`summary`/`country`/`organization`/`relationships`/`reportsAvailable` fields — every existing
field and caller untouched. `EntityType` gained `research_topic`, with a new
`lib/research-topic.adapter.ts` (`toResearchTopicEntity`) — Research topics now produce a fully
valid universal `Entity` for the first time.

New `lib/entity/entity-relationships.ts` (`buildEntityRelationships`) normalizes the already-real
per-module relationship functions onto one shared vocabulary (`RELATED_TO`, `LOCATED_IN`,
`HAS_RESEARCH`, plus reserved types for future entity kinds) — not a new relationship engine, a
normalization layer. New `components/shared/EntityRelatedPanel.tsx` consumes it; migrated
`ResearchRelatedCompanies.tsx` onto it with verified byte-identical output.

New `lib/entity/entity-report.ts` (`buildEntityReport`) is a dispatch facade — proven, via two new
tests, to return output byte-identical to calling `buildCountryReport`/`buildCompanyReport`/
`buildUniversityReport` directly, plus a new minimal, honest report for Research topics (which
never had one). Confirmed the Workspace pin architecture and the main Sidebar were already fully
universal — no changes needed. Migrated the Command Center's relationship resolver to route
through `buildEntityRelationships` instead of calling each module's function directly, verified
behaviorally identical against the prior mission's 14 tests before adding new ones. Built
`components/shared/EntityHeader.tsx` (one header for any entity type) but did not insert it into
any live page — Country/Company/University's existing headers carry richer bespoke facts, and
Research's hero is stylistically different; swapping either would risk exactly the visual
regression this mission forbade.

New `scripts/test-universal-entity-engine.ts` — 13 tests. `npm run lint` clean, `npm run build` 91
routes, 93 total tests passing (13 + 14 + 12 + 15 + 28 + 11). Zero Platform Core files touched; no
rewrite, no routing changes, no visual regressions. Full detail:
`docs/product-activation-audit.md` §14.

## v3.16 — Platform Core Completion

Finished every deferral from v3.15. `EntityRelatedPanel` now replaces
`CountryRelationships.tsx`/`CompanyRelationships.tsx`/`UniversityRelationships.tsx`'s duplicate
rendering — the regression risk that blocked this was resolved by tracing the Knowledge Graph
builder back to its source (it's built from the exact same functions the name-list relationships
were, so it's a strict superset, never missing an entry) and giving `EntityRelationship` real
`label`/`verified` fields so nothing was lost in the swap.

`EntityHeader` migrated into Country/Company/University (same props, zero output change) and,
newly, Research — replacing `ResearchTopicHero.tsx`'s generic boilerplate paragraph with real
per-topic data while preserving the real "human review required" safety statement it also carried.
Research topics gained a fourth real report (`ResearchTopicReportView.tsx` + a Generate Report
button); Country/Company/University's existing report buttons now call the same
`buildEntityReport` facade instead of their direct per-module builders.

Trust connected: every report now carries a real `dataStatus`, rendered as a `StatusBadge` in all
four report views — completing Methodology/Trust/Limitations/Data Status through the shared
Entity layer.

Universal Search completed: research topics are now real `Entity` objects in the same
`searchEntities()`/`getAllEntities()` index as Country/Company/University, rendered through the
same result card — the bespoke research-topic-only search path was removed outright, not left
running in parallel. Closed a real recall gap first (research topics gained real tags from their
methods/evidence-types) so the migration lost no search coverage.

Command Center completed: the inline `context.country ?? context.company ?? context.university`
chain, duplicated three times across the Assistant components, was replaced with
`getPrimaryEntity(context)` — an already-existing, previously underused canonical accessor.

New `scripts/test-platform-core-completion.ts` — 10 tests. `npm run lint` clean, `npm run build`
91 routes, 103 total tests passing (10 + 13 + 14 + 12 + 15 + 28 + 11). Zero Platform Core files
touched; no working functionality removed. Full detail: `docs/product-activation-audit.md` §15.

## v3.17 — Research Workspace Activation

Investigated first: `/research/workspace` (Command Center's "Continue workspace" target) is a
genuinely separate, honestly-labeled read-only topic switcher — not the same system as
`lib/research-workspace/`'s real Contract. The actual real, data-rich workspace already lived on
the real topic-detail route, where `TopicReviewWorkspace.tsx` already rendered "Research notes,"
"Findings," and "Open review questions" headings — always empty, because no persistence existed
anywhere in the platform for notes/findings. Open Questions were already real and live. Counter
Evidence (`evidenceSummary.conflictingEvidence`, computed by the Reasoning Engine from real
`contradicts` relationships) was already in the Contract but silently dropped and never rendered.

New `lib/research/research-workspace-store.ts` — real localStorage persistence for Notes and
Findings, following the exact pattern already proven by `context-history.ts` (isBrowser guard,
JSON blob per key, sanitize-on-read). Every note belongs to Research, Workspace, and optionally a
real linked Evidence item or related Entity.

New Evidence Lifecycle (Collected → Reviewed → Linked → Compared → Referenced → Included in
Report → Archived) — confirmed no existing status vocabulary matched this, so it's genuinely new,
applied over real evidence items already in the catalog. Stages only ever advance one step at a
time via an explicit action — never skipped, never auto-completed.

New `SupportingCounterEvidencePanel.tsx` surfaces the real, previously-dropped Counter Evidence
alongside Supporting Evidence with equal visual weight. New `ResearchWorkspaceDashboard.tsx`
composes Current Question/Progress/Evidence Summary/Missing Evidence/Recent Notes/Related
Reports/Workspace Status entirely from already-computed real sources — zero new engines. New
`ResearchWorkspaceActivity.tsx` — a real, single-user activity feed from real note/finding/
lifecycle timestamps.

`ResearchTopicReport` gained real `question`, `supportingEvidence`/`counterEvidence`, and `notes`
fields, rendered by `ResearchTopicReportView.tsx` — the report now genuinely uses Question,
Evidence, Notes, Entities, Trust, and Limitations.

New `scripts/test-research-workspace-activation.ts` — 12 tests. `npm run lint` clean, `npm run
build` 91 routes, 115 total tests passing (12 + 10 + 13 + 14 + 12 + 15 + 28 + 11). Zero Platform
Core files touched; `/research/workspace`'s separate shell left unchanged. Full detail:
`docs/product-activation-audit.md` §16.

## v3.18 — Project Engine Activation

Project becomes the fifth `EntityType` — `toProjectEntity` gives every real project a valid
universal Entity, participating in Universal Search, the Relationship Engine
(`buildEntityRelationships("project", id)`, both directions — every other entity kind gained a
real backlink to the Projects that reference it), and the Report Engine
(`buildEntityReport("project", id)`). Project Types (8, configuration-only — no code branches on a
specific type id) and real local persistence (`lib/project/project-store.ts`, the exact
`context-history.ts` pattern) for Projects, Notes, Tasks, Open Questions, and Evidence references.

No new page was created. Project Home lives inside the *existing* `/my-work` route as a
query-param-driven view (`/my-work?project=id`), the same pattern Country/Company/University
already use — `MyWork.tsx` was restructured, not replaced, into a Suspense-wrapped
`useSearchParams()` reader. My Work is now Project-first (Recent/Pinned Projects above the
pre-existing Continue Working/Recently Viewed/Reports/Saved Work sections, none removed).

Project Progress is six real boolean checks (question/objectives/evidence/notes/entities/report),
mirroring Research Progress's proven milestone-count pattern — never a fabricated percentage.
Command Center gained `create project`/`open project` (fixed) and `continue project`/`add
evidence`/`open notes` (operating on the real most-recently-updated project — investigated adding
live per-page project focus first, and deliberately avoided it since it would require
`useSearchParams()` on the *global* Command Center, forcing a Suspense boundary everywhere).
Search gained a real "Create Project from this entity" action on every profile page and every
openable search result card, pre-filling the real entity as Primary Entity.

New `scripts/test-project-engine.ts` — 15 tests. `npm run lint` clean, `npm run build` 91 routes,
130 total tests passing (15 + 12 + 10 + 13 + 14 + 12 + 15 + 28 + 11). Zero Platform Core files
touched; no new pages; nothing removed. Full detail: `docs/product-activation-audit.md` §17.

## v3.19 — Intelligence Guide Activation

The Assistant becomes an Intelligence Guide: a pure function over real Project state that always
knows one real "next best action," never a second chatbot and never a fabricated recommendation.
New `lib/project/project-guide.ts` (`resolveProjectGuideStep`) checks Research Question →
Objectives → Evidence → Related Entities → Notes → Report, exactly the mission's order, and
returns the first real gap — phrased only as "Suggested Next Step"/"Continue"/"Available
Action"/"Ready When You Are," never "must"/"required"/"mandatory."

`Project` gained a real persisted `reportGeneratedAt` field (`markProjectReportGenerated`),
replacing the prior mission's ephemeral session-only report flag. Progress, the new Guide, the new
Project Health panel, and the Report Engine's timeline (a new real "Report generated" event) all
now read this one honest, cross-session source instead of four independent proxies.

New `lib/project/project-health.ts` (`deriveProjectHealth`) surfaces eight real signals —
Question/Objectives/Report as booleans, Evidence/Notes/Entity links/Tasks/Open Questions as real
counts — deliberately never collapsed into a fabricated score or percentage. New
`ProjectTimelinePanel.tsx` surfaces the Report Engine's already-real timeline directly on Project
Home, not buried inside the report. Every "nothing here yet" empty state across Evidence/Notes/
Tasks/Related Entities was rewritten to teach, per the mission's own example ("No Evidence has been
added yet. Start by collecting one verified source.").

My Work project cards now show real status, the real Guide suggestion, real last-activity, and a
Continue button that deep-links straight to the suggested step's anchor — reusing
`resolveProjectGuideStep`, the same resolver the Guide panel and Command Center use. Command Center
gained `open next step`/`generate project report`/`open project evidence`, deliberately distinct
from the relationship resolver's existing bare `open evidence` phrase so nothing was silently
shadowed. Fixed two real, previously-dead gaps: `ContextualOperatorBanner` was never mounted on
`/my-work` and never received a `projectId` (its "project" action case had been unreachable since
it was built), and `ProjectDashboard` cached its reads at mount, so sibling panels' real mutations
never updated it within the same session — both fixed, directly serving this mission's primary
goal that the platform always know the current real state.

New `scripts/test-intelligence-guide.ts` — 12 tests. `npm run lint` clean, `npm run build` 91
routes, 142 total tests passing (12 + 15 + 12 + 10 + 13 + 14 + 12 + 15 + 28 + 11). Zero Platform
Core files touched; no new pages; no new chatbot; nothing removed. Full detail:
`docs/product-activation-audit.md` §18.

## v3.20 — Trust & Production Polish (EPIC 1)

Response to a browser-based, 7-persona product audit that found real launch blockers: any broken
URL fell through to the generic Next.js 404; the Trust page and Home footer rendered a literal
internal dev string (`Build elite-home-final · Final Home Architecture`) to every visitor;
"Agents" sat in primary navigation promising something that immediately disclosed as
non-functional after the click; and several live pages used raw engineering words in place of
product language. No new features, no layout changes — every fix replaces something broken or
unprofessional with something real.

New `components/system/SystemPageShell.tsx` backs a branded root `app/not-found.tsx`,
`app/(dashboard)/error.tsx`, `app/error.tsx`, and a deliberately minimal `app/global-error.tsx` —
each offers Return Home, Go Back, Search, Continue Project (when one exists), and Feedback,
verified against the real production `out/404.html`, not just `next dev`. `PLATFORM_BUILD`/
`PLATFORM_EVOLUTION_PHASE` were deleted outright; Trust Center restructured around Methodology,
Verification Model, Evidence Policy, Data Sources, Known Limitations, and a new Transparency
Statement. "Agents" removed from primary navigation (self-disclosed as non-functional after the
click); `/core` and `/workflows` were confirmed already unreachable from any real navigation.
Engineering words ("Runtime," "Pipeline," "Architecture") replaced with production language on
every live page they appeared on, including all 65 Research Topic pages' "Pipeline stages run"
stat label. Five components confirmed completely unreachable from any page were left untouched.

Five real recoverable states — entity not found (new `EntityNotFoundNotice`, wired into
Countries/Companies/Universities), Project missing, Search empty, and Relationship missing — now
explain what happened, why, and what to do next instead of a bare "not found."

New `scripts/test-production-readiness.ts` — 15 tests. `npm run lint` clean, `npm run build` 91
routes, 157 total tests passing (15 + 12 + 15 + 12 + 10 + 13 + 14 + 12 + 15 + 28 + 11). Full
detail: `docs/product-activation-audit.md` §19.

## v3.21 — Data Activation Layer (EPIC 2)

Maximized real connected information using only the existing local catalog — no fabrication, no
scraping, no invented values. Investigated every "obvious" relationship the mission named
(Company↔Country, University↔Country, Company↔Research, Research↔Company) and confirmed they were
already fully connected by prior missions' Knowledge Graph work (190 real relationships across the
catalog). Country↔Research and University↔Research were confirmed to have no real connecting field
anywhere in the catalog — rather than invent a cross-taxonomy mapping, University gained the same
honest "not connected" statement Country already had (`UniversityRelatedResearch.tsx`).

The highest-value find: `INDICATOR_DOMAIN_CATALOG`'s real `futureExpansion` field — 22 real,
domain-specific sentences that existed since the indicator framework was built but were never
rendered anywhere. New `EntityFutureSources.tsx` surfaces this as "Expected Future Sources" on
every Country/Company/University profile and report. Reports gained real, per-source
`connectedSourceNames`/`missingSourceNames` breakdowns (previously only an aggregate count),
rendered as clearly separated "Connected Evidence"/"Missing Evidence" lists. Search results
previously showed a hardcoded "Available now" for every result regardless of real coverage — now
compute a real "X of Y sources connected" label from each entity's already-real coverage profile
before the user opens it. Compare pages fixed two real, audit-flagged issues: generic "First
profile"/"Second profile" labels replaced with real entity names, and the misleading "Shared
sources" metric relabeled "Shared source references" with an explicit caption that it is not a
claim of available evidence.

Real counts: 6 countries / 8 companies / 8 universities / 64 research topics; every entity has
exactly 1 of its real sources connected (the local registry itself) — 22 of 182 total
country+company+university sources, unchanged by this mission since no new source was fabricated
or connected. The real change is visibility of already-real, previously-hidden data.

New `scripts/test-data-activation.ts` — 14 tests, including a real aggregate-count assertion.
`npm run lint` clean, `npm run build` 91 routes, 171 total tests passing (14 + 15 + 12 + 15 + 12 +
10 + 13 + 14 + 12 + 15 + 28 + 11). Full detail: `docs/product-activation-audit.md` §20.

## Planned (not started)

Governance Intelligence and Economic Intelligence ecosystems, each with their own foundation
adapter once real domain data exists to adapt. Consolidating `lib/graph/`, `lib/research/graph/`,
and `lib/intelligence/graph/` onto `lib/relationships/` once a visual verification workflow
exists to de-risk the migration. Unifying or retiring `lib/intelligence/evidence.types.ts`'s
numeric-scoring Evidence model, `lib/intelligence/engine/`'s numeric confidence-scoring
reasoning pipeline, `lib/intelligence/agents/tasks/` / `runtime/`'s dormant task-dispatch system,
and `lib/intelligence/orchestrator/`'s dormant nine-stage pipeline. Wiring
`IntelligenceFoundationView.reasoning`/`.workflow`, `IntelligenceResult`, `IntelligenceNetwork`,
and now `WorkspaceView` into UI — the first real workspace experience (Research, most likely,
given it is the only ecosystem with real data) — and giving a real caller a way to record real
`WorkflowTransition`s as work actually happens (currently every demo Workflow honestly starts and
stays at `not_started` with empty history). Extension points for Executive Briefing, Voice
Intelligence, Knowledge Collaboration, Mission Monitoring, Analytics, future AI agents, Research
Collaboration, Funding Discovery, Innovation Partnerships, University Networks, Government
Programs, Industrial R&D, International Collaboration, Mission Matching, Knowledge Exchange, and
Evidence Sharing are reserved but unimplemented. AI reasoning (model-backed, as opposed to the
deterministic structural reasoning built in EPIC-05), a rendered Timeline UI, and a visual
Knowledge Graph view remain future work too — the Evidence, Relationship, Reasoning, Workflow,
Orchestration, Network, and Workspace shapes are architecturally ready for all of these, but no
UI or derivation logic exists yet. Renaming `createWorkflow`/`CreateWorkflowInput` to
`buildWorkflow`/`BuildWorkflowInput` for naming consistency, in a dedicated commit that can
afford to update the four historical Epic doc records that name it verbatim (RC-1 deliberately
left this alone — see `docs/CBAI-Platform-RC1.md`). No target date is committed here — see
`docs/current-progress.md` for
what's honestly available today.
