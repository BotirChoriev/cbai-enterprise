import type { ProfessionTemplateId } from "@/lib/personal-workspace/profession-engine";

export type PersonalTask = {
  readonly id: string;
  readonly label: string;
  readonly completed: boolean;
};

export type PersonalWorkspace = {
  readonly version: 1;
  readonly professionStatement: string;
  readonly templateId: ProfessionTemplateId;
  readonly goal: string;
  readonly createdAt: string;
  readonly tasks: readonly PersonalTask[];
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
    const value = JSON.parse(raw) as Partial<PersonalWorkspace>;
    if (
      value.version !== 1 ||
      typeof value.professionStatement !== "string" ||
      typeof value.templateId !== "string" ||
      typeof value.goal !== "string" ||
      !Array.isArray(value.tasks)
    ) {
      return null;
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
  savePersonalWorkspace({
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
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
