/**
 * Shared Intelligence OS page composition contract.
 * Extends OperatingPageShell without replacing route-specific bodies.
 */

"use client";

import type { ReactNode } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import IntelligenceStatusRail from "@/components/shared/IntelligenceStatusRail";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

export type IntelligencePageFrameProps = {
  readonly title: string;
  readonly purpose: string;
  readonly contextLabel?: string | null;
  readonly primaryAction?: ReactNode;
  readonly nextStep?: string | null;
  readonly evidenceStatus?: string | null;
  readonly knownUnknown?: string | null;
  readonly confirmationBoundary?: string | null;
  readonly showOperator?: boolean;
  readonly headerAction?: ReactNode;
  readonly children: ReactNode;
};

export default function IntelligencePageFrame({
  title,
  purpose,
  contextLabel,
  primaryAction,
  nextStep,
  evidenceStatus,
  knownUnknown,
  confirmationBoundary,
  showOperator = false,
  headerAction,
  children,
}: IntelligencePageFrameProps) {
  const { language } = useTranslation();

  return (
    <OperatingPageShell title={title} description={purpose} action={headerAction} showOperator={showOperator}>
      <div className={`${cbaiMineralPanel} space-y-4`} data-cbai-page-contract="">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className={cbaiSectionEyebrow}>Intelligence OS</p>
            {nextStep ? (
              <p className="text-xs text-[var(--cbai-text-secondary)]">
                <span className="font-medium text-[var(--cbai-text-secondary)]">
                  {language === "uz" ? "Keyingi: " : "Next: "}
                </span>
                {nextStep}
              </p>
            ) : null}
          </div>
          {primaryAction ? (
            <div className={`shrink-0 ${cbaiFocusRing}`} data-cbai-primary-action="">
              {primaryAction}
            </div>
          ) : null}
        </div>
        <IntelligenceStatusRail
          context={contextLabel}
          evidence={evidenceStatus}
          unknown={knownUnknown}
          humanBoundary={confirmationBoundary}
          compact
        />
      </div>
      {children}
    </OperatingPageShell>
  );
}
