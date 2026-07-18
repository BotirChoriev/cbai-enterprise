/**
 * Adaptive Intelligence — interface adaptation from demonstrated capability, not profession.
 *
 * Phase 1: derives focus from Capability Passport signals. Role preferences remain as fallback
 * until sufficient demonstrated work exists. Never gates routes by title or diploma.
 */

import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import type { CapabilityPassport } from "@/lib/capability/capability-passport.types";
import { summarizePassportForAdaptation } from "@/lib/discovery/discovery-engine";

export type AdaptiveIntelligenceProfile = {
  readonly mode: "capability" | "preference";
  readonly primaryFocus: string | null;
  readonly suggestedRoutes: readonly string[];
  readonly explanation: string;
};

const DOMAIN_ROUTES: Record<string, string[]> = {
  research: ["/research/workspace", "/research", "/knowledge"],
  evidence: ["/knowledge", "/countries", "/companies"],
  analysis: ["/countries", "/companies", "/universities"],
  governance: ["/government", "/trust", "/governance", "/ai-control"],
  synthesis: ["/my-work", "/analytics", "/research/workspace"],
  collaboration: ["/my-work", "/graph", "/search"],
};

const ROLE_FALLBACK_ROUTES: Record<WorkspaceRole, string[]> = {
  citizen: ["/citizen", "/knowledge", "/countries"],
  student: ["/research", "/universities", "/knowledge"],
  researcher: ["/research/workspace", "/research", "/knowledge"],
  professor: ["/research/workspace", "/research", "/analytics"],
  academic: ["/research", "/knowledge", "/trust"],
  engineer: ["/companies", "/research", "/knowledge"],
  investor: ["/investor", "/companies", "/countries"],
  company: ["/companies", "/analytics", "/knowledge"],
  university: ["/universities", "/research", "/knowledge"],
  research_center: ["/research/workspace", "/graph", "/research"],
  government: ["/government", "/countries", "/trust"],
  administrator: ["/dashboard", "/governance", "/ai-control", "/trust"],
  economist: ["/investor", "/countries", "/companies"],
  legal: ["/knowledge", "/trust", "/analytics"],
  social_sector: ["/citizen", "/knowledge", "/countries"],
};

export function deriveAdaptiveIntelligence(
  passport: CapabilityPassport,
  rolePreference: WorkspaceRole | null,
): AdaptiveIntelligenceProfile {
  const { primaryDomain, suggestedFocus } = summarizePassportForAdaptation(passport);

  if (primaryDomain && passport.totalSignals >= 2) {
    const routes = new Set<string>();
    for (const domain of suggestedFocus) {
      for (const route of DOMAIN_ROUTES[domain] ?? []) {
        routes.add(route);
      }
    }
    return {
      mode: "capability",
      primaryFocus: primaryDomain,
      suggestedRoutes: [...routes].slice(0, 4),
      explanation:
        "Adaptation follows demonstrated work in your Capability Passport — not your job title.",
    };
  }

  const fallbackRole = rolePreference ?? "citizen";
  return {
    mode: "preference",
    primaryFocus: null,
    suggestedRoutes: (ROLE_FALLBACK_ROUTES[fallbackRole] ?? ["/", "/my-work"]).slice(0, 4),
    explanation:
      "Insufficient demonstrated work yet — showing preference-based suggestions until your Capability Passport earns signals.",
  };
}
