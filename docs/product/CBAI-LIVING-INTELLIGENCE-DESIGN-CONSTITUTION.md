# CBAI Living Intelligence Design Constitution

**Phase:** EPIC-13.2 — Living Intelligence Experience  
**Authority:** Extends `docs/standards/01-cbai-constitution.md` and `docs/standards/08-design-standard.md`  
**Scope:** Operating shell, context memory, flow, atmosphere, knowledge layers

---

## I. First Law

The interface must never ask *"What page am I on?"*  
It must answer *"What am I trying to accomplish?"*

Navigation organizes around **intention**, not routes. Intelligence Spaces name environments; mission problem is always visible.

---

## II. Component Declaration

Every operating component must declare:

| Field | Requirement |
|-------|-------------|
| **Purpose** | Why the component exists in one sentence |
| **Interaction** | What the user can do — honestly |
| **Evidence** | Which real stores or derivations feed it |
| **Meaning** | What intelligence it exposes |
| **Motion** | What state change motion communicates — or none |
| **Accessibility** | Landmarks, labels, keyboard, reduced motion |
| **Constitution alignment** | Which interface principles apply |
| **Human decision support** | How it preserves human responsibility |

Code registry: `lib/design/living-intelligence-registry.ts`

No anonymous UI. If a component cannot declare these fields, remove it.

---

## III. Mission Gravity

Mission is **gravity**, not a card. Every operating surface must acknowledge the active mission or honestly state that none exists.

Evidence, flow, capability, and context memory orbit mission state — never duplicate mission bars per page.

---

## IV. Intelligence Atmosphere

Each Intelligence Space may shift atmosphere subtly:

- Light (accent tint)
- Depth (background gradient weight)
- Focus (density)
- Spatial continuity (same building, different room)

Rules:

- No dramatic animation
- No decorative glow
- Respect `prefers-reduced-motion` and `.cbai-reduced-motion`
- Atmosphere tokens: `lib/intelligence-os/intelligence-atmosphere.ts`

---

## V. Context Memory

The environment remembers:

- Recently studied entities
- Last intelligence space visited
- Unfinished flow stage
- Legacy artifacts from real work

Memory derives from `living-context-memory.ts` — never fabricated activity.

---

## VI. Intelligence Flow

Canonical flow:

**Question → Research → Evidence → Reasoning → Validation → Impact → Legacy**

Derived from real mission and project artifacts via `intelligence-flow.ts`. Flow indicators show status — not gamification.

---

## VII. Knowledge Layers

Objects expose depth through progressive disclosure:

Surface → Summary → Evidence → Reasoning → History → Impact → Legacy

Use native `<details>` disclosure — no modal explosion. Empty layers must say data is unavailable, not hide the layer.

Component: `components/knowledge/KnowledgeLayersDisclosure.tsx`

---

## VIII. Capability Growth

Capability is **demonstrated**, never ranked.

- Show domain signals from real project work
- Show growth (new, growing, steady) from recent signal timestamps
- Never score humans
- Never global rank

---

## IX. Operator Presence

Operator speaks rarely. Visible intelligence:

- Contextual insight
- Evidence gap warning
- Missing knowledge hint
- Honest next action

Maximum two interventions in Living Context at once. No mascot behavior.

---

## X. Emotion

Communicate: **confidence, calmness, focus, clarity, purpose, hope.**

Never: excitement, hype, neon, rainbow, marketing copy.

---

## XI. Verification

Before merge:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- All Node test suites
- Browser regression
- Language sweep (EN/UZ/RU/TR)
- Reduced-motion guard on new animation

Test suite: `npm run test:epic-13-living-intelligence`

---

## XII. Relationship to EPIC-13

EPIC-13 established the spatial operating model. EPIC-13.2 deepens:

- Atmosphere differentiation
- Unified context memory
- Flow authority
- Knowledge layers
- Living capability growth
- Design constitution for operating components

Do not rebuild layout independently. Evolve within the existing grammar.

---

## XIII. Experience Engineering (EPIC-13.3)

Experience Engineering extends this constitution for human cognition, not UI decoration.

### Mental Model

Every route must answer:

1. Where am I?
2. Why am I here?
3. What is happening?
4. What remains unfinished?
5. What should I do next?
6. What changed?

Implementation: `MentalModelStrip` + `mental-model.ts`

### Cognitive Load

- One primary next action — never ten equal buttons
- Focused flow shows current stage ±1 only (`deriveFocusedFlow`)
- Default `OperatingPageShell` hides duplicate operator banner
- Ambient intelligence: maximum **one** global insight with **because** explanation

### Ambient Intelligence

Operator never interrupts. One insight when meaningful:

- Contradictory evidence
- Outdated evidence
- Impact not reviewed
- Missing expertise on mission
- Complementary discipline suggestion

Implementation: `ambient-intelligence.ts`, `AmbientIntelligenceHint`

### Ambient Trust

Trust visible without Trust page: confidence, limitations, review state.

Implementation: `AmbientTrustStrip`

### Living Memory

Session flow snapshots detect what changed. User clears memory in Settings — projects and mission are never deleted.

Implementation: `living-memory.ts`, `LivingMemoryControl`

### Scientific Workflow Flow

Question → Hypothesis → Evidence → Reasoning → Review → Impact → Publication → Legacy

Visible as flow indicators — not a wizard.

Implementation: `intelligence-flow.ts` (8 stages)

### Extended Component Declaration

Every operating component must now define:

| Field | Requirement |
|-------|-------------|
| Purpose | Why it exists |
| Meaning | What intelligence it exposes |
| Evidence | Real data sources |
| Attention | What it guides the eye toward |
| Cognitive Load | How it reduces unnecessary decisions |
| Motion | State-change motion only — or none |
| Memory | What it remembers — or none |
| Human Control | How human responsibility is preserved |
| Accessibility | Landmarks, keyboard, reduced motion |
| Constitution Alignment | Interface principle IDs |

Code registry: `lib/design/living-intelligence-registry.ts`

Test suite: `npm run test:epic-13-experience-engineering`

---

## XIV. Universal Workspace & Object-First Intelligence (EPIC-13.4)

The final experience architecture pass unifies Mission, Research, Evidence, Knowledge Universe, Reasoning, Impact, Reports, Entities, Trust, and Capability as **views into one Universal Workspace** — not separate product islands.

### Universal Workspace

Persistent composed state (sessionStorage):

- Active mission, object, project, scope
- Evidence count, impact status, report readiness
- Return path and last meaningful action

Implementation: `universal-workspace.ts`, `UniversalWorkspaceProvider`

Survives route changes, browser back, refresh, and language switching (same session).

### Object-First Interaction

Every primary object exposes a common contract via `resolveUniversalObject()`:

- Identity, type, purpose, state, mission relation
- Evidence, unknowns, trust, actions, limitations
- Progressive knowledge layers, human judgment flag

Types: mission, project, research_topic, evidence, country, company, university, report, question, relationship, capability_signal.

### Universal Inspector

One inspector grammar in the right context rail answers nine operating questions for any focused object.

Implementation: `UniversalInspector`, `OperatingContextColumn`

### Floating Intelligence Presence

Maximum **one** primary Operator intervention with full contract: observation, reason, evidence basis, limitation, suggested action, human decision boundary.

Implementation: `floating-intelligence.ts`, `FloatingIntelligencePresence`

Replaces duplicate ambient banners — not a fixed chatbot card.

### Adaptive Density

User-controlled modes: Focused, Standard (default), Expert.

Never gates access by capability, title, or prestige.

Implementation: `adaptive-density.ts`, `AdaptiveDensityControl`, `displayDensity` on AssistantProfile

### Knowledge River

Temporal events derived only from real evidence, questions, impact, report readiness, and legacy records — no fabricated events or progress scores.

Implementation: `knowledge-river.ts`, `KnowledgeRiver`

### Ambient Collaboration

Collaboration guidance explains expertise gaps and contributor roles without fake people, fake institutions, or implied availability.

Implementation: `ambient-collaboration.ts` (`externalMatchingConnected: false`)

### Mission Scale

Architecture boundaries only — no over-engineered multi-user infrastructure. Interface must not collapse as missions, evidence, and relationships grow.

### Extended Component Declaration (EPIC-13.4)

Every major operating component must also declare:

| Field | Requirement |
|-------|-------------|
| Object type | Which universal object(s) it serves |
| Mission relation | How it connects to active mission |
| Progressive depth | Surface → legacy disclosure pattern |
| Human decision support | Where human judgment is required |
| Failure state | Honest empty or blocked state |

Code registry: `lib/design/living-intelligence-registry.ts`

Test suite: `npm run test:epic-13-universal-workspace`

---

## XV. Organization Intelligence & Mission Collaboration (EPIC-05)

EPIC-05 prepares multi-organization intelligence architecture without fake collaboration, messaging, users, or cloud sync.

### Organization Intelligence

Organizations may be companies, universities, research centers, governments, hospitals, NGOs, startups, or independent laboratories. One organization model exposes identity, mission, knowledge, evidence, projects, people, capabilities, trust, reports, impact, and legacy pillars.

Implementation: `lib/organization-os/`

### Mission Collaboration

Mission is the collaboration space — the **Mission Room** holds discussion, evidence, questions, decisions, reports, impact, knowledge, and timeline. No generic chat rooms, Slack, Teams, or Discord patterns.

Implementation: `mission-room.ts`, `mission-discussion.types.ts`

### Knowledge Contribution

Explainable contribution types only — evidence review, question, reasoning, validation, methodology, research, teaching, mentoring, documentation, impact review. No points, rankings, or gamification.

Implementation: `knowledge-contribution.types.ts`

### Decision Memory

Decision Ledger stores decision, evidence, alternatives, reason, participants, human reviewer, impact, and review date. Architecture-only persistence until cloud auth (EPIC-15).

Implementation: `decision-ledger.types.ts`

### Capability Discovery

Knowledge DNA reflects demonstrated capability — never IQ, prestige, university, country, or title. Collaborator matching recommends **required capability only**, never people.

Implementation: `knowledge-dna.ts`, `capability-matching.ts`

Test suite: `npm run test:epic-05-organization-os`

