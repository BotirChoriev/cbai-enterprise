"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { EngineResult, ForwardDeployedEngineId } from "@/lib/forward-deployed-engines/engine-types";
import { resolveEngineContextFromRoute } from "@/lib/forward-deployed-engines/engine-context";
import { startEngineRun } from "@/lib/forward-deployed-engines/engine-runner";
import { dispatchEngineEvent, ENGINE_RUN_STARTED } from "@/lib/forward-deployed-engines/engine-events";
import { registerEngineStartListener } from "@/lib/forward-deployed-engines/engine-bridge";
import { normalizeLocale } from "@/lib/ontology/normalization";
import { useTranslation } from "@/lib/i18n/use-translation";
import { usePathname } from "next/navigation";
import EngineWorkspace from "./EngineWorkspace";

type EngineWorkspaceContextValue = {
  activeResult: EngineResult | null;
  startEngine: (engineId: ForwardDeployedEngineId, statement: string, overrides?: Record<string, string>) => EngineResult;
  clearEngine: () => void;
};

const EngineWorkspaceContext = createContext<EngineWorkspaceContextValue | null>(null);

export function EngineWorkspaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useTranslation();
  const locale = normalizeLocale(language);
  const [activeResult, setActiveResult] = useState<EngineResult | null>(null);

  const startEngine = useCallback(
    (engineId: ForwardDeployedEngineId, statement: string, overrides: Record<string, string> = {}) => {
      const context = resolveEngineContextFromRoute(pathname, locale, {
        entityId: overrides.entityId,
        entityName: overrides.entityName,
        countryCode: overrides.countryCode,
        topicId: overrides.topicId,
        projectId: overrides.projectId,
        missionId: overrides.missionId,
      });
      const result = startEngineRun({
        engineId,
        objective: { statement, locale, domain: overrides.domain },
        context,
      });
      setActiveResult(result);
      dispatchEngineEvent(ENGINE_RUN_STARTED, { runId: result.run.id, engineId });
      return result;
    },
    [pathname, locale],
  );

  const clearEngine = useCallback(() => setActiveResult(null), []);

  useEffect(() => {
    registerEngineStartListener((result) => setActiveResult(result));
    return () => registerEngineStartListener(null);
  }, []);

  const value = useMemo(
    () => ({ activeResult, startEngine, clearEngine }),
    [activeResult, startEngine, clearEngine],
  );

  return (
    <EngineWorkspaceContext.Provider value={value}>
      {children}
      {activeResult ? (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto border-t border-zinc-800 bg-[var(--cbai-workspace-solid)] p-4 shadow-2xl md:inset-x-auto md:right-4 md:bottom-4 md:w-[min(100%,42rem)] md:rounded-xl md:border">
          <EngineWorkspace result={activeResult} onUpdate={setActiveResult} />
        </div>
      ) : null}
    </EngineWorkspaceContext.Provider>
  );
}

export function useEngineWorkspace(): EngineWorkspaceContextValue {
  const ctx = useContext(EngineWorkspaceContext);
  if (!ctx) {
    throw new Error("useEngineWorkspace must be used within EngineWorkspaceProvider");
  }
  return ctx;
}

/** Compact entry panel for route integration — one primary action only. */
export function EngineEntryPanel({
  engineId,
  statement,
  labelKey,
}: {
  engineId: ForwardDeployedEngineId;
  statement: string;
  labelKey: string;
}) {
  const { t } = useTranslation();
  const { startEngine } = useEngineWorkspace();

  return (
    <button
      type="button"
      className="inline-flex min-h-10 items-center rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 text-sm text-zinc-200 transition-colors hover:border-teal-500/40"
      onClick={() => startEngine(engineId, statement)}
    >
      {t(labelKey)} →
    </button>
  );
}
