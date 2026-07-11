# CBAI Build Ledger

Grouped by series. Individual commit messages are the authoritative per-commit record
(`git log`); this ledger tracks series-level milestones so the shape of the work is legible
without reading 60+ commits.

## RI-BUILD series (001–033) — Research Intelligence catalog and UI foundation

Established the canonical `ResearchTopic` catalog, the topic detail page, the global research
network graph, workspace explorer, evidence navigation with URL-driven selection, and the
Research Review domain scaffolding (`lib/research/review/`). Consolidated a duplicate
`ResearchTopic` model (RI-BUILD-033B) after a naming collision was caught before it shipped.

## BUILD-004x series — Deterministic intelligence engines

| Build | Commit | What it added |
|---|---|---|
| 004A | `f50c5aa` | Evidence Gap Intelligence Engine — `lib/research/intelligence/` |
| 004B | `e0c8fa1` | Research Mission Workspace (mission, known info, unknowns, gaps) |
| 004C | `d61d53a` | Research Decision Engine — one deterministic recommendation |
| 004D | `8f2cb86` | URL-driven evidence selection (`?evidence=`), server-first |

## BUILD-005 — Review Operating System foundation (`5f1f54a`)

`TopicReviewWorkspace`, `ResearchReviewWorkspaceState`, honest empty states for notes/findings,
process-level open questions derived from real gap/review state.

## EPIC series — Platform-wide transformation (this is EPIC-04)

| Epic | Commit | Scope |
|---|---|---|
| — | `40796cf` | Research Workspace professionalization (Context Bar, Mission Control Panel) |
| — | `d9533fb` | Research Readiness Engine — deterministic milestones, `lib/research/readiness/` |
| — | `bc77bea` | Research Health Engine — Healthy/Stable/Weak/Critical, `lib/research/health/` |
| — | `067b101` | Research Workflow Engine — stage, next action, real action links, `lib/research/workflow/` |
| — | `4cf366c` | Research Cockpit — one operational surface, consolidated Mission Control Panel + Timeline |
| EPIC-01 | `b8d65e3` | Universal product identity, positioning, and public entry experience |
| EPIC-02 | `a9f419c` | Universal Intelligence Foundation — `lib/foundation/`, research adapter |
| EPIC-03 | `05777e7` | Universal Relationship Engine — `lib/relationships/`, 16-type vocabulary, richer `Relationship` envelope; found and documented three pre-existing, unmigrated graph/relationship systems (`lib/graph/`, `lib/research/graph/`, `lib/intelligence/graph/`) |
| EPIC-04 | *(this)* | Universal Evidence Operating System — `lib/evidence/` engine (build, validate, link, history, query/compare/trace); `Evidence` enriched to 21 fields; `EvidenceSourceType`/`VerificationStatus` promoted from existing Research/evidence-infrastructure modules (aliased, not duplicated); shared `Confidence` extracted for Relationship + Evidence; found and documented a third, non-integrated numeric-scoring Evidence model in `lib/intelligence/` |

## Pattern established across every engine build

1. Inspect the real, existing data model before writing anything.
2. New engine consumes the engine directly below it — never re-derives.
3. Every "not yet possible" state renders an honest empty state or non-interactive requirement,
   never fabricated content.
4. `npm run lint && npm run build` before every commit; `git diff --stat` reviewed to confirm
   the change is scoped to what was intended.
