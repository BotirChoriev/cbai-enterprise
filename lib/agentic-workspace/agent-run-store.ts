const STORAGE_KEY = "cbai-agent-runs-v1";
export const AGENT_RUNS_CHANGED_EVENT = "cbai:agent-runs-changed";

export type AgentRunStepStatus = "ready" | "blocked" | "needs_confirmation" | "complete";

export type AgentRunStep = {
  readonly id: string;
  readonly title: string;
  readonly purpose: string;
  readonly status: AgentRunStepStatus;
  readonly requiresHumanConfirmation: boolean;
};

export type AgentRunArtifact = {
  readonly id: string;
  readonly type: "process_map" | "requirements" | "research_brief";
  readonly title: string;
  readonly status: "draft" | "verified";
  readonly items: readonly string[];
};

export type AgentRun = {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly originalRequest: string;
  readonly goal: string;
  readonly domain: "business_operations" | "research" | "general";
  readonly status: "draft_ready" | "waiting_for_input" | "in_progress";
  readonly knownFacts: readonly string[];
  readonly missingInformation: readonly string[];
  readonly assumptions: readonly string[];
  readonly nextQuestion: string;
  readonly steps: readonly AgentRunStep[];
  readonly artifacts: readonly AgentRunArtifact[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

function storageAvailable(): boolean {
  return typeof window !== "undefined";
}

function readRuns(): AgentRun[] {
  if (!storageAvailable()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is AgentRun => Boolean(item && typeof item === "object" && "id" in item)) : [];
  } catch {
    return [];
  }
}

function writeRuns(runs: readonly AgentRun[]): void {
  if (!storageAvailable()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  window.dispatchEvent(new CustomEvent(AGENT_RUNS_CHANGED_EVENT));
}

function unique(items: readonly string[]): string[] {
  return [...new Set(items)];
}

function includesAny(text: string, terms: readonly string[]): boolean {
  const normalized = text.toLocaleLowerCase();
  return terms.some((term) => normalized.includes(term));
}

export function isAgenticBuildRequest(text: string): boolean {
  return includesAny(text, [
    "tizimlashtir", "tizim yarat", "sxema tuz", "ish reja", "biznesim", "servis",
    "loyiha kartasi", "loyiha shabloni", "loyiha workspace", "loyiha ish rejasi",
    "missiya", "muammoga yechim", "muammo yechimi", "reja tuz", "shablon och",
    "birgalikda yarat", "birga yarat", "yo'nalish ber", "yo‘nalish ber",
    "build a system", "create a plan", "design a workflow", "organize my business",
    "project card", "project template", "project workspace", "mission plan",
    "solve this problem", "build together", "co-create",
  ]);
}

export function createAgentRunFromConversation(request: string): AgentRun {
  const truckService = includesAny(request, ["truck", "trak", "fura", "repair", "ta'mir", "servis"]);
  const research = includesAny(request, ["research", "tadqiqot", "ilmiy", "experiment"]);
  const mission = includesAny(request, ["missiya", "mission", "muammoga yechim", "muammo yechimi"]);
  const uzbek = includesAny(request, ["loyiha", "missiya", "muammo", "yechim", "reja", "shablon", "birga"]);
  const knownFacts = unique([
    `User request: ${request.trim()}`,
    ...(truckService ? ["Domain stated by user: vehicle repair/service operations"] : []),
  ]);
  const processItems = truckService
    ? [
        "Customer contact / AI intake",
        "Vehicle and VIN identification",
        "Appointment and arrival",
        "Work order creation",
        "Technician assignment",
        "Diagnosis and repair",
        "Parts and inventory usage",
        "Quality review and human approval",
        "Invoice and customer update",
      ]
    : mission && uzbek
      ? ["Missiyani aniqlash", "Muammoni chegaralash", "Natijani belgilash", "Ish rejasini tuzish", "Dalillarni tekshirish", "Inson tasdig‘i"]
      : ["Intake", "Clarify requirements", "Plan", "Execute", "Verify", "Human decision"];
  const missingInformation = truckService
    ? ["Business location", "Current software and data sources", "Team size and roles", "Daily order volume", "Budget and implementation constraints"]
    : mission && uzbek
      ? ["Muvaffaqiyat mezoni", "Mavjud dalillar va materiallar", "Muddat", "Yakuniy qaror egasi"]
      : ["Success criteria", "Available source material", "Deadline", "Decision owner"];
  const now = new Date().toISOString();
  const id = `agent-run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const run: AgentRun = {
    id,
    schemaVersion: 1,
    originalRequest: request.trim(),
    goal: truckService
      ? "Create an evidence-based operating blueprint for an integrated vehicle repair service"
      : research
        ? "Create a structured, evidence-first research workspace"
        : mission && uzbek
          ? "Missiyani inson bilan birgalikda aniq loyiha va tekshiriladigan ish rejasiga aylantirish"
        : "Turn the request into a verified execution workspace",
    domain: truckService ? "business_operations" : research ? "research" : "general",
    status: "waiting_for_input",
    knownFacts,
    missingInformation,
    assumptions: [],
    nextQuestion: missingInformation[0],
    steps: [
      { id: "understand", title: "Structure the request", purpose: "Separate stated facts, unknowns, and desired outcomes.", status: "complete", requiresHumanConfirmation: false },
      { id: "confirm", title: "Confirm operating context", purpose: "Collect the minimum missing information without guessing.", status: "ready", requiresHumanConfirmation: true },
      { id: "research", title: "Collect evidence", purpose: "Use approved sources and record provenance and limitations.", status: "blocked", requiresHumanConfirmation: true },
      { id: "design", title: "Build the operating blueprint", purpose: "Create requirements, process map, options, and dependencies.", status: "blocked", requiresHumanConfirmation: false },
      { id: "verify", title: "Verify the proposed result", purpose: "Check every claimed action and artifact before reporting completion.", status: "blocked", requiresHumanConfirmation: true },
    ],
    artifacts: [
      { id: `${id}-process`, type: "process_map", title: "Draft operating process", status: "draft", items: processItems },
      { id: `${id}-requirements`, type: "requirements", title: "Initial requirements", status: "draft", items: missingInformation },
    ],
    createdAt: now,
    updatedAt: now,
  };
  writeRuns([run, ...readRuns().filter((item) => item.id !== run.id)]);
  return run;
}

export function getAgentRun(id: string): AgentRun | null {
  return readRuns().find((run) => run.id === id) ?? null;
}

/**
 * Record one human answer against the currently visible missing item.
 * The answer is preserved verbatim; CBAI does not infer additional fields from it.
 */
export function answerAgentRunNextQuestion(id: string, answer: string): AgentRun | null {
  const trimmed = answer.trim();
  if (!trimmed) return getAgentRun(id);
  const runs = readRuns();
  const current = runs.find((run) => run.id === id);
  if (!current) return null;
  const answeredQuestion = current.missingInformation[0];
  if (!answeredQuestion) return current;
  const remaining = current.missingInformation.slice(1);
  const updated: AgentRun = {
    ...current,
    knownFacts: unique([
      ...current.knownFacts,
      `User answer — ${answeredQuestion}: ${trimmed}`,
    ]),
    missingInformation: remaining,
    nextQuestion: remaining[0] ?? "Human confirmation",
    status: remaining.length === 0 ? "draft_ready" : "waiting_for_input",
    steps: current.steps.map((step) =>
      step.id === "confirm"
        ? { ...step, status: remaining.length === 0 ? "needs_confirmation" : "ready" }
        : step,
    ),
    artifacts: current.artifacts.map((artifact) =>
      artifact.type === "requirements"
        ? { ...artifact, items: remaining }
        : artifact,
    ),
    updatedAt: new Date().toISOString(),
  };
  writeRuns([updated, ...runs.filter((run) => run.id !== id)]);
  return updated;
}

export function appendNarrationToLatestAgentRun(items: readonly string[]): AgentRun | null {
  if (items.length === 0) return null;
  const runs = readRuns();
  const latest = runs[0];
  if (!latest) return null;
  const narration: AgentRunArtifact = {
    id: `${latest.id}-narration`,
    type: "research_brief",
    title: "Live operator narration",
    status: "draft",
    items: [...items],
  };
  const updated: AgentRun = {
    ...latest,
    artifacts: [...latest.artifacts.filter((artifact) => artifact.id !== narration.id), narration],
    updatedAt: new Date().toISOString(),
  };
  writeRuns([updated, ...runs.slice(1)]);
  return updated;
}
