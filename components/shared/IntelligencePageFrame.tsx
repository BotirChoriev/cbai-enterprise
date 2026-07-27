/**
 * Shared Intelligence OS page composition contract.
 * Extends OperatingPageShell without replacing route-specific bodies.
 */

import type { ReactNode } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import {
  cbaiFocusRing,
  cbaiMineralPanel,
  cbaiSectionEyebrow,
  cbaiStackMd,
  cbaiTextMuted,
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
  return (
    <OperatingPageShell title={title} description={purpose} action={headerAction} showOperator={showOperator}>
      <div className={`${cbaiMineralPanel} ${cbaiStackMd}`} data-cbai-page-contract="">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className={cbaiSectionEyebrow}>Intelligence OS</p>
            {contextLabel ? <p className="text-sm text-[var(--cbai-text-primary)]">{contextLabel}</p> : null}
            {nextStep ? (
              <p className={cbaiTextMuted}>
                <span className="font-medium text-[var(--cbai-text-secondary)]">Next: </span>
                {nextStep}
              </p>
            ) : null}
            {evidenceStatus ? (
              <p className={cbaiTextMuted} data-cbai-evidence-status="">
                {evidenceStatus}
              </p>
            ) : null}
            {knownUnknown ? <p className={cbaiTextMuted}>{knownUnknown}</p> : null}
            {confirmationBoundary ? (
              <p className="text-[11px] text-[var(--cbai-text-muted)]" data-cbai-human-boundary="">
                {confirmationBoundary}
              </p>
            ) : null}
          </div>
          {primaryAction ? (
            <div className={`shrink-0 ${cbaiFocusRing}`} data-cbai-primary-action="">
              {primaryAction}
            </div>
          ) : null}
        </div>
      </div>
      {children}
    </OperatingPageShell>
  );
}
