"use client";

import type { ReactNode } from "react";
import ContextualOperatorBanner from "@/components/assistant/ContextualOperatorBanner";
import EntityPageHeader from "@/components/shared/EntityPageHeader";

type OperatingPageShellProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  showOperator?: boolean;
  children: ReactNode;
};

/** One operating-system page frame: header → optional contextual Operator → content. */
export default function OperatingPageShell({
  title,
  description,
  action,
  showOperator = true,
  children,
}: OperatingPageShellProps) {
  return (
    <div className="space-y-6">
      <EntityPageHeader title={title} description={description ?? ""} />
      {action}
      {showOperator ? <ContextualOperatorBanner /> : null}
      {children}
    </div>
  );
}
