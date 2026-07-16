"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CBAIMark } from "@/components/brand/CBAILogo";
import { loadProjects } from "@/lib/project/project-store";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

function resolveContinueProjectHref(): string | null {
  const projects = loadProjects();
  return projects[0] ? `/my-work?project=${projects[0].id}` : null;
}

type SystemPageShellProps = {
  variant: "notFound" | "error" | "researchTopicNotFound";
  onRetry?: () => void;
};

export default function SystemPageShell({ variant, onRetry }: SystemPageShellProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [continueProjectHref] = useState<string | null>(() => resolveContinueProjectHref());

  const eyebrow =
    variant === "notFound"
      ? t("errorsPages.notFoundEyebrow")
      : variant === "researchTopicNotFound"
        ? t("errorsPages.researchNotFoundEyebrow")
        : t("errorsPages.errorEyebrow");
  const title =
    variant === "notFound"
      ? t("errorsPages.notFoundTitle")
      : variant === "researchTopicNotFound"
        ? t("errorsPages.researchNotFoundTitle")
        : t("errorsPages.errorTitle");
  const message =
    variant === "notFound"
      ? t("errorsPages.notFoundMessage")
      : variant === "researchTopicNotFound"
        ? t("errorsPages.researchNotFoundMessage")
        : t("errorsPages.errorMessage");

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
            {t("system.returnHome")}
          </Link>
          <button type="button" onClick={() => router.back()} className={cbaiBtnSecondary}>
            {t("system.goBack")}
          </button>
          <Link href="/search" className={cbaiBtnSecondary}>
            {t("system.search")}
          </Link>
          {continueProjectHref ? (
            <Link href={continueProjectHref} className={cbaiBtnSecondary}>
              {t("system.continueProject")}
            </Link>
          ) : null}
          {onRetry ? (
            <button type="button" onClick={onRetry} className={cbaiBtnSecondary}>
              {t("system.tryAgain")}
            </button>
          ) : null}
          <Link href="/trust" className={cbaiBtnSecondary}>
            {t("system.feedback")}
          </Link>
        </div>
      </div>
    </div>
  );
}
