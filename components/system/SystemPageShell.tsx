"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CBAIMark } from "@/components/brand/CBAILogo";
import { loadProjects } from "@/lib/project/project-store";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard } from "@/components/brand/brand-classes";

/** Honestly empty during SSR/static export (no window) — the same safe pattern every other
 * localStorage-backed read in this app already uses (see lib/project/project-store.ts). */
function resolveContinueProjectHref(): string | null {
  const projects = loadProjects();
  return projects[0] ? `/my-work?project=${projects[0].id}` : null;
}

type SystemPageShellProps = {
  eyebrow: string;
  title: string;
  message: string;
  /** Present only on real error boundaries (error.tsx), never on a plain not-found page. */
  onRetry?: () => void;
};

/**
 * The one shared shell for every system-level page (404, runtime error, and any future
 * recoverable-failure state) — real CBAI branding and a real way back, so a broken or unmatched
 * URL never strands a user on a blank, unbranded page. Self-contained (no dependency on the
 * dashboard shell's providers) since app/not-found.tsx renders outside that layout tree.
 */
export default function SystemPageShell({ eyebrow, title, message, onRetry }: SystemPageShellProps) {
  const router = useRouter();
  const [continueProjectHref] = useState<string | null>(() => resolveContinueProjectHref());

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050810] px-6 py-16 text-center">
      <Link href="/" className="mb-8 inline-flex items-center gap-2.5" aria-label="CBAI Home">
        <CBAIMark size={40} />
      </Link>

      <div className={`${cbaiGlassCard} w-full max-w-lg space-y-4 p-8`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/90">{eyebrow}</p>
        <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
        <p className="text-sm leading-relaxed text-zinc-400">{message}</p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Link href="/" className={cbaiBtnPrimary}>
            Return Home
          </Link>
          <button type="button" onClick={() => router.back()} className={cbaiBtnSecondary}>
            Go Back
          </button>
          <Link href="/search" className={cbaiBtnSecondary}>
            Search
          </Link>
          {continueProjectHref ? (
            <Link href={continueProjectHref} className={cbaiBtnSecondary}>
              Continue Project
            </Link>
          ) : null}
          {onRetry ? (
            <button type="button" onClick={onRetry} className={cbaiBtnSecondary}>
              Try Again
            </button>
          ) : null}
          <Link href="/trust" className={cbaiBtnSecondary}>
            Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}
