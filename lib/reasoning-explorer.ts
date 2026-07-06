import {
  ALL_DOMAIN_INDICATORS,
  INDICATOR_DOMAIN_CATALOG,
  FRAMEWORK_VERSION,
} from "@/lib/indicator-framework";
import type { IndicatorDomainId } from "@/lib/indicator-framework/types";
import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";
import {
  type CoverageStatusLabel,
} from "@/lib/countries.coverage";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";
import { explorerStatusClass } from "@/lib/evidence-explorer";

export const REASONING_EXPLORER_VERSION = "1.0.0" as const;

export type ReasoningPipelineStage = {
  id: string;
  title: string;
  description: string;
  userFacingOutput: string;
};

export type ReasoningDomainEvidenceRow = {
  domainId: IndicatorDomainId;
  domainTitle: string;
  indicatorCount: number;
  connectedCount: number;
  evidenceNeedsSummary: string;
  statusLabel: CoverageStatusLabel | "Insufficient Evidence";
};

export type ReasoningMethodologyPoint = {
  id: string;
  title: string;
  description: string;
};

export type ReasoningTracePrinciple = {
  id: string;
  title: string;
  description: string;
};

export type ReasoningPersona = {
  id: string;
  title: string;
  understandAnswer: string;
};

export type ReasoningTrustLimit = {
  id: string;
  title: string;
  description: string;
};

export type ReasoningExplorerModel = {
  version: typeof REASONING_EXPLORER_VERSION;
  frameworkVersion: typeof FRAMEWORK_VERSION;
  infrastructureVersion: typeof INFRASTRUCTURE_VERSION;
  governanceVersion: typeof GOVERNANCE_VERSION;
  summary: {
    pipelineStages: number;
    indicatorDomains: number;
    connectedIndicators: number;
    totalIndicators: number;
    connectedSources: number;
  };
  pipeline: readonly ReasoningPipelineStage[];
  domainEvidenceMap: readonly ReasoningDomainEvidenceRow[];
  methodology: readonly ReasoningMethodologyPoint[];
  tracePrinciples: readonly ReasoningTracePrinciple[];
  personas: readonly ReasoningPersona[];
  trustLimits: readonly ReasoningTrustLimit[];
};

function buildPipeline(): ReasoningPipelineStage[] {
  return [
    {
      id: "evidence",
      title: "Evidence",
      description:
        "Registered sources from Evidence Infrastructure with honest connection status.",
      userFacingOutput:
        "Source name, organization, verification state — or Evidence Source Not Connected.",
    },
    {
      id: "indicator",
      title: "Indicator",
      description:
        "Global Indicator Framework definitions linking evidence needs to entity types.",
      userFacingOutput:
        "Indicator ID, domain, required sources — no values until evidence connects.",
    },
    {
      id: "methodology",
      title: "Methodology",
      description:
        "How an indicator would be measured before any metric appears.",
      userFacingOutput:
        "Methodology block text and version — explain before evaluate.",
    },
    {
      id: "coverage",
      title: "Coverage",
      description:
        "Which entities and domains have connected evidence versus gaps.",
      userFacingOutput:
        "Coverage panels on entity routes — Insufficient Evidence where gaps remain.",
    },
    {
      id: "reasoning-trace",
      title: "Reasoning Trace",
      description:
        "Auditable record of steps from evidence to decision support — no hidden stages.",
      userFacingOutput:
        "Future: visible stage log with source attribution. Not automated on this page.",
    },
    {
      id: "decision-support",
      title: "Decision Support",
      description:
        "Transparent summaries scoped to verified evidence — not political recommendations.",
      userFacingOutput:
        "Future: decision-support text with trace links. Requires verified evidence chain.",
    },
  ];
}

function buildDomainEvidenceMap(): ReasoningDomainEvidenceRow[] {
  return INDICATOR_DOMAIN_CATALOG.map((domain) => {
    const indicators = ALL_DOMAIN_INDICATORS.filter((i) => i.category === domain.id);
    const connectedCount = indicators.filter((i) => i.status === "connected").length;
    const requiredSources = new Set(
      indicators.flatMap((i) => i.requiredEvidenceSources),
    );

    let statusLabel: CoverageStatusLabel | "Insufficient Evidence";
    if (connectedCount > 0) {
      statusLabel = "Connected";
    } else if (indicators.some((i) => i.status === "planned")) {
      statusLabel = "Planned";
    } else if (requiredSources.size > 0) {
      statusLabel = "Not connected";
    } else {
      statusLabel = "Insufficient Evidence";
    }

    return {
      domainId: domain.id,
      domainTitle: domain.title,
      indicatorCount: indicators.length,
      connectedCount,
      evidenceNeedsSummary:
        requiredSources.size > 0
          ? `${requiredSources.size} registered source slug(s) required`
          : "No sources registered for domain indicators",
      statusLabel,
    };
  }).filter((row) => row.indicatorCount > 0);
}

function buildMethodology(): ReasoningMethodologyPoint[] {
  return [
    {
      id: "no-methodology-no-metric",
      title: "No methodology → no metric",
      description:
        "CBAI defines how something would be measured before displaying any number on entity or report routes.",
    },
    {
      id: "no-evidence-no-claim",
      title: "No evidence → no claim",
      description:
        "Intelligence claims require connected, attributed evidence — otherwise Insufficient Evidence is shown.",
    },
    {
      id: "no-source-no-score",
      title: "No source → no score",
      description:
        "Evaluation scores are withheld until official sources connect through Evidence Infrastructure.",
    },
  ];
}

function buildTracePrinciples(): ReasoningTracePrinciple[] {
  return [
    {
      id: "visible-steps",
      title: "Every step is visible",
      description:
        "Reasoning traces record stage order and outcomes — users can follow evidence to conclusion without hidden processing.",
    },
    {
      id: "evidence-before-judgment",
      title: "Evidence precedes judgment",
      description:
        "Registry facts and verified evidence items appear before any evaluative language in decision support.",
    },
    {
      id: "source-attribution",
      title: "Source attribution required",
      description:
        "Each trace step links to registered source slugs or explicit not-connected labels.",
    },
    {
      id: "honest-gaps",
      title: "Gaps are labeled honestly",
      description:
        "Missing evidence surfaces as Evidence Source Not Connected or Insufficient Evidence — never fabricated filler.",
    },
    {
      id: "no-hidden-outputs",
      title: "No hidden model outputs",
      description:
        "This explorer describes the architecture — it does not run concealed AI or emit synthetic conclusions.",
    },
  ];
}

function buildPersonas(): ReasoningPersona[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      understandAnswer:
        "How public evidence connects to indicators before any government or institution evaluation appears.",
    },
    {
      id: "investor",
      title: "Investor",
      understandAnswer:
        "The separation between registry facts, indicator definitions, and future due-diligence reasoning — no hidden AI picks.",
    },
    {
      id: "government",
      title: "Government",
      understandAnswer:
        "Which evidence categories must connect before decision-support outputs can reference official data.",
    },
    {
      id: "student",
      title: "Student",
      understandAnswer:
        "Why CBAI shows methodology and coverage status instead of rankings or AI-generated summaries.",
    },
    {
      id: "researcher",
      title: "Researcher",
      understandAnswer:
        "The evidence → indicator → methodology chain required for reproducible reasoning traces.",
    },
    {
      id: "academic",
      title: "Academic",
      understandAnswer:
        "How judgment stays separated from evidence — and what must exist before citable evaluations.",
    },
  ];
}

function buildTrustLimits(): ReasoningTrustLimit[] {
  return [
    {
      id: "no-hidden-ai",
      title: "No hidden AI",
      description:
        "Reasoning Explorer is architectural documentation — it does not execute models or produce concealed outputs.",
    },
    {
      id: "no-fabricated-conclusions",
      title: "No fabricated conclusions",
      description:
        "No fake reasoning chains, confidence meters, agent narratives, or synthetic final answers.",
    },
    {
      id: "no-political-recommendations",
      title: "No political recommendations",
      description:
        "Decision support will remain politically neutral — no endorsements, favoritism, or advocacy framing.",
    },
    {
      id: "no-social-sentiment",
      title: "No social sentiment scoring",
      description:
        "Social media sentiment, popularity, and viral metrics are excluded from the reasoning pipeline.",
    },
  ];
}

/** Build the Reasoning Explorer model from platform foundations. */
export function buildReasoningExplorerModel(): ReasoningExplorerModel {
  const infra = getInfrastructureSummary();
  const connectedIndicators = ALL_DOMAIN_INDICATORS.filter(
    (i) => i.status === "connected",
  ).length;

  return {
    version: REASONING_EXPLORER_VERSION,
    frameworkVersion: FRAMEWORK_VERSION,
    infrastructureVersion: INFRASTRUCTURE_VERSION,
    governanceVersion: GOVERNANCE_VERSION,
    summary: {
      pipelineStages: 6,
      indicatorDomains: buildDomainEvidenceMap().length,
      connectedIndicators,
      totalIndicators: ALL_DOMAIN_INDICATORS.length,
      connectedSources: infra.connectedSources,
    },
    pipeline: buildPipeline(),
    domainEvidenceMap: buildDomainEvidenceMap(),
    methodology: buildMethodology(),
    tracePrinciples: buildTracePrinciples(),
    personas: buildPersonas(),
    trustLimits: buildTrustLimits(),
  };
}

export { explorerStatusClass };

export function reasoningStatusClass(
  label: CoverageStatusLabel | "Insufficient Evidence" | string,
): string {
  if (label === "Insufficient Evidence") {
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
  return explorerStatusClass(label);
}
