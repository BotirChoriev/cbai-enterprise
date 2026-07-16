/**
 * EPIC-13.2 — Living Intelligence component registry.
 * Every operating component declares purpose, evidence, and constitution alignment.
 */

export type LivingIntelligenceComponentRecord = {
  readonly id: string;
  readonly path: string;
  readonly purpose: string;
  readonly interaction: string;
  readonly evidence: string;
  readonly meaning: string;
  readonly motion: string;
  readonly accessibility: string;
  readonly constitutionAlignment: readonly string[];
  readonly humanDecisionSupport: string;
};

export const LIVING_INTELLIGENCE_REGISTRY: readonly LivingIntelligenceComponentRecord[] = [
  {
    id: "global-mission-context-bar",
    path: "components/operating/GlobalMissionContextBar.tsx",
    purpose: "Answer what the user is accomplishing — mission gravity at the top of every space.",
    interaction: "Read-only mission and space context; link back to Mission Space.",
    evidence: "Mission store, evidence pulse, intelligence space resolver.",
    meaning: "Mission is gravity — not a card.",
    motion: "Atmosphere CSS vars only — no decorative animation.",
    accessibility: "Header landmark with aria-label; truncated text with full title tooltips.",
    constitutionAlignment: ["operating-state-first", "mission-center", "one-grammar"],
    humanDecisionSupport: "Surfaces active mission problem — human intent stays primary.",
  },
  {
    id: "living-context-rail",
    path: "components/operating/LivingContextRail.tsx",
    purpose: "Living context — evolves from real mission, memory, flow, and operator awareness.",
    interaction: "Scrollable aside; operator interventions link to honest next actions.",
    evidence: "Living context memory, capability passport, evidence trust surface.",
    meaning: "Environment remembers — return feels like workspace continuity.",
    motion: "cbai-thought-enter for new operator insights only.",
    accessibility: "Aside landmark; aria-live operator strip; keyboard links.",
    constitutionAlignment: ["evidence-honesty", "operator-presence", "human-decision-boundary"],
    humanDecisionSupport: "Human Decision Boundary compact strip at flow terminus.",
  },
  {
    id: "continuity-timeline-strip",
    path: "components/operating/ContinuityTimelineStrip.tsx",
    purpose: "Evidence journey continuity — flow without page navigation.",
    interaction: "Horizontal stage links derived from real project state.",
    evidence: "deriveEvidenceJourney from project stores.",
    meaning: "Preserved continuity across intelligence spaces.",
    motion: "None — status color only.",
    accessibility: "Footer landmark; focus-visible on stage links.",
    constitutionAlignment: ["one-grammar", "evidence-honesty"],
    humanDecisionSupport: "Shows validation gaps before report readiness.",
  },
  {
    id: "capability-galaxy",
    path: "components/capability/CapabilityGalaxy.tsx",
    purpose: "Living capability — growth from real project work, never rank.",
    interaction: "Domain rings with growth indicators and recent activity.",
    evidence: "Capability passport builder and growth derivation.",
    meaning: "User understands how they grow — not where they rank.",
    motion: "None.",
    accessibility: "Section with heading; list semantics; title tooltips.",
    constitutionAlignment: ["capability-not-title", "evidence-honesty"],
    humanDecisionSupport: "Uncertainty notice — capability is demonstrated, not scored.",
  },
  {
    id: "knowledge-layers-disclosure",
    path: "components/knowledge/KnowledgeLayersDisclosure.tsx",
    purpose: "Progressive knowledge depth — surface through legacy without modal explosion.",
    interaction: "Native details/summary disclosure per layer.",
    evidence: "Graph evidence summary and entity registry data.",
    meaning: "Every object has layers of understanding.",
    motion: "None.",
    accessibility: "Expandable regions with visible labels; keyboard native.",
    constitutionAlignment: ["evidence-honesty", "calm-precision"],
    humanDecisionSupport: "Evidence and impact layers show gaps explicitly.",
  },
  {
    id: "intelligence-atmosphere-shell",
    path: "components/operating/IntelligenceAtmosphereShell.tsx",
    purpose: "Subtle environmental shift per intelligence space.",
    interaction: "Sets CSS atmosphere vars on space change; records visit for memory.",
    evidence: "intelligence-atmosphere.ts per-space tokens.",
    meaning: "Same building, different room — not another application.",
    motion: "cbai-space-enter on content only; reduced-motion guarded.",
    accessibility: "No motion-only information; atmosphere is color/depth only.",
    constitutionAlignment: ["calm-precision", "one-grammar"],
    humanDecisionSupport: "Focus weight increases in dense evidence spaces.",
  },
] as const;
