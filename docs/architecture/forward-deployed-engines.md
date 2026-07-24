# Forward-Deployed Execution Engines

**Module:** `lib/forward-deployed-engines/`
**UI:** `components/forward-deployed/`

## Definition

A forward-deployed engine is **not** a free-running autonomous agent. It is a typed planner that:

1. Receives objective + ontology context
2. Declares required/optional inputs
3. Identifies missing information
4. Produces a proposed work plan
5. Distinguishes inferred vs user-provided fields
6. Requires confirmation before mutations
7. Executes only allowlisted platform actions
8. Records provenance, limitations, audit events
9. Stops when authority, evidence, or configuration is missing
10. Never fabricates data, sources, progress, or completion

## Lifecycle States

`idle` → `understanding` → `planning` → `awaiting_confirmation` → `executing` → `completed`

Stop states: `blocked`, `needs_evidence`, `needs_human_review`, `failed`, `cancelled`

## Initial Engine Registry

| Engine | Input | Output |
|--------|-------|--------|
| Research | research question/topic | hypotheses, evidence reqs, work plan, report outline |
| Evidence | claim/question/object | evidence map, known/unknown/contradictory, review tasks |
| Country Intelligence | country + objective | indicators, coverage, gaps, comparison candidates |
| Organization Intelligence | company/university | evidence profile, linked work, missing info |
| Mission | user goal | structured mission, milestones, next safe action |
| Governance Review | report/conclusion/decision | policies, evidence-readiness, human checklist |
| Multilingual Meeting | languages, participants | glossary, transcript schema — **foundation only** |

## Operational Workspace UX

Reusable pattern (10 sections):

1. Objective
2. Context
3. What CBAI understands
4. Missing information
5. Proposed plan
6. Evidence requirements
7. Risks and limitations
8. Confirmation
9. Execution state (timeline)
10. Results and next action

Components in `components/forward-deployed/`. Route entry via `EngineRouteEntryStrip`.

## Voice/Text Integration

Engine invocation extends the canonical platform-action registry:

- `engine.research.start`, `engine.evidence.start`, etc.
- Uzbek examples: chemistry research, US evidence, Apple gaps, governance review
- Same registry for typed commands and Realtime Voice

## Execution Model

Engines produce plans only. Confirmed execution delegates to allowlisted `platform-actions` and Operational Object composer — never direct silent store writes.
