/**
 * EPIC-21 — Universal Command architecture.
 * Extends deterministic assistant-commands — no fake AI routing.
 */

import { ASSISTANT_COMMANDS, resolveAssistantCommand } from "@/lib/assistant/assistant-commands";

export type UniversalCommandCategory =
  | "continue"
  | "compare"
  | "create"
  | "find"
  | "open"
  | "review"
  | "generate";

export type UniversalCommandExample = {
  readonly phrase: string;
  readonly category: UniversalCommandCategory;
  readonly href: string;
};

/** Documented examples — all resolve through existing command table when matched. */
export const UNIVERSAL_COMMAND_EXAMPLES: readonly UniversalCommandExample[] = [
  { phrase: "Continue yesterday", category: "continue", href: "/my-work" },
  { phrase: "Compare Apple and Samsung", category: "compare", href: "/graph" },
  { phrase: "Create new mission", category: "create", href: "/" },
  { phrase: "Find WHO reports", category: "find", href: "/search" },
  { phrase: "Open my organization", category: "open", href: "/trust" },
  { phrase: "Review evidence", category: "review", href: "/knowledge" },
  { phrase: "Generate report", category: "generate", href: "/reports" },
  { phrase: "Continue research", category: "continue", href: "/research/workspace" },
];

export function resolveUniversalCommand(input: string) {
  return resolveAssistantCommand(input);
}

export function listRegisteredCommands() {
  return ASSISTANT_COMMANDS;
}

export const UNIVERSAL_COMMAND_NOTE =
  "Every command resolves deterministically through assistant-commands.ts — never probabilistic AI routing.";
