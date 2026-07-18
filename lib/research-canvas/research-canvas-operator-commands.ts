/**
 * Research Canvas Operator commands.
 */

import { loadSmartIdeas } from "@/lib/research-canvas/smart-idea-store";
import { loadMeasurementPlans } from "@/lib/research-canvas/measurement-store";
import { getUnit } from "@/lib/research-canvas/unit-registry";
import { buildDecisionSupportPackage } from "@/lib/research-canvas/decision-support";
import type { GenesisCommandMatch } from "@/lib/genesis/genesis-operator-commands";

export function resolveResearchCanvasCommand(input: string): GenesisCommandMatch | null {
  const q = input.toLowerCase().trim();

  if (
    q.includes("open research canvas") ||
    q.includes("research canvas") ||
    q.includes("tadqiqot kanvasini och") ||
    q.includes("research canvasni och")
  ) {
    return {
      type: "answer",
      message: "Open the Smart Idea & Research Canvas to upload a sketch, define measurements, and discover connected research.",
      href: "/research/canvas",
      matchedKeyword: "open research canvas",
    };
  }

  if (q.includes("start a research idea") || q.includes("start research idea")) {
    return {
      type: "answer",
      message: "Start a private Smart Idea on the Research Canvas. Default visibility is Private.",
      href: "/research/canvas",
      matchedKeyword: "start a research idea",
    };
  }

  if (q.includes("what needs confirmation") || q.includes("what did cbai understand")) {
    const ideas = loadSmartIdeas();
    const pending = ideas.flatMap((i) =>
      i.extractedItems.filter((e) => e.confirmationStatus === "Awaiting Human Confirmation").map((e) => `${i.title}: ${e.field}`),
    );
    return {
      type: "answer",
      message:
        pending.length > 0
          ? `Interpretation awaiting confirmation:\n${pending.slice(0, 5).join("\n")}\n\nLimitation: device-local records only.`
          : "No interpretation items awaiting confirmation in current Smart Ideas.",
      href: "/research/canvas",
      matchedKeyword: "what needs confirmation",
    };
  }

  if (q.includes("what can be measured")) {
    const plans = loadMeasurementPlans();
    return {
      type: "answer",
      message:
        plans.length > 0
          ? `${plans.length} measurement plan(s) defined. Open Research Canvas → MEASURE stage for details.`
          : "No measurement plans yet. Define a measurand and method on the Research Canvas.",
      href: "/research/canvas",
      matchedKeyword: "what can be measured",
    };
  }

  if (q.includes("which unit should i use")) {
    return {
      type: "answer",
      message:
        "Select a unit compatible with the measurand dimension. SI base units (m, kg, s, K, mol) are preferred. The unit converter rejects incompatible dimensions.",
      href: "/research/canvas",
      matchedKeyword: "which unit should i use",
    };
  }

  if (q.includes("find related research")) {
    return {
      type: "answer",
      message:
        "Use Research Canvas → DISCOVER after confirming sanitized search concepts. Connected Crossref metadata search is available; other providers may be unavailable.",
      href: "/research/canvas",
      matchedKeyword: "find related research",
    };
  }

  if (q.includes("what should i do next") && q.includes("research")) {
    const ideas = loadSmartIdeas();
    const active = ideas[ideas.length - 1];
    if (!active) {
      return {
        type: "answer",
        message: "Create a Smart Idea on the Research Canvas to begin.",
        href: "/research/canvas",
        matchedKeyword: "what should i do next",
      };
    }
    return {
      type: "answer",
      message: `Active Smart Idea "${active.title}" is at stage ${active.stage}. Next: continue on Research Canvas. Human decision remains yours.`,
      href: "/research/canvas",
      matchedKeyword: "what should i do next",
    };
  }

  if (q.includes("compare my idea")) {
    return {
      type: "answer",
      message: "Compare your confirmed Smart Idea with connected records on Research Canvas → COMPARE stage. Patent review requires professional legal review.",
      href: "/research/canvas",
      matchedKeyword: "compare my idea",
    };
  }

  return null;
}

export function formatUnitHint(unitId: string): string {
  const unit = getUnit(unitId);
  if (!unit) return "Unknown unit.";
  return `${unit.name} (${unit.symbol}) — ${unit.limitation || unit.sourceReference}`;
}

export function summarizeDecisionSupport(ideaId: string): string {
  const ideas = loadSmartIdeas();
  const idea = ideas.find((i) => i.id === ideaId);
  if (!idea) return "Smart Idea not found.";
  const pkg = buildDecisionSupportPackage(idea);
  return `Options:\n${pkg.options.join("\n")}\n\n${pkg.humanDecisionBoundary}`;
}
