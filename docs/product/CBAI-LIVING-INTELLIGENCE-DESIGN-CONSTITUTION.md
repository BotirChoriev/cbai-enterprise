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
