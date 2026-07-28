import type { ProfessionTemplateId } from "@/lib/personal-workspace/profession-engine";

export type PersonalTask = {
  readonly id: string;
  readonly label: string;
  readonly completed: boolean;
};

export type CyberneticStage =
  | "sense"
  | "structure"
  | "compare"
  | "decide"
  | "act"
  | "verify"
  | "learn";

export type PersonalMaterial = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly size: number;
  readonly addedAt: string;
  readonly status: "human_confirmed";
};

export type PersonalDecision = {
  readonly id: string;
  readonly title: string;
  readonly status: "pending" | "confirmed";
  readonly createdAt: string;
};

export type PersonalWorkspace = {
  readonly version: 2;
  readonly professionStatement: string;
  readonly templateId: ProfessionTemplateId;
  readonly goal: string;
  readonly createdAt: string;
  readonly tasks: readonly PersonalTask[];
  readonly selectedModuleIds: readonly string[];
  readonly materials: readonly PersonalMaterial[];
  readonly currentStage: CyberneticStage;
  readonly decisions: readonly PersonalDecision[];
  readonly learningNote: string | null;
};

const STORAGE_KEY = "cbai:personal-workspace:v1";
const CHANGE_EVENT = "cbai:personal-workspace:changed";
let cachedRaw: string | null | undefined;
let cachedValue: PersonalWorkspace | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parse(raw: string | null): PersonalWorkspace | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Omit<PersonalWorkspace, "version">> & {
      readonly version?: number;
    };
    if (
      (value.version !== 1 && value.version !== 2) ||
      typeof value.professionStatement !== "string" ||
      typeof value.templateId !== "string" ||
      typeof value.goal !== "string" ||
      !Array.isArray(value.tasks)
    ) {
      return null;
    }
    if (value.version === 1) {
      return {
        ...(value as Omit<PersonalWorkspace, "version" | "selectedModuleIds" | "materials" | "currentStage" | "decisions" | "learningNote">),
        version: 2,
        selectedModuleIds: [],
        materials: [],
        currentStage: "act",
        decisions: [],
        learningNote: null,
      };
    }
    return value as PersonalWorkspace;
  } catch {
    return null;
  }
}

export function getPersonalWorkspaceSnapshot(): PersonalWorkspace | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
}

export function getPersonalWorkspaceServerSnapshot(): PersonalWorkspace | null {
  return null;
}

export function subscribePersonalWorkspace(onStoreChange: () => void): () => void {
  if (!isBrowser()) return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function savePersonalWorkspace(workspace: PersonalWorkspace): void {
  if (!isBrowser()) return;
  const raw = JSON.stringify(workspace);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedValue = workspace;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function togglePersonalTask(taskId: string): void {
  const current = getPersonalWorkspaceSnapshot();
  if (!current) return;
  const tasks = current.tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  );
  const allComplete = tasks.length > 0 && tasks.every((task) => task.completed);
  const verifyDecisionExists = current.decisions.some((decision) => decision.id === "verify-outcome");
  savePersonalWorkspace({
    ...current,
    tasks,
    currentStage: allComplete ? "verify" : "act",
    decisions:
      allComplete && !verifyDecisionExists
        ? [
            ...current.decisions,
            {
              id: "verify-outcome",
              title: "Verify the result before learning from it",
              status: "pending",
              createdAt: new Date().toISOString(),
            },
          ]
        : current.decisions,
  });
}

export function addPersonalMaterials(
  materials: readonly Omit<PersonalMaterial, "status" | "addedAt">[],
): void {
  const current = getPersonalWorkspaceSnapshot();
  if (!current || materials.length === 0) return;
  savePersonalWorkspace({
    ...current,
    materials: [
      ...current.materials,
      ...materials.map((material) => ({
        ...material,
        status: "human_confirmed" as const,
        addedAt: new Date().toISOString(),
      })),
    ],
  });
}

export function confirmPersonalOutcome(learningNote: string): void {
  const current = getPersonalWorkspaceSnapshot();
  if (!current || current.currentStage !== "verify") return;
  savePersonalWorkspace({
    ...current,
    currentStage: "learn",
    learningNote: learningNote.trim() || null,
    decisions: current.decisions.map((decision) =>
      decision.id === "verify-outcome" ? { ...decision, status: "confirmed" } : decision,
    ),
  });
}

export function clearPersonalWorkspace(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedValue = null;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
