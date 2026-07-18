/** Smart Idea & Research Canvas — shared vocabulary. */

export const RESEARCH_CANVAS_STAGES = [
  "IDEA",
  "INTERPRET",
  "MEASURE",
  "DISCOVER",
  "COMPARE",
  "MISSION",
  "EXECUTE",
  "DECIDE",
] as const;

export type ResearchCanvasStage = (typeof RESEARCH_CANVAS_STAGES)[number];

export const SMART_IDEA_VISIBILITIES = [
  "Private",
  "Team Only",
  "Organization",
  "Selected Reviewers",
  "Public",
] as const;

export type SmartIdeaVisibility = (typeof SMART_IDEA_VISIBILITIES)[number];

export const INTERPRETATION_STATUSES = [
  "Not Analyzed",
  "Machine-Extracted",
  "Awaiting Human Confirmation",
  "Human-Corrected",
  "Confirmed",
  "Rejected",
  "Insufficient Quality",
] as const;

export type InterpretationStatus = (typeof INTERPRETATION_STATUSES)[number];

export const MEASUREMENT_RESULT_STATES = [
  "Draft",
  "Input Incomplete",
  "Calibration Missing",
  "Ready to Measure",
  "Measured",
  "Validation Required",
  "Validated",
  "Inconclusive",
  "Rejected",
  "Archived",
] as const;

export type MeasurementResultState = (typeof MEASUREMENT_RESULT_STATES)[number];

export const PROJECT_EVIDENCE_STATUSES = [
  "Concept",
  "Theoretical Model",
  "Simulation",
  "Prototype",
  "Laboratory Tested",
  "Field Tested",
  "Independently Replicated",
  "Partially Supported",
  "Negative Result",
  "Inconclusive",
  "Stopped",
  "Withdrawn",
  "Operational Use",
  "Status Unknown",
] as const;

export type ProjectEvidenceStatus = (typeof PROJECT_EVIDENCE_STATUSES)[number];

export const INSTRUMENT_CAPABILITY_STATES = [
  "Working",
  "Preview",
  "Architecture Only",
  "External Instrument Required",
  "Expert Review Required",
  "Not Connected",
] as const;

export type InstrumentCapabilityState = (typeof INSTRUMENT_CAPABILITY_STATES)[number];

export type DimensionVector = {
  readonly time: number;
  readonly length: number;
  readonly mass: number;
  readonly current: number;
  readonly temperature: number;
  readonly amount: number;
  readonly luminous: number;
};

export type SmartIdeaArtifact = {
  readonly id: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly fileSizeBytes: number;
  readonly kind: "image" | "svg" | "pdf" | "text";
  readonly dataUrl?: string | null;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
};

export type ExtractedItem = {
  readonly id: string;
  readonly field: string;
  readonly extractedValue: string;
  /** AI interpretation confidence — NOT measurement uncertainty. */
  readonly aiConfidence: number;
  readonly sourceLocation?: string | null;
  readonly userCorrection?: string | null;
  readonly confirmationStatus: InterpretationStatus;
  readonly limitation: string;
  readonly correctedAt?: string | null;
  readonly correctedBy?: string | null;
};

export type IdeaModel = {
  readonly workingPrinciple: string;
  readonly components: readonly string[];
  readonly materials: readonly string[];
  readonly variables: readonly string[];
  readonly dimensions: readonly string[];
  readonly formulas: readonly string[];
  readonly processFlow: string;
  readonly expectedOutput: string;
  readonly expectedOutcome: string;
  readonly assumptions: readonly string[];
  readonly unknowns: readonly string[];
  readonly risks: readonly string[];
  readonly safetyConsiderations: string;
  readonly humanityBenefit: string;
  readonly natureImpact: string;
  readonly researchQuestions: readonly string[];
  readonly requiredValidation: readonly string[];
  readonly completeness: Readonly<Record<string, "Defined" | "Partially Defined" | "Missing" | "Requires Expert Review">>;
};

export type SmartIdea = {
  readonly id: string;
  readonly title: string;
  readonly originalDescription: string;
  readonly problem: string;
  readonly purpose: string;
  readonly intendedBeneficiary: string;
  readonly expectedResult: string;
  readonly domain: string;
  readonly visibility: SmartIdeaVisibility;
  readonly ipBoundary: string;
  readonly owner: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly livingResearchObjectId?: string | null;
  readonly stage: ResearchCanvasStage;
  readonly artifacts: readonly SmartIdeaArtifact[];
  readonly extractedItems: readonly ExtractedItem[];
  readonly ideaModel?: IdeaModel | null;
  readonly externalSearchConfirmed: boolean;
  readonly externalSearchConsentAt?: string | null;
  readonly externalSearchRevoked?: boolean;
  readonly externalSearchRevokedAt?: string | null;
  readonly externalSearchQueryOverride?: string | null;
  readonly humanDecision?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MeasurementPlan = {
  readonly id: string;
  readonly smartIdeaId: string;
  readonly measurand: string;
  readonly purpose: string;
  readonly domain: string;
  readonly sampleOrObject: string;
  readonly methodId: string;
  readonly instrumentId: string;
  readonly unitId: string;
  readonly calibration: string;
  readonly referenceStandard: string;
  readonly conditions: string;
  readonly rawDataReference: string;
  readonly processingModel: string;
  readonly uncertaintyNote: string;
  readonly validationNote: string;
  readonly humanReviewRequired: boolean;
  readonly state: MeasurementResultState;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MeasurementPassport = {
  readonly id: string;
  readonly measurementPlanId?: string | null;
  readonly smartIdeaId: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly researchObjectId?: string | null;
  readonly measuredObject: string;
  readonly measurand: string;
  readonly result: string;
  readonly unit: string;
  readonly uncertainty: string;
  readonly uncertaintyType: string;
  readonly uncertaintyLimitation: string;
  readonly methodId: string;
  readonly instrumentId: string;
  readonly instrumentModel: string;
  readonly calibrationStatus: string;
  readonly calibrationDate?: string | null;
  readonly referenceStandard: string;
  readonly rawDataReference: string;
  readonly processingSoftware: string;
  readonly algorithmVersion: string;
  readonly environmentalConditions: string;
  readonly operator: string;
  readonly laboratory: string;
  readonly validationStatus: MeasurementResultState;
  readonly reviewer?: string | null;
  readonly limitations: string;
  readonly reproducibilityStatus: string;
  readonly geometry?: Readonly<Record<string, number>> | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CalculationRecord = {
  readonly id: string;
  readonly smartIdeaId: string;
  readonly formulaId: string;
  readonly formulaName: string;
  readonly formulaSource: string;
  readonly isUserDefined: boolean;
  readonly variables: Readonly<Record<string, { value: number; unit: string }>>;
  readonly assumptions: readonly string[];
  readonly result: number;
  readonly resultUnit: string;
  readonly significantFigures: number;
  readonly uncertainty?: string | null;
  readonly limitations: readonly string[];
  readonly timestamp: string;
};

export type ConversionRecord = {
  readonly id: string;
  readonly smartIdeaId: string;
  readonly fromValue: number;
  readonly fromUnitId: string;
  readonly toUnitId: string;
  readonly convertedValue: number;
  readonly conversionFactor: number;
  readonly formula: string;
  readonly timestamp: string;
};

export type DiscoveryResultRecord = {
  readonly id: string;
  readonly smartIdeaId: string;
  readonly provider: string;
  readonly title: string;
  readonly authors: readonly string[];
  readonly date?: string | null;
  readonly doi?: string | null;
  readonly sourceUrl?: string | null;
  readonly openAccessStatus?: string | null;
  readonly abstract?: string | null;
  readonly publicationType?: string | null;
  readonly license?: string | null;
  readonly retrievedAt: string;
  readonly projectStatus: ProjectEvidenceStatus;
  readonly statusEvidence: string;
  readonly statusLimitation: string;
};

export type HumanDecisionRecord = {
  readonly id: string;
  readonly smartIdeaId: string;
  readonly selectedPath: string;
  readonly reason: string;
  readonly actor: string;
  readonly timestamp: string;
};
