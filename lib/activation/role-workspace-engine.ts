/**
 * Role-to-Workspace Engine (Adaptive Intelligence Workspace).
 *
 * Turns "who the user is + what they want" into a typed, fully editable
 * workspace blueprint. A role is a starting context only — never a silo:
 * every blueprint is editable, every role can be switched, and creation
 * always flows through the canonical Operational Object draft → confirm
 * pipeline (never a parallel store).
 *
 * Honesty contract: nothing here fabricates facts. Every value the engine
 * did not receive from the user is explicitly "unknown"; every value it
 * derived from user text is explicitly "inferred" and awaits confirmation.
 */

import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import type {
  OperationalObjectDomain,
  OperationalObjectType,
} from "@/lib/operational-objects/operational-object.types";

export const ACTIVATION_ROLES = [
  "scientist",
  "student",
  "entrepreneur",
  "manufacturer",
  "engineer",
  "laboratory",
  "teacher",
  "agronomist",
  "public_servant",
  "other",
] as const;

export type ActivationRole = (typeof ACTIVATION_ROLES)[number];

/** State of any single piece of workspace information. Never converts an assumption into a fact. */
export type ActivationValueState = "known" | "unknown" | "inferred" | "awaiting_confirmation";

export type ActivationDetection = {
  readonly role: ActivationRole;
  readonly confidence: "explicit" | "unsure";
};

/**
 * Role detection from explicit user text only (EN/UZ/RU/TR). Order matters:
 * more specific occupations (laboratory, agronomist, manufacturer) win over
 * broader ones (scientist). Detection is a suggestion — the UI must let the
 * user change it, and the result is marked "inferred", never "known".
 */
const ROLE_DETECTION: readonly { readonly role: ActivationRole; readonly pattern: RegExp }[] = [
  {
    role: "laboratory",
    pattern: /(laborator|laborant|лаборатор|laboratuvar|tahlilxona)/i,
  },
  {
    role: "agronomist",
    pattern: /(agronom|farmer|farming|agricultur|dehqon|fermer|qishloq xo['‘`ʻ]?jalig|агроном|фермер|сельск|урожа|ziraat|çiftçi|tarım)/i,
  },
  {
    role: "manufacturer",
    pattern: /(manufactur|factory|production line|production plant|zavod|ishlab chiqar|sex boshlig|производств|завод|фабрик|üretici|üretim|fabrika)/i,
  },
  {
    role: "engineer",
    pattern: /(engineer|muhandis|инженер|mühendis)/i,
  },
  {
    role: "teacher",
    pattern: /(teacher|educator|instructor|o['‘`ʻ]?qituvchi|muallim|учитель|преподаватель|педагог|öğretmen|eğitmen)/i,
  },
  {
    role: "public_servant",
    pattern: /(public servant|civil servant|ministry|municipality|government official|davlat xizmat|hokimiyat|vazirlik|hukumat|госслуж|чиновник|министерств|муниципал|kamu görevlisi|memur|belediye|bakanlık)/i,
  },
  {
    role: "entrepreneur",
    pattern: /(entrepreneur|founder|startup|business owner|my business|tadbirkor|biznesim|biznes egasi|startap|предпринимател|основатель|мой бизнес|стартап|girişimci|iş sahibi|kurucu)/i,
  },
  {
    role: "student",
    pattern: /(student|phd|doctoral|dissertation|master['’]?s|talaba|doktorant|magistrant|dissertatsiya|студент|аспирант|диссертаци|магистрант|öğrenci|doktora|yüksek lisans)/i,
  },
  {
    role: "scientist",
    pattern: /(scientist|researcher|research fellow|olim|tadqiqotchi|ilmiy xodim|kimyogar|fizik|biolog|учёный|ученый|исследователь|химик|bilim insanı|araştırmacı|kimyager)/i,
  },
];

export function detectActivationRole(text: string): ActivationDetection {
  const trimmed = text.trim();
  if (!trimmed) return { role: "other", confidence: "unsure" };
  for (const entry of ROLE_DETECTION) {
    if (entry.pattern.test(trimmed)) {
      return { role: entry.role, confidence: "explicit" };
    }
  }
  return { role: "other", confidence: "unsure" };
}

/* ------------------------------------------------------------------ */
/* Workspace blueprints                                                */
/* ------------------------------------------------------------------ */

export type ActivationSectionId =
  | "structure"
  | "technicalCondition"
  | "continuousOperation"
  | "productionQuality"
  | "marketFinance"
  | "monitoring";

export type WorkspaceSectionBlueprint = {
  readonly id: ActivationSectionId;
  readonly fieldIds: readonly string[];
};

export type WorkspaceBlueprint = {
  readonly role: ActivationRole;
  /** Closest existing Assistant Profile role — keeps one profile system. */
  readonly workspaceRole: WorkspaceRole;
  readonly objectType: OperationalObjectType;
  readonly domain: OperationalObjectDomain;
  readonly sections: readonly WorkspaceSectionBlueprint[];
};

const SCIENTIST_FIELDS = [
  "researchQuestion",
  "hypothesis",
  "priorLiterature",
  "researchersInstitutions",
  "methodology",
  "datasetRequirements",
  "evidencePlan",
  "limitations",
  "reproducibility",
  "comparisonCandidates",
  "nextResearchOpportunities",
] as const;

const BLUEPRINTS: Record<ActivationRole, Omit<WorkspaceBlueprint, "role">> = {
  scientist: {
    workspaceRole: "researcher",
    objectType: "research_question",
    domain: "research",
    sections: [{ id: "structure", fieldIds: SCIENTIST_FIELDS }],
  },
  student: {
    workspaceRole: "student",
    objectType: "research_question",
    domain: "research",
    sections: [{ id: "structure", fieldIds: SCIENTIST_FIELDS }],
  },
  entrepreneur: {
    workspaceRole: "company",
    objectType: "work_plan",
    domain: "general",
    sections: [
      {
        id: "structure",
        fieldIds: [
          "businessProblem",
          "customers",
          "market",
          "operatingModel",
          "costs",
          "revenueAssumptions",
          "risks",
          "strategyOptions",
          "executionPlan",
          "monitoringIndicators",
        ],
      },
    ],
  },
  manufacturer: {
    workspaceRole: "company",
    objectType: "work_plan",
    domain: "general",
    sections: [
      {
        id: "technicalCondition",
        fieldIds: [
          "equipmentModel",
          "manufacturingYear",
          "capacity",
          "currentLoad",
          "failureHistory",
          "spareParts",
          "maintenanceInterval",
        ],
      },
      {
        id: "continuousOperation",
        fieldIds: [
          "continuousRequirements",
          "plannedDowntime",
          "preventiveMaintenance",
          "operatorShifts",
          "energySupply",
          "rawMaterials",
          "emergencyProcedure",
          "safetyInspections",
        ],
      },
      {
        id: "productionQuality",
        fieldIds: [
          "dailyOutput",
          "defectRate",
          "unitCost",
          "energyUse",
          "waste",
          "qualityControls",
          "productionCycle",
        ],
      },
      {
        id: "marketFinance",
        fieldIds: [
          "demand",
          "salesChannels",
          "prices",
          "delivery",
          "taxes",
          "mandatoryCosts",
          "cashFlow",
          "reserveCapacity",
          "scenarios",
        ],
      },
      {
        id: "monitoring",
        fieldIds: [
          "uptime",
          "downtime",
          "maintenanceDue",
          "outputIndicator",
          "costIndicator",
          "qualityIndicator",
          "deliveryIndicator",
          "riskIndicator",
          "monitoringOwner",
          "nextHumanDecision",
        ],
      },
    ],
  },
  engineer: {
    workspaceRole: "engineer",
    objectType: "work_plan",
    domain: "general",
    sections: [
      {
        id: "structure",
        fieldIds: [
          "requirements",
          "constraints",
          "calculations",
          "systemArchitecture",
          "technicalRisks",
          "tests",
          "acceptanceCriteria",
          "maintenance",
          "monitoringIndicators",
        ],
      },
    ],
  },
  laboratory: {
    workspaceRole: "researcher",
    objectType: "work_plan",
    domain: "research",
    sections: [
      {
        id: "structure",
        fieldIds: [
          "samples",
          "protocols",
          "labEquipment",
          "calibration",
          "measurements",
          "controls",
          "resultValidation",
          "safety",
          "repeatability",
          "evidenceRecords",
        ],
      },
    ],
  },
  teacher: {
    workspaceRole: "academic",
    objectType: "work_plan",
    domain: "knowledge",
    sections: [
      {
        id: "structure",
        fieldIds: [
          "learningObjective",
          "learnerContext",
          "lessonPlan",
          "teachingMaterials",
          "evaluation",
          "accessibility",
          "progressMonitoring",
        ],
      },
    ],
  },
  agronomist: {
    workspaceRole: "citizen",
    objectType: "work_plan",
    domain: "general",
    sections: [
      {
        id: "structure",
        fieldIds: [
          "crop",
          "land",
          "soil",
          "water",
          "climate",
          "farmInputs",
          "diseasePestRisks",
          "yieldExpectation",
          "costs",
          "monitoringSchedule",
        ],
      },
    ],
  },
  public_servant: {
    workspaceRole: "government",
    objectType: "decision_brief",
    domain: "governance",
    sections: [
      {
        id: "structure",
        fieldIds: [
          "publicProblem",
          "legalBasis",
          "populationAffected",
          "existingEvidence",
          "policyOptions",
          "implementationConstraints",
          "publicImpact",
          "humanReview",
          "monitoringAccountability",
        ],
      },
    ],
  },
  other: {
    workspaceRole: "citizen",
    objectType: "work_plan",
    domain: "general",
    sections: [
      {
        id: "structure",
        fieldIds: ["goal", "workContext", "userMaterials", "constraints", "nextStep"],
      },
    ],
  },
};

export function buildWorkspaceBlueprint(role: ActivationRole): WorkspaceBlueprint {
  return { role, ...BLUEPRINTS[role] };
}

/** Every field id used by any blueprint — copy files must label all of them. */
export function allBlueprintFieldIds(): readonly string[] {
  const ids = new Set<string>();
  for (const role of ACTIVATION_ROLES) {
    for (const section of BLUEPRINTS[role].sections) {
      for (const id of section.fieldIds) ids.add(id);
    }
  }
  return [...ids];
}

/* ------------------------------------------------------------------ */
/* Adaptive clarification                                              */
/* ------------------------------------------------------------------ */

export const CLARIFICATION_IDS = ["outcome", "problem", "materials", "constraints"] as const;
export type ClarificationId = (typeof CLARIFICATION_IDS)[number];

export type ActivationIntentInput = {
  readonly text: string;
  readonly role: ActivationRole;
  readonly outcome: string | null;
  readonly problem: string | null;
  readonly materialsCount: number;
  readonly constraints: string | null;
};

/**
 * At most three adaptive clarification questions, only for information the
 * user has not already provided. None of them block the Starter Work Card —
 * value is shown even with every answer left unknown.
 */
export function adaptiveClarifications(input: ActivationIntentInput): readonly ClarificationId[] {
  const questions: ClarificationId[] = [];
  if (!input.outcome?.trim()) questions.push("outcome");
  if (!input.problem?.trim()) questions.push("problem");
  if (input.materialsCount === 0) questions.push("materials");
  if (!input.constraints?.trim()) questions.push("constraints");
  return questions.slice(0, 3);
}
