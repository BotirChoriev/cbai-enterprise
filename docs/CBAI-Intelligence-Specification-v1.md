# CBAI Intelligence Specification v1

**Document ID:** CBAI-Intelligence-Specification-v1  
**Platform:** CBAI Enterprise — Global AI Operating System  
**Status:** Scientific foundation — ratified  
**Effective:** July 2026  
**Horizon:** 2026–2031  
**Companion documents:** `docs/CBAI-Constitution-v1.md`, `docs/CBAI-Domain-Model-v1.md`

This document defines what **Intelligence** means inside CBAI — not as a marketing term, not as a model output, and not as a UI label, but as a **formal epistemic object** with lifecycle, provenance, quality dimensions, and governance rules.

The Domain Model defines *what exists in the world*. This specification defines *what it means to know something about that world* inside CBAI.

This is not an implementation document. It does not prescribe file paths, APIs, or UI components. It is the scientific definition against which all intelligence behavior in the platform is judged.

---

## 0. Scope and Position

CBAI treats Intelligence as a **governed product of evidence-backed inference** over typed world objects — not as raw model text, not as unverified search hits, and not as static dashboard metrics in isolation.

| Concept | Role in CBAI |
|---------|--------------|
| **Data** | Raw or semi-structured inputs from domain modules, documents, or external feeds |
| **Entity** | Normalized world object (see Domain Model) |
| **Signal** | Quantitative or qualitative indicator attached to an entity or relationship |
| **Evidence** | Traceable support for a claim, bound to source and relevance |
| **Inference** | Structured reasoning step that transforms evidence into a provisional conclusion |
| **Intelligence** | Actionable, explainable conclusion with confidence, provenance, and optional recommended action |
| **Memory** | Persistent organizational context that biases future intelligence without replacing evidence |
| **Trust** | Organizational willingness to act on intelligence given governance, provenance, and auditability |

**Fundamental axiom:** In CBAI, nothing qualifies as Intelligence unless it can be **explained**, **scored**, and **overridden**.

---

## 1. Intelligence Definition

### 1.1 Formal definition

**Intelligence** in CBAI is a structured epistemic artifact that satisfies all of the following:

1. **Grounded** — It references at least one entity, relationship, document, or graph path in the CBAI ontology.
2. **Supported** — It is backed by one or more evidence items with declared source type and relevance.
3. **Scored** — It carries a confidence measure reflecting evidence quality, not predictive certainty.
4. **Explainable** — It exposes the reasoning path (stages, decision nodes, or agent contributions) that produced it.
5. **Governed** — It is subject to human override, audit, and retention policy.
6. **Actionable or informational** — It either answers a question, recommends an action, or updates organizational understanding of an entity.

Intelligence that fails any of these criteria is classified as **Unverified Output** and must not be presented as intelligence in user-facing surfaces.

---

### 1.2 What Intelligence is not

| Not intelligence | Why |
|------------------|-----|
| Raw LLM completion without entity or evidence binding | No grounding; no audit trail |
| Entity field value alone (e.g. a GDP string) | Data, not inference |
| Search result list without synthesis | Retrieval, not conclusion |
| Graph visualization without interpreted path | Structure, not judgment |
| Agent status indicator | Operational telemetry |
| Universal score on Entity (`aiScore`, etc.) | Signal, not intelligence product |
| User free-text note without entity link | Orphan context |

---

### 1.3 Intelligence types

| Type | Description | Primary surface |
|------|-------------|-----------------|
| **Entity intelligence** | Profile-level understanding of a single entity | Entity `aiSummary`, module detail |
| **Relational intelligence** | Conclusion about connection between entities | Graph paths, relationship panels |
| **Comparative intelligence** | Judgment across two or more entities | Reasoning Engine, Research Agent |
| **Predictive intelligence** | Forward-looking assessment with explicit uncertainty | Strategy Agent, reasoning caveats |
| **Operational intelligence** | System or agent state relevant to decision-making | Dashboard, Analytics, AI Control |
| **Document intelligence** | Extracted or summarized knowledge from indexed collections | Knowledge module, RAG outputs |

All types share the same epistemic requirements: grounding, evidence, confidence, explainability, governance.

---

### 1.4 Intelligence artifact (conceptual schema)

```
Intelligence {
  id                  Unique identifier
  type                Entity | Relational | Comparative | Predictive | Operational | Document
  claim               The conclusion or answer (human-readable)
  subjectEntities     Entity references the intelligence is about
  evidence            Ordered evidence items
  confidence          0–100 composite evidence-quality score
  trustTier           Derived organizational trust classification
  reasoningTrace      Stage-by-stage or agent-by-agent provenance
  caveats             Explicit limitations and uncertainty
  recommendedActions  Optional next steps
  producedBy          Reasoning Engine | Agent | Human | Ingestion pipeline
  producedAt          Timestamp
  validUntil          Optional freshness horizon
  overrideStatus      none | flagged | superseded | human-authored
}
```

This schema is normative for the *concept* of intelligence. Concrete storage formats are implementation concerns.

---

### 1.5 Relationship to Entity scores

Entity universal scores (`aiScore`, `investmentScore`, `riskScore`) are **persistent signals** — normalized indicators of capability, attractiveness, and risk. They inform intelligence but are not intelligence themselves.

| Layer | Nature | Persistence |
|-------|--------|-------------|
| Entity scores | Structural signals on world objects | Stored on Entity |
| Search relevance | Ephemeral query match strength | Session-only |
| Reasoning confidence | Ephemeral evidence-quality composite | Per reasoning run |
| Intelligence product | Synthesized claim with full epistemic envelope | Persisted when user saves or policy requires |

**Rule:** Scores may elevate or filter evidence; they must never substitute for evidence in a reasoning conclusion.

---

## 2. Intelligence Lifecycle

Intelligence in CBAI is not static. It moves through a defined lifecycle from raw input to governed organizational knowledge.

### 2.1 Lifecycle stages

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  SENSE   │───►│  NORMALIZE│───►│  CONNECT │───►│  REASON  │───►│  DELIVER │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
  Raw input      Entity shape     Graph edges     Inference      Intelligence
  from sources   via adapters     & search index  pipeline       artifact
                                                                    │
                    ┌───────────────────────────────────────────────┘
                    ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │  REVIEW  │───►│  RETAIN  │───►│ ARCHIVE  │
              └──────────┘    └──────────┘    └──────────┘
              Human override  Memory / audit   Superseded /
              & verification  persistence       expired
```

---

### 2.2 Stage definitions

| Stage | Name | Function | Output |
|-------|------|----------|--------|
| 1 | **Sense** | Acquire raw data from domain modules, documents, feeds, or user input | Unnormalized records |
| 2 | **Normalize** | Transform domain records into Entity via adapters | Typed entities with signals |
| 3 | **Connect** | Derive relationships, index for search, build graph | Edges, search index, graph snapshot |
| 4 | **Reason** | Execute inference pipeline over entities, graph, and memory context | Provisional intelligence with evidence |
| 5 | **Deliver** | Present intelligence to user or agent consumer with full explainability | Intelligence artifact |
| 6 | **Review** | Human inspection, override, flag, or approval | Verified or corrected intelligence |
| 7 | **Retain** | Persist to memory, audit log, or watchlist per policy | Organizational memory entry |
| 8 | **Archive** | Mark superseded, expired, or retracted intelligence | Historical record (read-only) |

---

### 2.3 Lifecycle states

| State | Meaning | Transitions to |
|-------|---------|----------------|
| `draft` | Produced by pipeline; not yet reviewed | `active`, `rejected` |
| `active` | Current authoritative intelligence for its scope | `superseded`, `expired`, `archived` |
| `flagged` | Human marked for re-verification | `active`, `rejected`, `superseded` |
| `superseded` | Replaced by newer intelligence on same subject | `archived` |
| `rejected` | Human or policy rejected; not actionable | `archived` |
| `expired` | Validity horizon passed; freshness unknown | `archived`, `draft` (re-run) |
| `archived` | Historical only; excluded from default retrieval | — |

---

### 2.4 Freshness and decay

Intelligence carries implicit or explicit **validity horizons**:

| Intelligence type | Default freshness sensitivity |
|-------------------|-------------------------------|
| Entity profile (`aiSummary`) | Medium — regenerate on entity data change |
| Market / competitive | High — days to weeks |
| Country macro | Medium — weeks to months |
| Legal / compliance document | Low until source document changes |
| Graph relationship | Medium — until relationship field changes |
| Reasoning session output | High — session-scoped unless saved |

**Rule:** Stale intelligence must be labeled stale. Presenting expired intelligence as current violates the Intelligence Specification.

---

### 2.5 Regeneration triggers

Intelligence should be regenerated (re-enter Reason stage) when:

- Underlying entity domain data changes materially
- A graph edge is added, removed, or retyped
- A pinned or cited document is re-indexed with different content
- Human override requests re-run with corrected inputs
- Confidence falls below organizational threshold on periodic re-evaluation
- Contradiction is detected against newer evidence (see Section 7)

---

## 3. Evidence Model

Evidence is the **atomic unit of justification** in CBAI. Every intelligence claim must decompose to evidence items.

### 3.1 Evidence definition

**Evidence** is a traceable datum that supports or contradicts a claim, with declared provenance, bound entity reference, relevance score, and human-readable excerpt.

Evidence without provenance is **anecdote**, not evidence.

---

### 3.2 Evidence item structure

```
EvidenceItem {
  id                  Unique identifier
  entity              Source Entity (required for entity-bound evidence)
  source              Evidence source class
  sourceRef           Optional document ID, URL, or ingestion record
  relevance           0–100 — strength of support for the active claim
  excerpt             Quoted or summarized supporting text
  relationshipLabel   Optional graph edge label when source is relational
  retrievedAt         When evidence was collected
  staleness           Optional age indicator
}
```

---

### 3.3 Evidence source classes

| Source class | Origin | Epistemic weight (baseline) |
|--------------|--------|----------------------------|
| `entity-profile` | Entity overview, aiSummary, metadata, metrics | High for descriptive claims; medium for inferential |
| `search` | Global Search match with scored relevance | Medium — retrieval signal, not proof alone |
| `knowledge-graph` | Traversed edge path between entities | High for relational claims |
| `document` | Indexed knowledge collection chunk | High when citation is exact; medium when summarized |
| `agent-output` | Prior agent task result linked to entities | Medium — requires agent trust tier |
| `human-input` | Explicit user assertion linked to entity | Variable — governed by trust policy |
| `external-feed` | Ingested third-party data with provenance | Medium — depends on source trust tier |

Current platform implements `entity-profile`, `search`, and `knowledge-graph`. Additional classes are normative for future state.

---

### 3.4 Evidence quality dimensions

Each evidence item is evaluated on four independent dimensions:

| Dimension | Question | Scale |
|-----------|----------|-------|
| **Relevance** | How directly does this support the claim? | 0–100 |
| **Recency** | How current is the source? | fresh · aging · stale |
| **Provenance strength** | How trustworthy is the origin? | verified · inferred · unverified |
| **Corroboration** | How many independent sources agree? | solitary · supported · consensus |

**Rule:** High relevance with weak provenance ranks below moderate relevance with strong provenance for high-stakes decisions.

---

### 3.5 Evidence aggregation rules

| Rule ID | Rule |
|---------|------|
| **EV1** | Minimum one evidence item required for any intelligence claim |
| **EV2** | Relational claims require at least one graph-path or relationship-field evidence item |
| **EV3** | Comparative claims require evidence from each entity in the comparison set |
| **EV4** | Duplicate evidence (same entity, same excerpt) is deduplicated in aggregation |
| **EV5** | Contradicting evidence must be surfaced, not suppressed (see Section 7) |
| **EV6** | Evidence ordering: relevance descending, then provenance strength, then recency |
| **EV7** | Empty search results produce zero evidence — inference must not proceed as high-confidence |

---

### 3.6 Evidence sufficiency thresholds

| Claim type | Minimum evidence count | Minimum avg relevance |
|------------|------------------------|----------------------|
| Descriptive (single entity) | 1 | 40 |
| Relational (A relates to B) | 2 (one per side or one graph path) | 50 |
| Comparative (A vs B) | 2 (one per entity minimum) | 45 |
| Strategic recommendation | 3 | 55 |
| High-stakes (investment, compliance) | 4 | 65 |

Thresholds below minimum produce **insufficient evidence** status — intelligence may be delivered with low confidence and mandatory caveats, but not as high-confidence intelligence.

---

## 4. Confidence Model

Confidence measures **how well the evidence supports the claim** — not how likely the future is to match the prediction.

### 4.1 Definition

**Confidence** is a normalized composite score (0–100) reflecting the quality, volume, connectivity, and consistency of evidence available at inference time.

Confidence answers: *"How justified is this conclusion given what we know right now?"*

Confidence does **not** answer: *"Will this prediction come true?"*

This distinction is mandatory in all user-facing intelligence products.

---

### 4.2 Confidence factors (canonical)

| Factor | Weight | Measures |
|--------|--------|----------|
| **Evidence volume** | 0.25 | Count of distinct evidence items meeting relevance floor |
| **Source relevance** | 0.25 | Mean relevance score across evidence set |
| **Graph connectivity** | 0.25 | Number of validated relationship paths supporting the claim |
| **Entity signal quality** | 0.25 | Mean universal score (`aiScore`) of primary subject entities |

Weights sum to 1.0. Factor weights may be tuned per intelligence type in future revisions but must remain documented and auditable.

---

### 4.3 Confidence computation (conceptual)

```
confidence = clamp(
  w₁ × normalize(evidenceCount) +
  w₂ × mean(relevance) +
  w₃ × normalize(graphPaths) +
  w₄ × mean(entityAiScores),
  min = 0,
  max = 100
)
```

**Operational floor:** Intelligence delivered with fewer than minimum evidence items is clamped to a low-confidence band regardless of entity signal quality.

**Operational ceiling:** Confidence above 95 requires corroboration from at least two independent source classes and zero unresolved contradictions.

---

### 4.4 Confidence bands

| Band | Range | Label | User-facing meaning |
|------|-------|-------|---------------------|
| Insufficient | 0–41 | Low | Not enough evidence; treat as exploratory only |
| Moderate | 42–64 | Medium | Supported but gaps remain; verify before acting |
| Strong | 65–84 | High | Well-supported by multiple signals |
| Very strong | 85–94 | Very High | Broad evidence coverage with graph validation |
| Near-complete | 95–100 | Exceptional | Reserved for multi-source corroboration without contradiction |

Current Reasoning Engine uses a 42–98 operational range for mock inference. The full 0–100 scale is normative for production.

---

### 4.5 Confidence vs certainty vs probability

| Term | CBAI meaning | Used for |
|------|--------------|----------|
| **Confidence** | Evidence-quality composite | All intelligence products |
| **Certainty** | Not a platform metric — avoided | — |
| **Probability** | Future extension for predictive intelligence only | Scenario modeling (Phase 3+) |
| **Risk score** | Entity signal (inverted: lower is better) | Entity profile, not inference |

**Rule:** UI must never label confidence as "accuracy" or "probability of being correct."

---

### 4.6 Confidence degradation

Confidence degrades when:

- Evidence ages past freshness threshold
- Source document is re-indexed with conflicting content
- Graph edge is removed
- Human flags intelligence for review
- Contradicting evidence is ingested
- Entity scores change materially without intelligence regeneration

Degraded intelligence transitions to `flagged` or `expired` state per lifecycle rules.

---

## 5. Trust Model

Trust is **organizational**, not statistical. It governs whether intelligence may drive automated action, agent dispatch, or executive decisions.

### 5.1 Definition

**Trust** in CBAI is the composite willingness of an organization to rely on an intelligence product, derived from producer trust, source provenance, confidence band, audit history, and human verification status.

Confidence measures evidence quality. Trust measures **organizational permission to act**.

---

### 5.2 Trust tiers

| Tier | Name | Requirements | Permitted use |
|------|------|--------------|---------------|
| T0 | **Unverified** | Unverified Output; no evidence binding | Display with warning only |
| T1 | **Exploratory** | Evidence present; confidence 42–64; no human review | Analyst review; not for automation |
| T2 | **Operational** | Confidence 65–84; provenance declared; no open contradictions | Standard decisions; agent input |
| T3 | **Authoritative** | Confidence 85+; multi-source corroboration; human review or policy auto-approve | Executive briefing; workflow triggers |
| T4 | **Human-authored** | Explicit human override or authored intelligence | Highest priority; supersedes T1–T3 on same subject |

---

### 5.3 Trust inputs

| Input | Effect on trust |
|-------|-----------------|
| Producer type (Reasoning Engine vs Agent vs Human) | Agent outputs start at T1; human at T4 |
| Source provenance completeness | Missing provenance caps at T1 |
| Confidence band | Direct mapping to T1–T3 ceiling |
| Human verification | Elevates to T3 or T4 |
| Security Agent clearance | Required for T3 automation triggers |
| Contradiction status | Open contradiction caps at T1 |
| Age / staleness | Stale intelligence demoted one tier |

---

### 5.4 Producer trust matrix

| Producer | Default trust tier | Elevated by |
|----------|-------------------|-------------|
| Reasoning Engine (evidence-backed) | T1–T3 (by confidence) | Human review |
| Research Agent | T1–T2 | Corroboration + human review |
| Strategy Agent | T1–T2 | Explicit scenario labeling |
| Knowledge Agent (document RAG) | T2 (with citation) | Source document trust tier |
| Market Agent | T1–T2 | Corroboration over time |
| Automation Agent | T1 | Human approval gate |
| Security Agent | T2–T3 (audit outputs) | Policy definition |
| Human analyst | T4 | — |
| Ingestion pipeline | T2 (structured data) | Validation rules |

---

### 5.5 Source trust (document and feed)

Knowledge collections and external feeds carry **source trust scores** independent of intelligence confidence:

| Source trust | Criteria |
|--------------|----------|
| Verified | Primary source, legal filing, official statistics |
| Curated | Editorially reviewed collection, internal strategy doc |
| Aggregated | Third-party research, news synthesis |
| Unverified | User upload pending review, unconfirmed feed |

Document evidence inherits source trust. Intelligence citing low source trust cannot exceed T2 regardless of confidence score.

---

### 5.6 Trust propagation

Trust does not propagate blindly across entities or time:

- Trust in "Company A is a strong AI investment" does **not** automatically transfer to "Country X is favorable"
- Graph paths propagate **relational claims** only when edge evidence meets threshold
- Saved memory entries carry trust tier at time of save; re-use does not upgrade trust without re-verification

---

## 6. Signal Prioritization

CBAI processes many simultaneous signals. Prioritization determines which signals become evidence and which influence inference first.

### 6.1 Signal taxonomy

| Signal class | Examples | Persistence |
|--------------|----------|-------------|
| **Structural** | Entity scores, metrics, rankings | Stored on Entity |
| **Relational** | Graph edges, relationship fields | Derived from domain |
| **Retrieval** | Search relevance, document match score | Ephemeral |
| **Temporal** | Timeline events, `validUntil` | Event-scoped |
| **Behavioral** | Saved command frequency, watchlist alerts | Memory |
| **Operational** | Agent success rate, module latency | Platform telemetry |

Only structural, relational, retrieval, and document signals may become evidence. Behavioral and operational signals influence routing and prioritization, not claim content.

---

### 6.2 Prioritization hierarchy

When signals conflict for attention or evidence selection, apply this order:

```
1. Human-authored intelligence (T4)
2. Security / compliance signals (hard gate)
3. Graph-validated relational evidence
4. Document evidence with verified provenance
5. Entity profile signals (scores, aiSummary)
6. Search retrieval matches
7. Agent-generated provisional outputs
8. Behavioral / usage signals (routing only)
```

---

### 6.3 Query-intent signal weighting

Reasoning and search apply intent-specific boosts (conceptual; aligned with Domain Model query classification):

| Intent | Primary entity focus | Signal boost |
|--------|---------------------|--------------|
| Investment | Country, Investor | `investmentScore`, GDP, opportunities |
| Partnership | University, Company | `research-partner` edges, programs |
| Comparative | Multi-entity | Balanced relevance across set |
| Competitive | Company | `competitor` edges, market metrics |
| Academic | University | `researchStrength`, ranking |
| General | Highest relevance | Neutral weighting |

---

### 6.4 Signal saturation

When evidence count exceeds useful threshold (default: 12 items), prioritize:

1. Highest relevance
2. Strongest provenance
3. Most recent
4. Greatest graph path diversity (prefer evidence from multiple edge types)

Excess signals are retained in trace for audit but not displayed by default.

---

### 6.5 Signal suppression

Signals are suppressed (excluded from evidence) when:

- Source is marked `offline` or `error` in knowledge health
- Entity status is `archived` or `inactive`
- User or policy excludes a collection or entity type
- Security Agent blocks source pending review
- Signal duplicates stronger evidence already in set

Suppression is logged in reasoning trace — silent suppression is prohibited.

---

## 7. Contradiction Resolution

Contradictions are **first-class events**, not errors to hide. CBAI surfaces disagreement and resolves it through defined rules.

### 7.1 Contradiction definition

A **contradiction** exists when two evidence items or intelligence products about the same subject entity (or relationship) support incompatible claims with relevance ≥ 40 each.

Examples:
- Entity A's `riskScore` implies low risk; document evidence cites regulatory investigation
- Graph says Company X partners with Y; another source lists X and Y as competitors
- Two documents in the same collection give different revenue figures

---

### 7.2 Contradiction detection triggers

| Trigger | Scope |
|---------|-------|
| New document indexed | Document vs entity profile |
| Entity domain data update | New domain field vs saved intelligence |
| Graph edge re-derivation | Edge type conflict (partner vs competitor) |
| Multi-agent outputs | Agent A vs Agent B on same question |
| Human override | Human claim vs system intelligence |
| Periodic re-evaluation | Stale intelligence vs fresh evidence |

---

### 7.3 Resolution strategies (ordered)

Apply strategies in order until contradiction is resolved or escalated:

| Priority | Strategy | Action |
|----------|----------|--------|
| 1 | **Recency precedence** | Prefer most recently retrieved verified source |
| 2 | **Provenance precedence** | Prefer verified > curated > aggregated > unverified |
| 3 | **Graph validation** | Prefer claim supported by graph path over orphan text |
| 4 | **Corroboration count** | Prefer claim with more independent supporting sources |
| 5 | **Human adjudication** | Escalate to analyst when strategies 1–4 tie or all sources are equal tier |
| 6 | **Coexistence with caveat** | Present both claims with contradiction flag when adjudication deferred |

**Rule:** Never silently discard the losing side — both sides appear in audit trace.

---

### 7.4 Contradiction states

| State | Meaning |
|-------|---------|
| `none` | No contradiction detected |
| `detected` | Contradiction identified; resolution in progress |
| `resolved-auto` | Resolved by strategy 1–4 |
| `resolved-human` | Human adjudication completed |
| `deferred` | Coexistence with caveat; both claims visible |
| `unresolvable` | Insufficient data to resolve; intelligence capped at T1 |

---

### 7.5 Impact on confidence and trust

| Contradiction state | Confidence cap | Trust cap |
|--------------------|----------------|-----------|
| `none` | Full band | Full tier |
| `detected` | 64 | T1 |
| `deferred` | 74 | T2 |
| `resolved-auto` | Restored per evidence | Restored per rules |
| `resolved-human` | Set by human | T4 for chosen claim |
| `unresolvable` | 41 | T0–T1 |

---

## 8. Reasoning Verification

Reasoning verification ensures the inference pipeline produced a **valid, reproducible, and auditable** intelligence product.

### 8.1 Verification definition

**Reasoning verification** is the process of confirming that each stage in an inference pipeline executed correctly, consumed the expected inputs, and produced outputs consistent with ontology and evidence rules.

Verification is distinct from human review (Section 13). Verification is **structural**; review is **judgmental**.

---

### 8.2 Pipeline verification checkpoints

#### CBAI Core pipeline (command orchestration)

| Stage | Verification check |
|-------|-------------------|
| Input | Command parsed; intent class assigned |
| Planner | Agent routing justified; entity refs resolved |
| Research | Retrieved data bound to entities |
| Knowledge | Memory and document context cited |
| Reasoning | Evidence set non-empty for factual claims |
| Output | Response references source entities |
| Action | Action permitted by trust tier and policy |

#### Reasoning Engine pipeline (structured inference)

| Stage | Verification check |
|-------|-------------------|
| Question | Intent classified; subject scope defined |
| Search | Results returned from unified entity index |
| Knowledge Graph | Traversal from matched entities; paths logged |
| Evidence | Items meet minimum count and relevance floor |
| Reasoning | Analysis references only collected evidence |
| Decision | Tree paths reproducible from inputs |
| Confidence | Factors sum correctly; band matches evidence |
| Final Answer | Cites entities; includes caveats when confidence < 65 |

---

### 8.3 Reproducibility requirement

Given identical inputs at time T:

- Entity index snapshot
- Graph snapshot
- Memory context
- Query string

The Reasoning Engine must produce **structurally equivalent** outputs: same evidence set (order may vary), same decision tree shape, same confidence band (±2 points tolerance for non-deterministic model backends).

Mock implementations must be fully deterministic. Production model stages must log seeds and model version.

---

### 8.4 Verification failure types

| Failure | Severity | Response |
|---------|----------|----------|
| Missing evidence for factual claim | Critical | Block delivery; return insufficient evidence |
| Stage skipped | Critical | Block delivery; log pipeline error |
| Entity ref unresolved | High | Degrade confidence; caveat required |
| Graph path invalid | High | Remove invalid evidence; recompute |
| Confidence miscalculation | Medium | Recompute; log correction |
| Missing caveat on low confidence | Medium | Append mandatory caveat |
| Non-critical formatting error | Low | Deliver with warning in trace |

---

### 8.5 Audit trace requirements

Every verified reasoning run produces an audit trace containing:

- Query and timestamp
- Stage sequence with durations
- Input snapshots (entity IDs, graph edge IDs, memory entry IDs)
- Evidence item IDs and sources
- Decision tree with outcomes
- Confidence factors with scores
- Producer identity (engine version, agent ID, model ID)
- Verification result (pass / fail / degraded)
- Human override record (if any)

Traces are tenant-scoped and retained per organizational policy (minimum 90 days normative for enterprise).

---

## 9. Memory Interaction

Memory shapes future intelligence without replacing the evidence requirement.

### 9.1 Memory definition (intelligence context)

In CBAI, **memory** is persistent organizational context — pinned knowledge, conversation history, saved commands, entity watchlists, and saved intelligence — that is injected into inference pipelines to improve relevance and continuity.

Memory is not model fine-tuning. Memory is not evidence unless re-validated and linked to entities at inference time.

---

### 9.2 Memory categories

| Category | Intelligence role |
|----------|-------------------|
| **Pinned knowledge** | Biases Knowledge stage retrieval toward user-trusted documents |
| **Conversation history** | Provides discourse context; entities mentioned become implicit subjects |
| **Saved commands** | Templates that pre-configure intent and entity scope |
| **Entity watchlists** | Triggers re-evaluation when watched entities change |
| **Saved intelligence** | Prior verified conclusions available for reference (not auto-truth) |
| **Reasoning traces** | Audit and re-run inputs for reproducibility |

---

### 9.3 Memory read rules

| Rule ID | Rule |
|---------|------|
| **M1** | Memory reads occur in CBAI Core Knowledge stage and Reasoning Engine Question/Evidence stages |
| **M2** | Memory content does not automatically become evidence — must pass evidence binding rules |
| **M3** | Pinned knowledge elevates document retrieval priority, not confidence directly |
| **M4** | Saved intelligence referenced in new runs starts at its stored trust tier, subject to freshness check |
| **M5** | Memory is tenant-scoped — no cross-organization reads |
| **M6** | Memory context appears in reasoning trace for audit |

---

### 9.4 Memory write rules

| Rule ID | Rule |
|---------|------|
| **M7** | Agents cannot write memory without explicit user action or automation policy |
| **M8** | All memory entries must link to at least one entity ID or document ID |
| **M9** | Human override of intelligence may optionally write corrected intelligence to memory as T4 |
| **M10** | Users can inspect, edit, and delete memory from settings |
| **M11** | Deleting memory does not delete audit traces |

---

### 9.5 Memory vs Knowledge module

| Layer | Owns | Feeds |
|-------|------|-------|
| **Knowledge module** | Document collections, indexing, source health | Search, evidence (`document` source class), graph (future) |
| **CBAI Core memory** | Operational context, pins, history, watchlists | Command pipeline, agent context |

Knowledge provides **corpus**. Memory provides **context**. Intelligence requires both optionally, evidence mandatorily.

---

## 10. Knowledge Graph Interaction

The Knowledge Graph is the **relational evidence layer** — it validates and enriches intelligence about how entities connect.

### 10.1 Graph role in intelligence

| Function | Description |
|----------|-------------|
| **Grounding** | Confirms entities exist and are typed correctly |
| **Relational evidence** | Edge paths become evidence items with `knowledge-graph` source |
| **Connectivity signal** | Path count and diversity feed confidence factor |
| **Contradiction detection** | Conflicting edge types or missing expected paths trigger review |
| **Scope expansion** | Traversal discovers related entities not in original query |

---

### 10.2 Graph traversal rules for inference

| Rule ID | Rule |
|---------|------|
| **G1** | Traversal starts from search-matched entities (seed nodes) |
| **G2** | Maximum hop depth: 2 for default inference; 3 for explicit relationship queries |
| **G3** | Edge types are filtered by query intent (e.g. competitive queries prefer `competitor` edges) |
| **G4** | Each traversed edge produces one evidence item with `relationshipLabel` |
| **G5** | Undirected edges (`partner`, `competitor`) may be traversed from either node |
| **G6** | Directed edges (`located-in`, `investment`) respect subject → object semantics |
| **G7** | Unresolved name refs in domain data do not produce graph evidence |

---

### 10.3 Graph confidence contribution

Graph connectivity confidence factor measures:

- Count of distinct edge types supporting the claim
- Count of independent paths between subject entities
- Presence of bidirectional corroboration (A→B and B→A evidence)
- Alignment between graph path and document/ profile evidence

Isolated entity with no edges: graph factor contributes minimum score; relational claims require explicit caveat.

---

### 10.4 Graph stalemate

**Graph stalemate** occurs when traversal finds no paths between entities central to the query.

| Response | Action |
|----------|--------|
| Comparative query | Deliver with caveat; confidence capped at 64 |
| Relational query | State relationship unverified; suggest data enrichment |
| Single-entity query | Proceed on profile evidence only |

---

### 10.5 Future graph capabilities (intelligence impact)

| Capability | Intelligence effect |
|------------|---------------------|
| Temporal edges (`validFrom`, `validTo`) | Freshness-aware relational evidence |
| Edge confidence weights | Weighted graph connectivity factor |
| Provenance on edges | Source trust inheritance for relational claims |
| Virtual nodes (industry, event) | Broader scope expansion with typed evidence |

---

## 11. Multi-Agent Collaboration

Intelligence in CBAI often emerges from **multiple agents** coordinated by the CBAI Core planner — not from a single monolithic model.

### 11.1 Collaboration model

```
User Command
     │
     ▼
CBAI Core Planner ──► decomposes into subtasks
     │
     ├──► Research Agent ──► entity intelligence (T1–T2)
     ├──► Knowledge Agent ──► document evidence (T2)
     ├──► Market Agent ──► signal detection (T1–T2)
     ├──► Strategy Agent ──► synthesis & scenarios (T1–T2)
     └──► Reasoning Engine ──► structured verification (T1–T3)
              │
              ▼
     Merged Intelligence Product
     (with per-agent contributions in trace)
```

---

### 11.2 Agent collaboration patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| **Sequential** | Agent B consumes Agent A output | Research → Strategy |
| **Parallel** | Multiple agents on same query; results merged | Research + Market on country analysis |
| **Validation** | Reasoning Engine verifies agent claims | Strategy recommendation → Reasoning evidence check |
| **Escalation** | Security Agent blocks or pauses others | Compliance flag on automation |
| **Human gate** | Automation Agent waits for approval | Workflow trigger at T3 |

---

### 11.3 Merge rules

When multiple agents contribute to one intelligence product:

| Rule ID | Rule |
|---------|------|
| **MA1** | Each agent contribution logged separately in trace |
| **MA2** | Conflicting agent outputs trigger contradiction flow (Section 7) |
| **MA3** | Merged confidence cannot exceed lowest unresolved contributor confidence |
| **MA4** | Merged trust tier = min(agent trust tiers) unless human elevates |
| **MA5** | Reasoning Engine merge takes precedence for evidence binding |
| **MA6** | Security Agent veto overrides all other agents |

---

### 11.4 Agent scope boundaries

Agents operate on **entity domains**, not free text:

| Agent | Entity scope | May not |
|-------|--------------|---------|
| Research | Country, Company | Write memory silently |
| Strategy | Country, Company, Investor | Trigger automation without gate |
| Knowledge | Documents | Modify entity domain data |
| Market | Company, Country | Override Security blocks |
| Automation | Workflows | Produce intelligence above T1 without review |
| Security | Platform (cross-cutting) | Produce strategic recommendations |

---

### 11.5 Cost and observability

Multi-agent intelligence must expose:

- Per-agent token and compute cost
- Per-agent duration and success/failure
- Agent version and policy applied
- Roll-up to Dashboard and Analytics

Cost does not affect confidence; it affects operational trust for automation budgeting.

---

## 12. Explainability Rules

Explainability is not a feature — it is a **requirement for intelligence legitimacy**.

### 12.1 Explainability definition

An intelligence product is **explainable** if a qualified human can answer, within one interaction depth:

1. What is the conclusion?
2. What entities are involved?
3. What evidence supports it?
4. How was it inferred (stages, agents, graph paths)?
5. How confident should I be?
6. What could be wrong (caveats)?
7. Can I override it?

---

### 12.2 Mandatory disclosure elements

Every intelligence surface must expose:

| Element | Minimum content |
|---------|-----------------|
| **Conclusion** | Final answer or aiSummary text |
| **Subjects** | Linked entity names and types |
| **Evidence** | At least top 3 evidence items with source class |
| **Confidence** | Score + band label + factor breakdown |
| **Caveats** | Explicit limitations when confidence < 85 or contradiction deferred |
| **Producer** | Reasoning Engine, agent name, or human |
| **Trace access** | Path to full stage/agent trace |

---

### 12.3 Explainability rules

| Rule ID | Rule |
|---------|------|
| **X1** | Black-box answers are prohibited in all intelligence surfaces |
| **X2** | Confidence must display factor breakdown on request (expand, not hide) |
| **X3** | Graph paths shown as human-readable edge sequences |
| **X4** | Document evidence must show collection name and excerpt |
| **X5** | Agent contributions individually attributed |
| **X6** | Caveats mandatory when evidence count below sufficiency threshold |
| **X7** | "AI generated" label required on aiSummary and model-produced text |
| **X8** | Explainability depth scales with trust tier — T3 requires full trace access |

---

### 12.4 Prohibited patterns

| Pattern | Why prohibited |
|---------|----------------|
| Confidence without evidence | Misleading |
| Answer without entity link | Ungrounded |
| Hidden agent failure in merge | Audit violation |
| Presenting mock inference as live data without label | Deceptive (allowed in demo with disclosure) |
| Collapsing contradiction into single answer | Epistemic dishonesty |

---

### 12.5 Explainability for non-experts

Executive-facing intelligence must include:

- One-sentence headline conclusion
- Confidence band in plain language ("well-supported", "preliminary")
- Top caveat in plain language
- Recommended next action or verification step

Technical trace remains available but not required for initial consumption.

---

## 13. Human Override Rules

Human judgment is the **highest trust tier** and the ultimate correction mechanism.

### 13.1 Override definition

A **human override** is an explicit action by an authorized user that modifies, rejects, supersedes, or replaces system-generated intelligence.

Overrides are intelligence events — they are logged, attributed, and persisted.

---

### 13.2 Override types

| Type | Action | Resulting trust |
|------|--------|-----------------|
| **Correction** | User edits claim text | T4 human-authored |
| **Rejection** | User marks intelligence invalid | `rejected` state; removed from active use |
| **Supersession** | User provides alternative conclusion | New T4 intelligence; old → `superseded` |
| **Flag** | User requests re-verification | `flagged` state; confidence capped |
| **Approval** | User confirms system intelligence | Elevates to T3 authoritative |
| **Policy block** | User disables automation on topic | Agent/action gate |

---

### 13.3 Override authority

| Role (future RBAC) | Permitted overrides |
|--------------------|---------------------|
| Analyst | Flag, request re-run |
| Senior analyst | Correction, supersession on T1–T2 |
| Admin | All overrides; memory delete |
| Executive | Approval for T3 automation triggers |
| Security officer | Policy block; agent pause |

Current platform: all authenticated users (future) treated as analyst minimum.

---

### 13.4 Override rules

| Rule ID | Rule |
|---------|------|
| **H1** | Override requires authenticated identity (future) |
| **H2** | Override reason text required for correction and rejection |
| **H3** | Override supersedes system intelligence on same subject scope |
| **H4** | Override does not delete audit trace of original |
| **H5** | Agents must not auto-revert human T4 intelligence without new human action |
| **H6** | Security Agent may block override if compliance violation detected |
| **H7** | Override triggers optional memory write (M9) |

---

### 13.5 Override and regeneration

After override:

- System may re-run pipeline with override as human-input evidence
- Re-run must not silently discard override
- If re-run contradicts override, contradiction flow applies with human-input at T4

Human T4 wins unless user explicitly requests system re-evaluation.

---

## 14. Intelligence Quality Metrics

Quality metrics measure whether the intelligence **system** is performing — not whether individual predictions came true.

### 14.1 Quality dimensions

| Dimension | Metric | Target direction |
|-----------|--------|------------------|
| **Grounding rate** | % intelligence products with ≥1 entity link | ↑ 100% |
| **Evidence coverage** | Mean evidence items per product | ↑ ≥ 3 |
| **Confidence calibration** | Alignment of confidence band with human approval rate | ↑ stable |
| **Contradiction resolution time** | Mean time from `detected` to `resolved` | ↓ |
| **Override rate** | % system intelligence overridden by humans | ↓ (but non-zero) |
| **Stale intelligence rate** | % active intelligence past validity horizon | ↓ |
| **Explainability completeness** | % products with full mandatory disclosure | ↑ 100% |
| **Trace completeness** | % reasoning runs with full audit trace | ↑ 100% |
| **Graph validation rate** | % relational claims with graph evidence | ↑ |
| **Source diversity** | Mean distinct evidence source classes per product | ↑ ≥ 2 for T3 |

---

### 14.2 Quality bands (system health)

| Band | Grounding | Evidence avg | Trace complete | Override rate |
|------|-----------|--------------|----------------|---------------|
| Healthy | ≥ 99% | ≥ 3.5 | ≥ 99% | 5–15% |
| Watch | 95–98% | 2.5–3.4 | 95–98% | 15–25% |
| Degraded | < 95% | < 2.5 | < 95% | > 25% |

Override rate near zero suggests rubber-stamping or no human review — also unhealthy.

---

### 14.3 Per-module quality signals

| Module | Key quality metric |
|--------|-------------------|
| Global Search | Zero-result rate on entity queries |
| Knowledge Graph | Edge resolution rate (domain ref → node) |
| Reasoning Engine | Verification pass rate |
| Knowledge | Collection index freshness, source health |
| Agents | Task success rate, merge contradiction rate |
| Memory | Orphan entry rate (entries without entity link) |

---

### 14.4 Quality reporting

Analytics and Dashboard surfaces should expose:

- Intelligence products generated (count, by type)
- Mean confidence by intent class
- Contradiction backlog
- Quality band indicator
- Agent contribution breakdown

Quality metrics are operational intelligence about the platform — they follow explainability rules but use operational trust tiers.

---

## 15. Failure Handling

Intelligence systems fail. CBAI defines **graceful epistemic failure** — fail informatively, never confidently wrong.

### 15.1 Failure categories

| Category | Example | User-facing response |
|----------|---------|---------------------|
| **Insufficient data** | Zero search results | "Insufficient evidence"; suggest broader query |
| **Pipeline error** | Stage crash | "Reasoning unavailable"; log trace; no fake answer |
| **Source offline** | Knowledge collection degraded | Caveat; exclude offline source; reduce confidence |
| **Graph stalemate** | No paths found | Caveat; profile-only intelligence |
| **Agent failure** | Research Agent error | Partial merge; attribute failure in trace |
| **Contradiction unresolved** | Equal-weight conflict | Present both; cap trust at T1 |
| **Policy block** | Security Agent veto | Clear block reason; no intelligence delivered |
| **Timeout** | Pipeline exceeds limit | Return partial trace; confidence capped |
| **Stale intelligence** | Expired product requested | Label stale; offer regeneration |

---

### 15.2 Failure response rules

| Rule ID | Rule |
|---------|------|
| **F1** | Never synthesize high-confidence intelligence to mask failure |
| **F2** | Never return empty UI without explanation |
| **F3** | Partial results must label what failed and what succeeded |
| **F4** | Failed runs still produce audit trace |
| **F5** | Retry is user-initiated or policy-automated — not silent infinite loop |
| **F6** | Mock/demo mode failures must be distinguishable from production failures |
| **F7** | Security failures are not retriable without Security clearance |

---

### 15.3 Degradation ladder

When components fail, intelligence degrades in order:

```
Full pipeline (all stages)
  → Skip graph (profile + search only)
    → Skip agents (Reasoning Engine only)
      → Search retrieval only (no synthesis — not intelligence)
        → Explicit failure message
```

Each degradation step reduces maximum trust tier by one level and adds mandatory caveat.

---

### 15.4 Recovery procedures

| Failure | Recovery |
|---------|----------|
| Insufficient data | Broaden query; add entity types; index new documents |
| Source offline | Restore source; re-index; re-run |
| Agent failure | Retry agent; escalate to alternate agent |
| Contradiction | Human adjudication |
| Stale intelligence | Regenerate from current snapshots |
| Pipeline error | Engineering investigation; trace analysis |

---

## 16. Future AI Evolution

This section defines how the Intelligence Specification evolves as AI capabilities advance — without abandoning epistemic foundations.

### 16.1 Evolution principles

| Principle | Statement |
|-----------|-----------|
| **Evidence permanence** | Better models do not eliminate evidence requirement |
| **Trust human gate** | Higher automation requires higher verification, not lower |
| **Trace permanence** | Every generation must remain auditable regardless of model |
| **Graceful model swap** | Model upgrades change producer metadata, not intelligence schema |
| **Anti-autonomy drift** | Agents gain capability, not authority, without policy |

---

### 16.2 Evolution phases

| Phase | Timeframe | Intelligence capability | Specification impact |
|-------|-----------|------------------------|---------------------|
| **Phase 1** | 2026 (current) | Mock reasoning; static evidence; deterministic confidence | Baseline v1 |
| **Phase 2** | 2027 | Model-generated reasoning constrained by evidence objects | Add model provenance to trace; probability for scenarios |
| **Phase 3** | 2028 | Live ingestion; temporal graph; persistent intelligence store | Freshness rules enforced; edge provenance |
| **Phase 4** | 2029 | Multi-tenant production; RBAC; automation triggers | Full trust tier enforcement; override RBAC |
| **Phase 5** | 2030+ | Autonomous monitoring agents; predictive intelligence | New intelligence type rules; calibration metrics |
| **Phase 6** | 2031 | Federated intelligence across org boundaries | Cross-tenant trust boundaries; shared ontology |

---

### 16.3 Model integration rules (Phase 2+)

When LLM or other model backends generate reasoning text:

| Rule | Requirement |
|------|-------------|
| **Model as producer** | Model ID, version, and prompt hash in trace |
| **Evidence-constrained generation** | Model may only cite collected evidence IDs |
| **Hallucination guard** | Post-generation verification: every entity mention must resolve in index |
| **Confidence separation** | Model self-reported certainty ignored; platform confidence computed from evidence |
| **Human review default** | First N deployments of new model require approval before T3 |

---

### 16.4 Predictive intelligence (Phase 5)

Forward-looking claims require additional disclosure:

- Explicit "predictive" classification
- Scenario branches (optimistic / base / pessimistic)
- Probability ranges (not point estimates) when quantified
- Shorter validity horizon than descriptive intelligence
- Cannot exceed T2 without human review

---

### 16.5 Autonomous agents (Phase 5)

Agents that act without per-action human approval must:

- Operate only on T3+ intelligence
- Log every action with intelligence ID reference
- Support instant human kill switch via Security Agent
- Respect cost and rate limits
- Never modify entity domain data or graph directly

---

### 16.6 Specification versioning

| Change type | Version action |
|-------------|----------------|
| New evidence source class | Minor revision (v1.1) |
| Confidence factor weight change | Minor revision with migration note |
| New trust tier | Major revision (v2) |
| Removal of evidence requirement | **Prohibited** without platform mission change |
| New intelligence type | Minor revision |
| Override of human T4 precedence | **Prohibited** |

---

## Appendix A — Intelligence vs Related Concepts

| Term | CBAI definition |
|------|-----------------|
| Data | Raw field values in domain modules |
| Information | Structured, retrievable data without inference |
| Knowledge | Indexed documents + organizational memory |
| Intelligence | Evidence-backed, scored, explainable, governed conclusion |
| Wisdom | Human judgment applied after intelligence review (outside platform scope) |

---

## Appendix B — Cross-Reference to Domain Model

| Domain Model concept | Intelligence Spec section |
|---------------------|---------------------------|
| Entity | §1 grounding; §3 evidence binding |
| Universal scores | §1.5 signals; §4 confidence factor |
| Graph edges | §10 relational evidence |
| Reasoning pipeline stages | §8 verification |
| Agent catalog | §11 collaboration |
| Ontology rules E1–E7, I1–I6 | §1, §3, §8, §12 |
| Memory (Constitution §11) | §9 |

---

## Appendix C — Glossary

| Term | Definition |
|------|------------|
| **Claim** | The proposition intelligence asserts |
| **Caveat** | Explicit limitation on claim validity |
| **Corroboration** | Independent evidence supporting same claim |
| **Epistemic** | Relating to knowledge and justified belief |
| **Grounding** | Binding intelligence to ontology objects |
| **Inference** | Deriving claim from evidence via reasoning |
| **Provenance** | Origin chain of data or evidence |
| **Stalemate** | Graph or evidence deadlock |
| **Trace** | Audit record of pipeline execution |
| **Unverified Output** | Model or system text failing intelligence criteria |

---

## Appendix D — Document Governance

| Event | Action |
|-------|--------|
| New evidence source class | §3 amendment; minor version bump |
| Trust tier change | §5 amendment; major version if semantics change |
| Confidence formula change | §4 amendment; document migration impact |
| New agent collaboration pattern | §11 amendment |
| Failure category added | §15 amendment |
| Conflict with Domain Model | Domain Model wins on ontology; this spec wins on epistemics |

**Hierarchy:**
1. Constitution — mission and architecture principles
2. Domain Model — what exists (ontology)
3. **Intelligence Specification — what it means to know (epistemology)**
4. Implementation — code expressing both

---

*CBAI Intelligence Specification v1 — the scientific definition of Intelligence inside the Global AI Operating System.*  
*Ratified as part of BUILD-020. No application code changes.*
