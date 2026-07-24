"use client";

import type { ReactNode } from "react";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EntityPageHeader from "@/components/shared/EntityPageHeader";
import { cbaiPageWorkspace, cbaiStackLg } from "@/components/brand/brand-classes";

type OperatingPageShellProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  showOperator?: boolean;
  /** @deprecated Mission continuity uses LivingContextRibbon in dashboard layout only. */
  showMissionContext?: boolean;
  /** @deprecated */
  missionContextVariant?: "compact" | "full";
  children: ReactNode;
};

/** Page frame — mission continuity is handled by layout LivingContextRibbon (DD-003). */
export default function OperatingPageShell({
  title,
  description,
  action,
  showOperator = false,
  children,
}: OperatingPageShellProps) {
  return (
    <div className={`${cbaiPageWorkspace} ${cbaiStackLg}`}>
      <EntityPageHeader title={title} description={description} action={action} />
      {showOperator ? <ContextualOperatorBanner /> : null}
      {children}
    </div>
  );
}
