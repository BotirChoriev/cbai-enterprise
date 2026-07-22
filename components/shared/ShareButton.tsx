"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";

type ShareButtonProps = {
  label?: string;
  className?: string;
};

export default function ShareButton({ label, className = "" }: ShareButtonProps) {
  const { t } = useTranslation();
  const shareLabel = label ?? t("entities.share");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleShare() {
    const url = window.location.href;
    const title = document.title;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2500);
    }
  }

  const buttonLabel =
    status === "copied" ? t("entities.linkCopied") : status === "error" ? t("entities.linkCopyFailed") : shareLabel;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleShare}
        aria-label={status === "copied" ? t("entities.linkCopied") : shareLabel}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${className}`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
        {buttonLabel}
      </button>
    </span>
  );
}
