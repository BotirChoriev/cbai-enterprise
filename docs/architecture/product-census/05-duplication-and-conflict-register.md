# Duplication and conflict register

Scoring weights: user safety 20%, data preservation 15%, usefulness 15%, simplicity 10%, maintainability 10%, accessibility 10%, security/privacy 10%, legal defensibility 5%, migration risk 5%. Scores are analyst judgments from reachability audits (cite paths). **No consolidation performed.**

## Family E1 — Evidence stacks

**Competitors**

| ID | Path | Reachability |
|----|------|--------------|
| E1-A | `lib/evidence-explorer.ts` + `components/evidence/*` + infra/gap/comparison/runtime | `/knowledge` + entity panels — PROVEN |
| E1-B | `lib/research/evidence/*` + research stores | `/research*` — PROVEN |
| E1-C | `lib/evidence-pipeline/*` | pipeline-readiness / builders — PARTIAL |
| E1-D | `lib/evidence/*` | lib plumbing — PARTIAL |
| E1-E | `lib/intelligence/evidence/*` | no app/components — ORPHAN tip |

### Options

| Option | Description | Score (1–5) |
|--------|-------------|-------------|
| O1 | Keep all five forever | 1.6 — unsafe complexity |
| O2 | Canonical A+runtime; merge B types; quarantine E; fold C into infra | **4.2** |
| O3 | Rewrite greenfield evidence | 2.1 — high migration risk |

**Recommend:** O2 — KEEP E1-A as UI canonical; MERGE E1-B/C/D; QUARANTINE E1-E.
**Why:** Only A+B are user-reachable; A already owns nav “Evidence”.
**Disposition:** A KEEP; B MERGE; C MERGE; D MERGE; E QUARANTINE.

## Family O1 — Orchestration / agents

| ID | Path | Reachability |
|----|------|--------------|
| O1-A | `lib/voice-operator` + `lib/platform-actions` + FDE | layout global — PROVEN/PARTIAL |
| O1-B | `lib/intelligence/**` orchestrator/agents/runtime | no app/components — ORPHANED |
| O1-C | `/agents` + `lib/agents.ts` | stub UI — PARTIAL |

### Options

| Option | Score |
|--------|-------|
| Keep B as future runtime secretly | 1.8 |
| Canonical A; quarantine B; honest C or hide | **4.4** |
| Delete B immediately | 2.5 — needs approval; may hold reusable algorithms |

**Recommend:** Canonical A; QUARANTINE B; QUARANTINE/honest stub C.
**Do not delete B in census.**

## Family G1 — Graph

| ID | Path | Status |
|----|------|--------|
| G1-A | `lib/graph` + living-graph + LON | PROVEN `/graph` |
| G1-B | `lib/intelligence/graph` | ORPHANED |
| G1-C | `GraphPersonas`, `KnowledgeUniverseViews` | ORPHANED components |

**Recommend:** KEEP A; QUARANTINE B; DELETE_CANDIDATE C (approval required). Score best option **4.5**.

## Family W1 — Workspace / work / collaboration naming

| ID | Path | Status |
|----|------|--------|
| W1-A | `/my-work` + project + OO + missions | PROVEN |
| W1-B | `components/workspaces` investor/gov/citizen | PROVEN role lenses |
| W1-C | `components/workspace` personal empties | PARTIAL/PLACEHOLDER |
| W1-D | `lib/organization-os` | PROVEN `/organization` |
| W1-E | `lib/collaboration` | ORPHANED from UI |

### Options

| Option | Score |
|--------|-------|
| Rename everything now | 2.8 migration UX risk |
| Keep A+B+D; refactor C into Personal Cabinet; quarantine E | **4.1** |
| Merge E into D by rewriting stores in place | 3.0 data risk |

**Recommend:** second option. Governance ≠ Government remains intentional (`intent-matcher` disambiguation) — **not** a merge family.

## Family R1 — Reports vs analytics

`/reports` PROVEN; `/analytics` legacy PARTIAL. Recommend KEEP reports; ARCHIVE or redirect analytics after approval. Score **3.9**.

## Government vs Governance (non-duplicate)

Separate routes, copy, FDE engine mapping. Conflict is **naming UX only**. Disposition: KEEP both; improve disambiguation copy.
