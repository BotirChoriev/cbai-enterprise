/** BUILD-012 — Mission runtime, intelligence network, operator states. */

export const INTELLIGENCE_NETWORK_EN = {
  eyebrow: "Intelligence network",
  description: "See how countries, companies, and topics connect.",
  missionFocus: "Mission focus mode",
  focusModes: "Graph focus modes",
  modeMission: "Mission",
  modeEvidence: "Evidence",
  modeAll: "Full catalog",
  connectedEntities: "Connected entities",
  supportingEvidence: "Supporting evidence refs",
  missingEvidence: "Missing evidence",
  unresolvedQuestions: "Unresolved questions",
  impactConcern: "Impact concern",
  linkProjectEntities: "Link entities on project",
  contradiction: "Potential contradiction",
  returnToMission: "Return to Mission Center",
} as const;

export const OPERATOR_STATES_EN = {
  present: "Operator present",
  listening: "Listening",
  transcribing: "Transcribing",
  interpreting: "Interpreting",
  clarificationRequired: "Clarification required",
  showingEvidence: "Showing evidence context",
  proposingAlternatives: "Proposing alternatives",
  waitingDecision: "Waiting for human decision",
  executing: "Executing command",
  success: "Confirmed",
  warning: "Attention needed",
  unsupported: "Voice not supported in this browser",
  permissionDenied: "Microphone permission denied",
  error: "Something needs attention",
  complete: "Complete",
} as const;

export const MODULE_ACCOUNTABILITY_UI_EN = {
  eyebrow: "Module accountability",
  title: "What each module does — and its limits",
  purpose: "Purpose",
  input: "Real input",
  processing: "Processing",
  output: "Output",
  evidenceDependency: "Evidence dependency",
  limitations: "Limitations",
  responsibleHuman: "Responsible human",
  maturity: "Maturity",
  storage: "Storage",
  nextAction: "Next action",
  unregisteredWarning: "This route is not registered in the accountability registry.",
} as const;

export const CAPABILITY_PASSPORT_BUILD012_EN = {
  signalSource: "Source activity",
  signalDate: "Date",
  uncertaintyNotice:
    "Capability is inferred from demonstrated work on this platform and may be incomplete or wrong.",
  visibilityNote: "Visibility is local to this device until cloud sync is connected.",
  developmentDirection: "Developing",
  inspectSignal: "Inspect signal",
} as const;

export const MISSION_THREAD_BUILD012_EN = {
  openStage: "Open stage",
  stageMission: "Mission Center",
  stageQuestion: "Project questions",
  stageEvidence: "Project evidence",
  stageReasoning: "Notes and reasoning",
  stageCollaborators: "Capabilities needed",
  stageReport: "Project report",
  stageImpact: "Human impact review",
} as const;
