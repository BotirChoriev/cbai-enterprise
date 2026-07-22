/**
 * Allowed / forbidden import directions (Stage 1).
 * Enforced by scripts/test-architecture-boundaries.ts — not by rewriting modules.
 */

export type DependencyRule = {
  readonly id: string;
  readonly description: string;
  /** Glob-ish prefixes under repo root (posix). */
  readonly fromPrefixes: readonly string[];
  /** Forbidden import substrings (matched in import specifiers). */
  readonly forbidImportSubstrings: readonly string[];
  readonly allowImportSubstrings?: readonly string[];
  readonly severity: "error" | "document";
};

/**
 * Distinguish orphan `lib/intelligence` from canonical `lib/intelligence-os`.
 */
export const ORPHAN_INTELLIGENCE_IMPORT = "@/lib/intelligence/";
export const ORPHAN_INTELLIGENCE_IMPORT_BARE = "@/lib/intelligence\"";
export const CANONICAL_INTELLIGENCE_OS_IMPORT = "@/lib/intelligence-os";

export const DEPENDENCY_RULES: readonly DependencyRule[] = [
  {
    id: "no-app-orphan-intelligence",
    description: "app/ and components/ must not import orphan lib/intelligence (use intelligence-os / platform stacks)",
    fromPrefixes: ["app/", "components/"],
    forbidImportSubstrings: ["@/lib/intelligence/", "@/lib/intelligence'"],
    allowImportSubstrings: ["@/lib/intelligence-os"],
    severity: "error",
  },
  {
    id: "no-platform-actions-from-orphan-intelligence",
    description: "platform-actions must not depend on orphan intelligence orchestrator",
    fromPrefixes: ["lib/platform-actions/"],
    forbidImportSubstrings: ["@/lib/intelligence/", "@/lib/intelligence'"],
    allowImportSubstrings: ["@/lib/intelligence-os"],
    severity: "error",
  },
  {
    id: "no-voice-operator-from-orphan-intelligence",
    description: "voice-operator I/O must not own navigation via orphan intelligence",
    fromPrefixes: ["lib/voice-operator/", "components/voice-operator/"],
    forbidImportSubstrings: ["@/lib/intelligence/", "@/lib/intelligence'"],
    allowImportSubstrings: ["@/lib/intelligence-os"],
    severity: "error",
  },
  {
    id: "no-fde-from-orphan-intelligence",
    description: "forward-deployed-engines must not invent actions from orphan intelligence",
    fromPrefixes: ["lib/forward-deployed-engines/", "components/forward-deployed/"],
    forbidImportSubstrings: ["@/lib/intelligence/", "@/lib/intelligence'"],
    allowImportSubstrings: ["@/lib/intelligence-os"],
    severity: "error",
  },
  {
    id: "voice-nav-via-platform-actions",
    description: "Voice navigation must resolve through platform-actions (documented; tested via source contracts elsewhere)",
    fromPrefixes: ["lib/voice-operator/", "components/voice-operator/"],
    forbidImportSubstrings: [],
    severity: "document",
  },
] as const;

/** Import substrings that indicate allowlisted internal navigation helpers (not arbitrary URLs). */
export const NAVIGATION_ALLOWLIST_OWNERS = [
  "lib/platform-actions",
  "validateNavigationHref",
  "isAllowedNavigationHref",
  "applyPlatformActionResult",
] as const;
