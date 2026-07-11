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

## v3.5 — Research Intelligence: First Live Vertical Slice (this release)

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
