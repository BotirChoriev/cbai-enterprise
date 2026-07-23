"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  USER_MODE_CATALOG,
  loadSelectedUserModeId,
  setSelectedUserMode,
  type UserModeId,
} from "@/lib/user-modes";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import {
  cbaiMineralSurface,
  cbaiSectionEyebrow,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

type ModeAwareWorkspaceProps = {
  readonly variant?: "full" | "compact";
};

/**
 * Personal user-mode selector. Preference only — does not replace org RBAC.
 */
export default function ModeAwareWorkspace({ variant = "full" }: ModeAwareWorkspaceProps) {
  const hydrated = useHydrated();
  const [modeId, setModeId] = useState<UserModeId>("general");

  useEffect(() => {
    if (!hydrated) return;
    setModeId(loadSelectedUserModeId());
  }, [hydrated]);

  const selected = USER_MODE_CATALOG.find((entry) => entry.id === modeId) ?? USER_MODE_CATALOG[0];

  function onSelect(next: UserModeId) {
    const state = setSelectedUserMode(next);
    setModeId(state.modeId);
  }

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-4`} aria-labelledby="user-mode-heading">
      <div className="space-y-1">
        <p className={cbaiSectionEyebrow} id="user-mode-heading">
          User mode
        </p>
        <p className={cbaiTextMuted}>
          Personal preference for default surfaces and assistant hints. This does not replace organization RBAC, membership roles, or account permissions.
        </p>
      </div>

      {!hydrated ? (
        <p className={cbaiTextMuted}>Loading saved mode from this browser…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {USER_MODE_CATALOG.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={modeId === entry.id}
                onClick={() => onSelect(entry.id)}
                className={`rounded-md border px-3 py-1.5 text-xs ${
                  modeId === entry.id
                    ? "border-teal-500/50 bg-teal-500/10 text-teal-300"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 border-t border-zinc-800/80 pt-3">
            <p className={cbaiTextBody}>{selected.description}</p>
            <p className={cbaiTextMuted}>
              Suggested start:{" "}
              <Link href={selected.defaultDashboardHref} className="text-teal-400 hover:text-teal-300">
                {selected.defaultDashboardHref}
              </Link>
            </p>
            {variant === "full" ? (
              <ul className="list-inside list-disc text-xs text-zinc-500">
                {selected.suggestedModules.map((moduleName) => (
                  <li key={moduleName}>{moduleName}</li>
                ))}
              </ul>
            ) : null}
            <p className="text-[10px] text-zinc-600">
              Device-local only. No live org role sync. Empty until you choose a mode.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
