"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
        <EngineWorkspaceSheet result={activeResult} onUpdate={setActiveResult} onClose={clearEngine} />
      ) : null}
    </EngineWorkspaceContext.Provider>
  );
}

/**
 * Escapable operational-workspace sheet (P0-C):
 * visible localized Back and Close (X), Escape-key close, focus trap while
 * open, and focus restoration to the opener when closed. The header stays
 * sticky so the exit is always visible while scrolling.
 */
function EngineWorkspaceSheet({
  result,
  onUpdate,
  onClose,
}: {
  result: EngineResult;
  onUpdate: (result: EngineResult) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sheet = sheetRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () =>
      sheet?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ) ?? [];

    focusable()[0]?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusable();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="engine-workspace-title"
      className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto border-t border-zinc-800 bg-[var(--cbai-workspace-solid)] shadow-2xl md:inset-x-auto md:right-4 md:bottom-4 md:w-[min(100%,42rem)] md:rounded-xl md:border"
    >
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-[var(--cbai-workspace-solid)] px-4 py-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 transition-colors hover:border-teal-500/40"
          >
            <span aria-hidden="true">←</span>{" "}
            {pathname.includes("/evidence") || pathname.includes("/knowledge")
              ? t("forwardDeployed.backToEvidence")
              : t("forwardDeployed.backToPage")}
          </button>
          <p id="engine-workspace-title" className="truncate text-sm font-medium text-zinc-200">
            {t("forwardDeployed.workspaceTitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("forwardDeployed.closeWorkspaceAria")}
          className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 transition-colors hover:border-teal-500/40"
        >
          <span aria-hidden="true">✕</span> {t("forwardDeployed.closeWorkspace")}
        </button>
      </div>
      <div className="p-4">
        <EngineWorkspace result={result} onUpdate={onUpdate} />
      </div>
    </div>
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
