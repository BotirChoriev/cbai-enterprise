/**
 * Mission Engine — the primary organizing object of the Universal Intelligence OS.
 *
 * Not search. Not profession. A problem the user is trying to solve with evidence.
 */

export type MissionStatus = "draft" | "active" | "paused" | "completed";

export type Mission = {
  readonly id: string;
  readonly problem: string;
  readonly whyExists: string;
  readonly whoBenefits: string;
  readonly whoCouldBeHarmed: string;
  readonly evidenceHave: string;
  readonly evidenceMissing: string;
  readonly disciplines: readonly string[];
  readonly capabilitiesNeeded: string;
  readonly environmentalImpact: string;
  readonly successCriteria: string;
  readonly projectId?: string;
  readonly status: MissionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MissionDraft = Omit<Mission, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: MissionStatus;
};

export type MissionThreadStage =
  | "mission"
  | "question"
  | "evidence"
  | "reasoning"
  | "collaborators"
  | "report"
  | "impact";

export type MissionThreadState = {
  readonly stage: MissionThreadStage;
  readonly label: string;
  readonly status: "complete" | "partial" | "missing" | "blocked";
};
