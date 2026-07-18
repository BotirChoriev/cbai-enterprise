/**
 * Device-local Genesis persistence — same pattern as project-store / organization-audit.
 * No fake cloud sync; honest SSR empty reads outside browser.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";

export function isGenesisBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readGenesisList<T>(
  key: string,
  isValid: (value: unknown) => value is T,
  memory: T[],
): T[] {
  if (!isGenesisBrowser()) return [...memory];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(key));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    return [];
  }
}

export function writeGenesisList<T>(key: string, items: readonly T[], memory: T[]): void {
  if (!isGenesisBrowser()) {
    memory.length = 0;
    memory.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(items));
}

export function genesisId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function notifyGenesisChanged(): void {
  notifyMissionDataChanged("project");
}
