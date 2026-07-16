"use client";

import type { ReactNode } from "react";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EntityPageHeader from "@/components/shared/EntityPageHeader";

type OperatingPageShellProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  showOperator?: boolean;
  showMissionContext?: boolean;
  missionContextVariant?: "compact" | "full";
  children: ReactNode;
};

/** Intelligence space content frame — global mission bar and context rail live in dashboard layout. */
export default function OperatingPageShell({
  title,
  description,
  action,
  showOperator = true,
  children,
}: OperatingPageShellProps) {
  return (
    <div className="space-y-4">
      <EntityPageHeader title={title} description={description ?? ""} />
      {action}
      {showOperator ? <ContextualOperatorBanner /> : null}
      {children}
    </div>
  );
}
