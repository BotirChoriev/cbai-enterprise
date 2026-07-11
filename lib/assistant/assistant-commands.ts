/**
 * Assistant command routing — a deterministic phrase-to-route table, not a reasoning engine.
 * Voice and typed input both resolve through this same matcher and land on the same real
 * routes as the sidebar; there is no separate AI, model, or NLU behind it.
 */

export type AssistantCommand = {
  id: string;
  phrase: string;
  href: string;
  keywords: readonly string[];
};

export const ASSISTANT_COMMANDS: readonly AssistantCommand[] = [
  {
    id: "open-my-work",
    phrase: "Open my work",
    href: "/my-work",
    keywords: ["my work", "open my work"],
  },
  {
    id: "continue-research",
    phrase: "Continue research",
    href: "/research/workspace",
    keywords: ["continue research", "research workspace", "continue my research"],
  },
  {
    id: "todays-changes",
    phrase: "Show today's changes",
    href: "/dashboard",
    keywords: ["today's changes", "todays changes", "what's new", "whats new", "changes"],
  },
  {
    id: "open-country-dashboard",
    phrase: "Open country dashboard",
    href: "/countries",
    keywords: ["country dashboard", "open country", "countries"],
  },
  {
    id: "mission-status",
    phrase: "Show mission status",
    href: "/research",
    keywords: ["mission status", "show mission", "my missions"],
  },
  {
    id: "compare-countries",
    phrase: "Compare countries",
    href: "/countries",
    keywords: ["compare countries", "compare country"],
  },
  {
    id: "open-evidence",
    phrase: "Open evidence",
    href: "/knowledge",
    keywords: ["open evidence", "evidence", "sources"],
  },
  {
    id: "search-publications",
    phrase: "Search publications",
    href: "/research",
    keywords: ["search publications", "publications", "papers"],
  },
  {
    id: "start-analysis",
    phrase: "Start analysis",
    href: "/research/workspace",
    keywords: ["start analysis", "begin analysis", "analyze"],
  },
] as const;

export type AssistantCommandMatch = {
  command: AssistantCommand;
  matchedKeyword: string;
};

/**
 * Deterministic substring match against the fixed keyword table above — no model call, no
 * fuzzy scoring, no fabricated confidence. Returns the first command whose keyword appears in
 * the input, or null when nothing matches (the caller falls back to a plain search).
 */
export function resolveAssistantCommand(input: string): AssistantCommandMatch | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;

  for (const command of ASSISTANT_COMMANDS) {
    for (const keyword of command.keywords) {
      if (normalized.includes(keyword)) {
        return { command, matchedKeyword: keyword };
      }
    }
  }
  return null;
}
