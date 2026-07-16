import {
  getRegistrySummary,
  getRulesByCategory,
  GOVERNANCE_VERSION,
} from "@/lib/governance";
import { createComplianceReportTemplate } from "@/lib/governance/reports/factory";
import type { ComplianceReport } from "@/lib/governance/reports/types";
import type { RuleCategory } from "@/lib/governance/types";
import { getConstitutionRuleByPrinciple } from "@/lib/governance/constitution/rules";

export const GOVERNANCE_CONTROL_VERSION = "1.0.0" as const;

export type GovernanceRuleCategoryRow = {
  category: RuleCategory;
  label: string;
  ruleCount: number;
  purpose: string;
  status: "Registered";
};

export type GovernancePrinciple = {
  id: string;
  title: string;
  description: string;
  standardReference?: string;
};

export type GovernanceValidationStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  ruleCategories: readonly RuleCategory[];
  status: "Declared — not automated";
};

export type GovernancePersona = {
  id: string;
  title: string;
  protectionAnswer: string;
};

export type GovernanceLimit = {
  id: string;
  title: string;
  description: string;
};

export type GovernanceControlModel = {
  version: typeof GOVERNANCE_CONTROL_VERSION;
  governanceVersion: typeof GOVERNANCE_VERSION;
  summary: {
    totalRules: number;
    criticalRules: number;
    ruleCategories: number;
    validationSteps: number;
  };
  ruleCategories: readonly GovernanceRuleCategoryRow[];
  principles: readonly GovernancePrinciple[];
  validationPipeline: readonly GovernanceValidationStep[];
  complianceReportTemplate: ComplianceReport;
  personas: readonly GovernancePersona[];
  limits: readonly GovernanceLimit[];
};

const CATEGORY_LABELS: Record<RuleCategory, { label: string; purpose: string }> = {
  constitution: {
    label: "Constitution",
    purpose: "Supreme platform principles — evidence, neutrality, zero demo policy.",
  },
  evidence: {
    label: "Evidence",
    purpose: "Source, status, and methodology requirements for all intelligence.",
  },
  entity: {
    label: "Entity",
    purpose: "Golden Rule patterns for Countries, Companies, and Universities routes.",
  },
  indicator: {
    label: "Indicator",
    purpose: "Registry lifecycle, methodology blocks, and future scoring rules.",
  },
  ui: {
    label: "UI",
    purpose: "Surface compliance — no fake KPIs, charts, confidence, or AI wording.",
  },
  persona: {
    label: "Persona",
    purpose: "Honest value for Citizen, Investor, Government, Student, Researcher, Academic.",
  },
};

function buildRuleCategories(): GovernanceRuleCategoryRow[] {
  const categories: RuleCategory[] = [
    "constitution",
    "evidence",
    "entity",
    "indicator",
    "ui",
    "persona",
  ];

  return categories.map((category) => ({
    category,
    label: CATEGORY_LABELS[category].label,
    ruleCount: getRulesByCategory(category).length,
    purpose: CATEGORY_LABELS[category].purpose,
    status: "Registered" as const,
  }));
}

function buildPrinciples(): GovernancePrinciple[] {
  const principleIds = [
    "evidence-first",
    "political-neutrality",
    "zero-demo-policy",
    "methodology-before-metrics",
    "separation-of-evidence-and-judgment",
    "no-social-sentiment-scoring",
  ] as const;

  const fromRegistry = principleIds
    .map((id) => getConstitutionRuleByPrinciple(id))
    .filter((rule): rule is NonNullable<typeof rule> => rule !== undefined)
    .map((rule) => ({
      id: rule.principleId,
      title: rule.title,
      description: rule.description,
      standardReference: rule.standardReference,
    }));

  const additional: GovernancePrinciple[] = [
    {
      id: "official-source-priority",
      title: "Official Source Priority",
      description:
        "United Nations, World Bank, NSO, and other official sources take precedence — no scraped or social data as intelligence.",
      standardReference: "docs/standards/02-evidence-standard.md",
    },
    {
      id: "reproducibility",
      title: "Reproducibility",
      description:
        "Module IDs, source slugs, and methodology versions must be traceable for audit and research.",
      standardReference: "docs/standards/06-methodology-standard.md",
    },
    {
      id: "governance-before-release",
      title: "Governance Before Release",
      description:
        "New modules pass standards, evidence, persona, and accessibility checks before release — no silent policy changes.",
      standardReference: "docs/constitution-enforcement-framework.md",
    },
  ];

  return [...fromRegistry, ...additional];
}

function buildValidationPipeline(): GovernanceValidationStep[] {
  return [
    {
      id: "module-proposal",
      order: 1,
      title: "Module Proposal",
      description:
        "New route or library registers intent, scope, and target personas before implementation.",
      ruleCategories: [],
      status: "Declared — not automated",
    },
    {
      id: "standards-check",
      order: 2,
      title: "Standards Check",
      description:
        "Verify against CBAI Constitutional Standard and entity/UI standards suite.",
      ruleCategories: ["constitution", "ui"],
      status: "Declared — not automated",
    },
    {
      id: "evidence-check",
      order: 3,
      title: "Evidence Check",
      description:
        "Confirm source attribution, connection status labels, and methodology blocks.",
      ruleCategories: ["evidence", "indicator"],
      status: "Declared — not automated",
    },
    {
      id: "persona-check",
      order: 4,
      title: "Persona Check",
      description:
        "All six personas receive honest current-value and future-capability copy.",
      ruleCategories: ["persona"],
      status: "Declared — not automated",
    },
    {
      id: "accessibility-check",
      order: 5,
      title: "Accessibility Check",
      description:
        "Future WCAG validation for mobile-ready, accessible enterprise readability.",
      ruleCategories: ["ui"],
      status: "Declared — not automated",
    },
    {
      id: "release-review",
      order: 6,
      title: "Release Review",
      description:
        "Manual constitution audit and compliance report sign-off before production release.",
      ruleCategories: [
        "constitution",
        "evidence",
        "entity",
        "indicator",
        "ui",
        "persona",
      ],
      status: "Declared — not automated",
    },
  ];
}

function buildPersonas(): GovernancePersona[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      protectionAnswer:
        "UI rules block fake confidence and political framing — citizens see honest evidence status only.",
    },
    {
      id: "investor",
      title: "Investor",
      protectionAnswer:
        "Evidence rules require source attribution before any due-diligence metrics appear.",
    },
    {
      id: "government",
      title: "Government",
      protectionAnswer:
        "Persona rules ensure gap analysis replaces political ratings on government-facing modules.",
    },
    {
      id: "student",
      title: "Student",
      protectionAnswer:
        "Zero demo policy prevents fake league tables and rankings on education routes.",
    },
    {
      id: "researcher",
      title: "Researcher",
      protectionAnswer:
        "Constitution mandates reproducible indicator IDs and source slugs for research scoping.",
    },
    {
      id: "academic",
      title: "Academic",
      protectionAnswer:
        "Methodology-before-metrics rules require citable methodology before evaluations ship.",
    },
  ];
}

function buildLimits(): GovernanceLimit[] {
  return [
    {
      id: "no-automated-enforcement",
      title: "No automated enforcement yet",
      description:
        "Rules are registered declaratively — runtime validation and CI gates are future work.",
    },
    {
      id: "no-runtime-policy-changes",
      title: "No runtime policy changes",
      description:
        "This center displays governance architecture — it does not toggle rules or policies live.",
    },
    {
      id: "no-hidden-ai",
      title: "No hidden AI",
      description:
        "Governance Control is not an AI model panel — no provider health, token metrics, or agent toggles.",
    },
  ];
}

/** Build the Governance Control Center model from the Governance Framework. */
export function buildGovernanceControlModel(): GovernanceControlModel {
  const registrySummary = getRegistrySummary();

  return {
    version: GOVERNANCE_CONTROL_VERSION,
    governanceVersion: GOVERNANCE_VERSION,
    summary: {
      totalRules: registrySummary.totalRules,
      criticalRules: registrySummary.criticalRules,
      ruleCategories: 6,
      validationSteps: 6,
    },
    ruleCategories: buildRuleCategories(),
    principles: buildPrinciples(),
    validationPipeline: buildValidationPipeline(),
    complianceReportTemplate: createComplianceReportTemplate({
      moduleId: "platform-alpha-0.2",
      moduleName: "CBAI Alpha 0.2 Core Intelligence Sprint",
      targetRoute: "/ai-control",
      evaluatedBy: "not-evaluated",
    }),
    personas: buildPersonas(),
    limits: buildLimits(),
  };
}

export function governanceStatusClass(status: string): string {
  if (status === "Registered" || status === "Declared — not automated") {
    return "text-teal-400 bg-teal-500/10 border-teal-500/20";
  }
  if (status === "not_evaluated") {
    return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
  return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
}
