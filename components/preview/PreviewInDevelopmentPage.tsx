"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { Card, CardContent } from "@/components/ui/Card";

type PreviewVariant = "agents" | "workflows" | "core";

type PreviewInDevelopmentPageProps = {
  variant: PreviewVariant;
  children?: ReactNode;
};

export default function PreviewInDevelopmentPage({ variant, children }: PreviewInDevelopmentPageProps) {
  const { t } = useTranslation();

  const title =
    variant === "agents"
      ? t("previewPages.agentsTitle")
      : variant === "workflows"
        ? t("previewPages.workflowsTitle")
        : t("previewPages.coreTitle");

  const description =
    variant === "agents"
      ? t("previewPages.agentsDescription")
      : variant === "workflows"
        ? t("previewPages.workflowsDescription")
        : t("previewPages.coreDescription");

  return (
    <OperatingPageShell title={title} description={description}>
      <p className={cbaiSectionEyebrow}>{t("previewPages.inDevelopmentEyebrow")}</p>

      {variant === "workflows" ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-300">{t("previewPages.workflowsHeading")}</p>
            <p className="mt-1 max-w-sm text-xs text-zinc-500">{t("previewPages.workflowsBody")}</p>
          </CardContent>
        </Card>
      ) : null}

      {children}
    </OperatingPageShell>
  );
}
