import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import type {
  OperationalObjectDomain,
  OperationalObjectStatus,
  OperationalObjectType,
} from "@/lib/operational-objects/operational-object.types";

const TYPE_KEYS: Record<OperationalObjectType, keyof TranslationDictionary["operationalObject"]> = {
  project: "typeProject",
  mission: "typeMission",
  work_plan: "typeWorkPlan",
  task: "typeTask",
  research_question: "typeResearchQuestion",
  evidence_request: "typeEvidenceRequest",
  review: "typeReview",
  decision_brief: "typeDecisionBrief",
  meeting_action: "typeMeetingAction",
};

const STATUS_KEYS: Record<OperationalObjectStatus, keyof TranslationDictionary["operationalObject"]> = {
  draft: "statusDraft",
  ready: "statusReady",
  active: "statusActive",
  waiting_for_input: "statusWaitingInput",
  waiting_for_evidence: "statusWaitingEvidence",
  needs_review: "statusNeedsReview",
  blocked: "statusBlocked",
  completed: "statusCompleted",
  archived: "statusArchived",
};

const DOMAIN_KEYS: Record<OperationalObjectDomain, keyof TranslationDictionary["operationalObject"]> = {
  research: "domainResearch",
  evidence: "domainEvidence",
  countries: "domainCountries",
  companies: "domainCompanies",
  universities: "domainUniversities",
  governance: "domainGovernance",
  investor: "domainInvestor",
  reports: "domainReports",
  knowledge: "domainKnowledge",
  general: "domainGeneral",
};

export function translateOperationalObjectType(
  type: OperationalObjectType,
  t: (key: string) => string,
): string {
  return t(`operationalObject.${TYPE_KEYS[type]}`);
}

export function translateOperationalObjectStatus(
  status: OperationalObjectStatus,
  t: (key: string) => string,
): string {
  return t(`operationalObject.${STATUS_KEYS[status]}`);
}

export function translateOperationalObjectDomain(
  domain: OperationalObjectDomain,
  t: (key: string) => string,
): string {
  return t(`operationalObject.${DOMAIN_KEYS[domain]}`);
}
