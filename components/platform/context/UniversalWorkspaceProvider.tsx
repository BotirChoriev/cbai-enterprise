"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import {
  deriveFocusedObjectFromRoute,
  deriveUniversalWorkspace,
  loadPersistedUniversalWorkspace,
  type UniversalWorkspaceState,
} from "@/lib/intelligence-os/universal-workspace";
import type { UniversalObjectRef } from "@/lib/intelligence-os/universal-object";

type UniversalWorkspaceContextValue = {
  readonly workspace: UniversalWorkspaceState;
  readonly focusedObject: UniversalObjectRef | null;
  setFocusedObject: (ref: UniversalObjectRef | null) => void;
};

const UniversalWorkspaceContext = createContext<UniversalWorkspaceContextValue | null>(null);

export function UniversalWorkspaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mission } = useMissionContext();
  const hydrated = useHydrated();
  const [manualFocus, setManualFocus] = useState<UniversalObjectRef | null>(null);

  const routeFocus = useMemo(
    () => deriveFocusedObjectFromRoute(pathname, searchParams),
    [pathname, searchParams],
  );

  const persistedFocus = useMemo(() => {
    if (!hydrated) return null;
    const persisted = loadPersistedUniversalWorkspace();
    if (!persisted?.activeObject) return null;
    if (persisted.activeMissionId !== (mission?.id ?? null)) return null;
    return persisted.activeObject;
  }, [hydrated, mission?.id]);

  const manualEffective = manualFocus ?? persistedFocus;

  const workspace = useMemo(
    () => deriveUniversalWorkspace(pathname, searchParams, mission, routeFocus ? null : manualEffective),
    [pathname, searchParams, mission, routeFocus, manualEffective],
  );

  const setFocusedObject = useCallback((ref: UniversalObjectRef | null) => {
    setManualFocus(ref);
  }, []);

  const value = useMemo(
    () => ({
      workspace,
      focusedObject: workspace.activeObject,
      setFocusedObject,
    }),
    [workspace, setFocusedObject],
  );

  return (
    <UniversalWorkspaceContext.Provider value={value}>{children}</UniversalWorkspaceContext.Provider>
  );
}

export function useUniversalWorkspace(): UniversalWorkspaceContextValue {
  const ctx = useContext(UniversalWorkspaceContext);
  if (!ctx) {
    throw new Error("useUniversalWorkspace must be used within UniversalWorkspaceProvider");
  }
  return ctx;
}
