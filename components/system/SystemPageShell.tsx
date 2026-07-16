"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CBAIMark } from "@/components/brand/CBAILogo";
import { loadProjects } from "@/lib/project/project-store";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard } from "@/components/brand/brand-classes";
import { SYSTEM_EN } from "@/lib/i18n/platform-copy-en";

function resolveContinueProjectHref(): string | null {
  const projects = loadProjects();
  return projects[0] ? `/my-work?project=${projects[0].id}` : null;
}

type SystemPageShellProps = {
  eyebrow: string;
  title: string;
  message: string;
  onRetry?: () => void;
};

/**
 * System-level pages (404, errors) render outside the dashboard AssistantProfileProvider.
 * Action labels use English defaults here; the dashboard shell handles i18n everywhere else.
 */
export default function SystemPageShell({ eyebrow, title, message, onRetry }: SystemPageShellProps) {
  const router = useRouter();
  const [continueProjectHref] = useState<string | null>(() => resolveContinueProjectHref());
  const labels = SYSTEM_EN;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 py-16 text-center">
      <Link href="/" className="mb-8 inline-flex items-center gap-2.5" aria-label="CBAI Home">
        <CBAIMark size={40} />
      </Link>

      <div className={`${cbaiGlassCard} w-full max-w-lg space-y-4 p-8`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">{eyebrow}</p>
        <h1 className="cbai-display text-xl text-zinc-100">{title}</h1>
        <p className="text-sm leading-relaxed text-zinc-400">{message}</p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Link href="/" className={cbaiBtnPrimary}>
            {labels.returnHome}
          </Link>
          <button type="button" onClick={() => router.back()} className={cbaiBtnSecondary}>
            {labels.goBack}
          </button>
          <Link href="/search" className={cbaiBtnSecondary}>
            {labels.search}
          </Link>
          {continueProjectHref ? (
            <Link href={continueProjectHref} className={cbaiBtnSecondary}>
              {labels.continueProject}
            </Link>
          ) : null}
          {onRetry ? (
            <button type="button" onClick={onRetry} className={cbaiBtnSecondary}>
              {labels.tryAgain}
            </button>
          ) : null}
          <Link href="/trust" className={cbaiBtnSecondary}>
            {labels.feedback}
          </Link>
        </div>
      </div>
    </div>
  );
}
