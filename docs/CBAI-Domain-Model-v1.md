# CBAI Domain Model v1

**Document ID:** CBAI-Domain-Model-v1  
**Platform:** CBAI Enterprise — Global AI Operating System  
**Status:** Semantic foundation — ratified  
**Effective:** July 2026  
**Horizon:** 2026–2031  
**Companion documents:** `docs/CBAI-Constitution-v1.md`, `docs/build-018-architecture-audit.md`

This document defines **how CBAI models the world** — the entities, relationships, scores, graph semantics, reasoning layers, and agent responsibilities that form the platform's ontology. All domain modules, adapters, graph builders, search indexes, and reasoning engines must conform to this model.

Code expresses this model. This document **is** the model.

---

## 1. Purpose and Scope

CBAI does not store unstructured facts. It stores **typed intelligence objects** (entities) connected by **typed relationships** (edges), scored by **normalized signals**, traversed by **graph logic**, and interpreted through **layered reasoning pipelines** executed or supervised by **governed AI agents**.

The domain model answers:

| Question | Answered by |
|----------|-------------|
| What exists in the world? | Entity taxonomy (Section 2) |
| How are things connected? | Relationship ontology (Section 3) |
| How capable or risky is something? | Intelligence scores (Section 4) |
| How does the graph represent connections? | Graph edge types (Section 5) |
| How does CBAI think? | Reasoning layers (Section 6) |
| Who acts on intelligence? | AI agent responsibilities (Section 7) |
| What comes next? | Future expansion (Section 8) |
| How are things named? | Naming conventions (Section 9) |
| What rules govern the ontology? | Ontology rules (Section 10) |

---

## 2. Entity Taxonomy

### 2.1 Universal Entity

Every intelligence object in CBAI normalizes to **Entity** — the single consumption shape for UI, search, graph, and reasoning.

```
Entity {
  id              Domain-scoped unique identifier
  type            EntityType (ontology class)
  name            Canonical display name
  category        Primary classification label
  subtitle        Secondary context line (location, sector, role)
  overview        Human-readable summary paragraph
  aiSummary       AI-generated intelligence brief
  status          Lifecycle state (active, monitoring, …)
  scores          Normalized intelligence scores (3)
  tags            Named labels with semantic variants
  timeline        Ordered intelligence events
  metrics         Quantitative KPIs with optional change signals
  metadata        Structured key-value profile fields
  icon            Short code or initials for display
  logo            Optional image URL
}
```

**Rule:** No intelligence module renders domain-specific detail without passing through `Entity`. Domain types (`Country`, `Company`, `University`, …) are authoring shapes; `Entity` is the runtime shape.

---

### 2.2 Entity types

| EntityType | Label | Status | Module route | Graph node |
|------------|-------|--------|--------------|------------|
| `country` | Country | **Active** — 6 instances | `/countries` | Yes |
| `company` | Company | **Active** — 8 instances | `/companies` | Yes |
| `university` | University | **Active** — 8 instances | `/universities` | Yes |
| `government` | Government | **Declared** — no module yet | — | Planned |
| `investor` | Investor | **Declared** — no module yet | — | Planned |
| `person` | Person | **Declared** — no module yet | — | Planned |

**Total active entities (current):** 22  
**Total declared types:** 6

---

### 2.3 Entity: Country

**Ontology class:** Sovereign geographic-economic intelligence unit.

**Domain type:** `Country` (`lib/countries.ts`)

| Field | Type | Semantic meaning |
|-------|------|------------------|
| `id` | string | Stable slug (e.g. `usa`, `uzbekistan`) |
| `name` | string | Official country name |
| `code` | string | ISO-style two-letter code |
| `region` | CountryRegion | Macro-geographic grouping |
| `gdp` | string | Economic scale indicator |
| `population` | string | Demographic scale indicator |
| `capital` | string | Administrative capital |
| `government` | string | Government system description |
| `economy` | string | Economic profile narrative |
| `aiReadiness` | number | Domain AI readiness (maps → `aiScore`) |
| `investmentScore` | number | Domain investment attractiveness |
| `riskScore` | number | Domain risk exposure |
| `topIndustries` | string[] | Primary economic sectors |
| `universities` | string[] | Notable academic institutions (name refs) |
| `technologyLevel` | string | Technology maturity classification |
| `businessOpportunities` | string[] | Identified opportunity areas |
| `aiSummary` | string | AI intelligence brief |

**Region enum:** `Americas` · `Asia` · `Europe` · `Middle East`

**Current instances:** United States, China, Uzbekistan, Germany, UAE, Japan

**Entity adapter mapping highlights:**
- `category` ← economy summary (truncated) or region context
- `aiScore` ← `aiReadiness`
- `subtitle` ← `{capital} · {region}`
- Metadata: region, capital, gdp, population, government, technologyLevel

---

### 2.4 Entity: Company

**Ontology class:** Commercial organization intelligence unit.

**Domain type:** `Company` (`lib/companies.ts`)

| Field | Type | Semantic meaning |
|-------|------|------------------|
| `id` | string | Stable slug (e.g. `apple`, `nvidia`) |
| `name` | string | Legal or brand name |
| `icon` | string | Ticker-style display code |
| `country` | string | Country of domicile (name ref) |
| `ceo` | string | Chief executive |
| `founded` | number | Year established |
| `employees` | number | Workforce size |
| `revenue` | string | Annual revenue |
| `marketCap` | string | Market capitalization |
| `industry` | string | Primary industry sector |
| `products` | string[] | Key product lines |
| `aiReadiness` | number | AI capability (maps → `aiScore`) |
| `innovationScore` | number | Innovation output signal |
| `investmentScore` | number | Investment attractiveness |
| `riskScore` | number | Business/regulatory risk |
| `technologyLevel` | string | Technology maturity |
| `relationships` | CompanyRelationships | Typed relationship refs |
| `overview` | string | Company profile narrative |
| `aiSummary` | string | AI intelligence brief |

**Industry enum (current):** Technology, Consumer Electronics, Automotive, E-Commerce, Artificial Intelligence, Semiconductors

**Current instances:** Apple, Microsoft, Google, NVIDIA, Tesla, Amazon, OpenAI, Samsung

**Entity adapter mapping highlights:**
- `category` ← `industry`
- `aiScore` ← `aiReadiness`
- `subtitle` ← `{country} · Est. {founded}`
- Tags ← `products`
- Metadata includes `innovationScore` as supplementary signal

---

### 2.5 Entity: University

**Ontology class:** Academic and research institution intelligence unit.

**Domain type:** `University` (`lib/universities.ts`)

| Field | Type | Semantic meaning |
|-------|------|------------------|
| `id` | string | Stable slug (e.g. `stanford`, `tuit`) |
| `name` | string | Institution name |
| `icon` | string | Display initials |
| `country` | string | Country of location (name ref) |
| `city` | string | City location |
| `founded` | number | Year established |
| `students` | number | Enrollment |
| `faculty` | number | Faculty count |
| `type` | UniversityType | Institutional classification |
| `ranking` | number | Global ranking position |
| `researchStrength` | number | Research output signal |
| `aiReadiness` | number | AI research capability (maps → `aiScore`) |
| `innovationScore` | number | Innovation transfer signal |
| `investmentScore` | number | Investment/partnership attractiveness |
| `riskScore` | number | Institutional/geopolitical risk |
| `technologyLevel` | string | Technology maturity |
| `topPrograms` | string[] | Flagship academic programs |
| `researchAreas` | string[] | Primary research domains |
| `relationships` | UniversityRelationships | Typed relationship refs |
| `overview` | string | Institution profile narrative |
| `aiSummary` | string | AI intelligence brief |

**Type enum:** `Public` · `Private` · `Research`

**Current instances:** Stanford, MIT, Harvard, Oxford, Cambridge, TUIT, NUUz, KAIST

**Entity adapter mapping highlights:**
- `category` ← `type`
- `aiScore` ← `aiReadiness`
- `subtitle` ← `{city}, {country}`
- Tags ← `topPrograms`
- Metadata includes `researchStrength`, `innovationScore`

---

### 2.6 Entity: Government (planned)

**Ontology class:** State apparatus, ministry, or regulatory body intelligence unit.

**Anticipated domain fields:**

| Field | Semantic meaning |
|-------|------------------|
| `id` | Stable slug |
| `name` | Official body name |
| `type` | Federal, state, ministry, agency, regulator |
| `country` | Jurisdiction (entity ref → country) |
| `jurisdiction` | Scope of authority |
| `policyAreas` | Domains of governance |
| `budget` | Allocated resources |
| `technologyLevel` | Digital/govtech maturity |
| `relationships` | GovernmentRelationships |

**Graph role:** Bridge between country macro-intelligence and policy/regulatory edges to companies, universities, and investors.

**Adapter rule:** `aiScore` ← govtech/AI adoption readiness; `riskScore` ← political/regulatory volatility; `investmentScore` ← public investment attractiveness for PPP and infrastructure.

---

### 2.7 Entity: Investor (planned)

**Ontology class:** Capital deployment organization intelligence unit.

**Anticipated domain fields:**

| Field | Semantic meaning |
|-------|------------------|
| `id` | Stable slug |
| `name` | Fund or institution name |
| `type` | VC, PE, sovereign wealth, angel, corporate venture |
| `country` | Primary domicile |
| `aum` | Assets under management |
| `focusSectors` | Investment thesis sectors |
| `portfolioSize` | Active holdings count |
| `stagePreference` | Seed, growth, late-stage |
| `relationships` | InvestorRelationships |

**Graph role:** Source of `investment` edges to companies and countries; recipient of `located-in` edges.

---

### 2.8 Entity: Person (planned)

**Ontology class:** Individual intelligence unit — executive, researcher, policymaker, founder.

**Anticipated domain fields:**

| Field | Semantic meaning |
|-------|------------------|
| `id` | Stable slug |
| `name` | Full name |
| `role` | Primary professional role |
| `affiliations` | Org refs (company, university, government) |
| `expertise` | Domain specialties |
| `country` | Primary location |
| `relationships` | PersonRelationships |

**Graph role:** Human connectors between organizations — `leads`, `founded`, `advises`, `research-at` edges.

**Privacy rule:** Person entities require explicit consent and data minimization policies before production ingestion.

---

### 2.9 Entity lifecycle (status)

| EntityStatus | Meaning |
|--------------|---------|
| `active` | Fully tracked, current intelligence |
| `monitoring` | Watched with elevated alert sensitivity |
| `pending` | Ingestion/verification in progress |
| `inactive` | No longer actively tracked |
| `archived` | Historical record, excluded from default search |

**Default for mock data:** `active`

---

## 3. Relationship Ontology

Relationships exist at two levels: **domain relationship fields** (module-specific, string refs) and **graph edges** (typed, normalized). Domain fields are the source of truth; graph edges are derived.

### 3.1 Relationship reference rules

| Rule | Description |
|------|-------------|
| **R1** | Domain relationships store human-readable name refs resolved at graph-build time |
| **R2** | Name matching is fuzzy: exact, substring, or normalized token match |
| **R3** | Duplicate edges of the same type between the same pair are deduplicated |
| **R4** | Edges are undirected for display unless type implies direction (see Section 5) |
| **R5** | Future: edges carry `validFrom`, `validTo`, `source`, `confidence` metadata |

---

### 3.2 Country relationships

**Type:** `CountryRelationships`

| Field | Target type | Semantic meaning |
|-------|-------------|------------------|
| `relatedCompanies` | Company (name) | Companies with significant presence or investment in country |
| `universities` | University (name) | Leading academic institutions in country |
| `government` | Government (string desc) | Government system (pre-government entity: descriptive string) |
| `industries` | Industry (string) | Top economic sectors — not entity refs |

**Supplementary domain field:** `businessOpportunities[]` — opportunity intelligence, not graph edges.

---

### 3.3 Company relationships

**Type:** `CompanyRelationships`

| Field | Target type | Semantic meaning |
|-------|-------------|------------------|
| `competitors` | Company (name) | Direct market competitors |
| `partners` | Company (name) | Strategic or technology partners |
| `relatedCountries` | Country (name) | Countries of operation or strategic interest |
| `relatedUniversities` | University (name) | Academic research partners |

---

### 3.4 University relationships

**Type:** `UniversityRelationships`

| Field | Target type | Semantic meaning |
|-------|-------------|------------------|
| `industryPartners` | Company (name) | Industry collaboration partners |
| `relatedCompanies` | Company (name) | Affiliated or spinout companies |
| `relatedCountries` | Country (name) | Countries of strategic research interest |

**Supplementary domain field:** `researchAreas[]` — research domain tags, not entity refs.

---

### 3.5 Planned relationship types

| Relationship | Subject → Object | Graph edge (planned) |
|--------------|------------------|----------------------|
| Government jurisdiction | Government → Country | `governs` |
| Policy influence | Government → Company | `regulates` |
| Investment | Investor → Company | `investment` |
| Investment | Investor → Country | `investment` |
| Portfolio | Investor → Company | `portfolio-holding` |
| Leadership | Person → Company | `leads` |
| Foundership | Person → Company | `founded` |
| Research affiliation | Person → University | `research-at` |
| Advisory | Person → Government | `advises` |
| Alumni | Person → University | `alumni-of` |

---

### 3.6 Relationship cardinality

| Pattern | Cardinality | Example |
|---------|-------------|---------|
| Company ↔ Company (partner/competitor) | Many-to-many | Apple ↔ Google |
| Company → Country (located-in) | Many-to-one | Apple → United States |
| University → Country (located-in) | Many-to-one | MIT → United States |
| Country → Company (investment) | One-to-many | USA → Apple, Microsoft, … |
| University ↔ Company (research-partner) | Many-to-many | Stanford ↔ Google |
| Country → University (research-partner) | One-to-many | USA → MIT, Stanford, … |

---

## 4. Intelligence Scores

### 4.1 Universal score model

Every Entity exposes exactly three normalized scores on a **0–100 integer scale**:

| Score key | Label | Direction | Meaning |
|-----------|-------|-----------|---------|
| `aiScore` | AI Score | Higher is better | AI readiness, capability, and adoption potential |
| `investmentScore` | Investment Score | Higher is better | Attractiveness for capital deployment and strategic investment |
| `riskScore` | Risk Score | **Lower is better** (inverted in UI) | Exposure to geopolitical, operational, regulatory, and market risk |

**Rule:** All entity types use these three scores. Domain-specific signals (e.g. `innovationScore`, `researchStrength`) live in `metadata` or `metrics` — they do not replace universal scores.

---

### 4.2 Domain-to-Entity score mapping

| Entity type | `aiScore` source | `investmentScore` source | `riskScore` source |
|-------------|------------------|--------------------------|-------------------|
| Country | `aiReadiness` | `investmentScore` | `riskScore` |
| Company | `aiReadiness` | `investmentScore` | `riskScore` |
| University | `aiReadiness` | `investmentScore` | `riskScore` |
| Government (planned) | govtech readiness | public investment score | political risk |
| Investor (planned) | AI portfolio maturity | deployment capacity | portfolio risk |
| Person (planned) | AI influence score | network capital score | reputational risk |

---

### 4.3 Score interpretation bands

| Range | AI Score | Investment Score | Risk Score |
|-------|----------|------------------|------------|
| 85–100 | Frontier leader | Highly attractive | Minimal risk |
| 70–84 | Advanced | Attractive | Low-moderate risk |
| 50–69 | Developing | Moderate | Moderate risk |
| 30–49 | Emerging | Caution | Elevated risk |
| 0–29 | Nascent | Low priority | High risk |

UI color thresholds are centralized in `entity.helpers.ts` (`getScoreColor`, `getScoreBarColor`). Inverted rendering applies only to `riskScore`.

---

### 4.4 Supplementary signals (non-universal)

These appear in domain models and Entity metadata/metrics but are **not** graph-weighted universal scores:

| Signal | Entity types | Purpose |
|--------|--------------|---------|
| `innovationScore` | Company, University | Innovation output intensity |
| `researchStrength` | University | Research output quality |
| `ranking` | University | Global academic rank |
| `technologyLevel` | Country, Company, University | Qualitative maturity label |
| `relevanceScore` | Search results | Query match strength (ephemeral) |
| `confidence` | Reasoning results | Inference quality (ephemeral) |

---

### 4.5 Search relevance scoring

Global Search computes ephemeral `relevanceScore` (not stored on Entity):

| Match type | Weight |
|------------|--------|
| Exact name match | +100 |
| Name starts with token | +80 |
| Name contains token | +60 |
| Tag match | +40 |
| Category match | +25 |
| Overview match | +20 |
| AI summary match | +15 |
| Metadata match | +10 |
| AI score boost | +`aiScore × 0.05` |

---

## 5. Knowledge Graph Edge Types

### 5.1 Node model

```
GraphNode {
  id        "{type}:{entityId}"     e.g. "company:nvidia"
  entityId  Domain id
  type      GraphNodeType
  label     Display name
  entity    Full Entity payload
  x, y      Layout coordinates
}
```

**Active GraphNodeTypes:** `country` · `company` · `university`

**Node ID convention:** `{entityType}:{domainId}` — globally unique across the graph.

---

### 5.2 Edge type catalog

| Edge type | Label | Direction | Derivation rule |
|-----------|-------|-----------|-----------------|
| `located-in` | Located In | Entity → Country | Company.country or University.country matches Country.name |
| `partner` | Partner | Company ↔ Company | Company.relationships.partners |
| `competitor` | Competitor | Company ↔ Company | Company.relationships.competitors |
| `research-partner` | Research Partner | University ↔ Company, Country ↔ University | University industryPartners/relatedCompanies; Company relatedUniversities; Country universities list |
| `industry` | Industry | Company → Country | Company.industry ∈ Country.topIndustries AND company domiciled in country |
| `investment` | Investment | Country → Company | Country adapter relatedCompanies map |

---

### 5.3 Edge semantics

#### `located-in`
- **Meaning:** Legal or operational domicile of an organization within a sovereign territory.
- **Subject types:** Company, University (future: Investor, Government office)
- **Object type:** Country
- **Directionality:** Directed (organization → country)

#### `partner`
- **Meaning:** Declared strategic, technology, or commercial partnership between companies.
- **Subject types:** Company
- **Object types:** Company
- **Directionality:** Undirected (symmetric)

#### `competitor`
- **Meaning:** Direct market competition relationship.
- **Subject types:** Company
- **Object types:** Company
- **Directionality:** Undirected (symmetric)

#### `research-partner`
- **Meaning:** Academic-industry or country-academic research collaboration.
- **Subject types:** University, Company, Country
- **Object types:** Company, University
- **Directionality:** Context-dependent; stored as discovered pair

#### `industry`
- **Meaning:** Company's primary industry aligns with country's dominant economic sectors.
- **Subject types:** Company
- **Object types:** Country
- **Directionality:** Directed (company → country sector alignment)

#### `investment`
- **Meaning:** Country-level investment interest or significant corporate presence mapped to national investment profile.
- **Subject types:** Country
- **Object types:** Company
- **Directionality:** Directed (country → company)

---

### 5.4 Planned edge types

| Edge type | Meaning | Priority |
|-----------|---------|----------|
| `governs` | Government body has jurisdiction over territory | Phase 2 |
| `regulates` | Government regulates industry/company | Phase 2 |
| `portfolio-holding` | Investor holds equity in company | Phase 2 |
| `leads` | Person holds executive role at organization | Phase 3 |
| `founded` | Person founded organization | Phase 3 |
| `research-at` | Person affiliated with university | Phase 3 |
| `advises` | Person advises government or board | Phase 3 |
| `alumni-of` | Person graduated from university | Phase 3 |
| `subsidiary-of` | Company owned by company | Phase 3 |
| `supplies` | Company in supply chain relationship | Phase 4 |

**Rule:** New edge types require updates to `graph.types.ts`, `graph.mock.ts` (visual config), `graph.builder.ts` (derivation), and `GraphLegend.tsx`.

---

### 5.5 Graph layout tiers

| Ring | Entity type | Semantic position |
|------|-------------|-------------------|
| Inner | Country | Macro context — geographic/economic anchor |
| Middle | Company | Market layer — commercial intelligence |
| Outer | University | Knowledge layer — research and talent |

Future types: Government (inner-middle), Investor (middle), Person (outer or force-directed cluster).

---

## 6. Reasoning Layers

CBAI operates two complementary pipeline architectures. They are related but serve different scopes.

### 6.1 CBAI Core pipeline (command orchestration)

**Scope:** General command processing from AI Control and CBAI Core.  
**Source:** `lib/core.ts` → `pipelineStages`

| Stage | ID | Function |
|-------|-----|----------|
| 1 | `input` | Receive and parse natural language command |
| 2 | `planner` | Decompose task, classify intent, route to agents |
| 3 | `research` | Gather external and internal data |
| 4 | `knowledge` | RAG retrieval from knowledge base and pinned context |
| 5 | `reasoning` | Multi-step inference over retrieved evidence |
| 6 | `output` | Synthesize human-readable response |
| 7 | `action` | Execute workflows, write memory, trigger agents |

**Semantic role:** This is the **operating system scheduler** — it decides what to do, not necessarily how to prove it.

---

### 6.2 Reasoning Engine pipeline (explainable inference)

**Scope:** Structured intelligence queries over the entity index and knowledge graph.  
**Source:** `lib/reasoning/reasoning.types.ts` → `REASONING_STAGE_ORDER`

| Stage | ID | Function | Data consumed |
|-------|-----|----------|---------------|
| 1 | Question | Parse and classify intelligence query | User input |
| 2 | Search | Retrieve matching entities from global index | `searchEntities()` |
| 3 | Knowledge Graph | Traverse relationships from matched entities | `buildKnowledgeGraph()` |
| 4 | Evidence | Collect and rank supporting evidence items | Search matches, graph paths, entity profiles |
| 5 | Reasoning | Apply multi-factor analysis across entity signals | Evidence set |
| 6 | Decision | Evaluate decision tree paths, select outcome | Reasoning output |
| 7 | Confidence | Compute weighted confidence from evidence quality | All prior stages |
| 8 | Final Answer | Synthesize conclusion and recommended actions | Decision + confidence |

**Semantic role:** This is the **epistemic engine** — it proves what it claims with evidence, graph paths, and confidence scores.

---

### 6.3 Evidence model

```
EvidenceItem {
  id                  Unique evidence identifier
  entity              Source Entity
  source              "search" | "knowledge-graph" | "entity-profile"
  relevance           0–100 relevance score
  excerpt             Human-readable evidence text
  relationshipLabel   Optional graph edge label
}
```

| Evidence source | Origin |
|-----------------|--------|
| `search` | Global Search match reason |
| `entity-profile` | Entity aiSummary or overview |
| `knowledge-graph` | Traversed edge path between entities |

**Rule:** Reasoning without evidence is invalid. Empty search results produce empty evidence and low confidence.

---

### 6.4 Confidence model

Confidence is a **weighted composite of evidence quality**, not predictive certainty.

| Factor | Weight | Measures |
|--------|--------|----------|
| Evidence Volume | 0.25 | Count of evidence items collected |
| Source Relevance | 0.25 | Average relevance score across evidence |
| Graph Connectivity | 0.25 | Number of validated graph relationship paths |
| Entity Signal Quality | 0.25 | Average AI score of top matched entities |

**Output range:** 42–98 (clamped). Scores below 42 indicate insufficient evidence; above 98 reserved for near-complete evidence coverage.

---

### 6.5 Decision tree model

```
DecisionNode {
  id            Unique node identifier
  label         Decision point name
  description   Evaluation detail
  outcome       "selected" | "rejected" | "neutral"
  children      Nested decision nodes
}
```

**Standard decision path:**
1. Query Classification → entity domain focus
2. Entity Focus → primary entity identified
3. Evidence Threshold → minimum evidence met
4. Graph Validation → relationships cross-confirmed
5. Final Decision → recommended answer

---

### 6.6 Query classification intents

| Intent class | Trigger keywords | Primary entity focus |
|--------------|------------------|---------------------|
| `investment` | country, investment, economy, gdp | Country |
| `partnership` | partner, research, collaborat | University, Company |
| `comparative` | compare, versus, vs | Multi-entity |
| `competitive` | competitor, rival | Company |
| `academic` | university, academic | University |
| `general` | (default) | Highest search relevance |

---

### 6.7 Layer interaction diagram

```
User Query
    │
    ├─► CBAI Core Pipeline (broad commands)
    │       Input → Planner → [Agent dispatch]
    │                         │
    │                         ▼
    └─► Reasoning Engine (entity queries)     AI Agents (specialized execution)
            Question → Search → Graph → Evidence → Reasoning → Decision → Confidence → Answer
                │         │        │                                          │
                └─────────┴────────┴──── Entity Framework ◄───────────────────┘
                                    │
                              Knowledge Graph
```

---

## 7. AI Agent Ecosystem

### 7.1 Agent model

```
Agent {
  id              Stable slug
  name            Display name
  description     Capability summary
  status          active | idle | paused | error
  tasksCompleted  Lifetime task count
  successRate     Percentage success
  lastRun         Relative timestamp
}
```

Agents are **specialized workers** dispatched by the CBAI Core planner. They operate on entities, not free text.

---

### 7.2 Agent catalog and responsibilities

| Agent ID | Name | Primary responsibility | Entity domains | Core capabilities |
|----------|------|------------------------|----------------|-------------------|
| `research` | Research Agent | Country analysis, market research, competitive intelligence | Country, Company | Macro analysis, market sizing, competitor mapping, region reports |
| `strategy` | Strategy Agent | Business strategy, scenario modeling, recommendations | Country, Company, Investor | SWOT, scenario planning, roadmap generation, strategic options |
| `knowledge` | Knowledge Agent | Document summarization, RAG retrieval, organizational memory | Knowledge (documents) | Index search, summarization, citation, pinned knowledge management |
| `automation` | Automation Agent | Workflow creation, task orchestration, process automation | Workflow (platform) | Workflow design, deployment, scheduling, human-in-the-loop gates |
| `market` | Market Agent | Trend monitoring, competitor tracking, expansion opportunities | Company, Country | Signal detection, competitor alerts, market entry scoring |
| `security` | Security Agent | AI interaction audit, anomaly detection, compliance enforcement | Platform (cross-cutting) | Policy audit, access review, anomaly flagging, compliance reports |

---

### 7.3 Agent responsibility matrix

| Task type | Primary agent | Supporting agents |
|-----------|---------------|-----------------|
| "Analyze {country}" | Research | Strategy, Market |
| "Compare {A} and {B}" | Research | Strategy |
| "Generate business strategy" | Strategy | Research, Market |
| "Summarize document" | Knowledge | — |
| "Monitor competitors" | Market | Research |
| "Create workflow" | Automation | — |
| "Audit compliance" | Security | Knowledge |
| "Find investment opportunities" | Market | Research, Strategy |
| Entity graph traversal | — (Reasoning Engine) | Research |
| Structured Q&A with evidence | — (Reasoning Engine) | Knowledge |

---

### 7.4 Agent governance rules

| Rule | Description |
|------|-------------|
| **A1** | All agent dispatch routes through AI Control / CBAI Core planner |
| **A2** | Agents resolve entity references via Global Search before execution |
| **A3** | Agents produce entity-tagged outputs where applicable |
| **A4** | Agents cannot write organizational memory without explicit user action or policy |
| **A5** | Agents operate with least-privilege tool access |
| **A6** | Security Agent can pause or block other agents |
| **A7** | Agent cost and token usage roll up to Dashboard and Analytics |

---

### 7.5 Agent status semantics

| Status | Meaning |
|--------|---------|
| `active` | Running or ready to accept tasks |
| `idle` | Available but not currently processing |
| `paused` | Administratively suspended |
| `error` | Failed state requiring intervention |

---

## 8. Future Entity Expansion

### 8.1 Expansion sequence (Constitution-aligned)

| Phase | Entity types | Graph integration | Search integration |
|-------|--------------|-------------------|-------------------|
| **Phase 1** (complete) | Country, Company, University | 6 edge types | 22 entities indexed |
| **Phase 2** | Government, Investor | + governs, regulates, portfolio-holding, investment | + gov/investor index |
| **Phase 3** | Person | + leads, founded, research-at, advises, alumni-of | + person index |
| **Phase 4** | Industry (virtual), Product, Event | + supplies, produces, affects | Typed virtual nodes |

---

### 8.2 Expansion checklist (mandatory per new entity type)

1. Define domain type in `lib/{module}.ts`
2. Define adapter in `lib/{module}.adapter.ts` with `to{Module}Entity()`
3. Map all three universal scores with documented source fields
4. Define `{Module}Relationships` type with named refs
5. Add route at `/app/(dashboard)/{module}/page.tsx`
6. Add sidebar entry in `lib/navigation.ts`
7. Extend `GraphNodeType` and graph builder edge rules
8. Extend `getAllEntities()` in global search
9. Extend reasoning engine entity resolution
10. Update this document (Domain Model version bump)

---

### 8.3 Virtual entity types (future consideration)

| Virtual type | Purpose |
|--------------|---------|
| `industry` | Sector-level intelligence node aggregating companies/countries |
| `event` | Time-bound intelligence (policy change, acquisition, election) |
| `document` | Knowledge module artifact linked to entities |
| `workflow` | Automation artifact linked to agents |

Virtual entities may not have full EntityLayout pages but appear as graph nodes and evidence sources.

---

## 9. Naming Conventions

### 9.1 Entity identifiers

| Rule | Convention | Example |
|------|------------|---------|
| Domain ID | lowercase slug, no spaces | `usa`, `nvidia`, `stanford` |
| Graph node ID | `{type}:{domainId}` | `country:usa`, `company:nvidia` |
| Entity type | lowercase singular enum | `country`, `company`, `university` |
| Display name | Canonical proper name | `United States`, `NVIDIA`, `Stanford University` |
| Icon code | Uppercase abbreviation | `US`, `NVDA`, `SU` |

**Rule:** Domain IDs are immutable once published. Display names may update without ID change.

---

### 9.2 Relationship references

| Context | Convention | Example |
|---------|------------|---------|
| Domain relationship fields | Canonical entity name (string) | `"Apple"`, `"United States"` |
| Graph edge endpoints | Resolved to graph node IDs | `company:apple` → `country:usa` |
| Edge type | kebab-case enum | `located-in`, `research-partner` |
| Edge label | Title Case human label | `Located In`, `Research Partner` |

---

### 9.3 File and module naming

| Artifact | Pattern | Example |
|----------|---------|---------|
| Domain data | `lib/{plural}.ts` | `lib/countries.ts` |
| Adapter | `lib/{plural}.adapter.ts` | `lib/countries.adapter.ts` |
| Components | `components/{plural}/` | `components/countries/` |
| Route | `app/(dashboard)/{plural}/` | `app/(dashboard)/countries/` |
| Graph types | `lib/graph/graph.types.ts` | — |
| Reasoning types | `lib/reasoning/reasoning.types.ts` | — |

---

### 9.4 Score and metric naming

| Layer | Convention | Example |
|-------|------------|---------|
| Universal scores | camelCase on Entity | `aiScore`, `riskScore`, `investmentScore` |
| Domain scores | camelCase on domain type | `aiReadiness`, `innovationScore` |
| Metric IDs | camelCase slug | `marketCap`, `researchStrength` |
| Metadata keys | camelCase | `technologyLevel`, `founded` |

---

### 9.5 Agent naming

| Rule | Convention | Example |
|------|------------|---------|
| Agent ID | lowercase slug | `research`, `strategy` |
| Agent name | `{Role} Agent` | `Research Agent` |
| Activity action | Verb phrase | `Country analysis completed` |

---

## 10. Ontology Rules

These rules govern how the domain model behaves. Violations require Domain Model version amendment.

### 10.1 Entity rules

| ID | Rule |
|----|------|
| **E1** | Every intelligence object MUST normalize to Entity before UI, search, graph, or reasoning consumption |
| **E2** | Every Entity MUST expose all three universal scores (0–100) |
| **E3** | Entity type enum is closed — new types require Domain Model version bump |
| **E4** | Domain data is authored in module files; Entity is never authored directly |
| **E5** | Entity IDs are unique within type, not globally — global uniqueness is `{type}:{id}` |
| **E6** | Entity status defaults to `active` unless explicitly set |
| **E7** | AI summaries (`aiSummary`) are intelligence products, not source data — they may be regenerated |

---

### 10.2 Relationship rules

| ID | Rule |
|----|------|
| **R1** | Domain relationship fields are the source of truth for graph edge derivation |
| **R2** | Graph edges MUST NOT be authored independently of domain data (no parallel edge stores) |
| **R3** | Name-based refs MUST resolve to entities via normalized matching — unresolved refs are silently omitted from graph |
| **R4** | Symmetric relationships (partner, competitor) are stored once and rendered undirected |
| **R5** | Directed relationships (located-in, investment) have explicit subject → object semantics |
| **R6** | Future temporal edges MUST include validity period metadata |

---

### 10.3 Score rules

| ID | Rule |
|----|------|
| **S1** | All scores are integers 0–100 inclusive |
| **S2** | `riskScore` is the only inverted score in UI (lower is better) |
| **S3** | Domain-specific scores (innovation, research) MUST NOT replace universal scores |
| **S4** | Search relevance and reasoning confidence are ephemeral — never persisted on Entity |
| **S5** | Score changes trigger timeline events when backend ingestion is live |

---

### 10.4 Graph rules

| ID | Rule |
|----|------|
| **G1** | Graph is derived at build/query time from adapters — not manually edited |
| **G2** | Node ID format is always `{type}:{entityId}` |
| **G3** | Edge type enum is closed — new types require Domain Model version bump |
| **G4** | Graph builder is the single edge derivation authority |
| **G5** | Layout positions are presentation concerns — not semantic data |
| **G6** | Graph supports extensible node types without changing KnowledgeGraph interface |

---

### 10.5 Reasoning rules

| ID | Rule |
|----|------|
| **I1** | Every reasoning result MUST include evidence items when search returns matches |
| **I2** | Confidence reflects evidence quality, not predictive accuracy |
| **I3** | Decision trees MUST be reproducible from the same inputs (deterministic mock, auditable live) |
| **I4** | Reasoning stages execute in fixed order — no stage skipping |
| **I5** | Final answers MUST cite source entities |
| **I6** | Reasoning Engine operates on Entity — never on raw domain types |

---

### 10.6 Agent rules

| ID | Rule |
|----|------|
| **A1** | Agents dispatch through CBAI Core planner — no direct page-level agent calls |
| **A2** | Agent scope is defined by entity domain access |
| **A3** | Agent outputs that reference entities MUST use entity IDs internally |
| **A4** | Security Agent has override authority over all other agents |

---

### 10.7 Cross-cutting ontology principles

| Principle | Statement |
|-----------|-------------|
| **Single source of truth** | One domain module per entity type; one adapter; one graph builder |
| **Derivation over duplication** | Search, graph, and reasoning derive from adapters — never duplicate entity arrays |
| **Typed over text** | Relationships are typed edges, not freeform strings (strings are authoring convenience) |
| **Evidence over assertion** | Every claim in reasoning output links to evidence |
| **Extensibility without breakage** | New entity types and edge types extend the model — they do not modify existing types |
| **Human-readable, machine-resolvable** | Names for humans; IDs for machines; graph node IDs bridge both |

---

## Appendix A — Current Entity Inventory

### Countries (6)

| ID | Name | Region | AI Score |
|----|------|--------|----------|
| usa | United States | Americas | 94 |
| china | China | Asia | 88 |
| uzbekistan | Uzbekistan | Asia | 62 |
| germany | Germany | Europe | 86 |
| uae | UAE | Middle East | 78 |
| japan | Japan | Asia | 90 |

### Companies (8)

| ID | Name | Industry | Country |
|----|------|----------|---------|
| apple | Apple | Technology | United States |
| microsoft | Microsoft | Technology | United States |
| google | Google | Technology | United States |
| nvidia | NVIDIA | Semiconductors | United States |
| tesla | Tesla | Automotive | United States |
| amazon | Amazon | E-Commerce | United States |
| openai | OpenAI | Artificial Intelligence | United States |
| samsung | Samsung | Consumer Electronics | South Korea |

### Universities (8)

| ID | Name | Type | Country |
|----|------|------|---------|
| stanford | Stanford University | Private | United States |
| mit | MIT | Private | United States |
| harvard | Harvard University | Private | United States |
| oxford | Oxford University | Public | United Kingdom |
| cambridge | Cambridge University | Public | United Kingdom |
| tuit | TUIT | Public | Uzbekistan |
| nuuz | NUUz | Public | Uzbekistan |
| kaist | KAIST | Research | South Korea |

---

## Appendix B — Edge Derivation Matrix

| Domain source | Edge type | From | To |
|---------------|-----------|------|-----|
| `company.country` | located-in | Company | Country |
| `university.country` | located-in | University | Country |
| `company.relationships.partners[]` | partner | Company | Company |
| `company.relationships.competitors[]` | competitor | Company | Company |
| `company.relationships.relatedUniversities[]` | research-partner | Company | University |
| `university.relationships.industryPartners[]` | research-partner | University | Company |
| `university.relationships.relatedCompanies[]` | research-partner | University | Company |
| `country.universities[]` (via adapter) | research-partner | Country | University |
| `country adapter relatedCompanies[]` | investment | Country | Company |
| `company.industry ∈ country.topIndustries` | industry | Company | Country |

---

## Appendix C — Document Governance

| Event | Action |
|-------|--------|
| New entity type added | Bump to v2, add Section 2 entry |
| New edge type added | Bump to v2, add Section 5 entry |
| Score model change | Bump to v2, update Section 4 |
| Agent added/removed | Update Section 7, no version bump required |
| Ontology rule change | Bump to v2, update Section 10 |

**Relationship to Constitution:** The Constitution governs *how we build*. The Domain Model governs *what we model*. Conflicts between code and this document require reconciliation — either fix code or amend this document.

---

*CBAI Domain Model v1 — semantic foundation for the Global AI Operating System.*  
*Ratified as part of BUILD-019. No application code changes.*
