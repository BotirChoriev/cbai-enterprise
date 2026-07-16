"use client";

import { useState } from "react";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import type { ContextEntityRef } from "@/lib/context";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { useTranslation } from "@/lib/i18n/use-translation";

type SaveToWorkspaceButtonProps = {
  entity: ContextEntityRef;
  className?: string;
};

export default function SaveToWorkspaceButton({ entity, className = "" }: SaveToWorkspaceButtonProps) {
  const { t } = useTranslation();
  const { isEntityPinned, pinEntityToWorkspace, unpinEntityFromWorkspace } = usePlatformContext();
  const pinned = isEntityPinned(entity.kind, entity.id);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => {
          if (pinned) {
            unpinEntityFromWorkspace(entity.kind, entity.id);
            setStatus(t("activation.bookmarkRemoved"));
          } else {
            pinEntityToWorkspace(entity);
            setStatus(t("activation.bookmarkSaved"));
          }
        }}
        aria-pressed={pinned}
        aria-label={pinned ? t("activation.savedBookmark") : t("activation.saveBookmark")}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
          pinned
            ? "border-teal-500/40 bg-teal-500/10 text-teal-300 hover:border-teal-500/60"
            : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill={pinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
          />
        </svg>
        {pinned ? t("activation.savedBookmark") : t("activation.saveBookmark")}
      </button>
      {status ? <ActivationStatusLine message={status} compact /> : null}
    </div>
  );
}
