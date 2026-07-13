"use client";

import { useState } from "react";

type ShareButtonProps = {
  /** Real, honest label so screen readers/tooltips never claim a generic "share" that could imply
   * a social network post or email send this app doesn't actually do. */
  label?: string;
  className?: string;
};

/**
 * Real Share action (Platform Activation mission, Mission 4 — every entity must support "Share").
 * Uses the browser's real native Web Share API (`navigator.share`) when available — the OS's own
 * share sheet, genuinely sharing the current real URL, not a fabricated social feature. Falls back
 * to copying the current URL to the clipboard, with a real, visible "Copied" confirmation — never
 * a silent no-op and never a fake "Shared!" claim before the OS/clipboard actually confirms.
 */
export default function ShareButton({ label = "Share", className = "" }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleShare() {
    const url = window.location.href;
    const title = document.title;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled the native share sheet, or it genuinely failed — fall through to copy,
        // never silently claim success.
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

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleShare}
        aria-label={status === "copied" ? "Link copied to clipboard" : label}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${className}`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
        {status === "copied" ? "Link copied" : status === "error" ? "Could not copy link" : label}
      </button>
    </span>
  );
}
