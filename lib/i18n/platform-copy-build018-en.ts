/** BUILD-018 — EPIC-13.4 Universal Workspace & Object-First Intelligence. */

export const UNIVERSAL_WORKSPACE_EN = {
  inspectorEyebrow: "Details",
  workspaceEyebrow: "Current focus",
  whatIsThis: "What is this?",
  whyRelevantNow: "Why relevant now",
  missionConnection: "Mission connection",
  evidenceSupports: "Evidence supports",
  contradicts: "What contradicts",
  whatIsMissing: "What is missing",
  nextAction: "Next action",
  humanJudgment: "Human judgment",
  historyLegacy: "History & legacy",
  noObjectSelected: "Navigate to an entity or select an object to inspect it.",
  activeScope: "Active scope",
  activeObject: "Active object",
  evidenceCount: "Evidence linked",
  impactStatus: "Impact review",
  reportReadiness: "Report readiness",
  impactComplete: "Complete",
  impactIncomplete: "Incomplete",
  reportReady: "Ready",
  reportNotReady: "Not ready",
  knowledgeRiver: "Knowledge River",
  riverCause: "Cause",
  riverUnresolved: "Unresolved",
  riverResolved: "Resolved",
  floatingIntelligence: "Note",
  evidenceBasis: "Evidence basis",
  suggestedAction: "Suggested action",
  humanDecisionRequired: "Human decision required",
  densityControl: "Display density",
  densityFocused: "Focused",
  densityStandard: "Standard",
  densityExpert: "Expert",
  densityExplanation: "Why this density",
  densityFocusedExplain: "Essential mission and object context only.",
  densityStandardExplain: "Balanced context for most operating work.",
  densityExpertExplain: "Higher information density for complex missions.",
  collaborationEyebrow: "Collaboration guidance",
  expertiseNeeded: "Expertise needed",
  evidenceGap: "Evidence gap",
  roleDescription: "Contributor role",
  externalMatchingOff: "No external matching connected — requirements only.",
  limitations: "Limitations",
  availableActions: "Available actions",
  trustState: "Trust state",
  currentState: "State",
  none: "None",
  yes: "Yes",
  no: "No",
  livingContext: "Living context",
  objectTypeMission: "Mission",
  objectTypeProject: "Project",
  objectTypeResearchTopic: "Research topic",
  objectTypeEvidence: "Evidence",
  objectTypeCountry: "Country",
  objectTypeCompany: "Company",
  objectTypeUniversity: "University",
  objectTypeReport: "Report",
  objectTypeQuestion: "Question",
  objectTypeRelationship: "Relationship",
  objectTypeCapabilitySignal: "Capability signal",
} as const;

export type UniversalObjectTypeI18nKey = keyof Pick<
  typeof UNIVERSAL_WORKSPACE_EN,
  | "objectTypeMission"
  | "objectTypeProject"
  | "objectTypeResearchTopic"
  | "objectTypeEvidence"
  | "objectTypeCountry"
  | "objectTypeCompany"
  | "objectTypeUniversity"
  | "objectTypeReport"
  | "objectTypeQuestion"
  | "objectTypeRelationship"
  | "objectTypeCapabilitySignal"
>;
