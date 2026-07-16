/**
 * CBAI Interface Principles — Universal Intelligence Operating System.
 *
 * Not a website. Not a dashboard. A living intelligence environment.
 * Every surface must answer the eight product-truth questions.
 */

export const CBAI_INTERFACE_PRINCIPLES = [
  {
    id: "operating-state-first",
    title: "Operating State First",
    statement: "Lead with real mission, project, and evidence state — never slogans or marketing.",
  },
  {
    id: "mission-center",
    title: "Mission Center",
    statement: "Home is where ongoing intelligence work continues — not a landing page.",
  },
  {
    id: "operator-presence",
    title: "Operator Presence",
    statement: "One calm intelligence presence — not a chatbot card, mascot, or duplicate surfaces.",
  },
  {
    id: "capability-not-title",
    title: "Capability Not Title",
    statement: "Adapt by demonstrated work and current mission — never profession or diploma.",
  },
  {
    id: "evidence-honesty",
    title: "Evidence Honesty",
    statement: "Every claim shows source, status, and gaps — or is labeled unavailable.",
  },
  {
    id: "human-decision-boundary",
    title: "Human Decision Boundary",
    statement: "The system assists and navigates; humans decide. Unknowns stay visible.",
  },
  {
    id: "calm-precision",
    title: "Calm Precision",
    statement: "Deep navy, restrained emerald, mineral surfaces — alive without visual noise.",
  },
  {
    id: "one-grammar",
    title: "One Operating Grammar",
    statement: "Every route shares context, scope, evidence state, Operator access, and return path.",
  },
] as const;

export type CbaiInterfacePrincipleId = (typeof CBAI_INTERFACE_PRINCIPLES)[number]["id"];
