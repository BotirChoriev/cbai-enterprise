/**
 * Device-local persistence for the selected user mode.
 * Preference only — never used as an authorization decision.
 */

import {
  DEFAULT_USER_MODE_ID,
  getUserModeCatalogEntry,
  isUserModeId,
} from "@/lib/user-modes/catalog";
import type { SelectedUserModeState, UserModeId } from "@/lib/user-modes/types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const USER_MODE_KEY = "cbai-user-mode";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readState(): SelectedUserModeState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(USER_MODE_KEY));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<SelectedUserModeState>;
    if (!isUserModeId(candidate.modeId) || typeof candidate.updatedAt !== "string") {
      return null;
    }
    return { modeId: candidate.modeId, updatedAt: candidate.updatedAt };
  } catch {
    return null;
  }
}

function writeState(state: SelectedUserModeState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(USER_MODE_KEY), JSON.stringify(state));
}

export function loadSelectedUserModeId(): UserModeId {
  return readState()?.modeId ?? DEFAULT_USER_MODE_ID;
}

export function loadSelectedUserModeState(): SelectedUserModeState {
  return (
    readState() ?? {
      modeId: DEFAULT_USER_MODE_ID,
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export function setSelectedUserMode(modeId: UserModeId): SelectedUserModeState {
  const state: SelectedUserModeState = {
    modeId: isUserModeId(modeId) ? modeId : DEFAULT_USER_MODE_ID,
    updatedAt: new Date().toISOString(),
  };
  writeState(state);
  return state;
}

export function clearSelectedUserMode(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(USER_MODE_KEY));
}

/** Honest empty/planned helper — mode catalog entry for current selection. */
export function loadSelectedUserModeCatalogEntry() {
  return getUserModeCatalogEntry(loadSelectedUserModeId());
}

export const USER_MODE_STORAGE_KEY = USER_MODE_KEY;
