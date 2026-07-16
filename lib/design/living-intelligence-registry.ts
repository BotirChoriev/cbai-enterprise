/**
 * EPIC-13.2/13.3 — Living Intelligence component registry with Experience Engineering fields.
 */

export type LivingIntelligenceComponentRecord = {
  readonly id: string;
  readonly path: string;
  readonly purpose: string;
  readonly meaning: string;
  readonly interaction: string;
  readonly evidence: string;
  readonly attention: string;
  readonly cognitiveLoad: string;
  readonly motion: string;
  readonly memory: string;
  readonly humanControl: string;
  readonly accessibility: string;
  readonly constitutionAlignment: readonly string[];
};

export const LIVING_INTELLIGENCE_REGISTRY: readonly LivingIntelligenceComponentRecord[] = [
  {
    id: "global-mission-context-bar",
    path: "components/operating/GlobalMissionContextBar.tsx",
    purpose: "Mission Gravity 2.0 — invisible center; mission problem is the primary visible anchor.",
    meaning: "Why the user is here — not which page they opened.",
    interaction: "Read-only mission anchor; return path when away from Mission Space.",
    evidence: "Mission store and evidence pulse.",
    attention: "Single mission line draws primary focus.",
    cognitiveLoad: "No competing navigation labels at top.",
    motion: "None.",
    memory: "Mission persists across all spaces.",
    humanControl: "Human problem statement remains primary.",
    accessibility: "Header landmark; truncated text with title tooltips.",
    constitutionAlignment: ["operating-state-first", "mission-center", "one-grammar"],
  },
  {
    id: "mental-model-strip",
    path: "components/operating/MentalModelStrip.tsx",
    purpose: "Answer six mental model questions on every route.",
    meaning: "Where, why, happening, unfinished, next, changed.",
    interaction: "Read-only orientation strip; one next-action link.",
    evidence: "mental-model.ts, living-memory.ts, intelligence-flow.ts.",
    attention: "Guides to single next action — not ten equal buttons.",
    cognitiveLoad: "Compact grid; hides unchanged fields when empty.",
    motion: "None.",
    memory: "Surfaces what changed since last session snapshot.",
    humanControl: "User chooses whether to follow next link.",
    accessibility: "Definition list semantics; readable at mobile 2-column grid.",
    constitutionAlignment: ["one-grammar", "human-decision-boundary"],
  },
  {
    id: "ambient-intelligence-hint",
    path: "components/operating/AmbientIntelligenceHint.tsx",
    purpose: "One ambient insight with explained reason — never interruptive.",
    meaning: "System quietly notices gaps worth human attention.",
    interaction: "Optional link to honest remediation route.",
    evidence: "ambient-intelligence.ts from evidence pulse, impact, capability.",
    attention: "Maximum one insight globally.",
    cognitiveLoad: "Single line — message plus because.",
    motion: "None.",
    memory: "None — derived fresh each render.",
    humanControl: "Insight suggests; never auto-acts.",
    accessibility: "role=note; link is optional.",
    constitutionAlignment: ["operator-presence", "evidence-honesty"],
  },
  {
    id: "ambient-trust-strip",
    path: "components/operating/AmbientTrustStrip.tsx",
    purpose: "Trust visible everywhere — confidence, limitations, review state.",
    meaning: "Ambient trust without opening Trust page.",
    interaction: "Read-only status strip.",
    evidence: "Evidence pulse consensus and human impact store.",
    attention: "Subtle tertiary band — does not compete with mission.",
    cognitiveLoad: "Three short labels only.",
    motion: "None.",
    memory: "None.",
    humanControl: "Limitations always visible.",
    accessibility: "role=status.",
    constitutionAlignment: ["evidence-honesty", "human-decision-boundary"],
  },
  {
    id: "living-context-rail",
    path: "components/operating/LivingContextRail.tsx",
    purpose: "Ambient context — memory, focused flow, discovery explanation.",
    meaning: "Environment remembers and guides without noise.",
    interaction: "Scrollable aside; focused flow shows current ±1 stage only.",
    evidence: "living-context-memory.ts, deriveFocusedFlow, adaptive intelligence.",
    attention: "Sequential flow links — not full wizard.",
    cognitiveLoad: "Removed duplicate mission/evidence/operator blocks.",
    motion: "None in rail.",
    memory: "Recent study and return continuity.",
    humanControl: "Human Decision Boundary at terminus.",
    accessibility: "Aside landmark; keyboard links.",
    constitutionAlignment: ["evidence-honesty", "capability-not-title"],
  },
  {
    id: "knowledge-universe-views",
    path: "components/graph/KnowledgeUniverseViews.tsx",
    purpose: "Views into one shared universe — not separate features.",
    meaning: "Mission, evidence, relationships are lenses on same graph.",
    interaction: "Three view toggles plus capability link.",
    evidence: "Graph mission focus modes — real filtered nodes.",
    attention: "One active view at a time.",
    cognitiveLoad: "Three choices — not ten.",
    motion: "None.",
    memory: "Focus mode in component state only.",
    humanControl: "User selects view explicitly.",
    accessibility: "nav landmark; aria-pressed on toggles.",
    constitutionAlignment: ["one-grammar", "calm-precision"],
  },
  {
    id: "living-memory-control",
    path: "components/operating/LivingMemoryControl.tsx",
    purpose: "User-owned session memory control — not surveillance.",
    meaning: "Memory belongs to the user.",
    interaction: "Clear session flow snapshots in Settings.",
    evidence: "living-memory.ts sessionStorage only.",
    attention: "Settings-only — never interrupts work.",
    cognitiveLoad: "One button with honest explanation.",
    motion: "None.",
    memory: "Clears flow snapshot; does not delete projects.",
    humanControl: "Explicit user action required.",
    accessibility: "Button with descriptive text.",
    constitutionAlignment: ["human-decision-boundary"],
  },
  {
    id: "mobile-intelligence-shell",
    path: "components/operating/MobileIntelligenceShell.tsx",
    purpose: "Mobile Intelligence Mode — sequential, calm, not shrunk desktop.",
    meaning: "Focused operating mode for small viewports.",
    interaction: "CSS wrapper only — no separate route.",
    evidence: "globals.css mobile intelligence rules.",
    attention: "Single column content first.",
    cognitiveLoad: "Reduced grid columns on mental model strip.",
    motion: "None.",
    memory: "Same session memory as desktop.",
    humanControl: "Same human boundaries as desktop.",
    accessibility: "Responsive layout; context drawer preserved.",
    constitutionAlignment: ["calm-precision", "one-grammar"],
  },
] as const;
